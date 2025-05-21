# Novel Crawler for crawl4AI

這是一個專門用於抓取網路小說的爬蟲工具，可以將網頁內容轉換成 JSON 格式。這個工具是為 crawl4AI 項目設計的。

## 功能特點

- 抓取小說章節列表
- 提取小說章節內容
- 自動將所有內容轉換為 JSON 格式
- 處理多種中文編碼問題
- 移除亂碼和不必要的空白

## 安裝依賴

```bash
pip install -r requirements.txt
```

## 使用方法

```bash
python crawl.py https://angelibrary.com/fictions/yuan_zhen_xia/map.html
```

### 選項

- `--output`或`-o`: 指定輸出目錄，預設為'output'

```bash
python crawl.py https://angelibrary.com/fictions/yuan_zhen_xia/map.html --output novel_data
```

## 輸出

爬蟲會在指定的輸出目錄中生成`novel_data.json`文件，包含以下結構：

```json
{
  "title": "小說標題",
  "author": "作者名稱",
  "source_url": "原始網址",
  "chapters": [
    {
      "id": "章節ID",
      "title": "章節標題",
      "content": "章節內容..."
    },
    ...
  ]
}
```

## 注意事項

- 此爬蟲專為特定網站格式設計，可能需要根據不同網站結構進行修改
- 請尊重版權，僅用於合法用途
- 請避免高頻率請求，以免對目標網站造成壓力
