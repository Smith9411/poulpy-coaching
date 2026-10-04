import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact & Discord Officiel | Poulpy Coaching",
  description:
    "Rejoignez le Discord officiel de Poulpy Coaching ou contactez directement Coach Poulpy pour planifier votre séance de coaching Valorant ou Apex Legends.",
  alternates: {
    canonical: "https://poulpy-coaching.vercel.app/contact",
  },
  openGraph: {
    title: "Contact & Discord — Poulpy Coaching",
    description: "Rejoins la communauté Discord et réserve ta session de coaching avec Poulpy.",
    url: "https://poulpy-coaching.vercel.app/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
