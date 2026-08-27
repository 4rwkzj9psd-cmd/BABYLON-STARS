"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, MapPin, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/context";
import { Badge, goldBtn, inputStyle } from "@/components/ui/FormPrimitives";
import { NewAppointmentForm } from "./NewAppointmentForm";
import { AppointmentRow, APPOINTMENT_STATUS_META, one } from "./types";

const STATUS_VALUES: AppointmentRow["status"][] = ["scheduled", "confirmed", "completed", "cancelled"];

function formatDateHeading(iso: string, locale: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(locale === "sl" ? "sl-SI" : "en-GB", { weekday: "long", day: "numeric", month: "long" });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export function AppointmentsView() {
  const { t, locale } = useI18n();
  const ad = t.admin;
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("appointment")
      .select("*,talent(id,first_name,last_name,photo_url),brief(id,title)")
      .order("starts_at", { ascending: true });
    setAppointments((data as AppointmentRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id: string, status: AppointmentRow["status"]) => {
    setAppointments((rows) => rows.map((r) => (r.id === id ? { ...r, status } : r)));
    await supabase.from("appointment").update({ status }).eq("id", id);
  };

  const groups: { day: string; items: AppointmentRow[] }[] = [];
  for (const appt of appointments) {
    const day = appt.starts_at.slice(0, 10);
    const group = groups.find((g) => g.day === day);
    if (group) group.items.push(appt);
    else groups.push({ day, items: [appt] });
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 20, color: "var(--text)", fontWeight: 500 }}>{ad.calendar}</h2>
        {!showNewForm && (
          <button onClick={() => setShowNewForm(true)} style={goldBtn}>
            <Plus size={15} /> {ad.newAppointment}
          </button>
        )}
      </div>

      {showNewForm && (
        <NewAppointmentForm
          onCancel={() => setShowNewForm(false)}
          onCreated={() => {
            setShowNewForm(false);
            load();
          }}
        />
      )}

      {loading && <div style={{ padding: 32, textAlign: "center", color: "var(--text-dim)", fontSize: 14 }}>{ad.loadingFromDb}</div>}
      {!loading && appointments.length === 0 && (
        <div style={{ padding: 32, textAlign: "center", color: "var(--text-dim)", fontSize: 14 }}>{ad.noAppointments}</div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {groups.map((g) => (
          <div key={g.day}>
            <div
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "var(--gold)",
                marginBottom: 10,
              }}
            >
              {formatDateHeading(g.items[0].starts_at, locale)}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {g.items.map((appt) => {
                const talent = one(appt.talent);
                const brief = one(appt.brief);
                const st = APPOINTMENT_STATUS_META[appt.status];
                return (
                  <div
                    key={appt.id}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, flexWrap: "wrap" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--text)", minWidth: 56 }}>
                      <Clock size={13} color="var(--text-dim)" />
                      {formatTime(appt.starts_at)}
                    </div>
                    <Badge color="var(--text-light)" bg="var(--chip-bg)">
                      {ad.appointmentType[appt.type]}
                    </Badge>
                    <div style={{ flex: 1, minWidth: 140, fontSize: 13.5, color: "var(--text)" }}>
                      {talent ? `${talent.first_name} ${talent.last_name}` : "—"}
                      {brief && <span style={{ color: "var(--text-dim)" }}> · {brief.title}</span>}
                    </div>
                    {appt.location && (
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--text-dim)" }}>
                        <MapPin size={12} />
                        {appt.location}
                      </span>
                    )}
                    <select
                      value={appt.status}
                      onChange={(e) => updateStatus(appt.id, e.target.value as AppointmentRow["status"])}
                      style={{ ...inputStyle, width: 130, padding: "4px 8px", fontSize: 12 }}
                    >
                      {STATUS_VALUES.map((s) => (
                        <option key={s} value={s}>
                          {ad.appointmentStatus[s]}
                        </option>
                      ))}
                    </select>
                    <Badge color={st.color} bg={st.bg}>
                      {ad.appointmentStatus[appt.status]}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
