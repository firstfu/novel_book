import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";

type BookCoverProps = {
  width?: number;
  height?: number;
  colorScheme?: "blue" | "purple" | "green" | "orange" | "red";
  style?: any;
};

export default function BookCover({ width = 150, height = 200, colorScheme = "blue", style }: BookCoverProps) {
  // 定義不同配色方案
  const colorSchemes = {
    blue: {
      primary: "#1A73E8",
      secondary: "#5195EE",
      accent: "#073D87",
      light: "#B1CCFF",
    },
    purple: {
      primary: "#7B1FA2",
      secondary: "#9C4DCC",
      accent: "#4A148C",
      light: "#D1C4E9",
    },
    green: {
      primary: "#388E3C",
      secondary: "#66BB6A",
      accent: "#1B5E20",
      light: "#C8E6C9",
    },
    orange: {
      primary: "#F57C00",
      secondary: "#FFB74D",
      accent: "#E65100",
      light: "#FFE0B2",
    },
    red: {
      primary: "#D32F2F",
      secondary: "#EF5350",
      accent: "#B71C1C",
      light: "#FFCDD2",
    },
  };

  const colors = colorSchemes[colorScheme];

  // 根據長寬比調整視圖框
  const viewBox = `0 0 150 200`;

  // 根據不同配色方案生成不同的封面樣式
  const renderBookCover = () => {
    return (
      <Svg width={width} height={height} viewBox={viewBox}>
        <Defs>
          <LinearGradient id="coverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.primary} />
            <Stop offset="100%" stopColor={colors.secondary} />
          </LinearGradient>
          <LinearGradient id="spineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={colors.accent} />
            <Stop offset="100%" stopColor={colors.primary} />
          </LinearGradient>
        </Defs>

        {/* 書脊 */}
        <Rect x="0" y="10" width="15" height="180" fill="url(#spineGradient)" />

        {/* 書的主體 */}
        <Rect x="15" y="10" width="130" height="180" fill="url(#coverGradient)" rx="2" />

        {/* 書的裝飾元素 - 波浪線條 */}
        <Path d="M35,50 C60,40 80,60 105,50 C130,40 150,60 175,50" stroke={colors.light} strokeWidth="2" fill="none" />
        <Path d="M35,70 C60,60 80,80 105,70 C130,60 150,80 175,70" stroke={colors.light} strokeWidth="2" fill="none" />

        {/* 書的標題位置 */}
        <Rect x="35" y="100" width="90" height="6" fill={colors.light} opacity="0.8" rx="2" />
        <Rect x="35" y="115" width="70" height="6" fill={colors.light} opacity="0.8" rx="2" />
        <Rect x="35" y="130" width="50" height="6" fill={colors.light} opacity="0.6" rx="2" />

        {/* 裝飾圓點 */}
        <Circle cx="80" cy="160" r="10" fill={colors.accent} opacity="0.6" />

        {/* 書脊上的線條 */}
        <Rect x="3" y="30" width="9" height="2" fill={colors.light} opacity="0.6" />
        <Rect x="3" y="170" width="9" height="2" fill={colors.light} opacity="0.6" />
      </Svg>
    );
  };

  return <View style={[styles.container, style]}>{renderBookCover()}</View>;
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
