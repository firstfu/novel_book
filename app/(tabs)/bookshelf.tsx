import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BookCover from "@/components/novel/BookCover";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

const windowWidth = Dimensions.get("window").width;

export default function BookshelfScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const themeColor = Colors[colorScheme ?? "light"];

  const [activeTab, setActiveTab] = useState("全部");

  // 模擬用戶書架數據
  const bookshelfData = [
    { id: 1, title: "無盡的旅程", author: "林雨晴", colorScheme: "blue", progress: 0.75, lastRead: "昨天" },
    { id: 2, title: "星海傳說", author: "陳冠宇", colorScheme: "purple", progress: 0.3, lastRead: "3天前" },
    { id: 3, title: "山中奇遇", author: "李明哲", colorScheme: "green", progress: 0.9, lastRead: "1小時前" },
    { id: 4, title: "城市迷霧", author: "張靜怡", colorScheme: "red", progress: 0.5, lastRead: "上週" },
    { id: 5, title: "鏡像世界", author: "王大明", colorScheme: "orange", progress: 0.1, lastRead: "剛剛" },
    { id: 6, title: "時間的禮物", author: "周芷若", colorScheme: "blue", progress: 0, lastRead: "未閱讀" },
  ];

  // 書架分類標籤
  const bookshelfTabs = ["全部", "最近閱讀", "已購買", "待讀", "已完成"];

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      {/* 頂部標題 */}
      <View style={styles.header}>
        <ThemedText type="title">我的書架</ThemedText>
        <TouchableOpacity style={styles.editButton}>
          <IconSymbol size={24} name={"square.and.pencil" as const} color={themeColor.text} />
        </TouchableOpacity>
      </View>

      {/* 書架分類標籤 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
        {bookshelfTabs.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabItem, activeTab === tab && { backgroundColor: themeColor.tint, borderColor: themeColor.tint }]}
            onPress={() => setActiveTab(tab)}
          >
            <ThemedText style={[styles.tabText, activeTab === tab && { color: "#FFF" }]}>{tab}</ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.booksContainer}>
        {bookshelfData.map(book => (
          <TouchableOpacity key={book.id} style={styles.bookCard}>
            <BookCover width={80} height={120} colorScheme={book.colorScheme as "blue" | "purple" | "green" | "orange" | "red"} style={styles.bookCover} />
            <View style={styles.bookInfo}>
              <ThemedText type="defaultSemiBold" numberOfLines={1}>
                {book.title}
              </ThemedText>
              <ThemedText style={styles.authorText}>{book.author}</ThemedText>

              {/* 閱讀進度 */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${book.progress * 100}%`, backgroundColor: themeColor.tint }]} />
                </View>
                <ThemedText style={styles.progressText}>{Math.round(book.progress * 100)}%</ThemedText>
              </View>

              <View style={styles.lastReadContainer}>
                <IconSymbol size={14} name={"clock.fill" as const} color={themeColor.tabIconDefault} />
                <ThemedText style={styles.lastReadText}>{book.lastRead}</ThemedText>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  editButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  tabsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#DDDDDD",
  },
  tabText: {
    fontSize: 14,
  },
  booksContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  bookCard: {
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    overflow: "hidden",
  },
  bookCover: {
    width: 80,
    height: 120,
  },
  bookInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  authorText: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    marginRight: 8,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    width: 36,
    textAlign: "right",
  },
  lastReadContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  lastReadText: {
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.7,
  },
});
