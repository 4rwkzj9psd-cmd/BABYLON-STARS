import { useCallback, useEffect, useState } from "react";
import { Image, Linking as RNLinking, ScrollView, StyleSheet, Text, View } from "react-native";
import { Badge, Card, GhostButton, SectionTitle, EmptyState } from "@/components/ui/Primitives";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { colors, statusMeta, proposalStatusMeta } from "@/lib/theme";

interface TalentRow {
  id: string;
  first_name: string;
  last_name: string;
  city: string;
  country: string | null;
  status: string;
  photo_url: string | null;
  video_url: string | null;
}

interface PhotoRow {
  id: string;
  url: string;
}

interface ProposalRow {
  id: string;
  status: string;
  self_tape_url: string | null;
  brief: { title: string; production: { company_name: string } | { company_name: string }[] | null } | { title: string; production: any }[] | null;
}

interface DocumentRow {
  id: string;
  type: string;
  status: string;
  signed_file_url: string | null;
}

const DOC_TYPE_LABEL: Record<string, string> = {
  representation_agreement: "Pogodba o zastopanju",
  project_contract: "Pogodba za projekt",
  consent_form: "Soglasje",
  guardian_consent: "Soglasje skrbnika",
  other: "Drugo",
};

const DOC_STATUS_LABEL: Record<string, string> = {
  draft: "V pripravi",
  sent: "Poslano v podpis",
  signed: "Podpisano",
  declined: "Zavrnjeno",
  expired: "Poteklo",
};

function one<T>(v: T | T[] | null): T | null {
  if (!v) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}

export default function ProfileScreen() {
  const { talentId, talentFirstName, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [talent, setTalent] = useState<TalentRow | null>(null);
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [proposals, setProposals] = useState<ProposalRow[]>([]);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);

  const load = useCallback(async () => {
    if (!talentId) return;
    setLoading(true);
    const [{ data: t }, { data: ph }, { data: props }, { data: docs }] = await Promise.all([
      supabase.from("talent").select("id,first_name,last_name,city,country,status,photo_url,video_url").eq("id", talentId).single(),
      supabase.from("talent_photo").select("id,url").eq("talent_id", talentId).order("sort_order"),
      supabase
        .from("proposal")
        .select("id,status,self_tape_url,brief(title,production(company_name))")
        .eq("talent_id", talentId)
        .order("proposed_at", { ascending: false }),
      supabase.from("document").select("id,type,status,signed_file_url").eq("talent_id", talentId).order("created_at", { ascending: false }),
    ]);
    setTalent(t as TalentRow | null);
    setPhotos((ph as PhotoRow[]) ?? []);
    setProposals((props as ProposalRow[]) ?? []);
    setDocuments((docs as DocumentRow[]) ?? []);
    setLoading(false);
  }, [talentId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!talentId) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <Text style={{ color: colors.textMuted, fontSize: 14, textAlign: "center", marginBottom: 16, paddingHorizontal: 24 }}>
          Pod tem e-poštnim naslovom nismo našli nobene prijave.
        </Text>
        <GhostButton title="Odjava" onPress={signOut} />
      </View>
    );
  }

  const displayPhotos = photos.length > 0 ? photos.map((p) => p.url) : talent?.photo_url ? [talent.photo_url] : [];
  const st = talent ? statusMeta[talent.status] : null;

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>Živjo, {talentFirstName ?? talent?.first_name}.</Text>
          {talent && (
            <Text style={styles.meta}>
              {talent.city}
              {talent.country ? `, ${talent.country}` : ""}
            </Text>
          )}
        </View>
        <GhostButton title="Odjava" onPress={signOut} />
      </View>

      {st && talent && (
        <Badge color={st.color} bg={st.bg}>
          {{ submitted: "Prijavljen", in_review: "V pregledu", represented: "Predstavljan", not_pursued: "Ni ustrezal", archived: "Arhiviran" }[
            talent.status
          ] ?? talent.status}
        </Badge>
      )}

      <View style={{ height: 24 }} />
      <SectionTitle>Moje fotografije</SectionTitle>
      {displayPhotos.length === 0 ? (
        <EmptyState>Ni fotografij.</EmptyState>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
          {displayPhotos.map((url, i) => (
            <Image key={i} source={{ uri: url }} style={styles.photo} />
          ))}
        </ScrollView>
      )}

      {talent?.video_url && (
        <>
          <View style={{ height: 24 }} />
          <SectionTitle>Moj video / self-tape</SectionTitle>
          <GhostButton title="Ogled videa" onPress={() => RNLinking.openURL(talent.video_url!)} />
        </>
      )}

      <View style={{ height: 24 }} />
      <SectionTitle>Moje prijave na projekte</SectionTitle>
      {loading ? (
        <EmptyState>Nalagam...</EmptyState>
      ) : proposals.length === 0 ? (
        <EmptyState>Še nisi prijavljen/-a na noben odprt projekt.</EmptyState>
      ) : (
        proposals.map((prop) => {
          const brief = one(prop.brief);
          const production = brief ? one(brief.production) : null;
          const pst = proposalStatusMeta[prop.status];
          return (
            <Card key={prop.id} style={{ marginBottom: 8 }}>
              <View style={styles.spread}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{brief?.title ?? "—"}</Text>
                  {production && <Text style={styles.cardSub}>{production.company_name}</Text>}
                </View>
                <Badge color={pst.color} bg={pst.bg}>
                  {{ proposed: "V igri", sent_to_production: "V igri", selected: "Izbran", rejected: "Ni izbran" }[prop.status] ?? prop.status}
                </Badge>
              </View>
              {prop.self_tape_url && (
                <View style={{ marginTop: 10 }}>
                  <GhostButton title="Ogled selfcasta" onPress={() => RNLinking.openURL(prop.self_tape_url!)} />
                </View>
              )}
            </Card>
          );
        })
      )}

      <View style={{ height: 24 }} />
      <SectionTitle>Moje pogodbe in dokumenti</SectionTitle>
      {documents.length === 0 ? (
        <EmptyState>Trenutno nimaš nobenih dokumentov.</EmptyState>
      ) : (
        documents.map((doc) => (
          <Card key={doc.id} style={{ marginBottom: 8 }}>
            <View style={styles.spread}>
              <Text style={styles.cardTitle}>{DOC_TYPE_LABEL[doc.type] ?? doc.type}</Text>
              <Badge color={doc.status === "signed" ? colors.teal : colors.textMuted} bg={doc.status === "signed" ? colors.tealBg : colors.chipBg}>
                {DOC_STATUS_LABEL[doc.status] ?? doc.status}
              </Badge>
            </View>
            {doc.status === "signed" && doc.signed_file_url && (
              <View style={{ marginTop: 10 }}>
                <GhostButton title="Ogled podpisanega dokumenta" onPress={() => RNLinking.openURL(doc.signed_file_url!)} />
              </View>
            )}
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  headerRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12, gap: 12 },
  name: { color: colors.text, fontSize: 22, fontWeight: "600", marginBottom: 4 },
  meta: { color: colors.textMuted, fontSize: 13 },
  photo: { width: 100, height: 100, borderRadius: 10, marginRight: 8, backgroundColor: colors.chipBg },
  spread: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
  cardTitle: { color: colors.text, fontSize: 14, fontWeight: "500" },
  cardSub: { color: colors.textDim, fontSize: 12, marginTop: 2 },
});
