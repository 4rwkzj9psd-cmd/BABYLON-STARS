import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Babylon Stars — Registracija agencije",
  description: "Registriraj svojo casting agencijo na Babylon Stars — 14 dni brezplačno.",
};

export default function SignupLayout({ children }: { children: ReactNode }) {
  return children;
}
