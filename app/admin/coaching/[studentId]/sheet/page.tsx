'use client';

import React, { useState, useEffect, useCallback, useRef, useDeferredValue } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, MessageSquare, Film, Save, Check, AlertCircle,
  Loader2, Image as ImageIcon, Table, Heading1, Heading2, Heading3,
  Bold, Italic, List, ListOrdered, CheckSquare, Eye, Edit3,
  Columns, Printer, Sparkles, User, Mail, Calendar, HelpCircle,
  Upload, Copy, ExternalLink, RefreshCw, Quote, Shield
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import SheetMarkdownPreview, { TableData } from '@/components/admin/SheetMarkdownPreview';
import VisualTableModal from '@/components/admin/VisualTableModal';
import VisualSheetEditor, {
  SheetBlock,
  markdownToBlocks,
  blocksToMarkdown,
  createBlockId,
} from '@/components/admin/VisualSheetEditor';

interface StudentProfile {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
  initial: string;
  createdAt: string;
  inCoaching: boolean;
}

export default function StudentSheetPage() {
  const { user, isLoading: authLoading } = useAuth();
  const params = useParams();
  const studentId = params.studentId as string;

  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [title, setTitle] = useState('Fiche de suivi & progression');
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');
  const [tableReady, setTableReady] = useState(true);
  const [token, setToken] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [showTemplatesMenu, setShowTemplatesMenu] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Modal d'édition visuelle de tableau
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [editingTableIndex, setEditingTableIndex] = useState<number | null>(null);
  const [tableModalData, setTableModalData] = useState<TableData | null>(null);

  // Blocs de la fiche en mode visuel (style Notion)
  const [blocks, setBlocks] = useState<SheetBlock[]>([]);

  // Mode d'affichage: 'visual' (défaut) | 'preview' | 'raw'
  const [viewMode, setViewMode] = useState<'visual' | 'preview' | 'raw'>('visual');

  // Deferred content pour ne jamais bloquer la saisie
  const deferredContent = useDeferredValue(content);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDirty = content !== originalContent || title !== originalTitle;

  // Charger les données de l'élève et sa fiche
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const tok = session?.access_token;
      if (!tok) throw new Error('Non authentifié');
      setToken(tok);

      // 1. Charger le profil de l'élève
      const profileRes = await fetch(`/api/admin/users?userId=${encodeURIComponent(studentId)}`, {
        headers: { Authorization: `Bearer ${tok}` },
        cache: 'no-store',
      });
      if (!profileRes.ok) throw new Error('Impossible de charger le profil de l\'élève');
      const profileData = await profileRes.json();
      const p = (profileData.users || []).find((u: { id: string }) => u.id === studentId);
      if (!p) throw new Error('Élève non trouvé');

      setStudent({
        id: p.id,
        username: p.username,
        email: p.email || '',
        avatarUrl: p.avatarUrl,
        initial: p.initial || p.username.charAt(0).toUpperCase(),
        createdAt: p.createdAt || new Date().toISOString(),
        inCoaching: p.inCoaching === true,
      });

      // 2. Charger la fiche
      const sheetRes = await fetch(`/api/admin/coaching/sheet/${studentId}`, {
        headers: { Authorization: `Bearer ${tok}` },
        cache: 'no-store',
      });

      if (!sheetRes.ok) {
        const errJson = await sheetRes.json().catch(() => ({}));
        throw new Error(errJson.error || 'Erreur lors du chargement de la fiche');
      }

      const sheetData = await sheetRes.json();
      setTableReady(sheetData.tableReady !== false);

      if (sheetData.sheet) {
        const t = sheetData.sheet.title || `Fiche de suivi - ${p.username}`;
        const c = sheetData.sheet.content || '';
        setTitle(t);
        setContent(c);
        setOriginalTitle(t);
        setOriginalContent(c);
        setBlocks(markdownToBlocks(c));
        if (sheetData.sheet.updated_at) {
          setLastSavedAt(new Date(sheetData.sheet.updated_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
        }
      } else {
        const defaultBlocks = markdownToBlocks('');
        setBlocks(defaultBlocks);
        setContent(blocksToMarkdown(defaultBlocks));
      }
    } catch (err: unknown) {
      console.error('Erreur chargement fiche perso:', err);
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (user?.isAdmin && studentId) {
      fetchData();
    }
  }, [user, studentId, fetchData]);

  // Sauvegarder la fiche
  const handleSave = async () => {
    if (!token) return;
    setIsSaving(true);
    setError('');
    setSaveSuccess(false);

    try {
      const res = await fetch(`/api/admin/coaching/sheet/${studentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.tableReady === false) {
          setTableReady(false);
        }
        throw new Error(data.error || 'Erreur de sauvegarde');
      }

      setOriginalTitle(title);
      setOriginalContent(content);
      setSaveSuccess(true);
      setTableReady(true);
      setLastSavedAt(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      console.error('Erreur sauvegarde:', err);
      setError(err instanceof Error ? err.message : 'Erreur de sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  // Raccourci clavier Ctrl+S / Cmd+S
  const handleSaveRef = useRef(handleSave);
  handleSaveRef.current = handleSave;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveRef.current();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Insérer du texte à la position du curseur
  const insertText = (before: string, after: string = '', defaultPlaceholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent(prev => prev + before + defaultPlaceholder + after);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end) || defaultPlaceholder;
    const replacement = before + selected + after;

    const newContent = content.slice(0, start) + replacement + content.slice(end);
    setContent(newContent);

    // Repositionner le curseur
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 10);
  };

  // Helper pour cibler et modifier le N-ième tableau Markdown dans le document
  const updateNthTable = (
    fullContent: string,
    targetIndex: number,
    transform: (tableLines: string[]) => string[]
  ): string => {
    const lines = fullContent.split('\n');
    let currentTableIndex = 0;
    const resultLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.includes('|')) {
        const tableLines: string[] = [];
        let j = i;
        while (j < lines.length && lines[j].trim().startsWith('|') && lines[j].trim().endsWith('|')) {
          tableLines.push(lines[j]);
          j++;
        }

        if (tableLines.length >= 2) {
          if (currentTableIndex === targetIndex) {
            const newTableLines = transform(tableLines);
            resultLines.push(...newTableLines);
          } else {
            resultLines.push(...tableLines);
          }
          currentTableIndex++;
          i = j - 1;
          continue;
        }
      }

      resultLines.push(line);
    }

    return resultLines.join('\n');
  };

  // Ajouter une colonne vers la droite sur un tableau spécifique
  const handleAddColumnToTable = (tableIndex: number) => {
    setContent(prev =>
      updateNthTable(prev, tableIndex, tableLines => {
        const headers = tableLines[0]
          .split('|')
          .slice(1, -1)
          .map(c => c.trim());
        const newColNum = headers.length + 1;
        const isDivider =
          tableLines.length > 1 && /^(\|\s*:?-+:?\s*)+\|$/.test(tableLines[1].trim());

        return tableLines.map((line, idx) => {
          const tLine = line.trim();
          if (idx === 0) {
            return tLine.replace(/\|$/, ` Colonne ${newColNum} |`);
          }
          if (idx === 1 && isDivider) {
            return tLine.replace(/\|$/, ' :--- |');
          }
          return tLine.replace(/\|$/, ' - |');
        });
      })
    );
  };

  // Ajouter une ligne en bas sur un tableau spécifique
  const handleAddRowToTable = (tableIndex: number) => {
    setContent(prev =>
      updateNthTable(prev, tableIndex, tableLines => {
        const headers = tableLines[0]
          .split('|')
          .slice(1, -1)
          .map(c => c.trim());
        const colCount = Math.max(headers.length, 1);
        const emptyRow = '| ' + Array(colCount).fill('-').join(' | ') + ' |';
        return [...tableLines, emptyRow];
      })
    );
  };

  // Ouvrir l'éditeur visuel pour modifier un tableau existant
  const handleOpenEditTable = (tableIndex: number, data: TableData) => {
    setEditingTableIndex(tableIndex);
    setTableModalData(data);
    setIsTableModalOpen(true);
  };

  // Mise à jour des blocs visuels avec synchronisation automatique vers le contenu Markdown
  const handleBlocksChange = (newBlocks: SheetBlock[]) => {
    setBlocks(newBlocks);
    setContent(blocksToMarkdown(newBlocks));
  };

  // Sauvegarder depuis le modal visuel (insertion nouveau tableau ou mise à jour)
  const handleSaveVisualTable = (markdownTable: string) => {
    if (editingTableIndex !== null) {
      const cleanTableLines = markdownTable.trim().split('\n');
      const updated = updateNthTable(content, editingTableIndex, () => cleanTableLines);
      setContent(updated);
      setBlocks(markdownToBlocks(updated));
      setEditingTableIndex(null);
      setTableModalData(null);
    } else {
      const newTableBlocks = markdownToBlocks(markdownTable).filter(b => b.type === 'table');
      if (newTableBlocks.length > 0) {
        const nextBlocks = [...blocks, ...newTableBlocks];
        setBlocks(nextBlocks);
        setContent(blocksToMarkdown(nextBlocks));
      } else {
        insertText('\n' + markdownTable.trim() + '\n');
      }
    }
    setIsTableModalOpen(false);
  };

  // Upload d'image / capture d'écran
  const uploadImageFile = async (file: File) => {
    if (!token) return;
    setIsUploadingImage(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/coaching/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Erreur lors de l\'upload de l\'image');
      }

      const data = await res.json();
      if (!data.url) throw new Error('URL de l\'image non retournée');

      // Ajouter le bloc image dans les blocs visuels
      const newImgBlock: SheetBlock = {
        id: createBlockId(),
        type: 'image',
        url: data.url,
        alt: `Capture - ${new Date().toLocaleDateString('fr-FR')}`,
      };
      setBlocks(prev => {
        const next = [...prev, newImgBlock];
        setContent(blocksToMarkdown(next));
        return next;
      });

      // Insérer aussi le tag markdown si dans le textarea
      const imgTag = `\n![Capture - ${new Date().toLocaleDateString('fr-FR')}](${data.url})\n`;
      insertText(imgTag);
    } catch (err: unknown) {
      console.error('Erreur upload capture:', err);
      setError(err instanceof Error ? err.message : 'Erreur d\'upload');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Gestion du Coller (Ctrl+V) de capture d'écran directement dans le textarea
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          uploadImageFile(file);
          return;
        }
      }
    }
  };

  // Modèles prédéfinis
  const applyTemplate = (type: 'complet' | 'aim' | 'vod') => {
    if (content.trim() && !window.confirm('Voulez-vous remplacer le contenu actuel par ce modèle ?')) {
      return;
    }

    const studentName = student?.username || 'Élève';

    let templateMd = '';
    if (type === 'complet') {
      templateMd = `# Fiche de Suivi Coaching : ${studentName}

> 🎯 **Objectif Principal :** Atteindre le palier supérieur avec une constance mécanique et un mental clutch infaillible.

---

## 1. Profil & Diagnostic Initial
- **Jeu(x) travaillé(s) :** Valorant / Apex Legends
- **Sensibilité / DPI :** 800 DPI | 0.35 in-game (eDPI: 280)
- **Matériel & Posture :** Tapis grand format, posture droite vérifiée
- **Point fort détecté :** Très bonne prise de décision en situation d'avantage numérique
- **Axes prioritaires :** Calmer le spam de tir, crosshair placement à hauteur de tête, anticipation des duels

---

## 2. Tableau des Objectifs & Jalons

| Objectif Spécifique | Cible Mesurable | Échéance | Statut |
| :--- | :--- | :--- | :--- |
| Stabiliser le Crosshair Placement | > 65% Headshot en Deathmatch | Semaine 2 | En cours 🔄 |
| Réduire les sur-flicks en duel | Score KovaaK's Pasu > 85 | Semaine 3 | À faire ⏳ |
| Gestion des compétences de clutch | 0 compétence gaspillée pré-engagement | Semaine 4 | En cours 🔄 |
| Revoir 2 VODs complètes en autonomie | Fiche d'auto-analyse remplie | Semaine 4 | Validé ✅ |

---

## 3. Routine Mécanique & Aim Training

| Exercice / Scénario | Support | Durée | Score Actuel | Objectif Palier |
| :--- | :--- | :--- | :--- | :--- |
| 1wall6targets TE | KovaaK's | 10 min | 142 | 165+ |
| Pasu Voltaic Easy | KovaaK's | 10 min | 74 | 88+ |
| Smoothbot Voltaic | KovaaK's | 10 min | 2600 | 3200+ |
| Deathmatch Shérif only | In-Game | 15 min | - | Focus 1-tap |

> 💡 **Conseil du Coach :** Ne jamais rusher la vitesse avant d'avoir 95%+ de précision. La vitesse vient naturellement de la fluidité de trajectoire.

---

## 4. Notes des Séances & Débriefing

### Session #1 (Diagnostic & Positionnement)
- Points abordés : Analyse du placement sur site, gestion des angles ouverts.
- Exercice à pratiquer : Prise de ligne en deadzoning sans over-peek.

- [x] Ajustement de la sensibilité validé
- [ ] Routine quotidienne effectuée 5 jours consécutifs
- [ ] Transmission d'un clip de clutch à analyser
`;
    } else if (type === 'aim') {
      templateMd = `# Programme Aim Training & Mécaniques : ${studentName}

> ⚡ **Focus :** Réactivité, micro-corrections et tracking fluide.

## Routine Quotidienne (30 à 45 minutes)

| Scénario | Catégorie | Temps | Répétitions | Score Cible |
| :--- | :--- | :--- | :--- | :--- |
| 1wall 6targets extra small | Flick / Micro-ajustement | 10 min | 10 runs | 110+ |
| Reflex Flick Easy | Temps de réaction | 8 min | 8 runs | 90+ |
| Thin Gauntlet | Smooth Tracking | 10 min | 10 runs | 850+ |
| PGTI Voltaic | Vertical Tracking | 10 min | 10 runs | 1200+ |

### Règles d'Or :
1. **Échauffement systématique :** Pas de ranked avant les 15 premières minutes de routine.
2. **Posture constante :** Avant-bras posé de la même manière sur le bureau, dos droit.
3. **Respiration :** Ne pas bloquer sa respiration pendant les duels à haute intensité.

> ⚠️ **Attention :** Si fatigue musculaire, stop immédiat. Privilégier la qualité à la quantité.
`;
    } else if (type === 'vod') {
      templateMd = `# Synthèse VOD Review & Tactique : ${studentName}

## Matchs Analysés

| Date | Carte / Mode | Rôle / Agent | Résultat | Erreurs Principales | Solutions Coach |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 04/09 | Ascent | Duelist | Défaite 11-13 | Peeks sans info préalable | Attendre l'utilitaire initiateur |
| 08/09 | Haven | Controller | Victoire 13-9 | Bonnes smokes, coms un peu tardives | Annoncer les smokes 5s avant |

---

## Plan d'Action pour la Prochaine Session :
- [ ] Poser les fumigènes de manière anticipée sur les exécutions rapides.
- [ ] Ne jamais reprendre une ligne ouverte après avoir révélé sa position.
- [ ] Déposer 2 clips de situations perdues dans l'onglet Clips VOD.
`;
    }

    if (templateMd) {
      setContent(templateMd);
      setBlocks(markdownToBlocks(templateMd));
    }
  };

  const copySqlScript = () => {
    const sql = `CREATE TABLE IF NOT EXISTS student_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Fiche de suivi & objectifs',
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  CONSTRAINT unique_student_sheet UNIQUE (student_id)
);
CREATE INDEX IF NOT EXISTS idx_student_sheets_student_id ON student_sheets(student_id);
ALTER TABLE student_sheets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins have full access on student_sheets" ON student_sheets;
CREATE POLICY "Admins have full access on student_sheets" ON student_sheets FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
DROP POLICY IF EXISTS "Students can view their own sheet" ON student_sheets;
CREATE POLICY "Students can view their own sheet" ON student_sheets FOR SELECT TO authenticated
USING (student_id = auth.uid());`;
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  if (authLoading || isLoading) {
    return (
      <main className="min-h-screen page-bg py-24 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">Chargement de la fiche personnalisée...</p>
        </div>
      </main>
    );
  }

  if (!user?.isAdmin) {
    return (
      <main className="min-h-screen page-bg py-24 flex items-center justify-center px-4">
        <div className="glass p-8 rounded-2xl max-w-md text-center border border-red-500/30">
          <Shield size={48} className="text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Accès restreint</h1>
          <p className="text-gray-400 mb-6">Cette page est réservée aux coachs administrateurs.</p>
          <Link href="/" className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium inline-block">
            Retour à l'accueil
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen page-bg py-20 pb-28">
      {/* Hidden file input for images */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadImageFile(file);
          e.target.value = '';
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation retour */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4 print:hidden">
          <Link
            href="/admin/coaching"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            Retour à la gestion coaching
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href={`/admin/coaching/${studentId}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 text-xs sm:text-sm font-medium transition-colors"
            >
              <MessageSquare size={15} />
              Chat avec l'élève
            </Link>
            <Link
              href={`/admin/coaching/${studentId}/clips`}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 text-xs sm:text-sm font-medium transition-colors"
            >
              <Film size={15} />
              Clips VOD
            </Link>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg glass hover:bg-white/10 text-gray-300 text-xs sm:text-sm transition-colors"
              title="Imprimer ou exporter en PDF"
            >
              <Printer size={15} />
              Imprimer / PDF
            </button>
          </div>
        </div>

        {/* Alerte table Supabase manquante */}
        {!tableReady && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-sm flex items-start justify-between gap-4 print:hidden">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="mt-0.5 flex-shrink-0 text-amber-400" />
              <div>
                <p className="font-semibold text-amber-200">Table Supabase student_sheets requise</p>
                <p className="text-xs text-amber-300/80 mt-0.5">
                  Pour sauvegarder cette fiche dans Supabase, la table `student_sheets` doit être créée. Copie le script SQL et colle-le dans le SQL Editor de Supabase.
                </p>
              </div>
            </div>
            <button
              onClick={copySqlScript}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copiedSql ? <Check size={14} /> : <Copy size={14} />}
              {copiedSql ? 'Copié !' : 'Copier SQL'}
            </button>
          </div>
        )}

        {/* Bannière élève */}
        <div className="glass-dark rounded-2xl p-6 mb-8 border border-white/10 flex items-center justify-between gap-6 flex-wrap shadow-xl">
          <div className="flex items-center gap-4 min-w-0">
            {student?.avatarUrl ? (
              <img
                src={student.avatarUrl}
                alt={student.username}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500/40 shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                {student?.initial}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">
                  {student?.username}
                </h1>
                {student?.inCoaching && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                    <Sparkles size={12} />
                    Coaching actif
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-400 mt-1 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Mail size={14} />
                  {student?.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  Inscrit le {student?.createdAt ? new Date(student.createdAt).toLocaleDateString('fr-FR') : '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Sauvegarder & statut */}
          <div className="flex items-center gap-3 print:hidden">
            {lastSavedAt && (
              <span className="text-xs text-gray-500 hidden sm:inline-block font-mono">
                Sauvegardé à {lastSavedAt}
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg ${
                saveSuccess
                  ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                  : isDirty
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-purple-500/40 hover:scale-[1.02]'
                  : 'bg-white/10 hover:bg-white/15 text-gray-300 border border-white/10'
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sauvegarde...
                </>
              ) : saveSuccess ? (
                <>
                  <Check size={16} />
                  Enregistré !
                </>
              ) : (
                <>
                  <Save size={16} />
                  {isDirty ? 'Enregistrer (Ctrl+S)' : 'Enregistré'}
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-sm flex items-center gap-2 print:hidden">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Titre de la fiche */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block print:hidden">
            Titre de la fiche
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre de la fiche..."
            className="w-full text-xl sm:text-2xl font-bold bg-white/5 border border-white/10 focus:border-purple-500/60 rounded-xl px-4 py-2.5 text-white focus:outline-none transition-colors"
          />
        </div>

        {/* Barre d'outils / Contrôles éditeur */}
        <div className="relative z-30 glass-dark rounded-xl p-3 mb-4 border border-white/10 flex items-center justify-between gap-2 flex-wrap print:hidden">
          {/* Outils de mise en page */}
          <div className="flex items-center gap-1 flex-wrap">
            <button
              onClick={() => insertText('# ')}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
              title="Grand Titre (H1)"
            >
              <Heading1 size={17} />
            </button>
            <button
              onClick={() => insertText('## ')}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
              title="Sous-titre (H2)"
            >
              <Heading2 size={17} />
            </button>
            <button
              onClick={() => insertText('### ')}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
              title="Section (H3)"
            >
              <Heading3 size={17} />
            </button>
            <div className="h-5 w-px bg-white/10 mx-1" />

            <button
              onClick={() => insertText('**', '**', 'texte en gras')}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
              title="Gras"
            >
              <Bold size={17} />
            </button>
            <button
              onClick={() => insertText('*', '*', 'texte en italique')}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
              title="Italique"
            >
              <Italic size={17} />
            </button>
            <button
              onClick={() => insertText('> 💡 **Conseil du Coach :** ', '', 'ton conseil ici')}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
              title="Conseil / Citation"
            >
              <Quote size={17} />
            </button>
            <div className="h-5 w-px bg-white/10 mx-1" />

            <button
              onClick={() => insertText('- ')}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
              title="Liste à puces"
            >
              <List size={17} />
            </button>
            <button
              onClick={() => insertText('1. ')}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
              title="Liste numérotée"
            >
              <ListOrdered size={17} />
            </button>
            <button
              onClick={() => insertText('- [ ] ', '', 'Tâche à valider')}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
              title="Case à cocher"
            >
              <CheckSquare size={17} />
            </button>
            <div className="h-5 w-px bg-white/10 mx-1" />

            {/* Bouton Créer un Tableau Visuel */}
            <button
              onClick={() => {
                setEditingTableIndex(null);
                setTableModalData(null);
                setIsTableModalOpen(true);
                setShowTemplatesMenu(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600/20 to-cyan-500/20 hover:from-purple-600/35 hover:to-cyan-500/35 text-purple-200 border border-purple-500/30 text-xs font-semibold transition-all hover:scale-105"
              title="Insérer un tableau avec l'éditeur visuel (sans code markdown)"
            >
              <Table size={15} className="text-cyan-400" />
              <span>Tableaux</span>
            </button>

            {/* Bouton Upload Capture d'écran */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingImage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-colors disabled:opacity-50"
              title="Ajouter une capture d'écran ou coller directement avec Ctrl+V"
            >
              {isUploadingImage ? <Loader2 size={15} className="animate-spin" /> : <ImageIcon size={15} />}
              <span>{isUploadingImage ? 'Envoi...' : 'Capture d\'écran'}</span>
            </button>

            {/* Modèles de fiches */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowTemplatesMenu(!showTemplatesMenu);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  showTemplatesMenu ? 'bg-indigo-600 text-white' : 'bg-white/5 hover:bg-white/10 text-gray-300'
                }`}
                title="Modèles pré-conçus"
              >
                <Sparkles size={15} />
                <span>Modèles</span>
              </button>

              {showTemplatesMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setShowTemplatesMenu(false)}
                  />
                  <div className="absolute left-0 mt-2 w-72 rounded-xl bg-[#13111C] border border-indigo-500/40 shadow-[0_12px_40px_rgba(0,0,0,0.85)] p-2 z-50 animate-fade-in space-y-1">
                    <button
                      onClick={() => {
                        applyTemplate('complet');
                        setShowTemplatesMenu(false);
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/10 text-xs text-gray-200 transition-colors"
                    >
                      ✨ <strong className="text-white">Fiche Complète de Suivi</strong>
                      <span className="block text-[10px] text-gray-400 mt-0.5">Diagnostic, Objectifs, Aim & Séances</span>
                    </button>
                    <button
                      onClick={() => {
                        applyTemplate('aim');
                        setShowTemplatesMenu(false);
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/10 text-xs text-gray-200 transition-colors"
                    >
                      🎯 <strong className="text-white">Programme Aim & Mécaniques</strong>
                      <span className="block text-[10px] text-gray-400 mt-0.5">Routines KovaaK's, scores et règles d'or</span>
                    </button>
                    <button
                      onClick={() => {
                        applyTemplate('vod');
                        setShowTemplatesMenu(false);
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/10 text-xs text-gray-200 transition-colors"
                    >
                      🎬 <strong className="text-white">Synthèse VOD & Tactique</strong>
                      <span className="block text-[10px] text-gray-400 mt-0.5">Analyse de matchs et plans d'action</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Sélecteur de mode d'affichage */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => {
                if (viewMode === 'raw') {
                  setBlocks(markdownToBlocks(content));
                }
                setViewMode('visual');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'visual'
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Sparkles size={14} />
              <span>Éditeur Visuel</span>
            </button>
            <button
              onClick={() => {
                if (viewMode === 'visual') {
                  setContent(blocksToMarkdown(blocks));
                }
                setViewMode('preview');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'preview' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Eye size={14} />
              <span>Aperçu Élève</span>
            </button>
            <button
              onClick={() => {
                if (viewMode === 'visual') {
                  setContent(blocksToMarkdown(blocks));
                }
                setViewMode('raw');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'raw' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Edit3 size={14} />
              <span>Markdown</span>
            </button>
          </div>
        </div>

        {/* Zone Principale de Travail */}
        {viewMode === 'visual' && (
          <div className="glass-dark rounded-2xl p-4 sm:p-8 border border-white/10 shadow-2xl">
            <VisualSheetEditor
              blocks={blocks}
              onChange={handleBlocksChange}
              onUploadImage={uploadImageFile}
              isUploadingImage={isUploadingImage}
            />
          </div>
        )}

        {viewMode === 'preview' && (
          <div className="glass-dark rounded-2xl border border-white/10 overflow-hidden shadow-2xl bg-black/40">
            <div className="px-4 py-2.5 bg-white/5 border-b border-white/10 flex items-center justify-between text-xs text-gray-400">
              <span className="font-mono text-purple-300 font-semibold">APERÇU FICHE ÉLÈVE</span>
              <span className="text-[11px] text-gray-500">Rendu final exact tel que l'élève le voit</span>
            </div>
            <div className="p-6 sm:p-10 overflow-y-auto">
              <SheetMarkdownPreview
                content={deferredContent}
                editable={true}
                onAddColumnToTable={handleAddColumnToTable}
                onAddRowToTable={handleAddRowToTable}
                onEditTable={handleOpenEditTable}
              />
            </div>
          </div>
        )}

        {viewMode === 'raw' && (
          <div className="flex flex-col h-[750px] rounded-2xl glass-dark border border-white/10 overflow-hidden shadow-2xl relative">
            <div className="px-4 py-2.5 bg-white/5 border-b border-white/10 flex items-center justify-between text-xs text-gray-400">
              <span className="font-mono">ÉDITEUR MARKDOWN BRUT</span>
              <span className="text-[11px] text-gray-500">
                Tu peux coller (Ctrl+V) une capture d'écran directement ici
              </span>
            </div>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setBlocks(markdownToBlocks(e.target.value));
              }}
              onPaste={handlePaste}
              placeholder="Rédige ici les objectifs, consignes, routines d'aim et insère tes tableaux..."
              className="flex-1 w-full p-5 bg-transparent text-gray-200 placeholder-gray-600 font-mono text-sm leading-relaxed resize-none focus:outline-none overflow-y-auto"
              spellCheck={false}
            />
            {isUploadingImage && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center gap-3 text-cyan-300 font-medium text-sm">
                <Loader2 size={24} className="animate-spin" />
                Téléversement de la capture d'écran...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal d'édition visuelle de tableau */}
      <VisualTableModal
        isOpen={isTableModalOpen}
        onClose={() => {
          setIsTableModalOpen(false);
          setEditingTableIndex(null);
          setTableModalData(null);
        }}
        onSaveTable={handleSaveVisualTable}
        initialData={tableModalData}
        mode={editingTableIndex !== null ? 'edit' : 'insert'}
      />
    </main>
  );
}
