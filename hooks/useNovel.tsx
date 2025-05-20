import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { useEffect, useState } from "react";

// 小說章節類型
export interface Chapter {
  id: number;
  title: string;
  content: string;
}

// 小說類型
export interface Novel {
  title: string;
  author: string;
  cover: string;
  description: string;
  chapters: Chapter[];
}

// 閱讀進度類型
export interface ReadingProgress {
  novelId: string;
  chapterId: number;
  scrollPosition: number;
  lastRead: Date;
}

// 使用小說的自定義 Hook
export function useNovel() {
  const [novel, setNovel] = useState<Novel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentChapter, setCurrentChapter] = useState<number>(1);
  const [readingProgress, setReadingProgress] = useState<ReadingProgress | null>(null);

  // 從 assets 載入小說數據
  const loadNovelData = async () => {
    try {
      setLoading(true);
      setError(null);

      let novelData: Novel | null = null;

      // 嘗試從 assets 資料夾載入
      try {
        // 檢查檔案存在
        const fileInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory + "novel.json");

        if (fileInfo.exists) {
          const fileContents = await FileSystem.readAsStringAsync(FileSystem.documentDirectory + "novel.json");
          novelData = JSON.parse(fileContents);
        } else {
          // 如果本地沒有檔案，則使用模擬數據（在實際應用中，可以從網路下載）
          const mockNovel: Novel = {
            title: "緣之鰈：袁振俠",
            author: "御我",
            cover: "",
            description: "一個愛讀書的小人物穿越，偶遇了一位古代特務。",
            chapters: Array.from({ length: 10 }, (_, i) => ({
              id: i + 1,
              title: `第${i + 1}章`,
              content: `這是第${
                i + 1
              }章的緣之鰈內容。\n\n袁振俠讓我幫他找人做一事，說他有時間會好好報答的。\n\n我本想拒絕他，但看他一臉誠懇，又不由他自己來行事，遠非那些想快速賺錢的混混。\n\n袁振俠說："朋友，我……我只想聽聽看。"\n\n我道："一般上沒有事是無故的，要麼是你，要麼是他。"我記得自己曾經讀到的一篇文章，裡面說在古代的特務們就是這樣查人的，不管對方有沒有準備，一上來就給對方一個下馬威，讓對方心裡先亂了陣腳。\n\n${Array(
                10
              )
                .fill("這是小說正文內容，請向下滾動繼續閱讀。")
                .join("\n\n")}`,
            })),
          };
          novelData = mockNovel;

          // 保存到本地以便下次使用
          await FileSystem.writeAsStringAsync(FileSystem.documentDirectory + "novel.json", JSON.stringify(mockNovel));
        }
      } catch (err) {
        console.error("讀取小說檔案失敗:", err);
        throw new Error("讀取小說檔案失敗");
      }

      // 載入閱讀進度
      try {
        const savedProgress = await AsyncStorage.getItem("readingProgress");
        if (savedProgress) {
          const progress = JSON.parse(savedProgress) as ReadingProgress;
          setReadingProgress(progress);
          setCurrentChapter(progress.chapterId);
        }
      } catch (err) {
        console.warn("讀取閱讀進度失敗:", err);
      }

      setNovel(novelData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "載入小說失敗");
      console.error("載入小說失敗:", err);
    } finally {
      setLoading(false);
    }
  };

  // 保存閱讀進度
  const saveReadingProgress = async (chapterId: number, scrollPosition: number) => {
    if (!novel) return;

    const progress: ReadingProgress = {
      novelId: novel.title,
      chapterId,
      scrollPosition,
      lastRead: new Date(),
    };

    setReadingProgress(progress);

    try {
      await AsyncStorage.setItem("readingProgress", JSON.stringify(progress));
    } catch (err) {
      console.error("保存閱讀進度失敗:", err);
    }
  };

  // 切換章節
  const goToChapter = (chapterId: number) => {
    if (!novel) return;

    // 確保章節ID在有效範圍內
    const validChapterId = Math.max(1, Math.min(chapterId, novel.chapters.length));
    setCurrentChapter(validChapterId);
    saveReadingProgress(validChapterId, 0);
  };

  // 下一章
  const goToNextChapter = () => {
    if (!novel) return;
    if (currentChapter < novel.chapters.length) {
      goToChapter(currentChapter + 1);
    }
  };

  // 上一章
  const goToPreviousChapter = () => {
    if (!novel) return;
    if (currentChapter > 1) {
      goToChapter(currentChapter - 1);
    }
  };

  // 初始載入
  useEffect(() => {
    loadNovelData();
  }, []);

  return {
    novel,
    loading,
    error,
    currentChapter,
    readingProgress,
    loadNovelData,
    saveReadingProgress,
    goToChapter,
    goToNextChapter,
    goToPreviousChapter,
  };
}
