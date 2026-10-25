import type { Metadata } from "next";
import Link from "next/link";
import CyberNavbar from "@/components/CyberNavbar";
import CyberFooter from "@/components/CyberFooter";
import GameFaq, { FaqItem } from "@/components/GameFaq";

export const metadata: Metadata = {
  title: "Coaching Valorant France — Cours Particuliers & Analyse VOD | Poulpy Coaching",
  description:
    "Coaching Valorant individuel par Coach Poulpy (Immortal 2 #5000). Analyse VOD chirurgicale, crosshair placement, routines d'aim et progression rapide vers Immortel & Radiant.",
  alternates: {
    canonical: "https://www.poulpy-coaching.fr/coaching-valorant",
  },
  openGraph: {
    title: "Coaching Valorant France — Devenir Immortel & Radiant avec Poulpy",
    description:
      "Coaching e-sport Valorant personnalisé : cours particuliers sur Discord, analyse de tes erreurs et routine sur-mesure.",
    url: "https://www.poulpy-coaching.fr/coaching-valorant",
    siteName: "Poulpy Coaching",
    images: [{ url: "/icons/icon-512x512.png", width: 512, height: 512, alt: "Coaching Valorant Poulpy" }],
  },
};

const valorantFaqs: FaqItem[] = [
  {
    q: "Qu'est-ce qu'on travaille concrètement en coaching Valorant ?",
    a: "Chaque séance est 100% sur-mesure : analyse VOD chirurgicale round par round pour comprendre tes morts et corriger tes mauvais timings, biomécanique de l'aim (crosshair placement à hauteur de tête, counter-strafing, deadzoning), optimisation de tes agents et prise de décision sous pression pour clutch.",
  },
  {
    q: "Comment se déroule la séance avec Coach Poulpy ?",
    a: "La session se déroule en direct en vocal et partage d'écran 60 FPS sur le serveur Discord privé de Poulpy Coaching. Tu débriefes directement avec Poulpy (Head Coach Atheris Esport, Immortal 2 #5000) et tu repars avec des axes d'amélioration précis et une fiche d'exercices personnalisée.",
  },
  {
    q: "Quel niveau faut-il avoir pour commencer ?",
    a: "Tous les rangs sont accompagnés : du joueur débutant bloqué en Fer, Bronze, Argent ou Or qui veut poser des bases solides, au joueur compétitif cherchant à passer Diamant, Ascendant, Immortel ou Radiant.",
  },
  {
    q: "Comment fonctionne la séance d'essai gratuite ?",
    a: "Une Session Diagnostic (45 min à 1h) est 100% offerte et sans engagement. Elle permet à Poulpy d'analyser ton gameplay, de mesurer tes points forts et faibles et de te proposer un plan d'entraînement concret avant de réserver un pack.",
  },
];

export default function CoachingValorantPage() {
  return (
    <main className="w-full min-h-screen relative text-[#F5F4F0] selection:bg-[#CA1C30]/40 selection:text-white overflow-x-hidden">
      {/* Arrière-plan avec la coupe officielle (sans quadrillage) */}
      <div
        className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="w-full h-full vct-trophy-watermark" />
      </div>

      <CyberNavbar />

      {/* Contenu principal épuré */}
      <div className="relative z-10 pt-36 sm:pt-44 pb-24 px-6 sm:px-12 lg:px-16 max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Titre architectural Poulpy */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight text-[#F5F4F0] leading-[0.98]">
          COACHING <span className="text-[#CA1C30]">VALORANT</span>
        </h1>

        <p className="mt-6 font-accent text-sm sm:text-base md:text-lg text-[#00B4A0] font-semibold tracking-wider uppercase max-w-2xl">
          L&apos;ÉLITE DU COACHING VALORANT • DEVENIR IMMORTEL &amp; RADIANT
        </p>

        {/* Phrase descriptive demandée par l'utilisateur */}
        <p className="mt-6 text-base sm:text-lg text-white/75 max-w-xl leading-relaxed">
          Progresse avec Poulpy : analyse VOD de tes parties, placement du viseur et gamesense pour carry tes ranked.
        </p>

        {/* Boutons d'action centrés */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          <Link
            href="/"
            className="btn-cyber-primary w-full sm:w-auto px-9 py-4 justify-center font-bold text-xs tracking-wider cursor-pointer"
          >
            <span>DÉCOUVRIR LE SITE</span>
          </Link>

          <Link
            href="/#booking"
            className="btn-cyber-ghost w-full sm:w-auto px-8 py-4 text-xs font-semibold tracking-wider uppercase justify-center cursor-pointer"
          >
            <span>RÉSERVER UNE SÉANCE</span>
          </Link>
        </div>

        {/* FAQ interactive avec animations fluides framer-motion */}
        <GameFaq title="VALORANT" faqs={valorantFaqs} />
      </div>

      <CyberFooter />
    </main>
  );
}
