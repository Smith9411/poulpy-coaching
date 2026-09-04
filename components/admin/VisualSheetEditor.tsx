'use client';

import React, { useState } from 'react';
import {
  Plus, Trash2, ArrowUp, ArrowDown, Table, Heading2,
  CheckSquare, Square, Quote, Image as ImageIcon,
  Sparkles, AlignLeft, X
} from 'lucide-react';

export type SheetBlock =
  | { id: string; type: 'h1'; content: string }
  | { id: string; type: 'h2'; content: string }
  | { id: string; type: 'h3'; content: string }
  | { id: string; type: 'paragraph'; content: string }
  | { id: string; type: 'quote'; content: string }
  | { id: string; type: 'checklist'; items: { id: string; checked: boolean; text: string }[] }
  | { id: string; type: 'table'; headers: string[]; rows: string[][] }
  | { id: string; type: 'image'; url: string; alt: string }
  | { id: string; type: 'divider' };

interface VisualSheetEditorProps {
  blocks: SheetBlock[];
  onChange: (blocks: SheetBlock[]) => void;
  onUploadImage: (file: File) => Promise<void>;
  isUploadingImage?: boolean;
}

let blockCounter = 0;
export const createBlockId = () => `blk_${Date.now()}_${++blockCounter}_${Math.random().toString(36).substr(2, 5)}`;

export function markdownToBlocks(markdown: string): SheetBlock[] {
  if (!markdown || !markdown.trim()) {
    return [
      { id: createBlockId(), type: 'h1', content: 'Fiche de Suivi Coaching' },
      { id: createBlockId(), type: 'quote', content: 'Objectif : Atteindre le palier supérieur avec une constance mécanique et un mental clutch infaillible.' },
      {
        id: createBlockId(),
        type: 'table',
        headers: ['Objectif Spécifique', 'Cible Mesurable', 'Échéance', 'Statut'],
        rows: [
          ['Stabiliser le Crosshair', '65% Headshot en Deathmatch', 'Semaine 2', 'En cours 🔄'],
          ['Tracking fluide Pasu', 'Score KovaaKs > 80', 'Semaine 3', 'À faire ⏳'],
          ['Revue VOD en autonomie', 'Fiche auto-analyse remplie', 'Semaine 4', 'Validé ✅'],
        ],
      },
      {
        id: createBlockId(),
        type: 'checklist',
        items: [
          { id: createBlockId(), checked: true, text: 'Ajustement de la sensibilité et posture validé' },
          { id: createBlockId(), checked: false, text: 'Routine quotidienne effectuée 5 jours consécutifs' },
          { id: createBlockId(), checked: false, text: 'Transmission d\'un clip de clutch à analyser' },
        ],
      },
    ];
  }

  const lines = markdown.split('\n');
  const blocks: SheetBlock[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) continue;

    // Séparateur horizontal
    if (/^(\-{3,}|\*{3,})$/.test(trimmed)) {
      blocks.push({ id: createBlockId(), type: 'divider' });
      continue;
    }

    // Titres
    if (trimmed.startsWith('#')) {
      const match = trimmed.match(/^(#{1,3})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const type = level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3';
        blocks.push({ id: createBlockId(), type, content: match[2].trim() });
        continue;
      }
    }

    // Citations / Conseils du coach (> ...)
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      let j = i;
      while (j < lines.length && lines[j].trim().startsWith('>')) {
        let clean = lines[j].trim().replace(/^>\s?/, '');
        clean = clean.replace(/^(💡\s*)?\*\*Conseil du Coach\s*:\*\*\s*/, '');
        quoteLines.push(clean);
        j++;
      }
      i = j - 1;
      blocks.push({ id: createBlockId(), type: 'quote', content: quoteLines.join(' ').trim() });
      continue;
    }

    // Tableaux Markdown (| ... |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.includes('|')) {
      const tableLines: string[] = [];
      let j = i;
      while (j < lines.length && lines[j].trim().startsWith('|') && lines[j].trim().endsWith('|')) {
        tableLines.push(lines[j].trim());
        j++;
      }
      i = j - 1;

      if (tableLines.length >= 2) {
        const rawHeaders = tableLines[0]
          .split('|')
          .slice(1, -1)
          .map(c => c.trim());

        const isDivider = /^(\|\s*:?-+:?\s*)+\|$/.test(tableLines[1]);
        const dataRows = isDivider ? tableLines.slice(2) : tableLines.slice(1);

        const rows = dataRows.map(rowStr => {
          const cells = rowStr
            .split('|')
            .slice(1, -1)
            .map(c => c.trim());
          while (cells.length < rawHeaders.length) cells.push('-');
          return cells.slice(0, rawHeaders.length);
        });

        blocks.push({
          id: createBlockId(),
          type: 'table',
          headers: rawHeaders.length > 0 ? rawHeaders : ['Colonne 1', 'Colonne 2'],
          rows: rows.length > 0 ? rows : [Array(rawHeaders.length || 2).fill('-')],
        });
        continue;
      }
    }

    // Checklists (- [ ] ou - [x])
    if (/^[-*]\s*\[([ xX])\]/.test(trimmed)) {
      const items: { id: string; checked: boolean; text: string }[] = [];
      let j = i;
      while (j < lines.length) {
        const m = lines[j].trim().match(/^[-*]\s*\[([ xX])\]\s*(.*)$/);
        if (!m) break;
        items.push({
          id: createBlockId(),
          checked: m[1].toLowerCase() === 'x',
          text: m[2].trim(),
        });
        j++;
      }
      i = j - 1;
      blocks.push({ id: createBlockId(), type: 'checklist', items });
      continue;
    }

    // Image (![alt](url))
    const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      blocks.push({ id: createBlockId(), type: 'image', alt: imgMatch[1], url: imgMatch[2] });
      continue;
    }

    // Paragraphe standard
    blocks.push({ id: createBlockId(), type: 'paragraph', content: line });
  }

  return blocks;
}

