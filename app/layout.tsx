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
  title: "Poulpy Coaching",
  description:
    "Plateforme de coaching e-sport d'élite pour Valorant et Apex Legends. Ballistic WebGL Engine, VOD chirurgie, analyse réflexe sub-pixel.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Poulpy Coaching",
  },
  icons: {
    icon: [
      { url: "/poulpy-octopus.png", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/poulpy-octopus.png" },
      { url: "/icons/apple-touch-icon.png", sizes: "180x180" },
    ],
    shortcut: "/poulpy-octopus.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#FF7582",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning className={`${bebasNeue.variable} ${jetbrainsMono.variable}`}>
      <head>
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

