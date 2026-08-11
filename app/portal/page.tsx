"use client";

import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { TalentPortal } from "@/components/portal/TalentPortal";

export default function PortalPage() {
  return (
    <>
      <Nav ctaHref="/apply" ctaLabel="submitTalent" />
      <TalentPortal />
      <Footer />
    </>
  );
}
