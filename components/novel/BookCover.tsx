import { ThemedText } from "@/components/ThemedText";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ColorValue, StyleSheet, View, ViewStyle } from "react-native";

// 書籍封面顏色方案
const colorSchemes: Record<string, [ColorValue, ColorValue]> = {
  blue: ["#4F8BFF", "#2D6BFF"],
  purple: ["#A36BFF", "#7F3BFF"],
  green: ["#4CD964", "#26B33C"],
  orange: ["#FF9F40", "#FF7D00"],
  red: ["#FF5A5A", "#FF2D2D"],
};

type ColorScheme = keyof typeof colorSchemes;

interface BookCoverProps {
  width: number;
  height: number;
  colorScheme: ColorScheme;
  style?: ViewStyle;
  title?: string;
  author?: string;
}

const BookCover: React.FC<BookCoverProps> = ({ width, height, colorScheme, style, title, author }) => {
  const colors = colorSchemes[colorScheme] || colorSchemes.blue;

  return (
    <View style={[styles.container, { width, height }, style]}>
      <LinearGradient colors={colors} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        {title && (
          <View style={styles.textContainer}>
            <ThemedText style={styles.title} type="defaultSemiBold" lightColor="#FFFFFF" darkColor="#FFFFFF" numberOfLines={2}>
              {title}
            </ThemedText>
            {author && (
              <ThemedText style={styles.author} lightColor="#FFFFFF" darkColor="#FFFFFF" numberOfLines={1}>
                {author}
              </ThemedText>
            )}
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: "hidden",
  },
  gradient: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 12,
  },
  textContainer: {
    width: "100%",
  },
  title: {
    fontSize: 16,
    marginBottom: 4,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  author: {
    fontSize: 12,
    opacity: 0.8,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default BookCover;
