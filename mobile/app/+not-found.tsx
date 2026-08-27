import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/lib/theme";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <Text style={styles.title}>Ta stran ne obstaja.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Nazaj na začetek</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20, backgroundColor: colors.bg },
  title: { fontSize: 18, fontWeight: "600", color: colors.text },
  link: { marginTop: 15, paddingVertical: 15 },
  linkText: { fontSize: 14, color: colors.gold },
});
