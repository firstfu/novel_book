import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useNovel } from "@/hooks/useNovel";
import { BlurView } from "expo-blur";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

export default function ReadScreen() {
  const colorScheme = useColorScheme();
  const themeColor = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();

  const { novel, loading, error, currentChapter, readingProgress, goToChapter, goToNextChapter, goToPreviousChapter, saveReadingProgress } = useNovel();

  const scrollViewRef = useRef<ScrollView>(null);
  const [showControls, setShowControls] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.5);

  // 初始化章節
  useEffect(() => {
    if (params.id && novel) {
      const chapterId = parseInt(params.id, 10);
      if (!isNaN(chapterId) && chapterId > 0 && chapterId <= novel.chapters.length) {
        goToChapter(chapterId);
      }
    }
  }, [params.id, novel]);

  // 監聽閱讀進度
  useEffect(() => {
    if (readingProgress && scrollViewRef.current) {
      // 恢復閱讀位置
      scrollViewRef.current.scrollTo({ y: readingProgress.scrollPosition, animated: false });
    }
  }, [readingProgress]);

  // 顯示內容
  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={themeColor.tint} />
          <ThemedText style={styles.loadingText}>載入中...</ThemedText>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <IconSymbol name="exclamationmark.triangle" size={48} color={themeColor.tabIconDefault} />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: themeColor.tint }]} onPress={() => router.back()}>
            <ThemedText style={{ color: "#FFF" }}>返回</ThemedText>
          </TouchableOpacity>
        </View>
      );
    }

    if (!novel || !novel.chapters.length) {
      return (
        <View style={styles.centerContainer}>
          <ThemedText>沒有可用的小說內容</ThemedText>
        </View>
      );
    }

    const chapter = novel.chapters.find(ch => ch.id === currentChapter) || novel.chapters[0];

    return (
      <View style={styles.contentContainer}>
        <ThemedText type="title" style={styles.chapterTitle}>
          {chapter.title}
        </ThemedText>
        <ThemedText style={[styles.contentText, { fontSize, lineHeight: fontSize * lineHeight }]}>{chapter.content}</ThemedText>

        {/* 章節結束區域 */}
        <View style={styles.chapterEndContainer}>
          <View style={styles.chapterEndLine} />
          <ThemedText style={styles.chapterEndText}>章節結束</ThemedText>
          <View style={styles.chapterEndLine} />
        </View>

        {/* 下一章按鈕 */}
        <View style={styles.nextChapterContainer}>
          {currentChapter > 1 && (
            <TouchableOpacity style={[styles.chapterButton, { backgroundColor: themeColor.tint }]} onPress={goToPreviousChapter}>
              <ThemedText style={{ color: "#FFF" }}>上一章</ThemedText>
            </TouchableOpacity>
          )}

          {currentChapter < novel.chapters.length && (
            <TouchableOpacity style={[styles.chapterButton, { backgroundColor: themeColor.tint }]} onPress={goToNextChapter}>
              <ThemedText style={{ color: "#FFF" }}>下一章</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.y;
    saveReadingProgress(currentChapter, scrollPosition);
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      {/* 內容區域 */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        onScroll={handleScroll}
        scrollEventThrottle={500}
        showsVerticalScrollIndicator={false}
        onTouchStart={() => setShowControls(!showControls)}
      >
        {renderContent()}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* 頂部控制欄 */}
      {showControls && (
        <BlurView intensity={80} tint={colorScheme === "dark" ? "dark" : "light"} style={[styles.topBar, { paddingTop: insets.top }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color={themeColor.text} />
          </TouchableOpacity>
          <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.topBarTitle}>
            {novel?.title || "閱讀中"}
          </ThemedText>
          <View style={{ width: 40 }} />
        </BlurView>
      )}

      {/* 底部控制欄 */}
      {showControls && (
        <BlurView
          intensity={80}
          tint={colorScheme === "dark" ? "dark" : "light"}
          style={[styles.bottomBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }]}
        >
          <TouchableOpacity style={styles.controlButton} onPress={() => setFontSize(Math.max(14, fontSize - 1))}>
            <IconSymbol name="textformat.size.smaller" size={24} color={themeColor.text} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={() => setFontSize(Math.min(24, fontSize + 1))}>
            <IconSymbol name="textformat.size.larger" size={24} color={themeColor.text} />
          </TouchableOpacity>

          <View style={styles.chapterInfo}>
            <ThemedText style={styles.chapterInfoText}>{novel && `${currentChapter}/${novel.chapters.length}`}</ThemedText>
          </View>

          <TouchableOpacity style={styles.controlButton} onPress={goToPreviousChapter} disabled={currentChapter <= 1}>
            <IconSymbol name="chevron.left" size={24} color={currentChapter > 1 ? themeColor.text : themeColor.tabIconDefault} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={goToNextChapter} disabled={!novel || currentChapter >= novel.chapters.length}>
            <IconSymbol name="chevron.right" size={24} color={novel && currentChapter < novel.chapters.length ? themeColor.text : themeColor.tabIconDefault} />
          </TouchableOpacity>
        </BlurView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  contentContainer: {
    padding: 20,
  },
  chapterTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  contentText: {
    fontSize: 18,
    lineHeight: 27,
  },
  loadingText: {
    marginTop: 16,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  topBarTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  controlButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  chapterInfo: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  chapterInfoText: {
    fontSize: 12,
  },
  chapterEndContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  chapterEndLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  chapterEndText: {
    marginHorizontal: 12,
    fontSize: 14,
    opacity: 0.7,
  },
  nextChapterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 40,
  },
  chapterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
});
