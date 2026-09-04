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
  game: string;
  notes?: string | null;
  status: 'confirmed' | 'completed' | 'rescheduled' | 'cancelled';
  admin_notes?: string | null;
  read_by_admin: boolean;
  created_at: string;
  updated_at?: string;
}

