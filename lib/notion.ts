/**
 * Module d'intégration Notion API
 * Synchronise les réservations de coaching avec une base de données Notion / Notion Calendar.
 *
 * Variables d'environnement requises (dans .env.local et Vercel) :
 * - NOTION_API_KEY : Clé secrète de l'intégration Notion (ex: secret_xxx ou ntn_xxx)
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

/**
 * Nettoie l'ID de base de données (si l'utilisateur a collé une URL ou des tirets)
 */
export function cleanNotionId(rawId?: string): string | null {
  if (!rawId) return null;
  let id = rawId.trim();

  // Si c'est une URL Notion complète
  if (id.includes('notion.so') || id.includes('notion.com')) {
    const match = id.match(/([a-f0-9]{32})/i);
    if (match) {
      id = match[1];
    } else {
      const parts = id.split('?')[0].split('/');
      id = parts[parts.length - 1].replace(/-/g, '');
    }
  }

  // Nettoyage des tirets
  id = id.replace(/-/g, '');

  if (id.length === 32) {
    // Format UUID avec tirets (ex: 3dca31f0-5765-8084-b92b-f97fe8d36dd2)
    return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;
  }

  return id;
}

function getNotionConfig() {
  const apiKey = process.env.NOTION_API_KEY?.trim();
  const rawDatabaseId = process.env.NOTION_BOOKINGS_DATABASE_ID?.trim();
  const databaseId = cleanNotionId(rawDatabaseId);

  if (!apiKey || !databaseId) {
    return null;
  }

  return { apiKey, databaseId };
}

/**
 * Détermine la durée en minutes selon la formule de coaching ou la chaîne de durée
 */
export function getDurationMinutes(durationStr?: string, planName?: string): number {
  const combined = `${durationStr || ''} ${planName || ''}`.toLowerCase();
  if (combined.includes('30') || combined.includes('diag') || combined.includes('session')) {
    return 30;
  }
  if (combined.includes('1h30') || combined.includes('90') || combined.includes('perf')) {
    return 90;
  }
  if (combined.includes('2h') || combined.includes('120')) {
    return 120;
  }
  if (combined.includes('45')) {
    return 45;
  }
  return 60;
}

/**
 * Calcule le décalage horaire UTC pour Europe/Paris à une date donnée (+02:00 en été, +01:00 en hiver)
 */
export function getParisOffsetForDate(dateStr: string): string {
  try {
    const testDate = new Date(`${dateStr}T12:00:00Z`);
    if (isNaN(testDate.getTime())) return '+02:00';
    const parisHourStr = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Paris',
      hour: 'numeric',
      hour12: false,
    }).format(testDate);
    const parisHour = parseInt(parisHourStr, 10);
    const offset = parisHour - 12;
    return offset === 2 ? '+02:00' : '+01:00';
  } catch {
    return '+02:00';
  }
}

/**
 * Calcule la date de début et de fin ISO pour Notion Date avec décalage Paris dynamique
 */
export function buildNotionDateRange(
  dateStr: string,
  timeStr: string,
  durationStr?: string,
  planName?: string
): { start: string; end?: string } {
  try {
    const [hoursStr, minutesStr] = timeStr.split(':');
    const hours = parseInt(hoursStr, 10) || 0;
    const minutes = parseInt(minutesStr, 10) || 0;
    const durationMinutes = getDurationMinutes(durationStr, planName);
    const offset = getParisOffsetForDate(dateStr);

    const totalStartMins = hours * 60 + minutes;
    const totalEndMins = totalStartMins + durationMinutes;

    const endHours = Math.floor(totalEndMins / 60) % 24;
    const endMins = totalEndMins % 60;
    const endTimeStr = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;

    return {
      start: `${dateStr}T${timeStr}:00${offset}`,
      end: `${dateStr}T${endTimeStr}:00${offset}`,
    };
  } catch {
    return { start: dateStr };
  }
}

/**
 * Tente de résoudre le vrai ID de la base de données (si un ID de page parente a été fourni)
 */
