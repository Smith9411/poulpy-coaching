export interface Plan {
  id: string;
  name: string;
  price: string;
  duration: string;
  description: string;
  features: string[];
  color: string;
  popular: boolean;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  id: string;
  slotId?: string; // Database UUID of slot
  isBooked?: boolean;
}

export interface DaySchedule {
  dateStr: string; // e.g. "Lun 8 Sep"
  fullDate: string; // "2026-09-08"
  isToday?: boolean;
  slots: TimeSlot[];
}

export interface BookingFormData {
  name: string;
  email: string;
  discord: string;
  riotId?: string;
  game: string;
  notes?: string;
}

export interface CoachingSlot {
  id: string;
  date: string; // 'YYYY-MM-DD'
  start_time: string; // 'HH:MM'
  is_active: boolean;
  is_booked: boolean;
  created_at?: string;
}

export interface CoachingBooking {
  id: string;
  user_id?: string | null;
  slot_id?: string | null;
  plan_id: string;
  plan_name: string;
  plan_price: string;
  plan_duration: string;
  booking_date: string; // 'YYYY-MM-DD'
  booking_time: string; // 'HH:MM'
  student_name: string;
  student_email: string;
  student_discord: string;
  riot_id?: string | null;
  game: string;
  notes?: string | null;
  status: 'confirmed' | 'completed' | 'rescheduled' | 'cancelled';
  admin_notes?: string | null;
  read_by_admin: boolean;
  created_at: string;
  updated_at?: string;
}

export function extractRiotIdFromBooking(b?: {
  riot_id?: string | null;
  admin_notes?: string | null;
} | null): string | null {
  if (!b) return null;
  if (b.riot_id && b.riot_id.trim()) return b.riot_id.trim();
  if (b.admin_notes) {
    const match = b.admin_notes.match(/\[riot_id:([^\]]+)\]/i);
    if (match?.[1]?.trim()) return match[1].trim();
  }
  return null;
}

export function cleanStudentAdminNotes(notes?: string | null): string | null {
  if (!notes) return null;
  const cleaned = notes
    .replace(/\s*\[riot_id:[^\]]+\]/gi, '')
    .replace(/\s*\[stripe_session:[^\]]+\]/gi, '')
    .replace(/\s*\[reminder_2h_sent\]/gi, '')
    .replace(/\s*\[reminder_email_id:[^\]]+\]/gi, '')
    .trim();
  return cleaned || null;
}


