'use client';

import { useEffect, useRef, useState } from 'react';
import { Gamepad2, Save, Loader2, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import Select from './Select';

type Game = 'valorant' | 'apex';

const VALORANT_RANKS = [
  'Iron', 'Bronze', 'Silver', 'Gold', 'Platinum',
  'Diamond', 'Ascendant', 'Immortal', 'Radiant',
];

const VALORANT_TIERS = ['1', '2', '3'];

const APEX_RANKS = [
  'Rookie', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond',
  'Master', 'Predator',
];

const APEX_TIERS = ['IV', 'III', 'II', 'I'];

export default function FavoriteGames() {
  const { user } = useAuth();
  const [favorite, setFavorite] = useState<Game | ''>('');
  const [valorantRank, setValorantRank] = useState('');
  const [valorantTier, setValorantTier] = useState('1');
  const [apexRank, setApexRank] = useState('Rookie');
  const [apexTier, setApexTier] = useState('IV');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      setIsLoading(true);
      const { data } = await supabase
        .from('profiles')
        .select('favorite_game, valorant_rank, apex_rank')
        .eq('id', user.id)
        .single();
      if (data) {
        setFavorite((data.favorite_game as Game) || '');
        if (data.valorant_rank) {
          const m = data.valorant_rank.match(/^(Iron|Bronze|Silver|Gold|Platinum|Diamond|Ascendant|Immortal|Radiant)(?:\s+(\d))?$/);
          if (m) {
            setValorantRank(m[1]);
            setValorantTier(m[2] || '1');
          }
        }
        if (data.apex_rank) {
          const m = data.apex_rank.match(/^(Rookie|Bronze|Silver|Gold|Platinum|Diamond|Master|Predator)(?:\s+(IV|III|II|I))?$/);
          if (m) {
            setApexRank(m[1]);
            setApexTier(m[2] || 'IV');
          }
        }
      }
      setIsLoading(false);
    };
    load();
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    setSaved(false);
    try {
      const valorantFull = valorantRank === 'Radiant'
        ? 'Radiant'
        : valorantRank
          ? `${valorantRank} ${valorantTier}`
          : null;

      const { error } = await supabase
        .from('profiles')
        .update({
          favorite_game: favorite || null,
          valorant_rank: favorite === 'valorant' ? valorantFull : null,
          apex_rank: favorite === 'apex' ? `${apexRank} ${apexTier}` : null,
        })
        .eq('id', user.id);
      if (error) throw error;
      setSaved(true);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Erreur save jeux favoris:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="reticle-box bg-[#121117] border border-white/10 p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#CA1C30]" />
      </div>
    );
  }

  const valorantRankOptions = [
    { value: '', label: '— Rang —' },
    ...VALORANT_RANKS.map((r) => ({ value: r, label: r })),
  ];
  const valorantTierOptions = VALORANT_TIERS.map((t) => ({ value: t, label: t }));
  const apexRankOptions = APEX_RANKS.map((r) => ({ value: r, label: r }));
  const apexTierOptions = APEX_TIERS.map((t) => ({ value: t, label: t }));

  return (
    <div className="reticle-box bg-[#121117] border border-white/10 p-6 sm:p-8 relative z-30">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
        <div className="w-10 h-10 bg-[#CA1C30]/15 border border-[#CA1C30]/30 flex items-center justify-center text-[#CA1C30]">
          <Gamepad2 size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold font-display uppercase tracking-wider text-white">MES DISCIPLINES // RANGS</h3>
          <p className="text-xs text-white/50 font-mono">Définis ton jeu principal et ton rang actuel pour tes sessions</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        {(['valorant', 'apex'] as Game[]).map((g) => {
          const isVal = g === 'valorant';
          const isSelected = favorite === g;
          return (
            <button
              key={g}
              type="button"
              onClick={() => setFavorite(g)}
              className={`p-4 border text-left transition-all cursor-pointer font-mono ${
                isSelected
                  ? isVal
                    ? 'border-[#CA1C30] bg-[#CA1C30]/15 text-white ring-1 ring-[#CA1C30] shadow-[0_0_15px_rgba(202, 28, 48,0.25)]'
                    : 'border-[#00B4A0] bg-[#00B4A0]/15 text-white ring-1 ring-[#00B4A0] shadow-[0_0_15px_rgba(0, 180, 160,0.25)]'
                  : 'border-white/10 bg-black/40 hover:border-white/20 text-white/70'
              }`}
            >
              <div className="text-2xl mb-1">{isVal ? '🔫' : '⚡'}</div>
              <div className="font-bold text-sm tracking-wide text-white uppercase">
                {isVal ? 'VALORANT' : 'APEX LEGENDS'}
              </div>
              <div className="text-[11px] text-white/50">
                {isVal ? 'FPS tactique 5v5' : 'Fast-paced Battle Royale'}
              </div>
            </button>
          );
        })}
      </div>

      {favorite === 'valorant' && (
        <div className="grid grid-cols-3 gap-3 mb-6 p-4 bg-black/40 border border-[#CA1C30]/30 font-mono">
          <div className="space-y-1.5 col-span-2">
            <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider">Rang Valorant</label>
            <Select
              value={valorantRank}
              onChange={setValorantRank}
              options={valorantRankOptions}
              accent="red"
            />
          </div>
          <div className="space-y-1.5 col-span-1">
            <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider">Tier</label>
            <Select
              value={valorantTier}
              onChange={setValorantTier}
              options={valorantTierOptions}
              accent="red"
              disabled={valorantRank === 'Radiant'}
            />
          </div>
        </div>
      )}

      {favorite === 'apex' && (
        <div className="grid grid-cols-3 gap-3 mb-6 p-4 bg-black/40 border border-[#00B4A0]/30 font-mono">
          <div className="space-y-1.5 col-span-2">
            <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider">Rang Apex</label>
            <Select
              value={apexRank}
              onChange={setApexRank}
              options={apexRankOptions}
              accent="cyan"
            />
          </div>
          <div className="space-y-1.5 col-span-1">
            <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider">Tier</label>
            <Select
              value={apexTier}
              onChange={setApexTier}
              options={apexTierOptions}
              accent="cyan"
            />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving || !favorite}
        className="btn-cyber-primary text-xs py-2.5 px-6 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
      >
        {isSaving ? (
          <Loader2 size={14} className="animate-spin" />
        ) : saved ? (
          <Check size={14} />
        ) : (
          <Save size={14} />
        )}
        <span>{saved ? 'RANG ENREGISTRÉ !' : 'ENREGISTRER MES RANGS'}</span>
      </button>
    </div>
  );
}