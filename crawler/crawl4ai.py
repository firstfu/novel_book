#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
crawl4AI - 專為angelibrary.com設計的爬蟲
用於抓取《玄震俠異錄》小說內容
"""

import os
import sys
import json
import logging
from crawl import NovelCrawler

# 設定日誌
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('crawl4ai')

# 目標URL
TARGET_URL = "https://angelibrary.com/fictions/yuan_zhen_xia/map.html"

def main():
    """主函數"""
    logger.info("開始執行crawl4AI爬蟲")

    # 設定輸出目錄
    output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'output')
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # 創建爬蟲實例
    crawler = NovelCrawler(TARGET_URL, output_dir)

    # 執行爬蟲
    success = crawler.crawl()

    if success:
        # 讀取爬取結果
        output_file = os.path.join(output_dir, 'novel_data.json')
        if os.path.exists(output_file):
            with open(output_file, 'r', encoding='utf-8') as f:
                novel_data = json.load(f)

            logger.info(f"成功抓取 {TARGET_URL} 的小說資料")
            logger.info(f"小說標題: {novel_data.get('title', '未知')}")
            logger.info(f"作者: {novel_data.get('author', '未知')}")
            logger.info(f"共有章節數: {len(novel_data.get('chapters', []))}")

            # 輸出處理結果
            print(json.dumps({
                "status": "success",
                "message": f"成功抓取《{novel_data.get('title', '未知')}》小說內容",
                "data_path": output_file,
                "chapter_count": len(novel_data.get('chapters', [])),
                "source_url": TARGET_URL
            }, ensure_ascii=False, indent=2))

            return 0
        else:
            logger.error(f"找不到輸出文件: {output_file}")
            return 1
    else:
        logger.error("爬蟲執行失敗")
        return 1

if __name__ == "__main__":
    sys.exit(main())