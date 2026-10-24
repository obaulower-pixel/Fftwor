/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, MapPin, Trees, Sun, CloudRain, Flame, Snowflake, Check, Shield } from 'lucide-react';

export interface MapDef {
  id: string;
  name: string;
  environment: string;
  description: string;
  difficulty: 'Standard' | 'Challenging' | 'Extreme';
  lootTier: 'High' | 'Very High' | 'Ultra';
  players: number;
  bgGradient: string;
  accentColor: string;
}

export const MAPS_LIST: MapDef[] = [
  {
    id: 'forest_arena',
    name: 'Forest Arena',
    environment: 'Temperate Woodland & Bunkers',
    description: 'Dense pine foliage, military research outpost Bravo, and high-tier crate drops along river canyons.',
    difficulty: 'Standard',
    lootTier: 'High',
    players: 32,
    bgGradient: 'from-emerald-950 via-teal-950 to-slate-950',
    accentColor: '#10b981',
  },
  {
    id: 'desert_ruins',
    name: 'Desert Ruins',
    environment: 'Arid Canyon & Ancient Silos',
    description: 'Long-range sniper engagements across sandstone ridges, abandoned airfields, and sun-baked supply caches.',
    difficulty: 'Challenging',
    lootTier: 'Very High',
    players: 32,
    bgGradient: 'from-amber-950 via-stone-900 to-slate-950',
    accentColor: '#f59e0b',
  },
  {
    id: 'ice_fortress',
    name: 'Ice Fortress',
    environment: 'Glacial Peak & Sub-zero Radar',
    description: 'Severe blizzards with limited thermal visibility, slippery frozen waterways, and hardened missile bunkers.',
    difficulty: 'Extreme',
    lootTier: 'Ultra',
    players: 32,
    bgGradient: 'from-cyan-950 via-slate-900 to-blue-950',
    accentColor: '#00f0ff',
  },
  {
    id: 'sky_island',
    name: 'Sky Island',
    environment: 'Floating Anti-Gravity Atoll',
    description: 'Vertical jump-pads, hovering platforms, and tight aerial zip-line combat overlooking endless clouds.',
    difficulty: 'Challenging',
    lootTier: 'Very High',
    players: 24,
    bgGradient: 'from-indigo-950 via-purple-950 to-slate-950',
    accentColor: '#818cf8',
  },
  {
    id: 'neon_city',
    name: 'Neon City',
    environment: 'Cyberpunk Rooftops & Alleys',
    description: 'Multi-level skyscraper firefights with holographic billboards, neon rain, and rapid elevator flanks.',
    difficulty: 'Extreme',
    lootTier: 'Ultra',
    players: 36,
    bgGradient: 'from-fuchsia-950 via-purple-950 to-slate-950',
    accentColor: '#e879f9',
  },
];

interface MapSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMapId: string;
  onSelectMap: (mapId: string) => void;
}

export const MapSelectModal: React.FC<MapSelectModalProps> = ({
  isOpen,
  onClose,
  selectedMapId,
  onSelectMap,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="w-full max-w-4xl bg-[#091322] border border-cyan-500/40 rounded-3xl p-5 md:p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase font-display tracking-wide">
                MAP SELECTION // FRONTIER ARENA
              </h2>
              <span className="text-xs text-cyan-400 font-mono">
                SELECT OPERATIONAL THEATER FOR NEXT DEPLOYMENT
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-5 overflow-y-auto pr-1">
          {MAPS_LIST.map((m) => {
            const isSelected = m.id === selectedMapId;
            return (
              <button
                key={m.id}
                onClick={() => onSelectMap(m.id)}
                className={`flex flex-col text-left rounded-2xl p-4 transition-all relative overflow-hidden group ${
                  isSelected
                    ? 'bg-slate-900/90 border-2 border-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.3)] scale-[1.02]'
                    : 'bg-[#0b1728]/80 hover:bg-slate-900/80 border border-slate-700/80 hover:border-slate-500'
                }`}
              >
                {/* Background Tint */}
                <div className={`absolute inset-0 bg-gradient-to-br ${m.bgGradient} opacity-30 pointer-events-none`} />

                {/* Top Badge */}
                <div className="relative z-10 flex items-center justify-between mb-3">
                  <span
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase"
                    style={{ backgroundColor: `${m.accentColor}25`, color: m.accentColor }}
                  >
                    {m.difficulty}
                  </span>
                  {isSelected && (
                    <div className="flex items-center gap-1 bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase font-mono shadow">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>SELECTED</span>
                    </div>
                  )}
                </div>

                {/* Map Name */}
                <h3 className="relative z-10 text-lg font-bold text-white font-display uppercase tracking-wide group-hover:text-cyan-400 transition-colors">
                  {m.name}
                </h3>
                <span className="relative z-10 text-[11px] text-slate-400 font-mono mb-2">
                  {m.environment}
                </span>

                <p className="relative z-10 text-xs text-slate-300 font-mono leading-relaxed flex-1 line-clamp-3">
                  {m.description}
                </p>

                {/* Specs Footer */}
                <div className="relative z-10 mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Loot: <strong className="text-white">{m.lootTier}</strong></span>
                  <span>Combatants: <strong className="text-cyan-400">{m.players}</strong></span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider font-mono shadow"
          >
            CONFIRM SELECTION
          </button>
        </div>
      </div>
    </div>
  );
};
