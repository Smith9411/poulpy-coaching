'use client';

import Link from 'next/link';
import { MessageCircle, Monitor, Coffee } from 'lucide-react';

export default function Footer() {
  const socialLinks = [
    {
      icon: MessageCircle,
      href: 'https://konect.gg/Mister_Poulpi',
      label: 'Discord'
    },
    {
      icon: Monitor,
      href: 'https://www.twitch.tv/ccs_poulpy',
      label: 'Twitch'
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
      href: 'https://www.youtube.com/@Poulpy_C',
      label: 'YouTube'
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.548,3.256c-2.642,0.881-5.122,2.26-7.057,4.13C4.395,8.777,3.537,10.338,3.25,12.147 C2.977,13.956,3.23,15.757,3.99,17.373c0.58,1.248,1.555,2.359,2.881,3.15c1.172,0.697,2.467,1.138,3.787,1.274 c1.066,0.108,2.126,0.176,3.162,0.176c2.642,0,5.122-0.881,7.057-4.13c1.172-1.182,2.03-2.743,2.307-4.552 c0.273-1.809,0.02-3.61-0.252-5.419c-0.215-1.424-0.66-2.732-1.392-3.871C20.771,4.088,19.59,3.468,18.203,2.899 C16.794,2.307,15.36,2.004,13.735,2.025C13.239,2.029,12.724,2.045,12.215,2.072C12.316,2.387,12.408,2.707,12.5,3.023 C12.532,3.159,12.536,3.237,12.548,3.256z M12.5,19.5c-3.859,0-7.076-1.302-9.587-3.598 c-0.279-0.256-0.556-0.503-0.806-0.779c-0.446-0.493-0.766-1.105-0.909-1.774C0.614,11.64,0.38,10.342,0.36,9.044c0-1.337,0.223-2.67,0.612-3.975 c0.319-1.08,0.779-2.103,1.367-3.037c0.554-0.879,1.248-1.681,2.03-2.341c0.734-0.619,1.545-1.138,2.366-1.521 c0.819-0.381,1.655-0.714,2.498-0.989c0.511-0.168,1.034-0.312,1.562-0.421c-0.171,0.786-0.399,1.589-0.632,2.4c-0.193,0.668-0.427,1.341-0.708,2.008 c-0.409,1.222-1.043,2.395-1.815,3.399c-0.663,0.866-1.493,1.653-2.473,2.326C3.46,17.226,2.554,18.267,2.04,19.476 C2.554,18.267,3.46,17.226,4.523,16.422c0.98-0.673,1.81-1.46,2.473-2.326c0.772-1.004,1.406-2.177,1.815-3.399 c0.281-0.667,0.515-1.34,0.708-2.008c0.233-0.811,0.461-1.614,0.632-2.4c0.528,0.109,1.051,0.253,1.562,0.421 c0.843,0.275,1.679,0.608,2.498,0.989c0.821,0.383,1.632,0.902,2.366,1.521c0.782,0.66,1.476,1.462,2.03,2.341 c0.588,0.934,1.048,1.957,1.367,3.037c0.389,1.305,0.612,2.638,0.612,3.975c0,1.298-0.23,2.596-0.63,3.728 c-0.143,0.669-0.463,1.281-0.909,1.774c-0.25,0.276-0.527,0.523-0.806,0.779C19.576,18.198,16.359,19.5,12.5,19.5z"/>
        </svg>
      ),
      href: 'https://www.tiktok.com/@poulpy_ccs',
      label: 'TikTok'
    },
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
                  {typeof social.icon === 'function' ? (
                    <social.icon size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                  ) : (
                    <div className="text-gray-400 group-hover:text-white transition-colors" dangerouslySetInnerHTML={{ __html: social.icon.props?.children?.[0] || '' }} />
                  )}
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
