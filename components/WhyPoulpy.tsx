import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import DecryptedText from "./DecryptedText";
import CornerBrackets from "./CornerBrackets";
import { Target, Brain, Crosshair, TrendingUp, ShieldCheck, Flame, ArrowRight, Play, Film } from "lucide-react";

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
      { label: "Précision", val: "Sub-pixel & 60 FPS" },
      { label: "Erreurs", val: "15 à 20 / session" },
      { label: "Rapport", val: "Fiche Notion" },
    ],
    videoDuration: "00:45 / 01:30",
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
      { label: "Clutch", val: "+45% en 3 sem." },
      { label: "Carte", val: "Prédiction macro" },
      { label: "Décision", val: "Instantanée" },
    ],
    videoDuration: "00:52 / 02:10",
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
      { label: "Routine", val: "20 min KovaaK" },
      { label: "Sensibilité", val: "Calibration cm" },
      { label: "Headshot %", val: "+18% moyen" },
    ],
    videoDuration: "00:38 / 01:45",
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
      { label: "Anti-tilt", val: "Protocole panique" },
      { label: "Sang-froid", val: "BPM stabilisé" },
      { label: "Mentalité", val: "Posture Pro" },
    ],
    videoDuration: "00:40 / 01:20",
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
      { label: "Gain moyen", val: "+350 à +450 RR" },
      { label: "Liaison", val: "Discord 7j/7" },
      { label: "Debriefing", val: "Après match" },
    ],
    videoDuration: "00:55 / 02:00",
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
      { label: "Garantie", val: "+1 division min" },
      { label: "Délai moyen", val: "9 à 14 jours" },
      { label: "Engagement", val: "100% formalisé" },
    ],
    videoDuration: "00:30 / 01:15",
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
              className={`w-[85vw] sm:w-[480px] lg:w-[520px] h-[550px] shrink-0 reticle-box ${
                isAcid ? "" : "reticle-laser"
              } p-6 sm:p-7 space-y-4 bg-[#090c10] border border-white/10 shadow-2xl shadow-black/80 hover:border-[#FF7582]/50 transition-colors duration-200 flex flex-col justify-between group/card relative`}
              style={{
                transform: "translateZ(0)",
              }}
            >
              <CornerBrackets color={isAcid ? "coral" : "slate"} />

              {/* 1. Header: Badge, Pilier #, Icon */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 relative z-10">
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider ${
                      isAcid
                        ? "bg-[#FF7582]/10 text-[#FF7582] border border-[#FF7582]/30"
                        : "bg-[#8FAFD4]/10 text-[#8FAFD4] border border-[#8FAFD4]/30"
                    }`}
                  >
                    {item.badge}
                  </span>
                  <span className="text-xl font-display text-white tracking-wider">
                    PILIER {item.num}
                  </span>
                </div>

                <div
                  className={`w-9 h-9 border flex items-center justify-center ${
                    isAcid
                      ? "border-[#FF7582]/40 text-[#FF7582] bg-[#FF7582]/5"
                      : "border-[#8FAFD4]/40 text-[#8FAFD4] bg-[#8FAFD4]/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              {/* 2. Mini Player Vidéo (Au milieu en haut de chaque vignette) */}
              <div className="relative aspect-video w-full bg-black/90 border border-white/15 overflow-hidden group/player shadow-inner flex flex-col justify-between p-3 relative z-10 transition-all duration-300 group-hover/card:border-[#FF7582]/50">
                {/* Grid & Scanlines */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FF7582]/10 via-transparent to-black pointer-events-none" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:12px_12px] pointer-events-none" />

                {/* Player Top Bar */}
                <div className="relative z-10 flex items-center justify-between text-[9px] font-mono">
                  <span className="bg-black/80 px-2 py-0.5 border border-white/10 text-white/70 flex items-center gap-1.5">
                    <Film className="w-3 h-3 text-[#FF7582]" />
                    <span>EXTRAIT VOD</span>
                  </span>
                  <span className="text-[#FF7582] font-bold tracking-wider">
                    1080P 60FPS
                  </span>
                </div>

                {/* Center Play Button */}
                <div className="relative z-10 flex flex-col items-center justify-center my-auto gap-1.5">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#FF7582]/20 border-2 border-[#FF7582] flex items-center justify-center text-[#FF7582] shadow-[0_0_20px_rgba(255,117,130,0.5)] group-hover/player:scale-110 transition-transform cursor-pointer">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                  <span className="text-[10px] text-white/80 font-display tracking-wider block">
                    CLIP DISPONIBLE TRÈS BIENTÔT
                  </span>
                </div>

                {/* Player Bottom Bar */}
                <div className="relative z-10 flex items-center justify-between text-[8px] font-mono text-white/50">
                  <span className="bg-black/80 px-1.5 py-0.5 border border-white/10">{item.videoDuration}</span>
                  <span className="text-white/40 uppercase">POULPY REPLAY ARCHIVE</span>
                </div>
              </div>

              {/* 3. Card Content: Title, Subtitle, Description */}
              <div className="space-y-1 relative z-10">
                <h3 className="text-lg font-display text-white tracking-wider">
                  {item.title}
                </h3>
                <div className="text-[11px] text-[#FF7582] font-medium">
                  {item.subtitle}
                </div>
                <p className="text-[11px] text-white/60 leading-relaxed line-clamp-2 pt-1">
                  {item.description}
                </p>
              </div>

              {/* 4. Specs Grid */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 relative z-10">
                {item.specs.map((s, sIdx) => (
                  <div key={sIdx} className="p-2 bg-black/80 border border-white/5 space-y-0.5">
                    <span className="text-[8px] text-white/40 uppercase block truncate">
                      {s.label}
                    </span>
                    <strong
                      className={`text-[11px] font-mono font-bold block truncate ${
                        isAcid ? "text-[#FF7582]" : "text-[#8FAFD4]"
                      }`}
                    >
                      {s.val}
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Final Callout Card at End of Scroll */}
        <div
          style={{ transform: "translateZ(0)", contain: "layout style paint" }}
          className="w-[85vw] sm:w-[480px] h-[550px] shrink-0 reticle-box p-8 sm:p-10 flex flex-col justify-between space-y-6 bg-black border border-[#FF7582]/50 relative overflow-hidden shadow-2xl shadow-black/80"
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


