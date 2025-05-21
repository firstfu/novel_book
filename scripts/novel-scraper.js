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

    // 從網頁中嘗試提取小說資訊
    const novelInfo = parseNovelInfo(htmlContent, url);

    const novel = {
      title: novelInfo.title || "魔狼：原振俠",
      author: novelInfo.author || "未知",
      cover: novelInfo.cover || "",
      description: novelInfo.description || "無描述",
      source: url,
      scrapeDate: new Date().toISOString(),
      chaptersCount: chapterLinks.length,
      chapters: [],
    };

    // 抓取每個章節的內容
    for (let i = 0; i < chapterLinks.length; i++) {
      const link = chapterLinks[i];
      console.log(`正在抓取第 ${i + 1}/${chapterLinks.length} 章節: ${link.title}`);

      try {
        const chapterUrl = new URL(link.url, url).href;
        const chapterHtml = await fetchHtml(chapterUrl);
        const chapterContent = parseChapterContent(chapterHtml);

        novel.chapters.push({
          id: i + 1,
          title: link.title || `第 ${i + 1} 章`,
          content: chapterContent,
          url: chapterUrl,
        });

        // 避免頻繁請求
        await sleep(1500);
      } catch (err) {
        console.error(`抓取章節 ${link.title} 失敗:`, err.message);
        // 繼續抓取下一章，但添加錯誤信息
        novel.chapters.push({
          id: i + 1,
          title: link.title || `第 ${i + 1} 章`,
          content: `抓取失敗: ${err.message}`,
          url: new URL(link.url, url).href,
          error: true,
        });
        // 出錯後等待更長時間
        await sleep(3000);
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

  // 針對數字章節和漢字章節的正則表達式
  const regexPatterns = [
    /<a[^>]*href="([^"]*)"[^>]*>\s*([^<]*第[一二三四五六七八九十百千0-9零壹貳參肆伍陸柒捌玖拾佰仟]+[章節][^<]*)\s*<\/a>/g,
    /<a[^>]*href="([^"]*)"[^>]*>\s*([^<]*[第序][0-9零壹貳參肆伍陸柒捌玖拾佰仟一二三四五六七八九十百千]+[章節話回][^<]*)\s*<\/a>/g,
    /<a[^>]*href="([^"]*)"[^>]*>\s*([^<]*Chapter\s*[0-9]+[^<]*)\s*<\/a>/gi,
  ];

  // 嘗試所有正則表達式
  for (const regex of regexPatterns) {
    let match;
    while ((match = regex.exec(html)) !== null) {
      // 確保連結不重複
      const newUrl = match[1];
      const title = match[2].trim();

      if (!links.some(link => link.url === newUrl)) {
        links.push({
          url: newUrl,
          title: title,
        });
      }
    }
  }

  // 如果仍然找不到章節，使用兜底方案
  if (links.length === 0) {
    const altRegex = /<a[^>]*href="([^"]*)"[^>]*>\s*([^<]*)\s*<\/a>/g;
    let match;

    while ((match = altRegex.exec(html)) !== null) {
      const title = match[2].trim();
      const url = match[1];

      // 只添加看起來像章節標題的連結
      if (
        title &&
        (title.includes("第") || title.includes("章") || title.includes("節") || /chapter\s*\d+/i.test(title) || /第\s*\d+\s*[章節]/i.test(title)) &&
        !links.some(link => link.url === url)
      ) {
        links.push({
          url: url,
          title: title,
        });
      }
    }
  }

  // 根據章節順序對連結進行排序 (嘗試從標題中提取數字)
  links.sort((a, b) => {
    const numA = extractChapterNumber(a.title);
    const numB = extractChapterNumber(b.title);

    if (numA !== null && numB !== null) {
      return numA - numB;
    }

    return 0; // 保持原順序
  });

  return links;
}

// 從章節標題中提取章節數字
function extractChapterNumber(title) {
  // 嘗試提取數字章節
  const numMatch = title.match(/第\s*(\d+)\s*[章節話回]|Chapter\s*(\d+)/i);
  if (numMatch) {
    return parseInt(numMatch[1] || numMatch[2], 10);
  }

  // 嘗試轉換中文數字
  const chineseNums = {
    零: 0,
    一: 1,
    二: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
    十: 10,
    百: 100,
    千: 1000,
    壹: 1,
    貳: 2,
    參: 3,
    肆: 4,
    伍: 5,
    陸: 6,
    柒: 7,
    捌: 8,
    玖: 9,
    拾: 10,
    佰: 100,
    仟: 1000,
  };

  const chineseMatch = title.match(/第([零一二三四五六七八九十百千壹貳參肆伍陸柒捌玖拾佰仟]+)[章節話回]/);
  if (chineseMatch) {
    const chineseNum = chineseMatch[1];

    // 簡單的中文數字轉換（僅適用於較小的數字）
    if (chineseNum === "十") return 10;
    if (chineseNum.length === 1) return chineseNums[chineseNum];
    if (chineseNum.startsWith("十")) {
      return 10 + (chineseNums[chineseNum[1]] || 0);
    }
    if (chineseNum.endsWith("十")) {
      return chineseNums[chineseNum[0]] * 10;
    }
    // 其他更複雜的中文數字格式可以再擴展...
  }

  return null;
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

// 解析小說基本資訊
function parseNovelInfo(html, url) {
  const info = {
    title: "",
    author: "",
    cover: "",
    description: "",
  };

  try {
    // 嘗試從頁面標題中獲取小說名
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      info.title = titleMatch[1].trim().replace(/\s*[-|]\s*.*$/, "");
    }

    // 嘗試查找作者信息
    const authorMatch = html.match(/作者[：:]\s*([^<]+)/i) || html.match(/author[：:]\s*([^<]+)/i);
    if (authorMatch && authorMatch[1]) {
      info.author = authorMatch[1].trim();
    }

    // 嘗試尋找描述
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
    if (descMatch && descMatch[1]) {
      info.description = descMatch[1].trim();
    }

    // 尋找可能的封面圖片
    const imgMatch =
      html.match(/<img[^>]*src=["']([^"']*cover[^"']*)["'][^>]*>/i) || html.match(/<img[^>]*class=["'][^"']*cover[^"']*["'][^>]*src=["']([^"']*)["'][^>]*>/i);
    if (imgMatch && imgMatch[1]) {
      info.cover = new URL(imgMatch[1], url).href;
    }
  } catch (err) {
    console.error("解析小說資訊時出錯:", err.message);
  }

  return info;
}

// 如果直接執行這個腳本
if (require.main === module) {
  // 實際抓取小說內容
  console.log("開始抓取真實小說內容...");

  // 創建進度報告間隔
  let startTime = Date.now();

  scrapeNovel()
    .then(novel => {
      const endTime = Date.now();
      const totalTime = ((endTime - startTime) / 1000 / 60).toFixed(2);

      console.log(`成功抓取小說: ${novel.title}`);
      console.log(`共抓取了 ${novel.chapters.length} 個章節`);
      console.log(`總耗時: ${totalTime} 分鐘`);

      // 統計錯誤章節數
      const errorChapters = novel.chapters.filter(ch => ch.error).length;
      if (errorChapters > 0) {
        console.log(`有 ${errorChapters} 個章節抓取失敗`);
      }
    })
    .catch(err => {
      console.error("抓取失敗:", err);
    });
}

module.exports = {
  scrapeNovel,
  createMockNovelData,
};
