import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Variables Supabase manquantes : SUPABASE_SERVICE_ROLE_KEY requis');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

// GET: Récupère la fiche de suivi d'un élève
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(studentId)) {
      return NextResponse.json({ error: 'studentId invalide' }, { status: 400 });
    }

    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Vérifier permissions (admin ou l'élève lui-même)
    const { data: callerProfile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    const isAdmin = callerProfile?.is_admin === true;
    const isSelf = user.id === studentId;

    if (!isAdmin && !isSelf) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Requête tolérante aux pannes si la table n'a pas encore été créée
    const { data: sheet, error: sheetError } = await supabaseAdmin
      .from('student_sheets')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();

    if (sheetError) {
      // Si la table n'existe pas encore dans Supabase
      if (sheetError.code === '42P01' || sheetError.message?.includes('does not exist')) {
        return NextResponse.json({
          success: true,
          exists: false,
          tableReady: false,
          sheet: {
            student_id: studentId,
            title: 'Fiche de suivi & progression',
            content: '',
          },
        });
      }
      throw sheetError;
    }

    return NextResponse.json({
      success: true,
      exists: !!sheet,
      tableReady: true,
      sheet: sheet || {
        student_id: studentId,
        title: 'Fiche de suivi & progression',
        content: '',
      },
    });
  } catch (err: unknown) {
    console.error('Erreur GET /api/admin/coaching/sheet/[studentId]:', err);
    const message = err instanceof Error ? err.message : 'Erreur de chargement de la fiche';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST: Crée ou met à jour la fiche de suivi d'un élève (Admin seulement)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(studentId)) {
      return NextResponse.json({ error: 'studentId invalide' }, { status: 400 });
    }

    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Seuls les administrateurs peuvent modifier une fiche
    const { data: callerProfile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!callerProfile?.is_admin) {
      return NextResponse.json({ error: 'Seuls les administrateurs peuvent modifier une fiche' }, { status: 403 });
    }

    const body = await req.json();
    const { title, content } = body;

    const { data: updatedSheet, error: upsertError } = await supabaseAdmin
      .from('student_sheets')
      .upsert(
        {
          student_id: studentId,
          title: (title || 'Fiche de suivi & progression').trim(),
          content: typeof content === 'string' ? content : '',
          updated_at: new Date().toISOString(),
          updated_by: user.id,
        },
        { onConflict: 'student_id' }
      )
      .select()
      .single();

    if (upsertError) {
      if (upsertError.code === '42P01' || upsertError.message?.includes('does not exist')) {
        return NextResponse.json(
          {
            error: "La table student_sheets n'existe pas encore dans Supabase. Veuillez exécuter le script SQL fourni dans create-student-sheets-table.sql.",
            tableReady: false,
          },
          { status: 503 }
        );
      }
      throw upsertError;
    }

    return NextResponse.json({
      success: true,
      sheet: updatedSheet,
      tableReady: true,
    });
  } catch (err: unknown) {
    console.error('Erreur POST /api/admin/coaching/sheet/[studentId]:', err);
    const message = err instanceof Error ? err.message : 'Erreur de sauvegarde de la fiche';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
