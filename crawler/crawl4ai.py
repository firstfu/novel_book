#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
crawl4AI - 專為angelibrary.com設計的爬蟲
使用LLM技術爬取小說內容
"""

import os
import sys
import json
import logging
import requests
import time
from datetime import datetime
from bs4 import BeautifulSoup
from pathlib import Path
import argparse
from typing import Dict, List, Any, Optional

# LLM 相關
import openai
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser


# 設定日誌
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('crawl4ai')

# 目標URL
TARGET_URL = "https://angelibrary.com/fictions/yuan_zhen_xia/map.html"
SAVE_PATH = Path("assets/data/novel.json")

# 設置 API 密鑰
def setup_api_key(api_key: Optional[str] = None) -> None:
    """
    設置 OpenAI API 密鑰

    Args:
        api_key: OpenAI API 密鑰，如果為 None，則從環境變量讀取
    """
    if api_key:
        os.environ["OPENAI_API_KEY"] = api_key
    elif "OPENAI_API_KEY" not in os.environ:
        raise ValueError("請提供 OpenAI API 密鑰")

# 初始化 LLM
def init_llm(model_name: str = "gpt-3.5-turbo") -> ChatOpenAI:
    """
    初始化 LLM

    Args:
        model_name: 模型名稱

    Returns:
        初始化好的 LLM 模型
    """
    return ChatOpenAI(model=model_name, temperature=0)

# 爬取頁面內容
def fetch_content(url: str) -> str:
    """
    爬取頁面內容

    Args:
        url: 頁面 URL

    Returns:
        頁面內容
    """
    try:
        response = requests.get(url)
        response.encoding = 'utf-8'  # 確保正確處理中文字符
        return response.text
    except Exception as e:
        logger.error(f"爬取頁面失敗: {e}")
        return ""

# 使用 LLM 解析小說信息
def parse_with_llm(content: str, model: ChatOpenAI) -> Dict[str, Any]:
    """
    使用 LLM 解析小說內容

    Args:
        content: 頁面內容
        model: LLM 模型

    Returns:
        解析後的小說信息
    """
    # 定義輸出解析器
    parser = JsonOutputParser()

    # 定義提示模板
    prompt = ChatPromptTemplate.from_template("""
    你是一個專門爬取和分析小說內容的AI助手。請從以下HTML內容中提取小說相關信息：

    1. 小說的標題
    2. 作者
    3. 章節目錄及其URL链接
    4. 小說簡介或描述（如果有）

    對於章節，請提取每個章節的標題和對應的連結地址（如果有）。
    請將結果以JSON格式返回，格式如下：

    ```json
    {
      "title": "小說標題",
      "author": "作者名稱",
      "description": "小說簡介",
      "chapters": [
        {
          "title": "章節標題",
          "url": "章節連結"
        }
      ]
    }
    ```

    如果某些信息無法提取，請設置為空字符串或空數組。

    HTML內容：
    {content}
    """)

    # 創建處理鏈
    chain = prompt | model | parser

    # 執行處理鏈
    try:
        result = chain.invoke({"content": content})
        return result
    except Exception as e:
        logger.error(f"LLM 解析失敗: {e}")
        return {
            "title": "",
            "author": "未知",
            "description": "解析失敗",
            "chapters": []
        }

# 爬取章節內容
def fetch_chapter_content(url: str, model: ChatOpenAI) -> Dict[str, str]:
    """
    爬取並解析章節內容

    Args:
        url: 章節URL
        model: LLM 模型

    Returns:
        章節內容字典，包含 title 和 content
    """
    content = fetch_content(url)
    if not content:
        return {"title": "", "content": ""}

    # 定義輸出解析器
    parser = JsonOutputParser()

    # 定義提示模板
    prompt = ChatPromptTemplate.from_template("""
    你是一個專門爬取和分析小說內容的AI助手。請從以下HTML內容中提取章節內容：

    1. 章節標題
    2. 章節正文內容（不包括導航、頁眉頁腳等非正文內容）

    請將結果以JSON格式返回，格式如下：

    ```json
    {
      "title": "章節標題",
      "content": "章節正文內容"
    }
    ```

    對於正文內容，請保留原始段落結構，去除HTML標籤及其他無關內容。

    HTML內容：
    {content}
    """)

    # 創建處理鏈
    chain = prompt | model | parser

    # 執行處理鏈
    try:
        result = chain.invoke({"content": content})
        return result
    except Exception as e:
        logger.error(f"章節內容解析失敗: {e}")
        return {
            "title": "",
            "content": "解析失敗"
        }

# 保存小說數據
def save_novel_data(novel_data: Dict[str, Any], path: Path) -> None:
    """
    保存小說數據到文件

    Args:
        novel_data: 小說數據
        path: 保存路徑
    """
    try:
        # 確保目錄存在
        path.parent.mkdir(parents=True, exist_ok=True)

        with open(path, 'w', encoding='utf-8') as f:
            json.dump(novel_data, f, ensure_ascii=False, indent=2)

        logger.info(f"小說數據已保存到 {path}")
    except Exception as e:
        logger.error(f"保存數據失敗: {e}")

# 主函數
def main(api_key: Optional[str] = None, model_name: str = "gpt-3.5-turbo", target_url: Optional[str] = None) -> None:
    """
    主函數

    Args:
        api_key: OpenAI API 密鑰
        model_name: LLM 模型名稱
        target_url: 目標 URL，如果為 None，則使用默認 URL
    """
    # 設置 API 密鑰
    setup_api_key(api_key)

    # 初始化 LLM
    model = init_llm(model_name)

    # 確定目標 URL
    url = target_url or TARGET_URL

    # 爬取頁面內容
    logger.info(f"爬取頁面: {url}")
    content = fetch_content(url)

    if not content:
        logger.error("頁面內容為空，爬取失敗")
        return

    # 解析小說信息
    logger.info("使用 LLM 解析小說信息")
    novel_info = parse_with_llm(content, model)

    # 準備完整的小說數據
    novel_data = {
        "title": novel_info.get("title", ""),
        "author": novel_info.get("author", "未知"),
        "cover": "",  # 可以擴展爬取封面
        "description": novel_info.get("description", "無描述"),
        "source": url,
        "scrapeDate": datetime.now().isoformat(),
        "chaptersCount": len(novel_info.get("chapters", [])),
        "chapters": []
    }

    # 保存初始數據
    save_novel_data(novel_data, SAVE_PATH)

    # 爬取章節內容
    chapters = novel_info.get("chapters", [])
    logger.info(f"開始爬取 {len(chapters)} 個章節")

    for i, chapter in enumerate(chapters):
        chapter_url = chapter.get("url", "")
        if not chapter_url:
            continue

        # 如果 URL 是相對路徑，轉換為絕對路徑
        if not chapter_url.startswith("http"):
            base_url = "/".join(url.split("/")[:-1])
            chapter_url = f"{base_url}/{chapter_url}"

        logger.info(f"爬取章節 {i+1}/{len(chapters)}: {chapter.get('title')}")

        # 爬取章節內容
        chapter_data = fetch_chapter_content(chapter_url, model)

        # 添加到小說數據
        novel_data["chapters"].append({
            "title": chapter_data.get("title") or chapter.get("title", ""),
            "content": chapter_data.get("content", "")
        })

        # 每爬取一個章節，更新一次保存
        novel_data["chaptersCount"] = len(novel_data["chapters"])
        save_novel_data(novel_data, SAVE_PATH)

        # 避免請求過於頻繁
        time.sleep(1)

    logger.info("爬取完成")

if __name__ == "__main__":
    # 解析命令行參數
    parser = argparse.ArgumentParser(description="crawl4AI - 使用LLM技術爬取小說內容")
    parser.add_argument("--api-key", help="OpenAI API 密鑰")
    parser.add_argument("--model", default="gpt-3.5-turbo", help="LLM 模型名稱")
    parser.add_argument("--url", help="目標 URL")

    args = parser.parse_args()

    main(api_key=args.api_key, model_name=args.model, target_url=args.url)
