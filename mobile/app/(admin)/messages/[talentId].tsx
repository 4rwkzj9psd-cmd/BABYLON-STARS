import { useCallback, useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Send } from "lucide-react-native";
import { Input } from "@/components/ui/Primitives";
import { supabase } from "@/lib/supabase";
import { colors } from "@/lib/theme";

interface MessageRow {
  id: string;
  sender: "agency" | "talent";
  body: string;
}

export default function AdminThreadScreen() {
  const { talentId } = useLocalSearchParams<{ talentId: string }>();
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from("message").select("*").eq("talent_id", talentId).order("created_at", { ascending: true });
    setMessages((data as MessageRow[]) ?? []);
  }, [talentId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const channel = supabase
      .channel(`admin-thread-${talentId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "message", filter: `talent_id=eq.${talentId}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new as MessageRow]);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [talentId]);

  const send = async () => {
    if (!draft.trim()) return;
    setSending(true);
    const body = draft.trim();
    setDraft("");
    await supabase.from("message").insert({ talent_id: talentId, sender: "agency", body });
    setSending(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 20, gap: 8 }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.sender === "agency"
                ? { alignSelf: "flex-end", backgroundColor: colors.goldDarkBg }
                : { alignSelf: "flex-start", backgroundColor: colors.bgCard },
            ]}
          >
            <Text style={{ color: item.sender === "agency" ? colors.gold : colors.textLight, fontSize: 14, lineHeight: 20 }}>{item.body}</Text>
          </View>
        )}
      />
      <View style={styles.inputRow}>
        <View style={{ flex: 1 }}>
          <Input value={draft} onChangeText={setDraft} placeholder="Napiši sporočilo..." onSubmitEditing={send} />
        </View>
        <Pressable onPress={send} disabled={sending || !draft.trim()} style={styles.sendBtn}>
          <Send size={18} color="#14131a" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bubble: { maxWidth: "78%", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9 },
  inputRow: { flexDirection: "row", gap: 8, padding: 16, borderTopWidth: 1, borderTopColor: colors.border, alignItems: "center" },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.gold, alignItems: "center", justifyContent: "center" },
});
