'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Comment se déroule une session ?',
      answer: 'Les sessions se déroulent sur Discord avec partage d\'écran. On analyse ensemble ton gameplay, on identifie les points à améliorer, et on met en place un plan d\'action concret.',
    },
    {
      question: 'Dois-je avoir un certain niveau ?',
      answer: 'Non, tous les niveaux sont acceptés. Que tu sois débutant ou joueur confirmé, le coaching s\'adapte à ton niveau actuel et tes objectifs.',
    },
    {
      question: 'Est-ce que tu coaches les débutants ?',
      answer: 'Absolument ! Le coaching est adapté à tous les niveaux. Pour les débutants, on se concentre sur les fondamentaux essentiels pour progresser rapidement.',
    },
    {
      question: 'Les sessions sont disponibles sur Discord ?',
      answer: 'Oui, toutes les sessions se font via Discord avec partage d\'écran et communication vocale pour un coaching interactif en temps réel.',
    },
    {
      question: 'Puis-je faire analyser une VOD ?',
      answer: 'Oui ! L\'analyse de VOD est incluse dans les sessions de 60 et 90 minutes. Tu peux m\'envoyer tes replays avant la session.',
    },
    {
      question: 'Quel jeu dois-je choisir ?',
      answer: 'Choisis le jeu sur lequel tu veux progresser. Si tu hésites, on peut faire une session mixte pour évaluer tes besoins sur plusieurs jeux.',
    },
    {
      question: 'Puis-je réserver plusieurs sessions ?',
      answer: 'Bien sûr ! Pour une progression optimale, je recommande au moins 2-3 sessions espacées pour mesurer les résultats et ajuster le plan.',
    },
    {
      question: 'Comment fonctionne le paiement ?',
      answer: 'Le paiement se fait en ligne de manière sécurisée lors de la réservation. Tu reçois ensuite une confirmation avec tous les détails de ta session.',
    },
  ];

  return (
    <section id="faq" className="py-20 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Questions <span className="text-gradient">fréquentes</span>
          </h2>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="glass-dark rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              >
                <span className="font-semibold text-lg pr-4">{faq.question}</span>
                <ChevronDown
                  size={24}
                  className={`flex-shrink-0 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <motion.div
                initial={false}
                animate={{
                  height: openIndex === index ? 'auto' : 0,
                  opacity: openIndex === index ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-5 text-gray-300 leading-relaxed">
                  {faq.answer}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
