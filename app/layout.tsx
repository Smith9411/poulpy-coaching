import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import PwaRegister from "@/components/PwaRegister";
import SplashScreen from "@/components/SplashScreen";
import SmoothScroll from "@/components/SmoothScroll";

export const metadata: Metadata = {
  metadataBase: new URL("https://poulpy-coaching.vercel.app"),
  title: {
    default: "Poulpy Coaching — Coach E-sport Valorant & Apex Legends (Immortal & Predator)",
    template: "%s | Poulpy Coaching",
  },
  description:
    "Poulpy Coaching : Plateforme officielle de coaching e-sport d'élite sur Valorant et Apex Legends par Coach Poulpy (Atheris Esport). Analyse VOD chirurgicale, biomécanique aim, routine personnalisée et suivi Discord.",
  applicationName: "Poulpy Coaching",
  authors: [{ name: "Poulpy", url: "https://poulpy-coaching.vercel.app" }],
  creator: "Poulpy",
  publisher: "Poulpy Coaching",
  alternates: {
    canonical: "https://poulpy-coaching.vercel.app",
  },
  keywords: [
    "Poulpy",
    "Poulpy Coaching",
    "PoulpyCoaching",
    "Coach Poulpy",
    "Poulpi",
    "Poulpi Coaching",
    "Coaching Valorant",
    "Coach Valorant France",
    "Coaching Apex Legends",
    "Coach Apex Legends",
    "Aim Training",
    "Analyse VOD Valorant",
    "Cours Valorant",
    "Cours Apex Legends",
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
    url: "https://poulpy-coaching.vercel.app",
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
      { url: "/poulpy-favicon.png?v=4", type: "image/png" },
      { url: "/icons/icon-192x192.png?v=4", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png?v=4", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico?v=4", sizes: "any" },
    ],
    apple: [
      { url: "/poulpy-favicon.png?v=4", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/poulpy-favicon.png?v=4",
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
      "@id": "https://poulpy-coaching.vercel.app/#website",
      "url": "https://poulpy-coaching.vercel.app",
      "name": "Poulpy Coaching",
      "alternateName": ["Poulpy", "Coach Poulpy", "PoulpyCoaching", "Poulpi Coaching", "Poulpi"],
      "description": "Plateforme officielle de coaching e-sport Valorant et Apex Legends par Coach Poulpy.",
      "publisher": {
        "@type": "Organization",
        "@id": "https://poulpy-coaching.vercel.app/#organization",
        "name": "Poulpy Coaching",
        "url": "https://poulpy-coaching.vercel.app",
        "logo": {
          "@type": "ImageObject",
          "url": "https://poulpy-coaching.vercel.app/icons/icon-512x512.png"
        }
      }
    },
    {
      "@type": ["ProfessionalService", "Organization", "SportsActivityLocation"],
      "@id": "https://poulpy-coaching.vercel.app/#organization",
      "name": "Poulpy Coaching",
      "alternateName": ["Coach Poulpy", "Poulpy", "Poulpi Coaching", "PoulpyCoaching"],
      "url": "https://poulpy-coaching.vercel.app",
      "logo": "https://poulpy-coaching.vercel.app/icons/icon-512x512.png",
      "image": "https://poulpy-coaching.vercel.app/icons/icon-512x512.png",
      "description": "Coaching e-sport d'élite sur Valorant et Apex Legends. Analyse VOD, biomécanique de visée et routine d'entraînement sur-mesure par Poulpy.",
      "priceRange": "€€",
      "founder": {
        "@type": "Person",
        "name": "Poulpy",
        "alternateName": "Coach Poulpy",
        "jobTitle": "Coach E-sport Valorant & Apex Legends",
        "sameAs": [
          "https://www.youtube.com/@Poulpy_C",
          "https://www.twitch.tv/poulpy_coaching",
          "https://discord.gg/rJMg3ZZRkp"
        ]
      },
      "knowsAbout": [
        "Valorant",
        "Apex Legends",
        "Aim Training",
        "E-sport",
        "VOD Review",
        "Gaming Coaching",
        "KovaaKs",
        "Aim Lab"
      ],
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
        "https://discord.gg/rJMg3ZZRkp"
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
        <link rel="icon" type="image/png" href="/poulpy-favicon.png?v=4" />
        <link rel="shortcut icon" type="image/png" href="/poulpy-favicon.png?v=4" />
        <link rel="apple-touch-icon" href="/poulpy-favicon.png?v=4" />
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
      </body>
    </html>
  );
}

