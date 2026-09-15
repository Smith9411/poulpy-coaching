import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createNotionBooking } from '@/lib/notion';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const dynamic = 'force-dynamic';

/**
 * Calcule l'état des packs pour un élève
 */
export function getStudentPackSummary(bookings: any[]) {
  // Trouver la réservation initiale de pack
  const initialPackBooking = bookings.find((b: any) => {
    const name = (b.plan_name || '').toUpperCase();
    const price = b.plan_price || '';
    return (
      (name.includes('PACK') && !name.includes('SÉANCE 2') && !name.includes('SÉANCE 3') && !name.includes('SÉANCE 4') && !name.includes('SÉANCE 5') && !name.includes('SÉANCE 6') && !name.includes('SÉANCE 7')) ||
      price === '50 €' ||
      price === '60 €'
    );
  });

  if (!initialPackBooking) {
    return { hasActivePack: false, totalSessions: 0, bookedSessions: 0, remainingSessions: 0, nextSessionNumber: 1, packType: 'pro' as const, packName: '' };
  }

  const nameUpper = (initialPackBooking.plan_name || '').toUpperCase();
  const price = initialPackBooking.plan_price || '';

  const isPro = nameUpper.includes('PRO') || price === '50 €' || nameUpper.includes('7 SÉANCES');
  const totalSessions = isPro ? 7 : 4;
  const packType = isPro ? ('pro' as const) : ('performance' as const);
  const packName = isPro ? 'Pack Coaching Pro (7 séances)' : 'Pack Coaching Compétition (4 séances)';

  // Trouver toutes les séances rattachées à ce pack
  const packBookings = bookings.filter((b: any) => {
    const bName = (b.plan_name || '').toUpperCase();
    if (b.status === 'cancelled') return false;
    if (b.id === initialPackBooking.id) return true;
    if (isPro && bName.includes('PRO') && bName.includes('PACK')) return true;
    if (!isPro && (bName.includes('COMPÉTITION') || bName.includes('PERFORMANCE')) && bName.includes('PACK')) return true;
    return false;
  });

  const bookedSessions = packBookings.length;
  const remainingSessions = Math.max(0, totalSessions - bookedSessions);
  const nextSessionNumber = bookedSessions + 1;

  return {
    hasActivePack: true,
    packType,
    packName,
    totalSessions,
    bookedSessions,
    remainingSessions,
    nextSessionNumber,
    initialBooking: initialPackBooking,
    latestBooking: packBookings[packBookings.length - 1] || initialPackBooking,
    sessions: Array.from({ length: totalSessions }, (_, i) => {
      const existing = packBookings[i];
      return {
        number: i + 1,
        title: `Séance ${i + 1} / ${totalSessions}`,
        isBooked: Boolean(existing),
        bookingId: existing?.id,
        bookingDate: existing?.booking_date,
        bookingTime: existing?.booking_time,
        status: existing?.status,
        game: existing?.game,
      };
    }),
  };
}

