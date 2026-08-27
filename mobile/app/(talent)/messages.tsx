import { useCallback, useEffect, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Send } from "lucide-react-native";
import { Input, EmptyState } from "@/components/ui/Primitives";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { colors } from "@/lib/theme";

interface MessageRow {
  id: string;
  sender: "agency" | "talent";
  body: string;
  created_at: string;
}

export default function MessagesScreen() {
  const { talentId } = useAuth();
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    if (!talentId) return;
    const { data } = await supabase.from("message").select("*").eq("talent_id", talentId).order("created_at", { ascending: true });
    setMessages((data as MessageRow[]) ?? []);
  }, [talentId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!talentId) return;
    const channel = supabase
      .channel(`mobile-messages-${talentId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "message", filter: `talent_id=eq.${talentId}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new as MessageRow]);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [talentId]);

  const send = async () => {
    if (!talentId || !draft.trim()) return;
    setSending(true);
    const body = draft.trim();
    setDraft("");
    await supabase.from("message").insert({ talent_id: talentId, sender: "talent", body });
    setSending(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 20, gap: 8 }}
        ListEmptyComponent={<EmptyState>Ni še sporočil.</EmptyState>}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.sender === "talent"
                ? { alignSelf: "flex-end", backgroundColor: colors.goldDarkBg }
                : { alignSelf: "flex-start", backgroundColor: colors.bgCard },
            ]}
          >
            <Text style={{ color: item.sender === "talent" ? colors.gold : colors.textLight, fontSize: 14, lineHeight: 20 }}>{item.body}</Text>
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
