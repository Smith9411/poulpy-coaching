'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { MessageCircle, ArrowRight, Mail, Globe, MapPin } from 'lucide-react';

export default function Contact() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block glass px-4 py-2 rounded-full mb-4">
            <span className="text-sm text-purple-400 font-medium">CONTACT</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            On en <span className="text-gradient">discute ?</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            La meilleure façon de me rejoindre pour parler coaching, c'est par là.
          </p>
        </motion.div>

        {/* Discord CTA - Main */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <div className="glass-dark rounded-3xl p-8 sm:p-12 relative overflow-hidden border border-purple-500/30">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-cyan-500/10" />
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-purple-600/20 to-transparent rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
                <MessageCircle size={32} className="text-white" />
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">Rejoins le Discord</h2>
                <p className="text-gray-400 text-lg">
                  C'est là que tout se passe : réservation, questions, suivi, communauté.
                </p>
              </div>

              <a
                href="https://konect.gg/Mister_Poulpi"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105"
              >
                <MessageCircle size={24} />
                Rejoindre le serveur Discord
                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </a>

              <p className="text-sm text-gray-500">
                Invitation permanente • <span className="text-green-400">+100 membres</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Other contact methods */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid sm:grid-cols-3 gap-6 mb-16"
        >
          <div className="glass-dark rounded-2xl p-6 text-center hover:bg-white/5 transition-all group">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Mail size={24} className="text-white" />
            </div>
            <h3 className="font-bold text-lg mb-2">Email</h3>
            <p className="text-gray-400 text-sm">
              Pour les demandes pro / partenariats
            </p>
            <a
              href="mailto:poulpy.coaching@gmail.com"
              className="mt-3 inline-block text-purple-400 hover:text-purple-300 text-sm font-medium"
            >
              poulpy.coaching@gmail.com
            </a>
          </div>

          <div className="glass-dark rounded-2xl p-6 text-center hover:bg-white/5 transition-all group">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Globe size={24} className="text-white" />
            </div>
            <h3 className="font-bold text-lg mb-2">Réseaux</h3>
            <p className="text-gray-400 text-sm">
              Suis l'actu et les tips gratuits
            </p>
            <div className="mt-3 flex items-center justify-center gap-3">
              <a
                href="https://www.twitch.tv/ccs_poulpy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-purple-600 transition-colors"
                aria-label="Twitch"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M21 1.71v20.58c0 .94-.76 1.71-1.7 1.71H4.7c-.94 0-1.71-.76-1.71-1.71V1.71C3 0.77 3.76 0 4.7 0h14.6c.94 0 1.7.77 1.7 1.71zM8.79 17.74l8.5-6.37c.51-.38.51-1.25 0-1.63l-8.5-6.37c-.51-.38-1.25-.08-1.25.67v12.73c0 .75.74 1.05 1.25.67z"/></svg>
              </a>
              <a
                href="https://www.youtube.com/@Poulpy_C"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-red-500 transition-colors"
                aria-label="YouTube"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a
                href="https://www.tiktok.com/@poulpy_ccs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="TikTok"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.548,3.256c-2.642,0.881-5.122,2.26-7.057,4.13C4.395,8.777,3.537,10.338,3.25,12.147 C2.977,13.956,3.23,15.757,3.99,17.373c0.58,1.248,1.555,2.359,2.881,3.15c1.172,0.697,2.467,1.138,3.787,1.274 c1.066,0.108,2.126,0.176,3.162,0.176c2.642,0,5.122-0.881,7.057-4.13c1.172-1.182,2.03-2.743,2.307-4.552 c0.273-1.809,0.02-3.61-0.252-5.419c-0.215-1.424-0.66-2.732-1.392-3.871C20.771,4.088,19.59,3.468,18.203,2.899 C16.794,2.307,15.36,2.004,13.735,2.025C13.239,2.029,12.724,2.045,12.215,2.072C12.316,2.387,12.408,2.707,12.5,3.023 C12.532,3.159,12.536,3.237,12.548,3.256z M12.5,19.5c-3.859,0-7.076-1.302-9.587-3.598 c-0.279-0.256-0.556-0.503-0.806-0.779c-0.446-0.493-0.766-1.105-0.909-1.774C0.614,11.64,0.38,10.342,0.36,9.044c0-1.337,0.223-2.67,0.612-3.975 c0.319-1.08,0.779-2.103,1.367-3.037c0.554-0.879,1.248-1.681,2.03-2.341c0.734-0.619,1.545-1.138,2.366-1.521 c0.819-0.381,1.655-0.714,2.498-0.989c0.511-0.168,1.034-0.312,1.562-0.421c-0.171,0.786-0.399,1.589-0.632,2.4c-0.193,0.668-0.427,1.341-0.708,2.008 c-0.409,1.222-1.043,2.395-1.815,3.399c-0.663,0.866-1.493,1.653-2.473,2.326C3.46,17.226,2.554,18.267,2.04,19.476 C2.554,18.267,3.46,17.226,4.523,16.422c0.98-0.673,1.81-1.46,2.473-2.326c0.772-1.004,1.406-2.177,1.815-3.399 c0.281-0.667,0.515-1.34,0.708-2.008c0.233-0.811,0.461-1.614,0.632-2.4c0.528,0.109,1.051,0.253,1.562,0.421 c0.843,0.275,1.679,0.608,2.498,0.989c0.821,0.383,1.632,0.902,2.366,1.521c0.782,0.66,1.476,1.462,2.03,2.341 c0.588,0.934,1.048,1.957,1.367,3.037c0.389,1.305,0.612,2.638,0.612,3.975c0,1.298-0.23,2.596-0.63,3.728 c-0.143,0.669-0.463,1.281-0.909,1.774c-0.25,0.276-0.527,0.523-0.806,0.779C19.576,18.198,16.359,19.5,12.5,19.5z"/></svg>
              </a>
            </div>
          </div>

          <div className="glass-dark rounded-2xl p-6 text-center hover:bg-white/5 transition-all group">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <MapPin size={24} className="text-white" />
            </div>
            <h3 className="font-bold text-lg mb-2">Localisation</h3>
            <p className="text-gray-400 text-sm">
              France 🇫🇷 — Fuseau horaire CET/CEST
            </p>
            <p className="mt-3 text-purple-400 text-sm font-medium">
              Disponible 14h-23h
            </p>
          </div>
        </motion.div>

        {/* Back to home */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 glass rounded-xl font-semibold hover:bg-white/10 transition-all group"
          >
            <ArrowRight size={20} className="-rotate-90 group-hover:-translate-x-1 transition-transform" />
            Retour à l'accueil
          </Link>
        </motion.div>
      </div>
    </main>
  );
}