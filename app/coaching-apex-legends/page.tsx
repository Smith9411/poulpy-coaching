import type { Metadata } from "next";
import Link from "next/link";
import CyberNavbar from "@/components/CyberNavbar";
import CyberFooter from "@/components/CyberFooter";
import GameFaq, { FaqItem } from "@/components/GameFaq";

export const metadata: Metadata = {
  title: "Coaching Apex Legends France — Movement & Analyse VOD",
  description:
    "Coaching Apex Legends individuel par Coach Poulpy (3x Pick Pred #450). Tap-strafe, superglides, tracking haute vélocité et rotations 3v3 vers Master et Predator.",
  alternates: {
    canonical: "https://www.poulpy-coaching.fr/coaching-apex-legends",
  },
  openGraph: {
    title: "Coaching Apex Legends France — Dominer le 3v3 avec Poulpy",
    description:
      "Coaching e-sport Apex Legends sur-mesure : cours particuliers sur Discord, movement d'élite et macro ranked.",
    url: "https://www.poulpy-coaching.fr/coaching-apex-legends",
    siteName: "Poulpy Coaching",
    images: [{ url: "/icons/icon-512x512.png", width: 512, height: 512, alt: "Coaching Apex Legends Poulpy" }],
  },
};

const apexFaqs: FaqItem[] = [
  {
    q: "Qu'est-ce qu'on travaille concrètement en coaching Apex Legends ?",
    a: "On développe tes compétences sur les 3 axes majeurs d'Apex : le movement avancé (tap-strafe, superglides réguliers, wall-bounces), le tracking au corps à corps sous pression (recoil smoothing, duels au pompe) et le sens tactique en 3v3 (isoler les duels, armor swap sous 0.5s et survie aux 3rd parties).",
  },
  {
    q: "Travaille-t-on les mécaniques de movement avancées (Tap-strafe, Superglide, Wall bounce) ?",
    a: "Absolument. Nous décomposons au ralenti le timing exact de chaque input au clavier/souris ou manette : régularité du superglide, enchaînement tap-strafing à 180°, fatigue wall bounce et ras-strafe pour devenir intouchable dans les espaces clos.",
  },
  {
    q: "Le coaching Apex est-il utile pour monter Master et Apex Predator ?",
    a: "Oui, Coach Poulpy (3x Top #450 Predator en S24) t'enseigne les fondamentaux des lobbies de haut niveau : prise de position en zone prioritaire, contrôle du high ground, timing d'engagement et décision de reset en 3v3 pour sécuriser les points RP.",
  },
  {
    q: "Le coaching convient-il aux joueurs manette (controller) ?",
    a: "Oui ! Tous les fondamentaux de positionnement, de timing d'engagement, de gestion de couverture, de rotations de zone et de macro-game en ranked s'appliquent à 100%, que tu sois sur manette ou clavier/souris.",
  },
  {
    q: "Comment se déroule la session avec Coach Poulpy ?",
    a: "La séance se fait en direct en vocal et partage d'écran sur Discord avec Poulpy (3x Pick Predator #450). On analyse tes parties enregistrées, on identifie tes patterns d'erreur et on fait des exercices ciblés en stand de tir pour corriger tes mécaniques.",
  },
  {
    q: "Comment fonctionne la séance d'essai gratuite ?",
    a: "Tu peux réserver une Session Diagnostic (45 min à 1h) 100% offerte directement sur notre site. Poulpy décortique ton gameplay, évalue tes points à travailler et établit ton plan d'entraînement personnalisé.",
  },
];

const apexJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Course", "Service"],
      "@id": "https://www.poulpy-coaching.fr/coaching-apex-legends#course",
      "name": "Coaching Apex Legends France — Movement & Analyse VOD",
      "description":
        "Coaching personnalisé Apex Legends en France : cours particuliers individuels, perfectionnement du movement (tap-strafe, superglide, wall bounce), tracking haute vélocité, gestion des combats 3v3 et rotations de zone vers Master & Predator.",
      "provider": {
        "@type": "Person",
        "name": "Coach Poulpy",
        "jobTitle": "Coach E-sport Apex Legends (3x Predator #450)",
        "url": "https://www.poulpy-coaching.fr"
      },
      "educationalCredentialAwarded": "Progression en Ranked (Rookie à Predator)",
      "hasCourseInstance": {
        "@type": "CourseInstance",
        "courseMode": "Online",
        "courseWorkload": "PT1H"
      },
      "offers": [
        {
          "@type": "Offer",
          "name": "Session Diagnostic Apex Legends (Offerte)",
          "price": "0",
          "priceCurrency": "EUR",
          "availability": "https://schema.org/InStock",
          "url": "https://www.poulpy-coaching.fr/#booking"
        },
        {
          "@type": "Offer",
          "name": "Coaching Apex Legends 1h",
          "price": "10.00",
          "priceCurrency": "EUR",
          "availability": "https://schema.org/InStock",
          "url": "https://www.poulpy-coaching.fr/#booking"
        }
      ]
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.poulpy-coaching.fr/coaching-apex-legends#faq",
      "mainEntity": apexFaqs.map((faq) => ({
        "@type": "Question",
        "name": faq.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.a
        }
      }))
    }
  ]
};

export default function CoachingApexLegendsPage() {
  return (
    <main className="w-full min-h-screen relative text-[#F5F4F0] selection:bg-[#CA1C30]/40 selection:text-white overflow-x-hidden">
      {/* Données structurées invisibles pour Google & IA (Schema.org JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(apexJsonLd) }}
      />

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
          COACHING <span className="text-[#CA1C30]">APEX LEGENDS</span>
        </h1>

        <p className="mt-6 font-accent text-sm sm:text-base md:text-lg text-[#00B4A0] font-semibold tracking-wider uppercase max-w-2xl">
          MOVEMENT ÉLITE &amp; RANKED MASTER • ACCOMPAGNEMENT 1-ON-1 PAR COACH POULPY
        </p>

        {/* Phrase descriptive demandée par l'utilisateur */}
        <p className="mt-6 text-base sm:text-lg text-white/75 max-w-xl leading-relaxed">
          Progresse avec Poulpy : analyse VOD de tes parties, movement avancé et gamesense pour carry tes ranked.
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
        <GameFaq title="APEX LEGENDS" faqs={apexFaqs} />
      </div>

      <CyberFooter />
    </main>
  );
}
