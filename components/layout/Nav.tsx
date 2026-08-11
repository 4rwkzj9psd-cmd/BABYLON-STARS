"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { StarMark } from "./StarMark";

interface NavProps {
  ctaHref: string;
  ctaLabel: "submitTalent" | "submitBrief";
}

export function Nav({ ctaHref, ctaLabel }: NavProps) {
  const [open, setOpen] = useState(false);
  const { t, locale, setLocale } = useI18n();
  const pathname = usePathname();

  const menuItems = [
    { href: "/for-productions", label: t.nav.forProductions },
    { href: "/talent-discovery", label: t.nav.talentDiscovery },
    { href: "/projects", label: t.nav.projects },
    { href: "/portal", label: t.nav.portal },
    { href: "/#about", label: t.nav.about },
  ];

  return (
    <>
      <nav className="site-nav">
        <Link href="/" className="logo">
          <span
            id="star-trigger"
            className={open ? "open" : ""}
            onClick={(e) => {
              e.preventDefault();
              setOpen((o) => !o);
            }}
          >
            <StarMark size={24} />
          </span>
          Babylon Stars
        </Link>
        <div className="nav-right">
          <div className="lang-switch">
            <button className={locale === "sl" ? "active" : ""} onClick={() => setLocale("sl")}>
              SL
            </button>
            <button className={locale === "en" ? "active" : ""} onClick={() => setLocale("en")}>
              EN
            </button>
          </div>
          <Link href={ctaHref} className="btn btn-gold">
            {t.nav[ctaLabel]}
          </Link>
        </div>
      </nav>

      <div
        id="star-menu-overlay"
        className={open ? "open" : ""}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false);
        }}
      >
        <div className="menu-tag">{t.nav.menu}</div>
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            style={pathname === item.href ? { color: "var(--gold)" } : undefined}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </>
  );
}
