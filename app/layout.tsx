import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Poulpy — Gaming Coach | Valorant, Apex & Aim",
  description: "Coaching compétitif pour joueurs Valorant, Apex Legends et passionnés d'aim. Analyse précise, Game Sense, et progression mesurable.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
