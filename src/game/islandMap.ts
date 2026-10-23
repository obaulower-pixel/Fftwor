/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LootItem } from '../types/game';

export interface POI {
  id: string;
  name: string;
  x: number;
  z: number;
  lootTier: 'High' | 'Medium' | 'Low';
  dangerLevel: 'Extreme' | 'Moderate' | 'Safe';
  description: string;
}

export const FRONTIER_POIS: POI[] = [
  {
    id: 'military_base',
    name: 'Military Base Bravo',
    x: -80,
    z: -70,
    lootTier: 'High',
    dangerLevel: 'Extreme',
    description: 'Fortified military complex with aircraft hangars, underground bunkers, and high-tier military gear.',
  },
  {
    id: 'container_port',
    name: 'Container Port Delta',
    x: 95,
    z: -65,
    lootTier: 'High',
    dangerLevel: 'Extreme',
    description: 'Shipping harbor with dense stacks of shipping containers, narrow flanking corridors, and sniper perches.',
  },
  {
    id: 'radar_station',
    name: 'Outpost Radar Apex',
    x: -20,
    z: 110,
    lootTier: 'Medium',
    dangerLevel: 'Moderate',
    description: 'High-altitude communications tower and watchtowers with clear vantage over surrounding valleys.',
  },
  {
    id: 'industrial_refinery',
    name: 'Industrial Compound',
    x: 80,
    z: 75,
    lootTier: 'Medium',
    dangerLevel: 'Moderate',
    description: 'Processing plant with pipes, storage tanks, and industrial warehouses with balanced equipment.',
  },
  {
    id: 'abandoned_village',
    name: 'Frontier Settlement',
    x: -110,
    z: 60,
    lootTier: 'Medium',
    dangerLevel: 'Moderate',
    description: 'Residential houses and barns. Good early-game looting spot away from heavy drop zones.',
  },
  {
    id: 'center_ruins',
    name: 'Island Command Bunker',
    x: 0,
    z: 0,
    lootTier: 'High',
    dangerLevel: 'Extreme',
    description: 'Central command outpost. High risk intersection for mid-game rotations.',
  },
];

export interface MapObstacle {
  type: 'hangar' | 'watchtower' | 'container' | 'truck' | 'tree' | 'crate';
  x: number;
  z: number;
  rotation?: number;
  scale?: number;
  color?: string;
  radius: number; // Collision radius
}

export const MAP_OBSTACLES: MapObstacle[] = [
  // Military Base Bravo (-80, -70)
  { type: 'hangar', x: -80, z: -70, rotation: 0, radius: 12 },
  { type: 'hangar', x: -50, z: -75, rotation: 0.2, radius: 12 },
  { type: 'watchtower', x: -105, z: -90, radius: 2.8 },
  { type: 'watchtower', x: -55, z: -45, radius: 2.8 },
  { type: 'truck', x: -70, z: -55, rotation: 0.5, radius: 3.0 },
  { type: 'truck', x: -90, z: -60, rotation: -0.3, radius: 3.0 },
  { type: 'container', x: -65, z: -85, rotation: 0, color: '#1e3a8a', radius: 4.5 },
  { type: 'container', x: -65, z: -94, rotation: 0, color: '#b91c1c', radius: 4.5 },

  // Container Port Delta (95, -65)
  { type: 'watchtower', x: 120, z: -85, radius: 2.8 },
  { type: 'container', x: 80, z: -60, rotation: 0, color: '#b91c1c', radius: 4.5 },
  { type: 'container', x: 80, z: -70, rotation: 0, color: '#047857', radius: 4.5 },
  { type: 'container', x: 92, z: -60, rotation: 0, color: '#b45309', radius: 4.5 },
  { type: 'container', x: 92, z: -70, rotation: 0, color: '#1e3a8a', radius: 4.5 },
  { type: 'container', x: 104, z: -55, rotation: 1.57, color: '#b91c1c', radius: 4.5 },
  { type: 'container', x: 114, z: -55, rotation: 1.57, color: '#4338ca', radius: 4.5 },
  { type: 'truck', x: 75, z: -80, rotation: 1.2, radius: 3.0 },

  // Outpost Radar Apex (-20, 110)
  { type: 'watchtower', x: -20, z: 110, radius: 2.8 },
  { type: 'hangar', x: -35, z: 125, rotation: 1.57, radius: 12 },
  { type: 'truck', x: -10, z: 100, rotation: 2.1, radius: 3.0 },

  // Industrial Compound (80, 75)
  { type: 'hangar', x: 80, z: 75, rotation: 0.8, radius: 12 },
  { type: 'container', x: 65, z: 65, rotation: 0.5, color: '#374151', radius: 4.5 },
  { type: 'container', x: 75, z: 60, rotation: 0.5, color: '#b91c1c', radius: 4.5 },
  { type: 'watchtower', x: 95, z: 90, radius: 2.8 },

  // Center Ruins / Command Bunker (0, 0)
  { type: 'watchtower', x: 0, z: 0, radius: 2.8 },
  { type: 'container', x: -12, z: 10, rotation: 0.4, color: '#b45309', radius: 4.5 },
  { type: 'container', x: 14, z: -10, rotation: -0.4, color: '#1e3a8a', radius: 4.5 },
  { type: 'truck', x: 6, z: 14, rotation: 1.8, radius: 3.0 },

  // Pine Forest clusters across the island
  { type: 'tree', x: -30, z: -25, radius: 1.0 },
  { type: 'tree', x: -24, z: -32, radius: 1.0 },
  { type: 'tree', x: -38, z: -20, radius: 1.0 },
  { type: 'tree', x: 30, z: -30, radius: 1.0 },
  { type: 'tree', x: 42, z: -22, radius: 1.0 },
  { type: 'tree', x: -70, z: 20, radius: 1.0 },
  { type: 'tree', x: -80, z: 30, radius: 1.0 },
  { type: 'tree', x: -90, z: 15, radius: 1.0 },
  { type: 'tree', x: 40, z: 40, radius: 1.0 },
  { type: 'tree', x: 50, z: 30, radius: 1.0 },
  { type: 'tree', x: 25, z: 80, radius: 1.0 },
  { type: 'tree', x: -40, z: 70, radius: 1.0 },
];

