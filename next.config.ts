import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Strict Mode monte les composants deux fois en dev, ce qui rejoue chaque
  // animation framer-motion (flash opacity:0 avant l'apparition).
  reactStrictMode: false,
  // Injecte un timestamp unique à chaque build — utilisé comme version de l'app
  // pour détecter les mises à jour côté client (notifications admin).
  env: {
    NEXT_PUBLIC_BUILD_TIME: Date.now().toString(),
  },
};

export default nextConfig;
