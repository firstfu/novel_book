const fs = require("fs");
const path = require("path");
const https = require("https");

// 抓取小說內容的主函數
async function scrapeNovel(url = "https://angelibrary.com/fictions/yuan_zhen_xia/map.html") {
  console.log("開始抓取小說內容...");

  try {
    const htmlContent = await fetchHtml(url);

    // 解析獲取到的HTML內容
    const chapterLinks = parseChapterLinks(htmlContent);
    console.log(`找到 ${chapterLinks.length} 個章節連結`);

    const novel = {
      title: "緣之鰈：袁振俠",
      author: "御我",
      cover: "",
      description: "一個愛讀書的小人物穿越，偶遇了一位古代特務。",
      chapters: [],
    };

    // 限制章節數量，避免一次抓取太多
    const linksToProcess = chapterLinks.slice(0, 10);

    // 抓取每個章節的內容
    for (let i = 0; i < linksToProcess.length; i++) {
      const link = linksToProcess[i];
      console.log(`正在抓取第 ${i + 1}/${linksToProcess.length} 章節: ${link.title}`);

      try {
        const chapterUrl = new URL(link.url, url).href;
        const chapterHtml = await fetchHtml(chapterUrl);
        const chapterContent = parseChapterContent(chapterHtml);

        novel.chapters.push({
          id: i + 1,
          title: link.title || `第 ${i + 1} 章`,
          content: chapterContent,
        });

        // 避免頻繁請求
        await sleep(1000);
      } catch (err) {
        console.error(`抓取章節 ${link.title} 失敗:`, err.message);
      }
    }

    // 將小說數據保存為 JSON 文件
    const outputPath = path.join(__dirname, "../assets/data/novel.json");
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(novel, null, 2), "utf8");

    console.log(`小說數據已成功保存到: ${outputPath}`);
    return novel;
  } catch (error) {
    console.error("抓取小說過程中出錯:", error);
    throw error;
  }
}

// 解析 HTML 中的章節連結
function parseChapterLinks(html) {
  const links = [];

  // 簡易的正則表達式來尋找章節連結
  // 注意：這只是簡單示例，實際爬蟲可能需要更複雜的處理
  const regex = /<a[^>]*href="([^"]*)"[^>]*>\s*([^<]*第[一二三四五六七八九十百千]+章[^<]*)\s*<\/a>/g;

  let match;
  while ((match = regex.exec(html)) !== null) {
    links.push({
      url: match[1],
      title: match[2].trim(),
    });
  }

  // 如果沒有找到標準章節格式，嘗試尋找其他鏈接格式
  if (links.length === 0) {
    const altRegex = /<a[^>]*href="([^"]*)"[^>]*>\s*([^<]*)\s*<\/a>/g;
    let count = 0;

    while ((match = altRegex.exec(html)) !== null) {
      const title = match[2].trim();
      // 只添加看起來像章節標題的連結
      if (title && (title.includes("第") || title.includes("章") || title.includes("節"))) {
        links.push({
          url: match[1],
          title: title,
        });
        count++;
      }
    }
  }

  return links;
}

// 解析章節內容
function parseChapterContent(html) {
  // 尋找正文內容
  // 這個正則表達式尋找段落文本，可能需要根據實際網站調整
  const contentRegex = /<p>([\s\S]*?)<\/p>|<div[^>]*>([\s\S]*?)<\/div>/g;
  let content = "";
  let match;

  while ((match = contentRegex.exec(html)) !== null) {
    const paragraph = (match[1] || match[2] || "").trim();
    if (paragraph && !paragraph.includes("<") && paragraph.length > 10) {
      content += paragraph + "\n\n";
    }
  }

  // 如果上面的方法沒有找到內容，嘗試直接提取可能包含文本的部分
  if (!content) {
    // 移除 HTML 標籤，保留文本
    content = html
      .replace(/<[^>]*>/g, "\n")
      .replace(/\n+/g, "\n\n") // 規範化換行
      .split("\n")
      .filter(line => line.trim().length > 20) // 只保留較長的行，可能是段落
      .join("\n\n");
  }

  return content || "無法解析章節內容";
}

// 輔助函數：獲取 HTML 內容
function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, res => {
        if (res.statusCode !== 200) {
          reject(new Error(`請求失敗，狀態碼: ${res.statusCode}`));
          return;
        }

        const chunks = [];
        res.on("data", chunk => {
          chunks.push(chunk);
        });

        res.on("end", () => {
          const html = Buffer.concat(chunks).toString();
          resolve(html);
        });
      })
      .on("error", err => {
        reject(err);
      });
  });
}

// 輔助函數：休眠
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 創建模擬數據以便開發使用
function createMockNovelData() {
  const novel = {
    title: "緣之鰈：袁振俠",
    author: "御我",
    cover: "",
    description: "一個愛讀書的小人物穿越，偶遇了一位古代特務。",
    chapters: [],
  };

  // 添加10個模擬章節
  for (let i = 1; i <= 10; i++) {
    novel.chapters.push({
      id: i,
      title: `第${i}章`,
      content: `這是第${i}章的內容。\n\n袁振俠讓我幫他找人做一事，說他有時間會好好報答的。\n\n我本想拒絕他，但看他一臉誠懇，又不由他自己來行事，遠非那些想快速賺錢的混混。\n\n袁振俠說："朋友，我……我只想聽聽看。"\n\n我道："一般上沒有事是無故的，要麼是你，要麼是他。"我記得自己曾經讀到的一篇文章，裡面說在古代的特務們就是這樣查人的，不管對方有沒有準備，一上來就給對方一個下馬威，讓對方心裡先亂了陣腳。${Array(
        20
      )
        .fill("這是小說正文內容。")
        .join("\n\n")}`,
    });
  }

  return novel;
}

// 如果直接執行這個腳本
if (require.main === module) {
  // 創建模擬數據
  const mockNovel = createMockNovelData();
  const outputPath = path.join(__dirname, "../assets/data/novel.json");

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(mockNovel, null, 2), "utf8");

  console.log(`模擬小說數據已成功保存到: ${outputPath}`);

  // 實際抓取會花較長時間，所以默認使用模擬數據
  // 如需實際抓取，請取消下方註釋
  // scrapeNovel();
}

module.exports = {
  scrapeNovel,
  createMockNovelData,
};
