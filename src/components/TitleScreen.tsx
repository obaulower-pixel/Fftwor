/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, LogIn, ChevronRight, FileText, CheckCircle, Edit3, AlertCircle, Shield, X } from 'lucide-react';
import { PlayerStats } from '../types/game';
import { Lobby3D } from './Lobby3D';

interface TitleScreenProps {
  onLogin: (stats: Partial<PlayerStats>) => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onLogin }) => {
  const [callsignInput, setCallsignInput] = useState('GHOSTOPERATOR');
  const [callsignError, setCallsignError] = useState<string | null>(null);
  const [isEditingCallsign, setIsEditingCallsign] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  // Modals
  const [showTerms, setShowTerms] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const tips = [
    'TIP: High-tier loot spawns at Military Base Bravo and Container Port Delta.',
    'TIP: Safe zone starts shrinking at 10 minutes. Watch the timer and plan rotations.',
    'TIP: Helmets protect against lethal headshots; Tactical Vests absorb body impacts.',
    'TIP: Crouch or aim down sights (ADS) to tighten your weapon bullet spread.',
  ];

  const validateCallsign = (name: string): boolean => {
    const trimmed = name.trim();
    if (trimmed.length < 3) {
      setCallsignError('Callsign must be at least 3 characters.');
      return false;
    }
    if (trimmed.length > 16) {
      setCallsignError('Callsign cannot exceed 16 characters.');
      return false;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      setCallsignError('Callsign may only contain letters, numbers, hyphens, and underscores.');
      return false;
    }
    setCallsignError(null);
    return true;
  };

  const handleStartLogin = (isGuest: boolean) => {
    if (!validateCallsign(callsignInput)) {
      return;
    }

    setIsLoading(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 18) + 14;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          onLogin({
            nickname: callsignInput.trim().toUpperCase() || (isGuest ? 'GHOSTOPERATOR' : 'OPERATOR_PRIME'),
            isGuest,
            playerId: isGuest ? `LF-${Math.floor(100000 + Math.random() * 900000)}` : 'LF-G894210',
            selectedOperatorId: 'op_ghost',
          });
        }, 250);
      }
      setLoadingProgress(progress);
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 150);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden select-none bg-[#0a1322] text-slate-100">
      {/* 1. Full 3D Cinematic Background (Hangar, Giant Cyan Portal Gate, Floating Islands, Anime Operator on Right) */}
      <div className="absolute inset-0 z-0">
        <Lobby3D
          selectedOperatorId="op_ghost"
          selectedWeaponId="ar_vanguard"
          mode="login"
        />
      </div>

      {/* Atmospheric Overlays & Soft Radial Vignette for Contrast */}
      <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-r from-[#09121f]/95 via-[#09121f]/60 to-transparent md:w-[65%]" />
      <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-t from-[#060c17]/85 via-transparent to-[#060c17]/70" />

      {/* 2. Top Bar Status Header */}
      <header className="relative z-10 w-full flex items-center justify-between px-4 md:px-8 py-3 text-xs tracking-widest font-mono text-cyan-400">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
          <span className="font-bold">SECURITY PROTOCOL: ACTIVE ///</span>
        </div>
        <div className="text-slate-400 font-mono tracking-widest text-[11px] hidden sm:block">
          V2.4.0 • FRONTIER ENGINE
        </div>
      </header>

      {/* 3. Left Login Panel Area */}
      <main className="relative z-10 flex-1 flex flex-col justify-center px-4 md:px-12 lg:px-16 max-w-xl py-4">
        {/* Hexagonal Crosshair Crest Logo */}
        <div className="mb-3">
          <svg viewBox="0 0 100 100" className="w-16 h-16 md:w-20 md:h-20 drop-shadow-[0_0_25px_rgba(0,240,255,0.45)]" fill="none">
            {/* Outer Hexagon */}
            <polygon points="50,6 92,28 92,72 50,94 8,72 8,28" stroke="#00f0ff" strokeWidth="3" fill="rgba(0,240,255,0.06)" />
            {/* Inner Hexagon */}
            <polygon points="50,18 82,34 82,66 50,82 18,66 18,34" stroke="#00f0ff" strokeWidth="1.8" />
            {/* Crosshair Lines */}
            <line x1="50" y1="22" x2="50" y2="78" stroke="#f59e0b" strokeWidth="2.5" />
            <line x1="22" y1="50" x2="78" y2="50" stroke="#f59e0b" strokeWidth="2.5" />
            {/* Central Orange Scope Rings */}
            <circle cx="50" cy="50" r="14" stroke="#f59e0b" strokeWidth="2.5" fill="#091322" />
            <circle cx="50" cy="50" r="4" fill="#00f0ff" />
          </svg>
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black italic tracking-wide text-white uppercase font-display drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
          LAST FRONTIER
        </h1>
        <div className="text-sm md:text-base font-bold tracking-[0.35em] text-cyan-400 uppercase mt-0.5">
          SURVIVAL // BATTLE ROYALE
        </div>
        <p className="text-xs md:text-sm text-slate-300/90 font-mono mt-3 max-w-md leading-relaxed drop-shadow">
          Tactical military deployment over Frontier Island. 35-minute tournament zone shrink, authentic ballistics, and bot AI challenges.
        </p>

        {/* Interactive Login Card */}
        {!isLoading ? (
          <div className="mt-6 w-full max-w-md bg-[#0b1728]/85 backdrop-blur-md border border-cyan-500/40 rounded-2xl p-4 md:p-5 shadow-[0_12px_36px_rgba(0,0,0,0.6)]">
            {/* Callsign Input Field */}
            <div className="mb-4">
              <label className="block text-[11px] font-mono tracking-wider text-cyan-400 font-bold mb-1.5 uppercase">
                CALLSIGN
              </label>
              <div
                className={`flex items-center gap-2.5 bg-[#070e1a]/90 border ${
                  callsignError ? 'border-rose-500' : 'border-slate-700/80 focus-within:border-cyan-400'
                } rounded-xl px-3.5 py-2.5 transition-colors shadow-inner`}
              >
                <User className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <input
                  type="text"
                  value={callsignInput}
                  onChange={(e) => {
                    setCallsignInput(e.target.value.toUpperCase());
                    if (callsignError) validateCallsign(e.target.value);
                  }}
                  onFocus={() => setIsEditingCallsign(true)}
                  onBlur={() => setIsEditingCallsign(false)}
                  maxLength={16}
                  placeholder="GHOSTOPERATOR"
                  className="bg-transparent border-none text-white font-mono font-bold tracking-wider focus:outline-none w-full text-sm uppercase placeholder-slate-600"
                />
                <Edit3 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
              </div>
              {callsignError && (
                <div className="flex items-center gap-1.5 text-rose-400 text-[11px] font-mono mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{callsignError}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5">
              {/* GOOGLE SIGN-IN BUTTON */}
              <button
                type="button"
                onClick={() => setShowGoogleModal(true)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black rounded-xl text-sm uppercase tracking-wider shadow-[0_0_24px_rgba(16,185,129,0.35)] transition-all active:scale-[0.98] group"
              >
                <div className="flex items-center gap-2.5">
                  {/* Google Multicolor 'G' Icon */}
                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center p-0.5 shadow-sm">
                    <svg viewBox="0 0 24 24" className="w-4 h-4">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  </div>
                  <span>GOOGLE SIGN-IN</span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-950 transition-transform group-hover:translate-x-1" />
              </button>

              {/* ENTER AS GUEST BUTTON */}
              <button
                type="button"
                onClick={() => handleStartLogin(true)}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#0f1d33] hover:bg-[#142642] border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 font-bold rounded-xl text-sm uppercase tracking-wider transition-all active:scale-[0.98] group shadow"
              >
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-cyan-400" />
                  <span>ENTER AS GUEST</span>
                </div>
                <ChevronRight className="w-5 h-5 text-cyan-400 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {/* Terms Link */}
            <div className="mt-3.5 text-center">
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="text-[11px] text-slate-400 hover:text-cyan-400 transition-colors inline-flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Terms & Privacy Policy</span>
              </button>
            </div>
          </div>
        ) : (
          /* Loading Transition */
          <div className="mt-6 w-full max-w-md bg-[#0b1728]/90 border border-cyan-500/40 rounded-2xl p-5 shadow-[0_12px_36px_rgba(0,0,0,0.6)] font-mono">
            <div className="flex justify-between text-xs text-cyan-300 font-bold mb-2">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                INITIALIZING FRONTIER PROTOCOL...
              </span>
              <span>{loadingProgress}%</span>
            </div>
            <div className="w-full bg-[#070e1a] border border-slate-700/80 h-3.5 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-full rounded-full transition-all duration-150"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-300 italic mt-3 min-h-[32px] leading-snug">
              {tips[tipIndex]}
            </div>
          </div>
        )}
      </main>

      {/* 4. Bottom Controls Keybind Indicator */}
      <footer className="relative z-10 w-full flex items-center justify-center pb-4 px-4">
        <div className="bg-[#0b1728]/85 border border-slate-700/70 rounded-full px-4 md:px-6 py-1.5 text-[11px] md:text-xs text-slate-300 font-mono tracking-wider flex items-center gap-2 md:gap-3 shadow-lg">
          <span className="font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">WASD</span>
          <span>Move</span>
          <span className="text-slate-600">•</span>
          <span className="font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">Click / Tap</span>
          <span>Shoot</span>
          <span className="text-slate-600">•</span>
          <span className="font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">Space</span>
          <span>Jump</span>
          <span className="text-slate-600">•</span>
          <span className="font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">C</span>
          <span>Crouch</span>
          <span className="text-slate-600">•</span>
          <span className="font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">R</span>
          <span>Reload</span>
          <span className="text-slate-600">•</span>
          <span className="font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">M</span>
          <span>Map</span>
        </div>
      </footer>

      {/* Google Authentication Status Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0d1b2f] border border-cyan-500/50 rounded-2xl p-6 shadow-2xl relative text-left">
            <button
              onClick={() => setShowGoogleModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-display uppercase">GOOGLE AUTH STATUS</h3>
                <span className="text-xs text-amber-400 font-mono">SANDBOX CONFIGURATION ACTIVE</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 font-mono leading-relaxed mb-4">
              Firebase Authentication credentials are not currently configured in this deployment environment.
              To preserve security and transparency, this build avoids mock logins.
            </p>

            <div className="p-3 bg-[#070e1a] border border-slate-700 rounded-xl mb-5 text-xs text-slate-400 font-mono space-y-1">
              <div>• Callsign: <span className="text-cyan-400 font-bold">{callsignInput}</span></div>
              <div>• Session type: <span className="text-emerald-400 font-bold">Local Guest Session</span></div>
              <div>• Weapon & Map unlocks: <span className="text-white">Full Access</span></div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowGoogleModal(false);
                  handleStartLogin(true);
                }}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider font-mono shadow"
              >
                ENTER DIRECTLY AS GUEST ({callsignInput})
              </button>
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms & Privacy Policy Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#0d1b2f] border border-slate-700 rounded-2xl p-6 shadow-2xl relative text-left max-h-[85vh] flex flex-col">
            <button
              onClick={() => setShowTerms(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white font-display uppercase mb-1">
              TERMS & PRIVACY POLICY
            </h3>
            <span className="text-xs text-cyan-400 font-mono mb-4">FRONTIER TOURNAMENT DIRECTIVE 2026</span>

            <div className="overflow-y-auto pr-2 text-xs text-slate-300 font-mono space-y-3 leading-relaxed">
              <p>
                <strong>1. FAIR PLAY DIRECTIVE:</strong> Last Frontier employs client-side telemetry and server-verified ballistics calculations. Third-party automation or memory manipulation tools result in immediate match disqualification.
              </p>
              <p>
                <strong>2. DATA PRIVACY:</strong> Your selected Callsign, stats, inventory, and weapon customizations are stored locally in your browser storage. No unauthorized external telemetry or cookies are captured.
              </p>
              <p>
                <strong>3. SIMULATED TOURNAMENT:</strong> Frontier Island challenges utilize advanced neural AI bot operators. Match rewards, ranks, and supply items earned within the session persist across runs.
              </p>
            </div>

            <button
              onClick={() => setShowTerms(false)}
              className="mt-6 w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider font-mono"
            >
              I Understand & Agree
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
