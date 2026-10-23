/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Crosshair, Shield, Activity, Gauge, Flame, Check, X } from 'lucide-react';
import { WEAPON_DATABASE } from '../game/weapons';
import { WeaponDef } from '../types/game';
import { createWeaponMesh } from '../game/proceduralModels';
import { getEffectiveWeaponStats } from '../game/rules';

interface ArmoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  equippedWeaponId: string;
  onEquipWeapon: (id: string) => void;
}

export const ArmoryModal: React.FC<ArmoryModalProps> = ({
  isOpen,
  onClose,
  equippedWeaponId,
  onEquipWeapon,
}) => {
  const [selectedId, setSelectedId] = useState(equippedWeaponId || 'ar_vanguard');
  const [hasCompensator, setHasCompensator] = useState(false);
  const [hasVerticalGrip, setHasVerticalGrip] = useState(false);
  const [hasExtendedMag, setHasExtendedMag] = useState(false);
  const [opticZoom, setOpticZoom] = useState(1.0);

  const canvasMountRef = useRef<HTMLDivElement>(null);

  const weaponList = Object.values(WEAPON_DATABASE);
  const selectedWeapon = WEAPON_DATABASE[selectedId] || weaponList[0];

  // Effective stats with attachments
  const effectiveStats = getEffectiveWeaponStats(selectedWeapon, {
    hasCompensator,
    hasVerticalGrip,
    hasExtendedMag,
    opticZoom,
  });

  // 3D weapon viewer
  useEffect(() => {
    if (!isOpen || !canvasMountRef.current) return;
    const container = canvasMountRef.current;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e14);

    const aspect = container.clientWidth / Math.max(container.clientHeight, 1);
    const camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 50);
    camera.position.set(0, 0.2, 1.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(2, 4, 3);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.0);
    rimLight.position.set(-2, 2, -2);
    scene.add(rimLight);

    const ambient = new THREE.AmbientLight(0x334155, 0.8);
    scene.add(ambient);

    const weaponGroup = createWeaponMesh(selectedWeapon.category);
    weaponGroup.scale.set(1.5, 1.5, 1.5);
    scene.add(weaponGroup);

    let animId = 0;
    const tick = () => {
      weaponGroup.rotation.y += 0.012;
      renderer.render(scene, camera);
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [isOpen, selectedId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 md:p-6 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold uppercase tracking-wider text-white font-display">
              WEAPONS ARMORY & MODIFICATIONS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content */}
        <div className="p-4 md:p-6 overflow-y-auto flex flex-col md:flex-row gap-6">
          {/* Left Column: Weapon Catalog */}
          <div className="w-full md:w-5/12 space-y-2 max-h-[480px] overflow-y-auto pr-2">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-2">
              ARSENAL BLUEPRINTS
            </div>
            {weaponList.map((wp) => {
              const isSelected = selectedId === wp.id;
              const isEquipped = equippedWeaponId === wp.id;

              return (
                <button
                  key={wp.id}
                  onClick={() => setSelectedId(wp.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm text-white">{wp.name}</div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase">
                      {wp.category.replace('_', ' ')} · {wp.ammoType}
                    </div>
                  </div>
                  {isEquipped && (
                    <span className="text-[9px] font-mono font-bold bg-emerald-500 text-black px-1.5 py-0.5 rounded">
                      DEFAULT
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Column: 3D View & Stats Breakdown */}
          <div className="w-full md:w-7/12 flex flex-col space-y-4">
            {/* 3D Weapon Canvas */}
            <div className="w-full h-44 bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden relative">
              <div ref={canvasMountRef} className="w-full h-full" />
              <div className="absolute top-2 left-3 text-[10px] font-mono text-slate-400">
                ROTATING 3D BLUEPRINT PREVIEW
              </div>
            </div>

            {/* Weapon Description & Category */}
            <div>
              <div className="text-lg font-bold text-white uppercase font-display">{selectedWeapon.name}</div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{selectedWeapon.description}</p>
            </div>

            {/* Performance Stats Bars */}
            <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 font-mono text-[11px] mb-1">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-rose-400" /> DAMAGE
                  </span>
                  <span className="font-bold text-white">{effectiveStats.damage}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, (effectiveStats.damage / 120) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-mono text-[11px] mb-1">
                  <span className="flex items-center gap-1">
                    <Activity className="w-3 h-3 text-amber-400" /> FIRE RATE
                  </span>
                  <span className="font-bold text-white">{effectiveStats.fireRate} RPM</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, (effectiveStats.fireRate / 900) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-mono text-[11px] mb-1">
                  <span className="flex items-center gap-1">
                    <Gauge className="w-3 h-3 text-cyan-400" /> MAG CAPACITY
                  </span>
                  <span className="font-bold text-white">{effectiveStats.magazineCapacity} RDS</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, (effectiveStats.magazineCapacity / 45) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-mono text-[11px] mb-1">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-emerald-400" /> STABILITY / RECOIL
                  </span>
                  <span className="font-bold text-white">{(1.0 - effectiveStats.recoil).toFixed(2)}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, (1.0 - effectiveStats.recoil) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Tactical Attachments Modification Panel */}
            <div>
              <div className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-2">
                ATTACHMENT TEST RIG
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <button
                  onClick={() => setHasCompensator(!hasCompensator)}
                  className={`p-2 rounded-lg border text-center transition-colors ${
                    hasCompensator
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  Compensator
                </button>
                <button
                  onClick={() => setHasVerticalGrip(!hasVerticalGrip)}
                  className={`p-2 rounded-lg border text-center transition-colors ${
                    hasVerticalGrip
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  Vertical Grip
                </button>
                <button
                  onClick={() => setHasExtendedMag(!hasExtendedMag)}
                  className={`p-2 rounded-lg border text-center transition-colors ${
                    hasExtendedMag
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  Extended Mag
                </button>
                <button
                  onClick={() => setOpticZoom(opticZoom === 1.0 ? 3.0 : 1.0)}
                  className={`p-2 rounded-lg border text-center transition-colors ${
                    opticZoom > 1.0
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {opticZoom > 1.0 ? '4x ACOG Scope' : 'Iron Sights'}
                </button>
              </div>
            </div>

            {/* Set as Starting Weapon Button */}
            <div className="pt-2">
              <button
                onClick={() => onEquipWeapon(selectedWeapon.id)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl uppercase tracking-wider text-xs shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Select for Training / Lobby Preview</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
