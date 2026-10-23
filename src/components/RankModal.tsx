/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Trophy, Award, ShieldCheck, ChevronRight, X } from 'lucide-react';
import { PlayerStats } from '../types/game';

interface RankModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
}

const TIERS = [
  { name: 'Bronze', minRP: 0, maxRP: 1000, reward: '500 Credits' },
  { name: 'Silver', minRP: 1000, maxRP: 2000, reward: '1,500 Credits + Silver Avatar' },
  { name: 'Gold', minRP: 2000, maxRP: 3200, reward: '3,000 Credits + Rare Weapon Camo' },
  { name: 'Platinum', minRP: 3200, maxRP: 4500, reward: '5,000 Credits + Spec-Ops Outfit' },
  { name: 'Diamond', minRP: 4500, maxRP: 6000, reward: '8,000 Credits + Diamond Parachute' },
  { name: 'Ace', minRP: 6000, maxRP: 8000, reward: '12,000 Credits + Ace Title' },
  { name: 'Conqueror', minRP: 8000, maxRP: 99999, reward: 'Exclusive Conqueror Emblem + Golden Aura' },
];

export const RankModal: React.FC<RankModalProps> = ({ isOpen, onClose, stats }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 md:p-6 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold uppercase tracking-wider text-white font-display">
              SEASON 1 RANKED TIER LADDER
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Standing Card */}
        <div className="p-4 md:p-6 bg-gradient-to-r from-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-mono text-slate-400 uppercase">CURRENT TIER:</div>
              <div className="text-2xl font-black text-white font-display tracking-wide uppercase">
                {stats.rankTier} TIER
              </div>
            </div>
          </div>

          <div className="text-right font-mono">
            <div className="text-xs text-slate-400 uppercase">RATING POINTS (RP):</div>
            <div className="text-xl font-bold text-emerald-400">{stats.rankPoints.toLocaleString()} RP</div>
          </div>
        </div>

        {/* Tiers Ladder */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-2">
          {TIERS.map((tier) => {
            const isCurrent = stats.rankTier === tier.name;

            return (
              <div
                key={tier.name}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                  isCurrent
                    ? 'bg-amber-950/30 border-amber-500 ring-1 ring-amber-500'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${isCurrent ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`} />
                  <div>
                    <div className="font-bold text-sm text-white uppercase">{tier.name}</div>
                    <div className="text-[11px] font-mono text-slate-400">
                      Requirement: {tier.minRP.toLocaleString()} RP
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-mono text-emerald-400">{tier.reward}</div>
                  {isCurrent && (
                    <span className="text-[10px] font-mono uppercase bg-amber-500 text-black px-1.5 py-0.2 rounded font-bold">
                      ACTIVE TIER
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
