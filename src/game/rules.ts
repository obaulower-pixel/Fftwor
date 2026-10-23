/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SafeZonePhase, SafeZoneState, WeaponDef } from '../types/game';

/**
 * Standard 35-minute Battle Royale Phase schedule as specified in Master Prompt:
 * Phase 1: 00-03 min deployment & prep (180s)
 * Phase 2: 03-10 min looting & early fights (420s) -> 10m safe zone starts shrinking!
 * Phase 3: 10-18 min rotation (480s)
 * Phase 4: 18-25 min mid-game rotation (420s)
 * Phase 5: 25-30 min endgame close fights (300s)
 * Phase 6: 30-35 min final showdown (300s)
 *
 * For playable game pacing, we provide a full config schedule.
 * In quick test/match sessions it can also scale, but default follows the configured 35m tournament rules.
 */
export const DEFAULT_SAFE_ZONE_PHASES: SafeZonePhase[] = [
  { phase: 1, warningDuration: 600, shrinkDuration: 180, damagePerSecond: 1.5, targetRadius: 400 }, // Minute 00-10 prep, starts shrinking at min 10
  { phase: 2, warningDuration: 180, shrinkDuration: 150, damagePerSecond: 3.0, targetRadius: 250 },
  { phase: 3, warningDuration: 150, shrinkDuration: 120, damagePerSecond: 6.0, targetRadius: 140 },
  { phase: 4, warningDuration: 120, shrinkDuration: 90, damagePerSecond: 10.0, targetRadius: 60 },
  { phase: 5, warningDuration: 60, shrinkDuration: 60, damagePerSecond: 16.0, targetRadius: 15 },
  { phase: 6, warningDuration: 30, shrinkDuration: 30, damagePerSecond: 25.0, targetRadius: 0 },
];

/**
 * Quick battle mode phase schedule for responsive mobile rounds
 */
export const FAST_SAFE_ZONE_PHASES: SafeZonePhase[] = [
  { phase: 1, warningDuration: 45, shrinkDuration: 30, damagePerSecond: 2.0, targetRadius: 280 },
  { phase: 2, warningDuration: 35, shrinkDuration: 25, damagePerSecond: 4.0, targetRadius: 170 },
  { phase: 3, warningDuration: 25, shrinkDuration: 20, damagePerSecond: 8.0, targetRadius: 90 },
  { phase: 4, warningDuration: 20, shrinkDuration: 15, damagePerSecond: 14.0, targetRadius: 35 },
  { phase: 5, warningDuration: 15, shrinkDuration: 15, damagePerSecond: 22.0, targetRadius: 0 },
];

/**
 * Calculates damage with armor and helmet reduction
 */
export function calculateDamage(
  rawDamage: number,
  isHeadshot: boolean,
  armorLevel: number, // 0, 1, 2, 3
  helmetLevel: number // 0, 1, 2, 3
): { finalHealthDamage: number; armorDamage: number; helmetDamage: number } {
  // Headshot multiplier: 2.0x for normal weapons
  const baseDamage = isHeadshot ? rawDamage * 2.0 : rawDamage;

  if (isHeadshot) {
    // Helmet reduction: Lv1: 30%, Lv2: 40%, Lv3: 55%
    const helmetReductions = [0, 0.30, 0.40, 0.55];
    const reduction = helmetReductions[Math.min(helmetLevel, 3)] || 0;
    const finalDamage = Math.max(1, Math.round(baseDamage * (1 - reduction)));
    const absorbed = baseDamage - finalDamage;
    return {
      finalHealthDamage: finalDamage,
      armorDamage: 0,
      helmetDamage: Math.round(absorbed),
    };
  } else {
    // Body shot with Tactical Vest: Lv1: 20%, Lv2: 35%, Lv3: 50%
    const armorReductions = [0, 0.20, 0.35, 0.50];
    const reduction = armorReductions[Math.min(armorLevel, 3)] || 0;
    const finalDamage = Math.max(1, Math.round(baseDamage * (1 - reduction)));
    const absorbed = baseDamage - finalDamage;
    return {
      finalHealthDamage: finalDamage,
      armorDamage: Math.round(absorbed),
      helmetDamage: 0,
    };
  }
}

/**
 * Checks whether coordinate (x, z) is inside the circle centered at (cx, cz) with radius r
 */
export function isInsideSafeZone(
  x: number,
  z: number,
  centerX: number,
  centerZ: number,
  radius: number
): boolean {
  const dx = x - centerX;
  const dz = z - centerZ;
  return dx * dx + dz * dz <= radius * radius;
}

/**
 * Updates safe zone interpolation based on elapsed delta time
 */
