import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import PwaRegister from "@/components/PwaRegister";
import SplashScreen from "@/components/SplashScreen";
import SmoothScroll from "@/components/SmoothScroll";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.poulpy-coaching.fr"),
  title: {
    default: "Poulpy Coaching — Coaching Valorant & Apex Legends | Coach E-sport France",
    template: "%s | Poulpy Coaching",
  },
  description:
    "Poulpy Coaching : Coaching Valorant & Apex Legends en France par Coach Poulpy (Atheris Esport). Cours particuliers, analyse VOD chirurgicale, biomécanique aim, routine personnalisée et séance d'essai offerte.",
  applicationName: "Poulpy Coaching",
  authors: [{ name: "Poulpy", url: "https://www.poulpy-coaching.fr" }],
  creator: "Poulpy",
  publisher: "Poulpy Coaching",
  alternates: {
    canonical: "https://www.poulpy-coaching.fr",
  },
  keywords: [
    "Poulpy",
    "Poulpy Coaching",
    "PoulpyCoaching",
    "Coach Poulpy",
    "Poulpi",
    "Poulpi Coaching",
    "Coaching Valorant",
    "Valorant Coaching",
    "Coach Valorant",
    "Valorant Coach",
    "Coaching Valorant France",
    "Coaching Valorant FR",
    "Cours Valorant",
    "Cours Particulier Valorant",
    "Analyse VOD Valorant",
    "Aim Training Valorant",
    "Aim Coach Valorant",
    "Progresser sur Valorant",
    "Monter Immortel Valorant",
    "Monter Radiant Valorant",
    "Coaching Apex",
    "Apex Coaching",
    "Coaching Apex Legends",
    "Apex Legends Coaching",
    "Coach Apex",
    "Apex Coach",
    "Coach Apex Legends",
    "Coaching Apex France",
    "Coaching Apex FR",
    "Cours Apex Legends",
    "Movement Coach Apex",
    "Aim Coaching Apex",
    "Tap Strafe Coaching",
    "Superglide Coaching",
    "Esport Coaching",
    "Atheris Esport",
  ],
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://www.poulpy-coaching.fr",
    siteName: "Poulpy Coaching",
    title: "Poulpy Coaching — Coach E-sport Valorant & Apex Legends",
    description:
      "Coaching e-sport d'élite sur Valorant et Apex Legends par Coach Poulpy. Analyse VOD chirurgicale, routine aim personnalisée et progression garantie.",
    images: [
      {
        url: "/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Poulpy Coaching - Logo Officiel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Poulpy Coaching — Coach E-sport Valorant & Apex Legends",
    description:
      "Coaching e-sport d'élite sur Valorant et Apex Legends par Coach Poulpy (Atheris Esport).",
    images: ["/icons/icon-512x512.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Poulpy Coaching",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/poulpy-favicon.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/poulpy-favicon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/poulpy-favicon.png",
  },
  verification: {
    google: "nT2EwQTNqVoSAscGKb752xfoEhAUA6UO3mZBD8D04DQ",
  },
};

export const viewport: Viewport = {
  themeColor: "#CA1C30",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://www.poulpy-coaching.fr/#website",
      "url": "https://www.poulpy-coaching.fr",
      "name": "Poulpy Coaching",
      "alternateName": ["Poulpy", "Coach Poulpy", "PoulpyCoaching", "Poulpi Coaching", "Poulpi"],
      "description": "Plateforme officielle de coaching e-sport Valorant et Apex Legends par Coach Poulpy.",
      "publisher": {
        "@type": "Organization",
        "@id": "https://www.poulpy-coaching.fr/#organization",
        "name": "Poulpy Coaching",
        "url": "https://www.poulpy-coaching.fr",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.poulpy-coaching.fr/icons/icon-512x512.png"
        }
      }
    },
    {
      "@type": ["ProfessionalService", "Organization", "EducationalOrganization"],
      "@id": "https://www.poulpy-coaching.fr/#organization",
      "name": "Poulpy Coaching",
      "alternateName": ["Coach Poulpy", "Poulpy", "Poulpi Coaching", "PoulpyCoaching"],
      "url": "https://www.poulpy-coaching.fr",
      "logo": "https://www.poulpy-coaching.fr/icons/icon-512x512.png",
      "image": "https://www.poulpy-coaching.fr/icons/icon-512x512.png",
      "description": "Coaching e-sport d'élite sur Valorant et Apex Legends. Analyse VOD chirurgicale, biomécanique de visée et routine d'entraînement sur-mesure par Poulpy (Atheris Esport).",
      "disambiguatingDescription": "Plateforme d'entraînement et de cours e-sport pour joueurs de jeux vidéo compétitifs sur PC (Valorant et Apex Legends). Aucun rapport avec le fitness, le coaching sportif physique ou la musculation.",
      "priceRange": "€€",
      "founder": {
        "@type": "Person",
        "name": "Poulpy",
        "alternateName": "Coach Poulpy",
        "jobTitle": "Coach E-sport Valorant & Apex Legends",
        "sameAs": [
          "https://www.youtube.com/@Poulpy_C",
          "https://www.twitch.tv/poulpy_coaching",
          "https://discord.gg/BC24FH4xpd"
        ]
      },
      "knowsAbout": [
        "Valorant",
        "Apex Legends",
        "Coaching Valorant",
        "Valorant Coaching",
        "Coaching Apex Legends",
        "Apex Coaching",
        "E-sport",
        "Gaming Coaching",
        "VOD Review",
        "Aim Training",
        "Crosshair Placement",
        "KovaaKs",
        "Aim Lab"
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Offres de Coaching E-sport",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Coaching Valorant",
              "alternateName": "Valorant Coaching France",
              "description": "Coaching Valorant personnalisé : cours particuliers, analyse VOD chirurgicale, crosshair placement, routines KovaaKs/Aim Lab et prise de décision pour monter Immortel & Radiant.",
              "provider": {
                "@id": "https://www.poulpy-coaching.fr/#organization"
              }
            },
            "price": "10.00",
            "priceCurrency": "EUR"
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Coaching Apex Legends",
              "alternateName": "Apex Coaching France",
              "description": "Coaching Apex Legends individuel : tracking haute vitesse réactif, movement avancé (tap-strafe, superglide, wall bounce) et gestion 3v3 vers Master & Predator.",
              "provider": {
                "@id": "https://www.poulpy-coaching.fr/#organization"
              }
            },
            "price": "10.00",
            "priceCurrency": "EUR"
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Session Diagnostic Gratuite",
              "description": "Séance de diagnostic offerte pour tester le coaching Valorant ou Apex Legends et préparer votre plan de progression.",
              "provider": {
                "@id": "https://www.poulpy-coaching.fr/#organization"
              }
            },
            "price": "0.00",
            "priceCurrency": "EUR"
          }
        ]
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "5.0",
        "bestRating": "5",
        "worstRating": "1",
        "ratingCount": "128",
        "reviewCount": "128"
      },
      "sameAs": [
        "https://www.youtube.com/@Poulpy_C",
        "https://www.twitch.tv/poulpy_coaching",
        "https://discord.gg/BC24FH4xpd"
      ]
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.poulpy-coaching.fr/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Qu'est-ce que Poulpy Coaching (poulpy-coaching.fr) ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Poulpy Coaching (poulpy-coaching.fr) est le service officiel de coaching e-sport et jeux vidéo en France spécialisé sur Valorant et Apex Legends. Contrairement aux services de coaching sportif ou de remise en forme physique aux noms proches, Poulpy Coaching est exclusivement dédié à la performance gaming compétitive : cours particuliers Valorant (Immortel #1580) et coaching Apex Legends (3x Predator #450), analyse VOD, aim training (KovaaKs / Aim Lab) et suivi personnalisé sur Discord."
          }
        },
        {
          "@type": "Question",
          "name": "Comment se déroule une séance de coaching Valorant ou Apex Legends ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Toutes les séances de coaching Valorant et Apex Legends se déroulent en direct sur notre serveur Discord officiel, en vocal privé avec partage d'écran. Ensemble, on analyse ton gameplay (en live ou via une VOD de tes parties classées), on identifie tes erreurs de placement, de prise de décision ou de mécanique, et on travaille dessus en temps réel avec des exercices concrets adaptés à ton rang."
          }
        },
        {
          "@type": "Question",
          "name": "Faut-il déjà avoir un bon niveau sur Valorant ou Apex pour prendre du coaching ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Pas du tout ! Que tu sois Fer/Bronze sur Valorant ou Débutant/Or sur Apex Legends, ou que tu cherches à franchir le cap Diamant, Ascendant, Immortel ou Master, le coaching s'adapte à 100% à ton niveau actuel. Le but est justement de t'éviter de prendre de mauvaises habitudes et de te faire progresser beaucoup plus vite."
          }
        },
        {
          "@type": "Question",
          "name": "Quels sont les tarifs d'un coaching Valorant ou Apex Legends ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "La première Session Diagnostic est 100% gratuite et sans engagement pour faire le point sur ton niveau. Ensuite, la séance de Coaching Classique (1h) est à 10€, et la formule Coaching Pro (suivi complet avec plan d'entraînement Aim Lab / KovaaKs personnalisé) est à 20€."
          }
        }
      ]
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="nT2EwQTNqVoSAscGKb752xfoEhAUA6UO3mZBD8D04DQ" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="192x192" href="/poulpy-favicon.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512x512.png" />
        <link rel="shortcut icon" type="image/png" href="/poulpy-favicon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/poulpy-favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&family=Unbounded:wght@600;700;800;900&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('poulpy_theme')==='light')document.documentElement.classList.add('light')}catch(e){}",
          }}
        />
      </head>
      <body className="bg-black text-white min-h-screen selection:bg-[#CA1C30] selection:text-black">
        <AuthProvider>
          <SplashScreen />
          <PwaRegister />

          {/* Smooth Scroll Engine */}
          <SmoothScroll>
            <div className="relative z-10">{children}</div>
          </SmoothScroll>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}

