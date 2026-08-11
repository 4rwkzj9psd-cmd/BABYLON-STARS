"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/context";
import { Badge, goldBtn, inputStyle } from "@/components/ui/FormPrimitives";
import { NewBriefForm } from "./NewBriefForm";
import { BriefRow, ProposalRow, ProductionRow, PROPOSAL_STATUS_META, one } from "./types";

export function BriefsView() {
  const { t } = useI18n();
  const ad = t.admin;
  const [briefs, setBriefs] = useState<BriefRow[]>([]);
  const [proposalsByBrief, setProposalsByBrief] = useState<Record<string, ProposalRow[]>>({});
  const [productions, setProductions] = useState<ProductionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: briefData }, { data: prodData }] = await Promise.all([
      supabase.from("brief").select("*,production(id,company_name)").order("created_at", { ascending: false }),
      supabase.from("production").select("id,company_name").order("company_name"),
    ]);
    const briefRows = (briefData as BriefRow[]) ?? [];
    setBriefs(briefRows);
    setProductions((prodData as ProductionRow[]) ?? []);

    if (briefRows.length > 0) {
      const { data: proposalData } = await supabase
        .from("proposal")
        .select("*,talent(id,first_name,last_name,photo_url)")
        .in(
          "brief_id",
          briefRows.map((b) => b.id)
        );
      const grouped: Record<string, ProposalRow[]> = {};
      for (const row of (proposalData as ProposalRow[]) ?? []) {
        grouped[row.brief_id] = grouped[row.brief_id] ? [...grouped[row.brief_id], row] : [row];
      }
      setProposalsByBrief(grouped);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateProposalStatus = async (proposalId: string, status: ProposalRow["status"]) => {
    await supabase.from("proposal").update({ status }).eq("id", proposalId);
    load();
  };

  const notify = async (proposalId: string) => {
    await supabase.from("proposal").update({ notified_at: new Date().toISOString() }).eq("id", proposalId);
    load();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 20, color: "var(--text)", fontWeight: 500 }}>{ad.briefs}</h2>
        {!showNewForm && (
          <button onClick={() => setShowNewForm(true)} style={goldBtn}>
            <Plus size={15} /> {ad.newBrief}
          </button>
        )}
      </div>

      {showNewForm && (
        <NewBriefForm
          productions={productions}
          onCancel={() => setShowNewForm(false)}
          onCreated={() => {
            setShowNewForm(false);
            load();
          }}
        />
      )}

      {loading && <div style={{ padding: 32, textAlign: "center", color: "var(--text-dim)", fontSize: 14 }}>{ad.loadingFromDb}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {!loading &&
          briefs.map((b) => {
            const production = one(b.production);
            const proposals = proposalsByBrief[b.id] ?? [];
            return (
              <div key={b.id} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 15, color: "var(--text)", marginBottom: 4 }}>{b.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
                      {production?.company_name} · {b.category ?? "—"} · rok {b.deadline ?? "—"} {b.is_public && "· javen"}
                    </div>
                  </div>
                  <Badge color="var(--teal)" bg="var(--teal-bg)">
                    {b.status}
                  </Badge>
                </div>

                <div style={{ marginTop: 14 }}>
                  {proposals.length === 0 && <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{ad.noProposals}</span>}
                  {proposals.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {proposals.map((p) => {
                        const talent = one(p.talent);
                        if (!talent) return null;
                        return (
                          <div
                            key={p.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "8px 10px",
                              background: "var(--bg-alt)",
                              borderRadius: 8,
                              flexWrap: "wrap",
                            }}
                          >
                            {talent.photo_url ? (
                              <img src={talent.photo_url} alt="" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }} />
                            ) : (
                              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--chip-bg)" }} />
                            )}
                            <div style={{ flex: 1, fontSize: 13, color: "var(--text)" }}>
                              {talent.first_name} {talent.last_name}
                            </div>
                            <span style={{ fontSize: 10.5, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                              {p.origin === "talent" ? "Prijava talenta" : "Predlog agencije"}
                            </span>
                            <select
                              value={p.status}
                              onChange={(e) => updateProposalStatus(p.id, e.target.value as ProposalRow["status"])}
                              style={{ ...inputStyle, width: 150, padding: "4px 8px", fontSize: 12 }}
                            >
                              {Object.entries(ad.proposalStatus).map(([k, label]) => (
                                <option key={k} value={k}>
                                  {label}
                                </option>
                              ))}
                            </select>
                            {(p.status === "selected" || p.status === "rejected") &&
                              (p.notified_at ? (
                                <Badge color={PROPOSAL_STATUS_META[p.status].color} bg={PROPOSAL_STATUS_META[p.status].bg}>
                                  {ad.notified}
                                </Badge>
                              ) : (
                                <button onClick={() => notify(p.id)} style={{ ...goldBtn, padding: "6px 12px", fontSize: 11 }}>
                                  {ad.notify}
                                </button>
                              ))}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
