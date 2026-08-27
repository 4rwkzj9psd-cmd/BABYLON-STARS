import { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { EmptyState } from "@/components/ui/Primitives";
import { supabase } from "@/lib/supabase";
import { colors } from "@/lib/theme";

interface TalentOption {
  id: string;
  first_name: string;
  last_name: string;
}

interface MessageRow {
  id: string;
  talent_id: string;
  sender: "agency" | "talent";
  body: string;
  created_at: string;
}

export default function MessagesListScreen() {
  const [talents, setTalents] = useState<TalentOption[]>([]);
  const [threads, setThreads] = useState<Record<string, MessageRow[]>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: t }, { data: m }] = await Promise.all([
      supabase.from("talent").select("id,first_name,last_name").order("first_name"),
      supabase.from("message").select("*").order("created_at", { ascending: true }),
    ]);
    setTalents((t as TalentOption[]) ?? []);
    const grouped: Record<string, MessageRow[]> = {};
    for (const msg of (m as MessageRow[]) ?? []) {
      grouped[msg.talent_id] = grouped[msg.talent_id] ? [...grouped[msg.talent_id], msg] : [msg];
    }
    setThreads(grouped);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const withThreads = talents
    .map((t) => ({ t, last: threads[t.id]?.[threads[t.id].length - 1] }))
    .filter((x) => x.last)
    .sort((a, b) => (a.last!.created_at < b.last!.created_at ? 1 : -1));
  const others = talents.filter((t) => !threads[t.id]);

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
      data={withThreads}
      keyExtractor={(x) => x.t.id}
      ListEmptyComponent={loading ? <ActivityIndicator color={colors.gold} /> : <EmptyState>Ni še pogovorov.</EmptyState>}
      renderItem={({ item }) => (
        <Pressable style={styles.row} onPress={() => router.push(`/(admin)/messages/${item.t.id}`)}>
          <Text style={styles.name}>
            {item.t.first_name} {item.t.last_name}
          </Text>
          <Text style={styles.preview} numberOfLines={1}>
            {item.last!.sender === "agency" ? "Ti: " : ""}
            {item.last!.body}
          </Text>
        </Pressable>
      )}
      ListFooterComponent={
        others.length > 0 ? (
          <View style={{ marginTop: 20 }}>
            <Text style={styles.sectionLabel}>Nov pogovor</Text>
            {others.map((t) => (
              <Pressable key={t.id} style={styles.row} onPress={() => router.push(`/(admin)/messages/${t.id}`)}>
                <Text style={styles.name}>
                  {t.first_name} {t.last_name}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  row: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  name: { color: colors.text, fontSize: 14, marginBottom: 2 },
  preview: { color: colors.textDim, fontSize: 12.5 },
  sectionLabel: { color: colors.textDim, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 },
});
