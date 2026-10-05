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
    badge: "MÉCANIQUES PURES",
    title: "AIM ET MÉCANIQUES",
    subtitle: "Mécaniques ingame & aim training",
    description:
      "Une approche des mécaniques ingame axée sur l'aim pure et l'entraînement (+ de 1000h d'expérience en aim training à vous transmettre). Des analyses détaillées afin d'optimiser vos mouvements et augmenter drastiquement votre HS%.",
    specs: [
      { label: "Routines d'aim training personnalisées", val: "20m à 1h / jour" },
      { label: "Hold & peak theory", val: "95% d'avantage en duel" },
      { label: "Crosshair placement", val: "40% d'head-shot" },
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
    title: "GAMESENS ET WIN CONDITIONS",
    subtitle: "Lecture de jeu & clutchs",
    description:
      "Appréhendez les parties différemment, ne perdez plus jamais vos clutchs et convertissez chaque avantage en un round gagné. Ma méthode vous permettra d'être le carry de vos games même dans les mauvais jours.",
    specs: [
      { label: "Maîtrise d'agents", val: "" },
      { label: "Identification des wins conditions", val: "" },
      { label: "Prédiction des rounds", val: "" },
      { label: "Clutch", val: "" },
      { label: "Rééquilibrage lors d'un désavantage", val: "" },
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
    badge: "MINDSET & COMMS",
    title: "MENTAL ET COMMUNICATION",
    subtitle: "Régularité & leadership",
    description:
      "Devenez le mate que vous avez envie d'avoir : jamais tilt, porte la game grâce à ses calls et hype ses mates ! Ce 3e pilier vous permettra d'être toujours prêt pour vos fights, de jouer constamment à minimum 95% de vos capacités et de vous conditionner lors des games afin de maximiser votre courbe de progression.",
    specs: [
      { label: "Conditionnement", val: "Prêts pour 100% des duels" },
      { label: "Mental ingame", val: "0% de Tilt" },
      { label: "Constant", val: "Moins 50% de bad game" },
      { label: "Communication", val: "100% de love de vos teamates" },
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
        className="relative w-full min-h-[100dvh] h-screen overflow-hidden flex flex-col justify-center pt-4 sm:pt-6 lg:pt-8 pb-4 sm:pb-6"
      >
        {/* Grand Titre de Catégorie — responsive et safe margin */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-10 mb-4 sm:mb-6 md:mb-8 shrink-0 z-20">
          <h2 className="text-[clamp(1.75rem,4.2vw,3.75rem)] font-display text-[#F5F4F0] tracking-wider uppercase leading-none sm:leading-tight">
            UNE APPROCHE EN <span className="text-[#CA1C30] inline-block whitespace-nowrap">3 PILIERS</span>
          </h2>
        </div>

        {/* Large Rectangular Horizontal Sliding Track */}
        <div
          ref={trackRef}
          className="flex items-center w-max pl-4 sm:pl-10 pr-24 select-none space-x-8 sm:space-x-12 shrink-0"
          style={{
            willChange: "transform",
            transform: "translate3d(0, 0, 0)",
          }}
        >
          {pillars.map((item, idx) => {
            const isAcid = item.color === "acid";
            const isMediaActive = activeMediaIndex === idx;

            return (
              <div
                key={item.num}
                className="w-[90vw] xs:w-[88vw] sm:w-[860px] lg:w-[980px] xl:w-[1060px] h-[520px] sm:h-[530px] lg:h-[540px] max-h-[76vh] sm:max-h-[80vh] shrink-0 rounded-2xl sm:rounded-3xl bg-[#121117]/85 backdrop-blur-md p-4 sm:p-6 lg:p-12 flex flex-col justify-between transition-colors relative shadow-2xl shadow-black/80 overflow-hidden"
              >
                {/* Header inside module */}
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5 sm:pb-4 shrink-0">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-[10px] sm:text-[11px] font-mono text-white/40 tracking-widest uppercase">
                      {item.code}
                    </span>
                    <span className="text-white/20 font-mono">|</span>
                    <span
                      className={`text-[10px] sm:text-xs font-mono font-bold tracking-wider uppercase px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full ${
                        isAcid ? "text-[#CA1C30] bg-[#CA1C30]/10" : "text-[#00B4A0] bg-[#00B4A0]/10"
                      }`}
                    >
                      {item.badge}
                    </span>
                  </div>

                  {/* Ghost number badge */}
                  <div className="flex items-center">
                    <span className="font-display text-xl sm:text-3xl font-bold tracking-tighter text-white/30">
                      {item.num}
                    </span>
                  </div>
                </div>

                {/* Main Content: on mobile, Video is on top so it is NEVER cut off at the bottom! On desktop, 2-column side by side */}
                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-3 sm:gap-6 lg:gap-10 items-center my-auto py-1 sm:py-2">
                  {/* Video Stage — full 16:9 aspect ratio, prominently placed */}
                  <div className="w-full lg:col-span-7 order-1 lg:order-2 shrink-0">
                    <PillarLargeVideo
                      videoSrc={item.videoSrc}
                      clipTitle={item.clipTitle}
                      clipSubtitle={item.clipSubtitle}
                      isActive={isMediaActive}
                      isSectionInView={isSectionInView}
                      accentColor={item.color}
                    />
                  </div>

                  {/* Text & Telemetry Stage */}
                  <div className="w-full lg:col-span-5 space-y-2 sm:space-y-3 lg:space-y-4 order-2 lg:order-1">
                    <div className="space-y-0.5 sm:space-y-1.5">
                      <h3 className="text-base sm:text-2xl lg:text-3xl font-display font-bold text-[#F5F4F0] tracking-tight">
                        {item.title}
                      </h3>
                      <div className="text-[10px] sm:text-xs font-mono text-white/60 tracking-wider">
                        {item.subtitle}
                      </div>
                    </div>

                    <p className="text-[11px] sm:text-xs lg:text-sm text-white/70 font-sans leading-relaxed line-clamp-2 sm:line-clamp-3 lg:line-clamp-none">
                      {item.description}
                    </p>

                    {/* Swiss Telemetry Spec Readout with internal lines */}
                    <div className="space-y-1 sm:space-y-2 pt-2 sm:pt-3 border-t border-white/10 font-mono text-xs">
                      {item.specs.map((s, sIdx) => (
                        <div
                          key={sIdx}
                          className={`items-center justify-between gap-2 sm:gap-3 text-[10px] sm:text-[11px] ${
                            sIdx >= 2 ? "hidden sm:flex" : "flex"
                          }`}
                        >
                          <span className="text-white/80 uppercase tracking-wider flex items-center gap-1.5 truncate">
                            <span className="w-1.5 h-1.5 bg-[#CA1C30] rounded-full shrink-0" />
                            {s.label}
                          </span>
                          {s.val && (
                            <>
                              <span className="text-white/15 flex-1 border-b border-dotted border-white/15" />
                              <span
                                className={`font-bold tracking-wide shrink-0 ${
                                  isAcid ? "text-[#CA1C30]" : "text-[#00B4A0]"
                                }`}
                              >
                                {s.val}
                              </span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Closing Action Rectangle */}
          <div className="w-[85vw] sm:w-[500px] h-[520px] sm:h-[530px] lg:h-[540px] max-h-[76vh] sm:max-h-[80vh] shrink-0 rounded-2xl sm:rounded-3xl bg-black/60 backdrop-blur-md p-6 sm:p-8 lg:p-12 flex flex-col justify-between relative shadow-2xl shadow-black/90 overflow-hidden">
            <div className="space-y-4">
              <h3 className="text-2xl sm:text-4xl font-display font-bold text-white tracking-tight leading-tight">
                PRÊT À PASSER LE PALIER ?
              </h3>
              <p className="text-xs sm:text-sm text-white/70 font-sans leading-relaxed">
                Ne perdez plus des mois à tourner en rond en ranked. Réservez votre premier audit et progressez immédiatement avec une méthode construite pour vous !
              </p>
            </div>

            <div className="pt-4 border-t border-white/10">
              <a
                href="#booking"
                className="btn-cyber-primary w-full justify-center text-xs py-3.5 sm:py-4 rounded-full cursor-pointer font-bold tracking-wider"
              >
                <span>ENGAGER LE COACHING</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Progress Bar — En bas de l'écran */}
        <div className="absolute bottom-6 sm:bottom-8 left-0 right-0 w-full max-w-7xl mx-auto px-4 sm:px-10 flex items-center justify-end text-[10px] font-mono text-white/40 pointer-events-none z-20">
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
