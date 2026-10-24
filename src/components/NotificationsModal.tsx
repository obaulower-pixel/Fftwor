/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Mail, Bell, CheckCircle2 } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MESSAGES = [
  {
    id: 'n1',
    title: 'Frontier Season 2: Cyber Reckoning is Live!',
    time: '2 hours ago',
    desc: 'Battle through 50 tiers of tactical cosmetics, weapon blueprints, and unlock Kai "Ghost" Sterling vanguard loadout.',
    read: false,
  },
  {
    id: 'n2',
    title: 'Daily Supply Drop Calibrated',
    time: '1 day ago',
    desc: 'Container Port Delta and Research Facility Bravo have received refreshed high-tier supply drop frequencies.',
    read: true,
  },
  {
    id: 'n3',
    title: 'Tournament Safe-Zone Update V2.4.0',
    time: '3 days ago',
    desc: 'Zone phase transitions have been accelerated by 15% for intense endgame rotations and tactical CQB.',
    read: true,
  },
];

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="w-full max-w-lg bg-[#091322] border border-cyan-500/40 rounded-3xl p-5 md:p-6 shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase font-display tracking-wide">
                TACTICAL COMM CENTER
              </h2>
              <span className="text-xs text-cyan-400 font-mono">
                MILITARY DIRECTIVES & EVENT ANNOUNCEMENTS
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

        {/* Message List */}
        <div className="py-4 space-y-3 max-h-[50vh] overflow-y-auto pr-1">
          {MESSAGES.map((msg) => (
            <div
              key={msg.id}
              className={`p-3.5 rounded-2xl border transition-colors ${
                !msg.read
                  ? 'bg-cyan-950/30 border-cyan-500/50'
                  : 'bg-[#0b1728] border-slate-700/80'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white font-mono flex items-center gap-2">
                  {!msg.read && <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff]" />}
                  {msg.title}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{msg.time}</span>
              </div>
              <p className="text-xs text-slate-300 font-mono leading-relaxed">{msg.desc}</p>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-mono"
          >
            Mark All as Read
          </button>
        </div>
      </div>
    </div>
  );
};
