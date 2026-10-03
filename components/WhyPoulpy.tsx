"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import DecryptedText from "./DecryptedText";
import {
  Target,
  Brain,
  Crosshair,
  TrendingUp,
  Flame,
  ArrowRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}

interface PillarVideoProps {
  videoSrc: string;
  clipTitle: string;
  clipSubtitle: string;
  isActive: boolean;
  isSectionInView: boolean;
  accentColor: "acid" | "laser";
}

function PillarLargeVideo({
  videoSrc,
  clipTitle,
  clipSubtitle,
  isActive,
  isSectionInView,
  accentColor,
}: PillarVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const isAcid = accentColor === "acid";

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;

    if (isActive && isSectionInView) {
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
  }, [isActive, isSectionInView, videoSrc]);

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

  return (
    <div
      onClick={togglePlay}
      className="relative w-full aspect-video bg-black rounded-2xl sm:rounded-3xl transition-all duration-300 flex flex-col items-center justify-center overflow-hidden group/video cursor-pointer select-none shadow-2xl shadow-black/80"
    >
      <video
        ref={videoRef}
        src={videoSrc}
        loop
        muted
        playsInline
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="w-full h-full object-cover"
      />

      {/* Subtle CRT Old TV Scanlines Texture Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-[5]"
        style={{
          background:
            "repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(0, 0, 0, 0.22) 3px, rgba(0, 0, 0, 0.22) 4px)",
          opacity: 0.35,
        }}
        aria-hidden="true"
      />

      {/* Play/Pause center overlay if manually paused */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-10">
          <div
            className={`w-14 h-14 rounded-full ${
              isAcid ? "bg-[#CA1C30]" : "bg-[#00B4A0]"
            } text-black flex items-center justify-center shadow-lg shadow-black/80`}
          >
            <Play className="w-6 h-6 fill-current ml-1" />
          </div>
        </div>
      )}
    </div>
  );
}

const PILLARS_WITH_VIDEO = [
  {
    num: "01",
    code: "PILIER // 01.0",
    icon: Crosshair,
    badge: "BIOMÉCANIQUE AIM",
    title: "CALIBRATION DE VISÉE",
    subtitle: "Routines personnalisées & posture",
    description:
      "Audit biomécanique complet : prise en main de souris, ajustement de sensibilité (cm/360) et routines d'échauffement ciblées pour éliminer définitivement l'overshooting.",
    specs: [
      { label: "Acquisition", val: "135 ms reflex" },
      { label: "Tracking", val: "99.2% précision" },
      { label: "Routine", val: "20 min / jour" },
      { label: "Jeux", val: "Valorant / Apex" },
    ],
    videoSrc: "/videos/why-poulpy/aim.mp4",
    clipTitle: "AIM TRAINING // VALORANT, APEX & KOVAAK",
    clipSubtitle: "Démonstration visée et posture",
    color: "laser" as const,
  },
  {
    num: "02",
    code: "PILIER // 02.0",
    icon: Brain,
    badge: "VISION DU JEU",
    title: "GAMESENSE & CLUTCH",
    subtitle: "Prise d'information & duel 1vX",
    description:
      "Transformer le chaos d'un round en une suite de duels 1v1 maîtrisés. Anticipation des rotations adverses, contrôle d'espace et gestion du tempo pour clore les rounds clés.",
    specs: [
      { label: "Anticipation", val: "Lecture pro" },
      { label: "Conversion", val: "88% rounds" },
      { label: "Macro", val: "Contrôle espace" },
      { label: "Clutch", val: "Arbre de décision" },
    ],
    videoSrc: "/videos/why-poulpy/clutch.mp4",
    clipTitle: "CLUTCH GAME // VALORANT & APEX",
    clipSubtitle: "Gestion de duels et tempo",
    color: "acid" as const,
  },
  {
    num: "03",
    code: "PILIER // 03.0",
    icon: Flame,
    badge: "MINDSET PRO",
    title: "SANG-FROID & ANTI-TILT",
    subtitle: "Contrôle du stress & focus",
    description:
      "Développer le calme des joueurs de tournoi. Neutralisation de la panique sous pression, régulation du rythme cardiaque et élimination immédiate du tilt.",
    specs: [
      { label: "Protocole", val: "Sang-froid 1vX" },
      { label: "Résilience", val: "0% tilt" },
      { label: "Lucidité", val: "100% focus" },
      { label: "Ranked", val: "+300 RR mesurés" },
    ],
    videoSrc: "/videos/why-poulpy/sang-froid.mp4",
    clipTitle: "SANG-FROID // SITUATIONS CLUTCH",
    clipSubtitle: "Contrôle mental en match",
    color: "laser" as const,
  },
];

