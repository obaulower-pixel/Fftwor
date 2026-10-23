/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Package, Shield, Sparkles, Check, Lock, X } from 'lucide-react';
import { ItemRarity } from '../types/game';

interface VaultItem {
  id: string;
  name: string;
  category: 'outfit' | 'weapon_skin' | 'helmet' | 'backpack' | 'parachute';
  rarity: ItemRarity;
  description: string;
}

const VAULT_ITEMS: VaultItem[] = [
  { id: 'outfit_desert', name: 'Desert Phantom Camo', category: 'outfit', rarity: 'rare', description: 'Arid climate tactical fatigues.' },
  { id: 'outfit_night', name: 'Blackout Spec-Ops', category: 'outfit', rarity: 'epic', description: 'Anti-reflection urban tactical suit.' },
  { id: 'outfit_jungle', name: 'Jungle Stalker', category: 'outfit', rarity: 'common', description: 'Standard woodland disruptive pattern.' },

  { id: 'skin_cyber', name: 'Vanguard Cyber-Hex', category: 'weapon_skin', rarity: 'legendary', description: 'High-tech hexagonal luminescent finish.' },
  { id: 'skin_gold', name: 'Bastion Gilded Elite', category: 'weapon_skin', rarity: 'epic', description: 'Polished gold leaf and carbon fiber.' },
  { id: 'skin_matte', name: 'Viper Slate Grey', category: 'weapon_skin', rarity: 'common', description: 'Matte corrosion-resistant cerakote coating.' },

  { id: 'helmet_carbon', name: 'Carbon Fiber Kevlar', category: 'helmet', rarity: 'rare', description: 'Lightweight high-velocity ballistic shell.' },
  { id: 'helmet_spartan', name: 'Valkyrie Visor Helmet', category: 'helmet', rarity: 'epic', description: 'Enclosed heads-up display tactical helmet.' },

  { id: 'bag_assault', name: 'MOLLE Assault Pack', category: 'backpack', rarity: 'rare', description: 'Reinforced webbing pack with quick-release.' },
  { id: 'bag_reaper', name: 'Ghost Recon Rucksack', category: 'backpack', rarity: 'epic', description: 'Waterproof high-capacity tactical bag.' },

  { id: 'para_skull', name: 'Grim Reaper Parachute', category: 'parachute', rarity: 'legendary', description: 'Stealth canopy deployment chute.' },
  { id: 'para_camo', name: 'Military Olive Canopy', category: 'parachute', rarity: 'common', description: 'Standard airborne military chute.' },
];

interface VaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownedItemIds: string[];
  equippedItems: Record<string, string>;
  onEquipItem: (category: string, itemId: string) => void;
}

export const VaultModal: React.FC<VaultModalProps> = ({
  isOpen,
  onClose,
  ownedItemIds,
  equippedItems,
  onEquipItem,
}) => {
  const [activeTab, setActiveTab] = useState<'outfit' | 'weapon_skin' | 'helmet' | 'backpack' | 'parachute'>('outfit');

  if (!isOpen) return null;

  const filteredItems = VAULT_ITEMS.filter((i) => i.category === activeTab);

  const getRarityBadge = (rarity: ItemRarity) => {
    switch (rarity) {
      case 'legendary':
        return 'text-amber-400 bg-amber-950/70 border-amber-600/70';
      case 'epic':
        return 'text-purple-400 bg-purple-950/70 border-purple-600/70';
      case 'rare':
        return 'text-blue-400 bg-blue-950/70 border-blue-600/70';
      default:
        return 'text-emerald-400 bg-emerald-950/70 border-emerald-600/70';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 md:p-6 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold uppercase tracking-wider text-white font-display">
              TACTICAL VAULT & COSMETICS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-800/60 overflow-x-auto text-xs font-mono">
          {[
            { id: 'outfit', label: 'OUTFITS' },
            { id: 'weapon_skin', label: 'WEAPON SKINS' },
            { id: 'helmet', label: 'HELMETS' },
            { id: 'backpack', label: 'BACKPACKS' },
            { id: 'parachute', label: 'PARACHUTES' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2.5 px-3 font-bold border-b-2 uppercase whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Item Grid */}
        <div className="p-4 md:p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredItems.map((item) => {
            const isOwned = ownedItemIds.includes(item.id) || item.rarity === 'common';
            const isEquipped = equippedItems[item.category] === item.id;

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                  isEquipped
                    ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${getRarityBadge(item.rarity)}`}>
                      {item.rarity}
                    </span>
                    {!isOwned && (
                      <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                        <Lock className="w-3 h-3 text-amber-400" /> LOCKED
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-white text-sm tracking-wide">{item.name}</div>
                  <p className="text-xs text-slate-400 mt-1 leading-snug">{item.description}</p>
                </div>

                <div className="pt-3">
                  {isEquipped ? (
                    <button disabled className="w-full py-1.5 bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold rounded-lg uppercase flex items-center justify-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Equipped
                    </button>
                  ) : isOwned ? (
                    <button
                      onClick={() => onEquipItem(item.category, item.id)}
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg uppercase transition-colors"
                    >
                      Equip
                    </button>
                  ) : (
                    <button disabled className="w-full py-1.5 bg-slate-800 text-slate-400 text-xs font-bold rounded-lg uppercase border border-slate-700 cursor-not-allowed">
                      Find in Crates / Shop
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
