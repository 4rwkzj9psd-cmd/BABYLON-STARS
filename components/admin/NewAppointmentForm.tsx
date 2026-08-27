"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/context";
import { Field, TextInput, inputStyle, goldBtn, ghostBtn } from "@/components/ui/FormPrimitives";
import { AppointmentRow } from "./types";

interface TalentOption {
  id: string;
  first_name: string;
  last_name: string;
}

interface BriefOption {
  id: string;
  title: string;
}

const TYPE_VALUES: AppointmentRow["type"][] = ["audition", "callback", "fitting", "shoot", "meeting", "other"];

export function NewAppointmentForm({ onCreated, onCancel }: { onCreated: () => void; onCancel: () => void }) {
  const { t } = useI18n();
  const ad = t.admin;
  const [mode, setMode] = useState<"single" | "slots">("single");
  const [talents, setTalents] = useState<TalentOption[]>([]);
  const [briefs, setBriefs] = useState<BriefOption[]>([]);
  const [talentId, setTalentId] = useState("");
  const [briefId, setBriefId] = useState("");
  const [type, setType] = useState<AppointmentRow["type"]>("audition");
  const [startsAt, setStartsAt] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [slotCount, setSlotCount] = useState(6);
  const [slotDuration, setSlotDuration] = useState(15);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("talent")
      .select("id,first_name,last_name")
      .order("first_name")
      .then(({ data }) => setTalents((data as TalentOption[]) ?? []));
    supabase
      .from("brief")
      .select("id,title")
      .order("created_at", { ascending: false })
      .then(({ data }) => setBriefs((data as BriefOption[]) ?? []));
  }, []);

  const submitSingle = async () => {
    if (!talentId || !startsAt) {
      setError(ad.appointmentMissingFields);
      return;
    }
    setSubmitting(true);
    const { error: insertError } = await supabase.from("appointment").insert({
      talent_id: talentId,
      brief_id: briefId || null,
      type,
      starts_at: new Date(startsAt).toISOString(),
      location: location.trim() || null,
      notes: notes.trim() || null,
    });
    setSubmitting(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    onCreated();
  };

  const submitSlots = async () => {
    if (!briefId || !startsAt || slotCount < 1 || slotDuration < 1) {
      setError(ad.appointmentMissingFields);
      return;
    }
    setSubmitting(true);
    const first = new Date(startsAt);
    const rows = Array.from({ length: slotCount }).map((_, i) => {
      const start = new Date(first.getTime() + i * slotDuration * 60000);
      const end = new Date(start.getTime() + slotDuration * 60000);
      return {
        talent_id: null,
        brief_id: briefId,
        type,
        starts_at: start.toISOString(),
        ends_at: end.toISOString(),
        location: location.trim() || null,
        notes: notes.trim() || null,
      };
    });
    const { error: insertError } = await supabase.from("appointment").insert(rows);
    setSubmitting(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    onCreated();
  };

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 18, marginBottom: 16 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setMode("single")}
          style={{ ...ghostBtn, ...(mode === "single" ? { borderColor: "var(--gold)", color: "var(--gold)" } : {}) }}
        >
          {ad.singleAppointment}
        </button>
        <button
          onClick={() => setMode("slots")}
          style={{ ...ghostBtn, ...(mode === "slots" ? { borderColor: "var(--gold)", color: "var(--gold)" } : {}) }}
        >
          {ad.generateSlots}
        </button>
      </div>

      {mode === "single" && (
        <Field label={ad.appointmentTalent}>
          <select value={talentId} onChange={(e) => setTalentId(e.target.value)} style={inputStyle}>
            <option value="">—</option>
            {talents.map((tOpt) => (
              <option key={tOpt.id} value={tOpt.id}>
                {tOpt.first_name} {tOpt.last_name}
              </option>
            ))}
          </select>
        </Field>
      )}

      <div style={{ display: "flex", gap: 14 }}>
        <Field label="Tip">
          <select value={type} onChange={(e) => setType(e.target.value as AppointmentRow["type"])} style={inputStyle}>
            {TYPE_VALUES.map((v) => (
              <option key={v} value={v}>
                {ad.appointmentType[v]}
              </option>
            ))}
          </select>
        </Field>
        <Field label={mode === "single" ? ad.appointmentStart : ad.firstSlotStart}>
          <TextInput type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
        </Field>
      </div>

      {mode === "slots" && (
        <div style={{ display: "flex", gap: 14 }}>
          <Field label={ad.slotCount}>
            <TextInput type="number" min={1} max={50} value={slotCount} onChange={(e) => setSlotCount(Number(e.target.value))} />
          </Field>
          <Field label={ad.slotDuration}>
            <TextInput type="number" min={5} max={240} value={slotDuration} onChange={(e) => setSlotDuration(Number(e.target.value))} />
          </Field>
        </div>
      )}

      <Field label={ad.appointmentLocation}>
        <TextInput value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ljubljana, studio..." />
      </Field>

      <Field label={mode === "single" ? ad.appointmentBrief : "Brief"}>
        <select value={briefId} onChange={(e) => setBriefId(e.target.value)} style={inputStyle}>
          <option value="">—</option>
          {briefs.map((b) => (
            <option key={b.id} value={b.id}>
              {b.title}
            </option>
          ))}
        </select>
      </Field>

      <Field label={ad.appointmentNotes}>
        <TextInput value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>

      {mode === "slots" && <p style={{ fontSize: 11.5, color: "var(--text-dim)", marginTop: -8, marginBottom: 12 }}>{ad.slotsHint}</p>}

      {error && (
        <div style={{ marginBottom: 12, padding: "10px 14px", background: "var(--red-bg)", borderRadius: 8, color: "var(--red)", fontSize: 13 }}>
          {error}
        </div>
      )}
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={mode === "single" ? submitSingle : submitSlots}
          disabled={submitting}
          style={{ ...goldBtn, opacity: submitting ? 0.6 : 1 }}
        >
          {mode === "single" ? ad.createAppointment : ad.createSlots}
        </button>
        <button onClick={onCancel} style={ghostBtn}>
          {ad.cancel}
        </button>
      </div>
    </div>
  );
}
