"use client";

import React, { useState } from "react";
import DecryptedText from "./DecryptedText";
import { Terminal, Shield, ArrowUp, X, ShieldCheck, FileText, Lock } from "lucide-react";

export default function CyberFooter() {
  const [legalModal, setLegalModal] = useState<"cgv" | "privacy" | "legal" | null>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <footer className="py-16 px-6 lg:px-12 bg-transparent font-mono text-xs text-[#F5F4F0]/50 space-y-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#F5F4F0] font-bold text-sm tracking-widest">
              <span className="w-2 h-2 bg-[#CA1C30]" />
              <span>POULPY COACHING · PERFORMANCE ENGINE</span>
            </div>
            <p className="text-[#F5F4F0]/40 max-w-md text-xs leading-relaxed">
              Plateforme e-sportive de haute précision. Zéro compromis visuel, 100% axé sur la performance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-[11px]">
            <a href="/coaching-valorant" className="hover:text-[#CA1C30] transition-colors font-bold text-white">
              [COACHING VALORANT]
            </a>
            <a href="/coaching-apex-legends" className="hover:text-[#CA1C30] transition-colors font-bold text-white">
              [COACHING APEX LEGENDS]
            </a>
            <a href="/avis" className="hover:text-[#CA1C30] transition-colors font-bold">
              [TOUS LES AVIS]
            </a>
            <a href="/contact" className="hover:text-[#CA1C30] transition-colors font-bold">
              [CONTACT &amp; SUPPORT]
            </a>
            <button
              onClick={() => setLegalModal("legal")}
              className="hover:text-white transition-colors cursor-pointer text-[#F5F4F0]/60"
            >
              [MENTIONS LÉGALES]
            </button>
            <button
              onClick={() => setLegalModal("cgv")}
              className="hover:text-white transition-colors cursor-pointer text-[#F5F4F0]/60"
            >
              [CGV · CONDITIONS]
            </button>
            <button
              onClick={() => setLegalModal("privacy")}
              className="hover:text-white transition-colors cursor-pointer text-[#F5F4F0]/60"
            >
              [CONFIDENTIALITÉ · RGPD]
            </button>
            <a href="https://discord.gg/BC24FH4xpd" target="_blank" rel="noreferrer" className="hover:text-[#00B4A0] transition-colors">
              [DISCORD]
            </a>
            <a href="https://twitch.tv/poulpy_coaching" target="_blank" rel="noreferrer" className="hover:text-[#9146FF] transition-colors">
              [TWITCH]
            </a>
            <a href="https://youtube.com/@Poulpy_C" target="_blank" rel="noreferrer" className="hover:text-[#CA1C30] transition-colors">
              [YOUTUBE]
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-[#F5F4F0]/30">
          <div>
            &copy; 2026 POULPY COACHING. TOUS DROITS RÉSERVÉS.
          </div>

          <button
            onClick={scrollToTop}
            className="btn-cyber-ghost py-1 px-3 text-[10px] flex items-center gap-1.5 cursor-pointer"
          >
            <span>RETOUR HAUT DE PAGE</span>
            <ArrowUp className="w-3 h-3 text-[#CA1C30]" />
          </button>
        </div>
      </footer>

      {/* Interactive Modal: CGV / Terms of Service */}
      {legalModal === "cgv" && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-mono">
          <div className="relative w-full max-w-2xl bg-[#121117] border border-[#CA1C30]/50 shadow-[0_0_60px_rgba(0,0,0,0.9)] p-6 sm:p-8 space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#CA1C30]" />
                <h3 className="text-xl font-display text-[#F5F4F0] tracking-wider">
                  CONDITIONS GÉNÉRALES DE VENTE &amp; DE SERVICE (CGV)
                </h3>
              </div>
              <button
                onClick={() => setLegalModal(null)}
                className="p-1 border border-white/15 text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-[#F5F4F0]/70 leading-relaxed">
              <div>
                <strong className="text-[#F5F4F0] block mb-1">01. PRESTATIONS &amp; OBJET</strong>
                <p>
                  Poulpy Coaching dispense des prestations de formation et de perfectionnement tactique e-sportif (Valorant, Apex Legends) sous forme de sessions individuelles en visioconférence ou d&apos;analyses de replays VOD.
                </p>
              </div>

              <div>
                <strong className="text-[#F5F4F0] block mb-1">02. MODALITÉS DE RÉSERVATION &amp; CRÉNEAUX</strong>
                <p>
                  Toute séance est validée après sélection de formule et confirmation du créneau. L&apos;élève s&apos;engage à être présent et joignable sur Discord à l&apos;heure convenue avec son matériel opérationnel.
                </p>
              </div>

              <div>
                <strong className="text-[#F5F4F0] block mb-1">03. POLITIQUE DE REPORT &amp; D&apos;ANNULATION</strong>
                <p>
                  Un créneau peut être reporté gratuitement jusqu&apos;à 24 heures avant le début de la séance via message Discord ou e-mail. En cas d&apos;absence non signalée ou d&apos;annulation tardive, la séance est considérée comme due.
                </p>
              </div>

              <div>
                <strong className="text-[#F5F4F0] block mb-1">04. DROIT DE RÉTRACTATION</strong>
                <p>
                  Conformément aux articles L221-18 et suivants du Code de la consommation, vous bénéficiez d&apos;un délai légal de 14 jours, sauf si la prestation a été pleinement exécutée avant la fin de ce délai avec votre accord préalable.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setLegalModal(null)}
                className="btn-cyber-primary py-2 px-6 text-xs cursor-pointer"
              >
                <span>COMPRIS &amp; FERMER</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Modal: Privacy Policy / RGPD */}
      {legalModal === "privacy" && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-mono">
          <div className="relative w-full max-w-2xl bg-[#121117] border border-[#00B4A0]/50 shadow-[0_0_60px_rgba(0,0,0,0.9)] p-6 sm:p-8 space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#00B4A0]" />
                <h3 className="text-xl font-display text-[#F5F4F0] tracking-wider">
                  POLITIQUE DE CONFIDENTIALITÉ &amp; PROTECTION RGPD
                </h3>
              </div>
              <button
                onClick={() => setLegalModal(null)}
                className="p-1 border border-white/15 text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-[#F5F4F0]/70 leading-relaxed">
              <div>
                <strong className="text-[#F5F4F0] block mb-1">01. DONNÉES RECUEILLIES</strong>
                <p>
                  Les données transmises lors de la réservation (pseudo Discord, pseudo de jeu Riot ID / EA, adresse e-mail et objectifs) sont strictement réservées à la bonne tenue de la séance de coaching.
                </p>
              </div>

              <div>
                <strong className="text-[#F5F4F0] block mb-1">02. ZÉRO REVENTE &amp; CONFIDENTIALITÉ ABSOLUE</strong>
                <p>
                  Aucune donnée personnelle n&apos;est transmise, vendue ou louée à des tiers. Les enregistrements de vos sessions de coaching restent strictement privés et ne font l&apos;objet d&apos;aucune diffusion publique sans votre accord écrit explicite.
                </p>
              </div>

              <div>
                <strong className="text-[#F5F4F0] block mb-1">03. SÉCURITÉ &amp; PAIEMENTS</strong>
                <p>
                  Les transactions bancaires sont chiffrées de bout en bout et traitées par des processeurs certifiés PCI-DSS (Stripe). Poulpy Coaching ne conserve aucune coordonnée bancaire.
                </p>
              </div>

              <div>
                <strong className="text-[#F5F4F0] block mb-1">04. VOS DROITS (ACCÈS &amp; SUPPRESSION)</strong>
                <p>
                  Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification et d&apos;effacement de vos données. Pour exercer ce droit, contactez simplement le coach sur Discord ou à l&apos;adresse contact@poulpy-coaching.fr.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setLegalModal(null)}
                className="btn-cyber-primary py-2 px-6 text-xs cursor-pointer"
              >
                <span>FERMER LE REGISTRE</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Modal: Mentions Légales (LCEN & Conformité) */}
      {legalModal === "legal" && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-mono">
          <div className="relative w-full max-w-2xl bg-[#121117] border border-white/20 shadow-[0_0_60px_rgba(0,0,0,0.9)] p-6 sm:p-8 space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#CA1C30]" />
                <h3 className="text-xl font-display text-[#F5F4F0] tracking-wider">
                  MENTIONS LÉGALES &amp; INFORMATIONS ÉDITEUR
                </h3>
              </div>
              <button
                onClick={() => setLegalModal(null)}
                className="p-1 border border-white/15 text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-[#F5F4F0]/70 leading-relaxed">
              <div>
                <strong className="text-[#F5F4F0] block mb-1">01. ÉDITEUR DE LA PLATEFORME</strong>
                <p>
                  Le site <span className="text-[#00B4A0]">poulpy-coaching.fr</span> est édité par Coach Poulpy (Poulpy Coaching), prestataire indépendant de services d&apos;entraînement, de coaching e-sportif et d&apos;analyse tactique.
                </p>
                <p className="mt-1 text-[#F5F4F0]/50">
                  Contact officiel : <span className="text-white">contact@poulpy-coaching.fr</span> ou via le serveur Discord communautaire officiel.
                </p>
              </div>

              <div>
                <strong className="text-[#F5F4F0] block mb-1">02. HÉBERGEMENT &amp; INFRASTRUCTURE</strong>
                <p>
                  • <strong>Hébergement de l&apos;application :</strong> Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis (Serveurs CDN Edge sécurisés).
                </p>
                <p className="mt-1">
                  • <strong>Nom de domaine &amp; Zone DNS :</strong> OVHcloud SAS, 2 rue Kellermann, 59100 Roubaix, France.
                </p>
                <p className="mt-1">
                  • <strong>Base de données &amp; Authentification :</strong> Supabase Inc., 970 Toa Payoh North #07-04, Singapour (Infrastructure PostgreSQL chiffrée SSL/TLS).
                </p>
              </div>

              <div>
                <strong className="text-[#F5F4F0] block mb-1">03. PAIEMENTS &amp; SÉCURITÉ DES TRANSACTIONS</strong>
                <p>
                  Les transactions bancaires sont intégralement opérées par <strong>Stripe Payments Europe, Ltd.</strong> (1 Grand Canal Street Lower, Grand Canal Dock, Dublin, D02 H210, Irlande), établissement certifié conforme au standard de sécurité bancaire le plus strict <strong>PCI-DSS Niveau 1</strong>. Aucune donnée bancaire n&apos;est stockée sur les serveurs de Poulpy Coaching.
                </p>
              </div>

              <div>
                <strong className="text-[#F5F4F0] block mb-1">04. PROPRIÉTÉ INTELLECTUELLE</strong>
                <p>
                  L&apos;ensemble des contenus, marques visuelles, mascottes, codes graphiques et pédagogies de coaching présents sur ce site sont protégés par le droit d&apos;auteur. Valorant et Apex Legends sont des marques déposées respectivement de Riot Games et Electronic Arts, citées ici uniquement aux fins d&apos;identification du support des cours de perfectionnement.
                </p>
              </div>

              <div>
                <strong className="text-[#F5F4F0] block mb-1">05. COOKIES &amp; RESPECT DE LA VIE PRIVÉE</strong>
                <p>
                  Ce site n&apos;utilise aucun cookie publicitaire ou traceur tiers intrusif. La mesure d&apos;audience est assurée par Vercel Web Analytics, conforme aux recommandations de la CNIL et au RGPD sans collecte de données nominatives.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setLegalModal(null)}
                className="btn-cyber-primary py-2 px-6 text-xs cursor-pointer"
              >
                <span>FERMER LES MENTIONS</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
