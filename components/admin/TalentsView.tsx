"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, ChevronRight, ChevronLeft, MapPin, Globe } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/context";
import { Badge, TextInput, ghostBtn, inputStyle } from "@/components/ui/FormPrimitives";
import { SelfTape } from "@/components/ui/SelfTape";
import { PhotoGallery } from "@/components/ui/PhotoGallery";
import { TalentRow, STATUS_META } from "./types";

const CATEGORY_VALUES = ["actor", "model", "performer", "character_face", "animal_talent", "no_experience"] as const;

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={{ background: "var(--bg-card)", borderRadius: 10, padding: "14px 18px", minWidth: 120 }}>
      <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, color: "var(--text)", fontWeight: 500 }}>{value}</div>
    </div>
  );
}

export function TalentsView() {
  const { t } = useI18n();
  const ad = t.admin;
  const [talents, setTalents] = useState<TalentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<TalentRow | null>(null);

  const loadTalents = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const { data, error } = await supabase.from("talent").select("*").order("created_at", { ascending: false });
    if (error) setLoadError(error.message);
    else setTalents((data as TalentRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTalents();
  }, [loadTalents]);

  const filtered = talents.filter((tRow) => {
    if (statusFilter !== "all" && tRow.status !== statusFilter) return false;
    if (categoryFilter !== "all" && !(tRow.categories || []).includes(categoryFilter)) return false;
    if (sourceFilter !== "all" && tRow.source !== sourceFilter) return false;
    const q = search.toLowerCase();
    if (q && !`${tRow.first_name} ${tRow.last_name} ${tRow.city}`.toLowerCase().includes(q)) return false;
    return true;
  });

  const updateStatus = async (id: string, status: TalentRow["status"]) => {
    setTalents((ts) => ts.map((tRow) => (tRow.id === id ? { ...tRow, status } : tRow)));
    setSelected((s) => (s && s.id === id ? { ...s, status } : s));
    const { error } = await supabase.from("talent").update({ status }).eq("id", id);
    if (error) {
      alert(`${ad.loadError} ${error.message}`);
      loadTalents();
    }
  };

  const stats = {
    total: talents.length,
    represented: talents.filter((tRow) => tRow.status === "represented").length,
  };

  if (selected) {
    const st = STATUS_META[selected.status];
    return (
      <div>
        <button onClick={() => setSelected(null)} style={{ ...ghostBtn, marginBottom: 20 }}>
          <ChevronLeft size={15} /> {ad.backToList}
        </button>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <PhotoGallery talentId={selected.id} fallbackUrl={selected.photo_url} size={100} />
          <div style={{ flex: 1, minWidth: 220 }}>
            <h2 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 24, color: "var(--text)", marginBottom: 6, fontWeight: 500 }}>
              {selected.first_name} {selected.last_name}
            </h2>
            <div style={{ display: "flex", gap: 14, color: "var(--text-muted)", fontSize: 13, marginBottom: 14, flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <MapPin size={13} />
                {selected.city}, {selected.country}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Globe size={13} />
                {(selected.languages || []).join(", ") || "—"}
              </span>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
              {selected.categories.map((c) => (
                <Badge key={c} color="var(--text-light)" bg="var(--chip-bg)">
                  {c}
                </Badge>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--text-dim)" }}>Status:</span>
              <select
                value={selected.status}
                onChange={(e) => updateStatus(selected.id, e.target.value as TalentRow["status"])}
                style={{ ...inputStyle, width: 180, padding: "6px 10px" }}
              >
                {Object.entries(ad.status).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
              <Badge color={st.color} bg={st.bg}>
                {ad.status[selected.status]}
              </Badge>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 28, background: "var(--bg-card)", borderRadius: 10, padding: 18 }}>
          <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 8 }}>Email / telefon</div>
          <div style={{ fontSize: 14, color: "var(--text-light)" }}>
            {selected.email || "—"} {selected.phone ? `· ${selected.phone}` : ""}
          </div>
        </div>
        {selected.video_url && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 8 }}>Video / self-tape</div>
            <SelfTape url={selected.video_url} label="Ogled videa" />
          </div>
        )}
        {selected.internal_notes && (
          <div style={{ marginTop: 16, background: "var(--bg-card)", borderRadius: 10, padding: 18 }}>
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 8 }}>Interne opombe</div>
            <div style={{ fontSize: 14, color: "var(--text-light)" }}>{selected.internal_notes}</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard label={ad.totalApplications} value={loading ? "…" : stats.total} />
        <StatCard label={ad.represented} value={loading ? "…" : stats.represented} />
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 280 }}>
          <Search size={15} color="var(--text-dim)" style={{ position: "absolute", left: 10, top: 10 }} />
          <TextInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder={ad.searchPlaceholder} style={{ paddingLeft: 32 }} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ ...inputStyle, width: 170 }}>
          <option value="all">{ad.allStatuses}</option>
          {Object.entries(ad.status).map(([k, label]) => (
            <option key={k} value={k}>
              {label}
            </option>
          ))}
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ ...inputStyle, width: 170 }}>
          <option value="all">{ad.allCategories}</option>
          {CATEGORY_VALUES.map((c) => (
            <option key={c} value={c}>
              {t.apply.categories[c]}
            </option>
          ))}
        </select>
        <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} style={{ ...inputStyle, width: 150 }}>
          <option value="all">{ad.allSources}</option>
          <option value="self_submitted">{ad.sourceSelf}</option>
          <option value="scouted">{ad.sourceScouted}</option>
        </select>
        <button onClick={loadTalents} style={{ ...ghostBtn, fontSize: 11 }}>
          {ad.refresh}
        </button>
      </div>

      {loadError && (
        <div style={{ padding: "12px 16px", background: "var(--red-bg)", borderRadius: 8, color: "var(--red)", fontSize: 13, marginBottom: 20 }}>
          {ad.loadError} {loadError}
        </div>
      )}

      <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
        {loading && <div style={{ padding: 32, textAlign: "center", color: "var(--text-dim)", fontSize: 14 }}>{ad.loadingFromDb}</div>}
        {!loading &&
          filtered.map((tRow) => {
            const st = STATUS_META[tRow.status];
            return (
              <div
                key={tRow.id}
                onClick={() => setSelected(tRow)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--border)",
                  cursor: "pointer",
                }}
              >
                {tRow.photo_url ? (
                  <img src={tRow.photo_url} alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--chip-bg)" }} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: "var(--text)" }}>
                    {tRow.first_name} {tRow.last_name}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
                    {tRow.city}, {tRow.country} · {(tRow.categories || []).join(", ")}
                  </div>
                </div>
                <Badge color={st.color} bg={st.bg}>
                  {ad.status[tRow.status]}
                </Badge>
                <ChevronRight size={15} color="var(--text-dim)" />
              </div>
            );
          })}
        {!loading && filtered.length === 0 && (
          <div style={{ padding: 32, textAlign: "center", color: "var(--text-dim)", fontSize: 14 }}>{ad.noResults}</div>
        )}
      </div>
    </>
  );
}
