/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Compass, MapPin, ShieldAlert, X } from 'lucide-react';
import { FRONTIER_POIS } from '../game/islandMap';
import { SafeZoneState } from '../types/game';

interface WorldMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerPos: { x: number; z: number };
  safeZone: SafeZoneState;
}

export const WorldMapModal: React.FC<WorldMapModalProps> = ({
  isOpen,
  onClose,
  playerPos,
  safeZone,
}) => {
  const [waypoint, setWaypoint] = useState<{ x: number; z: number } | null>(null);

  if (!isOpen) return null;

  // Map scale conversion: island coordinates [-240, 240] mapped to [0, 480] pixels
  const mapSize = 480;
  const worldToMap = (x: number, z: number) => {
    const px = ((x + 240) / 480) * mapSize;
    const py = ((z + 240) / 480) * mapSize;
    return { px, py };
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const worldX = (clickX / mapSize) * 480 - 240;
    const worldZ = (clickY / mapSize) * 480 - 240;
    setWaypoint({ x: Math.round(worldX), z: Math.round(worldZ) });
  };

  const playerMap = worldToMap(playerPos.x, playerPos.z);
  const currentSafeMap = worldToMap(safeZone.currentCenter.x, safeZone.currentCenter.z);
  const targetSafeMap = worldToMap(safeZone.targetCenter.x, safeZone.targetCenter.z);

  const currentRadiusPx = (safeZone.currentRadius / 480) * mapSize;
  const targetRadiusPx = (safeZone.targetRadius / 480) * mapSize;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 md:p-6 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold uppercase tracking-wider text-white font-display">
              FRONTIER ISLAND // SATELLITE RECON MAP
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Canvas / Visual Area */}
        <div className="p-4 flex flex-col items-center">
          <div
            onClick={handleMapClick}
            className="relative w-[340px] h-[340px] sm:w-[480px] sm:h-[480px] bg-slate-900 border-2 border-emerald-500/80 rounded-xl overflow-hidden cursor-crosshair shadow-2xl"
            style={{
              backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          >
            {/* Coastline shape illustration */}
            <div className="absolute inset-4 rounded-full border border-emerald-500/20 bg-emerald-950/20" />

            {/* Current Safe Zone Circle (Cyan) */}
            <div
              className="absolute rounded-full border-2 border-cyan-400/80 pointer-events-none"
              style={{
                left: `${currentSafeMap.px - currentRadiusPx}px`,
                top: `${currentSafeMap.py - currentRadiusPx}px`,
                width: `${currentRadiusPx * 2}px`,
                height: `${currentRadiusPx * 2}px`,
              }}
            />

            {/* Next Shrinking Safe Zone Circle (Dashed Amber) */}
            <div
              className="absolute rounded-full border-2 border-dashed border-amber-400/90 pointer-events-none"
              style={{
                left: `${targetSafeMap.px - targetRadiusPx}px`,
                top: `${targetSafeMap.py - targetRadiusPx}px`,
                width: `${targetRadiusPx * 2}px`,
                height: `${targetRadiusPx * 2}px`,
              }}
            />

            {/* POI Labels */}
            {FRONTIER_POIS.map((poi) => {
              const pos = worldToMap(poi.x, poi.z);
              return (
                <div
                  key={poi.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center"
                  style={{ left: `${pos.px}px`, top: `${pos.py}px` }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-400 border border-slate-900" />
                  <span className="text-[9px] font-mono font-bold text-slate-300 uppercase bg-black/70 px-1 py-0.2 rounded mt-0.5 whitespace-nowrap">
                    {poi.name}
                  </span>
                </div>
              );
            })}

            {/* Custom Waypoint Marker */}
            {waypoint && (
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center animate-bounce"
                style={{ left: `${worldToMap(waypoint.x, waypoint.z).px}px`, top: `${worldToMap(waypoint.x, waypoint.z).py}px` }}
              >
                <MapPin className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="text-[8px] font-mono font-bold text-amber-300 bg-black px-1 rounded">
                  WAYPOINT
                </span>
              </div>
            )}

            {/* Player Location Marker */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center"
              style={{ left: `${playerMap.px}px`, top: `${playerMap.py}px` }}
            >
              <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-lg animate-pulse" />
              <span className="text-[8px] font-mono font-bold text-emerald-400 bg-black/90 px-1 rounded mt-0.5">
                YOU
              </span>
            </div>
          </div>

          {/* Map Legend Footer */}
          <div className="w-full mt-3 flex items-center justify-between text-xs font-mono text-slate-400 px-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full border border-cyan-400" /> Safe Zone
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full border border-dashed border-amber-400" /> Next Target
              </span>
            </div>
            <span>TAP MAP TO SET WAYPOINT</span>
          </div>
        </div>
      </div>
    </div>
  );
};
