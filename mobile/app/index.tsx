import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "@/lib/auth-context";
import { colors } from "@/lib/theme";

export default function Index() {
  const { session, checking, isStaff } = useAuth();

  if (checking) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  if (!session) return <Redirect href="/login" />;
  if (isStaff) return <Redirect href="/(admin)/talents" />;
  return <Redirect href="/(talent)/profile" />;
}
