import type { Metadata } from 'next';
import Link from 'next/link';
import CyberNavbar from '@/components/CyberNavbar';
import CyberFooter from '@/components/CyberFooter';

export const metadata: Metadata = {
  title: 'Coaching Apex & Apex Legends Coaching France — Cours Particuliers & Aim',
  description:
    'Coaching Apex Legends et Apex coaching individuel par Coach Poulpy. Travail du movement (superglide, tap strafe), recoil smoothing, 3v3 et cours particuliers. Séance offerte.',
  keywords: [
    'coaching apex',
    'apex coaching',
    'coaching apex legends',
    'apex legends coaching',
    'coach apex',
    'apex coach',
    'coach apex legends',
    'cours apex',
    'cours apex legends',
    'cours particulier apex',
    'coaching apex france',
    'coaching apex fr',
    'movement coach apex',
    'aim coaching apex',
    'tap strafe coaching',
    'superglide coaching',
    'progresser sur apex legends',
    'comment monter predator apex',
    'poulpy coaching apex',
  ],
  alternates: {
    canonical: 'https://www.poulpy-coaching.fr/coaching-apex-legends',
  },
  openGraph: {
    title: 'Coaching Apex & Apex Legends Coaching France — Coach Poulpy',
    description:
      'Progresse sur Apex Legends avec du coaching personnalisé : movement tech, aim tracking, cours particuliers et ranked.',
    url: 'https://www.poulpy-coaching.fr/coaching-apex-legends',
    images: [{ url: '/icons/icon-512x512.png', width: 512, height: 512, alt: 'Coaching Apex Legends Poulpy' }],
  },
};

const apexFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Comment se déroule un cours de coaching Apex Legends ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La séance se fait en direct sur Discord. Elle associe l\'entraînement au tir (recoil smoothing, tracking au Stand de Tir), la maîtrise des techniques de movement (tap-strafe, wall bounce, superglide) et l\'analyse de vos parties ranked en VOD.',
      },
    },
    {
      '@type': 'Question',
      name: 'Le coaching Apex convient-il aux joueurs manette (controller) et clavier/souris (MnK) ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Oui, les deux périphériques sont accompagnés. Que vous soyez manette (optimisation linéaire/classique, positionnement close-range) ou clavier/souris (movement tech, tracking à 360°), les routines sont adaptées.',
      },
    },
    {
      '@type': 'Question',
      name: 'Comment fonctionne la séance d\'essai offerte ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La séance d\'initiation de 30 minutes est 100 % gratuite. Elle permet d\'évaluer vos réflexes, votre sensibilité et vos décisions de combat pour vous donner un plan de progression clair.',
      },
    },
  ],
};

export default function CoachingApexLegendsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(apexFaqSchema) }}
      />

      <CyberNavbar />

      <main className="min-h-screen bg-[#0A0A0D] text-white pt-28 pb-20 selection:bg-[#CA1C30]/30 selection:text-white">
        {/* Ambient Glows */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#CA1C30]/10 blur-[140px] rounded-full" />
          <div className="absolute top-2/3 left-10 w-[400px] h-[400px] bg-[#00B4A0]/10 blur-[130px] rounded-full" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center space-x-2 text-xs uppercase tracking-widest text-zinc-500 font-mono">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-[#CA1C30]">Coaching Apex Legends</span>
          </nav>

          {/* Hero Section */}
          <header className="mb-16 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#CA1C30]/30 bg-[#CA1C30]/10 text-[#FF4655] text-xs font-semibold uppercase tracking-wider mb-4">
              <span>⚡ Discipline Officielle</span>
              <span>•</span>
              <span>Master & Predator Tier</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight uppercase leading-[1.1] mb-6">
              Coaching Apex Legends & <span className="text-[#FF4655]">Apex Coaching</span>
            </h1>
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed mb-8">
              Tu cherches un <strong>coach Apex Legends en France</strong> pour maîtriser les 3v3 et passer Master ou Predator ? 
              Movement tech avancé (tap strafe, superglide), tracking haute précision, 
              gestion des rotations et cours particuliers avec <strong>Coach Poulpy</strong>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/?booking=true"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#CA1C30] to-[#E02438] text-white font-bold text-sm uppercase tracking-wider shadow-[0_6px_25px_rgba(202,28,48,0.4)] hover:brightness-110 transition-all text-center"
              >
                Réserver ma séance offerte (30 min)
              </Link>
              <a
                href="https://discord.gg/BC24FH4xpd"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-200 font-semibold text-sm uppercase tracking-wider transition-all text-center"
              >
                Rejoindre le Discord
              </a>
            </div>
          </header>

          {/* Pillars Grid */}
          <section className="mb-20">
            <div className="text-center mb-10">
              <h2 className="text-xs uppercase tracking-[3px] text-[#00B4A0] font-mono mb-2">Compétences Clés</h2>
              <p className="text-2xl sm:text-3xl font-bold tracking-tight">Programme d'entraînement Apex Legends</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-[#121318] border border-white/5 hover:border-[#CA1C30]/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#CA1C30]/15 border border-[#CA1C30]/30 flex items-center justify-center text-lg mb-4">🏃‍♂️</div>
                <h3 className="text-lg font-bold mb-2">Movement Tech Avancé</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Apprends et applique en combat le tap-strafing, superglide, wall bouncing et fatigue jump pour briser les lignes de tir ennemies.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#121318] border border-white/5 hover:border-[#00B4A0]/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#00B4A0]/15 border border-[#00B4A0]/30 flex items-center justify-center text-lg mb-4">🎯</div>
                <h3 className="text-lg font-bold mb-2">Aim & Recoil Smoothing</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Maximise ton DPS. Élimination du recul horizontal, micro-adjustments et tracking fluide sur cibles en l'air ou en slide.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#121318] border border-white/5 hover:border-[#5865F2]/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#5865F2]/15 border border-[#5865F2]/30 flex items-center justify-center text-lg mb-4">🧭</div>
                <h3 className="text-lg font-bold mb-2">Rotations & Zone Control</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Lecture de l'anneau, prise de hauteur (high-ground), gestion des choke points et timing des engagements pour éviter les third-parties.
                </p>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="text-center py-12 px-6 rounded-3xl bg-gradient-to-b from-[#161720] to-[#0E0F14] border border-[#CA1C30]/20">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4 uppercase">
              Prêt à rouler sur tes lobbys Apex ?
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto mb-8 text-sm sm:text-base leading-relaxed">
              Séance individuelle personnalisée avec retour vidéo et routine de tir.
            </p>
            <Link
              href="/?booking=true"
              className="inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-[#CA1C30] to-[#E02438] text-white font-bold text-sm uppercase tracking-wider shadow-[0_8px_30px_rgba(202,28,48,0.4)] hover:brightness-110 transition-all"
            >
              Réserver ma séance offerte
            </Link>
          </section>
        </div>
      </main>

      <CyberFooter />
    </>
  );
}
