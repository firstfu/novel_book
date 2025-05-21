import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Dimensions, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BookCover from "@/components/novel/BookCover";
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
    {
      id: 1,
      title: "無盡的旅程",
      author: "林雨晴",
      colorScheme: "blue",
      rating: 4.5,
      svgSource: require("@/assets/images/book-covers/endless-journey.svg"),
      genre: "科幻",
    },
    {
      id: 2,
      title: "星海傳說",
      author: "陳冠宇",
      colorScheme: "purple",
      rating: 4.8,
      svgSource: require("@/assets/images/book-covers/star-legend.svg"),
      genre: "科幻",
    },
    {
      id: 3,
      title: "山中奇遇",
      author: "李明哲",
      colorScheme: "green",
      rating: 4.2,
      svgSource: require("@/assets/images/book-covers/mountain-adventure.svg"),
      genre: "推理",
    },
  ];

  const trendingBooks = [
    {
      id: 1,
      title: "城市迷霧",
      author: "張靜怡",
      colorScheme: "red",
      rating: 4.6,
      svgSource: require("@/assets/images/book-covers/city-fog.svg"),
      genre: "推理",
    },
    {
      id: 2,
      title: "鏡像世界",
      author: "王大明",
      colorScheme: "orange",
      rating: 4.9,
      svgSource: require("@/assets/images/book-covers/mirror-world.svg"),
      genre: "警悚",
    },
    {
      id: 3,
      title: "時間的禮物",
      author: "周芷若",
      colorScheme: "blue",
      rating: 4.7,
      svgSource: require("@/assets/images/book-covers/time-gift.svg"),
      genre: "科幻",
    },
    {
      id: 4,
      title: "海洋之心",
      author: "林森泰",
      colorScheme: "green",
      rating: 4.3,
      svgSource: require("@/assets/images/book-covers/sea-of-heart.svg"),
      genre: "警悚",
    },
  ];

  const categories = [
    { id: 1, name: "推理", icon: "magnifyingglass" as const, color: "#6C5CE7" },
    { id: 2, name: "科幻", icon: "atom" as const, color: "#00B894" },
    { id: 3, name: "警悚", icon: "exclamationmark.triangle.fill" as const, color: "#FF6B6B" },
  ];

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      {/* 頂部標題欄 */}
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.greeting}>哈囉，書迷</ThemedText>
          <ThemedText type="title" style={styles.appTitle}>
            Novel Book
          </ThemedText>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <IconSymbol size={24} name={"person.circle.fill" as const} color={themeColor.text} />
        </TouchableOpacity>
      </View>

      {/* 搜尋欄 */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <IconSymbol size={20} name={"magnifyingglass" as const} color={themeColor.tabIconDefault} style={styles.searchIcon} />
          <TextInput style={styles.searchInput} placeholder="搜尋書名、作者..." placeholderTextColor={themeColor.tabIconDefault} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 分類列表 */}
        <View style={styles.categoriesSection}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">探索類別</ThemedText>
          </View>

          <View style={styles.categoriesContainer}>
            {categories.map(category => (
              <TouchableOpacity key={category.id} style={styles.categoryCard}>
                <LinearGradient colors={[category.color, `${category.color}99`]} style={styles.categoryGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <IconSymbol size={24} name={category.icon} color="#FFFFFF" />
                  <ThemedText style={styles.categoryName} lightColor="#FFFFFF" darkColor="#FFFFFF">
                    {category.name}
                  </ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 特色書籍 */}
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">每週精選</ThemedText>
          <TouchableOpacity>
            <ThemedText style={styles.viewAllText}>查看全部</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.featuredBookContainer}>
          {featuredBooks[0] && (
            <TouchableOpacity style={styles.featuredMainBook}>
              <BookCover
                width={windowWidth - 40}
                height={200}
                colorScheme={featuredBooks[0].colorScheme as "blue" | "purple" | "green" | "orange" | "red"}
                style={styles.featuredCover}
                svgSource={featuredBooks[0].svgSource}
              />
              <View style={styles.bookOverlay}>
                <View style={styles.genreTag}>
                  <ThemedText style={styles.genreText} lightColor="#FFFFFF" darkColor="#FFFFFF">
                    {featuredBooks[0].genre}
                  </ThemedText>
                </View>
                <View style={styles.bookInfo}>
                  <ThemedText type="defaultSemiBold" style={styles.bookTitle} lightColor="#FFFFFF" darkColor="#FFFFFF" numberOfLines={1}>
                    {featuredBooks[0].title}
                  </ThemedText>
                  <ThemedText style={styles.authorText} lightColor="#FFFFFF" darkColor="#FFFFFF">
                    {featuredBooks[0].author}
                  </ThemedText>
                  <View style={styles.ratingContainer}>
                    <IconSymbol size={16} name={"star.fill" as const} color="#FFD700" />
                    <ThemedText style={styles.ratingText} lightColor="#FFFFFF" darkColor="#FFFFFF">
                      {featuredBooks[0].rating}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* 趨勢閱讀 */}
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">熱門趨勢</ThemedText>
          <TouchableOpacity>
            <ThemedText style={styles.viewAllText}>查看全部</ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingContainer}>
          {trendingBooks.map(book => (
            <TouchableOpacity key={book.id} style={styles.trendingBookCard}>
              <BookCover
                width={150}
                height={200}
                colorScheme={book.colorScheme as "blue" | "purple" | "green" | "orange" | "red"}
                style={styles.trendingCover}
                svgSource={book.svgSource}
              />
              <View style={styles.smallGenreTag}>
                <ThemedText style={styles.smallGenreText}>{book.genre}</ThemedText>
              </View>
              <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.bookTitle}>
                {book.title}
              </ThemedText>
              <ThemedText style={styles.authorText}>{book.author}</ThemedText>
              <View style={styles.ratingContainer}>
                <IconSymbol size={14} name={"star.fill" as const} color="#FFD700" />
                <ThemedText style={styles.smallRatingText}>{book.rating}</ThemedText>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "space-between",
  },
  greeting: {
    fontSize: 14,
    opacity: 0.7,
  },
  appTitle: {
    fontSize: 28,
    marginTop: 4,
  },
  profileButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 22,
  },
  searchWrapper: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  categoriesSection: {
    marginBottom: 24,
  },
  categoriesContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  categoryCard: {
    width: (windowWidth - 56) / 3,
    borderRadius: 16,
    overflow: "hidden",
  },
  categoryGradient: {
    padding: 16,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    opacity: 0.7,
  },
  featuredBookContainer: {
    paddingHorizontal: 20,
  },
  featuredMainBook: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  featuredCover: {
    width: "100%",
    height: 200,
    borderRadius: 16,
  },
  bookOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  genreTag: {
    position: "absolute",
    top: -130,
    left: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  genreText: {
    fontSize: 12,
    fontWeight: "600",
  },
  smallGenreTag: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  smallGenreText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  bookInfo: {
    width: "100%",
  },
  bookTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  authorText: {
    fontSize: 14,
    opacity: 0.8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  ratingText: {
    fontSize: 14,
    marginLeft: 4,
  },
  smallRatingText: {
    fontSize: 12,
    marginLeft: 4,
  },
  trendingContainer: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  trendingBookCard: {
    width: 150,
    marginRight: 16,
    position: "relative",
  },
  trendingCover: {
    width: 150,
    height: 200,
    borderRadius: 12,
  },
});
