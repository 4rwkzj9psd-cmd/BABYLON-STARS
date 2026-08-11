import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Babylon Stars — Odprti projekti",
  description: "Prebrskaj odprte javne casting projekte in se prijavi neposredno, če že imaš profil pri nas.",
};

export default function ProjectsLayout({ children }: { children: ReactNode }) {
  return children;
}
