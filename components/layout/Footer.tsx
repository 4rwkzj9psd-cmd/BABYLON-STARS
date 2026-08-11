"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { StarMark } from "./StarMark";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="site-footer">
      <Link href="/" className="logo" style={{ textDecoration: "none" }}>
        <StarMark size={18} />
        Babylon Stars
      </Link>
      <div className="foot-links">
        <Link href="/talent-discovery">{t.nav.talentDiscovery}</Link>
        <Link href="/for-productions">{t.nav.forProductions}</Link>
        <Link href="/projects">{t.nav.projects}</Link>
      </div>
    </footer>
  );
}
