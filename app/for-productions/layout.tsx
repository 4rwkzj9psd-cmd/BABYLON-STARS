import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Babylon Stars — For Productions",
  description: "Pošlji casting brief in Babylon Stars ti predlaga obstoječe talente ali izvede ciljan discovery.",
};

export default function ForProductionsLayout({ children }: { children: ReactNode }) {
  return children;
}
