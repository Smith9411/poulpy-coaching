'use client';

import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, Clock, Sun, Moon, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { CoachingSlot, DaySchedule, Plan } from './types';

export interface SelectedSlotDetails {
  slotId?: string;
  bookingDate: string; // 'YYYY-MM-DD'
  bookingTime: string; // 'HH:MM'
  slotLabel: string;
}

interface BookingSlotsStepProps {
  plan: Plan;
  selectedSlot: string | null;
  onSelectSlot: (details: SelectedSlotDetails) => void;
  onBack: () => void;
}

const DAYS_SHORT = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const MONTHS_SHORT = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

export default function BookingSlotsStep({
  plan,
  selectedSlot,
  onSelectSlot,
  onBack,
}: BookingSlotsStepProps) {
  const [dbSlots, setDbSlots] = useState<CoachingSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // Charger les créneaux réels configurés par le coach
  useEffect(() => {
    let cancelled = false;

    const fetchOpenSlots = async () => {
      setIsLoadingSlots(true);
      try {
        const res = await fetch('/api/bookings/slots', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setDbSlots(data.slots || []);
        }
      } catch (err) {
        console.error('Erreur récupération créneaux coach:', err);
      } finally {
        if (!cancelled) setIsLoadingSlots(false);
      }
    };

    fetchOpenSlots();
    return () => {
      cancelled = true;
    };
  }, []);

  // Génération des 14 prochains jours avec les créneaux réels ouverts par l'admin
  const schedules: DaySchedule[] = useMemo(() => {
    const list: DaySchedule[] = [];
    const baseDate = new Date();

    // Groupement des dbSlots par date
    const slotsByDate = new Map<string, CoachingSlot[]>();
    dbSlots.forEach((s) => {
      const arr = slotsByDate.get(s.date) || [];
      arr.push(s);
      slotsByDate.set(s.date, arr);
    });

    for (let i = 1; i <= 14; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);

      const dateIso = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();
      const dayName = DAYS_SHORT[dayOfWeek];
      const monthName = MONTHS_SHORT[d.getMonth()];
      const dateStr = `${dayName} ${d.getDate()} ${monthName}`;

      const openSlotsForDay = slotsByDate.get(dateIso) || [];

      // Si le coach a configuré des créneaux dans la DB pour ce jour
      const slots = openSlotsForDay.map((s) => ({
        id: `${dateIso}-${s.start_time}`,
        slotId: s.id,
        time: s.start_time,
        available: s.is_active && !s.is_booked,
        isBooked: s.is_booked,
      }));

      // Trier par heure
      slots.sort((a, b) => a.time.localeCompare(b.time));

      list.push({
        dateStr,
        fullDate: dateIso,
        isToday: i === 0,
        slots,
      });
    }

    return list;
  }, [dbSlots]);

  const currentDay = schedules[selectedDayIndex] || schedules[0];
  const afternoonSlots = (currentDay?.slots || []).filter((s) => parseInt(s.time.split(':')[0], 10) < 18);
  const eveningSlots = (currentDay?.slots || []).filter((s) => parseInt(s.time.split(':')[0], 10) >= 18);

  const currentSelectedSlotObj = useMemo(() => {
    for (const day of schedules) {
      const found = day.slots.find((s) => s.id === selectedSlot);
      if (found) return { slot: found, day };
    }
    return null;
  }, [schedules, selectedSlot]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Plan summary badge */}
      <div className="glass-dark rounded-2xl p-4 sm:p-5 flex items-center justify-between flex-wrap gap-4 border border-white/10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-xs text-center shadow-md bg-gradient-to-br from-purple-600 to-cyan-500">
            {plan.duration}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base sm:text-lg">{plan.name}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-purple-300 font-semibold">
                {plan.price}
              </span>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm">{plan.description}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="glass px-3.5 py-1.5 rounded-xl text-xs sm:text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
        >
          <ChevronLeft size={16} />
          Changer de formule
        </button>
      </div>

      {/* Horizontal Day Selector for Mobile and Desktop */}
      <div className="glass-dark rounded-2xl p-4 sm:p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-purple-400" />
            <h4 className="font-bold text-white text-sm sm:text-base">1. Choisis la date</h4>
          </div>
          <span className="text-xs text-gray-400 hidden sm:inline">14 prochains jours</span>
        </div>

        {/* Scrollable Day Pills */}
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20 -mx-2 px-2">
          {schedules.map((day, idx) => {
            const isDaySelected = idx === selectedDayIndex;
            const availableCount = day.slots.filter((s) => s.available).length;
            const [weekday, dayNum, month] = day.dateStr.split(' ');

            return (
              <button
                key={day.fullDate}
                type="button"
                onClick={() => setSelectedDayIndex(idx)}
                className={`flex-shrink-0 flex flex-col items-center justify-center w-20 sm:w-24 py-3 px-2 rounded-xl transition-all border ${
                  isDaySelected
                    ? 'bg-gradient-to-b from-purple-600/40 to-cyan-500/20 border-cyan-400 text-white shadow-md shadow-purple-500/20'
                    : 'glass hover:bg-white/10 border-white/5 text-gray-300'
                }`}
              >
                <span className="text-[11px] uppercase tracking-wider font-semibold opacity-75">
                  {weekday}
                </span>
                <span className="text-lg sm:text-xl font-extrabold my-0.5">{dayNum}</span>
                <span className="text-[10px] text-gray-400">{month}</span>
                <span
                  className={`mt-1.5 text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                    availableCount > 0
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-white/5 text-gray-500'
                  }`}
                >
                  {availableCount > 0 ? `${availableCount} dispo` : 'Complet'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Time slots for selected day */}
        <div className="mt-6 pt-5 border-t border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
              <Clock size={18} className="text-cyan-400" />
              <span>2. Créneaux ouverts pour le {currentDay.dateStr}</span>
            </h4>
            {isLoadingSlots && <Loader2 size={16} className="animate-spin text-purple-400" />}
          </div>

          {currentDay.slots.length === 0 ? (
            <div className="py-8 text-center glass rounded-2xl p-6 border border-white/5">
              <Clock size={32} className="mx-auto text-gray-500 mb-2 opacity-40" />
              <p className="text-sm font-semibold text-gray-300">Aucun créneau ouvert pour cette date</p>
              <p className="text-xs text-gray-500 mt-1">
                Le coach n'a pas encore ouvert de disponibilités pour ce jour. Sélectionne un autre jour ci-dessus !
              </p>
            </div>
          ) : (
            <>
              {/* Afternoon section */}
              {afternoonSlots.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 mb-3">
                    <Sun size={15} />
                    <span>APRÈS-MIDI</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                    {afternoonSlots.map((slot) => {
                      const isSelected = selectedSlot === slot.id;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={!slot.available}
                          onClick={() =>
                            onSelectSlot({
                              slotId: slot.slotId,
                              bookingDate: currentDay.fullDate,
                              bookingTime: slot.time,
                              slotLabel: `${currentDay.dateStr} à ${slot.time}`,
                            })
                          }
                          className={`py-3 px-2 rounded-xl text-sm font-semibold transition-all border text-center ${
                            isSelected
                              ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white border-transparent shadow-lg shadow-purple-500/40 scale-105'
                              : slot.available
                              ? 'glass hover:bg-white/10 hover:border-purple-400 text-white border-white/10'
                              : 'bg-white/5 text-gray-600 border-white/5 cursor-not-allowed line-through opacity-50'
                          }`}
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Evening section */}
              {eveningSlots.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 mb-3">
                    <Moon size={15} />
                    <span>SOIRÉE</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                    {eveningSlots.map((slot) => {
                      const isSelected = selectedSlot === slot.id;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={!slot.available}
                          onClick={() =>
                            onSelectSlot({
                              slotId: slot.slotId,
                              bookingDate: currentDay.fullDate,
                              bookingTime: slot.time,
                              slotLabel: `${currentDay.dateStr} à ${slot.time}`,
                            })
                          }
                          className={`py-3 px-2 rounded-xl text-sm font-semibold transition-all border text-center ${
                            isSelected
                              ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white border-transparent shadow-lg shadow-purple-500/40 scale-105'
                              : slot.available
                              ? 'glass hover:bg-white/10 hover:border-purple-400 text-white border-white/10'
                              : 'bg-white/5 text-gray-600 border-white/5 cursor-not-allowed line-through opacity-50'
                          }`}
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-5 mt-6 pt-4 border-t border-white/5 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded glass border border-white/20" />
            <span>Dispo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gradient-to-r from-purple-600 to-cyan-500" />
            <span>Sélectionné</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-white/10 opacity-50" />
            <span>Indisponible</span>
          </div>
        </div>
      </div>

      {/* Action footer when slot chosen */}
      {currentSelectedSlotObj && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-dark border border-purple-500/40 p-4 rounded-2xl flex items-center justify-between gap-4 flex-wrap"
        >
          <div className="text-sm">
            <span className="text-gray-400">Créneau sélectionné : </span>
            <span className="font-bold text-white">
              {currentSelectedSlotObj.day.dateStr} à {currentSelectedSlotObj.slot.time}
            </span>
          </div>
          <button
            type="button"
            onClick={() =>
              onSelectSlot({
                slotId: currentSelectedSlotObj.slot.slotId,
                bookingDate: currentSelectedSlotObj.day.fullDate,
                bookingTime: currentSelectedSlotObj.slot.time,
                slotLabel: `${currentSelectedSlotObj.day.dateStr} à ${currentSelectedSlotObj.slot.time}`,
              })
            }
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-sm shadow-md hover:shadow-purple-500/30 flex items-center gap-2"
          >
            <span>Passer aux informations</span>
            <ArrowRight size={16} />
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
