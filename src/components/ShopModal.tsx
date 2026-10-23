/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShoppingBag, Coins, Sparkles, Check, AlertCircle, X } from 'lucide-react';
import { ItemRarity } from '../types/game';

interface ShopItem {
  id: string;
  name: string;
  category: string;
  rarity: ItemRarity;
  costCredits: number;
  costTokens: number;
  description: string;
}

const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'skin_cyber',
    name: 'Vanguard Cyber-Hex Camo',
    category: 'weapon_skin',
    rarity: 'legendary',
    costCredits: 3500,
    costTokens: 0,
    description: 'Bespoke luminescent tactical wrap for the AR-01 Vanguard.',
  },
  {
    id: 'outfit_night',
    name: 'Blackout Spec-Ops Fatigues',
    category: 'outfit',
    rarity: 'epic',
    costCredits: 2800,
    costTokens: 0,
    description: 'Non-reflective tactical combat uniform engineered for low-light ops.',
  },
  {
    id: 'para_skull',
    name: 'Grim Reaper Combat Parachute',
    category: 'parachute',
    rarity: 'legendary',
    costCredits: 4000,
    costTokens: 15,
    description: 'Custom airborne deployment chute with tactical stealth coating.',
  },
  {
    id: 'bag_reaper',
    name: 'Ghost Recon Assault Bag',
    category: 'backpack',
    rarity: 'epic',
    costCredits: 2200,
    costTokens: 0,
    description: 'Reinforced ballistic nylon tactical pack.',
  },
  {
    id: 'helmet_spartan',
    name: 'Valkyrie HUD Tactical Helmet',
    category: 'helmet',
    rarity: 'epic',
    costCredits: 2600,
    costTokens: 0,
    description: 'Enclosed combat helmet with high-contrast amber HUD lens.',
  },
  {
    id: 'bundle_frontline',
    name: 'Frontline Starter Bundle',
    category: 'bundle',
    rarity: 'rare',
    costCredits: 1800,
    costTokens: 0,
    description: 'Includes Desert Phantom Camo + 500 Credits bonus voucher.',
  },
];

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  credits: number;
  tokens: number;
  ownedItemIds: string[];
  onPurchase: (item: ShopItem) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  onClose,
  credits,
  tokens,
  ownedItemIds,
  onPurchase,
}) => {
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleBuy = (item: ShopItem) => {
    if (ownedItemIds.includes(item.id)) {
      setFeedback('You already own this item in your Vault.');
      return;
    }
    if (credits < item.costCredits || tokens < item.costTokens) {
      setFeedback('Insufficient Credits or Tokens to complete this requisition.');
      return;
    }

    onPurchase(item);
    setFeedback(`Successfully acquired ${item.name}! Added to your Vault.`);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 md:p-6 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold uppercase tracking-wider text-white font-display">
              MILITARY REQUISITION & SUPPLY SHOP
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Currency balance bar */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-6 py-2.5 flex items-center justify-between text-xs font-mono">
          <div className="text-slate-400">CURRENT OPERATOR BALANCE:</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Coins className="w-4 h-4" />
              <span>{credits.toLocaleString()} CREDITS</span>
            </div>
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>{tokens.toLocaleString()} TOKENS</span>
            </div>
          </div>
        </div>

        {/* Notification feedback */}
        {feedback && (
          <div className="bg-emerald-950/80 border-b border-emerald-800 px-6 py-2 text-xs text-emerald-300 font-mono flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Shop Items Grid */}
        <div className="p-4 md:p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {SHOP_ITEMS.map((item) => {
            const isOwned = ownedItemIds.includes(item.id);
            const canAfford = credits >= item.costCredits && tokens >= item.costTokens;

            return (
              <div
                key={item.id}
                className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                      {item.rarity}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono uppercase">
                      {item.category.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="font-bold text-white text-sm tracking-wide">{item.name}</div>
                  <p className="text-xs text-slate-400 mt-1 leading-snug">{item.description}</p>
                </div>

                <div className="pt-4">
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-slate-400">COST:</span>
                    <span className="font-bold text-amber-400 flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5" />
                      {item.costCredits.toLocaleString()}
                    </span>
                  </div>

                  {isOwned ? (
                    <button disabled className="w-full py-2 bg-emerald-950/60 text-emerald-400 border border-emerald-800/80 text-xs font-bold rounded-lg uppercase flex items-center justify-center gap-1 cursor-default">
                      <Check className="w-3.5 h-3.5" /> Owned in Vault
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuy(item)}
                      disabled={!canAfford}
                      className={`w-full py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors ${
                        canAfford
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                          : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? 'Requisition Item' : 'Insufficient Funds'}
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
