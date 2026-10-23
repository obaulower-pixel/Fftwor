/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX, X } from 'lucide-react';

interface PauseModalProps {
  isOpen: boolean;
  isMuted: boolean;
  aliveCount: number;
  killCount: number;
  damageDealt: number;
  onResume: () => void;
  onToggleMute: () => void;
  onRestart: () => void;
  onReturnToLobby: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  isMuted,
  aliveCount,
  killCount,
  damageDealt,
  onResume,
  onToggleMute,
  onRestart,
  onReturnToLobby,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-sm bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-center p-6">
        <h2 className="text-2xl font-black uppercase text-white font-display tracking-wider mb-1">
          TACTICAL PAUSE
        </h2>
        <div className="text-xs font-mono text-slate-400 mb-4">SIMULATION SUSPENDED</div>

        {/* Live Match Stats Snapshot */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 mb-6 grid grid-cols-3 gap-2 text-xs font-mono">
          <div>
            <div className="text-slate-400 text-[10px]">ALIVE</div>
            <div className="text-emerald-400 font-bold text-base">{aliveCount}</div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px]">KILLS</div>
            <div className="text-rose-400 font-bold text-base">{killCount}</div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px]">DAMAGE</div>
            <div className="text-cyan-400 font-bold text-base">{damageDealt}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={onResume}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl uppercase tracking-wider text-xs shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Resume Engagement</span>
          </button>

          <button
            onClick={onToggleMute}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold rounded-xl uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-2"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{isMuted ? 'Audio Muted' : 'Audio Enabled'}</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold rounded-xl uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart Sector</span>
          </button>

          <button
            onClick={onReturnToLobby}
            className="w-full py-2.5 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800 text-rose-300 font-bold rounded-xl uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Abandon to Lobby</span>
          </button>
        </div>
      </div>
    </div>
  );
};
