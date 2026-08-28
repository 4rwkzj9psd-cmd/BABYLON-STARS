"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { LayoutDashboard, Briefcase, CalendarDays, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/context";
import { StarMark } from "@/components/layout/StarMark";
import { ghostBtn } from "@/components/ui/FormPrimitives";
import { TalentsView } from "./TalentsView";
import { BriefsView } from "./BriefsView";
import { AppointmentsView } from "./AppointmentsView";
import { MessagesView } from "./MessagesView";
import { CompleteAgencySetup } from "./CompleteAgencySetup";
import { BillingGate } from "./BillingGate";

interface AgencyRow {
  subscription_status: "trialing" | "active" | "past_due" | "canceled";
  trial_ends_at: string;
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 10px",
        borderRadius: 8,
        cursor: "pointer",
        marginBottom: 4,
        color: active ? "var(--text)" : "var(--text-muted)",
        background: active ? "var(--bg-hover)" : "transparent",
        fontSize: 13,
      }}
    >
      {icon}
      {label}
    </div>
  );
}

export function AdminPanel({ session, onLogout }: { session: Session; onLogout: () => void }) {
  const { t } = useI18n();
  const ad = t.admin;
  const [tab, setTab] = useState<"talents" | "briefs" | "calendar" | "messages">("talents");
  const [agency, setAgency] = useState<AgencyRow | null>(null);
  const [checkingAgency, setCheckingAgency] = useState(true);

  const isStaff = session.user.app_metadata?.role === "staff";

  useEffect(() => {
    if (!isStaff) {
      setCheckingAgency(false);
      return;
    }
    supabase
      .from("agency")
      .select("subscription_status,trial_ends_at")
      .single()
      .then(({ data }) => {
        setAgency((data as AgencyRow) ?? null);
        setCheckingAgency(false);
      });
  }, [isStaff]);

  const logout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  if (!isStaff) {
    return <CompleteAgencySetup onDone={() => window.location.reload()} />;
  }

  if (checkingAgency) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "120px 0" }}>
        <StarMark size={28} />
      </div>
    );
  }

  if (agency) {
    const trialExpired = agency.subscription_status === "trialing" && new Date(agency.trial_ends_at) < new Date();
    if (trialExpired) return <BillingGate reason="trial_expired" onLogout={logout} />;
    if (agency.subscription_status === "past_due") return <BillingGate reason="past_due" onLogout={logout} />;
    if (agency.subscription_status === "canceled") return <BillingGate reason="canceled" onLogout={logout} />;
  }

  return (
    <div style={{ display: "flex", minHeight: 640 }}>
      <div style={{ width: 200, borderRight: "1px solid var(--border)", padding: "24px 16px", flexShrink: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32, padding: "0 8px" }}>
            <StarMark size={16} />
            <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>Admin</span>
          </div>
          <NavItem icon={<LayoutDashboard size={16} />} label={ad.talents} active={tab === "talents"} onClick={() => setTab("talents")} />
          <NavItem icon={<Briefcase size={16} />} label={ad.briefs} active={tab === "briefs"} onClick={() => setTab("briefs")} />
          <NavItem icon={<CalendarDays size={16} />} label={ad.calendar} active={tab === "calendar"} onClick={() => setTab("calendar")} />
          <NavItem icon={<MessageCircle size={16} />} label={ad.messages} active={tab === "messages"} onClick={() => setTab("messages")} />
        </div>
        <button onClick={logout} style={{ ...ghostBtn, fontSize: 11 }}>
          {ad.logout}
        </button>
      </div>

      <div style={{ flex: 1, padding: "24px 32px", overflow: "auto" }}>
        {tab === "talents" && <TalentsView />}
        {tab === "briefs" && <BriefsView />}
        {tab === "calendar" && <AppointmentsView />}
        {tab === "messages" && <MessagesView />}
      </div>
    </div>
  );
}
