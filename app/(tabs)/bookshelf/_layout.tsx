import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Stack } from "expo-router";

export default function BookshelfLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors[colorScheme ?? "light"].background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="read" options={{ presentation: "fullScreenModal" }} />
    </Stack>
  );
}
