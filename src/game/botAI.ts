/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { BotDifficulty, WeaponDef } from '../types/game';
import { WEAPON_DATABASE } from './weapons';
import { createOperatorMesh, OperatorMeshGroup } from './proceduralModels';
import { isInsideSafeZone } from './rules';

export interface BotState {
  id: string;
  name: string;
  difficulty: BotDifficulty;
  health: number;
  maxHealth: number;
  armorLevel: number;
  helmetLevel: number;
  weapon: WeaponDef;
  ammo: number;
  isAlive: boolean;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotationY: number;
  targetRotationY: number;
  mesh: OperatorMeshGroup;
  currentAction: 'patrol' | 'loot' | 'chase' | 'attack' | 'retreat_heal' | 'zone_run';
  targetPosition: THREE.Vector3;
  targetEntityId: string | null;
  lastShotTime: number;
  healCooldown: number;
  reactionTimer: number;
  accuracyMultiplier: number;
  speed: number;
}

export const BOT_NAMES = [
  'Ghost_Alpha',
  'Viper_77',
  'Shadow_Raven',
  'Iron_Wolf',
  'Delta_Echo',
  'Cobra_99',
  'Reaper_X',
  'Tactical_Doc',
  'Nomad_Sniper',
  'Apex_Hunter',
  'Havoc_11',
  'Zero_Point',
  'Vortex_Unit',
  'Thunder_88',
  'Striker_Bravo',
];

export function createBot(
  id: string,
  name: string,
  difficulty: BotDifficulty,
  spawnX: number,
  spawnZ: number,
  camoColor = '#3a4435'
): BotState {
  const mesh = createOperatorMesh(camoColor, '#1f241d', '#bf9368');
  mesh.position.set(spawnX, 0, spawnZ);

  // Difficulty parameters
  let accuracy = 0.5;
  let reaction = 0.6;
  let speed = 4.2;

  switch (difficulty) {
    case 'easy':
      accuracy = 0.35;
      reaction = 0.9;
      speed = 3.6;
      break;
    case 'normal':
      accuracy = 0.55;
      reaction = 0.55;
      speed = 4.2;
      break;
    case 'hard':
      accuracy = 0.72;
      reaction = 0.35;
      speed = 4.6;
      break;
    case 'elite':
      accuracy = 0.85;
      reaction = 0.22;
      speed = 5.0;
      break;
    case 'nightmare':
      accuracy = 0.92;
      reaction = 0.12;
      speed = 5.2;
      break;
  }

  const defaultWeapons = ['ar_vanguard', 'ar_raptor', 'smg_viper', 'sg_breacher', 'dmr_sentinel'];
  const chosenWp = WEAPON_DATABASE[defaultWeapons[Math.floor(Math.random() * defaultWeapons.length)]];

  return {
    id,
    name,
    difficulty,
    health: 100,
    maxHealth: 100,
    armorLevel: difficulty === 'nightmare' ? 2 : difficulty === 'elite' ? 1 : Math.random() > 0.5 ? 1 : 0,
    helmetLevel: difficulty === 'nightmare' ? 2 : 1,
    weapon: chosenWp,
    ammo: chosenWp.magazineCapacity * 4,
    isAlive: true,
    position: new THREE.Vector3(spawnX, 0, spawnZ),
    velocity: new THREE.Vector3(),
    rotationY: Math.random() * Math.PI * 2,
    targetRotationY: 0,
    mesh,
    currentAction: 'patrol',
    targetPosition: new THREE.Vector3(spawnX + (Math.random() - 0.5) * 40, 0, spawnZ + (Math.random() - 0.5) * 40),
    targetEntityId: null,
    lastShotTime: 0,
    healCooldown: 0,
    reactionTimer: 0,
    accuracyMultiplier: accuracy,
    speed,
  };
}

export interface BotDecisionOutput {
  shouldShoot: boolean;
  shootDirection: THREE.Vector3 | null;
  hitTarget: boolean;
  damage: number;
  isHeadshot: boolean;
}

/**
 * Updates bot AI logic, state transitions, movement, and combat targeting
 */
