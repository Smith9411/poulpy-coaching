import type { Metadata, Viewport } from "next";
import { Bebas_Neue, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import PwaRegister from "@/components/PwaRegister";
import SplashScreen from "@/components/SplashScreen";
import SmoothScroll from "@/components/SmoothScroll";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://poulpy-coaching.vercel.app"),
  title: "Poulpy Coaching",
  description:
    "Plateforme de coaching e-sport d'élite pour Valorant et Apex Legends. Ballistic WebGL Engine, VOD chirurgie, analyse réflexe sub-pixel.",
  applicationName: "Poulpy Coaching",
  authors: [{ name: "Poulpy" }],
  generator: "Next.js",
  keywords: ["Poulpy", "Poulpy Coaching", "Coaching Valorant", "Coaching Apex Legends", "Aim Training", "Esport", "Atheris"],
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://poulpy-coaching.vercel.app",
    siteName: "Poulpy Coaching",
    title: "Poulpy Coaching",
    description:
      "Plateforme de coaching e-sport d'élite pour Valorant et Apex Legends. Analyse chirurgicale, VOD review et progression garantie.",
    images: [
      {
        url: "/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Poulpy Coaching Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Poulpy Coaching",
    description:
      "Plateforme de coaching e-sport d'élite pour Valorant et Apex Legends.",
    images: ["/icons/icon-512x512.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Poulpy Coaching",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#FF7582",
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
      "alternateName": ["Poulpy", "PoulpyCoaching"],
      "description": "Plateforme de coaching e-sport d'élite pour Valorant et Apex Legends.",
      "publisher": {
        "@type": "Organization",
        "name": "Poulpy Coaching",
        "url": "https://poulpy-coaching.vercel.app",
        "logo": {
          "@type": "ImageObject",
          "url": "https://poulpy-coaching.vercel.app/icons/icon-512x512.png"
        }
      }
    },
    {
      "@type": "Organization",
      "@id": "https://poulpy-coaching.vercel.app/#organization",
      "name": "Poulpy Coaching",
      "url": "https://poulpy-coaching.vercel.app",
      "logo": "https://poulpy-coaching.vercel.app/icons/icon-512x512.png",
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
    <html lang="fr" suppressHydrationWarning className={`${bebasNeue.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon.png" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
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
      <body className="bg-black text-white min-h-screen selection:bg-[#FF7582] selection:text-black">
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

