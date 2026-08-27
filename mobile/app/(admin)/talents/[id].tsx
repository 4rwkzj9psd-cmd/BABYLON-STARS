import { useCallback, useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Image, Linking as RNLinking, ScrollView, StyleSheet, Text, View } from "react-native";
import { Badge, Card, GhostButton, SectionTitle } from "@/components/ui/Primitives";
import { supabase } from "@/lib/supabase";
import { colors, statusMeta } from "@/lib/theme";

interface TalentRow {
  id: string;
  first_name: string;
  last_name: string;
  city: string;
  country: string | null;
  categories: string[];
  status: string;
  email: string | null;
  phone: string | null;
  video_url: string | null;
  internal_notes: string | null;
}

interface PhotoRow {
  id: string;
  url: string;
}

const STATUS_VALUES = ["submitted", "in_review", "represented", "not_pursued", "archived"];
const STATUS_LABEL: Record<string, string> = {
  submitted: "Prijavljen",
  in_review: "V pregledu",
  represented: "Predstavljan",
  not_pursued: "Ni ustrezal",
  archived: "Arhiviran",
};

export default function TalentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [talent, setTalent] = useState<TalentRow | null>(null);
  const [photos, setPhotos] = useState<PhotoRow[]>([]);

  const load = useCallback(async () => {
    const [{ data: t }, { data: ph }] = await Promise.all([
      supabase.from("talent").select("*").eq("id", id).single(),
      supabase.from("talent_photo").select("id,url").eq("talent_id", id).order("sort_order"),
    ]);
    setTalent(t as TalentRow | null);
    setPhotos((ph as PhotoRow[]) ?? []);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (status: string) => {
    setTalent((t) => (t ? { ...t, status } : t));
    await supabase.from("talent").update({ status }).eq("id", id);
  };

  if (!talent) return null;
  const st = statusMeta[talent.status];

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
      <Text style={styles.name}>
        {talent.first_name} {talent.last_name}
      </Text>
      <Text style={styles.meta}>
        {talent.city}
        {talent.country ? `, ${talent.country}` : ""}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10, marginBottom: 16 }}>
        {(talent.categories || []).map((c) => (
          <Badge key={c} color={colors.textLight} bg={colors.chipBg}>
            {c}
          </Badge>
        ))}
      </View>

      {photos.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {photos.map((p) => (
            <Image key={p.id} source={{ uri: p.url }} style={styles.photo} />
          ))}
        </ScrollView>
      )}

      <SectionTitle>Status</SectionTitle>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
        {STATUS_VALUES.map((s) => (
          <GhostButton key={s} title={STATUS_LABEL[s]} onPress={() => updateStatus(s)} />
        ))}
      </View>
      <Badge color={st.color} bg={st.bg}>
        {STATUS_LABEL[talent.status]}
      </Badge>

      <View style={{ height: 20 }} />
      <Card>
        <Text style={styles.contactLabel}>Email / telefon</Text>
        <Text style={styles.contactValue}>
          {talent.email || "—"} {talent.phone ? `· ${talent.phone}` : ""}
        </Text>
      </Card>

      {talent.video_url && (
        <>
          <View style={{ height: 16 }} />
          <GhostButton title="Ogled videa / self-tape" onPress={() => RNLinking.openURL(talent.video_url!)} />
        </>
      )}

      {talent.internal_notes && (
        <>
          <View style={{ height: 16 }} />
          <Card>
            <Text style={styles.contactLabel}>Interne opombe</Text>
            <Text style={styles.contactValue}>{talent.internal_notes}</Text>
          </Card>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  name: { color: colors.text, fontSize: 22, fontWeight: "600" },
  meta: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  photo: { width: 110, height: 110, borderRadius: 10, marginRight: 8, backgroundColor: colors.chipBg },
  contactLabel: { color: colors.textDim, fontSize: 12, marginBottom: 6 },
  contactValue: { color: colors.textLight, fontSize: 14 },
});
