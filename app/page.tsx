"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { StarMark } from "@/components/layout/StarMark";
import styles from "./page.module.css";

const SPOTLIGHT = [
  { img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=520&fit=crop", name: "Luka H.", catKey: "catActor" as const },
  { img: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&h=520&fit=crop", name: "Nika K.", catKey: "catActor" as const },
  { img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=520&fit=crop", name: "Marko N.", catKey: "catCharacter" as const },
  { img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=520&fit=crop", name: "Ana Z.", catKey: "catPerformer" as const },
  { img: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=520&fit=crop", name: "Tina R.", catKey: "catModel" as const },
  { img: "https://images.unsplash.com/photo-1517849845537-4d257902861a?w=400&h=520&fit=crop", name: "Bruno", catKey: "catAnimal" as const },
];

export default function HomePage() {
  const { t } = useI18n();
  const h = t.home;

  return (
    <>
      <Nav ctaHref="/talent-discovery" ctaLabel="submitTalent" />

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.heroStarMark}>
            <StarMark size={44} />
          </div>
          <div className={styles.eyebrow}>{h.heroEyebrow}</div>
          <h1>
            <span>
              {h.heroTitle1}
              <br />
              {h.heroTitle1b}
            </span>
            <br />
            <em>{h.heroTitle2}</em>
          </h1>
          <p className="sub">{h.heroSub}</p>
          <div className={styles.heroCtas}>
            <Link href="/talent-discovery" className="btn btn-gold">
              {h.heroCta1}
            </Link>
            <Link href="/for-productions" className="btn btn-line">
              {h.heroCta2}
            </Link>
          </div>
        </div>
        <div className={styles.heroPhoto}>
          <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&h=1100&fit=crop" alt="" />
        </div>
      </section>

      <section className={styles.process}>
        <div className="wrap">
          <div className={styles.processHead}>
            <h2>{h.processTitle}</h2>
            <p>{h.processSub}</p>
          </div>
          <div className={styles.processRow}>
            <div className={styles.step}>
              <div className={styles.stepNum}>01</div>
              <h3>{h.s1t}</h3>
              <p>{h.s1d}</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNum}>02</div>
              <h3>{h.s2t}</h3>
              <p>{h.s2d}</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNum}>03</div>
              <h3>{h.s3t}</h3>
              <p>{h.s3d}</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNum}>04</div>
              <h3>{h.s4t}</h3>
              <p>{h.s4d}</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.spotlight} id="talents">
        <div className="wrap">
          <div className={styles.spotlightHead}>
            <h2>{h.spotlightTitle}</h2>
            <a href="#">{h.spotlightViewAll}</a>
          </div>
          <div className={styles.spotGrid}>
            {SPOTLIGHT.map((s) => (
              <div className={styles.spotCard} key={s.name}>
                <img src={s.img} alt="" />
                <div className={styles.spotInfo}>
                  <div className="name">{s.name}</div>
                  <div className="role">
                    {h[s.catKey]} {s.catKey !== "catAnimal" && "· Slovenia"}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.mockNote}>{h.spotlightNote}</div>
        </div>
      </section>

      <section className={styles.split}>
        <div className={styles.splitTalents}>
          <h3>{h.splitTalentsTitle}</h3>
          <p>{h.splitTalentsText}</p>
          <Link href="/talent-discovery" className="btn btn-gold">
            {h.splitTalentsCta}
          </Link>
        </div>
        <div className={styles.splitProductions} id="productions">
          <h3>{h.splitProdTitle}</h3>
          <p>{h.splitProdText}</p>
          <Link href="/for-productions" className="btn btn-line">
            {h.splitProdCta}
          </Link>
        </div>
      </section>

      <section className={styles.scouting} id="about">
        <img src="https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=1400&h=700&fit=crop" alt="" />
        <div className={styles.scoutingInner}>
          <h3>{h.scoutingTitle}</h3>
          <p>{h.scoutingText}</p>
          <div className={styles.visionTag}>{h.scoutingTag}</div>
        </div>
      </section>

      <Footer />
    </>
  );
}
