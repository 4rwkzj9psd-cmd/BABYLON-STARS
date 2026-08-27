import { useEffect } from "react";
import * as Linking from "expo-linking";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { AuthProvider } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { colors } from "@/lib/theme";

function useAuthDeepLink() {
  useEffect(() => {
    const handleUrl = async (url: string | null) => {
      if (!url) return;
      const { queryParams } = Linking.parse(url);
      const code = queryParams?.code;
      if (typeof code === "string") {
        await supabase.auth.exchangeCodeForSession(code);
      }
    };

    Linking.getInitialURL().then(handleUrl);
    const sub = Linking.addEventListener("url", (event) => handleUrl(event.url));
    return () => sub.remove();
  }, []);
}

export default function RootLayout() {
  useAuthDeepLink();

  return (
    <AuthProvider>
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />
      </View>
    </AuthProvider>
  );
}
