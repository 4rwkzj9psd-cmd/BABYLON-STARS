import { useEffect, useState } from "react";
import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, Linking, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { colors } from "@/lib/theme";
import { GoldButton, GhostButton } from "@/components/ui/Primitives";

interface AgencyRow {
  subscription_status: "trialing" | "active" | "past_due" | "canceled";
  trial_ends_at: string;
}

const REASON_COPY: Record<string, string> = {
  trial_expired: "Preizkusna doba je potekla.",
  past_due: "Zadnje plačilo ni uspelo.",
  canceled: "Naročnina je bila preklicana.",
};

function BillingGateScreen({ reason, onLogout }: { reason: "trial_expired" | "past_due" | "canceled"; onLogout: () => void }) {
  return (
    <View style={[styles.center, { backgroundColor: colors.bg }]}>
      <Text style={styles.title}>{REASON_COPY[reason]}</Text>
      <Text style={styles.sub}>Dodaj plačilno kartico na spletni strani (Admin), da obdržiš dostop.</Text>
      <View style={{ height: 16 }} />
      <GoldButton title="Odpri nastavitve na spletu" onPress={() => Linking.openURL("https://babylonstars.vercel.app/admin")} />
      <View style={{ height: 10 }} />
      <GhostButton title="Odjava" onPress={onLogout} />
    </View>
  );
}

export default function AdminLayout() {
  const { session, checking, isStaff, signOut } = useAuth();
  const [agency, setAgency] = useState<AgencyRow | null>(null);
  const [checkingAgency, setCheckingAgency] = useState(true);

  useEffect(() => {
    if (!isStaff) {
      setCheckingAgency(false);
      return;
    }
    supabase
      .from("agency")
      .select("subscription_status,trial_ends_at")
      .single()
      .then(({ data }) => {
        setAgency((data as AgencyRow) ?? null);
        setCheckingAgency(false);
      });
  }, [isStaff]);

  if (!checking && !session) return <Redirect href="/login" />;
  if (!checking && !isStaff) return <Redirect href="/(talent)/profile" />;

  if (checkingAgency) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  if (agency) {
    const trialExpired = agency.subscription_status === "trialing" && new Date(agency.trial_ends_at) < new Date();
    if (trialExpired) return <BillingGateScreen reason="trial_expired" onLogout={signOut} />;
    if (agency.subscription_status === "past_due") return <BillingGateScreen reason="past_due" onLogout={signOut} />;
    if (agency.subscription_status === "canceled") return <BillingGateScreen reason="canceled" onLogout={signOut} />;
  }

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

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { color: colors.text, fontSize: 17, fontWeight: "600", textAlign: "center", marginBottom: 8 },
  sub: { color: colors.textMuted, fontSize: 13, textAlign: "center", lineHeight: 19 },
});
