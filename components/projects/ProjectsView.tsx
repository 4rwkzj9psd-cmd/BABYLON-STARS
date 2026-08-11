"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/context";
import { Badge, TextInput, goldBtn } from "@/components/ui/FormPrimitives";

function NotificationStar({ size = 13, color = "var(--red)" }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ display: "inline-block", verticalAlign: -1, marginRight: 6 }}
    >
      <path fill={color} d="M50 2 L58 42 L98 50 L58 58 L50 98 L42 58 L2 50 L42 42 Z" />
    </svg>
  );
}

interface BriefRow {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  deadline: string | null;
  production: { company_name: string } | { company_name: string }[] | null;
}

interface ProposalRow {
  id: string;
  talent_id: string;
  brief_id: string;
  status: "proposed" | "sent_to_production" | "selected" | "rejected";
  notified_at: string | null;
}

function productionName(p: BriefRow["production"]) {
  if (!p) return "";
  if (Array.isArray(p)) return p[0]?.company_name ?? "";
  return p.company_name;
}

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  proposed: { color: "var(--teal)", bg: "var(--teal-bg)" },
  sent_to_production: { color: "var(--teal)", bg: "var(--teal-bg)" },
  selected: { color: "var(--red)", bg: "var(--red-bg)" },
  rejected: { color: "var(--brown)", bg: "var(--brown-bg)" },
};

export function ProjectsView() {
  const { t } = useI18n();
  const p = t.projects;

  const [talentId, setTalentId] = useState("");
  const [briefs, setBriefs] = useState<BriefRow[]>([]);
  const [proposals, setProposals] = useState<ProposalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("brief")
      .select("id,title,description,category,deadline,production(company_name)")
      .eq("is_public", true)
      .eq("status", "open")
      .order("deadline", { ascending: true })
      .then(({ data }) => {
        setBriefs((data as BriefRow[] | null) ?? []);
        setLoading(false);
      });
  }, []);

  const loadProposals = useCallback((id: string) => {
    if (!id.trim()) {
      setProposals([]);
      return;
    }
    supabase
      .from("proposal")
      .select("id,talent_id,brief_id,status,notified_at")
      .eq("talent_id", id.trim())
      .then(({ data }) => setProposals((data as ProposalRow[] | null) ?? []));
  }, []);

  useEffect(() => {
    loadProposals(talentId);
  }, [talentId, loadProposals]);

  const applyToBrief = async (briefId: string) => {
    setError(null);
    setApplying(briefId);
    const { error: insertError } = await supabase.from("proposal").insert({
      talent_id: talentId.trim(),
      brief_id: briefId,
      origin: "talent",
    });
    setApplying(null);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    loadProposals(talentId);
  };

  const statusLabel = (s: ProposalRow["status"]) =>
    s === "selected" ? p.statusSelected : s === "rejected" ? p.statusRejected : p.statusProposed;

  const notifications = proposals.filter((pr) => (pr.status === "selected" || pr.status === "rejected") && pr.notified_at);

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 40px 90px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <label style={{ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 6 }}>{p.talentIdLabel}</label>
          <TextInput value={talentId} onChange={(e) => setTalentId(e.target.value)} placeholder={p.talentIdPlaceholder} />
        </div>
      </div>
      <div style={{ fontSize: 11, color: "var(--placeholder)", marginBottom: 30 }}>{p.demoNote}</div>

      {error && (
        <div style={{ marginBottom: 20, padding: "12px 16px", background: "var(--red-bg)", borderRadius: 8, color: "var(--red)", fontSize: 13 }}>
          {error}
        </div>
      )}

      {notifications.length > 0 && (
        <div style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 10 }}>
          {notifications.map((pr) => {
            const brief = briefs.find((b) => b.id === pr.brief_id);
            if (!brief) return null;
            const selected = pr.status === "selected";
            return (
              <div
                key={pr.id}
                style={{
                  padding: "14px 16px",
                  background: selected ? "var(--red-bg)" : "var(--bg-hover)",
                  border: `1px solid ${selected ? "#4a2320" : "var(--input-border)"}`,
                  borderRadius: 8,
                  fontSize: 13.5,
                  color: selected ? "var(--red)" : "var(--text-muted)",
                }}
              >
                {selected && <NotificationStar />}
                {selected ? p.selectedMsg(brief.title, productionName(brief.production)) : p.rejectedMsg(brief.title)}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-dim)", fontSize: 13.5, padding: "20px 0" }}>
            <Loader2 className="spin" size={16} />
            {p.loading}
          </div>
        )}
        {!loading && briefs.length === 0 && <div style={{ color: "var(--text-dim)", fontSize: 13.5 }}>{p.noProjects}</div>}
        {briefs.map((b) => {
          const mine = proposals.find((pr) => pr.brief_id === b.id);
          return (
            <div key={b.id} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 12, flexWrap: "wrap" }}>
                <div style={{ fontSize: 16, color: "var(--text)" }}>{b.title}</div>
                {b.category && <Badge color="var(--text-light)" bg="var(--chip-bg)">{b.category}</Badge>}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 10 }}>
                {productionName(b.production)} {b.deadline && `· ${p.deadline} ${b.deadline}`}
              </div>
              {b.description && <div style={{ fontSize: 13.5, color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.55 }}>{b.description}</div>}
              {!talentId.trim() ? (
                <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{p.chooseFirst}</span>
              ) : mine ? (
                <Badge color={STATUS_COLORS[mine.status].color} bg={STATUS_COLORS[mine.status].bg}>
                  {statusLabel(mine.status)}
                </Badge>
              ) : (
                <button disabled={applying === b.id} onClick={() => applyToBrief(b.id)} style={{ ...goldBtn, opacity: applying === b.id ? 0.6 : 1 }}>
                  {p.applyBtn}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
