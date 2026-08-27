import { Stack } from "expo-router";
import { colors } from "@/lib/theme";

export default function TalentsStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Talenti" }} />
      <Stack.Screen name="[id]" options={{ title: "" }} />
    </Stack>
  );
}
