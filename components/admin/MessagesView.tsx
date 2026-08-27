"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Send } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/context";
import { TextInput, inputStyle, goldBtn } from "@/components/ui/FormPrimitives";

interface MessageRow {
  id: string;
  talent_id: string;
  sender: "agency" | "talent";
  body: string;
  created_at: string;
}

interface TalentOption {
  id: string;
  first_name: string;
  last_name: string;
  photo_url: string | null;
}

export function MessagesView() {
  const { t } = useI18n();
  const ad = t.admin;
  const [talents, setTalents] = useState<TalentOption[]>([]);
  const [threads, setThreads] = useState<Record<string, MessageRow[]>>({});
  const [selectedTalentId, setSelectedTalentId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadAll = useCallback(async () => {
    const [{ data: talentData }, { data: messageData }] = await Promise.all([
      supabase.from("talent").select("id,first_name,last_name,photo_url").order("first_name"),
      supabase.from("message").select("*").order("created_at", { ascending: true }),
    ]);
    setTalents((talentData as TalentOption[]) ?? []);
    const grouped: Record<string, MessageRow[]> = {};
    for (const m of (messageData as MessageRow[]) ?? []) {
      grouped[m.talent_id] = grouped[m.talent_id] ? [...grouped[m.talent_id], m] : [m];
    }
    setThreads(grouped);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    const channel = supabase
      .channel("admin-messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "message" }, (payload) => {
        const m = payload.new as MessageRow;
        setThreads((prev) => ({ ...prev, [m.talent_id]: [...(prev[m.talent_id] ?? []), m] }));
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "nearest" });
  }, [selectedTalentId, threads]);

  const talentsWithThreads = talents
    .map((tOpt) => ({ tOpt, last: threads[tOpt.id]?.[threads[tOpt.id].length - 1] }))
    .filter((x) => x.last)
    .sort((a, b) => (a.last!.created_at < b.last!.created_at ? 1 : -1));

  const otherTalents = talents.filter((tOpt) => !threads[tOpt.id]);

  const send = async () => {
    if (!selectedTalentId || !draft.trim()) return;
    setSending(true);
    const body = draft.trim();
    setDraft("");
    const { error } = await supabase.from("message").insert({ talent_id: selectedTalentId, sender: "agency", body });
    setSending(false);
    if (!error) loadAll();
  };

  const selectedTalent = talents.find((tOpt) => tOpt.id === selectedTalentId);
  const messages = selectedTalentId ? threads[selectedTalentId] ?? [] : [];

  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 20, color: "var(--text)", fontWeight: 500, marginBottom: 20 }}>
        {ad.messages}
      </h2>
      <div style={{ display: "flex", gap: 20, minHeight: 480 }}>
        <div style={{ width: 220, flexShrink: 0, borderRight: "1px solid var(--border)", paddingRight: 16, overflow: "auto" }}>
          {talentsWithThreads.map(({ tOpt, last }) => (
            <div
              key={tOpt.id}
              onClick={() => setSelectedTalentId(tOpt.id)}
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                cursor: "pointer",
                marginBottom: 4,
                background: selectedTalentId === tOpt.id ? "var(--bg-hover)" : "transparent",
              }}
            >
              <div style={{ fontSize: 13, color: "var(--text)" }}>
                {tOpt.first_name} {tOpt.last_name}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--text-dim)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {last!.sender === "agency" ? "Ti: " : ""}
                {last!.body}
              </div>
            </div>
          ))}
          {otherTalents.length > 0 && (
            <>
              <div style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.04em", margin: "16px 0 8px" }}>
                {ad.startConversation}
              </div>
              <select
                value=""
                onChange={(e) => e.target.value && setSelectedTalentId(e.target.value)}
                style={{ ...inputStyle, fontSize: 12, padding: "6px 8px" }}
              >
                <option value="">—</option>
                {otherTalents.map((tOpt) => (
                  <option key={tOpt.id} value={tOpt.id}>
                    {tOpt.first_name} {tOpt.last_name}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {!selectedTalent ? (
            <div style={{ margin: "auto", color: "var(--text-dim)", fontSize: 13.5 }}>{ad.pickConversation}</div>
          ) : (
            <>
              <div style={{ fontSize: 14, color: "var(--text)", marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
                {selectedTalent.first_name} {selectedTalent.last_name}
              </div>
              <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                {messages.length === 0 && <div style={{ color: "var(--text-dim)", fontSize: 13 }}>{ad.noMessages}</div>}
                {messages.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      alignSelf: m.sender === "agency" ? "flex-end" : "flex-start",
                      maxWidth: "70%",
                      background: m.sender === "agency" ? "var(--gold-dark-bg)" : "var(--bg-card)",
                      color: m.sender === "agency" ? "var(--gold)" : "var(--text-light)",
                      padding: "8px 12px",
                      borderRadius: 10,
                      fontSize: 13.5,
                      lineHeight: 1.5,
                    }}
                  >
                    {m.body}
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <TextInput
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder={ad.messagePlaceholder}
                />
                <button onClick={send} disabled={sending || !draft.trim()} style={{ ...goldBtn, opacity: sending || !draft.trim() ? 0.6 : 1 }}>
                  <Send size={15} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