async function resolveDatabaseId(config: { apiKey: string; databaseId: string }): Promise<string> {
  try {
    // 1. Essayer d'interroger directement la base de données
    const checkRes = await fetch(`${NOTION_API_URL}/databases/${config.databaseId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Notion-Version': NOTION_VERSION,
      },
    });

    if (checkRes.ok) {
      return config.databaseId;
    }

    // 2. Si 404/400, il est possible que databaseId soit l'ID d'une page contenant une base inline
    const pageBlocksRes = await fetch(`${NOTION_API_URL}/blocks/${config.databaseId}/children`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Notion-Version': NOTION_VERSION,
      },
    });

    if (pageBlocksRes.ok) {
      const blocksData = await pageBlocksRes.json();
      const childDb = (blocksData.results || []).find((b: any) => b.type === 'child_database');
      if (childDb && childDb.id) {
        console.info(`[Notion Sync] Base de données inline détectée automatiquement : ${childDb.id}`);
        return childDb.id;
      }
    }
  } catch (err) {
    console.warn('[Notion Sync] Erreur lors de la résolution de la base:', err);
  }

  return config.databaseId;
}

/**
 * Récupère le schéma des propriétés de la base Notion pour adapter dynamiquement l'envoi
 */
async function getDatabaseProperties(config: { apiKey: string; databaseId: string }): Promise<Record<string, any> | null> {
  try {
    const res = await fetch(`${NOTION_API_URL}/databases/${config.databaseId}`, {
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Notion-Version': NOTION_VERSION,
      },
    });
    if (res.ok) {
      const data = await res.json();
      return data.properties || null;
    }
  } catch {
    // Silently continue
  }
  return null;
}

/**
 * Crée une page de réservation dans la base de données Notion
 */
export async function createNotionBooking(payload: NotionBookingPayload): Promise<string | null> {
  const config = getNotionConfig();
  if (!config) {
    console.info('[Notion Sync] Clés Notion non configurées (NOTION_API_KEY ou NOTION_BOOKINGS_DATABASE_ID manquant).');
    return null;
  }

  try {
    const realDbId = await resolveDatabaseId(config);
    const schemaProps = await getDatabaseProperties({ apiKey: config.apiKey, databaseId: realDbId });

    const { start, end } = buildNotionDateRange(payload.bookingDate, payload.bookingTime, payload.planDuration, payload.planName);
    const title = `[${payload.game.toUpperCase()}] Coaching - ${payload.studentName}`;

    // Trouver le nom de la propriété titre (par défaut 'Name' ou première propriété de type 'title')
    let titleKey = 'Name';
    if (schemaProps) {
      const foundTitle = Object.entries(schemaProps).find(([, val]: [string, any]) => val.type === 'title');
      if (foundTitle) titleKey = foundTitle[0];
    }

    const properties: Record<string, any> = {
      [titleKey]: {
        title: [{ type: 'text', text: { content: title } }],
      },
    };

    // Propriété Date
    const dateProperty: Record<string, any> = { start };
    if (end) dateProperty.end = end;
    properties['Date'] = { date: dateProperty };

    // Propriété Statut (gère à la fois les types 'select' et 'status')
    const statutType = schemaProps?.['Statut']?.type || 'select';
    if (statutType === 'status') {
      properties['Statut'] = { status: { name: 'Confirmé' } };
    } else {
      properties['Statut'] = { select: { name: 'Confirmé' } };
    }

    // Propriété Jeu
    const jeuType = schemaProps?.['Jeu']?.type || 'select';
    const jeuName = payload.game.toLowerCase().includes('val') ? 'Valorant' : 'Apex Legends';
    if (jeuType === 'select') {
      properties['Jeu'] = { select: { name: jeuName } };
    } else {
      properties['Jeu'] = { rich_text: [{ type: 'text', text: { content: jeuName } }] };
    }

    // Propriété Formule
    properties['Formule'] = {
      rich_text: [{ type: 'text', text: { content: payload.planName } }],
    };

    // Propriété Discord
    properties['Discord'] = {
      rich_text: [{ type: 'text', text: { content: payload.studentDiscord } }],
    };

    // Propriété Email
    properties['Email'] = {
      email: payload.studentEmail,
    };

    // Propriété Notes
    properties['Notes'] = {
      rich_text: [{ type: 'text', text: { content: (payload.notes || 'Aucune note spécifique').slice(0, 1900) } }],
    };

    // Si certaines propriétés n'existent pas dans la base de l'utilisateur, ne pas faire planter la requête
    if (schemaProps) {
      for (const key of Object.keys(properties)) {
        if (!schemaProps[key] && key !== titleKey) {
          delete properties[key];
        }
      }
    }

    const body = {
      parent: { database_id: realDbId },
      properties,
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
      console.error('[Notion Sync Error]', res.status, errText);
      return null;
    }

    const data = await res.json();
    console.info(`[Notion Sync] Réservation créée avec succès dans Notion (Page ID: ${data.id})`);
    return data.id as string;
  } catch (err) {
    console.error('[Notion Sync Exception]', err);
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
  status: 'rescheduled' | 'confirmed' = 'rescheduled',
  planDuration?: string,
  planName?: string
): Promise<boolean> {
  const config = getNotionConfig();
  if (!config || !notionPageId) return false;

  try {
    const { start, end } = buildNotionDateRange(newDate, newTime, planDuration, planName);
    const dateProperty: Record<string, any> = { start };
    if (end) dateProperty.end = end;

    const statusLabel = status === 'rescheduled' ? 'Reporté' : 'Confirmé';

    const body = {
      properties: {
        Date: { date: dateProperty },
        Statut: { select: { name: statusLabel } },
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
        Statut: { select: { name: 'Annulé' } },
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

    return res.ok;
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
        Statut: { select: { name: 'Terminé' } },
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

/**
 * Teste la connexion à Notion et renvoie un diagnostic complet
 */
export async function testNotionConnection(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  const config = getNotionConfig();
  if (!config) {
    return {
      success: false,
      message: 'Variables d\'environnement NOTION_API_KEY ou NOTION_BOOKINGS_DATABASE_ID manquantes dans votre configuration.',
    };
  }

  try {
    const realDbId = await resolveDatabaseId(config);
    const res = await fetch(`${NOTION_API_URL}/databases/${realDbId}`, {
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Notion-Version': NOTION_VERSION,
      },
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      if (res.status === 404) {
        return {
          success: false,
          message: 'Base de données introuvable (Erreur 404). Avez-vous bien cliqué sur les "•••" > "Connexions" > "Poulpy Coaching" sur votre page Notion ?',
          details: errJson,
        };
      }
      if (res.status === 401) {
        return {
          success: false,
          message: 'Clé secrète NOTION_API_KEY invalide (Erreur 401).',
          details: errJson,
        };
      }
      return {
        success: false,
        message: `Erreur API Notion (${res.status}) : ${errJson.message || 'Erreur inconnue'}`,
        details: errJson,
      };
    }

    const dbData = await res.json();
    return {
      success: true,
      message: `Connexion Notion réussie ! Base connectée : "${dbData.title?.[0]?.plain_text || 'Planning Coaching'}"`,
      details: {
        databaseId: realDbId,
        properties: Object.keys(dbData.properties || {}),
      },
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Exception réseau : ${err.message || err}`,
    };
  }
}

