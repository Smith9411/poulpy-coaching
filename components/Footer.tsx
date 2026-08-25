'use client';

import Link from 'next/link';
import { MessageCircle, Video, Monitor, Coffee } from 'lucide-react';

export default function Footer() {
  const socialLinks = [
    { icon: MessageCircle, href: 'https://konect.gg/Mister_Poulpi', label: 'Discord' },
    { icon: Monitor, href: 'https://www.twitch.tv/ccs_poulpy', label: 'Twitch' },
    { icon: Video, href: 'https://www.youtube.com/@Poulpy_C', label: 'YouTube' },
    { icon: Video, href: 'https://www.tiktok.com/@poulpy_ccs', label: 'TikTok' },
  ];

  const links = [
    { href: '#coaching', label: 'Coaching' },
    { href: '#valorant', label: 'Valorant' },
    { href: '#apex', label: 'Apex' },
    { href: '#aim', label: 'Aim' },
    { href: '#tarifs', label: 'Tarifs' },
    { href: '#faq', label: 'FAQ' },
    { href: '#contact', label: 'Contact' },
  ];

  return (
    <footer className="relative border-t border-white/5 bg-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center overflow-hidden">
                <img
                  src="/poulpy-profile.png"
                  alt="Poulpy"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-xl font-bold">POULPY</div>
                <div className="text-sm text-gray-400">Gaming Coach</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Coaching compétitif pour joueurs Valorant, Apex Legends et passionnés d'aim.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">Navigation</h3>
            <div className="grid grid-cols-2 gap-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold mb-4">Réseaux sociaux</h3>
            <div className="flex gap-3 mb-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg glass flex items-center justify-center hover:bg-white/10 transition-all group"
                  aria-label={social.label}
                >
                  <social.icon size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
            <a
              href="https://ko-fi.com/poulpy_"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-orange-500 rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-pink-500/50 transition-all"
            >
              <Coffee size={18} />
              Support sur Ko-fi
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/5 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Poulpy. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