export function blocksToMarkdown(blocks: SheetBlock[]): string {
  const parts: string[] = [];

  for (const block of blocks) {
    if (block.type === 'h1') {
      if (block.content.trim()) parts.push(`# ${block.content.trim()}\n`);
    } else if (block.type === 'h2') {
      if (block.content.trim()) parts.push(`## ${block.content.trim()}\n`);
    } else if (block.type === 'h3') {
      if (block.content.trim()) parts.push(`### ${block.content.trim()}\n`);
    } else if (block.type === 'divider') {
      parts.push(`---\n`);
    } else if (block.type === 'quote') {
      if (block.content.trim()) parts.push(`> 💡 **Conseil du Coach :** ${block.content.trim()}\n`);
    } else if (block.type === 'paragraph') {
      if (block.content.trim()) parts.push(`${block.content.trim()}\n`);
    } else if (block.type === 'image') {
      parts.push(`![${block.alt || 'Capture'}](${block.url})\n`);
    } else if (block.type === 'checklist') {
      const validItems = block.items.filter(it => it.text.trim());
      if (validItems.length > 0) {
        const itemsStr = validItems
          .map(it => `- [${it.checked ? 'x' : ' '}] ${it.text.trim()}`)
          .join('\n');
        parts.push(`${itemsStr}\n`);
      }
    } else if (block.type === 'table') {
      const cleanHeaders = block.headers.map(h => (h.trim() ? h.trim() : 'Colonne'));
      const headerLine = '| ' + cleanHeaders.join(' | ') + ' |';
      const dividerLine = '| ' + cleanHeaders.map(() => ':---').join(' | ') + ' |';
      const rowLines = block.rows.map(row => {
        const rowCells = cleanHeaders.map((_, idx) => (row[idx] !== undefined && row[idx].trim() ? row[idx].trim() : '-'));
        return '| ' + rowCells.join(' | ') + ' |';
      });
      parts.push([headerLine, dividerLine, ...rowLines].join('\n') + '\n');
    }
  }

  return parts.join('\n');
}

