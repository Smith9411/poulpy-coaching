/**
 * Module d'intégration Notion API
 * Synchronise les réservations de coaching avec une base de données Notion / Notion Calendar.
 *
 * Variables d'environnement requises (dans .env.local et Vercel) :
 * - NOTION_API_KEY : Clé secrète de l'intégration Notion (ex: secret_xxx)
 * - NOTION_BOOKINGS_DATABASE_ID : ID de la base de données Notion (32 caractères hex)
 */

export interface NotionBookingPayload {
  bookingId: string;
  studentName: string;
  studentEmail: string;
  studentDiscord: string;
  game: string;
  planName: string;
  planDuration?: string;
  bookingDate: string; // Format 'YYYY-MM-DD'
  bookingTime: string; // Format 'HH:MM'
  notes?: string;
}

const NOTION_API_URL = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

function getNotionConfig() {
  const apiKey = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_BOOKINGS_DATABASE_ID;

  if (!apiKey || !databaseId) {
    return null;
  }

  return { apiKey, databaseId };
}

/**
 * Calcule la date de début et de fin ISO pour Notion Date
 */
function buildNotionDateRange(dateStr: string, timeStr: string, durationStr?: string): { start: string; end?: string } {
  try {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const dateObj = new Date(`${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);

    let durationMinutes = 60;
    if (durationStr) {
      if (durationStr.includes('1h30') || durationStr.includes('90')) {
        durationMinutes = 90;
      } else if (durationStr.includes('2h') || durationStr.includes('120')) {
        durationMinutes = 120;
      } else if (durationStr.includes('1h') || durationStr.includes('60')) {
        durationMinutes = 60;
      }
    }

    const endObj = new Date(dateObj.getTime() + durationMinutes * 60 * 1000);

    return {
      start: `${dateStr}T${timeStr}:00+02:00`,
      end: `${dateStr}T${String(endObj.getHours()).padStart(2, '0')}:${String(endObj.getMinutes()).padStart(2, '0')}:00+02:00`,
    };
  } catch {
    return { start: dateStr };
  }
}

/**
 * Crée une page de réservation dans la base de données Notion
 * Retourne l'ID de la page Notion créée ou null en cas d'erreur / configuration manquante
 */
export async function createNotionBooking(payload: NotionBookingPayload): Promise<string | null> {
  const config = getNotionConfig();
  if (!config) {
    console.info('[Notion Sync] Clés Notion non configurées, synchronisation ignorée.');
    return null;
  }

  try {
    const { start, end } = buildNotionDateRange(payload.bookingDate, payload.bookingTime, payload.planDuration);
    const title = `[${payload.game.toUpperCase()}] Coaching - ${payload.studentName}`;

    const dateProperty: Record<string, any> = {
      start,
    };
    if (end) {
      dateProperty.end = end;
    }

    const body = {
      parent: { database_id: config.databaseId },
      properties: {
        Name: {
          title: [
            {
              type: 'text',
              text: { content: title },
            },
          ],
        },
        Date: {
          date: dateProperty,
        },
        Statut: {
          select: { name: 'Confirmé' },
        },
        Jeu: {
          select: {
            name: payload.game.toLowerCase().includes('val') ? 'Valorant' : 'Apex Legends',
          },
        },
        Formule: {
          rich_text: [
            {
              type: 'text',
              text: { content: payload.planName },
            },
          ],
        },
        Discord: {
          rich_text: [
            {
              type: 'text',
              text: { content: payload.studentDiscord },
            },
          ],
        },
        Email: {
          email: payload.studentEmail,
        },
        Notes: {
          rich_text: [
            {
              type: 'text',
              text: { content: (payload.notes || 'Aucune note spécifique').slice(0, 1900) },
            },
          ],
        },
      },
    };

    const res = await fetch(`${NOTION_API_URL}/pages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[Notion Sync] Erreur lors de la création de la page Notion:', res.status, errText);
      return null;
    }

    const data = await res.json();
    console.info(`[Notion Sync] Réservation créée avec succès dans Notion (Page ID: ${data.id})`);
    return data.id as string;
  } catch (err) {
    console.error('[Notion Sync] Erreur inattendue:', err);
    return null;
  }
}

/**
 * Met à jour la date et l'heure d'une réservation dans Notion (ex: Report)
 */
export async function updateNotionBookingDate(
  notionPageId: string,
  newDate: string,
  newTime: string,
  status: 'rescheduled' | 'confirmed' = 'rescheduled'
): Promise<boolean> {
  const config = getNotionConfig();
  if (!config || !notionPageId) return false;

  try {
    const { start, end } = buildNotionDateRange(newDate, newTime);
    const dateProperty: Record<string, any> = { start };
    if (end) dateProperty.end = end;

    const statusLabel = status === 'rescheduled' ? 'Reporté' : 'Confirmé';

    const body = {
      properties: {
        Date: {
          date: dateProperty,
        },
        Statut: {
          select: { name: statusLabel },
        },
      },
    };

    const res = await fetch(`${NOTION_API_URL}/pages/${notionPageId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[Notion Sync] Erreur lors de la mise à jour de la date Notion:', res.status, errText);
      return false;
    }

    console.info(`[Notion Sync] Date mise à jour dans Notion pour la page ${notionPageId}`);
    return true;
  } catch (err) {
    console.error('[Notion Sync] Erreur mise à jour date:', err);
    return false;
  }
}

/**
 * Annule une réservation dans Notion (archive la page et change le statut en 'Annulé')
 */
export async function cancelNotionBooking(notionPageId: string, archivePage: boolean = true): Promise<boolean> {
  const config = getNotionConfig();
  if (!config || !notionPageId) return false;

  try {
    const body: Record<string, any> = {
      properties: {
        Statut: {
          select: { name: 'Annulé' },
        },
      },
    };

    if (archivePage) {
      body.archived = true;
    }

    const res = await fetch(`${NOTION_API_URL}/pages/${notionPageId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[Notion Sync] Erreur lors de l\'annulation Notion:', res.status, errText);
      return false;
    }

    console.info(`[Notion Sync] Réservation annulée dans Notion (Page ID: ${notionPageId})`);
    return true;
  } catch (err) {
    console.error('[Notion Sync] Erreur annulation Notion:', err);
    return false;
  }
}

/**
 * Marque une séance comme 'Terminé' dans Notion
 */
export async function completeNotionBooking(notionPageId: string): Promise<boolean> {
  const config = getNotionConfig();
  if (!config || !notionPageId) return false;

  try {
    const body = {
      properties: {
        Statut: {
          select: { name: 'Terminé' },
        },
      },
    };

    const res = await fetch(`${NOTION_API_URL}/pages/${notionPageId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    return res.ok;
  } catch (err) {
    console.error('[Notion Sync] Erreur complétion Notion:', err);
    return false;
  }
}
