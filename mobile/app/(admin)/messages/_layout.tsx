import { Stack } from "expo-router";
import { colors } from "@/lib/theme";

export default function MessagesStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Sporočila" }} />
      <Stack.Screen name="[talentId]" options={{ title: "" }} />
    </Stack>
  );
}
