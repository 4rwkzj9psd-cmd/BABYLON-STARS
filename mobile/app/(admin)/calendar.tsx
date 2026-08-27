import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { Badge, Card, Field, Input, GoldButton, GhostButton, ScreenTitle, EmptyState } from "@/components/ui/Primitives";
import { supabase } from "@/lib/supabase";
import { colors, appointmentStatusMeta } from "@/lib/theme";

interface TalentOption {
  id: string;
  first_name: string;
  last_name: string;
}
interface BriefOption {
  id: string;
  title: string;
}

interface AppointmentRow {
  id: string;
  type: string;
  status: string;
  starts_at: string;
  location: string | null;
  talent: TalentOption | TalentOption[] | null;
  brief: BriefOption | BriefOption[] | null;
}

const TYPE_LABEL: Record<string, string> = {
  audition: "Avdicija",
  callback: "Callback",
  fitting: "Fitting",
  shoot: "Snemanje",
  meeting: "Sestanek",
  other: "Drugo",
};
const STATUS_LABEL: Record<string, string> = { scheduled: "Razpisan", confirmed: "Potrjen", completed: "Opravljen", cancelled: "Odpovedan" };

function one<T>(v: T | T[] | null): T | null {
  if (!v) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}

export default function CalendarScreen() {
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [briefs, setBriefs] = useState<BriefOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [briefId, setBriefId] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [slotCount, setSlotCount] = useState("6");
  const [slotDuration, setSlotDuration] = useState("15");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: a }, { data: b }] = await Promise.all([
      supabase.from("appointment").select("*,talent(id,first_name,last_name),brief(id,title)").order("starts_at", { ascending: true }),
      supabase.from("brief").select("id,title").order("created_at", { ascending: false }),
    ]);
    setAppointments((a as AppointmentRow[]) ?? []);
    setBriefs((b as BriefOption[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const generateSlots = async () => {
    const count = Number(slotCount);
    const duration = Number(slotDuration);
    if (!briefId || !startsAt || count < 1 || duration < 1) {
      setError("Manjkajo obvezni podatki (format datuma: LLLL-MM-DD HH:MM).");
      return;
    }
    const first = new Date(startsAt.replace(" ", "T"));
    if (isNaN(first.getTime())) {
      setError("Neveljaven datum/čas. Format: LLLL-MM-DD HH:MM");
      return;
    }
    setSubmitting(true);
    setError(null);
    const rows = Array.from({ length: count }).map((_, i) => {
      const start = new Date(first.getTime() + i * duration * 60000);
      return { talent_id: null, brief_id: briefId, type: "audition", starts_at: start.toISOString() };
    });
    const { error: insertError } = await supabase.from("appointment").insert(rows);
    setSubmitting(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setShowForm(false);
    setStartsAt("");
    load();
  };

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
      data={appointments}
      keyExtractor={(a) => a.id}
      ListHeaderComponent={
        <View style={{ marginBottom: 16 }}>
          <View style={styles.headerRow}>
            <ScreenTitle>Koledar</ScreenTitle>
            {!showForm && <GhostButton title="+ Proste termine" onPress={() => setShowForm(true)} />}
          </View>
          {showForm && (
            <Card>
              <Field label="Brief">
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                  {briefs.map((b) => (
                    <GhostButton
                      key={b.id}
                      title={b.title}
                      onPress={() => setBriefId(b.id)}
                    />
                  ))}
                </View>
                {briefId ? <Text style={styles.selectedBrief}>Izbrano: {briefs.find((b) => b.id === briefId)?.title}</Text> : null}
              </Field>
              <Field label="Začetek prvega termina (LLLL-MM-DD HH:MM)">
                <Input value={startsAt} onChangeText={setStartsAt} placeholder="2026-09-15 10:00" />
              </Field>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Field label="Število">
                    <Input value={slotCount} onChangeText={setSlotCount} keyboardType="number-pad" />
                  </Field>
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="Trajanje (min)">
                    <Input value={slotDuration} onChangeText={setSlotDuration} keyboardType="number-pad" />
                  </Field>
                </View>
              </View>
              {error && <Text style={styles.error}>{error}</Text>}
              <View style={{ flexDirection: "row", gap: 8 }}>
                <GoldButton title="Ustvari proste termine" onPress={generateSlots} loading={submitting} />
                <GhostButton title="Prekliči" onPress={() => setShowForm(false)} />
              </View>
            </Card>
          )}
        </View>
      }
      ListEmptyComponent={loading ? <ActivityIndicator color={colors.gold} /> : <EmptyState>Ni razpisanih terminov.</EmptyState>}
      renderItem={({ item }) => {
        const talent = one(item.talent);
        const brief = one(item.brief);
        const st = appointmentStatusMeta[item.status];
        const d = new Date(item.starts_at);
        return (
          <Card style={{ marginBottom: 8 }}>
            <View style={styles.spread}>
              <Text style={styles.time}>
                {d.toLocaleDateString()} · {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Text>
              <Badge color={st.color} bg={st.bg}>
                {STATUS_LABEL[item.status] ?? item.status}
              </Badge>
            </View>
            <Text style={[styles.talentName, !talent && { color: colors.textDim }]}>
              {talent ? `${talent.first_name} ${talent.last_name}` : "— prost termin —"}
            </Text>
            <Text style={styles.sub}>
              {TYPE_LABEL[item.type] ?? item.type}
              {brief ? ` · ${brief.title}` : ""}
            </Text>
          </Card>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  spread: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  time: { color: colors.text, fontSize: 13, fontWeight: "500" },
  talentName: { color: colors.text, fontSize: 14, marginBottom: 4 },
  sub: { color: colors.textDim, fontSize: 12 },
  error: { color: colors.red, fontSize: 12.5, marginBottom: 8 },
  selectedBrief: { color: colors.gold, fontSize: 12, marginTop: 8 },
});
