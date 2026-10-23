/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDamage,
  isInsideSafeZone,
  getBackpackCapacity,
  getEffectiveWeaponStats,
  calculateMatchRewards,
  advanceSafeZone,
  FAST_SAFE_ZONE_PHASES
} from './rules.ts';
import { WeaponDef } from '../types/game.ts';

test('calculateDamage handles body shot and armor mitigation correctly', () => {
  // 40 damage, no headshot, Lv0 armor
  const unarmored = calculateDamage(40, false, 0, 0);
  assert.equal(unarmored.finalHealthDamage, 40);
  assert.equal(unarmored.armorDamage, 0);

  // 40 damage, Lv2 armor (35% reduction) -> 40 * 0.65 = 26
  const armored = calculateDamage(40, false, 2, 0);
  assert.equal(armored.finalHealthDamage, 26);
  assert.equal(armored.armorDamage, 14);

  // Headshot with Lv3 helmet (55% reduction, 2x headshot multiplier)
  // Base: 40 * 2 = 80 -> 80 * 0.45 = 36
  const headshot = calculateDamage(40, true, 2, 3);
  assert.equal(headshot.finalHealthDamage, 36);
  assert.equal(headshot.helmetDamage, 44);
});

test('isInsideSafeZone returns true when within boundary and false outside', () => {
  assert.equal(isInsideSafeZone(0, 0, 0, 0, 100), true);
  assert.equal(isInsideSafeZone(50, 50, 0, 0, 100), true); // 50^2 + 50^2 = 5000 <= 10000
  assert.equal(isInsideSafeZone(90, 90, 0, 0, 100), false); // 90^2 + 90^2 = 16200 > 10000
});

test('getBackpackCapacity increases properly per level', () => {
  assert.equal(getBackpackCapacity(0), 100);
  assert.equal(getBackpackCapacity(1), 150);
  assert.equal(getBackpackCapacity(2), 220);
  assert.equal(getBackpackCapacity(3), 300);
});

test('getEffectiveWeaponStats handles attachments modifications', () => {
  const baseWeapon: WeaponDef = {
    id: 'ar_vanguard',
    name: 'AR-01 Vanguard',
    category: 'assault_rifle',
    ammoType: '5.56mm',
    damage: 32,
    fireRate: 600,
    magazineCapacity: 30,
    reloadTime: 2.2,
    recoil: 0.4,
    range: 150,
    spread: 0.05,
    bulletSpeed: 300,
    rarity: 'rare',
    description: 'Balanced assault rifle'
  };

  const modified = getEffectiveWeaponStats(baseWeapon, {
    hasCompensator: true,
    hasVerticalGrip: true,
    hasExtendedMag: true,
    opticZoom: 2.0
  });

  assert.equal(modified.magazineCapacity, 41); // 30 * 1.35 = 40.5 -> 41
  assert.equal(modified.zoom, 2.0);
  assert.ok(modified.recoil < baseWeapon.recoil);
});

test('calculateMatchRewards awards victory and kills appropriately', () => {
  const winner = calculateMatchRewards(1, 8, 1200, 900);
  assert.ok(winner.totalXP > 1000);
  assert.ok(winner.totalRankPoints >= 45);

  const eliminatedEarly = calculateMatchRewards(25, 0, 50, 60);
  assert.ok(eliminatedEarly.totalXP < 200);
});

test('advanceSafeZone correctly transitions from warning to shrinking', () => {
  const initial = {
    currentCenter: { x: 0, z: 0 },
    currentRadius: 400,
    targetCenter: { x: 0, z: 0 },
    targetRadius: 280,
    phase: 1,
    totalPhases: 5,
    timeInCurrentPhase: 0,
    isShrinking: false,
    nextShrinkTime: 45,
    damagePerSec: 2.0
  };

  // Before warning finishes (warning is 45s in fast phases)
  const step1 = advanceSafeZone(initial, FAST_SAFE_ZONE_PHASES, 10);
  assert.equal(step1.isShrinking, false);
  assert.equal(step1.timeInCurrentPhase, 10);

  // After warning expires
  const step2 = advanceSafeZone(step1, FAST_SAFE_ZONE_PHASES, 40);
  assert.equal(step2.isShrinking, true);
});
