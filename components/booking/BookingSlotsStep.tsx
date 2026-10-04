'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  ChevronLeft,
  Clock,
  Sun,
  Moon,
  Loader2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Plan } from './types';

export interface SelectedSlotDetails {
  slotId?: string;
  bookingDate: string;
  bookingTime: string;
  slotLabel: string;
}

export type SelectedSlot = SelectedSlotDetails;

interface BookingSlotsStepProps {
  plan: Plan;
  selectedSlot: string | null;
  onSelectSlot: (slot: SelectedSlotDetails) => void;
  onBack: () => void;
  adminSlots?: Array<{
    date: string;
    start_time: string;
    is_active: boolean;
    is_booked: boolean;
    id?: string;
  }>;
  isLoadingSlots?: boolean;
}

interface DaySchedule {
  fullDate: string; // YYYY-MM-DD
  dateStr: string; // "Lun 24 Oct"
  dayName: string;
  dayNumber: number;
  slots: Array<{
    id: string;
    slotId?: string;
    time: string;
    available: boolean;
  }>;
}

const DAYS_SHORT = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];
const MONTHS_SHORT = ['JANV', 'FÉVR', 'MARS', 'AVR', 'MAI', 'JUIN', 'JUIL', 'AOÛT', 'SEPT', 'OCT', 'NOV', 'DÉC'];

