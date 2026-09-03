'use client';

import { useEffect, useState } from 'react';
import { Gamepad2, Save, Loader2, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import Select from './Select';

type Game = 'valorant' | 'apex';

const VALORANT_RANKS = [
  'Iron 1', 'Iron 2', 'Iron 3',
  'Bronze 1', 'Bronze 2', 'Bronze 3',
  'Silver 1', 'Silver 2', 'Silver 3',
  'Gold 1', 'Gold 2', 'Gold 3',
  'Platinum 1', 'Platinum 2', 'Platinum 3',
  'Diamond 1', 'Diamond 2', 'Diamond 3',
  'Ascendant 1', 'Ascendant 2', 'Ascendant 3',
  'Immortal 1', 'Immortal 2', 'Immortal 3',
  'Radiant',
];

const APEX_RANKS = [
  'Rookie', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond',
  'Master', 'Predator',
];

const APEX_TIERS = ['IV', 'III', 'II', 'I'];

export default function FavoriteGames() {
  const { user } = useAuth();
  const [favorite, setFavorite] = useState<Game | ''>('');
  const [valorantRank, setValorantRank] = useState('');
  const [apexRank, setApexRank] = useState('Rookie');
  const [apexTier, setApexTier] = useState('IV');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
        setValorantRank(data.valorant_rank || '');
        if (data.apex_rank) {
          const match = data.apex_rank.match(/^(Rookie|Bronze|Silver|Gold|Platinum|Diamond|Master|Predator)(?:\s+(IV|III|II|I))?$/);
          if (match) {
            setApexRank(match[1]);
            setApexTier(match[2] || 'IV');
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
      const { error } = await supabase
        .from('profiles')
        .update({
          favorite_game: favorite || null,
          valorant_rank: valorantRank || null,
          apex_rank: favorite === 'apex' ? `${apexRank} ${apexTier}` : null,
        })
        .eq('id', user.id);
      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Erreur save jeux favoris:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="card rounded-2xl p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
      </div>
    );
  }

  const valorantOptions = [
    { value: '', label: '— Sélectionner un rang —' },
    ...VALORANT_RANKS.map((r) => ({ value: r, label: r })),
  ];
  const apexRankOptions = APEX_RANKS.map((r) => ({ value: r, label: r }));
  const apexTierOptions = APEX_TIERS.map((t) => ({ value: t, label: `Division ${t}` }));

  return (
    <div className="card rounded-2xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
          <Gamepad2 size={22} className="text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Mes jeux</h3>
          <p className="text-sm text-gray-400">Choisis ton jeu principal et ton rang</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        {(['valorant', 'apex'] as Game[]).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setFavorite(g)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              favorite === g
                ? g === 'valorant'
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-orange-500 bg-orange-500/10'
                : 'border-white/10 bg-white/5 hover:bg-white/10'
            }`}
          >
            <div className="text-2xl mb-1">{g === 'valorant' ? '🔫' : '⚡'}</div>
            <div className="font-semibold">{g === 'valorant' ? 'Valorant' : 'Apex Legends'}</div>
            <div className="text-xs text-gray-400">
              {g === 'valorant' ? 'FPS tactique 5v5' : 'Battle Royale'}
            </div>
          </button>
        ))}
      </div>

      {favorite === 'valorant' && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="space-y-2 col-span-2">
            <label className="block text-sm font-medium text-gray-300">Rang Valorant</label>
            <Select
              value={valorantRank}
              onChange={setValorantRank}
              options={valorantOptions}
              accent="red"
            />
          </div>
        </div>
      )}

      {favorite === 'apex' && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Division</label>
            <Select
              value={apexTier}
              onChange={setApexTier}
              options={apexTierOptions}
              accent="orange"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Rang</label>
            <Select
              value={apexRank}
              onChange={setApexRank}
              options={apexRankOptions}
              accent="orange"
            />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving || !favorite}
        className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-purple-500/40 transition-all disabled:opacity-50"
      >
        {isSaving ? (
          <Loader2 size={18} className="animate-spin" />
        ) : saved ? (
          <Check size={18} />
        ) : (
          <Save size={18} />
        )}
        {saved ? 'Enregistré !' : 'Enregistrer'}
      </button>
    </div>
  );
}