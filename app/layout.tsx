import type { Metadata, Viewport } from "next";
import { Unbounded, Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import PwaRegister from "@/components/PwaRegister";
import SplashScreen from "@/components/SplashScreen";
import SmoothScroll from "@/components/SmoothScroll";

const unbounded = Unbounded({
  weight: ["700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-unbounded",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-accent",
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
    <html lang="fr" suppressHydrationWarning className={`${unbounded.variable} ${plusJakarta.variable} ${spaceGrotesk.variable}`}>
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

