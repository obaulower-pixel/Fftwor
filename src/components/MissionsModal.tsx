/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Target, CheckCircle2, Coins, Sparkles, X } from 'lucide-react';
import { Mission } from '../types/game';

interface MissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  missions: Mission[];
  onClaim: (missionId: string) => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  isOpen,
  onClose,
  missions,
  onClaim,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 md:p-6 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold uppercase tracking-wider text-white font-display">
              TACTICAL OPERATIONS & DAILY MISSIONS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Missions List */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-3">
          {missions.map((m) => {
            const percent = Math.min(100, Math.round((m.current / m.target) * 100));

            return (
              <div
                key={m.id}
                className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{m.title}</span>
                    {m.completed && (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800">
                        READY
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-snug">{m.description}</p>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>PROGRESS: {m.current} / {m.target}</span>
                    <span>{percent}%</span>
                  </div>
                </div>

                {/* Rewards & Claim Button */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5" /> +{m.rewardCredits}
                    </span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> +{m.rewardXP} XP
                    </span>
                  </div>

                  {m.claimed ? (
                    <button disabled className="px-4 py-1.5 bg-slate-800 text-slate-400 text-xs font-bold rounded-lg uppercase flex items-center gap-1 border border-slate-700 cursor-default">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Claimed
                    </button>
                  ) : m.completed ? (
                    <button
                      onClick={() => onClaim(m.id)}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg uppercase tracking-wider shadow-lg transition-transform active:scale-95"
                    >
                      Claim Reward
                    </button>
                  ) : (
                    <button disabled className="px-4 py-1.5 bg-slate-850 text-slate-400 text-xs font-mono rounded-lg border border-slate-800 cursor-not-allowed">
                      In Progress
                    </button>
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
