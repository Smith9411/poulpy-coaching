import type { Metadata } from 'next';
import Link from 'next/link';
import CyberNavbar from '@/components/CyberNavbar';
import CyberFooter from '@/components/CyberFooter';

export const metadata: Metadata = {
  title: 'Coaching Valorant & Valorant Coaching France — Cours Particuliers, Aim & VOD',
  description:
    'Coaching Valorant d\'élite par Coach Poulpy (Atheris Esport). Cours particuliers, Valorant coach individuel, analyse VOD chirurgicale et biomécanique de visée. Séance d\'essai offerte.',
  keywords: [
    'coaching valorant',
    'valorant coaching',
    'coach valorant',
    'valorant coach',
    'coaching valorant france',
    'coaching valorant fr',
    'cours valorant',
    'cours particulier valorant',
    'analyse vod valorant',
    'aim coaching valorant',
    'aim training valorant',
    'progresser sur valorant',
    'comment monter immortal valorant',
    'monter radiant valorant',
    'cours esport valorant',
    'poulpy coaching valorant',
  ],
  alternates: {
    canonical: 'https://www.poulpy-coaching.fr/coaching-valorant',
  },
  openGraph: {
    title: 'Coaching Valorant & Valorant Coaching France — Coach Poulpy',
    description:
      'Progresse sur Valorant avec un coaching personnalisé : analyse VOD, positionnement, cours individuels et routine aim.',
    url: 'https://www.poulpy-coaching.fr/coaching-valorant',
    images: [{ url: '/icons/icon-512x512.png', width: 512, height: 512, alt: 'Coaching Valorant Poulpy' }],
  },
};

const valorantFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Comment se déroule une séance de coaching Valorant ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La séance se déroule en direct sur Discord avec partage d\'écran. Elle comprend l\'analyse détaillée de vos parties (VOD review), la correction de votre crosshair placement et de vos prises d\'information, ainsi que l\'élaboration d\'une routine personnalisée sur Aim Lab ou The Range.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quel niveau est requis pour prendre un coaching Valorant ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tous les rangs sont accompagnés, du joueur débutant (Fer, Bronze, Argent) bloqué dans ses mécaniques, au joueur compétitif (Diamant, Ascendant, Immortel) cherchant à franchir le palier vers Radiant ou la compétition semi-pro.',
      },
    },
    {
      '@type': 'Question',
      name: 'Comment fonctionne la première séance gratuite ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La séance d\'essai de 30 minutes est 100 % gratuite et sans engagement. Elle permet de faire un premier diagnostic de votre profil de joueur, d\'identifier vos blocages majeurs et d\'établir votre feuille de route.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quels agents sont coachés sur Valorant ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tous les rôles et agents du jeu sont maîtrisés : Duellistes (Jett, Reyna, Raze), Initiateurs (Sova, Fade, Breach), Contrôleurs (Omen, Brimstone, Viper) et Sentinelles (Killjoy, Cypher).',
      },
    },
  ],
};

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Coaching Valorant Individuel',
  serviceType: 'Esports Coaching',
  provider: {
    '@type': 'Organization',
    name: 'Poulpy Coaching',
    url: 'https://www.poulpy-coaching.fr',
  },
  areaServed: 'France',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Formules de coaching Valorant',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: 'Séance Découverte' },
        price: '0',
        priceCurrency: 'EUR',
      },
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: 'Session Pro (1h30)' },
        price: '10',
        priceCurrency: 'EUR',
      },
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: 'Pack Suivi 7 Séances' },
        price: '50',
        priceCurrency: 'EUR',
      },
    ],
  },
};

