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
  title: "POULPY // CYBERCORE ESPORT PROVING GROUND",
  description:
    "Plateforme de coaching e-sport d'élite pour Valorant et Apex Legends. Ballistic WebGL Engine, VOD chirurgie, analyse réflexe sub-pixel.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Poulpy Coaching",
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/apple-touch-icon.png",
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

          {/* Global Hairline Cyber Grid Overlay */}
          <div className="fixed inset-0 cyber-grid pointer-events-none z-0" aria-hidden="true" />

          {/* Smooth Scroll Engine */}
          <SmoothScroll>
            <div className="relative z-10">{children}</div>
          </SmoothScroll>
        </AuthProvider>
      </body>
    </html>
  );
}

