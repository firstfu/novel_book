#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
crawl4AI - 專為angelibrary.com設計的爬蟲
"""

import os
import sys
import json
import logging


# 設定日誌
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('crawl4ai')

# 目標URL
TARGET_URL = "https://angelibrary.com/fictions/yuan_zhen_xia/map.html"
