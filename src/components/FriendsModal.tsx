/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Users, UserPlus, Check, MessageSquare, Shield, Circle } from 'lucide-react';

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteToSquad: (friendName: string) => void;
}

interface FriendItem {
  id: string;
  name: string;
  status: 'online' | 'in-match' | 'offline';
  level: number;
  rank: string;
  invited?: boolean;
}

export const FriendsModal: React.FC<FriendsModalProps> = ({
  isOpen,
  onClose,
  onInviteToSquad,
}) => {
  const [friends, setFriends] = useState<FriendItem[]>([
    { id: 'f1', name: 'ShadowX', status: 'online', level: 12, rank: 'Platinum' },
    { id: 'f2', name: 'Razer99', status: 'online', level: 9, rank: 'Gold' },
    { id: 'f3', name: 'Velocity', status: 'in-match', level: 8, rank: 'Gold' },
    { id: 'f4', name: 'SigmaPro', status: 'offline', level: 14, rank: 'Diamond' },
    { id: 'f5', name: 'Frosty', status: 'offline', level: 5, rank: 'Silver' },
  ]);

  if (!isOpen) return null;

  const handleInvite = (id: string, name: string) => {
    setFriends((prev) =>
      prev.map((f) => (f.id === id ? { ...f, invited: true } : f))
    );
    onInviteToSquad(name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="w-full max-w-xl bg-[#091322] border border-cyan-500/40 rounded-3xl p-5 md:p-6 shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase font-display tracking-wide">
                OPERATIONAL SQUAD & FRIENDS
              </h2>
              <span className="text-xs text-cyan-400 font-mono">
                COOPERATIVE SQUAD FORMATION // 2-4 OPERATORS
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

        {/* Friends List */}
        <div className="py-4 space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
          {friends.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between p-3 bg-[#0b1728] border border-slate-700/80 rounded-2xl hover:border-slate-500 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs font-mono shadow relative">
                  {f.name.slice(0, 2).toUpperCase()}
                  <span
                    className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${
                      f.status === 'online'
                        ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                        : f.status === 'in-match'
                        ? 'bg-amber-400'
                        : 'bg-slate-600'
                    }`}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white font-mono">{f.name}</span>
                    <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/60 px-1.5 py-0.5 rounded">
                      Lv.{f.level}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {f.rank} Tier •{' '}
                    <span
                      className={
                        f.status === 'online'
                          ? 'text-emerald-400 font-semibold'
                          : f.status === 'in-match'
                          ? 'text-amber-400 font-semibold'
                          : 'text-slate-500'
                      }
                    >
                      {f.status === 'online' ? 'Lobby (Online)' : f.status === 'in-match' ? 'In Match (14 left)' : 'Offline'}
                    </span>
                  </span>
                </div>
              </div>

              {f.status === 'online' && (
                <button
                  onClick={() => handleInvite(f.id, f.name)}
                  disabled={f.invited}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shadow transition-all ${
                    f.invited
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/50 cursor-default'
                      : 'bg-cyan-600 hover:bg-cyan-500 text-white active:scale-95'
                  }`}
                >
                  {f.invited ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>INVITED</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>INVITE</span>
                    </>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Squad size: <strong className="text-white">1 / 4 Operators</strong></span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
