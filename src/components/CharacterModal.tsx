import React, { useState } from 'react';
import { User, Shield, Zap, Heart, Check, Lock, X, PlayCircle } from 'lucide-react';
import { OPERATOR_ROSTER } from '../game/weapons';
import { CharacterSprite } from './CharacterSprite';

interface CharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOperatorId: string;
  unlockedOperators: string[];
  credits: number;
  onSelectOperator: (id: string) => void;
  onUnlockOperator: (id: string, cost: number) => void;
}

export const CharacterModal: React.FC<CharacterModalProps> = ({
  isOpen,
  onClose,
  selectedOperatorId,
  unlockedOperators,
  credits,
  onSelectOperator,
  onUnlockOperator,
}) => {
  const [spriteAnim, setSpriteAnim] = useState<'idle' | 'walk' | 'run' | 'jump' | 'crouch'>('idle');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 md:p-6 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold uppercase tracking-wider text-white font-display">
              OPERATOR ROSTER & ATTRIBUTES
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Operators List */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {OPERATOR_ROSTER.map((op) => {
              const isUnlocked = unlockedOperators.includes(op.id) || op.cost === 0;
              const isSelected = selectedOperatorId === op.id;
              const hasSprite = Boolean(op.spriteUrl);

              return (
                <div
                  key={op.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {hasSprite ? (
                          <div className="w-12 h-12 rounded-xl bg-slate-950/90 border border-emerald-500/60 overflow-hidden flex items-center justify-center shadow-lg">
                            <CharacterSprite animation={spriteAnim} size={48} className="scale-125" />
                          </div>
                        ) : (
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-xs border"
                            style={{ backgroundColor: op.avatarColor, borderColor: '#ffffff40' }}
                          >
                            {op.callsign.slice(0, 2)}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-white uppercase text-sm tracking-wide flex items-center gap-1.5">
                            {op.name}
                            {hasSprite && (
                              <span className="text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-1 rounded">
                                CUSTOM HERO
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-mono text-emerald-400 tracking-widest">{op.callsign} // {op.role}</div>
                        </div>
                      </div>
                      {isSelected ? (
                        <span className="text-[10px] font-mono font-bold bg-emerald-500 text-black px-2 py-0.5 rounded">
                          EQUIPPED
                        </span>
                      ) : !isUnlocked ? (
                        <span className="text-[10px] font-mono flex items-center gap-1 bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                          <Lock className="w-3 h-3 text-amber-400" />
                          {op.cost.toLocaleString()} CREDITS
                        </span>
                      ) : null}
                    </div>

                    {/* Sprite Animation Preview Controls for op_shadow */}
                    {hasSprite && (
                      <div className="my-2 p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CharacterSprite animation={spriteAnim} size={64} />
                          <div className="text-[11px] text-slate-300">
                            <div className="font-bold text-white font-mono uppercase">Tactical Chibi Sprite</div>
                            <div className="text-[9px] text-slate-400">Black Hijab & Cargo Pants</div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 max-w-[150px] justify-end">
                          {(['idle', 'walk', 'run', 'jump', 'crouch'] as const).map((mode) => (
                            <button
                              key={mode}
                              onClick={() => setSpriteAnim(mode)}
                              className={`px-1.5 py-0.5 text-[9px] uppercase font-mono rounded font-bold transition-colors ${
                                spriteAnim === mode
                                  ? 'bg-emerald-500 text-black'
                                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              }`}
                            >
                              {mode}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ability & Stats */}
                    <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 my-3 text-xs space-y-2">
                      <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>SPECIAL: {op.specialAbility}</span>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-rose-400" />
                          <span>HP Bonus: +{op.healthBonus}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Shield className="w-3 h-3 text-cyan-400" />
                          <span>Mobility: x{op.speedBonus.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="pt-2">
                    {isSelected ? (
                      <button disabled className="w-full py-2 bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-xs font-bold rounded-lg uppercase tracking-wider flex items-center justify-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Currently Deployed
                      </button>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => onSelectOperator(op.id)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg uppercase tracking-wider shadow transition-colors"
                      >
                        Equip Operator
                      </button>
                    ) : (
                      <button
                        onClick={() => onUnlockOperator(op.id, op.cost)}
                        disabled={credits < op.cost}
                        className={`w-full py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors ${
                          credits >= op.cost
                            ? 'bg-amber-600 hover:bg-amber-500 text-white shadow'
                            : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                        }`}
                      >
                        {credits >= op.cost ? `Unlock for ${op.cost.toLocaleString()} Credits` : 'Insufficient Credits'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
