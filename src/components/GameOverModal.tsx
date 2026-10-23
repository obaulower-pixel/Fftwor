/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Trophy, Skull, Clock, ShieldCheck, Flame, Coins, Sparkles, RotateCcw, Home } from 'lucide-react';

interface GameOverModalProps {
  isVictory: boolean;
  placement: number;
  totalParticipants: number;
  kills: number;
  damageDealt: number;
  survivalSeconds: number;
  xpEarned: number;
  creditsEarned: number;
  rankPointsDelta: number;
  eliminatedBy?: string;
  onReturnToLobby: () => void;
  onPlayAgain: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isVictory,
  placement,
  totalParticipants,
  kills,
  damageDealt,
  survivalSeconds,
  xpEarned,
  creditsEarned,
  rankPointsDelta,
  eliminatedBy,
  onReturnToLobby,
  onPlayAgain,
}) => {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 md:p-6 backdrop-blur-md select-none animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-950 border-2 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-center"
        style={{ borderColor: isVictory ? '#10b981' : '#f43f5e' }}
      >
        {/* Banner Top */}
        <div className={`p-6 ${isVictory ? 'bg-gradient-to-b from-emerald-950/80 to-slate-950' : 'bg-gradient-to-b from-rose-950/80 to-slate-950'}`}>
          <div className="flex justify-center mb-3">
            {isVictory ? (
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                <Trophy className="w-10 h-10" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.4)]">
                <Skull className="w-10 h-10" />
              </div>
            )}
          </div>

          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white font-display drop-shadow">
            {isVictory ? 'VICTORY ROYALE!' : 'TACTICAL DEFEAT'}
          </h2>
          <div className="text-sm font-mono tracking-widest uppercase mt-1"
            style={{ color: isVictory ? '#34d399' : '#fb7185' }}
          >
            {isVictory ? 'LAST OPERATOR STANDING' : `ELIMINATED BY ${eliminatedBy || 'HOSTILE COMBATANT'}`}
          </div>

          <div className="mt-3 inline-block bg-slate-900 border border-slate-700 rounded-full px-4 py-1 text-xs font-mono font-bold text-white">
            PLACEMENT #{placement} / {totalParticipants}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-4 md:p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900/70 border border-slate-800 p-3 rounded-xl">
              <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center justify-center gap-1 mb-1">
                <Skull className="w-3 h-3 text-rose-400" /> KILLS
              </div>
              <div className="text-xl font-black text-white font-display">{kills}</div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 p-3 rounded-xl">
              <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center justify-center gap-1 mb-1">
                <Flame className="w-3 h-3 text-amber-400" /> DAMAGE
              </div>
              <div className="text-xl font-black text-white font-display">{damageDealt} HP</div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 p-3 rounded-xl">
              <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center justify-center gap-1 mb-1">
                <Clock className="w-3 h-3 text-cyan-400" /> SURVIVAL
              </div>
              <div className="text-xl font-black text-white font-display">{formatTime(survivalSeconds)}</div>
            </div>
          </div>

          {/* Reward Gains */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex items-center justify-around font-mono text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>+{xpEarned} XP</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Coins className="w-4 h-4" />
              <span>+{creditsEarned} CREDITS</span>
            </div>
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>{rankPointsDelta >= 0 ? `+${rankPointsDelta}` : rankPointsDelta} RP</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/60 flex items-center gap-3">
          <button
            onClick={onReturnToLobby}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Lobby</span>
          </button>

          <button
            data-start="true"
            onClick={onPlayAgain}
            className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 font-display"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Deploy Again</span>
          </button>
        </div>
      </div>
    </div>
  );
};
