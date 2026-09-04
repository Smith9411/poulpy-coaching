'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Check, Table, Sparkles } from 'lucide-react';

export interface TableData {
  headers: string[];
  rows: string[][];
}

interface VisualTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTable: (markdownTable: string) => void;
  initialData?: TableData | null;
  mode?: 'insert' | 'edit';
}

const PRESETS: Record<string, { label: string; icon: string; data: TableData }> = {
  objectifs: {
    label: "Objectifs & Jalons",
    icon: "📊",
    data: {
      headers: ["Objectif Spécifique", "Cible Mesurable", "Échéance", "Statut"],
      rows: [
        ["Stabiliser le Crosshair", "65% Headshot en Deathmatch", "Semaine 2", "En cours 🔄"],
        ["Tracking réactif Pasu", "Score KovaaK's > 80", "Semaine 3", "À faire ⏳"],
        ["VOD Review 3 matchs", "Identifier erreurs de rotation", "Semaine 4", "Validé ✅"],
      ],
    },
  },
  aim: {
    label: "Routine d'Aim",
    icon: "🎯",
    data: {
      headers: ["Scénario / Exercice", "Support", "Durée", "Score Actuel", "Objectif"],
      rows: [
        ["1wall6targets TE", "KovaaK's", "10 min", "140", "165+"],
        ["Pasu Voltaic Easy", "KovaaK's", "10 min", "75", "90+"],
        ["Smoothbot Voltaic", "KovaaK's", "10 min", "2600", "3200+"],
        ["Range Hard Bots", "Valorant", "5 min", "20/30", "25+/30"],
      ],
    },
  },
  seances: {
    label: "Suivi des Séances",
    icon: "📅",
    data: {
      headers: ["Séance", "Date", "Thème / Sujet", "Points Forts", "Axes de Travail"],
      rows: [
        ["Session #1", "04/09", "Diagnostic & Posture", "Bonne réactivité", "Micro-flicks trop amples"],
        ["Session #2", "11/09", "Prise d'information", "Peeks dynamiques", "Gestion du bruit & coms"],
      ],
    },
  },
  vide: {
    label: "Tableau Simple (3x3)",
    icon: "➕",
    data: {
      headers: ["Colonne 1", "Colonne 2", "Colonne 3"],
      rows: [
        ["Donnée 1", "Donnée 2", "Donnée 3"],
        ["Donnée 4", "Donnée 5", "Donnée 6"],
        ["Donnée 7", "Donnée 8", "Donnée 9"],
      ],
    },
  },
};