/**
 * Generates initial ground loot across the island POIs
 */
export function generateIslandLoot(): LootItem[] {
  const lootList: LootItem[] = [];

  const weaponsCatalog = [
    { defId: 'ar_vanguard', name: 'AR-01 Vanguard', rarity: 'rare' as const, ammo: '5.56mm' as const },
    { defId: 'ar_raptor', name: 'AR-02 Raptor', rarity: 'epic' as const, ammo: '5.56mm' as const },
    { defId: 'ar_bastion', name: 'AR-03 Bastion', rarity: 'epic' as const, ammo: '7.62mm' as const },
    { defId: 'smg_viper', name: 'SMG-01 Viper', rarity: 'common' as const, ammo: '9mm' as const },
    { defId: 'smg_pulse', name: 'SMG-02 Pulse', rarity: 'rare' as const, ammo: '9mm' as const },
    { defId: 'sg_breacher', name: 'SG-01 Breacher', rarity: 'common' as const, ammo: '12gauge' as const },
    { defId: 'sr_longwatch', name: 'SR-01 Longwatch', rarity: 'legendary' as const, ammo: '.300mag' as const },
    { defId: 'dmr_sentinel', name: 'DMR-01 Sentinel', rarity: 'epic' as const, ammo: '7.62mm' as const },
    { defId: 'hg_compact', name: 'HG-01 Compact', rarity: 'common' as const, ammo: '9mm' as const },
  ];

  // Spawn around each POI
  let lootId = 1;
  FRONTIER_POIS.forEach((poi) => {
    const count = poi.lootTier === 'High' ? 10 : 6;
    for (let i = 0; i < count; i++) {
      const offsetX = (Math.random() - 0.5) * 35;
      const offsetZ = (Math.random() - 0.5) * 35;
      const x = poi.x + offsetX;
      const z = poi.z + offsetZ;

      const roll = Math.random();
      if (roll < 0.4) {
        // Weapon drop
        const wp = weaponsCatalog[Math.floor(Math.random() * weaponsCatalog.length)];
        lootList.push({
          id: `loot_${lootId++}`,
          type: 'weapon',
          name: wp.name,
          rarity: wp.rarity,
          weaponDefId: wp.defId,
          ammoType: wp.ammo,
          amount: 1,
          x,
          y: 0.3,
          z,
        });
      } else if (roll < 0.6) {
        // Ammo drop
        const ammoTypes: Array<{ type: '5.56mm' | '7.62mm' | '9mm' | '12gauge'; name: string }> = [
          { type: '5.56mm', name: '5.56mm NATO Ammo' },
          { type: '7.62mm', name: '7.62mm Heavy Ammo' },
          { type: '9mm', name: '9mm Subsonic Ammo' },
          { type: '12gauge', name: '12-Gauge Shells' },
        ];
        const selected = ammoTypes[Math.floor(Math.random() * ammoTypes.length)];
        lootList.push({
          id: `loot_${lootId++}`,
          type: 'ammo',
          name: selected.name,
          rarity: 'common',
          ammoType: selected.type,
          amount: selected.type === '12gauge' ? 12 : 60,
          x,
          y: 0.2,
          z,
        });
      } else if (roll < 0.75) {
        // Armor / Helmet
        const level = Math.random() > 0.6 ? 2 : 1;
        const isArmor = Math.random() > 0.5;
        lootList.push({
          id: `loot_${lootId++}`,
          type: isArmor ? 'armor' : 'helmet',
          name: isArmor ? `Tactical Vest Lv.${level}` : `Kevlar Helmet Lv.${level}`,
          rarity: level === 2 ? 'rare' : 'common',
          amount: 1,
          level,
          x,
          y: 0.2,
          z,
        });
      } else if (roll < 0.9) {
        // Medkit / Bandage
        const isMed = Math.random() > 0.5;
        lootList.push({
          id: `loot_${lootId++}`,
          type: isMed ? 'medkit' : 'bandage',
          name: isMed ? 'Tactical Medkit (+75 HP)' : 'Field Bandages (+25 HP)',
          rarity: isMed ? 'rare' : 'common',
          amount: isMed ? 1 : 4,
          x,
          y: 0.2,
          z,
        });
      } else {
        // Backpack
        const level = Math.random() > 0.7 ? 2 : 1;
        lootList.push({
          id: `loot_${lootId++}`,
          type: 'backpack',
          name: `Tactical Rucksack Lv.${level}`,
          rarity: level === 2 ? 'rare' : 'common',
          amount: 1,
          level,
          x,
          y: 0.2,
          z,
        });
      }
    }
  });

  return lootList;
}
