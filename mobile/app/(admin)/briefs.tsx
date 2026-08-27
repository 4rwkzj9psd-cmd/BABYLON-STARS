import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { Badge, Card, Field, Input, GoldButton, GhostButton, ScreenTitle, EmptyState } from "@/components/ui/Primitives";
import { supabase } from "@/lib/supabase";
import { colors } from "@/lib/theme";

interface ProductionRow {
  id: string;
  company_name: string;
}

interface BriefRow {
  id: string;
  title: string;
  category: string | null;
  deadline: string | null;
  status: string;
  is_public: boolean;
  casting_mode: string;
  production: ProductionRow | ProductionRow[] | null;
}

const CASTING_MODE_LABEL: Record<string, string> = { selfcast: "Selfcast", audition: "Avdicija", both: "Selfcast + avdicija" };

function one<T>(v: T | T[] | null): T | null {
  if (!v) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}

export default function BriefsScreen() {
  const [briefs, setBriefs] = useState<BriefRow[]>([]);
  const [productions, setProductions] = useState<ProductionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [productionName, setProductionName] = useState("");
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: b }, { data: p }] = await Promise.all([
      supabase.from("brief").select("*,production(id,company_name)").order("created_at", { ascending: false }),
      supabase.from("production").select("id,company_name").order("company_name"),
    ]);
    setBriefs((b as BriefRow[]) ?? []);
    setProductions((p as ProductionRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async () => {
    if (!title.trim() || !productionName.trim()) {
      setError("Manjka naslov ali produkcija.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const { data: prod, error: prodError } = await supabase.from("production").insert({ company_name: productionName.trim() }).select("id").single();
      if (prodError) throw prodError;
      const { error: briefError } = await supabase.from("brief").insert({
        production_id: prod.id,
        title: title.trim(),
        is_public: true,
        casting_mode: "selfcast",
      });
      if (briefError) throw briefError;
      setTitle("");
      setProductionName("");
      setShowForm(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
      data={briefs}
      keyExtractor={(b) => b.id}
      ListHeaderComponent={
        <View style={{ marginBottom: 16 }}>
          <View style={styles.headerRow}>
            <ScreenTitle>Briefi</ScreenTitle>
            {!showForm && <GhostButton title="+ Nov brief" onPress={() => setShowForm(true)} />}
          </View>
          {showForm && (
            <Card>
              <Field label="Ime produkcije">
                <Input value={productionName} onChangeText={setProductionName} placeholder="Nordwind Films" />
              </Field>
              <Field label="Naslov briefa">
                <Input value={title} onChangeText={setTitle} placeholder="Kratki film — glavna vloga" />
              </Field>
              {error && <Text style={styles.error}>{error}</Text>}
              <View style={{ flexDirection: "row", gap: 8 }}>
                <GoldButton title="Ustvari" onPress={submit} loading={submitting} />
                <GhostButton title="Prekliči" onPress={() => setShowForm(false)} />
              </View>
              <Text style={styles.hint}>Podrobnejše nastavitve (kategorija, rok, način castinga, javnost) uredi na spletni strani v admin panelu.</Text>
            </Card>
          )}
        </View>
      }
      ListEmptyComponent={loading ? <ActivityIndicator color={colors.gold} /> : <EmptyState>Ni briefov.</EmptyState>}
      renderItem={({ item }) => {
        const production = one(item.production);
        return (
          <Card style={{ marginBottom: 10 }}>
            <View style={styles.spread}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.sub}>
                  {production?.company_name} · {item.category ?? "—"} · rok {item.deadline ?? "—"}
                </Text>
              </View>
              <Badge color={colors.teal} bg={colors.tealBg}>
                {item.status}
              </Badge>
            </View>
            <View style={{ flexDirection: "row", gap: 6, marginTop: 8 }}>
              <Badge color={colors.textLight} bg={colors.chipBg}>{CASTING_MODE_LABEL[item.casting_mode] ?? item.casting_mode}</Badge>
              {item.is_public && (
                <Badge color={colors.textLight} bg={colors.chipBg}>
                  javen
                </Badge>
              )}
            </View>
          </Card>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  spread: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
  title: { color: colors.text, fontSize: 14, fontWeight: "600" },
  sub: { color: colors.textDim, fontSize: 12, marginTop: 4 },
  error: { color: colors.red, fontSize: 12.5, marginBottom: 8 },
  hint: { color: colors.textDim, fontSize: 11, marginTop: 10, lineHeight: 15 },
});
