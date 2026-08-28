"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Loader2, Video, Check, Clock } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/context";
import { Badge, TextInput, goldBtn, ghostBtn } from "@/components/ui/FormPrimitives";
import { SelfTape } from "@/components/ui/SelfTape";

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
  casting_mode: "selfcast" | "audition" | "both";
  production: { company_name: string } | { company_name: string }[] | null;
}

interface ProposalRow {
  id: string;
  talent_id: string;
  brief_id: string;
  status: "proposed" | "sent_to_production" | "selected" | "rejected";
  notified_at: string | null;
  self_tape_url: string | null;
}

interface SlotRow {
  id: string;
  starts_at: string;
  location: string | null;
}

function productionName(p: BriefRow["production"]) {
  if (!p) return "";
  if (Array.isArray(p)) return p[0]?.company_name ?? "";
  return p.company_name;
}

function formatSlot(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" }) + " · " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
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
  const [session, setSession] = useState<Session | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authTalent, setAuthTalent] = useState<{ id: string; name: string } | null>(null);
  const [briefs, setBriefs] = useState<BriefRow[]>([]);
  const [proposals, setProposals] = useState<ProposalRow[]>([]);
  const [myAppointments, setMyAppointments] = useState<{ brief_id: string | null; starts_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applyPanel, setApplyPanel] = useState<string | null>(null);
  const [tapeUrl, setTapeUrl] = useState("");
  const [uploadingTape, setUploadingTape] = useState(false);
  const [slots, setSlots] = useState<SlotRow[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const effectiveTalentId = authTalent ? authTalent.id : talentId.trim();

  useEffect(() => {
    supabase
      .from("brief")
      .select("id,title,description,category,deadline,casting_mode,production(company_name)")
      .eq("is_public", true)
      .eq("status", "open")
      .order("deadline", { ascending: true })
      .then(({ data }) => {
        setBriefs((data as BriefRow[] | null) ?? []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCheckingAuth(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setAuthTalent(null);
      return;
    }
    supabase
      .from("talent")
      .select("id,first_name")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        const row = data?.[0];
        setAuthTalent(row ? { id: row.id, name: row.first_name } : null);
      });
  }, [session]);

  const loadProposals = useCallback((id: string) => {
    if (!id) {
      setProposals([]);
      setMyAppointments([]);
      return;
    }
    supabase
      .from("proposal")
      .select("id,talent_id,brief_id,status,notified_at,self_tape_url")
      .eq("talent_id", id)
      .then(({ data }) => setProposals((data as ProposalRow[] | null) ?? []));
    supabase
      .from("appointment")
      .select("brief_id,starts_at")
      .eq("talent_id", id)
      .then(({ data }) => setMyAppointments(data ?? []));
  }, []);

  useEffect(() => {
    loadProposals(effectiveTalentId);
  }, [effectiveTalentId, loadProposals]);

  const loadSlots = useCallback((briefId: string) => {
    setSlotsLoading(true);
    supabase
      .from("appointment")
      .select("id,starts_at,location")
      .eq("brief_id", briefId)
      .is("talent_id", null)
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .then(({ data }) => {
        setSlots((data as SlotRow[] | null) ?? []);
        setSlotsLoading(false);
      });
  }, []);

  const openApplyPanel = (brief: BriefRow) => {
    setError(null);
    setTapeUrl("");
    setSelectedSlot(null);
    setApplyPanel(brief.id);
    if (brief.casting_mode !== "selfcast") loadSlots(brief.id);
  };

  const handleTapeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setError(p.tapeTypeError);
      return;
    }
    setUploadingTape(true);
    setError(null);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("talent-videos").upload(path, file);
    setUploadingTape(false);
    if (uploadError) {
      setError(uploadError.message);
      return;
    }
    const { data: publicUrlData } = supabase.storage.from("talent-videos").getPublicUrl(path);
    setTapeUrl(publicUrlData.publicUrl);
  };

  const applyToBrief = async (brief: BriefRow) => {
    setError(null);

    if (selectedSlot) {
      const { data: claimed, error: claimError } = await supabase.rpc("claim_open_slot", {
        p_slot_id: selectedSlot,
        p_talent_id: effectiveTalentId,
      });
      if (claimError) {
        setError(claimError.message);
        return;
      }
      if (!claimed) {
        setError(p.slotTaken);
        loadSlots(brief.id);
        setSelectedSlot(null);
        return;
      }
    }

    setApplying(brief.id);
    const { error: insertError } = await supabase.from("proposal").insert({
      talent_id: effectiveTalentId,
      brief_id: brief.id,
      origin: "talent",
      self_tape_url: tapeUrl.trim() || null,
    });
    setApplying(null);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setApplyPanel(null);
    setTapeUrl("");
    setSelectedSlot(null);
    loadProposals(effectiveTalentId);
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const statusLabel = (s: ProposalRow["status"]) =>
    s === "selected" ? p.statusSelected : s === "rejected" ? p.statusRejected : p.statusProposed;

  const notifications = proposals.filter((pr) => (pr.status === "selected" || pr.status === "rejected") && pr.notified_at);

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 40px 90px" }}>
      {!checkingAuth && authTalent && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 30, flexWrap: "wrap" }}>
          <Badge color="var(--teal)" bg="var(--teal-bg)">{p.signedInAs(authTalent.name)}</Badge>
          <button onClick={logout} style={{ ...ghostBtn, fontSize: 11, padding: "6px 12px" }}>
            {p.notYou}
          </button>
        </div>
      )}

      {!checkingAuth && !authTalent && (
        <>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <label style={{ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 6 }}>{p.talentIdLabel}</label>
              <TextInput value={talentId} onChange={(e) => setTalentId(e.target.value)} placeholder={p.talentIdPlaceholder} />
            </div>
          </div>
          <div style={{ fontSize: 11, color: "var(--placeholder)", marginBottom: 12 }}>{p.demoNote}</div>
          <div style={{ fontSize: 12, marginBottom: 30 }}>
            <Link href="/portal" style={{ color: "var(--gold)" }}>
              {p.orSignIn}
            </Link>
          </div>
        </>
      )}

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
          const myAppointment = myAppointments.find((a) => a.brief_id === b.id);
          const needsSlot = b.casting_mode === "audition" || b.casting_mode === "both";
          const showTape = b.casting_mode === "selfcast" || b.casting_mode === "both";
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
              {!effectiveTalentId ? (
                <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{p.chooseFirst}</span>
              ) : mine ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
                  <Badge color={STATUS_COLORS[mine.status].color} bg={STATUS_COLORS[mine.status].bg}>
                    {statusLabel(mine.status)}
                  </Badge>
                  {myAppointment && (
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "var(--teal)" }}>
                      <Clock size={13} /> {p.slotBooked(formatSlot(myAppointment.starts_at))}
                    </span>
                  )}
                  {mine.self_tape_url && (
                    <div style={{ maxWidth: 360, width: "100%" }}>
                      <SelfTape url={mine.self_tape_url} label={p.viewSelfTape} />
                    </div>
                  )}
                </div>
              ) : applyPanel === b.id ? (
                <div style={{ background: "var(--bg-hover)", borderRadius: 8, padding: 14, maxWidth: 420 }}>
                  {needsSlot && (
                    <div style={{ marginBottom: showTape ? 16 : 12 }}>
                      <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 8 }}>{p.pickSlotLabel}</div>
                      {slotsLoading ? (
                        <div style={{ fontSize: 12.5, color: "var(--text-dim)" }}>{p.loading}</div>
                      ) : slots.length === 0 ? (
                        <div style={{ fontSize: 12.5, color: "var(--text-dim)" }}>{p.noSlots}</div>
                      ) : (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {slots.map((s) => (
                            <button
                              key={s.id}
                              onClick={() => setSelectedSlot(s.id === selectedSlot ? null : s.id)}
                              style={{
                                padding: "7px 12px",
                                borderRadius: 20,
                                fontSize: 12.5,
                                cursor: "pointer",
                                border: selectedSlot === s.id ? "1px solid var(--gold)" : "1px solid var(--input-border)",
                                background: selectedSlot === s.id ? "var(--gold-dark-bg)" : "transparent",
                                color: selectedSlot === s.id ? "var(--gold)" : "var(--text-light)",
                              }}
                            >
                              {formatSlot(s.starts_at)}
                              {s.location ? ` · ${s.location}` : ""}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {showTape && (
                    <>
                      <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 8 }}>{p.selfTapeLabel}</div>
                      <TextInput
                        value={tapeUrl}
                        onChange={(e) => setTapeUrl(e.target.value)}
                        placeholder={p.selfTapePlaceholder}
                        style={{ marginBottom: 8 }}
                      />
                      <label
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 11.5,
                          color: "var(--gold)",
                          cursor: "pointer",
                          marginBottom: 12,
                        }}
                      >
                        <Video size={13} />
                        {uploadingTape ? p.uploadingTape : tapeUrl ? p.tapeReady : p.uploadTape}
                        {tapeUrl && !uploadingTape && <Check size={13} color="var(--teal)" />}
                        <input type="file" accept="video/*" onChange={handleTapeFile} disabled={uploadingTape} style={{ display: "none" }} />
                      </label>
                    </>
                  )}

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      disabled={applying === b.id || uploadingTape}
                      onClick={() => applyToBrief(b)}
                      style={{ ...goldBtn, opacity: applying === b.id || uploadingTape ? 0.6 : 1 }}
                    >
                      {p.applyBtn}
                    </button>
                    <button onClick={() => setApplyPanel(null)} style={ghostBtn}>
                      {p.cancelApply}
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => openApplyPanel(b)} style={goldBtn}>
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
