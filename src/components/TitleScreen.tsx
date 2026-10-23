/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, User, LogIn, ChevronRight, FileText, CheckCircle } from 'lucide-react';
import { PlayerStats } from '../types/game';

interface TitleScreenProps {
  onLogin: (stats: Partial<PlayerStats>) => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onLogin }) => {
  const [showTerms, setShowTerms] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('GhostOperator');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  const tips = [
    'TIP: High-tier loot spawns at Military Base Bravo and Container Port Delta.',
    'TIP: Safe zone starts shrinking at 10 minutes. Watch the timer and plan rotations.',
    'TIP: Helmets protect against lethal headshots; Tactical Vests absorb body impacts.',
    'TIP: Crouch or aim down sights (ADS) to tighten your weapon bullet spread.',
  ];

  const handleStartLoading = (isGuest: boolean) => {
    setIsLoading(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 18) + 12;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          onLogin({
            nickname: nicknameInput.trim() || (isGuest ? 'TacticalGhost' : 'OperatorPrime'),
            isGuest,
            playerId: isGuest ? `LF-${Math.floor(100000 + Math.random() * 900000)}` : 'LF-G894210',
          });
        }, 300);
      }
      setLoadingProgress(progress);
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 180);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between bg-black text-slate-100 overflow-hidden p-6 select-none">
      {/* Background Military Grid Pattern & Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-neutral-950 to-black opacity-90" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      {/* Header Tag */}
      <div className="relative z-10 w-full flex items-center justify-between text-xs tracking-widest text-emerald-500 font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>SECURITY PROTOCOL: ACTIVE</span>
        </div>
        <div>V2.4.0 · FRONTIER ENGINE</div>
      </div>

      {/* Center Hero Title */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto max-w-xl">
        {/* Custom SVG Military Crest */}
        <div className="mb-4 text-emerald-500 drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]">
          <svg viewBox="0 0 100 100" className="w-24 h-24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" stroke="currentColor" fill="rgba(16,185,129,0.08)" />
            <polygon points="50,15 80,32 80,68 50,85 20,68 20,32" stroke="currentColor" strokeWidth="1.5" />
            <path d="M50 22 L50 78 M22 50 L78 50" stroke="#f97316" strokeWidth="2" />
            <circle cx="50" cy="50" r="14" stroke="#f97316" strokeWidth="2" fill="#0b0f14" />
            <circle cx="50" cy="50" r="4" fill="#10b981" />
          </svg>
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase italic drop-shadow-lg font-display">
          LAST FRONTIER
        </h1>
        <div className="text-lg md:text-xl font-bold tracking-[0.35em] text-emerald-400 mt-1 uppercase">
          SURVIVAL // BATTLE ROYALE
        </div>
        <p className="text-xs md:text-sm text-slate-400 mt-3 max-w-md font-mono">
          Tactical military deployment over Frontier Island. 35-minute tournament zone shrink, authentic ballistics, and bot AI challenges.
        </p>

        {/* Input / Login Actions */}
        {!isLoading ? (
          <div className="w-full mt-8 flex flex-col gap-3">
            <div className="flex items-center bg-slate-900/90 border border-slate-700/80 rounded-lg px-3 py-2 text-left shadow-inner">
              <span className="text-xs font-mono text-slate-400 mr-2">CALLSIGN:</span>
              <input
                type="text"
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
                maxLength={14}
                className="bg-transparent border-none text-white font-bold tracking-wider focus:outline-none w-full text-sm uppercase"
                placeholder="OPERATOR NAME"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
              {/* Google Sign In Button */}
              <button
                data-start="true"
                onClick={() => handleStartLoading(false)}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-emerald-950/50 transition-transform active:scale-95 text-sm uppercase tracking-wider"
              >
                <LogIn className="w-4 h-4" />
                <span>Google Sign-In</span>
              </button>

              {/* Guest Login Button */}
              <button
                data-start="true"
                onClick={() => handleStartLoading(true)}
                className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold py-3 px-4 rounded-lg shadow transition-transform active:scale-95 text-sm uppercase tracking-wider"
              >
                <User className="w-4 h-4 text-emerald-400" />
                <span>Enter as Guest</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-4 mt-2 text-xs text-slate-400">
              <button
                onClick={() => setShowTerms(true)}
                className="hover:text-emerald-400 transition-colors flex items-center gap-1 underline underline-offset-4"
              >
                <FileText className="w-3.5 h-3.5" />
                Terms & Privacy Policy
              </button>
            </div>
          </div>
        ) : (
          /* Loading Bar View */
          <div className="w-full mt-8 flex flex-col gap-3 font-mono">
            <div className="flex justify-between text-xs text-emerald-400 font-bold">
              <span>INITIALIZING SYSTEM & ASSETS...</span>
              <span>{loadingProgress}%</span>
            </div>
            <div className="w-full bg-slate-900 border border-slate-700 h-3 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-200"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <div className="text-xs text-slate-400 italic mt-2 min-h-8">
              {tips[tipIndex]}
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls / Hint */}
      <div className="relative z-10 text-center text-[11px] text-slate-400 font-mono tracking-wider">
        <span>WASD Move · Click / Tap Shoot · Space Jump · C Crouch · R Reload · M Map</span>
      </div>

      {/* Terms of Service & Privacy Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 text-slate-200 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-3 font-display flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              TERMS OF SERVICE & PRIVACY POLICY
            </h2>
            <div className="text-xs text-slate-300 space-y-3 max-h-60 overflow-y-auto pr-2 font-sans leading-relaxed">
              <p>
                Welcome to <strong>LAST FRONTIER: SURVIVAL</strong>. By entering, you agree to fair-play rules, standard game telemetry, and user safety guidelines.
              </p>
              <p>
                <strong>Guest Accounts:</strong> Guest data is stored securely in your browser's local session. To safeguard your career statistics and unlocked items, link a permanent Google account.
              </p>
              <p>
                <strong>Fair Play:</strong> Exploits, third-party tampering, and toxic behavior are strictly prohibited to maintain competitive integrity across all matchmaking tiers.
              </p>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowTerms(false)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2.5 rounded-lg uppercase tracking-wider"
              >
                Understood & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
