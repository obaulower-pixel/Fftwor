/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Gift, Sparkles, Coins, Check, X, RotateCw } from 'lucide-react';
import { soundManager } from '../game/audio';

interface WheelPrize {
  id: string;
  name: string;
  type: 'credits' | 'tokens' | 'xp' | 'skin';
  amount: number;
  color: string;
  label: string;
}

const PRIZES: WheelPrize[] = [
  { id: 'p1', name: '500 Credits', type: 'credits', amount: 500, color: '#1e293b', label: '+500 CR' },
  { id: 'p2', name: '10 Supply Tokens', type: 'tokens', amount: 10, color: '#0f766e', label: '+10 TOKENS' },
  { id: 'p3', name: '1,200 Credits', type: 'credits', amount: 1200, color: '#1e3a8a', label: '+1,200 CR' },
  { id: 'p4', name: '350 XP Boost', type: 'xp', amount: 350, color: '#4c1d95', label: '+350 XP' },
  { id: 'p5', name: '2,500 Credits', type: 'credits', amount: 2500, color: '#b45309', label: '+2,500 CR' },
  { id: 'p6', name: 'Rare Desert Camo', type: 'skin', amount: 1, color: '#065f46', label: 'DESERT SKIN' },
  { id: 'p7', name: '25 Supply Tokens', type: 'tokens', amount: 25, color: '#0369a1', label: '+25 TOKENS' },
  { id: 'p8', name: '750 Credits', type: 'credits', amount: 750, color: '#334155', label: '+750 CR' },
];

interface WheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimPrize: (prize: WheelPrize) => void;
}

export const WheelModal: React.FC<WheelModalProps> = ({ isOpen, onClose, onClaimPrize }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinAngle, setSpinAngle] = useState(0);
  const [wonPrize, setWonPrize] = useState<WheelPrize | null>(null);
  const [spinHistory, setSpinHistory] = useState<string[]>(['Initial Supply Drop (+500 CR)']);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw the wheel segments on canvas
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 10;
    const numPrizes = PRIZES.length;
    const arc = (Math.PI * 2) / numPrizes;

    ctx.clearRect(0, 0, size, size);

    // Save and rotate
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(spinAngle);

    // Draw slices
    PRIZES.forEach((prize, i) => {
      const angle = i * arc;
      ctx.beginPath();
      ctx.fillStyle = prize.color;
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, angle, angle + arc);
      ctx.lineTo(0, 0);
      ctx.fill();

      // Border line
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text label
      ctx.save();
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(prize.label, radius - 18, 4);
      ctx.restore();
    });

    // Center hub
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();

    // Top pointer needle
    ctx.beginPath();
    ctx.moveTo(center - 12, 10);
    ctx.lineTo(center + 12, 10);
    ctx.lineTo(center, 28);
    ctx.closePath();
    ctx.fillStyle = '#f97316';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [isOpen, spinAngle]);

  if (!isOpen) return null;

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWonPrize(null);

    // Random prize target
    const targetIndex = Math.floor(Math.random() * PRIZES.length);
    const numPrizes = PRIZES.length;
    const arc = (Math.PI * 2) / numPrizes;
    // Calculate rotation angle to align chosen prize under top pointer
    const targetAngle = Math.PI * 2 * 5 - (targetIndex * arc + arc / 2) - Math.PI / 2;

    const startAngle = spinAngle % (Math.PI * 2);
    const totalRotate = targetAngle + Math.PI * 2 * 4;
    const duration = 3800; // ms
    const startTime = performance.now();

    const animateSpin = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = startAngle + totalRotate * ease;
      setSpinAngle(current);

      if (progress < 1) {
        requestAnimationFrame(animateSpin);
      } else {
        setIsSpinning(false);
        const selected = PRIZES[targetIndex];
        setWonPrize(selected);
        setSpinHistory((prev) => [selected.name, ...prev.slice(0, 4)]);
        onClaimPrize(selected);
        soundManager.playLootPickup();
      }
    };

    requestAnimationFrame(animateSpin);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 md:p-6 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold uppercase tracking-wider text-white font-display">
              TACTICAL SUPPLY DROP WHEEL
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wheel & Action Area */}
        <div className="p-4 md:p-6 overflow-y-auto flex flex-col items-center">
          <div className="relative my-2">
            <canvas ref={canvasRef} width={280} height={280} className="rounded-full shadow-2xl border-4 border-slate-800" />
          </div>

          {wonPrize && (
            <div className="mt-4 bg-emerald-950/80 border border-emerald-500 rounded-xl px-6 py-2.5 text-center animate-bounce">
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase block">
                SUPPLY DROP SECURED!
              </span>
              <span className="text-base font-black text-white">{wonPrize.name}</span>
            </div>
          )}

          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className={`mt-5 px-8 py-3.5 rounded-xl text-base font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-xl ${
              isSpinning
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white active:scale-95'
            }`}
          >
            <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'CALCULATING DROP...' : 'SPIN SUPPLY WHEEL'}</span>
          </button>

          {/* Recent Drop History */}
          <div className="w-full mt-6 bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-widest mb-2">
              RECENT REWARD AIRDROPS
            </div>
            <div className="space-y-1">
              {spinHistory.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 font-mono">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
