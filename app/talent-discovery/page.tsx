"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import styles from "./page.module.css";

export default function TalentDiscoveryPage() {
  const { t } = useI18n();
  const td = t.talentDiscovery;

  return (
    <>
      <Nav ctaHref="/apply" ctaLabel="submitTalent" />

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}>{td.eyebrow}</div>
          <h1>{td.h1}</h1>
          <p className="sub">{td.sub}</p>
          <div>
            <Link href="/apply" className="btn btn-gold">
              {td.cta}
            </Link>
          </div>
        </div>
        <div className={styles.heroPhoto}>
          <img src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=900&h=1100&fit=crop" alt="" />
        </div>
      </section>

      <section className={styles.expect}>
        <div className="wrap">
          <div className={styles.expectHead}>
            <h2>{td.expectTitle}</h2>
            <p>{td.expectSub}</p>
          </div>
          <div className={styles.expectGrid}>
            <div className={styles.expectItem}>
              <div className={styles.expectIcon}>🌍</div>
              <h4>{td.expect1t}</h4>
              <p>{td.expect1d}</p>
            </div>
            <div className={styles.expectItem}>
              <div className={styles.expectIcon}>✦</div>
              <h4>{td.expect2t}</h4>
              <p>{td.expect2d}</p>
            </div>
            <div className={styles.expectItem}>
              <div className={styles.expectIcon}>🎬</div>
              <h4>{td.expect3t}</h4>
              <p>{td.expect3d}</p>
            </div>
            <div className={styles.expectItem}>
              <div className={styles.expectIcon}>🤝</div>
              <h4>{td.expect4t}</h4>
              <p>{td.expect4d}</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.applySteps}>
        <div className="wrap">
          <h2>{td.stepsTitle}</h2>
          <div className={styles.stepsRow}>
            <div className={styles.stepCard}>
              <div className="n">01</div>
              <h4>{td.steps1t}</h4>
              <p>{td.steps1d}</p>
            </div>
            <div className={styles.stepCard}>
              <div className="n">02</div>
              <h4>{td.steps2t}</h4>
              <p>{td.steps2d}</p>
            </div>
            <div className={styles.stepCard}>
              <div className="n">03</div>
              <h4>{td.steps3t}</h4>
              <p>{td.steps3d}</p>
            </div>
            <div className={styles.stepCard}>
              <div className="n">04</div>
              <h4>{td.steps4t}</h4>
              <p>{td.steps4d}</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.ctaBand}>
        <h3>{td.ctaTitle}</h3>
        <p>{td.ctaSub}</p>
        <Link href="/#about" className="btn btn-line">
          {td.ctaBtn}
        </Link>
      </section>

      <Footer />
    </>
  );
}