export function updateBotAI(
  bot: BotState,
  dt: number,
  playerPosition: THREE.Vector3,
  playerIsAlive: boolean,
  safeZoneCenter: { x: number; z: number },
  safeZoneRadius: number,
  allBots: BotState[],
  currentTime: number
): BotDecisionOutput {
  const result: BotDecisionOutput = {
    shouldShoot: false,
    shootDirection: null,
    hitTarget: false,
    damage: 0,
    isHeadshot: false,
  };

  if (!bot.isAlive) return result;

  // 1. Safe Zone Check: If outside safe circle, prioritize moving towards safe zone center
  const inZone = isInsideSafeZone(bot.position.x, bot.position.z, safeZoneCenter.x, safeZoneCenter.z, safeZoneRadius * 0.95);
  if (!inZone) {
    bot.currentAction = 'zone_run';
    bot.targetPosition.set(safeZoneCenter.x, 0, safeZoneCenter.z);
  }

  // 2. Health check: if HP < 35% and has cover, attempt heal
  if (bot.health < 35 && bot.healCooldown <= 0 && bot.currentAction !== 'zone_run') {
    bot.currentAction = 'retreat_heal';
    bot.healCooldown = 8.0; // seconds before can heal again
    bot.health = Math.min(bot.maxHealth, bot.health + 40);
  }
  if (bot.healCooldown > 0) {
    bot.healCooldown -= dt;
  }

  // 3. Target Detection (Player and other bots)
  let closestTargetPos: THREE.Vector3 | null = null;
  let minDistance = 9999;
  let isTargetPlayer = false;

  // Check player distance
  if (playerIsAlive) {
    const distToPlayer = bot.position.distanceTo(playerPosition);
    const visionRange = bot.difficulty === 'nightmare' ? 95 : bot.difficulty === 'elite' ? 80 : 65;

    if (distToPlayer < visionRange) {
      closestTargetPos = playerPosition;
      minDistance = distToPlayer;
      isTargetPlayer = true;
    }
  }

  // Check other rival bots
  for (const other of allBots) {
    if (other.id !== bot.id && other.isAlive) {
      const d = bot.position.distanceTo(other.position);
      if (d < minDistance && d < 55) {
        minDistance = d;
        closestTargetPos = other.position;
        isTargetPlayer = false;
      }
    }
  }

  // 4. State Decision
  if (closestTargetPos && bot.currentAction !== 'zone_run') {
    if (minDistance < bot.weapon.range * 0.75) {
      bot.currentAction = 'attack';
    } else {
      bot.currentAction = 'chase';
      bot.targetPosition.copy(closestTargetPos);
    }
  } else if (bot.currentAction !== 'zone_run') {
    // Wander/Patrol
    if (bot.position.distanceTo(bot.targetPosition) < 3.0) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 15 + Math.random() * 25;
      bot.targetPosition.set(bot.position.x + Math.cos(angle) * dist, 0, bot.position.z + Math.sin(angle) * dist);
    }
  }

  // 5. Movement towards target position or strafing while attacking
  const moveDir = new THREE.Vector3();
  if (bot.currentAction === 'attack' && closestTargetPos) {
    // Face target directly
    const lookAngle = Math.atan2(closestTargetPos.x - bot.position.x, closestTargetPos.z - bot.position.z);
    bot.targetRotationY = lookAngle;

    // Tactical strafe left/right while in firefight
    const strafeAngle = lookAngle + Math.PI / 2;
    const strafeSide = Math.sin(currentTime * 2.5) > 0 ? 1 : -1;
    moveDir.set(Math.sin(strafeAngle) * strafeSide, 0, Math.cos(strafeAngle) * strafeSide);

    // Shooting execution
    const shotInterval = 60 / bot.weapon.fireRate;
    if (currentTime - bot.lastShotTime >= shotInterval) {
      bot.lastShotTime = currentTime;
      result.shouldShoot = true;

      const aimDir = new THREE.Vector3()
        .subVectors(closestTargetPos, bot.position)
        .normalize();

      // Add realistic spread inversely proportional to difficulty accuracy
      const spreadAmount = bot.weapon.spread * (1.8 - bot.accuracyMultiplier);
      aimDir.x += (Math.random() - 0.5) * spreadAmount;
      aimDir.z += (Math.random() - 0.5) * spreadAmount;
      aimDir.normalize();

      result.shootDirection = aimDir;

      // Hit chance test
      const hitRoll = Math.random();
      if (hitRoll < bot.accuracyMultiplier && isTargetPlayer) {
        result.hitTarget = true;
        const headRoll = Math.random();
        result.isHeadshot = headRoll < (bot.difficulty === 'nightmare' ? 0.35 : 0.15);
        result.damage = bot.weapon.damage;
      }
    }
  } else {
    // Moving towards target position
    moveDir.subVectors(bot.targetPosition, bot.position).normalize();
    bot.targetRotationY = Math.atan2(moveDir.x, moveDir.z);
  }

  // Smooth rotation
  let diff = bot.targetRotationY - bot.rotationY;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  bot.rotationY += diff * Math.min(1, dt * 8);

  // Apply velocity
  const currentSpeed = bot.currentAction === 'zone_run' ? bot.speed * 1.25 : bot.speed;
  bot.velocity.copy(moveDir).multiplyScalar(currentSpeed);
  bot.position.addScaledVector(bot.velocity, dt);

  // Update 3D mesh position & leg walk animation
  bot.mesh.position.copy(bot.position);
  bot.mesh.rotation.y = bot.rotationY;

  bot.mesh.animTime += dt * (bot.velocity.length() > 0.1 ? 8 : 1.5);
  const walkCycle = Math.sin(bot.mesh.animTime);

  if (bot.velocity.length() > 0.1) {
    bot.mesh.parts.leftLeg.rotation.x = walkCycle * 0.6;
    bot.mesh.parts.rightLeg.rotation.x = -walkCycle * 0.6;
    bot.mesh.parts.leftArm.rotation.x = -walkCycle * 0.4;
  } else {
    bot.mesh.parts.leftLeg.rotation.x = 0;
    bot.mesh.parts.rightLeg.rotation.x = 0;
    bot.mesh.parts.leftArm.rotation.x = 0.2;
  }

  // Keep right arm raised aiming weapon
  bot.mesh.parts.rightArm.rotation.x = -Math.PI / 3;

  return result;
}
