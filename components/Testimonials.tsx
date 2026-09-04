'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, ArrowRight } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const testimonials = [
    {
      name: 'Smith94',
      game: 'Valorant',
      rank: 'Platine → Ascendant 3',
      text: 'Incroyable progression ! Je suis passé de Platine à Ascendant 3 en quelques semaines. Le coaching de Poulpy sur le game sense et la prise de décision en clutch a tout changé. Il voit des choses que personne d\'autre ne voit. Vraiment le meilleur investissement pour mon jeu.',
      rating: 5,
    },
    {
      name: 'Alex',
      game: 'Valorant',
      rank: 'Gold → Diamant',
      text: 'En 3 sessions, j\'ai enfin compris pourquoi je bloquais en ranked. Poulpy m\'a aidé à corriger mon placement et ma prise de décision.',
      rating: 5,
    },
    {
      name: 'Sarah',
      game: 'Apex Legends',
      rank: 'Platine → Master',
      text: 'Le coaching le plus précis que j\'ai eu. Les conseils sur le movement et le tracking ont totalement changé mon jeu.',
      rating: 5,
    },
    {
      name: 'Maxime',
      game: 'Aim Training',
      rank: 'Silver → Platinum Voltaic',
      text: 'Mes scores Kovaak\'s ont explosé en 1 mois. La routine personnalisée fait toute la différence.',
      rating: 5,
    },
    {
      name: 'Thomas',
      game: 'Valorant',
      rank: 'Platine → Immortal',
      text: 'Poulpy ne se contente pas de pointer les erreurs, il explique le pourquoi et donne des solutions concrètes.',
      rating: 5,
    },
  ];

  const nextTestimonial = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prevTestimonial = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  // Auto-scroll carousel
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(nextTestimonial, 5000);
    return () => clearInterval(interval);
  }, [isHovered, nextTestimonial]);

  return (
    <section id="avis" className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ils ont joué. Ils ont <span className="text-gradient">progressé.</span>
          </h2>
        </motion.div>

        {/* Carousel */}
        <div className="relative max-w-4xl mx-auto"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4 }}
              className="glass-dark rounded-2xl p-8 sm:p-12"
            >
              {/* Stars */}
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-xl sm:text-2xl text-center text-gray-200 mb-8 leading-relaxed">
                "{testimonials[currentIndex].text}"
              </blockquote>

              {/* Author */}
              <div className="text-center">
                <div className="font-bold text-lg mb-1">{testimonials[currentIndex].name}</div>
                <div className="text-purple-400 font-medium mb-1">{testimonials[currentIndex].game}</div>
                <div className="text-sm text-gray-400">{testimonials[currentIndex].rank}</div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prevTestimonial}
              className="w-12 h-12 glass rounded-full flex items-center justify-center hover:bg-white/10 transition-all"
              aria-label="Avis précédent"
            >
              <ChevronLeft size={24} />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex ? 'bg-purple-500 w-8' : 'bg-gray-600'
                  }`}
                  aria-label={`Aller à l'avis ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="w-12 h-12 glass rounded-full flex items-center justify-center hover:bg-white/10 transition-all"
              aria-label="Avis suivant"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* View All Reviews Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <Link
              href="/avis"
              className="inline-flex items-center gap-2 px-6 py-3 glass rounded-xl font-semibold hover:bg-white/10 transition-all group"
            >
              Voir tous les avis
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
