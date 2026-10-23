/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Package, Shield, Heart, Crosshair, ArrowDown, Check, X } from 'lucide-react';
import { WeaponDef } from '../types/game';
import { getBackpackCapacity } from '../game/rules';

interface MatchInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  health: number;
  maxHealth: number;
  armor: number;
  armorLevel: number;
  helmetLevel: number;
  backpackLevel: number;
  primaryWeapon: WeaponDef | null;
  secondaryWeapon: WeaponDef | null;
  ammoInventory: Record<string, number>;
  onUseMedkit: () => void;
  onUseBandage: () => void;
}

export const MatchInventoryModal: React.FC<MatchInventoryModalProps> = ({
  isOpen,
  onClose,
  health,
  maxHealth,
  armor,
  armorLevel,
  helmetLevel,
  backpackLevel,
  primaryWeapon,
  secondaryWeapon,
  ammoInventory,
  onUseMedkit,
  onUseBandage,
}) => {
  if (!isOpen) return null;

  const capacity = getBackpackCapacity(backpackLevel);
  // Estimated weight calculation
  let usedWeight = 40; // weapons base
  Object.values(ammoInventory).forEach((amt) => {
    usedWeight += Math.floor(amt * 0.35);
  });
  const percentUsed = Math.min(100, Math.round((usedWeight / capacity) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 md:p-6 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold uppercase tracking-wider text-white font-display">
              TACTICAL FIELD BACKPACK
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Capacity Bar */}
        <div className="bg-slate-900/80 px-6 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">
            LOAD WEIGHT: {usedWeight} / {capacity} UNITS (LV.{backpackLevel} RUCKSACK)
          </span>
          <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${percentUsed > 85 ? 'bg-rose-500' : 'bg-emerald-500'}`}
              style={{ width: `${percentUsed}%` }}
            />
          </div>
        </div>

        {/* Inventory Content */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-4">
          {/* Equipped Weapons Slot */}
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-2">
              EQUIPPED WEAPON SLOTS
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {primaryWeapon && (
                <div className="p-3 bg-slate-900/80 border border-emerald-500/80 rounded-xl">
                  <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase">PRIMARY WEAPON</div>
                  <div className="font-bold text-white text-sm">{primaryWeapon.name}</div>
                  <div className="text-xs text-slate-400 font-mono mt-1">
                    Caliber: {primaryWeapon.ammoType} · Mag: {primaryWeapon.magazineCapacity} rds
                  </div>
                </div>
              )}
              {secondaryWeapon && (
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                  <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase">SECONDARY SIDEARM</div>
                  <div className="font-bold text-white text-sm">{secondaryWeapon.name}</div>
                  <div className="text-xs text-slate-400 font-mono mt-1">
                    Caliber: {secondaryWeapon.ammoType} · Mag: {secondaryWeapon.magazineCapacity} rds
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tactical Medical Supplies */}
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-2">
              FIELD MEDICAL SUPPLIES
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-sm flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-rose-500" /> Tactical Medkit
                  </div>
                  <div className="text-xs text-slate-400 font-mono">Restores +75 Health</div>
                </div>
                <button
                  onClick={onUseMedkit}
                  disabled={health >= maxHealth}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${
                    health < maxHealth
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Apply
                </button>
              </div>

              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-sm flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-emerald-400" /> Field Bandages
                  </div>
                  <div className="text-xs text-slate-400 font-mono">Restores +25 Health</div>
                </div>
                <button
                  onClick={onUseBandage}
                  disabled={health >= maxHealth}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${
                    health < maxHealth
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* Reserved Ammunition Stockpile */}
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-2">
              AMMO STOCKPILE IN POUCHES
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              {Object.entries(ammoInventory).map(([cal, count]) => (
                <div key={cal} className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg text-center">
                  <div className="text-slate-400 uppercase text-[10px]">{cal}</div>
                  <div className="text-white font-bold text-base mt-0.5">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
