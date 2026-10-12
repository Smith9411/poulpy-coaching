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
  async redirects() {
    return [
      {
        source: '/coaching',
        destination: '/#booking',
        permanent: false,
      },
      {
        source: '/booking',
        destination: '/#booking',
        permanent: false,
      },
      {
        source: '/tarifs',
        destination: '/#booking',
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
