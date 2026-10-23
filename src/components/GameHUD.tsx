/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Crosshair,
  Shield,
  Heart,
  Map,
  Package,
  RotateCw,
  Zap,
  Target,
  Pause,
  ArrowUp,
  Skull,
  Eye,
  ChevronUp,
} from 'lucide-react';
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
  matchTime,
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
    const maxRadius = 45; // max drag radius

    let normalizedX = dx / maxRadius;
    let normalizedY = dy / maxRadius;

    if (distance > maxRadius) {
      normalizedX = (dx / distance);
      normalizedY = (dy / distance);
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

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 flex flex-col justify-between p-2 md:p-4 overflow-hidden">
      {/* 1. TOP HEADER CLUSTER (Compass, Alive Count, Minimap, Pause) */}
      <div className="w-full flex items-start justify-between">
        {/* Left: Alive & Kill Counter */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="bg-slate-950/85 border border-slate-700/80 rounded-xl px-3 py-1.5 flex items-center gap-2.5 shadow-lg">
            <div className="flex items-center gap-1 text-emerald-400 font-black text-sm">
              <Eye className="w-4 h-4" />
              <span>ALIVE {aliveCount}</span>
            </div>
            <div className="w-px h-4 bg-slate-700" />
            <div className="flex items-center gap-1 text-rose-400 font-black text-sm">
              <Skull className="w-4 h-4" />
              <span>KILLS {killCount}</span>
            </div>
          </div>

          <button
            onClick={onPause}
            className="w-9 h-9 rounded-xl bg-slate-950/85 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white shadow-lg transition-colors"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Compass Heading Tape & Safe Zone Warning */}
        <div className="flex flex-col items-center">
          <div className="bg-slate-950/85 border border-slate-700/80 rounded-full px-4 py-1 text-xs font-mono font-bold tracking-widest text-slate-200 shadow-lg flex items-center gap-2">
            <span className="text-emerald-400">{compassHeading}°</span>
            <span className="text-slate-500">|</span>
            <span>
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
          </div>

          {/* Safe Zone Countdown Badge */}
          <div className={`mt-1.5 px-3 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 shadow ${
            safeZone.isShrinking
              ? 'bg-rose-950/90 text-rose-400 border border-rose-600 animate-pulse'
              : 'bg-slate-900/85 text-cyan-400 border border-slate-700'
          }`}>
            <span>{safeZone.isShrinking ? 'ZONE SHRINKING' : 'SAFE ZONE ACTIVE'}</span>
            <span>·</span>
            <span>{formatTime(remainingPhaseTime)}</span>
          </div>
        </div>

        {/* Right: Tactical Minimap */}
        <button
          onClick={onOpenMap}
          className="pointer-events-auto relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-slate-950/90 border-2 border-emerald-500/80 overflow-hidden shadow-2xl flex items-center justify-center group"
          title="Click to expand World Map"
        >
          {/* Radar background circles */}
          <div className="absolute inset-1 rounded-full border border-emerald-500/30" />
          <div className="absolute inset-3 rounded-full border border-emerald-500/20" />
          <div className="absolute w-full h-px bg-emerald-500/30" />
          <div className="absolute h-full w-px bg-emerald-500/30" />

          {/* Center player indicator arrow */}
          <div
            className="w-3 h-3 text-emerald-400 relative z-10 transition-transform"
            style={{ transform: `rotate(${compassHeading}deg)` }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12,2 22,22 12,17 2,22" />
            </svg>
          </div>

          {/* Minimap label */}
          <div className="absolute bottom-1 text-[8px] font-mono text-emerald-300 uppercase bg-black/60 px-1 rounded">
            MAP (M)
          </div>
        </button>
      </div>

      {/* 2. CENTER CROSSHAIR & HITMARKER */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className={`relative transition-all duration-75 ${isAiming ? 'scale-125' : 'scale-100'}`}>
          {/* Default Crosshair Dots/Lines */}
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/90 shadow-[0_0_8px_#34d399]" />
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-emerald-400/80" />
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-emerald-400/80" />
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-0.5 w-2 bg-emerald-400/80" />
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 h-0.5 w-2 bg-emerald-400/80" />

          {/* Hitmarker confirmation (X shape) */}
          {crosshairHit && (
            <div className={`absolute -inset-3 flex items-center justify-center ${isHeadshotHit ? 'text-amber-400' : 'text-rose-500'}`}>
              <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-current stroke-2 animate-ping" fill="none">
                <line x1="4" y1="4" x2="20" y2="20" />
                <line x1="20" y1="4" x2="4" y2="20" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* 3. PROXIMITY LOOT PICKUP POPUP (Appears when near ground item) */}
      {nearbyLoot.length > 0 && (
        <div className="pointer-events-auto self-center bg-slate-950/90 border border-emerald-500/80 rounded-xl p-2.5 max-w-xs w-full shadow-2xl flex items-center justify-between mb-4 animate-fade-in">
          <div>
            <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
              PROXIMITY LOOT DETECTED
            </div>
            <div className="text-sm font-bold text-white tracking-wide">{nearbyLoot[0].name}</div>
            <div className="text-[10px] font-mono text-slate-400">
              {nearbyLoot[0].type.toUpperCase()} · Press [E] or Tap Loot
            </div>
          </div>
          <button
            onClick={() => onPickupLoot(nearbyLoot[0])}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg uppercase tracking-wider shadow transition-transform active:scale-95"
          >
            LOOT
          </button>
        </div>
      )}

      {/* 4. BOTTOM INTERACTION BAR & CONTROLS */}
      <div className="w-full flex items-end justify-between relative">
        {/* Left: Virtual Joystick Area & Health/Armor Meters */}
        <div className="flex flex-col gap-3 pointer-events-auto">
          {/* Health & Armor Status Cluster */}
          <div className="bg-slate-950/90 border border-slate-700/80 rounded-xl p-2.5 w-48 md:w-56 space-y-1.5 shadow-xl">
            {/* Health Bar */}
            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-0.5">
                <span className="flex items-center gap-1 font-bold text-emerald-400">
                  <Heart className="w-3 h-3 text-rose-500" /> HP
                </span>
                <span className="font-bold">{health}/{maxHealth}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.max(0, Math.min(100, (health / maxHealth) * 100))}%` }}
                />
              </div>
            </div>

            {/* Armor Bar */}
            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-0.5">
                <span className="flex items-center gap-1 font-bold text-cyan-400">
                  <Shield className="w-3 h-3 text-cyan-400" /> VEST LV.{armorLevel}
                </span>
                <span className="font-bold">{armor}/{maxArmor}</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.max(0, Math.min(100, (armor / maxArmor) * 100))}%` }}
                />
              </div>
            </div>

            {/* Helmet & Bag Tags */}
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-1 border-t border-slate-800">
              <span>HELMET LV.{helmetLevel}</span>
              <span>BAG LV.{backpackLevel}</span>
            </div>
          </div>

          {/* Virtual Analog Joystick (Mobile Touch Surface) */}
          <div
            ref={joystickBaseRef}
            onTouchStart={handleJoystickTouchStart}
            onTouchMove={handleJoystickTouchMove}
            onTouchEnd={handleJoystickTouchEnd}
            className="w-28 h-28 rounded-full bg-slate-900/60 border-2 border-slate-700/70 relative flex items-center justify-center touch-none"
          >
            {/* Joystick Knob */}
            <div
              className={`w-12 h-12 rounded-full shadow-lg border border-emerald-400/60 flex items-center justify-center transition-transform ${
                isJoystickActive ? 'bg-emerald-600/90' : 'bg-slate-800/80'
              }`}
              style={{
                transform: `translate(${joystickKnobPos.x}px, ${joystickKnobPos.y}px)`,
              }}
            >
              <div className="w-3 h-3 rounded-full bg-white/70" />
            </div>
          </div>
        </div>

        {/* Center: Inventory, Crouch, and Jump Action Shortcuts */}
        <div className="flex items-center gap-2 pointer-events-auto mb-2">
          {/* Backpack Inventory Button */}
          <button
            onClick={onOpenInventory}
            className="w-11 h-11 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-slate-700 flex flex-col items-center justify-center text-slate-300 hover:text-white shadow-lg active:scale-95"
            title="Open Backpack Inventory (Tab)"
          >
            <Package className="w-4 h-4 text-emerald-400" />
            <span className="text-[8px] font-mono">BAG</span>
          </button>

          {/* Crouch Toggle Button */}
          <button
            onClick={onToggleCrouch}
            className={`w-11 h-11 rounded-xl border flex flex-col items-center justify-center shadow-lg active:scale-95 transition-colors ${
              isCrouching
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400'
                : 'bg-slate-900/85 hover:bg-slate-800 border-slate-700 text-slate-300'
            }`}
            title="Crouch (C)"
          >
            <ChevronUp className="w-4 h-4" />
            <span className="text-[8px] font-mono">CROUCH</span>
          </button>

          {/* Jump Button */}
          <button
            onClick={onJump}
            className="w-11 h-11 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-slate-700 flex flex-col items-center justify-center text-slate-300 hover:text-white shadow-lg active:scale-95"
            title="Jump (Space)"
          >
            <ArrowUp className="w-4 h-4 text-cyan-400" />
            <span className="text-[8px] font-mono">JUMP</span>
          </button>
        </div>

        {/* Right: Weapon Status, Reload, ADS Aim, and Large Fire Button */}
        <div className="flex flex-col items-end gap-3 pointer-events-auto">
          {/* Active Weapon Cards (Primary / Secondary) */}
          <div className="flex items-center gap-2">
            {/* Primary Weapon Card */}
            {activeWeapon && (
              <button
                onClick={() => onSwitchWeapon(0)}
                className="bg-slate-950/90 border border-emerald-500/80 rounded-xl px-3 py-2 text-right shadow-xl min-w-[130px]"
              >
                <div className="text-[9px] font-mono text-emerald-400 font-bold uppercase">
                  SLOT 1 · {activeWeapon.ammoType}
                </div>
                <div className="text-sm font-black text-white uppercase">{activeWeapon.name}</div>
                <div className="flex items-center justify-end gap-1 font-mono text-sm">
                  <span className={`font-black ${ammoInMag <= 5 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                    {isReloading ? 'RELOADING...' : ammoInMag}
                  </span>
                  <span className="text-slate-500 text-xs">/ {reserveAmmo}</span>
                </div>
              </button>
            )}

            {/* Secondary Weapon Card */}
            {secondaryWeapon && (
              <button
                onClick={() => onSwitchWeapon(1)}
                className="bg-slate-950/70 hover:bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-right shadow opacity-80 hover:opacity-100 transition-opacity"
              >
                <div className="text-[8px] font-mono text-slate-400 uppercase">SLOT 2</div>
                <div className="text-xs font-bold text-slate-200">{secondaryWeapon.name}</div>
              </button>
            )}
          </div>

          {/* Action Touch Buttons: Reload, Aim (ADS), Fire */}
          <div className="flex items-center gap-3">
            {/* Reload Button */}
            <button
              onClick={onReload}
              className={`w-12 h-12 rounded-xl border flex flex-col items-center justify-center shadow-lg active:scale-95 ${
                isReloading
                  ? 'bg-amber-950 border-amber-500 text-amber-400 animate-spin'
                  : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-300'
              }`}
              title="Reload Weapon (R)"
            >
              <RotateCw className="w-5 h-5" />
              <span className="text-[8px] font-mono mt-0.5">RELOAD</span>
            </button>

            {/* Aim Down Sights (ADS) Button */}
            <button
              onClick={onToggleAim}
              className={`w-12 h-12 rounded-xl border flex flex-col items-center justify-center shadow-lg active:scale-95 transition-colors ${
                isAiming
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-400 ring-2 ring-emerald-500'
                  : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-300'
              }`}
              title="Toggle ADS Aim (Right Click)"
            >
              <Target className="w-5 h-5" />
              <span className="text-[8px] font-mono mt-0.5">AIM</span>
            </button>

            {/* Big Primary Fire Touch Button */}
            <button
              onClick={onShootStart}
              onTouchStart={onShootStart}
              onTouchEnd={onShootEnd}
              onMouseDown={onShootStart}
              onMouseUp={onShootEnd}
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-tr from-rose-700 to-amber-600 hover:from-rose-600 hover:to-amber-500 text-white flex flex-col items-center justify-center shadow-2xl shadow-rose-950/80 border-2 border-rose-400/80 active:scale-95 transition-transform"
              title="Fire Weapon (Click or Tap)"
            >
              <Crosshair className="w-7 h-7 md:w-8 md:h-8" />
              <span className="text-[9px] font-black uppercase font-display tracking-widest mt-0.5">FIRE</span>
            </button>
          </div>
        </div>
      </div>

      {/* Touch Pan Surface for Right-Side Camera Rotation on Mobile */}
      <div
        onTouchStart={handleLookTouchStart}
        onTouchMove={handleLookTouchMove}
        onTouchEnd={handleLookTouchEnd}
        className="absolute top-24 bottom-24 right-0 w-2/5 pointer-events-auto touch-none opacity-0"
      />
    </div>
  );
};
