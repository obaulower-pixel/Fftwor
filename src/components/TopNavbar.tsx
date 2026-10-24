/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield, Coins, Sparkles, Volume2, VolumeX, Settings, User } from 'lucide-react';
import { PlayerStats } from '../types/game';
import { OPERATOR_ROSTER } from '../game/weapons';
import { CharacterSprite } from './CharacterSprite';

interface TopNavbarProps {
  stats: PlayerStats;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  stats,
  isMuted,
  onToggleMute,
  onOpenSettings,
  onOpenProfile,
}) => {
  const xpPercent = Math.min(100, Math.round((stats.xp / stats.xpToNextLevel) * 100));
  const currentOp = OPERATOR_ROSTER.find((o) => o.id === stats.selectedOperatorId);
  const hasSprite = Boolean(currentOp?.spriteUrl);

  return (
    <header className="w-full flex items-center justify-between px-3 md:px-6 py-2 bg-gradient-to-b from-slate-950/90 to-transparent border-b border-slate-800/60 select-none z-30">
      {/* Player Profile Cluster */}
      <button
        onClick={onOpenProfile}
        className="flex items-center gap-2.5 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700/60 rounded-xl px-2.5 py-1.5 transition-colors text-left group"
      >
        <div className="relative">
          {hasSprite ? (
            <div className="w-10 h-10 rounded-lg bg-slate-950/90 overflow-hidden flex items-center justify-center border border-emerald-400 shadow">
              <CharacterSprite animation="idle" size={40} className="scale-125" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-lg bg-emerald-700 flex items-center justify-center font-bold text-white text-base shadow border border-emerald-400">
              {stats.nickname.slice(0, 2).toUpperCase()}
            </div>
          )}
          <span className="absolute -bottom-1 -right-1 bg-amber-500 text-black text-[9px] font-black px-1 rounded-sm">
            {stats.level}
          </span>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-xs md:text-sm font-bold text-white tracking-wide uppercase group-hover:text-emerald-400 transition-colors">
              {stats.nickname}
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1 rounded">
              {stats.rankTier}
            </span>
          </div>
          {/* XP Progress Bar */}
          <div className="flex items-center gap-2 mt-0.5">
            <div className="w-20 md:w-28 bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
            <span className="text-[9px] font-mono text-slate-400">
              {stats.xp}/{stats.xpToNextLevel}
            </span>
          </div>
        </div>
      </button>

      {/* Currency & Utility Controls */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Credits */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-700/60 rounded-lg px-2.5 py-1 text-xs font-mono">
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-white font-bold">{stats.credits.toLocaleString()}</span>
        </div>

        {/* Tokens */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-700/60 rounded-lg px-2.5 py-1 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-white font-bold">{stats.tokens.toLocaleString()}</span>
        </div>

        {/* Audio Mute Toggle */}
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          className="w-8 h-8 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          title="Game Settings"
          className="w-8 h-8 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
