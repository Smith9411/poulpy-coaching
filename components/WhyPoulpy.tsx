import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import DecryptedText from "./DecryptedText";
import CornerBrackets from "./CornerBrackets";
import { Target, Brain, Crosshair, TrendingUp, ShieldCheck, Flame, ArrowRight, Play } from "lucide-react";

const PILLARS = [
  {
    num: "01",
    icon: Target,
    badge: "VOD CHIRURGIE",
    title: "ANALYSE CHIRURGICALE",
    subtitle: "Dissection millimétrique de tes parties",
    description:
      "Nous analysons tes replays en 4K image par image. Chaque élimination subie est décortiquée : micro-déficit d'angle, mauvais tempo de décalage ou exposition inutile.",
    specs: [
      { label: "Précision d'analyse", val: "Sub-pixel & 60 FPS" },
      { label: "Erreurs corrigées", val: "15 à 20 par session" },
      { label: "Rapport", val: "Fiche Notion exportable" },
    ],
    videoDuration: "00:45 • 1080p",
    color: "laser",
  },
  {
    num: "02",
    icon: Brain,
    badge: "VISION TACTIQUE",
    title: "GAME SENSE & MACRO-GAME",
    subtitle: "Anticiper au lieu de subir",
    description:
      "Apprends à décoder les intentions ennemies 15 secondes avant qu'elles ne se produisent. Maîtrise des rotations, timing d'utilitaires et domination psychologique en clutch 1v2+.",
    specs: [
      { label: "Survie en clutch", val: "+45% en 3 semaines" },
      { label: "Lecture de carte", val: "Prédiction macro" },
      { label: "Prise de décision", val: "Instantanée sous stress" },
    ],
    videoDuration: "00:52 • 1080p",
    color: "acid",
  },
  {
    num: "03",
    icon: Crosshair,
    badge: "MÉCANIQUE PURE",
    title: "AIM & BIOMÉCANIQUE",
    subtitle: "La visée au millimètre près",
    description:
      "Programme sur-mesure axé sur la régularité pure : placement du viseur sub-pixel, tracking sans saccade, synchronisation mouvement/tir et posture physique adaptée.",
    specs: [
      { label: "Routine sur-mesure", val: "20 min KovaaK / Aimlabs" },
      { label: "Sensibilité eDPI", val: "Calibration cm/360" },
      { label: "Headshot %", val: "+18% en moyenne" },
    ],
    videoDuration: "00:38 • 1080p",
    color: "laser",
  },
  {
    num: "04",
    icon: Flame,
    badge: "PSYCHOLOGIE DU JOUEUR",
    title: "ANTI-TILT & SANG-FROID",
    subtitle: "Garder le contrôle absolu sous haute pression",
    description:
      "Le talent mécanique ne vaut rien si le mental flanche en prolongation. Travail sur la gestion émotionnelle, les routines respiratoires de match et l'élimination des spirales négatives.",
    specs: [
      { label: "Résistance au tilt", val: "Protocole anti-panique" },
      { label: "Sang-froid mesuré", val: "BPM stabilisé en 1v1" },
      { label: "Mentalité", val: "Posture de compétiteur pro" },
    ],
    videoDuration: "00:40 • 1080p",
    color: "acid",
  },
  {
    num: "05",
    icon: TrendingUp,
    badge: "RÉSULTATS FORMELS",
    title: "PROGRESSION MESURABLE",
    subtitle: "Suivi continu et objectifs clairs",
    description:
      "Un accompagnement rigoureux basé sur tes objectifs réels de compétition. Après chaque session, tes métriques sont mises à jour pour mesurer tes gains de performance tangibles.",
    specs: [
      { label: "Gain moyen", val: "+350 à +450 RR constatés" },
      { label: "Liaison", val: "Canal privé Discord 7j/7" },
      { label: "Debriefing", val: "Suivi continu après match" },
    ],
    videoDuration: "00:55 • 1080p",
    color: "laser",
  },
  {
    num: "06",
    icon: ShieldCheck,
    badge: "CONTRAT DE CONFIANCE",
    title: "GARANTIE DE PALIER",
    subtitle: "Montée en division garantie sous 14 jours",
    description:
      "Si après avoir suivi le protocole et appliqué les routines prescrites tu ne progresses pas en compétition, les séances de recalibrage sont offertes jusqu'à validation de ton objectif.",
    specs: [
      { label: "Garantie", val: "+1 division minimum" },
      { label: "Délai moyen", val: "9 à 14 jours" },
      { label: "Engagement", val: "100% formalisé" },
    ],
    videoDuration: "00:30 • 1080p",
    color: "acid",
  },
];

