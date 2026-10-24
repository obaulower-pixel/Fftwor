/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { WeaponDef, LootItem, SafeZoneState } from '../types/game';

interface GameHUDProps {
  health: number;
  maxHealth: number;
  armor: number;
  maxArmor: number;
  armorLevel?: number;
  helmetLevel: number;
  backpackLevel: number;
  activeWeapon: WeaponDef | null;
  secondaryWeapon: WeaponDef | null;
  ammoInMag: number;
  reserveAmmo: number;
  aliveCount: number;
  killCount: number;
  safeZone: SafeZoneState;
  nearbyLoot: LootItem[];
  isAiming: boolean;
  isReloading: boolean;
  isCrouching: boolean;
  matchTime: number;
  crosshairHit: boolean;
  isHeadshotHit: boolean;
  compassHeading: number;

  // Actions
  onShootStart: () => void;
  onShootEnd: () => void;
  onToggleAim: () => void;
  onReload: () => void;
  onToggleCrouch: () => void;
  onJump: () => void;
  onSwitchWeapon: (idx: number) => void;
  onPickupLoot: (item: LootItem) => void;
  onOpenInventory: () => void;
  onOpenMap: () => void;
  onPause: () => void;

  // Joystick & Look callbacks
  onJoystickMove: (x: number, y: number) => void;
  onLookDelta: (dx: number, dy: number) => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  health,
  maxHealth,
  armor,
  maxArmor,
  armorLevel = 1,
  helmetLevel,
  backpackLevel,
  activeWeapon,
  secondaryWeapon,
  ammoInMag,
  reserveAmmo,
  aliveCount,
  killCount,
  safeZone,
  nearbyLoot,
  isAiming,
  isReloading,
  isCrouching,
  crosshairHit,
  isHeadshotHit,
  compassHeading,
  onShootStart,
  onShootEnd,
  onToggleAim,
  onReload,
  onToggleCrouch,
  onJump,
  onSwitchWeapon,
  onPickupLoot,
  onOpenInventory,
  onOpenMap,
  onPause,
  onJoystickMove,
  onLookDelta,
}) => {
  // Virtual Joystick State
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [joystickKnobPos, setJoystickKnobPos] = useState({ x: 0, y: 0 });
  const [isJoystickActive, setIsJoystickActive] = useState(false);
  const joystickTouchIdRef = useRef<number | null>(null);

  // Right-side Look Touch Surface
  const lookTouchIdRef = useRef<number | null>(null);
  const lastLookPosRef = useRef({ x: 0, y: 0 });

  // Joystick touch handlers
  const handleJoystickTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    joystickTouchIdRef.current = touch.identifier;
    setIsJoystickActive(true);
    updateJoystickPos(touch.clientX, touch.clientY);
  };

  const handleJoystickTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchIdRef.current) {
        updateJoystickPos(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleJoystickTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchIdRef.current) {
        joystickTouchIdRef.current = null;
        setIsJoystickActive(false);
        setJoystickKnobPos({ x: 0, y: 0 });
        onJoystickMove(0, 0);
        break;
      }
    }
  };

  const updateJoystickPos = (clientX: number, clientY: number) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const distance = Math.hypot(dx, dy);
    const maxRadius = 42;

    let normalizedX = dx / maxRadius;
    let normalizedY = dy / maxRadius;

    if (distance > maxRadius) {
      normalizedX = dx / distance;
      normalizedY = dy / distance;
    }

    setJoystickKnobPos({ x: normalizedX * maxRadius, y: normalizedY * maxRadius });
    onJoystickMove(normalizedX, normalizedY);
  };

  // Right-side Look Pan Touch Area handlers
  const handleLookTouchStart = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    lookTouchIdRef.current = touch.identifier;
    lastLookPosRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleLookTouchMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === lookTouchIdRef.current) {
        const dx = touch.clientX - lastLookPosRef.current.x;
        const dy = touch.clientY - lastLookPosRef.current.y;
        lastLookPosRef.current = { x: touch.clientX, y: touch.clientY };
        onLookDelta(dx, dy);
        break;
      }
    }
  };

  const handleLookTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === lookTouchIdRef.current) {
        lookTouchIdRef.current = null;
        break;
      }
    }
  };

  // Safe Zone Countdown format
  const remainingPhaseTime = Math.max(0, Math.floor(safeZone.nextShrinkTime - safeZone.timeInCurrentPhase));
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Chamfered / Beveled clip path for sci-fi panels
  const beveledClip = {
    clipPath: 'polygon(10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px), 0 10px)',
  };

  const beveledClipSmall = {
    clipPath: 'polygon(6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px), 0 6px)',
  };

  const octagonalClip = {
    clipPath: 'polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)',
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 flex flex-col justify-between p-2 md:p-4 overflow-hidden font-sans">
      {/* ---------------- 1. TOP HEADER CLUSTER ---------------- */}
      <div className="w-full flex items-start justify-between">
        {/* Left: ALIVE & KILLS Pill + Pause Button (Matches Reference) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Main Alive & Kills Beveled Pill */}
          <div
            style={beveledClip}
            className="bg-[#071326]/90 border-2 border-[#00d2ff] px-3.5 py-1.5 flex items-center gap-3 shadow-[0_0_15px_rgba(0,210,255,0.35)] backdrop-blur-md"
          >
            {/* ALIVE Indicator */}
            <div className="flex items-center gap-1.5 text-[#00f0ff] font-black font-mono text-xs md:text-sm tracking-wider">
              {/* 3 People Icon */}
              <svg className="w-4 h-4 md:w-5 md:h-5 fill-current" viewBox="0 0 24 24">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
              <span>ALIVE</span>
              <span className="text-white font-mono text-sm md:text-base ml-0.5">{aliveCount}</span>
            </div>

            {/* Vertical Cyan Divider Notch */}
            <div className="w-0.5 h-4 bg-[#00d2ff]/60" />

            {/* KILLS Indicator */}
            <div className="flex items-center gap-1.5 text-[#ff3366] font-black font-mono text-xs md:text-sm tracking-wider">
              {/* Skull Icon */}
              <svg className="w-4 h-4 md:w-4.5 md:h-4.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C7.58 2 4 5.58 4 10c0 2.76 1.4 5.19 3.53 6.63.3.2.47.53.47.89V20c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.48c0-.36.17-.69.47-.89C18.6 15.19 20 12.76 20 10c0-4.42-3.58-8-8-8zm-3 10c-.83 0-1.5-.67-1.5-1.5S8.17 9 9 9s1.5.67 1.5 1.5S9.83 12 9 12zm6 0c-.83 0-1.5-.67-1.5-1.5S14.17 9 15 9s1.5.67 1.5 1.5S15.83 12 15 12z" />
              </svg>
              <span>KILLS</span>
              <span className="text-white font-mono text-sm md:text-base ml-0.5">{killCount}</span>
            </div>
          </div>

          {/* Pause Button [ || ] */}
          <button
            onClick={onPause}
            style={beveledClipSmall}
            className="w-8 h-8 md:w-9 md:h-9 bg-[#071326]/90 hover:bg-[#0c2242] border-2 border-[#00d2ff] flex items-center justify-center text-[#00f0ff] hover:text-white shadow-[0_0_12px_rgba(0,210,255,0.3)] transition-colors active:scale-95"
            title="Pause Game (ESC)"
          >
            <div className="flex gap-1">
              <div className="w-1 h-3.5 bg-current rounded-xs" />
              <div className="w-1 h-3.5 bg-current rounded-xs" />
            </div>
          </button>
        </div>

        {/* Center: Tactical Compass Bar & Safe Zone Timer (Matches Reference) */}
        <div className="flex flex-col items-center">
          {/* Compass Heading Tape */}
          <div
            style={beveledClipSmall}
            className="bg-[#071326]/90 border border-[#00d2ff] px-4 py-1 text-xs font-mono font-bold tracking-widest text-slate-200 shadow-[0_0_12px_rgba(0,210,255,0.25)] flex items-center gap-2.5 relative min-w-[160px] justify-center"
          >
            {/* Cardinal ticks scale: W | | ▼ N | | E */}
            <span className="text-slate-400 text-[10px]">W</span>
            <span className="text-[#00d2ff]/40 text-[9px]">•</span>
            <span className="text-[#00d2ff]/40 text-[9px]">•</span>

            {/* Center Pointer Arrow + Cardinal / Degrees */}
            <div className="flex items-center gap-1 text-[#00f0ff] drop-shadow-[0_0_6px_#00f0ff]">
              <span className="text-[10px]">▼</span>
              <span className="font-black text-sm">
                {compassHeading >= 338 || compassHeading < 23
                  ? 'N'
                  : compassHeading < 68
                  ? 'NE'
                  : compassHeading < 113
                  ? 'E'
                  : compassHeading < 158
                  ? 'SE'
                  : compassHeading < 203
                  ? 'S'
                  : compassHeading < 248
                  ? 'SW'
                  : compassHeading < 293
                  ? 'W'
                  : 'NW'}
              </span>
              <span className="text-[10px] text-slate-300 ml-0.5">{compassHeading}°</span>
            </div>

            <span className="text-[#00d2ff]/40 text-[9px]">•</span>
            <span className="text-[#00d2ff]/40 text-[9px]">•</span>
            <span className="text-slate-400 text-[10px]">E</span>
          </div>

          {/* Safe Zone Active Badge with Shield Icon */}
          <div
            style={beveledClipSmall}
            className={`mt-1.5 px-3.5 py-1 text-[11px] font-mono font-bold flex items-center gap-2 border shadow-lg backdrop-blur-md ${
              safeZone.isShrinking
                ? 'bg-[#3b0d14]/90 text-rose-400 border-rose-500 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                : 'bg-[#071326]/90 text-[#00f0ff] border-[#00d2ff] shadow-[0_0_12px_rgba(0,210,255,0.25)]'
            }`}
          >
            {/* Shield Icon */}
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.67-3.13 9.07-7 10.18-3.87-1.11-7-5.51-7-10.18V6.3l7-3.12z" />
            </svg>
            <span className="tracking-wide">
              {safeZone.isShrinking ? 'ZONE SHRINKING' : 'SAFE ZONE ACTIVE'}
            </span>
            <span className="text-white/60 font-sans">|</span>
            <span className="text-white font-mono tracking-wider">{formatTime(remainingPhaseTime)}</span>
          </div>
        </div>

        {/* Right: Circular Tactical Radar / Minimap (Matches Reference) */}
        <button
          onClick={onOpenMap}
          className="pointer-events-auto relative w-20 h-20 md:w-26 md:h-26 rounded-full bg-[#050e1c]/95 border-2 border-[#00f0ff] overflow-hidden shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center justify-center group active:scale-95 transition-transform"
          title="Click to view full Island Tactical Map (M)"
        >
          {/* Outer Cardinal Ring with N, E, S, W */}
          <div className="absolute top-1 text-[9px] font-black font-mono text-[#00f0ff] drop-shadow-[0_0_4px_#00f0ff]">
            N
          </div>
          <div className="absolute right-1 text-[9px] font-black font-mono text-slate-300">
            E
          </div>
          <div className="absolute bottom-1 text-[9px] font-black font-mono text-slate-300">
            S
          </div>
          <div className="absolute left-1 text-[9px] font-black font-mono text-slate-300">
            W
          </div>

          {/* Concentric Radar Grid Rings & Crosshair Lines */}
          <div className="absolute inset-2.5 rounded-full border border-[#00f0ff]/30" />
          <div className="absolute inset-5 rounded-full border border-[#00f0ff]/20" />
          <div className="absolute w-full h-[1px] bg-[#00f0ff]/25" />
          <div className="absolute h-full w-[1px] bg-[#00f0ff]/25" />

          {/* Outpost radar blip markers */}
          <div className="absolute top-5 left-6 w-1.5 h-1.5 bg-[#00f0ff]/60 rounded-xs" />
          <div className="absolute bottom-6 right-5 w-2 h-1.5 bg-[#00f0ff]/50 rounded-xs" />
          <div className="absolute top-7 right-7 w-1 h-1 bg-[#10b981]/70 rounded-full" />

          {/* Rotating sweep glow beam */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#00f0ff]/10 to-transparent rounded-full animate-spin [animation-duration:4s]" />

          {/* Center Player Pointer Arrowhead */}
          <div
            className="w-4 h-4 text-[#00f0ff] relative z-10 transition-transform drop-shadow-[0_0_8px_#00f0ff]"
            style={{ transform: `rotate(${compassHeading}deg)` }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12,2 22,22 12,17 2,22" />
            </svg>
          </div>
        </button>
      </div>

      {/* ---------------- 2. CENTER CROSSHAIR & HITMARKER ---------------- */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className={`relative transition-all duration-75 ${isAiming ? 'scale-125' : 'scale-100'}`}>
          {/* Tactical Cyan Crosshair (Matches Reference) */}
          <div className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]" />
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-0.5 h-2.5 bg-[#00f0ff]" />
          <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-0.5 h-2.5 bg-[#00f0ff]" />
          <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 h-0.5 w-2.5 bg-[#00f0ff]" />
          <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 h-0.5 w-2.5 bg-[#00f0ff]" />

          {/* Outer reticle brackets */}
          <div className="absolute -top-4 -left-4 w-2 h-2 border-t border-l border-[#00f0ff]/60" />
          <div className="absolute -top-4 -right-4 w-2 h-2 border-t border-r border-[#00f0ff]/60" />
          <div className="absolute -bottom-4 -left-4 w-2 h-2 border-b border-l border-[#00f0ff]/60" />
          <div className="absolute -bottom-4 -right-4 w-2 h-2 border-b border-r border-[#00f0ff]/60" />

          {/* Hitmarker confirmation (X shape) */}
          {crosshairHit && (
            <div className={`absolute -inset-3 flex items-center justify-center ${isHeadshotHit ? 'text-amber-400' : 'text-rose-500'}`}>
              <svg viewBox="0 0 24 24" className="w-7 h-7 stroke-current stroke-2 animate-ping" fill="none">
                <line x1="4" y1="4" x2="20" y2="20" />
                <line x1="20" y1="4" x2="4" y2="20" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* ---------------- 3. PROXIMITY LOOT DETECTED ---------------- */}
      {nearbyLoot.length > 0 && (
        <div
          style={beveledClip}
          className="pointer-events-auto self-center bg-[#071326]/95 border-2 border-[#00f0ff] p-2.5 max-w-xs w-full shadow-[0_0_20px_rgba(0,210,255,0.4)] flex items-center justify-between mb-1 animate-fade-in backdrop-blur-md"
        >
          <div>
            <div className="text-[9px] font-mono text-[#00f0ff] uppercase tracking-widest font-black flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-ping" />
              PROXIMITY LOOT DETECTED
            </div>
            <div className="text-xs font-black text-white tracking-wide uppercase">{nearbyLoot[0].name}</div>
            <div className="text-[9px] font-mono text-slate-300">
              {nearbyLoot[0].type.toUpperCase()} · Press [E] or Tap Loot
            </div>
          </div>
          <button
            onClick={() => onPickupLoot(nearbyLoot[0])}
            style={beveledClipSmall}
            className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-[11px] uppercase tracking-wider shadow-[0_0_12px_rgba(0,210,255,0.5)] transition-transform active:scale-95"
          >
            LOOT
          </button>
        </div>
      )}

      {/* ---------------- 4. BOTTOM INTERACTION BAR & CONTROLS ---------------- */}
      <div className="w-full flex flex-col md:flex-row items-end justify-between gap-3 relative">
        {/* Left: Joystick + Dual Status Bars + BAG/CROUCH/JUMP (Matches Image 2 Layout) */}
        <div className="flex items-end gap-2.5 md:gap-3 pointer-events-auto flex-wrap">
          {/* Virtual Analog Joystick (Matches Reference) */}
          <div
            ref={joystickBaseRef}
            onTouchStart={handleJoystickTouchStart}
            onTouchMove={handleJoystickTouchMove}
            onTouchEnd={handleJoystickTouchEnd}
            className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-[#071426]/90 border-2 border-[#00a2d6] relative flex items-center justify-center touch-none shadow-[0_0_16px_rgba(0,162,214,0.35)] shrink-0"
          >
            {/* 4 Directional Triangle Arrows (▲, ▼, ◀, ▶) */}
            <div className="absolute top-1 text-[#00f0ff] text-[9px]">▲</div>
            <div className="absolute bottom-1 text-[#00f0ff] text-[9px]">▼</div>
            <div className="absolute left-1 text-[#00f0ff] text-[9px]">◀</div>
            <div className="absolute right-1 text-[#00f0ff] text-[9px]">▶</div>

            {/* Inner Concentric Circle Ring */}
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border border-[#00f0ff]/30 pointer-events-none" />

            {/* Center Thumb Knob (Silver/Cyan Metallic with Specular Reflection) */}
            <div
              className={`w-11 h-11 md:w-13 md:h-13 rounded-full shadow-2xl flex items-center justify-center transition-transform ${
                isJoystickActive
                  ? 'bg-gradient-to-b from-[#7dd3fc] to-[#0284c7] border-2 border-[#00f0ff] shadow-[0_0_15px_#00f0ff]'
                  : 'bg-gradient-to-b from-[#cbd5e1] via-[#94a3b8] to-[#475569] border border-white/60 shadow-lg'
              }`}
              style={{
                transform: `translate(${joystickKnobPos.x}px, ${joystickKnobPos.y}px)`,
              }}
            >
              {/* Inner metallic core with specular highlight */}
              <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#334155] to-white/90 shadow-inner" />
            </div>
          </div>

          {/* Dual Status Bars Panel (Matches Reference) */}
          <div
            style={beveledClip}
            className="bg-[#071326]/92 border-2 border-[#00d2ff] p-2.5 md:p-3 w-48 md:w-56 space-y-1.5 shadow-[0_0_16px_rgba(0,210,255,0.3)] backdrop-blur-md shrink-0"
          >
            {/* HP Bar */}
            <div>
              <div className="flex justify-between text-[10px] md:text-[11px] font-mono font-bold mb-0.5">
                <span className="flex items-center gap-1 text-[#00f0ff]">
                  {/* Cyan Heart Icon */}
                  <svg className="w-3 h-3 md:w-3.5 md:h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  HP
                </span>
                <span className="text-white font-mono">{health}/{maxHealth}</span>
              </div>
              <div className="w-full bg-[#0a182c] h-2 rounded-xs overflow-hidden p-0.5 border border-[#00d2ff]/30">
                <div
                  className="bg-gradient-to-r from-emerald-400 via-[#00e699] to-[#00f0ff] h-full rounded-xs transition-all duration-150 shadow-[0_0_8px_#00f0ff]"
                  style={{ width: `${Math.max(0, Math.min(100, (health / maxHealth) * 100))}%` }}
                />
              </div>
            </div>

            {/* Vest / Armor Bar */}
            <div>
              <div className="flex justify-between text-[10px] md:text-[11px] font-mono font-bold mb-0.5">
                <span className="flex items-center gap-1 text-[#00b4d8]">
                  {/* Shield Icon */}
                  <svg className="w-3 h-3 md:w-3.5 md:h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.67-3.13 9.07-7 10.18-3.87-1.11-7-5.51-7-10.18V6.3l7-3.12z" />
                  </svg>
                  VEST LV.{armorLevel}
                </span>
                <span className="text-white font-mono">{armor}/{maxArmor}</span>
              </div>
              <div className="w-full bg-[#0a182c] h-2 rounded-xs overflow-hidden p-0.5 border border-[#00b4d8]/30">
                <div
                  className="bg-gradient-to-r from-[#00b4d8] to-[#38bdf8] h-full rounded-xs transition-all duration-150 shadow-[0_0_8px_#38bdf8]"
                  style={{ width: `${Math.max(0, Math.min(100, (armor / maxArmor) * 100))}%` }}
                />
              </div>
            </div>

            {/* Helmet & Bag Tags */}
            <div className="flex items-center justify-between text-[8px] md:text-[9px] font-mono text-[#00f0ff]/80 pt-1 border-t border-[#00d2ff]/20">
              <span className="font-bold">HELMET LV.{helmetLevel}</span>
              <span className="font-bold">BAG LV.{backpackLevel}</span>
            </div>
          </div>

          {/* Action Hex Buttons: BAG, CROUCH, JUMP */}
          <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 shrink-0">
            {/* BAG Button */}
            <button
              onClick={onOpenInventory}
              style={octagonalClip}
              className="w-11 h-11 md:w-12 md:h-12 bg-[#071326]/90 hover:bg-[#0c2242] border-2 border-[#00d2ff] flex flex-col items-center justify-center text-[#00f0ff] hover:text-white shadow-[0_0_12px_rgba(0,210,255,0.3)] active:scale-95 transition-transform"
              title="Open Backpack Inventory (Tab)"
            >
              {/* Backpack Icon */}
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M20 8v12c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V8c0-1.86 1.28-3.41 3-3.86V4c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v.14c1.72.45 3 2 3 3.86zM9 4v1h6V4H9zm9 4H6v12h12V8zm-7 3h2v4h-2v-4z" />
              </svg>
              <span className="text-[7px] md:text-[8px] font-mono font-black mt-0.5">BAG</span>
            </button>

            {/* CROUCH Button */}
            <button
              onClick={onToggleCrouch}
              style={octagonalClip}
              className={`w-11 h-11 md:w-12 md:h-12 border-2 flex flex-col items-center justify-center shadow-[0_0_12px_rgba(0,210,255,0.3)] active:scale-95 transition-all ${
                isCrouching
                  ? 'bg-[#00f0ff]/20 border-[#00f0ff] text-[#00f0ff] ring-2 ring-[#00f0ff]'
                  : 'bg-[#071326]/90 hover:bg-[#0c2242] border-[#00d2ff] text-[#00f0ff]'
              }`}
              title="Toggle Crouch (C)"
            >
              {/* Kneeling/Crouching Silhouette Icon */}
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M14 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.5 6.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S9 8.17 9 9s.67 1.5 1.5 1.5zM17 19.5L14.5 14l-2.5 1.5v4h-2v-5.5l3.5-2.5.5-3.5c-.83-.67-1.78-1.07-2.85-1.14L10 9l-3 1.5L6 9l3-1.5c1.47-.73 3.19-.64 4.58.24L15 9l2.5 4.5-1.75 1L14 11.5l1 3 2 5z" />
              </svg>
              <span className="text-[7px] md:text-[8px] font-mono font-black mt-0.5">CROUCH</span>
            </button>

            {/* JUMP Button */}
            <button
              onClick={onJump}
              style={octagonalClip}
              className="w-11 h-11 md:w-12 md:h-12 bg-[#071326]/90 hover:bg-[#0c2242] border-2 border-[#00d2ff] flex flex-col items-center justify-center text-[#00f0ff] hover:text-white shadow-[0_0_12px_rgba(0,210,255,0.3)] active:scale-95 transition-transform"
              title="Jump (Space)"
            >
              {/* Jumping / Running Silhouette Icon */}
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7z" />
              </svg>
              <span className="text-[7px] md:text-[8px] font-mono font-black mt-0.5">JUMP</span>
            </button>
          </div>
        </div>

        {/* Right: Weapon Slots, RELOAD, AIM, and Large Orange FIRE Button */}
        <div className="flex flex-col items-end gap-2.5 pointer-events-auto">
          {/* Weapon Slots (Primary AR-01 VANGUARD / Secondary HG-01 Compact) */}
          <div className="flex items-center gap-2">
            {/* Slot 1: Primary Weapon Card (AR-01 VANGUARD) */}
            {activeWeapon && (
              <button
                onClick={() => onSwitchWeapon(0)}
                style={beveledClip}
                className="bg-[#071326]/95 border-2 border-[#00d2ff] px-3.5 py-2 text-left shadow-[0_0_18px_rgba(0,210,255,0.4)] min-w-[155px] md:min-w-[175px] active:scale-95 transition-transform relative group"
              >
                {/* SLOT 1 Tag on Top Right */}
                <div className="text-[9px] font-mono font-black text-[#00f0ff] text-right uppercase">
                  SLOT 1
                </div>

                {/* Assault Rifle Graphic Silhouette */}
                <div className="my-1 flex items-center justify-center text-[#00f0ff] h-8">
                  <svg className="w-28 md:w-32 h-7 fill-current drop-shadow-[0_0_6px_#00f0ff]" viewBox="0 0 120 28">
                    {/* Tactical Carbine Silhouette */}
                    <rect x="2" y="11" width="18" height="6" rx="1" />
                    <rect x="20" y="8" width="60" height="9" rx="1.5" />
                    <rect x="80" y="11" width="30" height="3" rx="1" />
                    <rect x="110" y="10" width="8" height="5" rx="1" />
                    <polygon points="45,17 52,26 44,26 38,17" />
                    <polygon points="26,17 30,24 24,24 22,17" />
                    <rect x="36" y="5" width="22" height="4" rx="1" />
                  </svg>
                </div>

                {/* Weapon Name */}
                <div className="text-xs md:text-sm font-black text-white uppercase tracking-wider font-mono">
                  {activeWeapon.name}
                </div>

                {/* Bullets Icon (3 Tilted Bars) + Ammo Count */}
                <div className="flex items-center gap-2 font-mono text-xs md:text-sm mt-0.5">
                  <span className="flex gap-0.5 text-[#00f0ff]">
                    <span className="w-1 h-3 bg-current skew-x-[-20deg]" />
                    <span className="w-1 h-3 bg-current skew-x-[-20deg]" />
                    <span className="w-1 h-3 bg-current skew-x-[-20deg]" />
                  </span>
                  <span className={`font-black text-[#00f0ff] text-sm md:text-base ${ammoInMag <= 5 ? 'text-rose-400 animate-pulse' : ''}`}>
                    {isReloading ? 'RELOADING' : ammoInMag}
                  </span>
                  <span className="text-slate-400 text-xs">/ {reserveAmmo}</span>
                </div>
              </button>
            )}

            {/* Slot 2: Secondary Weapon Card (HG-01 Compact) */}
            {secondaryWeapon && (
              <button
                onClick={() => onSwitchWeapon(1)}
                style={beveledClip}
                className="bg-[#071326]/80 hover:bg-[#071326] border border-[#00d2ff]/60 px-3 py-2 text-left shadow-lg min-w-[120px] active:scale-95 transition-all"
              >
                <div className="text-[8px] font-mono font-black text-slate-400 text-right uppercase">
                  SLOT 2
                </div>

                {/* Pistol Silhouette */}
                <div className="my-1 flex items-center justify-center text-slate-300 h-8">
                  <svg className="w-14 h-7 fill-current" viewBox="0 0 50 28">
                    <rect x="4" y="6" width="38" height="8" rx="1" />
                    <polygon points="12,14 18,24 10,24 6,14" />
                    <rect x="42" y="9" width="4" height="2" />
                  </svg>
                </div>

                <div className="text-[11px] font-black text-slate-200 uppercase tracking-wide font-mono">
                  {secondaryWeapon.name}
                </div>

                <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#00f0ff]/80">
                  <span className="flex gap-0.5 text-[#00f0ff]">
                    <span className="w-0.5 h-2.5 bg-current skew-x-[-20deg]" />
                    <span className="w-0.5 h-2.5 bg-current skew-x-[-20deg]" />
                    <span className="w-0.5 h-2.5 bg-current skew-x-[-20deg]" />
                  </span>
                  <span className="font-bold text-white">15</span>
                  <span className="text-slate-500">/ 45</span>
                </div>
              </button>
            )}
          </div>

          {/* Action Buttons: RELOAD, AIM, and Giant Orange FIRE Button (Matches Reference) */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* RELOAD Button */}
            <button
              onClick={onReload}
              style={octagonalClip}
              className={`w-13 h-13 md:w-15 md:h-15 border-2 flex flex-col items-center justify-center shadow-[0_0_12px_rgba(0,210,255,0.3)] active:scale-95 transition-transform ${
                isReloading
                  ? 'bg-amber-950/80 border-amber-500 text-amber-400 animate-spin'
                  : 'bg-[#071326]/90 hover:bg-[#0c2242] border-[#00d2ff] text-[#00f0ff]'
              }`}
              title="Reload Weapon (R)"
            >
              <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              <span className="text-[8px] font-mono font-black mt-0.5">RELOAD</span>
            </button>

            {/* AIM (ADS) Button */}
            <button
              onClick={onToggleAim}
              style={octagonalClip}
              className={`w-13 h-13 md:w-15 md:h-15 border-2 flex flex-col items-center justify-center shadow-[0_0_12px_rgba(0,210,255,0.3)] active:scale-95 transition-all ${
                isAiming
                  ? 'bg-[#00f0ff]/25 border-[#00f0ff] text-[#00f0ff] ring-2 ring-[#00f0ff] shadow-[0_0_18px_#00f0ff]'
                  : 'bg-[#071326]/90 hover:bg-[#0c2242] border-[#00d2ff] text-[#00f0ff]'
              }`}
              title="Toggle ADS Aim (Right Click)"
            >
              <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="4" />
                <line x1="12" y1="1" x2="12" y2="5" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="1" y1="12" x2="5" y2="12" />
                <line x1="19" y1="12" x2="23" y2="12" />
              </svg>
              <span className="text-[8px] font-mono font-black mt-0.5">AIM</span>
            </button>

            {/* Giant Primary FIRE Button (Vibrant Orange-Red Octagon with Glow) */}
            <button
              onClick={onShootStart}
              onTouchStart={onShootStart}
              onTouchEnd={onShootEnd}
              onMouseDown={onShootStart}
              onMouseUp={onShootEnd}
              style={octagonalClip}
              className="w-18 h-18 md:w-22 md:h-22 bg-gradient-to-br from-[#ff334b] via-[#ff5400] to-[#ff7a00] hover:from-[#ff445c] hover:to-[#ff8c1a] text-white flex flex-col items-center justify-center shadow-[0_0_25px_rgba(255,84,0,0.65)] border-2 border-[#ffb076] active:scale-95 transition-transform"
              title="Fire Weapon (Click or Tap)"
            >
              {/* Concentric Target Reticle Icon */}
              <svg className="w-8 h-8 md:w-9 md:h-9 fill-none stroke-white stroke-2 drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="8" />
                <circle cx="12" cy="12" r="3" />
                <line x1="12" y1="2" x2="12" y2="6" />
                <line x1="12" y1="18" x2="12" y2="22" />
                <line x1="2" y1="12" x2="6" y2="12" />
                <line x1="18" y1="12" x2="22" y2="12" />
              </svg>
              <span className="text-[10px] md:text-xs font-black uppercase font-mono tracking-widest mt-0.5 drop-shadow-[0_0_4px_rgba(0,0,0,0.5)]">
                FIRE
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Right-Side Touch Pan Surface for Smooth Mobile Look Rotation */}
      <div
        onTouchStart={handleLookTouchStart}
        onTouchMove={handleLookTouchMove}
        onTouchEnd={handleLookTouchEnd}
        className="absolute top-20 bottom-28 right-0 w-2/5 pointer-events-auto touch-none opacity-0"
      />
    </div>
  );
};
