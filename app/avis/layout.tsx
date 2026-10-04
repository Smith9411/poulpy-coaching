import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Avis & Témoignages Élèves | Poulpy Coaching",
  description:
    "Consultez les avis vérifiés et retours d'expérience des élèves ayant suivi les séances de coaching Valorant et Apex Legends avec Coach Poulpy. Note 5/5.",
  alternates: {
    canonical: "https://poulpy-coaching.vercel.app/avis",
  },
  openGraph: {
    title: "Avis & Témoignages Élèves — Poulpy Coaching",
    description:
      "Avis authentiques et retours d'expérience des élèves formés par Coach Poulpy sur Valorant et Apex Legends.",
    url: "https://poulpy-coaching.vercel.app/avis",
  },
};

export default function AvisLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
