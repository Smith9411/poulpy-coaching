import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import DecryptedText from "./DecryptedText";
import CornerBrackets from "./CornerBrackets";
import { Target, Brain, Crosshair, TrendingUp, ShieldCheck, Flame, ArrowRight, Play, RotateCcw } from "lucide-react";

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
  const cardFlippersRef = useRef<(HTMLDivElement | null)[]>([]);
  const activeIndexRef = useRef(0);
  const scrollDistanceRef = useRef(3800);

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

  const handleCardClick = (idx: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const el = cardFlippersRef.current[idx];
    if (!el) return;
    const currentRot = (gsap.getProperty(el, "rotateY") as number) || 0;
    const normalized = ((currentRot % 360) + 360) % 360;
    const isFlipped = normalized > 90 && normalized < 270;
    gsap.to(el, {
      rotateY: isFlipped ? 0 : 180,
      duration: 0.6,
      ease: "power2.out",
      overwrite: "auto",
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
      const items = Array.from(track.children) as HTMLElement[];
      if (items.length === 0) return;

      const firstItemLeft = items[0].offsetLeft;
      const cardPositions = items.map((el) => Math.min(maxScroll, Math.max(0, el.offsetLeft - firstItemLeft)));

      // Calibrated scroll distance: snappy pacing without trailing dead zone
      const totalScrollDistance = Math.max(2800, maxScroll * 2.2);
      scrollDistanceRef.current = totalScrollDistance;

      ctx = gsap.context(() => {
        // Reset all card flippers to 0 on context mount
        cardFlippersRef.current.forEach((el) => {
          if (el) gsap.set(el, { rotateY: 0, y: 0 });
        });

        const tl = gsap.timeline({
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

              // Active pill navigation indicator
              const activeIdx = Math.min(
                5,
                progress < 0.16 ? 0
                  : progress < 0.32 ? 1
                  : progress < 0.48 ? 2
                  : progress < 0.64 ? 3
                  : progress < 0.80 ? 4
                  : 5
              );
              if (activeIdx !== activeIndexRef.current) {
                activeIndexRef.current = activeIdx;
                updatePills(activeIdx);
              }
            },
          },
        });

        // 1. Initial Rest Window on Section Arrival (Card 0 is 100% resting on front face)
        tl.to(track, { x: 0, duration: 0.3, ease: "none" });

        // 2. Card 0: Progressive Flip & Observation Window
        if (cardFlippersRef.current[0]) {
          tl.to(cardFlippersRef.current[0], { rotateY: 180, duration: 0.5, ease: "power2.inOut" });
          tl.to(cardFlippersRef.current[0], { y: -22, duration: 0.25, yoyo: true, repeat: 1, ease: "power1.inOut" }, "<");
        }
        tl.to(track, { x: 0, duration: 0.3, ease: "none" });

        // 3. Move to Card 1 -> Flip & Observe
        tl.to(track, { x: -cardPositions[1], duration: 0.6, ease: "power1.inOut" });
        if (cardFlippersRef.current[1]) {
          tl.to(cardFlippersRef.current[1], { rotateY: 180, duration: 0.5, ease: "power2.inOut" });
          tl.to(cardFlippersRef.current[1], { y: -22, duration: 0.25, yoyo: true, repeat: 1, ease: "power1.inOut" }, "<");
        }
        tl.to(track, { x: -cardPositions[1], duration: 0.3, ease: "none" });

        // 4. Move to Card 2 -> Flip & Observe
        tl.to(track, { x: -cardPositions[2], duration: 0.6, ease: "power1.inOut" });
        if (cardFlippersRef.current[2]) {
          tl.to(cardFlippersRef.current[2], { rotateY: 180, duration: 0.5, ease: "power2.inOut" });
          tl.to(cardFlippersRef.current[2], { y: -22, duration: 0.25, yoyo: true, repeat: 1, ease: "power1.inOut" }, "<");
        }
        tl.to(track, { x: -cardPositions[2], duration: 0.3, ease: "none" });

        // 5. Move to Card 3 -> Flip & Observe
        tl.to(track, { x: -cardPositions[3], duration: 0.6, ease: "power1.inOut" });
        if (cardFlippersRef.current[3]) {
          tl.to(cardFlippersRef.current[3], { rotateY: 180, duration: 0.5, ease: "power2.inOut" });
          tl.to(cardFlippersRef.current[3], { y: -22, duration: 0.25, yoyo: true, repeat: 1, ease: "power1.inOut" }, "<");
        }
        tl.to(track, { x: -cardPositions[3], duration: 0.3, ease: "none" });

        // 6. Move to Card 4 -> Flip & Observe
        tl.to(track, { x: -cardPositions[4], duration: 0.6, ease: "power1.inOut" });
        if (cardFlippersRef.current[4]) {
          tl.to(cardFlippersRef.current[4], { rotateY: 180, duration: 0.5, ease: "power2.inOut" });
          tl.to(cardFlippersRef.current[4], { y: -22, duration: 0.25, yoyo: true, repeat: 1, ease: "power1.inOut" }, "<");
        }
        tl.to(track, { x: -cardPositions[4], duration: 0.3, ease: "none" });

        // 7. Move to Card 5 -> Flip & Observe
        tl.to(track, { x: -cardPositions[5], duration: 0.6, ease: "power1.inOut" });
        if (cardFlippersRef.current[5]) {
          tl.to(cardFlippersRef.current[5], { rotateY: 180, duration: 0.5, ease: "power2.inOut" });
          tl.to(cardFlippersRef.current[5], { y: -22, duration: 0.25, yoyo: true, repeat: 1, ease: "power1.inOut" }, "<");
        }
        tl.to(track, { x: -cardPositions[5], duration: 0.3, ease: "none" });

        // 8. Move to Final CTA Callout Card (Immediately releases pin at end of motion)
        tl.to(track, { x: -maxScroll, duration: 0.6, ease: "power1.inOut" });
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

    const cardTargetProgress = [0.07, 0.23, 0.39, 0.55, 0.71, 0.87];
    const targetProgress = cardTargetProgress[index] ?? (index / 5) * 0.85;
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
        {pillars.map((item, idx) => {
          const Icon = item.icon;
          const isAcid = item.color === "acid";

          return (
            <div
              key={item.num}
              className="w-[85vw] sm:w-[500px] lg:w-[560px] h-[520px] shrink-0 relative cursor-pointer group/card"
              onClick={(e) => handleCardClick(idx, e)}
              style={{
                perspective: "1400px",
                transform: "translateZ(0)",
              }}
            >
              <div
                ref={(el) => {
                  if (el) cardFlippersRef.current[idx] = el;
                }}
                style={{
                  transformStyle: "preserve-3d",
                  WebkitTransformStyle: "preserve-3d",
                  transformOrigin: "50% 50%",
                  willChange: "transform",
                  transform: "rotateY(0deg) translateZ(0px)",
                }}
                className="w-full h-full relative"
              >
                {/* ======================================================== */}
                {/* FACE AVANT (FRONT) */}
                {/* ======================================================== */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "rotateY(0deg) translateZ(1px)",
                    willChange: "transform",
                    transformStyle: "preserve-3d",
                    WebkitTransformStyle: "preserve-3d",
                  }}
                  className={`reticle-box ${
                    isAcid ? "" : "reticle-laser"
                  } p-8 sm:p-10 space-y-6 bg-[#090c10] border border-white/10 shadow-2xl shadow-black/80 transition-colors duration-150 flex flex-col justify-between ${
                    isAcid ? "hover:border-[#FF7582]/50" : "hover:border-[#8FAFD4]/50"
                  }`}
                >
                  <CornerBrackets color={isAcid ? "coral" : "slate"} />

                  <div>
                    {/* Card Header */}
                    <div className="flex items-start justify-between border-b border-white/10 pb-4 relative z-10">
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

                      <div
                        className={`w-12 h-12 border flex items-center justify-center ${
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
                        <span className="text-[#FF7582] font-bold">EXTRAIT VOD DISPONIBLE</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ======================================================== */}
                {/* FACE ARRIÈRE (BACK - LECTEUR CLIP VIDÉO) */}
                {/* ======================================================== */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "rotateY(180deg) translateZ(1px)",
                    willChange: "transform",
                    transformStyle: "preserve-3d",
                    WebkitTransformStyle: "preserve-3d",
                  }}
                  className="reticle-box p-6 sm:p-8 bg-[#090C12] border-2 border-[#FF7582] shadow-[0_0_35px_rgba(255,117,130,0.3)] flex flex-col justify-between"
                >
                  <CornerBrackets color="coral" />

                  {/* Back Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 relative z-10">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#FF7582] text-black text-[9px] font-bold px-2 py-0.5 uppercase tracking-widest">
                        EXTRAIT VOD // PILIER {item.num}
                      </span>
                      <span className="text-xs text-white/70 font-display hidden sm:inline">
                        {item.title}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleCardClick(idx, e)}
                      className="btn-cyber-ghost text-[10px] py-1.5 px-3 flex items-center gap-1.5 hover:border-[#FF7582] hover:text-[#FF7582] cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>RETOUR [✕]</span>
                    </button>
                  </div>

                  {/* Video Mockup Container */}
                  <div className="relative my-auto aspect-video w-full bg-black/90 border border-white/20 flex flex-col items-center justify-center overflow-hidden group/player shadow-inner z-10">
                    {/* Scanlines / Grid effect */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FF7582]/10 via-transparent to-black pointer-events-none" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

                    {/* Play Button with breathing rings */}
                    <div className="relative z-10 flex flex-col items-center gap-3">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#FF7582]/20 border-2 border-[#FF7582] flex items-center justify-center text-[#FF7582] shadow-[0_0_25px_rgba(255,117,130,0.5)] group-hover/player:scale-110 transition-transform cursor-pointer">
                        <Play className="w-6 h-6 fill-current ml-1" />
                      </div>
                      <div className="text-center space-y-0.5">
                        <span className="text-xs font-bold font-display tracking-wider text-white block">
                          CLIP VOD DISPONIBLE TRÈS BIENTÔT
                        </span>
                        <span className="text-[10px] text-white/50 font-mono block">
                          Format vidéo YouTube // 1080p 60 FPS
                        </span>
                      </div>
                    </div>

                    {/* Bottom bar overlay */}
                    <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[9px] font-mono text-white/60 z-10">
                      <span className="bg-black/80 px-2 py-0.5 border border-white/10">00:45 / 01:30</span>
                      <span className="text-[#FF7582] font-bold">COACH POULPY REPLAY ARCHIVE</span>
                    </div>
                  </div>

                  {/* Back Footer (Clean Single-Line Note) */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs relative z-10">
                    <span className="text-[10px] text-white/60 truncate">
                      Démonstration : <strong className="text-white">{item.subtitle}</strong>
                    </span>
                    <span className="text-[9px] font-mono text-[#FF7582] uppercase tracking-wider">
                      [LECTEUR ACTIF]
                    </span>
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