export default function VisualSheetEditor({
  blocks,
  onChange,
  onUploadImage,
  isUploadingImage = false,
}: VisualSheetEditorProps) {
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Mise à jour d'un bloc
  const updateBlock = (idx: number, updated: SheetBlock) => {
    const next = [...blocks];
    next[idx] = updated;
    onChange(next);
  };

  // Suppression d'un bloc
  const deleteBlock = (idx: number) => {
    const next = blocks.filter((_, i) => i !== idx);
    onChange(next);
  };

  // Déplacement d'un bloc vers le haut
  const moveBlockUp = (idx: number) => {
    if (idx === 0) return;
    const next = [...blocks];
    const temp = next[idx - 1];
    next[idx - 1] = next[idx];
    next[idx] = temp;
    onChange(next);
  };

  // Déplacement d'un bloc vers le bas
  const moveBlockDown = (idx: number) => {
    if (idx === blocks.length - 1) return;
    const next = [...blocks];
    const temp = next[idx + 1];
    next[idx + 1] = next[idx];
    next[idx] = temp;
    onChange(next);
  };

  // Ajout d'un bloc
  const addBlock = (type: SheetBlock['type'], atIndex?: number) => {
    let newBlock: SheetBlock;

    if (type === 'table') {
      newBlock = {
        id: createBlockId(),
        type: 'table',
        headers: ['Objectif / Sujet', 'Cible / Détails', 'Statut'],
        rows: [
          ['Stabiliser le crosshair', 'Focus hauteur de tête', 'En cours 🔄'],
          ['Routine Kovaaks', '10 min par jour', 'À faire ⏳'],
        ],
      };
    } else if (type === 'checklist') {
      newBlock = {
        id: createBlockId(),
        type: 'checklist',
        items: [
          { id: createBlockId(), checked: false, text: 'Nouvel objectif à valider' },
        ],
      };
    } else if (type === 'h1') {
      newBlock = { id: createBlockId(), type: 'h1', content: 'Grand Titre' };
    } else if (type === 'h2') {
      newBlock = { id: createBlockId(), type: 'h2', content: 'Section' };
    } else if (type === 'h3') {
      newBlock = { id: createBlockId(), type: 'h3', content: 'Sous-section' };
    } else if (type === 'quote') {
      newBlock = { id: createBlockId(), type: 'quote', content: 'Ton conseil ou consigne clé ici...' };
    } else if (type === 'divider') {
      newBlock = { id: createBlockId(), type: 'divider' };
    } else {
      newBlock = { id: createBlockId(), type: 'paragraph', content: 'Rédige tes notes ici...' };
    }

    if (atIndex !== undefined && atIndex >= 0) {
      const next = [...blocks];
      next.splice(atIndex + 1, 0, newBlock);
      onChange(next);
    } else {
      onChange([...blocks, newBlock]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Barre d'outils d'ajout rapide en tête */}
      <div className="p-3.5 rounded-2xl bg-[#14121F]/90 border border-purple-500/25 shadow-xl flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-purple-300 font-semibold uppercase tracking-wider">
          <Sparkles size={14} className="text-cyan-400" />
          <span>Ajouter au document :</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => addBlock('table')}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600/30 to-cyan-500/30 hover:from-purple-600/50 hover:to-cyan-500/50 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 transition-all hover:scale-105 shadow-sm"
          >
            <Table size={14} />
            <span>+ Tableau</span>
          </button>

          <button
            type="button"
            onClick={() => addBlock('checklist')}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <CheckSquare size={14} />
            <span>+ Checklist</span>
          </button>

          <button
            type="button"
            onClick={() => addBlock('quote')}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Quote size={14} />
            <span>+ Conseil Coach</span>
          </button>

          <button
            type="button"
            onClick={() => addBlock('h2')}
            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <Heading2 size={14} />
            <span>+ Titre</span>
          </button>

          <button
            type="button"
            onClick={() => addBlock('paragraph')}
            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <AlignLeft size={14} />
            <span>+ Texte</span>
          </button>
        </div>
      </div>

      {/* Liste des blocs interactifs */}
      {blocks.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
          <Table size={40} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">La fiche est vide.</p>
          <p className="text-xs text-gray-500 mt-1 mb-4">Clique sur un bouton ci-dessus pour commencer avec un tableau ou un modèle.</p>
          <button
            onClick={() => addBlock('table')}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold inline-flex items-center gap-2 transition-colors"
          >
            <Plus size={15} />
            Créer un premier tableau
          </button>
        </div>
      ) : (
        blocks.map((block, idx) => (
          <div
            key={block.id}
            className="group relative rounded-2xl transition-all"
          >
            {/* Rendu spécifique selon le type */}
            {block.type === 'table' && (
              <VisualTableBlock
                block={block}
                onChange={(updated) => updateBlock(idx, updated)}
                onDelete={() => deleteBlock(idx)}
                onMoveUp={idx > 0 ? () => moveBlockUp(idx) : undefined}
                onMoveDown={idx < blocks.length - 1 ? () => moveBlockDown(idx) : undefined}
              />
            )}

            {block.type === 'checklist' && (
              <VisualChecklistBlock
                block={block}
                onChange={(updated) => updateBlock(idx, updated)}
                onDelete={() => deleteBlock(idx)}
                onMoveUp={idx > 0 ? () => moveBlockUp(idx) : undefined}
                onMoveDown={idx < blocks.length - 1 ? () => moveBlockDown(idx) : undefined}
              />
            )}

            {block.type === 'quote' && (
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 glass relative shadow-lg">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                    <Quote size={15} />
                    <span>💡 CONSEIL DU COACH</span>
                  </div>
                  <BlockControls
                    onMoveUp={idx > 0 ? () => moveBlockUp(idx) : undefined}
                    onMoveDown={idx < blocks.length - 1 ? () => moveBlockDown(idx) : undefined}
                    onDelete={() => deleteBlock(idx)}
                  />
                </div>
                <textarea
                  value={block.content}
                  onChange={(e) => updateBlock(idx, { ...block, content: e.target.value })}
                  placeholder="Conseil ou recommandation clé pour l'élève..."
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:border-amber-400/60 leading-relaxed resize-none transition-colors"
                />
              </div>
            )}

            {(block.type === 'h1' || block.type === 'h2' || block.type === 'h3') && (
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 relative group/title transition-colors">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] uppercase font-bold text-gray-500">
                    {block.type === 'h1' ? 'Titre Principal (H1)' : block.type === 'h2' ? 'Titre de Section (H2)' : 'Sous-titre (H3)'}
                  </span>
                  <BlockControls
                    onMoveUp={idx > 0 ? () => moveBlockUp(idx) : undefined}
                    onMoveDown={idx < blocks.length - 1 ? () => moveBlockDown(idx) : undefined}
                    onDelete={() => deleteBlock(idx)}
                  />
                </div>
                <input
                  type="text"
                  value={block.content}
                  onChange={(e) => updateBlock(idx, { ...block, content: e.target.value })}
                  placeholder="Titre de la section..."
                  className={`w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors ${
                    block.type === 'h1' ? 'text-2xl font-black' : block.type === 'h2' ? 'text-xl font-bold' : 'text-base font-semibold'
                  }`}
                />
              </div>
            )}

            {block.type === 'paragraph' && (
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 relative group/para transition-colors">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] uppercase font-bold text-gray-500">Texte / Notes</span>
                  <BlockControls
                    onMoveUp={idx > 0 ? () => moveBlockUp(idx) : undefined}
                    onMoveDown={idx < blocks.length - 1 ? () => moveBlockDown(idx) : undefined}
                    onDelete={() => deleteBlock(idx)}
                  />
                </div>
                <textarea
                  value={block.content}
                  onChange={(e) => updateBlock(idx, { ...block, content: e.target.value })}
                  placeholder="Écris tes consignes, explications ou remarques..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:border-purple-500 leading-relaxed resize-y transition-colors"
                />
              </div>
            )}

            {block.type === 'divider' && (
              <div className="py-2 flex items-center justify-between gap-4 group/div">
                <div className="flex-1 h-px bg-white/15" />
                <button
                  type="button"
                  onClick={() => deleteBlock(idx)}
                  className="opacity-0 group-hover/div:opacity-100 p-1 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all text-xs flex items-center gap-1"
                >
                  <Trash2 size={12} /> Supprimer la ligne
                </button>
                <div className="flex-1 h-px bg-white/15" />
              </div>
            )}

            {block.type === 'image' && (
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 relative shadow-xl">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                    <ImageIcon size={14} /> Capture d'écran
                  </span>
                  <BlockControls
                    onMoveUp={idx > 0 ? () => moveBlockUp(idx) : undefined}
                    onMoveDown={idx < blocks.length - 1 ? () => moveBlockDown(idx) : undefined}
                    onDelete={() => deleteBlock(idx)}
                  />
                </div>
                <div className="relative inline-block max-w-full rounded-xl overflow-hidden border border-white/15 bg-black/60">
                  <img
                    src={block.url}
                    alt={block.alt || 'Capture'}
                    className="max-h-72 max-w-full object-contain cursor-zoom-in"
                    onClick={() => setZoomImage(block.url)}
                  />
                </div>
                <div className="mt-2">
                  <input
                    type="text"
                    value={block.alt}
                    onChange={(e) => updateBlock(idx, { ...block, alt: e.target.value })}
                    placeholder="Légende de l'image (ex: Erreur de placement manche 8)..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            )}
          </div>
        ))
      )}

      {/* Bouton d'ajout en pied de page */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-center">
        <button
          type="button"
          onClick={() => addBlock('table')}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/30 transition-all hover:scale-105"
        >
          <Plus size={16} />
          <span>Ajouter un nouveau tableau</span>
        </button>
      </div>

      {/* Modal Zoom Image */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setZoomImage(null)}
        >
          <button
            onClick={() => setZoomImage(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <X size={24} />
          </button>
          <img
            src={zoomImage}
            alt="Plein écran"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------------
// COMPOSANT TABLEAU VISUEL & INTERACTIF
// Permet d'ajouter une colonne vers la droite ou une ligne d'un simple clic
// ---------------------------------------------------------------------------------
function VisualTableBlock({
  block,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  block: Extract<SheetBlock, { type: 'table' }>;
  onChange: (updated: Extract<SheetBlock, { type: 'table' }>) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  // Ajouter une colonne vers la droite
  const addColumn = () => {
    const newColIndex = block.headers.length + 1;
    const newHeaders = [...block.headers, `Colonne ${newColIndex}`];
    const newRows = block.rows.map(r => [...r, '']);
    onChange({ ...block, headers: newHeaders, rows: newRows });
  };

  // Supprimer une colonne
  const removeColumn = (colIdx: number) => {
    if (block.headers.length <= 1) return;
    const newHeaders = block.headers.filter((_, i) => i !== colIdx);
    const newRows = block.rows.map(r => r.filter((_, i) => i !== colIdx));
    onChange({ ...block, headers: newHeaders, rows: newRows });
  };

  // Ajouter une ligne en bas
  const addRow = () => {
    const newRows = [...block.rows, Array(block.headers.length).fill('')];
    onChange({ ...block, rows: newRows });
  };

  // Supprimer une ligne
  const removeRow = (rowIdx: number) => {
    if (block.rows.length <= 1) return;
    const newRows = block.rows.filter((_, i) => i !== rowIdx);
    onChange({ ...block, rows: newRows });
  };

  // Modifier le titre d'une colonne
  const updateHeader = (colIdx: number, val: string) => {
    const newHeaders = [...block.headers];
    newHeaders[colIdx] = val;
    onChange({ ...block, headers: newHeaders });
  };

  // Modifier une cellule
  const updateCell = (rowIdx: number, colIdx: number, val: string) => {
    const newRows = block.rows.map((row, rI) => {
      if (rI !== rowIdx) return row;
      const nextRow = [...row];
      nextRow[colIdx] = val;
      return nextRow;
    });
    onChange({ ...block, rows: newRows });
  };

  return (
    <div className="rounded-2xl bg-[#110F1B]/95 border border-purple-500/35 shadow-2xl overflow-hidden">
      {/* Barre supérieure du tableau avec boutons d'actions */}
      <div className="px-5 py-3 bg-white/[0.04] border-b border-white/10 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
            <Table size={16} />
          </div>
          <div>
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Tableau Interactif
            </span>
            <span className="text-[11px] text-gray-400">
              {block.headers.length} colonnes • {block.rows.length} lignes
            </span>
          </div>
        </div>

        {/* Boutons principaux pour modifier le tableau */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={addColumn}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-105"
            title="Ajouter une nouvelle colonne vers la droite"
          >
            <Plus size={14} />
            <span>+ Colonne à droite</span>
          </button>

          <button
            type="button"
            onClick={addRow}
            className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-105"
            title="Ajouter une nouvelle ligne en bas"
          >
            <Plus size={14} />
            <span>+ Ligne en bas</span>
          </button>

          <div className="h-5 w-px bg-white/10 mx-1" />

          <BlockControls
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onDelete={onDelete}
          />
        </div>
      </div>

      {/* Grille du Tableau */}
      <div className="p-4 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-8 text-[11px] text-gray-500 font-mono text-center pb-2">#</th>
              {block.headers.map((head, cIdx) => (
                <th key={cIdx} className="min-w-[180px] p-1.5 pb-2 text-left">
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={head}
                      onChange={(e) => updateHeader(cIdx, e.target.value)}
                      placeholder={`Colonne ${cIdx + 1}`}
                      className="w-full px-3 py-2 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-200 text-xs font-bold focus:outline-none focus:border-cyan-400 transition-colors shadow-inner"
                    />
                    {block.headers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeColumn(cIdx)}
                        className="p-1 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Supprimer cette colonne"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </th>
              ))}

              {/* Bouton rapide + colonne au bout de l'en-tête */}
              <th className="p-1.5 pb-2 align-middle">
                <button
                  type="button"
                  onClick={addColumn}
                  className="px-2.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-dashed border-cyan-500/40 text-xs font-semibold flex items-center gap-1 whitespace-nowrap transition-colors"
                  title="Ajouter une colonne vers la droite"
                >
                  <Plus size={13} />
                  <span>Colonne</span>
                </button>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5">
            {block.rows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
                <td className="text-[11px] text-gray-500 font-mono text-center pr-2 py-1.5">
                  {rIdx + 1}
                </td>
                {block.headers.map((_, cIdx) => (
                  <td key={cIdx} className="p-1.5 py-1.5">
                    <input
                      type="text"
                      value={row[cIdx] || ''}
                      onChange={(e) => updateCell(rIdx, cIdx, e.target.value)}
                      placeholder="—"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-200 text-xs focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </td>
                ))}

                {/* Bouton supprimer ligne */}
                <td className="p-1.5 py-1.5 text-center">
                  {block.rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(rIdx)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Supprimer cette ligne"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bouton grand format pour ajouter une ligne en bas */}
      <div className="px-4 py-2.5 bg-white/[0.02] border-t border-white/10 flex items-center justify-between">
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-colors"
        >
          <Plus size={14} />
          <span>+ Ajouter une ligne en bas</span>
        </button>

        <span className="text-[11px] text-gray-500">
          Astuce : Tu peux modifier n'importe quelle cellule directement en cliquant dessus
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------
// COMPOSANT CHECKLIST INTERACTIVE
// ---------------------------------------------------------------------------------
function VisualChecklistBlock({
  block,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  block: Extract<SheetBlock, { type: 'checklist' }>;
  onChange: (updated: Extract<SheetBlock, { type: 'checklist' }>) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const addItem = () => {
    const newItems = [...block.items, { id: createBlockId(), checked: false, text: '' }];
    onChange({ ...block, items: newItems });
  };

  const removeItem = (itemIdx: number) => {
    if (block.items.length <= 1) return;
    const newItems = block.items.filter((_, i) => i !== itemIdx);
    onChange({ ...block, items: newItems });
  };

  const toggleCheck = (itemIdx: number) => {
    const newItems = block.items.map((it, i) => (i === itemIdx ? { ...it, checked: !it.checked } : it));
    onChange({ ...block, items: newItems });
  };

  const updateText = (itemIdx: number, text: string) => {
    const newItems = block.items.map((it, i) => (i === itemIdx ? { ...it, text } : it));
    onChange({ ...block, items: newItems });
  };

  return (
    <div className="p-4 rounded-2xl bg-[#110F1B]/80 border border-emerald-500/30 glass shadow-lg">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
          <CheckSquare size={16} />
          <span>LISTE D'OBJECTIFS & TÂCHES</span>
        </div>
        <BlockControls
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onDelete={onDelete}
        />
      </div>

      <div className="space-y-2">
        {block.items.map((item, idx) => (
          <div key={item.id || idx} className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => toggleCheck(idx)}
              className="flex-shrink-0 text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              {item.checked ? <CheckSquare size={18} /> : <Square size={18} className="text-gray-500" />}
            </button>
            <input
              type="text"
              value={item.text}
              onChange={(e) => updateText(idx, e.target.value)}
              placeholder="Tâche ou consigne à réaliser..."
              className={`flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors ${
                item.checked ? 'line-through text-gray-500' : ''
              }`}
            />
            {block.items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="p-1 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors"
      >
        <Plus size={14} />
        <span>Ajouter un objectif</span>
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------------
// CONTRÔLES COMMUNS DE BLOC (Monter, Descendre, Supprimer)
// ---------------------------------------------------------------------------------
function BlockControls({
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {onMoveUp && (
        <button
          type="button"
          onClick={onMoveUp}
          className="p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
          title="Monter"
        >
          <ArrowUp size={13} />
        </button>
      )}
      {onMoveDown && (
        <button
          type="button"
          onClick={onMoveDown}
          className="p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
          title="Descendre"
        >
          <ArrowDown size={13} />
        </button>
      )}
      <button
        type="button"
        onClick={onDelete}
        className="p-1 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        title="Supprimer ce bloc"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
