import { useState } from "react";
import * as Linking from "expo-linking";
import { Redirect } from "expo-router";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Field, Input, GoldButton, GhostButton } from "@/components/ui/Primitives";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { colors } from "@/lib/theme";

export default function LoginScreen() {
  const { session, checking } = useAuth();
  const [mode, setMode] = useState<"talent" | "staff">("talent");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!checking && session) return <Redirect href="/" />;

  const sendMagicLink = async () => {
    setSending(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: Linking.createURL("") },
    });
    setSending(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSent(true);
  };

  const staffLogin = async () => {
    setSending(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setSending(false);
    if (err) setError(err.message);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.wrap}>
        <Text style={styles.brand}>✦ Babylon Stars</Text>

        <View style={styles.tabs}>
          <GhostButton
            title="Talent"
            onPress={() => {
              setMode("talent");
              setError(null);
              setSent(false);
            }}
          />
          <GhostButton
            title="Ekipa"
            onPress={() => {
              setMode("staff");
              setError(null);
            }}
          />
        </View>
        <Text style={styles.activeMode}>{mode === "talent" ? "Prijava talenta" : "Prijava ekipe"}</Text>

        {mode === "talent" ? (
          sent ? (
            <Text style={styles.sentText}>Povezava poslana. Preveri svoj e-poštni predal in odpri povezavo na tem telefonu.</Text>
          ) : (
            <>
              <Text style={styles.sub}>Vpiši e-pošto, ki si jo uporabil/-a ob prijavi — poslali ti bomo povezavo za prijavo.</Text>
              <Field label="Email">
                <Input value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="ime@email.com" />
              </Field>
              {error && <Text style={styles.error}>{error}</Text>}
              <GoldButton title="Pošlji povezavo za prijavo" onPress={sendMagicLink} loading={sending} disabled={!email} />
            </>
          )
        ) : (
          <>
            <Field label="Email">
              <Input value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
            </Field>
            <Field label="Geslo">
              <Input value={password} onChangeText={setPassword} secureTextEntry />
            </Field>
            {error && <Text style={styles.error}>{error}</Text>}
            <GoldButton title="Prijava" onPress={staffLogin} loading={sending} disabled={!email || !password} />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, backgroundColor: colors.bg, padding: 24, justifyContent: "center" },
  brand: { color: colors.gold, fontSize: 18, textAlign: "center", marginBottom: 32 },
  tabs: { flexDirection: "row", gap: 10, justifyContent: "center", marginBottom: 16 },
  activeMode: { color: colors.text, fontSize: 15, fontWeight: "600", textAlign: "center", marginBottom: 20 },
  sub: { color: colors.textMuted, fontSize: 13, textAlign: "center", marginBottom: 20, lineHeight: 19 },
  sentText: { color: colors.textLight, fontSize: 14, textAlign: "center", lineHeight: 21 },
  error: { color: colors.red, fontSize: 13, marginBottom: 12 },
});
