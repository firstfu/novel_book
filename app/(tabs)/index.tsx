import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Dimensions, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

const windowWidth = Dimensions.get("window").width;

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const themeColor = Colors[colorScheme ?? "light"];

  const featuredBooks = [
    { id: 1, title: "無盡的旅程", author: "林雨晴", cover: require("@/assets/images/partial-react-logo.png"), rating: 4.5 },
    { id: 2, title: "星海傳說", author: "陳冠宇", cover: require("@/assets/images/partial-react-logo.png"), rating: 4.8 },
    { id: 3, title: "山中奇遇", author: "李明哲", cover: require("@/assets/images/partial-react-logo.png"), rating: 4.2 },
  ];

  const popularBooks = [
    { id: 1, title: "城市迷霧", author: "張靜怡", cover: require("@/assets/images/partial-react-logo.png"), rating: 4.6 },
    { id: 2, title: "鏡像世界", author: "王大明", cover: require("@/assets/images/partial-react-logo.png"), rating: 4.9 },
    { id: 3, title: "時間的禮物", author: "周芷若", cover: require("@/assets/images/partial-react-logo.png"), rating: 4.7 },
    { id: 4, title: "海洋之心", author: "林書豪", cover: require("@/assets/images/partial-react-logo.png"), rating: 4.3 },
  ];

  const categories = [
    { id: 1, name: "奇幻", icon: "sparkles" },
    { id: 2, name: "科幻", icon: "atom" },
    { id: 3, name: "愛情", icon: "heart.fill" },
    { id: 4, name: "懸疑", icon: "magnifyingglass" },
    { id: 5, name: "歷史", icon: "clock.fill" },
    { id: 6, name: "武俠", icon: "person.fill" },
    { id: 7, name: "更多", icon: "ellipsis" },
  ];

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      {/* 頂部搜尋欄 */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <IconSymbol size={20} name="magnifyingglass" color={themeColor.text} style={styles.searchIcon} />
          <TextInput style={styles.searchInput} placeholder="搜尋書名、作者..." placeholderTextColor={themeColor.tabIconDefault} />
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <IconSymbol size={24} name="bell.fill" color={themeColor.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 輪播推薦 */}
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">編輯推薦</ThemedText>
          <TouchableOpacity>
            <ThemedText style={styles.viewAllText}>查看全部</ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselContainer}>
          {featuredBooks.map(book => (
            <TouchableOpacity key={book.id} style={styles.featuredBookCard}>
              <Image source={book.cover} style={styles.featuredCover} contentFit="cover" />
              <View style={styles.featuredBookInfo}>
                <ThemedText type="defaultSemiBold" numberOfLines={1}>
                  {book.title}
                </ThemedText>
                <ThemedText style={styles.authorText}>{book.author}</ThemedText>
                <View style={styles.ratingContainer}>
                  <IconSymbol size={16} name="star.fill" color="#FFD700" />
                  <ThemedText style={styles.ratingText}>{book.rating}</ThemedText>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 熱門小說 */}
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">熱門小說</ThemedText>
          <TouchableOpacity>
            <ThemedText style={styles.viewAllText}>查看全部</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.popularBooksContainer}>
          {popularBooks.map(book => (
            <TouchableOpacity key={book.id} style={styles.popularBookCard}>
              <Image source={book.cover} style={styles.popularCover} contentFit="cover" />
              <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.popularTitle}>
                {book.title}
              </ThemedText>
              <ThemedText style={styles.authorText}>{book.author}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* 分類瀏覽 */}
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">分類瀏覽</ThemedText>
        </View>

        <View style={styles.categoriesContainer}>
          {categories.map(category => (
            <TouchableOpacity key={category.id} style={styles.categoryItem}>
              <View style={styles.categoryIconContainer}>
                <IconSymbol size={20} name={category.icon} color={themeColor.text} />
              </View>
              <ThemedText style={styles.categoryName}>{category.name}</ThemedText>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  notificationButton: {
    marginLeft: 12,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 14,
    opacity: 0.7,
  },
  carouselContainer: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  featuredBookCard: {
    width: windowWidth * 0.65,
    marginRight: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  featuredCover: {
    width: "100%",
    height: 160,
    borderRadius: 12,
  },
  featuredBookInfo: {
    marginTop: 8,
  },
  authorText: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.7,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    marginLeft: 4,
  },
  popularBooksContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  popularBookCard: {
    width: (windowWidth - 40) / 2,
    marginBottom: 16,
  },
  popularCover: {
    width: "100%",
    height: 150,
    borderRadius: 8,
  },
  popularTitle: {
    marginTop: 8,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
  },
  categoryItem: {
    width: (windowWidth - 64) / 4,
    alignItems: "center",
    marginBottom: 16,
    marginHorizontal: 4,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    textAlign: "center",
  },
});
