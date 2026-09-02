import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Strict Mode monte les composants deux fois en dev, ce qui rejoue chaque
  // animation framer-motion (flash opacity:0 avant l'apparition).
  reactStrictMode: false,
};

export default nextConfig;