export default function VisualTableModal({
  isOpen,
  onClose,
  onSaveTable,
  initialData,
  mode = 'insert',
}: VisualTableModalProps) {
  const [headers, setHeaders] = useState<string[]>(['Colonne 1', 'Colonne 2', 'Colonne 3']);
  const [rows, setRows] = useState<string[][]>([
    ['', '', ''],
    ['', '', ''],
  ]);

  useEffect(() => {
    if (initialData && initialData.headers?.length > 0) {
      setHeaders(initialData.headers);
      setRows(initialData.rows?.length > 0 ? initialData.rows : [Array(initialData.headers.length).fill('')]);
    } else {
      setHeaders(['Objectif', 'Cible', 'Échéance', 'Statut']);
      setRows([
        ['Crosshair placement', '65% Headshot', 'Semaine 2', 'En cours 🔄'],
        ['Tracking Pasu', 'Score > 80', 'Semaine 3', 'À faire ⏳'],
      ]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Ajouter une colonne vers la droite
  const handleAddColumn = () => {
    const newColNum = headers.length + 1;
    setHeaders(prev => [...prev, `Colonne ${newColNum}`]);
    setRows(prev => prev.map(row => [...row, '']));
  };

  // Supprimer une colonne
  const handleRemoveColumn = (colIdx: number) => {
    if (headers.length <= 1) return;
    setHeaders(prev => prev.filter((_, idx) => idx !== colIdx));
    setRows(prev => prev.map(row => row.filter((_, idx) => idx !== colIdx)));
  };

  // Ajouter une ligne en bas
  const handleAddRow = () => {
    setRows(prev => [...prev, Array(headers.length).fill('')]);
  };

  // Supprimer une ligne
  const handleRemoveRow = (rowIdx: number) => {
    if (rows.length <= 1) return;
    setRows(prev => prev.filter((_, idx) => idx !== rowIdx));
  };

  // Modifier un en-tête
  const handleHeaderChange = (idx: number, val: string) => {
    setHeaders(prev => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  // Modifier une cellule
  const handleCellChange = (rowIdx: number, colIdx: number, val: string) => {
    setRows(prev => {
      const next = prev.map((r, rI) => {
        if (rI !== rowIdx) return r;
        const newR = [...r];
        newR[colIdx] = val;
        return newR;
      });
      return next;
    });
  };

  // Appliquer un preset
  const handleApplyPreset = (presetKey: string) => {
    const preset = PRESETS[presetKey];
    if (!preset) return;
    setHeaders(preset.data.headers);
    setRows(preset.data.rows);
  };

  // Valider et convertir en Markdown
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHeaders = headers.map(h => h.trim() || 'Colonne');
    const cleanRows = rows.map(row =>
      cleanHeaders.map((_, colIdx) => (row[colIdx] !== undefined && row[colIdx].trim() ? row[colIdx].trim() : '-'))
    );

    const headerLine = '| ' + cleanHeaders.join(' | ') + ' |';
    const dividerLine = '| ' + cleanHeaders.map(() => ':---').join(' | ') + ' |';
    const dataLines = cleanRows.map(r => '| ' + r.join(' | ') + ' |');

    const markdown = '\n' + [headerLine, dividerLine, ...dataLines].join('\n') + '\n';
    onSaveTable(markdown);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div
        className="bg-[#110F1A] border border-purple-500/30 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
              <Table size={18} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                {mode === 'edit' ? 'Modifier le Tableau' : 'Éditeur de Tableau Visuel'}
              </h3>
              <p className="text-xs text-gray-400">
                Ajoute des colonnes ou des lignes d&apos;un simple clic, sans coder de markdown
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Presets rapides (uniquement en mode création) */}
        {mode === 'insert' && (
          <div className="px-6 py-3 bg-white/[0.02] border-b border-white/5 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-purple-300 font-semibold flex items-center gap-1 mr-2">
              <Sparkles size={13} /> Modèles :
            </span>
            {Object.entries(PRESETS).map(([key, preset]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleApplyPreset(key)}
                className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium border border-white/10 hover:border-purple-500/40 transition-colors flex items-center gap-1.5"
              >
                <span>{preset.icon}</span>
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Grille du Tableau */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="overflow-x-auto pb-4 max-h-[60vh]">
            <table className="w-full border-collapse">
              {/* En-têtes avec bouton + colonne */}
              <thead>
                <tr>
                  <th className="w-10 text-xs text-gray-500 font-mono text-center pb-2">#</th>
                  {headers.map((head, colIdx) => (
                    <th key={colIdx} className="min-w-[170px] p-1.5 pb-2 text-left">
                      <div className="relative flex items-center gap-1">
                        <input
                          type="text"
                          value={head}
                          onChange={e => handleHeaderChange(colIdx, e.target.value)}
                          placeholder={`Colonne ${colIdx + 1}`}
                          className="w-full px-3 py-2 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-200 text-xs font-bold focus:outline-none focus:border-cyan-400"
                        />
                        {headers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveColumn(colIdx)}
                            className="p-1 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Supprimer cette colonne"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </th>
                  ))}

                  {/* Bouton pour ajouter une colonne vers la droite */}
                  <th className="p-1.5 pb-2 align-middle">
                    <button
                      type="button"
                      onClick={handleAddColumn}
                      className="px-3 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1 whitespace-nowrap shadow-sm hover:scale-105 transition-all"
                      title="Ajouter une colonne vers la droite"
                    >
                      <Plus size={14} />
                      <span>Ajouter une colonne</span>
                    </button>
                  </th>
                </tr>
              </thead>

              {/* Lignes de données */}
              <tbody className="divide-y divide-white/5">
                {rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="text-xs text-gray-500 font-mono text-center pr-2 py-2">
                      {rowIdx + 1}
                    </td>
                    {headers.map((_, colIdx) => (
                      <td key={colIdx} className="p-1.5 py-2">
                        <input
                          type="text"
                          value={row[colIdx] || ''}
                          onChange={e => handleCellChange(rowIdx, colIdx, e.target.value)}
                          placeholder="—"
                          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-200 text-xs focus:outline-none focus:border-purple-500 transition-colors"
                        />
                      </td>
                    ))}

                    {/* Action supprimer ligne */}
                    <td className="p-1.5 py-2 text-center">
                      {rows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(rowIdx)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Supprimer cette ligne"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bouton pour ajouter une ligne en bas */}
          <div className="mt-3 flex items-center justify-between gap-4 flex-wrap pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={handleAddRow}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-semibold shadow-sm transition-all hover:scale-102"
            >
              <Plus size={15} />
              <span>Ajouter une ligne en bas</span>
            </button>

            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-xs font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-purple-500/30 transition-all hover:scale-105"
              >
                <Check size={16} />
                <span>{mode === 'edit' ? 'Mettre à jour le tableau' : 'Insérer dans la fiche'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