/**
 * POST /api/bookings/pack-session
 * Permet à un élève de réserver l'une de ses séances incluses dans son pack (0 €).
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '').trim();
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const userId = authData.user.id;
    const userEmail = authData.user.email?.toLowerCase();

    const body = await req.json();
    const { slotId, bookingDate, bookingTime, game, notes, discord } = body;

    if (!bookingDate || !bookingTime) {
      return NextResponse.json({ error: 'Date et heure requises.' }, { status: 400 });
    }

    // Récupérer les réservations actuelles de l'élève
    let query = supabase
      .from('coaching_bookings')
      .select('*')
      .neq('status', 'cancelled')
      .order('created_at', { ascending: true });

    if (userEmail) {
      query = query.or(`user_id.eq.${userId},student_email.eq.${userEmail}`);
    } else {
      query = query.eq('user_id', userId);
    }

    const { data: bookings } = await query;
    const packSummary = getStudentPackSummary(bookings || []);

    if (!packSummary.hasActivePack) {
      return NextResponse.json({ error: 'Aucun pack de coaching actif trouvé pour votre compte.' }, { status: 400 });
    }

    if (packSummary.remainingSessions <= 0) {
      return NextResponse.json(
        { error: 'Toutes les séances de votre pack ont déjà été réservées.' },
        { status: 400 }
      );
    }

    // Récupérer le profil pour avoir le pseudo et discord
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, email')
      .eq('id', userId)
      .maybeSingle();

    const studentName = profile?.username || packSummary.latestBooking?.student_name || 'Élève';
    const studentDiscord = discord?.trim() || packSummary.latestBooking?.student_discord || studentName;
    const studentEmail = userEmail || packSummary.latestBooking?.student_email || '';
    const selectedGame = game || packSummary.latestBooking?.game || 'Valorant';

    // 2. Vérification et verrouillage du créneau
    let targetSlotId = slotId;

    if (!targetSlotId) {
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

    const sessionNumber = packSummary.nextSessionNumber;
    const isPro = packSummary.packType === 'pro';
    const sessionPlanName = isPro
      ? `COACHING PRO - SÉANCE ${sessionNumber}/${packSummary.totalSessions} (PACK)`
      : `COACHING COMPÉTITION - SÉANCE ${sessionNumber}/${packSummary.totalSessions} (PACK)`;
    const sessionDuration = isPro ? '1H - 1H30' : '1H30 - 2H';

    // 3. Insertion de la séance
    const { data: newBooking, error: bookingError } = await supabase
      .from('coaching_bookings')
      .insert({
        user_id: userId,
        slot_id: targetSlotId || null,
        plan_id: packSummary.packType,
        plan_name: sessionPlanName,
        plan_price: '0 € (INCLUS PACK)',
        plan_duration: sessionDuration,
        booking_date: bookingDate,
        booking_time: bookingTime,
        student_name: studentName,
        student_email: studentEmail,
        student_discord: studentDiscord,
        game: selectedGame,
        notes: notes?.trim() || `Séance ${sessionNumber}/${packSummary.totalSessions} issue du ${packSummary.packName}`,
        status: 'confirmed',
        read_by_admin: false,
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Erreur création réservation pack:', bookingError);
      return NextResponse.json({ error: 'Impossible d\'enregistrer la séance de pack.' }, { status: 500 });
    }

    // 4. Verrouillage du créneau
    if (targetSlotId) {
      await supabase
        .from('coaching_slots')
        .update({ is_booked: true, updated_at: new Date().toISOString() })
        .eq('id', targetSlotId);
    } else {
      try {
        const { data: createdSlot } = await supabase
          .from('coaching_slots')
          .insert({
            date: bookingDate,
            start_time: bookingTime,
            is_active: true,
            is_booked: true,
            created_by: userId,
          })
          .select('id')
          .maybeSingle();

        if (createdSlot?.id) {
          await supabase
            .from('coaching_bookings')
            .update({ slot_id: createdSlot.id })
            .eq('id', newBooking.id);
        }
      } catch (slotErr) {
        console.warn('Création auto slot pack ignorée:', slotErr);
      }
    }

    // 5. Synchronisation Notion Calendar
    try {
      const notionPageId = await createNotionBooking({
        bookingId: newBooking.id,
        studentName,
        studentEmail,
        studentDiscord,
        game: selectedGame,
        planName: sessionPlanName,
        planDuration: sessionDuration,
        bookingDate,
        bookingTime,
        notes: notes?.trim() || `Séance ${sessionNumber}/${packSummary.totalSessions} du ${packSummary.packName}`,
      });

      if (notionPageId) {
        await supabase
          .from('coaching_bookings')
          .update({ notion_page_id: notionPageId })
          .eq('id', newBooking.id);
      }
    } catch (notionErr) {
      console.error('[Notion Sync Error - Pack Session]', notionErr);
    }

    return NextResponse.json({
      success: true,
      booking: newBooking,
      sessionNumber,
      totalSessions: packSummary.totalSessions,
      remainingSessions: packSummary.remainingSessions - 1,
    });
  } catch (err: unknown) {
    console.error('Erreur POST /api/bookings/pack-session:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
  }
}