export function advanceSafeZone(
  state: SafeZoneState,
  phaseDefs: SafeZonePhase[],
  dt: number
): SafeZoneState {
  const currentPhaseDef = phaseDefs[state.phase - 1] || phaseDefs[phaseDefs.length - 1];
  let timeInPhase = state.timeInCurrentPhase + dt;
  let isShrinking = state.isShrinking;
  let currentRadius = state.currentRadius;
  let currentCenter = { ...state.currentCenter };
  let phase = state.phase;

  if (!isShrinking) {
    // In warning / countdown period
    if (timeInPhase >= currentPhaseDef.warningDuration) {
      isShrinking = true;
      timeInPhase = 0;
    }
  } else {
    // Currently shrinking
    const progress = Math.min(1, timeInPhase / currentPhaseDef.shrinkDuration);
    
    // Lerp radius
    const startRadius = phase === 1 ? 550 : phaseDefs[phase - 2]?.targetRadius || 400;
    currentRadius = startRadius + (currentPhaseDef.targetRadius - startRadius) * progress;

    // Lerp center
    currentCenter.x = state.currentCenter.x + (state.targetCenter.x - state.currentCenter.x) * (dt / Math.max(0.1, currentPhaseDef.shrinkDuration - (timeInPhase - dt)));
    currentCenter.z = state.currentCenter.z + (state.targetCenter.z - state.currentCenter.z) * (dt / Math.max(0.1, currentPhaseDef.shrinkDuration - (timeInPhase - dt)));

    if (progress >= 1) {
      // Completed this shrink phase!
      if (phase < phaseDefs.length) {
        phase += 1;
        isShrinking = false;
        timeInPhase = 0;
        currentRadius = currentPhaseDef.targetRadius;
        currentCenter = { ...state.targetCenter };

        // Generate next safe circle inside current target
        const nextDef = phaseDefs[phase - 1];
        const maxOffset = Math.max(0, currentRadius - nextDef.targetRadius);
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * maxOffset * 0.75;
        const targetCenter = {
          x: currentCenter.x + Math.cos(angle) * dist,
          z: currentCenter.z + Math.sin(angle) * dist,
        };

        return {
          ...state,
          phase,
          isShrinking: false,
          timeInCurrentPhase: 0,
          currentCenter,
          currentRadius,
          targetCenter,
          targetRadius: nextDef.targetRadius,
          damagePerSec: nextDef.damagePerSecond,
        };
      }
    }
  }

  return {
    ...state,
    phase,
    isShrinking,
    timeInCurrentPhase: timeInPhase,
    currentCenter,
    currentRadius,
  };
}

/**
 * Calculates backpack carrying capacity based on backpack level
 */
export function getBackpackCapacity(level: number): number {
  switch (level) {
    case 1:
      return 150;
    case 2:
      return 220;
    case 3:
      return 300;
    default:
      return 100; // Base inventory capacity without backpack
  }
}

/**
 * Calculates weapon recoil and bullet spread with attachments applied
 */
export function getEffectiveWeaponStats(
  weapon: WeaponDef,
  attachments?: {
    hasCompensator?: boolean;
    hasVerticalGrip?: boolean;
    hasExtendedMag?: boolean;
    opticZoom?: number;
  }
) {
  let effectiveRecoil = weapon.recoil;
  let effectiveSpread = weapon.spread;
  let effectiveMag = weapon.magazineCapacity;
  let zoom = attachments?.opticZoom || 1.0;

  if (attachments?.hasCompensator) {
    effectiveRecoil *= 0.75;
    effectiveSpread *= 0.8;
  }
  if (attachments?.hasVerticalGrip) {
    effectiveRecoil *= 0.8;
  }
  if (attachments?.hasExtendedMag) {
    effectiveMag = Math.round(weapon.magazineCapacity * 1.35);
  }

  return {
    damage: weapon.damage,
    fireRate: weapon.fireRate,
    magazineCapacity: effectiveMag,
    recoil: Number(effectiveRecoil.toFixed(2)),
    spread: Number(effectiveSpread.toFixed(3)),
    zoom,
  };
}

/**
 * Calculates XP and rank points from match achievements
 */
export function calculateMatchRewards(
  placement: number,
  kills: number,
  damage: number,
  survivalSeconds: number
) {
  // Placement points
  let placementXP = 50;
  let rankDelta = -10;

  if (placement === 1) {
    placementXP = 500;
    rankDelta = +45;
  } else if (placement <= 3) {
    placementXP = 300;
    rankDelta = +30;
  } else if (placement <= 5) {
    placementXP = 200;
    rankDelta = +18;
  } else if (placement <= 10) {
    placementXP = 120;
    rankDelta = +8;
  }

  const killXP = kills * 60;
  const killRank = kills * 5;
  const damageXP = Math.floor(damage * 0.2);
  const timeXP = Math.floor(survivalSeconds * 0.5);

  const totalXP = placementXP + killXP + damageXP + timeXP;
  const totalCredits = Math.floor(totalXP * 0.8) + (placement === 1 ? 250 : 50);
  const totalRankPoints = rankDelta + killRank + Math.floor(damage / 100);

  return {
    totalXP,
    totalCredits,
    totalRankPoints,
  };
}
