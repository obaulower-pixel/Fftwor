/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type WeaponCategory =
  | 'assault_rifle'
  | 'submachine_gun'
  | 'shotgun'
  | 'sniper_rifle'
  | 'marksman_rifle'
  | 'pistol'
  | 'melee';

export type AmmoType = '5.56mm' | '7.62mm' | '9mm' | '12gauge' | '.300mag';

export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface WeaponDef {
  id: string;
  name: string;
  category: WeaponCategory;
  ammoType: AmmoType;
  damage: number;
  fireRate: number; // shots per minute
  magazineCapacity: number;
  reloadTime: number; // in seconds
  recoil: number; // 0 to 1
  range: number; // effective range in meters
  spread: number;
  bulletSpeed: number;
  rarity: ItemRarity;
  description: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'optic' | 'muzzle' | 'magazine' | 'grip';
  rarity: ItemRarity;
  statBonus: {
    recoilReduction?: number;
    zoomMultiplier?: number;
    magCapacityAdd?: number;
    spreadReduction?: number;
  };
}

export interface LootItem {
  id: string;
  type: 'weapon' | 'ammo' | 'armor' | 'helmet' | 'backpack' | 'medkit' | 'bandage' | 'grenade' | 'attachment';
  name: string;
  rarity: ItemRarity;
  weaponDefId?: string;
  ammoType?: AmmoType;
  amount: number;
  level?: number; // 1, 2, 3 for armor, helmet, backpack
  x: number;
  y: number;
  z: number;
}

export interface InventoryItem {
  id: string;
  type: LootItem['type'];
  name: string;
  rarity: ItemRarity;
  amount: number;
  weight: number;
  weaponDefId?: string;
  ammoType?: AmmoType;
  level?: number;
}

export interface OperatorProfile {
  id: string;
  name: string;
  callsign: string;
  role: string;
  specialAbility: string;
  healthBonus: number;
  speedBonus: number;
  avatarColor: string;
  unlocked: boolean;
  cost: number;
  spriteUrl?: string;
}

export interface PlayerStats {
  nickname: string;
  playerId: string;
  isGuest: boolean;
  level: number;
  xp: number;
  xpToNextLevel: number;
  credits: number;
  tokens: number;
  matchesPlayed: number;
  victories: number;
  totalKills: number;
  totalDamage: number;
  rankTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Ace' | 'Conqueror';
  rankPoints: number;
  selectedOperatorId: string;
  equippedWeaponSkin: Record<string, string>;
  equippedOutfit: string;
  equippedBackpackSkin: string;
  equippedHelmetSkin: string;
}

export type BotDifficulty = 'easy' | 'normal' | 'hard' | 'elite' | 'nightmare';

export type GameMode = 'solo' | 'duo' | 'squad' | 'ranked' | 'training' | 'bot_challenge';

export interface SafeZonePhase {
  phase: number;
  warningDuration: number; // seconds before shrink starts
  shrinkDuration: number; // seconds while shrinking
  damagePerSecond: number;
  targetRadius: number;
}

export interface SafeZoneState {
  currentCenter: { x: number; z: number };
  currentRadius: number;
  targetCenter: { x: number; z: number };
  targetRadius: number;
  phase: number;
  totalPhases: number;
  timeInCurrentPhase: number;
  isShrinking: boolean;
  nextShrinkTime: number;
  damagePerSec: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  rewardCredits: number;
  rewardXP: number;
  target: number;
  current: number;
  completed: boolean;
  claimed: boolean;
}

export interface GameSettings {
  graphicsQuality: 'low' | 'medium' | 'high' | 'ultra';
  renderDistance: number;
  cameraSensitivity: number;
  adsSensitivity: number;
  joystickSize: number;
  buttonOpacity: number;
  aimAssist: boolean;
  leftHanded: boolean;
  autoPickup: boolean;
  autoSprint: boolean;
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  botCount: number;
  botDifficulty: BotDifficulty;
}

export interface MatchResult {
  isVictory: boolean;
  placement: number;
  totalParticipants: number;
  kills: number;
  damageDealt: number;
  survivalSeconds: number;
  xpEarned: number;
  creditsEarned: number;
  rankPointsDelta: number;
  eliminatedBy?: string;
}
