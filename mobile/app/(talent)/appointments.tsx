import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text } from "react-native";
import { Badge, Card, EmptyState } from "@/components/ui/Primitives";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { colors } from "@/lib/theme";

interface AppointmentRow {
  id: string;
  type: string;
  starts_at: string;
  location: string | null;
  brief: { title: string } | { title: string }[] | null;
}

const TYPE_LABEL: Record<string, string> = {
  audition: "Avdicija",
  callback: "Callback",
  fitting: "Fitting",
  shoot: "Snemanje",
  meeting: "Sestanek",
  other: "Drugo",
};

function one<T>(v: T | T[] | null): T | null {
  if (!v) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}

export default function AppointmentsScreen() {
  const { talentId } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!talentId) return;
    setLoading(true);
    const { data } = await supabase
      .from("appointment")
      .select("id,type,starts_at,location,brief(title)")
      .eq("talent_id", talentId)
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true });
    setAppointments((data as AppointmentRow[]) ?? []);
    setLoading(false);
  }, [talentId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
      data={appointments}
      keyExtractor={(a) => a.id}
      ListEmptyComponent={loading ? <ActivityIndicator color={colors.gold} /> : <EmptyState>Trenutno nimaš razpisanih terminov.</EmptyState>}
      renderItem={({ item }) => {
        const brief = one(item.brief);
        const d = new Date(item.starts_at);
        return (
          <Card style={{ marginBottom: 10 }}>
            <Text style={styles.time}>
              {d.toLocaleDateString()} · {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </Text>
            <Badge color={colors.textLight} bg={colors.chipBg}>
              {TYPE_LABEL[item.type] ?? item.type}
            </Badge>
            {brief && <Text style={styles.brief}>{brief.title}</Text>}
            {item.location && <Text style={styles.location}>{item.location}</Text>}
          </Card>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  time: { color: colors.text, fontSize: 14, fontWeight: "500", marginBottom: 6 },
  brief: { color: colors.textMuted, fontSize: 13, marginTop: 8 },
  location: { color: colors.textDim, fontSize: 12, marginTop: 4 },
});