export default function WhyPoulpy() {
  const pillars = PILLARS_WITH_VIDEO;
  const sectionRef = useRef<HTMLElement | null>(null);
  const pinnedContainerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const scrollPctRef = useRef<HTMLSpanElement | null>(null);
  const activeIndexRef = useRef(0);
  const scrollDistanceRef = useRef(2400);

  const [activeMediaIndex, setActiveMediaIndex] = useState<number>(0);
  const [isSectionInView, setIsSectionInView] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    const pinnedContainer = pinnedContainerRef.current;
    if (!section || !track || !pinnedContainer) return;

    let ctx: gsap.Context | null = null;

    const setup = () => {
      if (ctx) {
        ctx.revert();
      }

      const maxScroll = Math.max(0, track.scrollWidth - window.innerWidth + 80);
      const totalScrollDistance = Math.max(2000, maxScroll * 1.5);
      scrollDistanceRef.current = totalScrollDistance;

      ctx = gsap.context(() => {
        gsap.to(track, {
          x: -maxScroll,
          ease: "none",
          scrollTrigger: {
            id: "whypoulpy-scroll",
            trigger: section,
            pin: true,
            pinSpacing: true,
            start: "top top",
            end: () => `+=${totalScrollDistance}`,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (self: { progress: number }) => {
              const progress = self.progress;
              if (scrollPctRef.current) {
                scrollPctRef.current.textContent = `${Math.round(progress * 100)}%`;
              }
              if (progressBarRef.current) {
                progressBarRef.current.style.transform = `scaleX(${progress})`;
              }

              const activeIdx = Math.min(
                pillars.length - 1,
                Math.floor(progress * (pillars.length + 0.5))
              );
              if (activeIdx !== activeIndexRef.current) {
                activeIndexRef.current = activeIdx;
                setActiveMediaIndex(activeIdx);
              }
            },
          },
        });
      }, section);
    };

    setup();

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSectionInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(section);

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 150);
    };

    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      observer.disconnect();
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
      try {
        if (ctx) {
          ctx.revert();
        }
      } catch (err) {
        // Safe for React Fast Refresh
      }
    };
  }, [pillars.length]);

  return (
    <section
      id="coaching"
      ref={sectionRef}
      className="relative w-full bg-transparent font-mono z-20"
    >
      <div
        ref={pinnedContainerRef}
        className="relative w-full h-screen overflow-hidden flex flex-col justify-between pt-8 sm:pt-12 pb-6 sm:pb-8"
      >
        {/* Large Rectangular Horizontal Sliding Track */}
        <div
          ref={trackRef}
          className="flex items-center w-max pl-4 sm:pl-10 pr-24 my-auto select-none space-x-8 sm:space-x-12"
          style={{
            willChange: "transform",
            transform: "translate3d(0, 0, 0)",
          }}
        >
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            const isAcid = item.color === "acid";
            const isMediaActive = activeMediaIndex === idx;

            return (
              <div
                key={item.num}
                className="w-[92vw] sm:w-[860px] lg:w-[980px] xl:w-[1060px] h-[520px] sm:h-[540px] shrink-0 rounded-3xl bg-[#121117]/85 backdrop-blur-md p-8 sm:p-10 lg:p-12 flex flex-col justify-between transition-colors relative shadow-2xl shadow-black/80 overflow-hidden"
              >
                {/* Header inside module */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-white/40 tracking-widest uppercase">
                      {item.code}
                    </span>
                    <span className="text-white/20 font-mono">|</span>
                    <span
                      className={`text-xs font-mono font-bold tracking-wider uppercase px-3 py-1 rounded-full ${
                        isAcid ? "text-[#CA1C30] bg-[#CA1C30]/10" : "text-[#00B4A0] bg-[#00B4A0]/10"
                      }`}
                    >
                      {item.badge}
                    </span>
                  </div>

                  {/* Ghost number badge */}
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isAcid ? "text-[#CA1C30]" : "text-[#00B4A0]"}`} />
                    <span className="font-display text-2xl sm:text-3xl font-bold tracking-tighter text-white/30">
                      {item.num}
                    </span>
                  </div>
                </div>

                {/* Main 2-Column Split inside the wide rectangle */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center my-auto py-2">
                  {/* Left Column (Text & Telemetry) */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="space-y-1.5">
                      <h3 className="text-2xl sm:text-3xl font-display font-bold text-[#F5F4F0] tracking-tight">
                        {item.title}
                      </h3>
                      <div className="text-xs font-mono text-white/60 tracking-wider">
                        {item.subtitle}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-white/70 font-sans leading-relaxed">
                      {item.description}
                    </p>

                    {/* Swiss Telemetry Spec Readout with internal lines */}
                    <div className="space-y-2 pt-3 border-t border-white/10 font-mono text-xs">
                      {item.specs.map((s, sIdx) => (
                        <div key={sIdx} className="flex items-center justify-between gap-3 text-[11px]">
                          <span className="text-white/45 uppercase tracking-wider flex items-center gap-1.5 truncate">
                            <span className="w-1 h-1 bg-white/20 rounded-full shrink-0" />
                            {s.label}
                          </span>
                          <span className="text-white/15 flex-1 border-b border-dotted border-white/15" />
                          <span
                            className={`font-bold tracking-wide shrink-0 ${
                              isAcid ? "text-[#CA1C30]" : "text-[#00B4A0]"
                            }`}
                          >
                            {s.val}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column (Cinematic Video Stage) */}
                  <div className="lg:col-span-7">
                    <PillarLargeVideo
                      videoSrc={item.videoSrc}
                      clipTitle={item.clipTitle}
                      clipSubtitle={item.clipSubtitle}
                      isActive={isMediaActive}
                      isSectionInView={isSectionInView}
                      accentColor={item.color}
                    />
                  </div>
                </div>

                {/* Bottom Footer Info */}
                <div className="flex items-center justify-between text-[10px] text-white/40 font-mono pt-3 border-t border-white/10">
                  <span>DÉMONSTRATION COMPÉTITIVE // ARCHIVE POULPY</span>
                  <span className={`font-bold uppercase ${isAcid ? "text-[#CA1C30]" : "text-[#00B4A0]"}`}>
                    STATUT : VIDÉO ACTIVE
                  </span>
                </div>
              </div>
            );
          })}

          {/* Closing Action Rectangle */}
          <div className="w-[85vw] sm:w-[500px] h-[520px] sm:h-[540px] shrink-0 rounded-3xl bg-black/60 backdrop-blur-md p-8 sm:p-12 flex flex-col justify-between relative shadow-2xl shadow-black/90 overflow-hidden">
            <div className="space-y-4">
              <span className="text-[#CA1C30] text-xs font-bold font-mono tracking-widest uppercase block">
                // VALIDATION & ENGAGEMENT
              </span>
              <h3 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight leading-tight">
                PRÊT À PASSER LE PALIER ?
              </h3>
              <p className="text-xs sm:text-sm text-white/70 font-sans leading-relaxed">
                Ne perdez plus des mois à tourner en rond en ranked. Réservez votre premier audit et progressez immédiatement avec une méthode testée au plus haut niveau.
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/10">
              <a
                href="#booking"
                className="btn-cyber-primary w-full justify-center text-xs py-4 rounded-full cursor-pointer font-bold tracking-wider"
              >
                <span>ENGAGER LE COACHING</span>
              </a>
              <div className="text-center text-[10px] text-white/40 font-mono">
                VALORANT (IMMORTAL 2 #5000) &bull; APEX (3x PICK #450)
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Progress Bar */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-10 flex items-center justify-end text-[10px] font-mono text-white/40 pt-2 z-20">
          <div className="flex items-center gap-3">
            <span>PROGRESSION :</span>
            <div className="w-28 sm:w-40 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                ref={progressBarRef}
                className="h-full bg-[#CA1C30] origin-left transition-transform duration-75"
                style={{ transform: "scaleX(0)" }}
              />
            </div>
            <span ref={scrollPctRef} className="text-white/80 font-bold min-w-[2.5rem]">
              0%
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
