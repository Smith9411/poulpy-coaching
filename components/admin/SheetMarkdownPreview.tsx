'use client';

import React, { useState } from 'react';
import { CheckSquare, Square, ExternalLink, Maximize2, X, Plus, Edit3, Table } from 'lucide-react';

export interface TableData {
  headers: string[];
  rows: string[][];
}

interface SheetMarkdownPreviewProps {
  content: string;
  className?: string;
  editable?: boolean;
  onAddColumnToTable?: (tableIndex: number) => void;
  onAddRowToTable?: (tableIndex: number) => void;
  onEditTable?: (tableIndex: number, data: TableData) => void;
}

export default function SheetMarkdownPreview({
  content,
  className = '',
  editable = false,
  onAddColumnToTable,
  onAddRowToTable,
  onEditTable,
}: SheetMarkdownPreviewProps) {
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  if (!content || !content.trim()) {
    return (
      <div className="text-gray-500 italic py-16 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
        <p className="font-medium text-gray-400 mb-1">La fiche est vide pour le moment.</p>
        <p className="text-xs text-gray-500">Utilise la barre d&apos;outils ou les modèles ci-dessus pour ajouter des objectifs, des routines ou des captures.</p>
      </div>
    );
  }

  // Helper pour parser le texte en ligne (gras, italique, code, liens, images)
  const renderInline = (text: string): React.ReactNode => {
    if (!text) return null;
    const tokens: React.ReactNode[] = [];
    let remaining = text;
    let keyIdx = 0;
    let safetyCounter = 0;

    while (remaining.length > 0 && safetyCounter < 1500) {
      safetyCounter++;
      const prevLen = remaining.length;

      // Image: ![alt](url)
      const imgMatch = remaining.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
      if (imgMatch) {
        const alt = imgMatch[1] || 'Capture';
        const src = imgMatch[2];
        tokens.push(
          <span key={`img-${keyIdx++}`} className="inline-block my-2 max-w-full">
            <span
              onClick={() => setZoomImage(src)}
              className="group relative inline-block cursor-zoom-in rounded-xl overflow-hidden border border-white/20 bg-black/40 shadow-lg hover:border-purple-500/50 transition-all"
            >
              <img
                src={src}
                alt={alt}
                className="max-h-80 max-w-full rounded-xl object-contain hover:scale-[1.01] transition-transform"
                loading="lazy"
              />
              <span className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/70 text-white text-[11px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <Maximize2 size={12} /> Agrandir
              </span>
            </span>
            {alt && alt !== 'Capture' && alt !== "Capture d'écran" && (
              <span className="block text-xs text-gray-400 mt-1 text-center italic">{alt}</span>
            )}
          </span>
        );
        remaining = remaining.slice(imgMatch[0].length);
        continue;
      }

      // Lien: [text](url)
      const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        tokens.push(
          <a
            key={`link-${keyIdx++}`}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 underline inline-flex items-center gap-0.5"
          >
            {linkMatch[1]}
            <ExternalLink size={12} className="inline ml-0.5" />
          </a>
        );
        remaining = remaining.slice(linkMatch[0].length);
        continue;
      }

      // Gras: **text**
      const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
      if (boldMatch) {
        tokens.push(<strong key={`b-${keyIdx++}`} className="font-bold text-white">{boldMatch[1]}</strong>);
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }

      // Italique: *text*
      const italicMatch = remaining.match(/^\*([^*]+)\*/);
      if (italicMatch) {
        tokens.push(<em key={`i-${keyIdx++}`} className="italic text-gray-300">{italicMatch[1]}</em>);
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }

      // Code inline: `code`
      const codeMatch = remaining.match(/^`([^`]+)`/);
      if (codeMatch) {
        tokens.push(
          <code key={`c-${keyIdx++}`} className="px-1.5 py-0.5 rounded bg-white/10 text-pink-300 font-mono text-xs border border-white/10">
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.slice(codeMatch[0].length);
        continue;
      }

      // Barré: ~~text~~
      const delMatch = remaining.match(/^~~([^~]+)~~/);
      if (delMatch) {
        tokens.push(<del key={`d-${keyIdx++}`} className="line-through text-gray-500">{delMatch[1]}</del>);
        remaining = remaining.slice(delMatch[0].length);
        continue;
      }

      // Caractère ordinaire
      const nextSpecial = remaining.search(/(!\[|\[|\*\*|\*|`|~~)/);
      if (nextSpecial === -1) {
        tokens.push(remaining);
        break;
      } else if (nextSpecial === 0) {
        tokens.push(remaining[0]);
        remaining = remaining.slice(1);
      } else {
        tokens.push(remaining.slice(0, nextSpecial));
        remaining = remaining.slice(nextSpecial);
      }

      // Garantie absolue contre toute boucle infinie
      if (remaining.length >= prevLen) {
        tokens.push(remaining[0]);
        remaining = remaining.slice(1);
      }
    }

    return tokens;
  };

  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  let tableCounter = 0;

  // Boucle principale FOR 100% sécurisée
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Ligne vide
    if (!trimmed) {
      continue;
    }

    // 2. Séparateur horizontal (--- ou ***)
    if (/^(\-{3,}|\*{3,})$/.test(trimmed)) {
      blocks.push(
        <hr key={`hr-${i}`} className="my-6 border-white/10" />
      );
      continue;
    }

    // 3. Bloc de code (```)
    if (trimmed.startsWith('```')) {
      const codeLines: string[] = [];
      let nextIdx = i + 1;
      while (nextIdx < lines.length && !lines[nextIdx].trim().startsWith('```')) {
        codeLines.push(lines[nextIdx]);
        nextIdx++;
      }
      i = nextIdx; // saute après le bloc fermant
      blocks.push(
        <pre key={`codeblock-${i}`} className="p-4 rounded-xl bg-black/50 border border-white/10 overflow-x-auto text-sm text-cyan-300 font-mono my-4">
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      continue;
    }

    // 4. Titres (# Titre)
    if (trimmed.startsWith('#')) {
      const match = trimmed.match(/^(#{1,4})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const titleText = match[2];
        if (level === 1) {
          blocks.push(
            <h1 key={`h1-${i}`} className="text-2xl sm:text-3xl font-black text-white mt-6 mb-3 pb-2 border-b border-purple-500/30 flex items-center gap-2">
              <span className="w-2 h-6 bg-gradient-to-b from-purple-500 to-cyan-500 rounded-full inline-block flex-shrink-0" />
              <span>{renderInline(titleText)}</span>
            </h1>
          );
        } else if (level === 2) {
          blocks.push(
            <h2 key={`h2-${i}`} className="text-xl sm:text-2xl font-bold text-white mt-5 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-purple-400 rounded-full inline-block flex-shrink-0" />
              <span>{renderInline(titleText)}</span>
            </h2>
          );
        } else if (level === 3) {
          blocks.push(
            <h3 key={`h3-${i}`} className="text-lg font-semibold text-purple-200 mt-4 mb-2">
              {renderInline(titleText)}
            </h3>
          );
        } else {
          blocks.push(
            <h4 key={`h4-${i}`} className="text-base font-semibold text-gray-200 mt-3 mb-1">
              {renderInline(titleText)}
            </h4>
          );
        }
        continue;
      }
    }

    // 5. Citations / Callouts (> Texte)
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      let nextIdx = i;
      while (nextIdx < lines.length && lines[nextIdx].trim().startsWith('>')) {
        quoteLines.push(lines[nextIdx].trim().replace(/^>\s?/, ''));
        nextIdx++;
      }
      i = nextIdx - 1;
      blocks.push(
        <blockquote
          key={`quote-${i}`}
          className="my-4 p-4 rounded-xl bg-purple-950/20 border-l-4 border-purple-500 text-gray-200 text-sm leading-relaxed glass shadow-sm"
        >
          {quoteLines.map((ql, qIdx) => (
            <div key={qIdx} className={qIdx > 0 ? 'mt-1' : ''}>
              {renderInline(ql)}
            </div>
          ))}
        </blockquote>
      );
      continue;
    }

    // 6. Tableau Markdown (| Col 1 | Col 2 |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.includes('|')) {
      const tableLines: string[] = [];
      let nextIdx = i;
      while (nextIdx < lines.length && lines[nextIdx].trim().startsWith('|') && lines[nextIdx].trim().endsWith('|')) {
        tableLines.push(lines[nextIdx].trim());
        nextIdx++;
      }
      i = nextIdx - 1;

      if (tableLines.length >= 2) {
        const thisTableIndex = tableCounter++;
        const headerCells = tableLines[0]
          .split('|')
          .slice(1, -1)
          .map(c => c.trim());

        const isDivider = /^(\|\s*:?-+:?\s*)+\|$/.test(tableLines[1]);
        const dataRows = isDivider ? tableLines.slice(2) : tableLines.slice(1);
        const parsedRows = dataRows.map(rowStr =>
          rowStr
            .split('|')
            .slice(1, -1)
            .map(c => c.trim())
        );

        blocks.push(
          <div key={`table-${i}`} className="my-6 rounded-xl border border-white/10 bg-black/25 shadow-lg overflow-hidden group">
            {/* Barre d'action rapide sur le tableau si éditable */}
            {editable && (
              <div className="px-4 py-2 bg-white/[0.03] border-b border-white/10 flex items-center justify-between gap-2 flex-wrap print:hidden">
                <span className="text-[11px] font-semibold text-purple-300/80 flex items-center gap-1.5 uppercase tracking-wide">
                  <Table size={13} /> Tableau #{thisTableIndex + 1}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onAddColumnToTable?.(thisTableIndex)}
                    className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1 transition-all hover:scale-105"
                    title="Ajouter une colonne vers la droite"
                  >
                    <Plus size={13} />
                    <span>+ Colonne à droite</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onAddRowToTable?.(thisTableIndex)}
                    className="px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1 transition-all hover:scale-105"
                    title="Ajouter une ligne en bas"
                  >
                    <Plus size={13} />
                    <span>+ Ligne en bas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onEditTable?.(thisTableIndex, { headers: headerCells, rows: parsedRows })}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1 transition-all"
                    title="Ouvrir l'éditeur visuel pour modifier les cellules"
                  >
                    <Edit3 size={13} />
                    <span>Modifier tout</span>
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/15 text-purple-300 font-semibold uppercase tracking-wider text-xs">
                    {headerCells.map((cell, cIdx) => (
                      <th key={cIdx} className="px-4 py-3 whitespace-nowrap">
                        {renderInline(cell)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {dataRows.map((rowStr, rIdx) => {
                    const cells = rowStr
                      .split('|')
                      .slice(1, -1)
                      .map(c => c.trim());
                    return (
                      <tr key={rIdx} className="hover:bg-white/[0.03] transition-colors">
                        {cells.map((cell, cIdx) => (
                          <td key={cIdx} className="px-4 py-3 text-gray-300">
                            {renderInline(cell)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
        continue;
      }
    }

    // 7. Checklists (- [ ] ou - [x] ou * [ ])
    if (/^[-*]\s*\[([ xX])\]/.test(trimmed)) {
      const checkItems: { checked: boolean; text: string }[] = [];
      let nextIdx = i;
      while (nextIdx < lines.length) {
        const m = lines[nextIdx].trim().match(/^[-*]\s*\[([ xX])\]\s*(.*)$/);
        if (!m) break;
        checkItems.push({
          checked: m[1].toLowerCase() === 'x',
          text: m[2],
        });
        nextIdx++;
      }
      i = nextIdx - 1;

      blocks.push(
        <div key={`checklist-${i}`} className="my-3 space-y-2">
          {checkItems.map((item, cIdx) => (
            <div key={cIdx} className="flex items-start gap-2.5 text-sm text-gray-300">
              {item.checked ? (
                <CheckSquare size={18} className="text-emerald-400 mt-0.5 flex-shrink-0" />
              ) : (
                <Square size={18} className="text-gray-500 mt-0.5 flex-shrink-0" />
              )}
              <span className={item.checked ? 'line-through text-gray-400' : ''}>
                {renderInline(item.text)}
              </span>
            </div>
          ))}
        </div>
      );
      continue;
    }

    // 8. Listes à puces simples (- ou *) NON checklists
    if (/^[-*]\s+/.test(trimmed) && !/^[-*]\s*\[([ xX])\]/.test(trimmed)) {
      const listItems: string[] = [];
      let nextIdx = i;
      while (nextIdx < lines.length) {
        const lTrim = lines[nextIdx].trim();
        if (/^[-*]\s*\[([ xX])\]/.test(lTrim)) break;
        const m = lTrim.match(/^[-*]\s+(.*)$/);
        if (!m) break;
        listItems.push(m[1]);
        nextIdx++;
      }
      i = nextIdx - 1;

      blocks.push(
        <ul key={`ul-${i}`} className="my-3 pl-5 list-disc space-y-1.5 text-sm text-gray-300">
          {listItems.map((it, lIdx) => (
            <li key={lIdx}>{renderInline(it)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // 9. Listes numérotées (1. 2.)
    if (/^\d+\.\s+/.test(trimmed)) {
      const numItems: string[] = [];
      let nextIdx = i;
      while (nextIdx < lines.length) {
        const m = lines[nextIdx].trim().match(/^\d+\.\s+(.*)$/);
        if (!m) break;
        numItems.push(m[1]);
        nextIdx++;
      }
      i = nextIdx - 1;

      blocks.push(
        <ol key={`ol-${i}`} className="my-3 pl-5 list-decimal space-y-1.5 text-sm text-gray-300">
          {numItems.map((it, lIdx) => (
            <li key={lIdx}>{renderInline(it)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // 10. Image seule sur une ligne (![alt](url))
    const singleImgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (singleImgMatch) {
      const alt = singleImgMatch[1] || "Capture d'écran";
      const src = singleImgMatch[2];
      blocks.push(
        <div key={`block-img-${i}`} className="my-6">
          <div
            onClick={() => setZoomImage(src)}
            className="group relative cursor-zoom-in rounded-2xl overflow-hidden border border-white/15 bg-black/40 shadow-xl inline-block max-w-full"
          >
            <img
              src={src}
              alt={alt}
              className="max-h-96 max-w-full rounded-2xl object-contain hover:scale-[1.01] transition-transform"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-medium text-sm pointer-events-none">
              <Maximize2 size={18} /> Cliquer pour agrandir
            </div>
          </div>
          {alt && (
            <p className="text-xs text-gray-400 mt-2 italic text-left">{alt}</p>
          )}
        </div>
      );
      continue;
    }

    // 11. Paragraphe standard
    blocks.push(
      <p key={`p-${i}`} className="my-2.5 text-gray-300 leading-relaxed text-sm sm:text-base">
        {renderInline(line)}
      </p>
    );
  }

  return (
    <div className={`prose-container ${className}`}>
      {blocks}

      {/* Lightbox / Modal de zoom d'image */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setZoomImage(null)}
        >
          <button
            onClick={() => setZoomImage(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X size={24} />
          </button>
          <img
            src={zoomImage}
            alt="Capture plein écran"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl border border-white/10"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
