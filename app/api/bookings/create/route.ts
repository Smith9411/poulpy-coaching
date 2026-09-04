import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const dynamic = 'force-dynamic';

/**
 * POST /api/bookings/create
 * Crée une réservation de coaching pour un élève (sans paiement immédiat).
 * - Vérifie et verrouille le créneau (is_booked = true).
 * - Associe le user_id si l'élève est connecté (ou par recherche de son email).
 * - Enregistre dans coaching_bookings avec read_by_admin = false.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      slotId,
      bookingDate,
      bookingTime,
      planId,
      planName,
      planPrice,
      planDuration,
      studentName,
      studentEmail,
      studentDiscord,
      game,
      notes,
    } = body;

    // Validations obligatoires
    if (!bookingDate || !bookingTime) {
      return NextResponse.json({ error: 'Date et heure du créneau requises.' }, { status: 400 });
    }
    if (!studentName?.trim() || !studentEmail?.trim() || !studentDiscord?.trim()) {
      return NextResponse.json({ error: 'Nom, email et pseudo Discord obligatoires.' }, { status: 400 });
    }
    if (!planId || !planName) {
      return NextResponse.json({ error: 'Formule de coaching requise.' }, { status: 400 });
    }

    // 1. Détection de l'utilisateur connecté s'il y a un token
    let userId: string | null = null;
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '').trim();
      const { data: authData } = await supabase.auth.getUser(token);
      if (authData?.user) {
        userId = authData.user.id;
      }
    }

    // Si pas de token, recherche si un compte existe avec cet email
    if (!userId) {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', studentName.trim())
        .maybeSingle();

      if (existingProfile) {
        userId = existingProfile.id;
      }
    }

    // 2. Vérification et réservation du créneau dans coaching_slots
    let targetSlotId = slotId;

    if (!targetSlotId) {
      // Trouver le slot par date et heure
      const { data: foundSlot } = await supabase
        .from('coaching_slots')
        .select('id, is_active, is_booked')
        .eq('date', bookingDate)
        .eq('start_time', bookingTime)
        .maybeSingle();

      if (foundSlot) {
        targetSlotId = foundSlot.id;
        if (!foundSlot.is_active || foundSlot.is_booked) {
          return NextResponse.json(
            { error: 'Désolé, ce créneau vient d\'être réservé ou n\'est plus disponible.' },
            { status: 409 }
          );
        }
      }
    } else {
      const { data: slotRecord } = await supabase
        .from('coaching_slots')
        .select('id, is_active, is_booked')
        .eq('id', targetSlotId)
        .single();

      if (!slotRecord || !slotRecord.is_active || slotRecord.is_booked) {
        return NextResponse.json(
          { error: 'Ce créneau n\'est plus disponible. Merci d\'en choisir un autre.' },
          { status: 409 }
        );
      }
    }

    // 3. Création de la réservation
    const { data: newBooking, error: bookingError } = await supabase
      .from('coaching_bookings')
      .insert({
        user_id: userId,
        slot_id: targetSlotId || null,
        plan_id: planId,
        plan_name: planName,
        plan_price: planPrice || '0€',
        plan_duration: planDuration || '60 min',
        booking_date: bookingDate,
        booking_time: bookingTime,
        student_name: studentName.trim(),
        student_email: studentEmail.trim().toLowerCase(),
        student_discord: studentDiscord.trim(),
        game: game || 'Valorant',
        notes: notes?.trim() || null,
        status: 'confirmed',
        read_by_admin: false,
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Erreur création réservation:', bookingError);
      return NextResponse.json({ error: 'Impossible d\'enregistrer la réservation.' }, { status: 500 });
    }

    // 4. Verrouillage du créneau (is_booked = true)
    if (targetSlotId) {
      await supabase
        .from('coaching_slots')
        .update({ is_booked: true, updated_at: new Date().toISOString() })
        .eq('id', targetSlotId);
    }

    return NextResponse.json({
      success: true,
      booking: newBooking,
    });
  } catch (err: unknown) {
    console.error('Erreur POST /api/bookings/create:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
  }
}