export interface ParsedNotionBooking {
  pageId: string;
  isArchived: boolean;
  title?: string;
  bookingDate?: string; // Format 'YYYY-MM-DD'
  bookingTime?: string; // Format 'HH:MM'
  status?: string; // 'Confirmé' | 'Reporté' | 'Annulé' | 'Terminé'
  game?: string;
  studentName?: string;
  studentDiscord?: string;
  studentEmail?: string;
}

/**
 * Récupère et parse les données d'une page Notion (pour les Webhooks et la synchronisation)
 */
export async function fetchNotionPage(notionPageId: string): Promise<ParsedNotionBooking | null> {
  const config = getNotionConfig();
  if (!config || !notionPageId) return null;

  try {
    const cleanId = cleanNotionId(notionPageId) || notionPageId;
    const res = await fetch(`${NOTION_API_URL}/pages/${cleanId}`, {
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Notion-Version': NOTION_VERSION,
      },
    });

    if (!res.ok) {
      console.error('[Notion Sync] Erreur fetchNotionPage:', res.status);
      return null;
    }

    const page = await res.json();
    return parseNotionPageObject(page);
  } catch (err) {
    console.error('[Notion Sync Exception in fetchNotionPage]:', err);
    return null;
  }
}

/**
 * Récupère toutes les pages de la base Notion pour la synchronisation globale
 */
