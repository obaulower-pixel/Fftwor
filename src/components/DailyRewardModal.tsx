/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Gift, Check, Coins, Sparkles, Shield, Award } from 'lucide-react';
import { soundManager } from '../game/audio';

interface DailyRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimReward: (credits: number, tokens: number) => void;
}

const REWARDS_SCHEDULE = [
  { day: 1, type: 'credits', amount: 500, label: '500 Gold', icon: <Coins className="w-6 h-6 text-amber-400" /> },
  { day: 2, type: 'tokens', amount: 20, label: '20 Gems', icon: <Sparkles className="w-6 h-6 text-cyan-400" /> },
  { day: 3, type: 'credits', amount: 750, label: '750 Gold', icon: <Coins className="w-6 h-6 text-amber-400" /> },
  { day: 4, type: 'tokens', amount: 35, label: '35 Gems', icon: <Sparkles className="w-6 h-6 text-cyan-400" /> },
  { day: 5, type: 'credits', amount: 1200, label: '1,200 Gold', icon: <Coins className="w-6 h-6 text-amber-400" /> },
  { day: 6, type: 'tokens', amount: 50, label: '50 Gems', icon: <Sparkles className="w-6 h-6 text-cyan-400" /> },
  { day: 7, type: 'special', amount: 2500, tokens: 100, label: 'Legendary Kai Pack', icon: <Award className="w-6 h-6 text-emerald-400" /> },
];

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({
  isOpen,
  onClose,
  onClaimReward,
}) => {
  const [claimedDay, setClaimedDay] = useState(1);
  const [hasClaimedToday, setHasClaimedToday] = useState(false);

  if (!isOpen) return null;

  const handleClaim = () => {
    if (hasClaimedToday) return;
    const cur = REWARDS_SCHEDULE[claimedDay - 1];
    soundManager.playVictoryFanfare();
    if (cur.type === 'credits') {
      onClaimReward(cur.amount, 0);
    } else if (cur.type === 'tokens') {
      onClaimReward(0, cur.amount);
    } else {
      onClaimReward(cur.amount, cur.tokens || 50);
    }
    setHasClaimedToday(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl bg-[#091322] border border-cyan-500/40 rounded-3xl p-5 md:p-6 shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-400">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase font-display tracking-wide">
                DAILY FRONTIER REWARDS
              </h2>
              <span className="text-xs text-amber-400 font-mono">
                CONSECUTIVE LOGIN BONUSES // 7-DAY PROTOCOL
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 7-Day Rewards List */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 py-6">
          {REWARDS_SCHEDULE.map((item) => {
            const isToday = item.day === claimedDay;
            const isPast = item.day < claimedDay || (isToday && hasClaimedToday);

            return (
              <div
                key={item.day}
                className={`flex flex-col items-center justify-between rounded-2xl p-3 border text-center transition-all ${
                  isToday && !hasClaimedToday
                    ? 'bg-gradient-to-b from-amber-500/20 to-slate-900 border-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.3)] scale-105'
                    : isPast
                    ? 'bg-slate-900/40 border-slate-800 opacity-60'
                    : 'bg-slate-900/70 border-slate-800'
                }`}
              >
                <span className="text-[10px] font-mono font-bold text-slate-400 mb-2">
                  DAY {item.day}
                </span>

                <div className="w-12 h-12 rounded-xl bg-slate-800/80 flex items-center justify-center my-1 shadow-inner">
                  {isPast ? <Check className="w-6 h-6 text-emerald-400 stroke-[3]" /> : item.icon}
                </div>

                <span className="text-[11px] font-mono font-bold text-white mt-2 leading-tight">
                  {item.label}
                </span>

                <span className="text-[9px] font-mono mt-2 text-slate-500">
                  {isPast ? 'CLAIMED' : isToday ? 'TODAY' : 'LOCKED'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Claim Button */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            {hasClaimedToday
              ? '✓ Today\'s reward claimed! Next reward available in 14h 22m.'
              : 'Claim your Day 1 bonus supplies to gear up for the battlefield!'}
          </span>

          <button
            onClick={handleClaim}
            disabled={hasClaimedToday}
            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-wider font-mono shadow transition-all ${
              hasClaimedToday
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 active:scale-95'
            }`}
          >
            {hasClaimedToday ? 'CLAIMED TODAY' : 'CLAIM TODAY\'S REWARD'}
          </button>
        </div>
      </div>
    </div>
  );
};
