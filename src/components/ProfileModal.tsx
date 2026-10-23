/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Award, Skull, Crosshair, Trophy, Edit3, Check, X } from 'lucide-react';
import { PlayerStats } from '../types/game';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  onUpdateNickname: (name: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  stats,
  onUpdateNickname,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(stats.nickname);

  if (!isOpen) return null;

  const kdRatio = (stats.totalKills / Math.max(1, stats.matchesPlayed - stats.victories)).toFixed(2);
  const winRate = ((stats.victories / Math.max(1, stats.matchesPlayed)) * 100).toFixed(1);

  const handleSave = () => {
    if (nameInput.trim()) {
      onUpdateNickname(nameInput.trim().toUpperCase());
      setIsEditing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 md:p-6 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold uppercase tracking-wider text-white font-display">
              OPERATOR DOSSIER & CAREER RECORDS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Identity Hero Banner */}
        <div className="p-4 md:p-6 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 border border-emerald-400 flex items-center justify-center text-white text-xl font-black shadow-lg">
              {stats.nickname.slice(0, 2).toUpperCase()}
            </div>
            <div>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    maxLength={14}
                    className="bg-slate-900 border border-emerald-500 rounded px-2 py-1 text-sm font-bold text-white uppercase focus:outline-none"
                  />
                  <button
                    onClick={handleSave}
                    className="p-1.5 bg-emerald-600 hover:bg-emerald-500 rounded text-white"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-white uppercase font-display">{stats.nickname}</h3>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-slate-400 hover:text-emerald-400 transition-colors"
                    title="Edit Callsign"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <div className="text-xs font-mono text-slate-400">
                ID: {stats.playerId} · {stats.isGuest ? 'GUEST RECORD' : 'VERIFIED OPERATOR'}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-mono text-slate-400 uppercase">TIER BADGE:</div>
            <div className="text-sm font-black text-amber-400 uppercase font-display">{stats.rankTier}</div>
            <div className="text-[11px] font-mono text-emerald-400">{stats.rankPoints} RP</div>
          </div>
        </div>

        {/* Career Statistics Tiles */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-4">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-1">
            COMBAT EFFICIENCY RECORD
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl">
              <div className="text-slate-400 text-xs font-mono flex items-center gap-1.5 mb-1">
                <Trophy className="w-3.5 h-3.5 text-amber-400" /> VICTORIES
              </div>
              <div className="text-2xl font-black text-white font-display">{stats.victories}</div>
              <div className="text-[10px] font-mono text-slate-500">Out of {stats.matchesPlayed} matches</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl">
              <div className="text-slate-400 text-xs font-mono flex items-center gap-1.5 mb-1">
                <Skull className="w-3.5 h-3.5 text-rose-400" /> ELIMINATIONS
              </div>
              <div className="text-2xl font-black text-white font-display">{stats.totalKills}</div>
              <div className="text-[10px] font-mono text-slate-500">Confirmed kills</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl">
              <div className="text-slate-400 text-xs font-mono flex items-center gap-1.5 mb-1">
                <Crosshair className="w-3.5 h-3.5 text-cyan-400" /> K/D RATIO
              </div>
              <div className="text-2xl font-black text-white font-display">{kdRatio}</div>
              <div className="text-[10px] font-mono text-slate-500">Kills per defeat</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl">
              <div className="text-slate-400 text-xs font-mono flex items-center gap-1.5 mb-1">
                <Award className="w-3.5 h-3.5 text-emerald-400" /> WIN RATE
              </div>
              <div className="text-2xl font-black text-white font-display">{winRate}%</div>
              <div className="text-[10px] font-mono text-slate-500">Match win percent</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl col-span-2">
              <div className="text-slate-400 text-xs font-mono flex items-center gap-1.5 mb-1">
                <Award className="w-3.5 h-3.5 text-amber-400" /> TOTAL DAMAGE INFLICTED
              </div>
              <div className="text-2xl font-black text-white font-display">{stats.totalDamage.toLocaleString()} HP</div>
              <div className="text-[10px] font-mono text-slate-500">Combined bullet and tactical impact damage</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