export async function queryAllNotionBookings(): Promise<ParsedNotionBooking[]> {
  const config = getNotionConfig();
  if (!config) return [];

  try {
    const realDbId = await resolveDatabaseId(config);
    const res = await fetch(`${NOTION_API_URL}/databases/${realDbId}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page_size: 100,
      }),
    });

    if (!res.ok) {
      console.error('[Notion Sync] Erreur queryAllNotionBookings:', res.status);
      return [];
    }

    const data = await res.json();
    const results: ParsedNotionBooking[] = [];

    for (const page of data.results || []) {
      const parsed = parseNotionPageObject(page);
      if (parsed) results.push(parsed);
    }

    return results;
  } catch (err) {
    console.error('[Notion Sync Exception in queryAllNotionBookings]:', err);
    return [];
  }
}

/**
 * Convertit une date ISO Notion vers le fuseau horaire de Paris ('Europe/Paris')
 */
export function parseNotionDateToParis(dateStr?: string): { bookingDate?: string; bookingTime?: string } {
  if (!dateStr) return {};

  if (!dateStr.includes('T')) {
    return { bookingDate: dateStr, bookingTime: '14:00' };
  }

  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      const [dPart, tPart] = dateStr.split('T');
      return { bookingDate: dPart, bookingTime: tPart ? tPart.slice(0, 5) : '14:00' };
    }

    const formatter = new Intl.DateTimeFormat('fr-CA', {
      timeZone: 'Europe/Paris',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(d);
    const getPart = (type: string) => parts.find((p) => p.type === type)?.value || '';
    const year = getPart('year');
    const month = getPart('month');
    const day = getPart('day');
    const hour = getPart('hour');
    const minute = getPart('minute');

    return {
      bookingDate: `${year}-${month}-${day}`,
      bookingTime: `${hour}:${minute}`,
    };
  } catch {
    const [dPart, tPart] = dateStr.split('T');
    return { bookingDate: dPart, bookingTime: tPart ? tPart.slice(0, 5) : '14:00' };
  }
}

/**
 * Helper de parsing d'un objet Page Notion (robuste et dynamique)
 */
function parseNotionPageObject(page: any): ParsedNotionBooking {
  const props = page.properties || {};

  // Titre
  let title = '';
  const titleProp = Object.values(props).find((p: any) => p.type === 'title') as any;
  if (titleProp?.title?.[0]?.plain_text) {
    title = titleProp.title[0].plain_text;
  }

  // Date et heure avec conversion fuseau horaire Paris ('Europe/Paris')
  const datePropEntry = Object.entries(props).find(([, p]: [string, any]) => p.type === 'date');
  const dateProp = datePropEntry ? (datePropEntry[1] as any)?.date : props['Date']?.date;

  const { bookingDate, bookingTime } = parseNotionDateToParis(dateProp?.start);

  // Statut
  let status: string | undefined;
  if (props['Statut']?.select?.name) {
    status = props['Statut'].select.name;
  } else if (props['Statut']?.status?.name) {
    status = props['Statut'].status.name;
  }

  // Jeu
  let game: string | undefined;
  if (props['Jeu']?.select?.name) {
    game = props['Jeu'].select.name;
  } else if (props['Jeu']?.rich_text?.[0]?.plain_text) {
    game = props['Jeu'].rich_text[0].plain_text;
  }

  // Discord
  let studentDiscord: string | undefined;
  if (props['Discord']?.rich_text?.[0]?.plain_text) {
    studentDiscord = props['Discord'].rich_text[0].plain_text;
  }

  // Email
  let studentEmail: string | undefined;
  if (props['Email']?.email) {
    studentEmail = props['Email'].email;
  }

  // Extraction du nom de l'élève depuis le titre si possible (ex: "[VALORANT] Coaching - John")
  let studentName: string | undefined;
  if (title.includes('-')) {
    const parts = title.split('-');
    studentName = parts[parts.length - 1].trim();
  }

  return {
    pageId: page.id,
    isArchived: page.archived === true,
    title,
    bookingDate,
    bookingTime,
    status,
    game,
    studentName,
    studentDiscord,
    studentEmail,
  };
}
