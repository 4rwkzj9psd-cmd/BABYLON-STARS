"use client";

import { useI18n } from "@/lib/i18n/context";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { ProjectsView } from "@/components/projects/ProjectsView";
import styles from "./page.module.css";

export default function ProjectsPage() {
  const { t } = useI18n();
  const p = t.projects;

  return (
    <>
      <Nav ctaHref="/talent-discovery" ctaLabel="submitTalent" />

      <div className={styles.pageHead}>
        <div className={styles.eyebrow}>{p.eyebrow}</div>
        <h1>{p.h1}</h1>
        <p>{p.sub}</p>
      </div>

      <ProjectsView />

      <Footer />
    </>
  );
}
