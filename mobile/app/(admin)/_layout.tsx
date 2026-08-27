import { Redirect, Tabs } from "expo-router";
import { useAuth } from "@/lib/auth-context";
import { colors } from "@/lib/theme";

export default function AdminLayout() {
  const { session, checking, isStaff } = useAuth();

  if (!checking && !session) return <Redirect href="/login" />;
  if (!checking && !isStaff) return <Redirect href="/(talent)/profile" />;

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        tabBarStyle: { backgroundColor: colors.bgCard, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textDim,
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen name="talents" options={{ title: "Talenti" }} />
      <Tabs.Screen name="briefs" options={{ title: "Briefi" }} />
      <Tabs.Screen name="calendar" options={{ title: "Koledar" }} />
      <Tabs.Screen name="messages" options={{ title: "Sporočila" }} />
    </Tabs>
  );
}
