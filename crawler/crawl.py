#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import json
import re
import requests
from bs4 import BeautifulSoup
import logging
from urllib.parse import urljoin, urlparse
import argparse

# 設定日誌
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('novel_crawler')

class NovelCrawler:
    def __init__(self, base_url, output_dir='output'):
        self.base_url = base_url
        self.output_dir = output_dir
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }

        # 確保輸出目錄存在
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

    def fetch_page(self, url):
        """獲取網頁內容"""
        try:
            response = requests.get(url, headers=self.headers)
            response.encoding = 'utf-8'  # 確保正確處理中文編碼
            if response.status_code == 200:
                return response.text
            else:
                logger.error(f"無法獲取頁面, 狀態碼: {response.status_code}, URL: {url}")
                return None
        except Exception as e:
            logger.error(f"獲取頁面時發生錯誤: {e}, URL: {url}")
            return None

    def parse_map_page(self, html_content):
        """解析目錄頁面，獲取所有章節鏈接"""
        soup = BeautifulSoup(html_content, 'html.parser')
        chapters = []

        # 尋找目錄表格
        tables = soup.find_all('table')
        for table in tables:
            links = table.find_all('a')
            for link in links:
                href = link.get('href', '')
                title = link.text.strip()

                # 只處理有目標錨點的連結
                if href and title and "#path" in href:
                    match = re.search(r'#(path\d+)', href)
                    if match:
                        chapter_id = match.group(1)
                        chapter_num = chapter_id.replace('path', '')

                        # 清理章節標題中的亂碼
                        title = self.clean_text(title)

                        chapters.append({
                            'id': chapter_id,
                            'number': chapter_num,
                            'title': title,
                            'url': urljoin(self.base_url, f"#{chapter_id}")
                        })

        return chapters

    def clean_text(self, text):
        """清理文本中的亂碼和多餘空白"""
        if not text:
            return ""

        # 移除亂碼字符
        text = re.sub(r'[\x00-\x1F\x7F-\x9F]', '', text)
        text = re.sub(r'', '', text)

        # 清理多餘空白
        text = re.sub(r'\s+', ' ', text).strip()

        return text

    def extract_all_content(self, html_content):
        """提取整個頁面的小說內容"""
        soup = BeautifulSoup(html_content, 'html.parser')

        # 找出主要內容區域
        content_area = None

        # 在angelibrary網站中，小說內容通常是在某個大區塊中
        # 嘗試找到包含多個<pre>標籤的區域
        pre_tags = soup.find_all('pre')
        if pre_tags:
            content_area = pre_tags[0].parent

        if not content_area:
            # 嘗試使用其他方式定位內容區域
            body = soup.find('body')
            if body:
                # 找出最大的文本區塊
                max_text_len = 0
                for tag in body.find_all(['div', 'table', 'td']):
                    text_len = len(tag.get_text())
                    if text_len > max_text_len:
                        max_text_len = text_len
                        content_area = tag

        if not content_area:
            logger.error("無法找到內容區域")
            return ""

        # 提取所有文本內容
        full_text = content_area.get_text()

        # 清理文本
        full_text = self.clean_text(full_text)

        return full_text

    def split_content_by_chapters(self, full_content, chapters):
        """將完整內容按章節分割"""
        chapter_contents = {}

        if not chapters or not full_content:
            return chapter_contents

        # 排序章節，確保按照順序處理
        sorted_chapters = sorted(chapters, key=lambda x: int(x['number']) if x['number'].isdigit() else 0)

        # 嘗試找到每個章節的開始標記
        for i, chapter in enumerate(sorted_chapters):
            chapter_id = chapter['id']
            chapter_title = chapter['title']

            # 嘗試不同的章節開始標記方式
            start_markers = [
                f"第{chapter['number']}章",
                f"第{chapter['number']}回",
                f"{chapter_title}",
                f"第{chapter['number']}",
                f"{chapter['number']}、"
            ]

            # 查找章節開始位置
            start_pos = -1
            for marker in start_markers:
                pos = full_content.find(marker)
                if pos != -1:
                    start_pos = pos
                    break

            if start_pos == -1:
                logger.warning(f"無法找到章節開始位置: {chapter_title}")
                continue

            # 查找章節結束位置
            end_pos = len(full_content)
            if i < len(sorted_chapters) - 1:
                next_chapter = sorted_chapters[i + 1]

                # 嘗試不同的下一章開始標記
                next_markers = [
                    f"第{next_chapter['number']}章",
                    f"第{next_chapter['number']}回",
                    f"{next_chapter['title']}",
                    f"第{next_chapter['number']}",
                    f"{next_chapter['number']}、"
                ]

                for marker in next_markers:
                    pos = full_content.find(marker)
                    if pos != -1 and pos > start_pos:
                        end_pos = pos
                        break

            # 提取章節內容
            chapter_content = full_content[start_pos:end_pos].strip()

            # 儲存章節內容
            if chapter_content:
                chapter_contents[chapter_id] = chapter_content
                logger.info(f"成功提取章節內容: {chapter_title} (長度: {len(chapter_content)}字)")
            else:
                logger.warning(f"提取到的章節內容為空: {chapter_title}")

        return chapter_contents

    def extract_novel_info(self, html_content):
        """提取小說基本信息"""
        soup = BeautifulSoup(html_content, 'html.parser')

        # 預設標題和作者
        title = "玄震俠異錄"
        author = "未知"

        # 嘗試從頁面中提取更精確的標題
        title_elem = soup.find('title')
        if title_elem:
            title_text = title_elem.get_text().strip()
            if "玄震俠異錄" in title_text:
                title = title_text

        # 在整個頁面中尋找包含"作者"的文本
        author_pattern = re.compile(r'作者[:：]?\s*([^\s,，。]+)')

        # 直接從HTML中提取
        html_str = str(soup)
        author_match = author_pattern.search(html_str)
        if author_match:
            author = author_match.group(1)

        return {
            'title': self.clean_text(title),
            'author': self.clean_text(author)
        }

    def crawl(self):
        """執行爬蟲流程"""
        logger.info(f"開始抓取小說從 {self.base_url}")

        # 獲取頁面內容
        html_content = self.fetch_page(self.base_url)
        if not html_content:
            logger.error("無法獲取頁面內容，爬蟲終止")
            return False

        # 解析目錄獲取章節列表
        chapters = self.parse_map_page(html_content)
        if not chapters:
            logger.error("無法解析章節列表，爬蟲終止")
            return False

        logger.info(f"找到 {len(chapters)} 個章節")

        # 提取小說信息
        novel_info = self.extract_novel_info(html_content)
        logger.info(f"小說標題: {novel_info['title']}, 作者: {novel_info['author']}")

        # 提取完整內容
        full_content = self.extract_all_content(html_content)
        if not full_content:
            logger.error("無法提取頁面內容，爬蟲終止")
            return False

        logger.info(f"成功提取完整內容，長度: {len(full_content)}字")

        # 按章節分割內容
        chapter_contents = self.split_content_by_chapters(full_content, chapters)

        # 組裝小說數據
        novel_data = {
            'title': novel_info['title'],
            'author': novel_info['author'],
            'source_url': self.base_url,
            'total_chapters': len(chapters),
            'extracted_chapters': len(chapter_contents),
            'chapters': []
        }

        # 合併章節信息
        for chapter in chapters:
            chapter_id = chapter['id']
            if chapter_id in chapter_contents:
                novel_data['chapters'].append({
                    'id': chapter_id,
                    'number': chapter['number'],
                    'title': chapter['title'],
                    'content': chapter_contents[chapter_id]
                })
            else:
                logger.warning(f"無法獲取章節內容: {chapter['title']}")
                # 仍然添加章節信息，但內容為空
                novel_data['chapters'].append({
                    'id': chapter_id,
                    'number': chapter['number'],
                    'title': chapter['title'],
                    'content': ""
                })

        # 保存為JSON文件
        output_file = os.path.join(self.output_dir, 'novel_data.json')
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(novel_data, f, ensure_ascii=False, indent=2)

        logger.info(f"小說數據已保存到 {output_file}")
        return True

def main():
    parser = argparse.ArgumentParser(description='小說網站爬蟲工具')
    parser.add_argument('url', help='小說目錄頁URL')
    parser.add_argument('--output', '-o', default='output', help='輸出目錄路徑')
    args = parser.parse_args()

    crawler = NovelCrawler(args.url, args.output)
    crawler.crawl()

if __name__ == "__main__":
    main()