import { Redirect } from "expo-router";
import { Tabs } from "expo-router";
import { colors } from "@/lib/theme";
import { useAuth } from "@/lib/auth-context";

export default function TalentLayout() {
  const { session, checking, isStaff } = useAuth();

  if (!checking && !session) return <Redirect href="/login" />;
  if (isStaff) return <Redirect href="/(admin)/talents" />;

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
      <Tabs.Screen name="profile" options={{ title: "Moj profil" }} />
      <Tabs.Screen name="projects" options={{ title: "Projekti" }} />
      <Tabs.Screen name="appointments" options={{ title: "Termini" }} />
      <Tabs.Screen name="messages" options={{ title: "Sporočila" }} />
    </Tabs>
  );
}
