import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Babylon Stars — Moj profil",
  description: "Prijava talenta: oglej si svoj profil, prijave na projekte in dokumente.",
  robots: { index: false, follow: false },
};

export default function PortalLayout({ children }: { children: ReactNode }) {
  return children;
}
