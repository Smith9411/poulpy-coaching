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
