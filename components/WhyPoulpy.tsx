import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import DecryptedText from "./DecryptedText";
import CornerBrackets from "./CornerBrackets";
import {
  Target,
  Brain,
  Crosshair,
  TrendingUp,
  ShieldCheck,
  Flame,
  ArrowRight,
  Play,
  RotateCcw,
  Pause,
} from "lucide-react";

interface PillarVideoPlayerProps {
  videoSrc?: string;
  clipTitle: string;
  clipSubtitle: string;
  isFlipped: boolean;
  isSectionInView: boolean;
  isCardInView: boolean;
}

function PillarVideoPlayer({
  videoSrc,
  clipTitle,
  clipSubtitle,
  isFlipped,
  isSectionInView,
  isCardInView,
}: PillarVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Play automatically without sound in a loop ONLY when:
  // 1. Card is flipped
  // 2. Section is in view
  // 3. THIS card is currently on screen
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;

    if (isFlipped && isSectionInView && isCardInView) {
      video.muted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            video.muted = true;
            video.play()
              .then(() => setIsPlaying(true))
              .catch(() => setIsPlaying(false));
          });
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isFlipped, isSectionInView, isCardInView, videoSrc]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!videoSrc) {
    return (
      <div className="relative my-auto aspect-video w-full bg-black/90 border border-white/20 flex flex-col items-center justify-center overflow-hidden group/player shadow-inner z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FF7582]/10 via-transparent to-black pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#FF7582]/20 border-2 border-[#FF7582] flex items-center justify-center text-[#FF7582] shadow-[0_0_25px_rgba(255,117,130,0.5)] group-hover/player:scale-110 transition-transform cursor-pointer">
            <Play className="w-6 h-6 fill-current ml-1" />
          </div>
          <div className="text-center space-y-0.5">
            <span className="text-xs font-bold font-display tracking-wider text-white block">
              {clipTitle}
            </span>
            <span className="text-[10px] text-white/50 font-mono block">
              CLIP DISPONIBLE TRÈS BIENTÔT // 1080P 60FPS
            </span>
          </div>
        </div>

        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[9px] font-mono text-white/60 z-10">
          <span className="bg-black/80 px-2 py-0.5 border border-white/10">00:45 / 01:30</span>
          <span className="text-[#FF7582] font-bold">COACH POULPY REPLAY ARCHIVE</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={togglePlay}
      className="relative my-auto aspect-video w-full bg-black border border-[#FF7582]/40 flex flex-col items-center justify-center overflow-hidden group/video shadow-[0_0_25px_rgba(255,117,130,0.2)] z-10 cursor-pointer select-none"
    >
      {/* Real Video Element */}
      <video
        ref={videoRef}
        src={videoSrc}
        loop
        muted
        playsInline
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onPlaying={() => setIsPlaying(true)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        className="w-full h-full object-cover"
      />

      {/* Subtle Scanline Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_50%,rgba(0,0,0,0.2)_50%)] bg-[size:100%_4px] pointer-events-none opacity-40" />

      {/* Top Bar Badge (Shown strictly on hover) */}
      <div className="absolute top-2 left-2.5 flex items-center pointer-events-none z-20 opacity-0 group-hover/video:opacity-100 transition-opacity duration-300">
        <div className="flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-2 py-0.5 border border-white/10 rounded text-[9px] font-mono">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-white/80 font-bold uppercase tracking-wider">LIVE FEED // AUTO-LOOP</span>
        </div>
      </div>

      {/* Center Play/Pause Indicator if manually paused */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/45 backdrop-blur-[2px] z-10 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-[#FF7582] text-black flex items-center justify-center shadow-[0_0_20px_rgba(255,117,130,0.6)]">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>
      )}

      {/* Bottom Cyber Progress & Status Bar (Shown strictly on hover) */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-2.5 pt-4 space-y-1.5 z-20 pointer-events-auto opacity-0 group-hover/video:opacity-100 transition-opacity duration-300">
        {/* Progress scrub bar */}
        <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#FF7582] transition-all duration-100 ease-linear shadow-[0_0_8px_#FF7582]"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[9px] font-mono text-white/70">
          <span className="font-bold text-white tracking-wider">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <span className="text-[#FF7582] font-bold uppercase flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF7582]" />
            {isPlaying ? "EN LECTURE" : "PAUSE"}
          </span>
        </div>
      </div>
    </div>
  );
}

const PILLARS = [
  {
    num: "01",
    icon: Crosshair,
    badge: "AIM TRAINING",
    title: "AIM TRAINING",
    subtitle: "Playlist spéciale pour chaque jeu",
    description:
      "Analyse des faiblesses biomécaniques et scénarios d'entraînement sur-mesure pour compenser tes lacunes. Progression assurée avec suivi régulier des scores.",
    specs: [
      { label: "Playlists", val: "Spéciale par jeu" },
      { label: "Analyse", val: "Scénarios ciblés" },
      { label: "Progression", val: "Suivi des scores" },
    ],
    hasClip: true,
    videoSrc: "/videos/why-poulpy/aim.mp4",
    clipTitle: "AIM TRAINING // VALORANT, APEX & KOVAAK",
    clipSubtitle: "Clip Valo puis Apex puis Aim Training",
    color: "laser",
  },
  {
    num: "02",
    icon: Target,
    badge: "ANALYSE STRATÉGIQUE",
    title: "ANALYSE POUSSÉE & DÉTAILLÉE",
    subtitle: "VOD review, stats et trackers en profondeur",
    description:
      "Dissection millimétrique de tes parties et analyse poussée de tes statistiques. Méthodologie éprouvée basée sur la review de plus de 1000 games de pro.",
    specs: [
      { label: "VOD Review", val: "Image par image" },
      { label: "Trackers", val: "Analyse de stats" },
      { label: "Base Pro", val: "+1000 games revues" },
    ],
    hasClip: false,
    clipTitle: "",
    clipSubtitle: "",
    color: "acid",
  },
  {
    num: "03",
    icon: Brain,
    badge: "VISION TACTIQUE",
    title: "GAMESENSE & MACROGAME",
    subtitle: "Gagnez tous vos clutchs",
    description:
      "Apprends à prédire les positions adverses et garde constamment une longueur d'avance. Domination tactique et lecture de jeu pro en situations critiques.",
    specs: [
      { label: "Clutchs", val: "Gagnez tous vos duels" },
      { label: "Lecture", val: "Prédiction positions" },
      { label: "Macro", val: "+1 longueur d'avance" },
    ],
    hasClip: true,
    videoSrc: "/videos/why-poulpy/clutch.mp4",
    clipTitle: "CLUTCH GAME // VALORANT & 1V3 APEX",
    clipSubtitle: "Clip de clutch Valo et 1v3 Apex Legends",
    color: "laser",
  },
  {
    num: "04",
    icon: TrendingUp,
    badge: "SUIVI RIGOUREUX",
    title: "PROGRESSION MESURABLE",
    subtitle: "Fiche technique de suivi et objectifs",
    description:
      "Accompagnement méthodique structuré autour de ta fiche technique de suivi. Évaluation continue des aim scores et validation rigoureuse de tes compétences.",
    specs: [
      { label: "Fiche technique", val: "Suivi personnalisé" },
      { label: "Aim Scores", val: "Métriques réelles" },
      { label: "Compétences", val: "Objectifs validés" },
    ],
    hasClip: false,
    clipTitle: "",
    clipSubtitle: "",
    color: "acid",
  },
  {
    num: "05",
    icon: Flame,
    badge: "PSYCHOLOGIE DU JOUEUR",
    title: "ANTITILT & SANG-FROID",
    subtitle: "Protocole de clutch et mindset de compétiteur",
    description:
      "Développe le mental des champions pour sécuriser tes situations de clutch 1v3 et 1v5. Routine anti-panique, maîtrise du stress et sang-froid absolu.",
    specs: [
      { label: "Protocole", val: "Gestion de clutch" },
      { label: "Situations 1vX", val: "1v3 / 1v5 assurés" },
      { label: "Mindset", val: "Posture compétiteur" },
    ],
    hasClip: true,
    videoSrc: "/videos/why-poulpy/sang-froid.mp4",
    clipTitle: "SANG-FROID EN CLUTCH // 1V3 & 1V5",
    clipSubtitle: "Clip clutch et 1v3 Apex Legends",
    color: "laser",
  },
  {
    num: "06",
    icon: ShieldCheck,
    badge: "CONTRAT DE CONFIANCE",
    title: "STEPUP GARANTIE",
    subtitle: "Trackez vos progrès et gagnez des RR",
    description:
      "Un cadre d'entraînement strict pour acquérir l'ensemble des compétences requises. Progression tangible, gains de RR constants et métamorphose en joueur complet.",
    specs: [
      { label: "Progrès", val: "Trackez vos gains" },
      { label: "Gains RR", val: "Compétences acquises" },
      { label: "Profil", val: "Joueur complet" },
    ],
    hasClip: false,
    clipTitle: "",
    clipSubtitle: "",
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
  const scrollDistanceRef = useRef(3200);

  const [flippedArray, setFlippedArray] = useState<boolean[]>([false, false, false, false, false, false]);
  const [isSectionInView, setIsSectionInView] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

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

  const flippedStatesRef = useRef<boolean[]>([false, false, false, false, false, false]);

  const animateCardFlip = (idx: number, targetFlipped: boolean) => {
    // Only animate flip on cards that actually have a clip
    if (!pillars[idx]?.hasClip) return;

    const el = cardFlippersRef.current[idx];
    if (!el) return;
    flippedStatesRef.current[idx] = targetFlipped;
    setFlippedArray((prev) => {
      if (prev[idx] === targetFlipped) return prev;
      const next = [...prev];
      next[idx] = targetFlipped;
      return next;
    });

    gsap.to(el, {
      rotateY: targetFlipped ? 180 : 0,
      y: 0,
      duration: 0.75,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const handleCardClick = (idx: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!pillars[idx]?.hasClip) return;
    const isCurrentlyFlipped = flippedStatesRef.current[idx];
    animateCardFlip(idx, !isCurrentlyFlipped);
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

      // Pacing calibrated: continuous scrolling with brief holds strictly on flipped clip cards
      const totalScrollDistance = Math.max(2600, maxScroll * 2.0);
      scrollDistanceRef.current = totalScrollDistance;

      ctx = gsap.context(() => {
        // Reset all card flippers
        cardFlippersRef.current.forEach((el, idx) => {
          if (el) {
            gsap.set(el, { rotateY: 0, y: 0 });
            flippedStatesRef.current[idx] = false;
          }
        });

        // Thresholds strictly for clip cards (01 -> idx 0, 03 -> idx 2, 05 -> idx 4)
        const thresholds = [
          { idx: 0, forward: 0.10, backward: 0.07 }, // Case 01 (Clip Aim training - flips at 10%)
          { idx: 2, forward: 0.38, backward: 0.34 }, // Case 03 (Clip Gamesense & clutch)
          { idx: 4, forward: 0.70, backward: 0.66 }, // Case 05 (Clip Antitilt & 1v3)
        ];

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
              setScrollProgress(progress);
              if (scrollPctRef.current) {
                scrollPctRef.current.textContent = `${Math.round(progress * 100)}%`;
              }
              if (progressBarRef.current) {
                progressBarRef.current.style.transform = `scaleX(${progress})`;
              }

              // Active pill indicator
              const activeIdx = Math.min(
                5,
                progress < 0.22 ? 0
                  : progress < 0.38 ? 1
                  : progress < 0.56 ? 2
                  : progress < 0.72 ? 3
                  : progress < 0.88 ? 4
                  : 5
              );
              if (activeIdx !== activeIndexRef.current) {
                activeIndexRef.current = activeIdx;
                updatePills(activeIdx);
              }

              // Trigger smooth flip only on cards with clips
              thresholds.forEach((th) => {
                const isFlipped = flippedStatesRef.current[th.idx];
                if (!isFlipped && progress >= th.forward) {
                  animateCardFlip(th.idx, true);
                } else if (isFlipped && progress < th.backward) {
                  animateCardFlip(th.idx, false);
                }
              });
            },
          },
        });

        // Choreographed Timeline:
        // 1. Card 0 (Clip): holds front until 10% scroll, flips to video, then holds flipped
        tl.to(track, { x: 0, duration: 0.8, ease: "none" });

        // 2. Smooth continuous scroll past Card 1 (no pause) all the way to Card 2
        tl.to(track, { x: -cardPositions[2], duration: 1.0, ease: "power1.inOut" });

        // 3. Card 2 (Clip): brief hold on flipped video card
        tl.to(track, { x: -cardPositions[2], duration: 0.5, ease: "none" });

        // 4. Smooth continuous scroll past Card 3 (no pause) all the way to Card 4
        tl.to(track, { x: -cardPositions[4], duration: 1.0, ease: "power1.inOut" });

        // 5. Card 4 (Clip): brief hold on flipped video card
        tl.to(track, { x: -cardPositions[4], duration: 0.5, ease: "none" });

        // 6. Smooth continuous scroll past Card 5 (no pause) to CTA callout
        tl.to(track, { x: -maxScroll, duration: 1.0, ease: "power1.inOut" });
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

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSectionInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(section);

    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      if (ctx) ctx.revert();
    };
  }, []);

  const goToCard = (index: number) => {
    const section = sectionRef.current;
    if (!section) return;

    const cardTargetProgress = [0.10, 0.25, 0.42, 0.58, 0.74, 0.88];
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
          const hasClip = item.hasClip;

          return (
            <div
              key={item.num}
              className={`w-[85vw] sm:w-[500px] lg:w-[560px] h-[520px] shrink-0 relative ${
                hasClip ? "cursor-pointer group/card" : ""
              }`}
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
                      
                      {hasClip ? (
                        <div className="flex items-center gap-2 text-white/50 font-mono text-[10px] uppercase">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF7582] opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF7582]" />
                          </span>
                          <span className="text-[#FF7582] font-bold">EXTRAIT VOD DISPONIBLE</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-white/40 font-mono text-[10px] uppercase">
                          <span className="w-1.5 h-1.5 bg-white/30 rounded-full" />
                          <span>MÉTHODE THÉORIQUE & DATA</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ======================================================== */}
                {/* FACE ARRIÈRE (BACK - LECTEUR CLIP VIDÉO pour cartes avec clip) */}
                {/* ======================================================== */}
                {hasClip && (
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

                    {/* Video Player Component */}
                    <PillarVideoPlayer
                      videoSrc={item.videoSrc}
                      clipTitle={item.clipTitle}
                      clipSubtitle={item.clipSubtitle}
                      isFlipped={flippedArray[idx]}
                      isSectionInView={isSectionInView}
                      isCardInView={
                        idx === 0
                          ? scrollProgress < 0.25
                          : idx === 2
                          ? scrollProgress >= 0.18 && scrollProgress <= 0.60
                          : scrollProgress >= 0.52
                      }
                    />

                    {/* Back Footer */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs relative z-10">
                      <span className="text-[10px] text-white/60 truncate">
                        Démonstration : <strong className="text-white">{item.clipSubtitle}</strong>
                      </span>
                      <span className="text-[9px] font-mono text-[#FF7582] uppercase tracking-wider">
                        [LECTEUR ACTIF]
                      </span>
                    </div>
                  </div>
                )}
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


