/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings as SettingsIcon, Monitor, Sliders, Volume2, Gamepad2, X, RotateCcw } from 'lucide-react';
import { GameSettings } from '../types/game';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'graphics' | 'controls' | 'audio' | 'gameplay'>('graphics');

  if (!isOpen) return null;

  const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    onUpdateSettings({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 md:p-6 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold uppercase tracking-wider text-white font-display">
              SETTINGS & SYSTEM CONFIG
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab strip */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800/60 text-xs font-mono">
          {[
            { id: 'graphics', label: 'GRAPHICS', icon: <Monitor className="w-3.5 h-3.5" /> },
            { id: 'controls', label: 'CONTROLS', icon: <Gamepad2 className="w-3.5 h-3.5" /> },
            { id: 'audio', label: 'AUDIO', icon: <Volume2 className="w-3.5 h-3.5" /> },
            { id: 'gameplay', label: 'GAMEPLAY', icon: <Sliders className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2.5 px-3 font-bold border-b-2 flex items-center gap-1.5 uppercase transition-colors ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-4">
          {activeTab === 'graphics' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-400 uppercase tracking-widest block mb-2">
                  GRAPHICS PRESET
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['low', 'medium', 'high', 'ultra'] as const).map((q) => (
                    <button
                      key={q}
                      onClick={() => updateSetting('graphicsQuality', q)}
                      className={`py-2.5 rounded-lg border text-xs font-bold uppercase transition-colors ${
                        settings.graphicsQuality === q
                          ? 'bg-emerald-950/70 border-emerald-500 text-white ring-1 ring-emerald-500'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-400 uppercase mb-2">
                  <span>RENDER DISTANCE</span>
                  <span className="text-emerald-400 font-bold">{settings.renderDistance}m</span>
                </div>
                <input
                  type="range"
                  min={150}
                  max={600}
                  step={50}
                  value={settings.renderDistance}
                  onChange={(e) => updateSetting('renderDistance', Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'controls' && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-400 uppercase mb-2">
                  <span>CAMERA TOUCH SENSITIVITY</span>
                  <span className="text-emerald-400 font-bold">{settings.cameraSensitivity}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={0.5}
                  value={settings.cameraSensitivity}
                  onChange={(e) => updateSetting('cameraSensitivity', Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-400 uppercase mb-2">
                  <span>ADS (AIM DOWN SIGHTS) SENSITIVITY</span>
                  <span className="text-emerald-400 font-bold">{settings.adsSensitivity}</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={8}
                  step={0.5}
                  value={settings.adsSensitivity}
                  onChange={(e) => updateSetting('adsSensitivity', Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div>
                  <div className="text-xs font-bold text-white uppercase">TACTICAL AIM ASSIST</div>
                  <div className="text-[11px] text-slate-400 font-mono">Subtle reticle friction on hostile targets</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.aimAssist}
                  onChange={(e) => updateSetting('aimAssist', e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-400 uppercase mb-2">
                  <span>MASTER VOLUME</span>
                  <span className="text-emerald-400 font-bold">{Math.round(settings.masterVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={settings.masterVolume}
                  onChange={(e) => updateSetting('masterVolume', Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-400 uppercase mb-2">
                  <span>SOUND EFFECTS (SFX & GUNSHOTS)</span>
                  <span className="text-emerald-400 font-bold">{Math.round(settings.sfxVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={settings.sfxVolume}
                  onChange={(e) => updateSetting('sfxVolume', Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-400 uppercase mb-2">
                  <span>TACTICAL BACKGROUND MUSIC</span>
                  <span className="text-emerald-400 font-bold">{Math.round(settings.musicVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={settings.musicVolume}
                  onChange={(e) => updateSetting('musicVolume', Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'gameplay' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div>
                  <div className="text-xs font-bold text-white uppercase">AUTO PICKUP AMMO & MEDS</div>
                  <div className="text-[11px] text-slate-400 font-mono">Automatically collect essential loot when walking over crates</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoPickup}
                  onChange={(e) => updateSetting('autoPickup', e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div>
                  <div className="text-xs font-bold text-white uppercase">AUTO SPRINT ON JOYSTICK FULL TILT</div>
                  <div className="text-[11px] text-slate-400 font-mono">Sprint automatically when dragging virtual stick to the outer edge</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoSprint}
                  onChange={(e) => updateSetting('autoSprint', e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
