/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Crosshair, Users, Trophy, Target, Skull, Compass, ShieldAlert, Check, X } from 'lucide-react';
import { GameMode, BotDifficulty } from '../types/game';

interface PlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeploy: (mode: GameMode, botCount: number, botDifficulty: BotDifficulty) => void;
}

export const PlayModal: React.FC<PlayModalProps> = ({ isOpen, onClose, onDeploy }) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>('solo');
  const [selectedDifficulty, setSelectedDifficulty] = useState<BotDifficulty>('normal');
  const [botCount, setBotCount] = useState<number>(10);

  if (!isOpen) return null;

  const modes: Array<{ id: GameMode; title: string; subtitle: string; icon: React.ReactNode; badge?: string }> = [
    {
      id: 'solo',
      title: 'SOLO BATTLE ROYALE',
      subtitle: 'Solo drop. Last operator standing claims victory.',
      icon: <Crosshair className="w-5 h-5 text-emerald-400" />,
      badge: 'POPULAR',
    },
    {
      id: 'duo',
      title: 'DUO BATTLE ROYALE',
      subtitle: 'Two-operator tactical cell with simulated teammate.',
      icon: <Users className="w-5 h-5 text-blue-400" />,
    },
    {
      id: 'squad',
      title: 'SQUAD BATTLE ROYALE',
      subtitle: 'Four-operator fireteam coordinated assault.',
      icon: <Users className="w-5 h-5 text-cyan-400" />,
    },
    {
      id: 'ranked',
      title: 'RANKED COMPETITIVE',
      subtitle: 'Tiered competition with RP gain/loss and strict rules.',
      icon: <Trophy className="w-5 h-5 text-amber-400" />,
      badge: 'SEASON 1',
    },
    {
      id: 'training',
      title: 'TRAINING GROUND',
      subtitle: 'Fire range with all weapons, recoil testing & targets.',
      icon: <Target className="w-5 h-5 text-purple-400" />,
    },
    {
      id: 'bot_challenge',
      title: 'BOT CHALLENGE',
      subtitle: 'Intense combat facing tactical Nightmare-level AI.',
      icon: <Skull className="w-5 h-5 text-rose-500" />,
      badge: 'HARDCORE',
    },
  ];

  const difficulties: Array<{ id: BotDifficulty; label: string; desc: string }> = [
    { id: 'easy', label: 'EASY', desc: 'Slow reaction, relaxed aim' },
    { id: 'normal', label: 'NORMAL', desc: 'Standard tactical combat' },
    { id: 'hard', label: 'HARD', desc: 'Fast reflexes & active cover' },
    { id: 'elite', label: 'ELITE', desc: 'Aggressive flankers & sharp aim' },
    { id: 'nightmare', label: 'NIGHTMARE', desc: 'Maximum tactical coordination' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 md:p-6 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold uppercase tracking-wider text-white font-display">
              DEPLOYMENT & MODE SELECTOR
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-6">
          {/* Mode Cards Grid */}
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-3">
              SELECT OPERATION MODE
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {modes.map((mode) => {
                const isSelected = selectedMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={`relative text-left p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500'
                        : 'bg-slate-900/60 border-slate-800/90 hover:bg-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    {mode.badge && (
                      <span className="absolute top-2 right-2 text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500 text-black">
                        {mode.badge}
                      </span>
                    )}
                    <div className="flex items-center gap-2 mb-1.5">
                      {mode.icon}
                      <span className="font-bold text-sm text-white tracking-wide">{mode.title}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-snug">{mode.subtitle}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Map Preview Card */}
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-2">
              TARGET BATTLEGROUND
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-36 h-24 rounded-lg bg-emerald-950/80 border border-emerald-800/60 flex flex-col items-center justify-center text-center p-2">
                <Compass className="w-8 h-8 text-emerald-400 mb-1" />
                <span className="text-xs font-bold text-emerald-300">FRONTIER ISLAND</span>
                <span className="text-[10px] text-slate-400 font-mono">6km x 6km Design</span>
              </div>
              <div className="flex-1 text-xs text-slate-300 space-y-1">
                <div className="font-bold text-white uppercase flex items-center gap-2">
                  <span>Frontier Archipelago // Military Sector</span>
                  <span className="text-[10px] bg-emerald-900/60 text-emerald-400 border border-emerald-700 px-1.5 py-0.2 rounded font-mono">
                    DEFAULT ACTIVE
                  </span>
                </div>
                <p className="text-slate-400">
                  Features Military Base Bravo hangars, Container Port Delta, radar towers, rolling pine forests, and high-tier military bunkers.
                </p>
                <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-2 pt-1">
                  <span>Zone: 35-min Standard Pacing</span>
                  <span>•</span>
                  <span>Safe Zone Shrink at 10m</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bot Roster & AI Difficulty Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-2">
                BOT AI DIFFICULTY
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {difficulties.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDifficulty(d.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs transition-colors ${
                      selectedDifficulty === d.id
                        ? 'bg-emerald-950/60 border-emerald-500 text-white font-bold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{d.label}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{d.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-2 flex justify-between">
                <span>SIMULATED OPERATORS</span>
                <span className="text-emerald-400 font-bold">{botCount} BOTS</span>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <input
                  type="range"
                  min={5}
                  max={16}
                  value={botCount}
                  onChange={(e) => setBotCount(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>5 (Fast round)</span>
                  <span>10 (Balanced)</span>
                  <span>16 (Full sector)</span>
                </div>
                <div className="text-xs text-slate-400 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400 inline mr-1.5" />
                  Bot AI runs fully locally in real-time with pathfinding, combat decision trees, and cover usage.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Deploy CTA */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
          <div className="text-xs font-mono text-slate-400 hidden sm:block">
            READY FOR AIRDROP DROP-IN
          </div>
          <button
            data-start="true"
            onClick={() => onDeploy(selectedMode, botCount, selectedDifficulty)}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black rounded-xl text-base uppercase tracking-widest shadow-xl shadow-emerald-950/60 transition-transform active:scale-95 flex items-center justify-center gap-2 font-display"
          >
            <span>DEPLOY TO MATCH</span>
            <Check className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
