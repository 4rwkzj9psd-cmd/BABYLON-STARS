import { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Badge, Input, EmptyState } from "@/components/ui/Primitives";
import { supabase } from "@/lib/supabase";
import { colors, statusMeta } from "@/lib/theme";

interface TalentInfo {
  id: string;
  first_name: string;
  last_name: string;
  city: string;
  country: string | null;
  categories: string[];
  photo_url: string | null;
}

interface AgencyTalentRow {
  id: string;
  talent_id: string;
  status: string;
  talent: TalentInfo | TalentInfo[] | null;
}

interface TalentListItem {
  agencyTalentId: string;
  talentId: string;
  first_name: string;
  last_name: string;
  city: string;
  country: string | null;
  categories: string[];
  status: string;
  photo_url: string | null;
}

function one<T>(v: T | T[] | null): T | null {
  if (!v) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}

const STATUS_LABEL: Record<string, string> = {
  submitted: "Prijavljen",
  in_review: "V pregledu",
  represented: "Predstavljan",
  not_pursued: "Ni ustrezal",
  archived: "Arhiviran",
};

export default function TalentsListScreen() {
  const [talents, setTalents] = useState<TalentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("agency_talent")
      .select("id,talent_id,status,talent(id,first_name,last_name,city,country,categories,photo_url)")
      .order("created_at", { ascending: false });
    const rows = ((data as AgencyTalentRow[]) ?? [])
      .map((row): TalentListItem | null => {
        const talent = one(row.talent);
        if (!talent) return null;
        return {
          agencyTalentId: row.id,
          talentId: row.talent_id,
          status: row.status,
          first_name: talent.first_name,
          last_name: talent.last_name,
          city: talent.city,
          country: talent.country,
          categories: talent.categories,
          photo_url: talent.photo_url,
        };
      })
      .filter((row): row is TalentListItem => row !== null);
    setTalents(rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = talents.filter((t) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return `${t.first_name} ${t.last_name} ${t.city}`.toLowerCase().includes(q);
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Skupaj</Text>
            <Text style={styles.statValue}>{loading ? "…" : talents.length}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Predstavljanih</Text>
            <Text style={styles.statValue}>{loading ? "…" : talents.filter((t) => t.status === "represented").length}</Text>
          </View>
        </View>
        <Input value={search} onChangeText={setSearch} placeholder="Išči po imenu, mestu..." />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(t) => t.agencyTalentId}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        ListEmptyComponent={loading ? <ActivityIndicator color={colors.gold} /> : <EmptyState>Ni zadetkov.</EmptyState>}
        renderItem={({ item }) => {
          const st = statusMeta[item.status];
          return (
            <Pressable style={styles.row} onPress={() => router.push(`/(admin)/talents/${item.agencyTalentId}`)}>
              {item.photo_url ? (
                <Image source={{ uri: item.photo_url }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, { backgroundColor: colors.chipBg }]} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>
                  {item.first_name} {item.last_name}
                </Text>
                <Text style={styles.sub}>
                  {item.city}, {item.country} · {(item.categories || []).join(", ")}
                </Text>
              </View>
              <Badge color={st.color} bg={st.bg}>
                {STATUS_LABEL[item.status] ?? item.status}
              </Badge>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  stat: { backgroundColor: colors.bgCard, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, flex: 1 },
  statLabel: { color: colors.textDim, fontSize: 11, marginBottom: 2 },
  statValue: { color: colors.text, fontSize: 18, fontWeight: "600" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  name: { color: colors.text, fontSize: 14 },
  sub: { color: colors.textDim, fontSize: 12, marginTop: 2 },
});