export default function BookingSlotsStep({
  plan,
  selectedSlot,
  onSelectSlot,
  onBack,
  adminSlots = [],
  isLoadingSlots = false,
}: BookingSlotsStepProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // Generate 14 upcoming days
  const schedules: DaySchedule[] = useMemo(() => {
    const list: DaySchedule[] = [];
    const baseDate = new Date();

    const slotsByDate = new Map<string, Array<{ id?: string; start_time: string; is_booked: boolean }>>();
    adminSlots.forEach((s) => {
      const arr = slotsByDate.get(s.date) || [];
      arr.push(s);
      slotsByDate.set(s.date, arr);
    });

    for (let i = 1; i <= 14; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const isoDate = `${year}-${month}-${day}`;

      const dayName = DAYS_SHORT[d.getDay()];
      const monthName = MONTHS_SHORT[d.getMonth()];
      const dayNum = d.getDate();
      const dateStr = `${dayName} ${dayNum} ${monthName}`;

      const dayAdminSlots = slotsByDate.get(isoDate) || [];
      const slots = dayAdminSlots
        .sort((a, b) => a.start_time.localeCompare(b.start_time))
        .map((s) => ({
          id: `${isoDate}_${s.start_time}`,
          slotId: s.id,
          time: s.start_time,
          available: !s.is_booked,
        }));

      list.push({
        fullDate: isoDate,
        dateStr,
        dayName,
        dayNumber: dayNum,
        slots,
      });
    }

    return list;
  }, [adminSlots]);

  const currentDay = schedules[selectedDayIndex] || schedules[0];

  // Group slots by afternoon and evening
  const { afternoonSlots, eveningSlots } = useMemo(() => {
    if (!currentDay) return { afternoonSlots: [], eveningSlots: [] };
    const afternoon = currentDay.slots.filter((s) => {
      const hour = parseInt(s.time.split(':')[0], 10);
      return hour < 18;
    });
    const evening = currentDay.slots.filter((s) => {
      const hour = parseInt(s.time.split(':')[0], 10);
      return hour >= 18;
    });
    return { afternoonSlots: afternoon, eveningSlots: evening };
  }, [currentDay]);

  const currentSelectedSlotObj = useMemo(() => {
    if (!selectedSlot) return null;
    for (const d of schedules) {
      const found = d.slots.find((s) => s.id === selectedSlot);
      if (found) return { day: d, slot: found };
    }
    return null;
  }, [selectedSlot, schedules]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-4xl mx-auto space-y-6 font-mono"
    >
      {/* Plan summary badge */}
      <div className="reticle-box bg-[#121117] border border-white/10 p-4 sm:p-5 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-[#CA1C30] text-black font-bold text-xs flex items-center justify-center shrink-0 uppercase tracking-wider font-display">
            {plan.duration}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm sm:text-base font-display uppercase tracking-wider">{plan.name}</h3>
              <span className="text-xs px-2 py-0.5 bg-[#CA1C30]/20 border border-[#CA1C30]/40 text-[#CA1C30] font-bold">
                {plan.price}
              </span>
            </div>
            <p className="text-white/50 text-xs sm:text-sm mt-0.5">{plan.description}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="btn-cyber-ghost text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
        >
          <ChevronLeft size={14} />
          <span>Changer de formule</span>
        </button>
      </div>

      {/* Horizontal Day Selector */}
      <div className="reticle-box bg-[#121117] border border-white/10 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-[#CA1C30]" />
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">01 // CHOISIS LA DATE</h4>
          </div>
          <span className="text-[10px] text-white/40 uppercase tracking-widest hidden sm:inline">14 prochains jours</span>
        </div>

        {/* Scrollable Day Pills */}
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin -mx-1 px-1">
          {schedules.map((day, idx) => {
            const isDaySelected = idx === selectedDayIndex;
            const availableCount = day.slots.filter((s) => s.available).length;

            return (
              <button
                key={day.fullDate}
                type="button"
                onClick={() => setSelectedDayIndex(idx)}
                className={`shrink-0 flex flex-col items-center justify-center w-20 sm:w-24 py-3 px-2 transition-all border cursor-pointer ${
                  isDaySelected
                    ? 'bg-[#CA1C30] text-black border-[#CA1C30] shadow-[0_0_15px_rgba(202,28,48,0.4)] font-bold'
                    : 'bg-black/40 hover:bg-white/5 border-white/10 text-white/70 hover:text-white'
                }`}
              >
                <span className={`text-[10px] uppercase tracking-wider ${isDaySelected ? 'text-black/80 font-bold' : 'text-white/40'}`}>
                  {day.dayName}
                </span>
                <span className="text-lg font-bold font-display my-0.5">{day.dayNumber}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 mt-0.5 border ${
                    availableCount > 0
                      ? isDaySelected
                        ? 'bg-black/30 border-black/40 text-black font-bold'
                        : 'bg-[#00B4A0]/20 border-[#00B4A0]/40 text-[#00B4A0]'
                      : isDaySelected
                        ? 'bg-black/20 text-black/50 border-black/20'
                        : 'bg-white/5 border-white/10 text-white/30'
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
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <Clock size={15} className="text-[#00B4A0]" />
              <span>02 // CRÉNEAUX OUVERTS POUR LE {currentDay.dateStr}</span>
            </h4>
            {isLoadingSlots && <Loader2 size={15} className="animate-spin text-[#CA1C30]" />}
          </div>

          {currentDay.slots.length === 0 ? (
            <div className="py-8 text-center bg-black/40 p-6 border border-white/10">
              <Clock size={28} className="mx-auto text-white/20 mb-2" />
              <p className="text-xs font-bold uppercase tracking-wider text-white/80">Aucun créneau ouvert pour cette date</p>
              <p className="text-[11px] text-white/40 mt-1">
                Le coach n'a pas encore ouvert de disponibilités pour ce jour. Sélectionne un autre jour ci-dessus !
              </p>
            </div>
          ) : (
            <>
              {/* Afternoon section */}
              {afternoonSlots.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#00B4A0] mb-2.5">
                    <Sun size={13} />
                    <span>SESSION APRÈS-MIDI</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
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
                          className={`py-2.5 px-2 text-xs font-bold transition-all border text-center cursor-pointer ${
                            isSelected
                              ? 'bg-[#CA1C30] text-black border-[#CA1C30] shadow-[0_0_12px_rgba(202,28,48,0.5)] scale-105'
                              : slot.available
                              ? 'bg-black/50 hover:bg-white/10 hover:border-[#CA1C30] text-white border-white/15'
                              : 'bg-white/5 text-white/20 border-white/5 cursor-not-allowed line-through'
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
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#CA1C30] mb-2.5">
                    <Moon size={13} />
                    <span>SESSION SOIRÉE</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
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
                          className={`py-2.5 px-2 text-xs font-bold transition-all border text-center cursor-pointer ${
                            isSelected
                              ? 'bg-[#CA1C30] text-black border-[#CA1C30] shadow-[0_0_12px_rgba(202,28,48,0.5)] scale-105'
                              : slot.available
                              ? 'bg-black/50 hover:bg-white/10 hover:border-[#CA1C30] text-white border-white/15'
                              : 'bg-white/5 text-white/20 border-white/5 cursor-not-allowed line-through'
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
        <div className="flex items-center justify-center gap-5 mt-6 pt-4 border-t border-white/10 text-[10px] text-white/40 uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 border border-white/30 bg-black/40" />
            <span>DISPO</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-[#CA1C30]" />
            <span className="text-[#CA1C30] font-bold">SÉLECTIONNÉ</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-white/10 opacity-50" />
            <span>INDISPONIBLE</span>
          </div>
        </div>
      </div>

      {/* Action footer when slot chosen */}
      {currentSelectedSlotObj && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="reticle-box bg-[#121117] border border-[#CA1C30]/50 p-4 flex items-center justify-between gap-4 flex-wrap shadow-[0_0_25px_rgba(202,28,48,0.25)]"
        >
          <div className="text-xs">
            <span className="text-white/50 uppercase tracking-wider">CRÉNEAU SÉLECTIONNÉ : </span>
            <span className="font-bold text-white uppercase tracking-wider ml-1">
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
            className="btn-cyber-primary text-xs py-2.5 px-5 inline-flex items-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <span>CONTINUER VERS MES INFORMATIONS</span>
            <ArrowRight size={14} />
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
