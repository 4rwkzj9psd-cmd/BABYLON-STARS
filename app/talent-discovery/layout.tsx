import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Babylon Stars — Talent Discovery",
  description: "Pridruži se skupnosti talentov. Ustvari profil in postani viden produkcijam po svetu.",
};

export default function TalentDiscoveryLayout({ children }: { children: ReactNode }) {
  return children;
}
