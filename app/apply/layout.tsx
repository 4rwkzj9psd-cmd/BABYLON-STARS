import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Babylon Stars — Prijavi svoj profil",
  description: "Ustvari svoj talent profil pri Babylon Stars — brez izkušenj je popolnoma v redu.",
};

export default function ApplyLayout({ children }: { children: ReactNode }) {
  return children;
}
