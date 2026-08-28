import { useCallback, useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Image, Linking as RNLinking, ScrollView, StyleSheet, Text, View } from "react-native";
import { Badge, Card, GhostButton, SectionTitle } from "@/components/ui/Primitives";
import { supabase } from "@/lib/supabase";
import { colors, statusMeta } from "@/lib/theme";

interface TalentInfo {
  id: string;
  first_name: string;
  last_name: string;
  city: string;
  country: string | null;
  categories: string[];
  email: string | null;
  phone: string | null;
  video_url: string | null;
}

interface AgencyTalentDetail {
  id: string;
  talent_id: string;
  status: string;
  internal_notes: string | null;
  talent: TalentInfo | TalentInfo[] | null;
}

interface PhotoRow {
  id: string;
  url: string;
}

function one<T>(v: T | T[] | null): T | null {
  if (!v) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
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
  const { id: agencyTalentId } = useLocalSearchParams<{ id: string }>();
  const [row, setRow] = useState<AgencyTalentDetail | null>(null);
  const [photos, setPhotos] = useState<PhotoRow[]>([]);

  const load = useCallback(async () => {
    const { data: at } = await supabase
      .from("agency_talent")
      .select("id,talent_id,status,internal_notes,talent(id,first_name,last_name,city,country,categories,email,phone,video_url)")
      .eq("id", agencyTalentId)
      .single();
    setRow(at as AgencyTalentDetail | null);
    const talentId = one((at as AgencyTalentDetail | null)?.talent ?? null)?.id;
    if (talentId) {
      const { data: ph } = await supabase.from("talent_photo").select("id,url").eq("talent_id", talentId).order("sort_order");
      setPhotos((ph as PhotoRow[]) ?? []);
    }
  }, [agencyTalentId]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (status: string) => {
    setRow((r) => (r ? { ...r, status } : r));
    await supabase.from("agency_talent").update({ status }).eq("id", agencyTalentId);
  };

  const talent = row ? one(row.talent) : null;
  if (!row || !talent) return null;
  const st = statusMeta[row.status];

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
        {STATUS_LABEL[row.status]}
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

      {row.internal_notes && (
        <>
          <View style={{ height: 16 }} />
          <Card>
            <Text style={styles.contactLabel}>Interne opombe</Text>
            <Text style={styles.contactValue}>{row.internal_notes}</Text>
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
