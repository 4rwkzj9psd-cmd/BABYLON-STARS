"use client";

import { useState } from "react";
import { LayoutDashboard, Briefcase, CalendarDays, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/context";
import { StarMark } from "@/components/layout/StarMark";
import { ghostBtn } from "@/components/ui/FormPrimitives";
import { TalentsView } from "./TalentsView";
import { BriefsView } from "./BriefsView";
import { AppointmentsView } from "./AppointmentsView";
import { MessagesView } from "./MessagesView";

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

export function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const { t } = useI18n();
  const ad = t.admin;
  const [tab, setTab] = useState<"talents" | "briefs" | "calendar" | "messages">("talents");

  const logout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

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
