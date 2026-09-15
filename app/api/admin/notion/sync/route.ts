import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { queryAllNotionBookings, cleanNotionId } from '@/lib/notion';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/notion/sync
 * Synchronise l'ensemble des rendez-vous de Notion vers Supabase (manuel à la demande)
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

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', authData.user.id)
      .single();

    if (profile?.is_admin !== true) {
      return NextResponse.json({ error: 'Réservé aux administrateurs' }, { status: 403 });
    }

    // 1. Récupérer toutes les réservations depuis Notion
    const notionPages = await queryAllNotionBookings();
    if (notionPages.length === 0) {
      return NextResponse.json({ success: true, message: 'Aucune page trouvée dans la base Notion.', syncedCount: 0 });
    }

    // 2. Récupérer toutes les réservations existantes dans Supabase
    const { data: supabaseBookings } = await supabase
      .from('coaching_bookings')
      .select('*')
      .not('notion_page_id', 'is', null);

    const nowIso = new Date().toISOString();
    let updatedCount = 0;

    for (const page of notionPages) {
      const cleanPageId = cleanNotionId(page.pageId) || page.pageId;
      const rawClean = page.pageId.replace(/-/g, '');

      const matchedBooking = (supabaseBookings || []).find((b: any) => {
        const bId = (b.notion_page_id || '').replace(/-/g, '');
        return bId === rawClean || b.notion_page_id === cleanPageId || b.notion_page_id === page.pageId;
      });

      if (matchedBooking) {
        // Vérifier si archivé / annulé
        if (page.isArchived || page.status === 'Annulé') {
          if (matchedBooking.status !== 'cancelled') {
            await supabase
              .from('coaching_bookings')
              .update({ status: 'cancelled', read_by_student: false, updated_at: nowIso })
              .eq('id', matchedBooking.id);
            updatedCount++;
          }
          continue;
        }

        // Vérifier si date / heure a changé
        const dateChanged = page.bookingDate && page.bookingDate !== matchedBooking.booking_date;
        const timeChanged = page.bookingTime && page.bookingTime !== matchedBooking.booking_time;

        if (dateChanged || timeChanged) {
          const finalDate = page.bookingDate || matchedBooking.booking_date;
          const finalTime = page.bookingTime || matchedBooking.booking_time;

          await supabase
            .from('coaching_bookings')
            .update({
              booking_date: finalDate,
              booking_time: finalTime,
              status: 'rescheduled',
              read_by_student: false,
              updated_at: nowIso,
            })
            .eq('id', matchedBooking.id);
          updatedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synchronisation terminée avec succès (${updatedCount} réservation(s) mise(s) à jour).`,
      totalPagesInNotion: notionPages.length,
      updatedCount,
    });
  } catch (err: any) {
    console.error('[Notion Batch Sync Exception]:', err);
    return NextResponse.json({ error: 'Erreur interne lors de la synchronisation' }, { status: 500 });
  }
}
