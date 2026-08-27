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
  const [talents, setTalents] = useState<TalentOption[]>([]);
  const [briefs, setBriefs] = useState<BriefOption[]>([]);
  const [talentId, setTalentId] = useState("");
  const [briefId, setBriefId] = useState("");
  const [type, setType] = useState<AppointmentRow["type"]>("audition");
  const [startsAt, setStartsAt] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
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

  const submit = async () => {
    setError(null);
    if (!talentId || !startsAt) {
      setError("Manjka talent ali datum/čas.");
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

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 18, marginBottom: 16 }}>
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
        <Field label={ad.appointmentStart}>
          <TextInput type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
        </Field>
      </div>
      <Field label={ad.appointmentLocation}>
        <TextInput value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ljubljana, studio..." />
      </Field>
      <Field label={ad.appointmentBrief}>
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
      {error && (
        <div style={{ marginBottom: 12, padding: "10px 14px", background: "var(--red-bg)", borderRadius: 8, color: "var(--red)", fontSize: 13 }}>
          {error}
        </div>
      )}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={submit} disabled={submitting} style={{ ...goldBtn, opacity: submitting ? 0.6 : 1 }}>
          {ad.createAppointment}
        </button>
        <button onClick={onCancel} style={ghostBtn}>
          {ad.cancel}
        </button>
      </div>
    </div>
  );
}