export default function CoachingValorantPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(valorantFaqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      <CyberNavbar />

      <main className="min-h-screen bg-[#0A0A0D] text-white pt-28 pb-20 selection:bg-[#CA1C30]/30 selection:text-white">
        {/* Ambient Glows */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#CA1C30]/10 blur-[140px] rounded-full" />
          <div className="absolute top-2/3 right-10 w-[400px] h-[400px] bg-[#00B4A0]/10 blur-[130px] rounded-full" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center space-x-2 text-xs uppercase tracking-widest text-zinc-500 font-mono">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-[#CA1C30]">Coaching Valorant</span>
          </nav>

          {/* Hero Section */}
          <header className="mb-16 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#CA1C30]/30 bg-[#CA1C30]/10 text-[#FF4655] text-xs font-semibold uppercase tracking-wider mb-4">
              <span>🎯 Discipline Officielle</span>
              <span>•</span>
              <span>Atheris Esport</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight uppercase leading-[1.1] mb-6">
              Coaching Valorant & <span className="text-[#FF4655]">Valorant Coaching</span>
            </h1>
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed mb-8">
              Tu cherches un <strong>coach Valorant en France</strong> pour sortir du elo hell ou atteindre l'élite compétitive ? 
              Bénéficie d'un suivi sur-mesure combinant analyse VOD chirurgicale, 
              biomécanique de visée, placement de viseur et plan de montée vers Immortel & Radiant 
              avec <strong>Coach Poulpy</strong> (Atheris Esport).
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

          {/* Feature Pillars Grid */}
          <section className="mb-20">
            <div className="text-center mb-10">
              <h2 className="text-xs uppercase tracking-[3px] text-[#00B4A0] font-mono mb-2">Méthodologie Pro</h2>
              <p className="text-2xl sm:text-3xl font-bold tracking-tight">Ce que nous travaillons en séance</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-[#121318] border border-white/5 hover:border-[#CA1C30]/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#CA1C30]/15 border border-[#CA1C30]/30 flex items-center justify-center text-lg mb-4">
                  📹
                </div>
                <h3 className="text-lg font-bold mb-2">Analyse VOD Chirurgicale</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Décorticage frame-par-frame de tes rounds. Identification des prises d'info inutiles, des timings de mort et des mauvais positionnements sur site.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#121318] border border-white/5 hover:border-[#00B4A0]/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#00B4A0]/15 border border-[#00B4A0]/30 flex items-center justify-center text-lg mb-4">
                  🎯
                </div>
                <h3 className="text-lg font-bold mb-2">Crosshair Placement & Aim</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Correction de la hauteur de ton viseur en angle checking. Déconstruction du spray control, du counter-strafe et de la biomécanique main/poignet.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#121318] border border-white/5 hover:border-[#5865F2]/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#5865F2]/15 border border-[#5865F2]/30 flex items-center justify-center text-lg mb-4">
                  🧠
                </div>
                <h3 className="text-lg font-bold mb-2">Game Sense & Prise de Décision</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Apprends à anticiper les rotations adverses, à gérer l'économie d'équipe (save, buy, bonus) et à convertir tes situations d'embrayage (clutch).
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#121318] border border-white/5 hover:border-white/20 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-lg mb-4">
                  ⚡
                </div>
                <h3 className="text-lg font-bold mb-2">Maîtrise des Agents & Utilitaires</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Optimisation de ton kit de sorts : flashs invisibles, lineups d'exécutions, flèches de reconnaissance et smokes sans faille sur toutes les cartes.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#121318] border border-white/5 hover:border-white/20 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-lg mb-4">
                  📈
                </div>
                <h3 className="text-lg font-bold mb-2">Routine Quotidienne Adaptée</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Création d'un échauffement de 20 minutes sur Aim Lab / KovaaKs et Deathmatch ciblant spécifiquement tes faiblesses individuelles.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#121318] border border-white/5 hover:border-[#CA1C30]/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#CA1C30]/15 border border-[#CA1C30]/30 flex items-center justify-center text-lg mb-4">
                  💬
                </div>
                <h3 className="text-lg font-bold mb-2">Suivi Continu sur Discord</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Accès à ton salon privé élève avec retours sur tes clips, fiche de progression personnalisée et conseils entre les sessions.
                </p>
              </div>
            </div>
          </section>

          {/* Rangs concernés */}
          <section className="mb-20 p-8 sm:p-10 rounded-3xl bg-[#121318] border border-white/8 text-center max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Pour quel rang Valorant ?</h2>
            <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto mb-8 leading-relaxed">
              Que tu sois <strong>bloqué en Silver / Gold</strong> sans savoir pourquoi tes duels échouent, 
              ou <strong>Ascendant / Immortel</strong> cherchant à intégrer une équipe compétitive, 
              la méthode s'adapte à ton profil exact.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold uppercase tracking-wider text-zinc-300 font-mono">
              <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">Fer / Bronze</span>
              <span className="text-zinc-600">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">Argent / Or</span>
              <span className="text-zinc-600">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">Platine / Diamant</span>
              <span className="text-zinc-600">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-[#00B4A0]/10 border border-[#00B4A0]/30 text-[#00D6BF]">Ascendant</span>
              <span className="text-zinc-600">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-[#CA1C30]/10 border border-[#CA1C30]/30 text-[#FF4655]">Immortel & Radiant</span>
            </div>
          </section>

          {/* FAQ Accordion Section */}
          <section className="mb-20 max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-xs uppercase tracking-[3px] text-[#CA1C30] font-mono mb-2">Questions Fréquentes</h2>
              <p className="text-2xl sm:text-3xl font-bold tracking-tight">Tout savoir sur le coaching Valorant</p>
            </div>

            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-[#121318] border border-white/5">
                <h3 className="text-base font-bold text-white mb-2">Comment se déroule la première séance d'essai gratuite ?</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Tu choisis ton créneau sur le calendrier du site. Lors de la session Discord, nous échangeons sur tes objectifs, analysons ton profil de tir et décidons des priorités de ton entraînement. C'est 100 % gratuit et sans carte bancaire requise.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#121318] border border-white/5">
                <h3 className="text-base font-bold text-white mb-2">De quel équipement ai-je besoin ?</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Un PC faisant tourner Valorant, une connexion stable, un micro fonctionnel et Discord installé. Si possible, avoir un enregistrement (VOD) d'une de tes parties compétitives récentes prête à être analysée.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#121318] border border-white/5">
                <h3 className="text-base font-bold text-white mb-2">En combien de temps puis-je espérer rank up ?</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  La majorité des élèves réguliers constatent un gain de 1 à 3 rangs complets dès le premier mois grâce à la correction immédiate des erreurs d'automatisme et à l'application de la routine de visée.
                </p>
              </div>
            </div>
          </section>

          {/* Final Call to Action */}
          <section className="text-center py-12 px-6 rounded-3xl bg-gradient-to-b from-[#161720] to-[#0E0F14] border border-[#CA1C30]/20">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4 uppercase">
              Prêt à passer au niveau supérieur sur Valorant ?
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto mb-8 text-sm sm:text-base leading-relaxed">
              Rejoins les dizaines de joueurs déjà accompagnés par Coach Poulpy. Les places par semaine sont limitées pour garantir la qualité du suivi.
            </p>
            <Link
              href="/?booking=true"
              className="inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-[#CA1C30] to-[#E02438] text-white font-bold text-sm uppercase tracking-wider shadow-[0_8px_30px_rgba(202,28,48,0.4)] hover:brightness-110 transition-all"
            >
              Réserver mon coaching Valorant offert
            </Link>
          </section>
        </div>
      </main>

      <CyberFooter />
    </>
  );
}
