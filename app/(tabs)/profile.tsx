import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const themeColor = Colors[colorScheme ?? "light"];

  // 用戶資料
  const userProfile = {
    name: "李小明",
    avatar: require("@/assets/images/partial-react-logo.png"),
    readingStats: {
      totalBooks: 42,
      totalHours: 128,
      weeklyAverage: 5.2,
    },
  };

  // 設置項目
  const settingsItems = [
    { id: "theme", title: "外觀設定", icon: "paintpalette.fill", color: "#9B59B6" },
    { id: "notifications", title: "通知設定", icon: "bell.fill", color: "#3498DB" },
    { id: "privacy", title: "隱私設定", icon: "lock.fill", color: "#2ECC71" },
    { id: "about", title: "關於應用", icon: "info.circle.fill", color: "#E67E22" },
    { id: "help", title: "幫助和支援", icon: "questionmark.circle.fill", color: "#E74C3C" },
  ];

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      {/* 頂部標題 */}
      <View style={styles.header}>
        <ThemedText type="title">個人中心</ThemedText>
        <TouchableOpacity style={styles.settingsButton}>
          <IconSymbol size={24} name="gearshape.fill" color={themeColor.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 用戶資訊卡片 */}
        <View style={styles.profileCard}>
          <Image source={userProfile.avatar} style={styles.avatar} contentFit="cover" />
          <View style={styles.profileInfo}>
            <ThemedText type="title">{userProfile.name}</ThemedText>
            <ThemedText style={styles.memberStatus}>高級會員</ThemedText>
          </View>
        </View>

        {/* 閱讀統計 */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <ThemedText type="title">{userProfile.readingStats.totalBooks}</ThemedText>
            <ThemedText style={styles.statLabel}>已讀書籍</ThemedText>
          </View>
          <View style={[styles.statItem, styles.statBorder]}>
            <ThemedText type="title">{userProfile.readingStats.totalHours}h</ThemedText>
            <ThemedText style={styles.statLabel}>閱讀時長</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText type="title">{userProfile.readingStats.weeklyAverage}h</ThemedText>
            <ThemedText style={styles.statLabel}>週平均</ThemedText>
          </View>
        </View>

        {/* 功能區塊 */}
        <View style={styles.functionSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            快速操作
          </ThemedText>

          <View style={styles.functionGrid}>
            <TouchableOpacity style={styles.functionItem}>
              <View style={[styles.functionIcon, { backgroundColor: "#F39C12" }]}>
                <IconSymbol size={20} name="book.fill" color="#FFFFFF" />
              </View>
              <ThemedText style={styles.functionLabel}>閱讀歷史</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.functionItem}>
              <View style={[styles.functionIcon, { backgroundColor: "#1ABC9C" }]}>
                <IconSymbol size={20} name="bookmark.fill" color="#FFFFFF" />
              </View>
              <ThemedText style={styles.functionLabel}>我的書籤</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.functionItem}>
              <View style={[styles.functionIcon, { backgroundColor: "#3498DB" }]}>
                <IconSymbol size={20} name="note.text" color="#FFFFFF" />
              </View>
              <ThemedText style={styles.functionLabel}>閱讀筆記</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.functionItem}>
              <View style={[styles.functionIcon, { backgroundColor: "#E74C3C" }]}>
                <IconSymbol size={20} name="heart.fill" color="#FFFFFF" />
              </View>
              <ThemedText style={styles.functionLabel}>我的收藏</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* 設置列表 */}
        <View style={styles.settingsSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            設置
          </ThemedText>

          {settingsItems.map(item => (
            <TouchableOpacity key={item.id} style={styles.settingItem}>
              <View style={[styles.settingIconContainer, { backgroundColor: item.color }]}>
                <IconSymbol size={18} name={item.icon} color="#FFFFFF" />
              </View>
              <ThemedText style={styles.settingTitle}>{item.title}</ThemedText>
              <IconSymbol size={18} name="chevron.right" color={themeColor.tabIconDefault} />
            </TouchableOpacity>
          ))}
        </View>
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
  settingsButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingBottom: 24,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    padding: 16,
    backgroundColor: "#F8F8F8",
    borderRadius: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  memberStatus: {
    fontSize: 14,
    color: "#E74C3C",
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#F8F8F8",
    borderRadius: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#E0E0E0",
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.7,
  },
  functionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  functionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 8,
  },
  functionItem: {
    width: "25%",
    alignItems: "center",
    marginBottom: 16,
  },
  functionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  functionLabel: {
    fontSize: 12,
  },
  settingsSection: {
    marginBottom: 24,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  settingIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  settingTitle: {
    flex: 1,
    fontSize: 16,
  },
});
