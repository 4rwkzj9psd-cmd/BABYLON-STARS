import { useCallback, useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { Badge, Card, GoldButton, GhostButton, Input, EmptyState } from "@/components/ui/Primitives";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { colors, proposalStatusMeta } from "@/lib/theme";

interface BriefRow {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  deadline: string | null;
  casting_mode: "selfcast" | "audition" | "both";
  production: { company_name: string } | { company_name: string }[] | null;
}

interface ProposalRow {
  id: string;
  brief_id: string;
  status: string;
  self_tape_url: string | null;
}

interface SlotRow {
  id: string;
  starts_at: string;
  location: string | null;
}

function one<T>(v: T | T[] | null): T | null {
  if (!v) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}

function formatSlot(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString() + " · " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const STATUS_LABEL: Record<string, string> = { proposed: "V igri", sent_to_production: "V igri", selected: "Izbran", rejected: "Ni izbran" };

export default function ProjectsScreen() {
  const { talentId } = useAuth();
  const [briefs, setBriefs] = useState<BriefRow[]>([]);
  const [proposals, setProposals] = useState<ProposalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [openBriefId, setOpenBriefId] = useState<string | null>(null);
  const [slots, setSlots] = useState<SlotRow[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [tapeUrl, setTapeUrl] = useState("");
  const [uploadingTape, setUploadingTape] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("brief")
      .select("id,title,description,category,deadline,casting_mode,production(company_name)")
      .eq("is_public", true)
      .eq("status", "open")
      .order("deadline", { ascending: true });
    setBriefs((data as BriefRow[]) ?? []);
    if (talentId) {
      const { data: props } = await supabase.from("proposal").select("id,brief_id,status,self_tape_url").eq("talent_id", talentId);
      setProposals((props as ProposalRow[]) ?? []);
    }
    setLoading(false);
  }, [talentId]);

  useEffect(() => {
    load();
  }, [load]);

  const openApply = (brief: BriefRow) => {
    setError(null);
    setTapeUrl("");
    setSelectedSlot(null);
    setOpenBriefId(brief.id);
    if (brief.casting_mode !== "selfcast") {
      setSlotsLoading(true);
      supabase
        .from("appointment")
        .select("id,starts_at,location")
        .eq("brief_id", brief.id)
        .is("talent_id", null)
        .gte("starts_at", new Date().toISOString())
        .order("starts_at", { ascending: true })
        .then(({ data }) => {
          setSlots((data as SlotRow[]) ?? []);
          setSlotsLoading(false);
        });
    }
  };

  const pickVideo = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError("Dostop do galerije ni dovoljen.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["videos"], quality: 0.7 });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    setUploadingTape(true);
    setError(null);
    try {
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const ext = asset.uri.split(".").pop() || "mp4";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("talent-videos").upload(path, blob, {
        contentType: blob.type || "video/mp4",
      });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("talent-videos").getPublicUrl(path);
      setTapeUrl(data.publicUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setUploadingTape(false);
    }
  };

  const apply = async (brief: BriefRow) => {
    if (!talentId) return;
    setError(null);

    if (selectedSlot) {
      const { data: claimed, error: claimErr } = await supabase
        .from("appointment")
        .update({ talent_id: talentId })
        .eq("id", selectedSlot)
        .is("talent_id", null)
        .select("id");
      if (claimErr) {
        setError(claimErr.message);
        return;
      }
      if (!claimed || claimed.length === 0) {
        setError("Ta termin je bil pravkar zaseden — izberi drugega.");
        openApply(brief);
        return;
      }
    }

    setSubmitting(true);
    const { error: insertError } = await supabase.from("proposal").insert({
      talent_id: talentId,
      brief_id: brief.id,
      origin: "talent",
      self_tape_url: tapeUrl.trim() || null,
    });
    setSubmitting(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setOpenBriefId(null);
    load();
  };

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
      data={briefs}
      keyExtractor={(b) => b.id}
      ListEmptyComponent={loading ? <ActivityIndicator color={colors.gold} /> : <EmptyState>Trenutno ni odprtih projektov.</EmptyState>}
      renderItem={({ item: b }) => {
        const mine = proposals.find((pr) => pr.brief_id === b.id);
        const production = one(b.production);
        const needsSlot = b.casting_mode !== "selfcast";
        const showTape = b.casting_mode !== "audition";
        return (
          <Card style={{ marginBottom: 12 }}>
            <Text style={styles.title}>{b.title}</Text>
            <Text style={styles.sub}>
              {production?.company_name}
              {b.deadline ? ` · rok ${b.deadline}` : ""}
            </Text>
            {b.description && <Text style={styles.desc}>{b.description}</Text>}

            {mine ? (
              <Badge color={proposalStatusMeta[mine.status].color} bg={proposalStatusMeta[mine.status].bg}>
                {STATUS_LABEL[mine.status] ?? mine.status}
              </Badge>
            ) : openBriefId === b.id ? (
              <View>
                {needsSlot && (
                  <View style={{ marginBottom: 12 }}>
                    <Text style={styles.fieldLabel}>Izberi termin za avdicijo</Text>
                    {slotsLoading ? (
                      <ActivityIndicator color={colors.gold} />
                    ) : slots.length === 0 ? (
                      <Text style={styles.sub}>Trenutno ni prostih terminov.</Text>
                    ) : (
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                        {slots.map((s) => (
                          <GhostButton
                            key={s.id}
                            title={formatSlot(s.starts_at)}
                            onPress={() => setSelectedSlot(s.id === selectedSlot ? null : s.id)}
                          />
                        ))}
                      </View>
                    )}
                  </View>
                )}
                {showTape && (
                  <View style={{ marginBottom: 12 }}>
                    <Text style={styles.fieldLabel}>Video avdicija (selfcast) — neobvezno</Text>
                    <Input value={tapeUrl} onChangeText={setTapeUrl} placeholder="prilepi povezavo ..." style={{ marginBottom: 8 }} />
                    <GhostButton
                      title={uploadingTape ? "Nalagam..." : tapeUrl ? "Video naložen ✓" : "ali naloži video iz galerije"}
                      onPress={pickVideo}
                      disabled={uploadingTape}
                    />
                  </View>
                )}
                {error && <Text style={styles.error}>{error}</Text>}
                <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                  <GoldButton title="Prijavi se" onPress={() => apply(b)} loading={submitting} disabled={uploadingTape} />
                  <GhostButton title="Prekliči" onPress={() => setOpenBriefId(null)} />
                </View>
              </View>
            ) : (
              <GoldButton title="Prijavi se na projekt" onPress={() => openApply(b)} />
            )}
          </Card>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 15, fontWeight: "600", marginBottom: 4 },
  sub: { color: colors.textDim, fontSize: 12, marginBottom: 8 },
  desc: { color: colors.textMuted, fontSize: 13, lineHeight: 19, marginBottom: 12 },
  fieldLabel: { color: colors.textDim, fontSize: 12, marginBottom: 8 },
  error: { color: colors.red, fontSize: 12.5, marginBottom: 8 },
});