export default function WhyPoulpy() {
  const pillars = PILLARS;
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const scrollPctRef = useRef<HTMLSpanElement | null>(null);
  const pillBtnsRef = useRef<HTMLButtonElement[]>([]);
  const activeIndexRef = useRef(0);
  const scrollDistanceRef = useRef(2000);

  const updatePills = (activeIdx: number) => {
    pillBtnsRef.current.forEach((btn, idx) => {
      if (!btn) return;
      if (idx === activeIdx) {
        btn.className = "px-2 py-0.5 text-[10px] font-bold border transition-colors cursor-pointer border-[#FF7582] bg-[#FF7582] text-black shadow-[0_0_10px_rgba(255,117,130,0.4)]";
      } else {
        btn.className = "px-2 py-0.5 text-[10px] font-bold border transition-colors cursor-pointer border-white/15 text-white/50 hover:border-white/40 hover:text-white bg-black/40";
      }
    });
  };

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    let ctx: gsap.Context | null = null;

    const setupScroll = () => {
      if (ctx) ctx.revert();

      const maxScroll = Math.max(0, track.scrollWidth - window.innerWidth + 120);
      const totalScrollDistance = Math.max(2000, maxScroll * 1.5);
      scrollDistanceRef.current = totalScrollDistance;

      ctx = gsap.context(() => {
        gsap.to(track, {
          x: () => -maxScroll,
          ease: "none",
          scrollTrigger: {
            id: "whypoulpy-scroll",
            trigger: section,
            start: "top top",
            end: () => `+=${totalScrollDistance}`,
            pin: true,
            pinSpacing: true,
            scrub: 0.5,
            anticipatePin: 0,
            invalidateOnRefresh: true,
            onUpdate: (self: { progress: number }) => {
              const progress = self.progress;
              if (scrollPctRef.current) {
                scrollPctRef.current.textContent = `${Math.round(progress * 100)}%`;
              }
              if (progressBarRef.current) {
                progressBarRef.current.style.transform = `scaleX(${progress})`;
              }

              const idx = Math.min(5, Math.floor(progress * 6));
              if (idx !== activeIndexRef.current) {
                activeIndexRef.current = idx;
                updatePills(idx);
              }
            },
          },
        });
      }, section);
    };

    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(() => {
        setupScroll();
        ScrollTrigger.refresh();
      });
    } else {
      setupScroll();
    }

    const handleResize = () => {
      setupScroll();
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      if (ctx) ctx.revert();
    };
  }, []);

  const goToCard = (index: number) => {
    const section = sectionRef.current;
    if (!section) return;

    const targetProgress = index / (pillars.length - 1);
    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    const targetY = sectionTop + targetProgress * scrollDistanceRef.current;

    window.scrollTo({ top: targetY, behavior: "smooth" });
  };

  return (
    <section
      id="coaching"
      ref={sectionRef}
      className="relative w-full h-screen bg-[#07090D] border-t border-[rgba(255,255,255,0.08)] font-mono overflow-hidden flex flex-col justify-between pt-16 sm:pt-20 pb-6 sm:pb-8 z-20"
    >
      {/* Top Telemetry Bar */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-12 flex flex-wrap items-center justify-between gap-4 pb-2 z-20">
        <div className="flex items-center gap-3">
          <span className="data-badge data-badge-acid">
            <DecryptedText text="POURQUOI CHOISIR POULPY ? // 06 PILIERS" />
          </span>
          <span className="text-white/40 text-xs hidden md:inline-flex items-center">
            <span className="w-1.5 h-1.5 bg-[#FF7582] animate-ping" />
          </span>
        </div>

        {/* Pill Navigation & Live Progress */}
        <div className="flex items-center gap-4 text-xs">
          {/* Direct Card Jump Pills */}
          <div className="flex items-center gap-1.5">
            {pillars.map((p, idx) => (
              <button
                key={p.num}
                ref={(el) => {
                  if (el) pillBtnsRef.current[idx] = el;
                }}
                onClick={() => goToCard(idx)}
                className={`px-2 py-0.5 text-[10px] font-bold border transition-colors cursor-pointer ${
                  idx === 0
                    ? "border-[#FF7582] bg-[#FF7582] text-black shadow-[0_0_10px_rgba(255,117,130,0.4)]"
                    : "border-white/15 text-white/50 hover:border-white/40 hover:text-white bg-black/40"
                }`}
              >
                {p.num}
              </button>
            ))}
          </div>

          <span className="text-white/40 hidden sm:inline">AVANCEMENT :</span>
          <span ref={scrollPctRef} className="text-[#FF7582] font-bold">0%</span>
          <div className="w-24 sm:w-32 h-1.5 bg-white/10 border border-white/15 relative overflow-hidden">
            <div
              ref={progressBarRef}
              className="h-full w-full bg-[#FF7582] shadow-[0_0_10px_#FF7582] origin-left will-change-transform"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
        </div>
      </div>

      {/* Horizontal Sliding Track */}
      <div
        ref={trackRef}
        className="flex items-center w-max pl-6 sm:pl-12 pr-32 space-x-8 sm:space-x-12 my-auto select-none will-change-transform transform-gpu"
        style={{
          willChange: "transform",
          transform: "translate3d(0, 0, 0)",
          backfaceVisibility: "hidden",
        }}
      >
        {pillars.map((item) => {
          const Icon = item.icon;
          const isAcid = item.color === "acid";

          return (
            <div
              key={item.num}
              className={`w-[85vw] sm:w-[500px] lg:w-[560px] h-[520px] shrink-0 reticle-box ${
                isAcid ? "" : "reticle-laser"
              } p-8 sm:p-10 space-y-6 bg-[#090c10] border border-white/10 shadow-2xl shadow-black/80 transition-colors duration-150 flex flex-col justify-between ${
                isAcid ? "hover:border-[#FF7582]/50" : "hover:border-[#8FAFD4]/50"
              }`}
              style={{
                transform: "translateZ(0)",
              }}
            >
              <CornerBrackets color={isAcid ? "coral" : "slate"} />

              <div>
                {/* Card Header with Mini Player in upper-middle */}
                <div className="flex items-start justify-between border-b border-white/10 pb-4 relative z-10 gap-2">
                  <div className="space-y-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider ${
                        isAcid
                          ? "bg-[#FF7582]/10 text-[#FF7582] border border-[#FF7582]/30"
                          : "bg-[#8FAFD4]/10 text-[#8FAFD4] border border-[#8FAFD4]/30"
                      }`}
                    >
                      {item.badge}
                    </span>
                    <div className="text-4xl sm:text-6xl font-display text-white tracking-wider">
                      {item.num}
                    </div>
                  </div>

                  {/* Mini Player au milieu en haut dans l'espace disponible */}
                  <div className="flex items-center gap-2.5 p-1.5 sm:p-2 bg-black/90 border border-white/15 hover:border-[#FF7582]/60 transition-colors group/mini cursor-pointer self-center shadow-lg">
                    <div className="relative w-14 sm:w-16 h-9 sm:h-10 bg-[#07090D] border border-white/20 flex items-center justify-center overflow-hidden shrink-0">
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:6px_6px] pointer-events-none" />
                      <div className="w-5 h-5 rounded-full bg-[#FF7582]/20 border border-[#FF7582] flex items-center justify-center text-[#FF7582] group-hover/mini:scale-110 transition-transform shadow-[0_0_8px_rgba(255,117,130,0.5)]">
                        <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                      </div>
                    </div>
                    <div className="space-y-0.5 text-left pr-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF7582] animate-pulse" />
                        <span className="text-[9px] font-bold text-white tracking-wider font-mono uppercase">VOD CLIP</span>
                      </div>
                      <span className="text-[8px] text-white/50 font-mono block">{item.videoDuration}</span>
                    </div>
                  </div>

                  <div
                    className={`w-12 h-12 border flex items-center justify-center shrink-0 ${
                      isAcid
                        ? "border-[#FF7582]/40 text-[#FF7582] bg-[#FF7582]/5"
                        : "border-[#8FAFD4]/40 text-[#8FAFD4] bg-[#8FAFD4]/5"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                </div>

                {/* Card Body */}
                <div className="space-y-2 pt-4 relative z-10">
                  <h3 className="text-2xl font-display text-white tracking-wider">
                    {item.title}
                  </h3>
                  <div className="text-xs text-[#FF7582] font-medium">
                    {item.subtitle}
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed pt-2">
                    {item.description}
                  </p>
                </div>
              </div>

              <div>
                {/* Specs & Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-4 border-t border-white/10 relative z-10">
                  {item.specs.map((s, sIdx) => (
                    <div key={sIdx} className="p-2.5 bg-black/80 border border-white/5 space-y-1">
                      <span className="text-[9px] text-white/40 uppercase block truncate">
                        {s.label}
                      </span>
                      <strong
                        className={`text-xs font-mono font-bold block ${
                          isAcid ? "text-[#FF7582]" : "text-[#8FAFD4]"
                        }`}
                      >
                        {s.val}
                      </strong>
                    </div>
                  ))}
                </div>

                {/* Footer Indicator */}
                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40 relative z-10">
                  <span>PILIER {item.num} // 06</span>
                  
                  <div className="flex items-center gap-2 text-white/50 font-mono text-[10px] uppercase">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF7582] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF7582]" />
                    </span>
                    <span className="text-[#FF7582] font-bold">EXTRAIT DISPONIBLE</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Final Callout Card at End of Scroll */}
        <div
          style={{ transform: "translateZ(0)", contain: "layout style paint" }}
          className="w-[85vw] sm:w-[480px] h-[520px] shrink-0 reticle-box p-8 sm:p-10 flex flex-col justify-between space-y-6 bg-black border border-[#FF7582]/50 relative overflow-hidden shadow-2xl shadow-black/80"
        >
          <div className="space-y-3 relative z-10">
            <span className="data-badge data-badge-acid">PRÊT POUR L&apos;ASCENSION ?</span>
            <h3 className="text-3xl sm:text-4xl font-display text-white tracking-wider">
              LE PROCHAIN PALIER C&apos;EST MAINTENANT.
            </h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Ne perds plus des mois à tourner en rond en ranked. Réserve ton premier audit dès aujourd&apos;hui.
            </p>
          </div>

          <div className="pt-6 border-t border-white/10 relative z-10">
            <a
              href="#tarifs"
              className="btn-cyber-primary w-full justify-center text-xs py-3"
            >
              <span>DÉCOUVRIR LES TARIFS</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 flex items-center justify-end text-[10px] text-white/30 z-20">
        <span className="text-[#FF3E4D] font-mono">DÉROULEZ LA PAGE VERS LE BAS ↓</span>
      </div>
    </section>
  );
}


