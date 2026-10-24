/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Home,
  ShoppingBag,
  Package,
  Star,
  Trophy,
  Users,
  Volume2,
  VolumeX,
  Mail,
  Settings,
  Play,
  User,
  Shirt,
  Smile,
  Crosshair,
  Coins,
  Sparkles,
  ChevronRight,
  Gift,
  Crown,
  MapPin,
  X,
  Radar,
  Loader2,
  CheckCircle,
} from 'lucide-react';

import { PlayerStats, GameMode } from '../types/game';
import { Lobby3D } from './Lobby3D';
import { MAPS_LIST } from './MapSelectModal';
import { soundManager } from '../game/audio';

interface LobbyViewProps {
  stats: PlayerStats;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onOpenShop: () => void;
  onOpenInventory: () => void;
  onOpenMissions: () => void;
  onOpenRank: () => void;
  onOpenFriends: () => void;
  onOpenCharacter: () => void;
  onOpenArmory: () => void;
  onOpenDailyReward: () => void;
  onOpenMapSelect: () => void;
  onOpenNotifications: () => void;
  selectedMapId: string;
  onSelectMapId: (id: string) => void;
  onDeployMatch: (mode: GameMode, botCount: number, difficulty: any) => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  stats,
  isMuted,
  onToggleMute,
  onOpenSettings,
  onOpenProfile,
  onOpenShop,
  onOpenInventory,
  onOpenMissions,
  onOpenRank,
  onOpenFriends,
  onOpenCharacter,
  onOpenArmory,
  onOpenDailyReward,
  onOpenMapSelect,
  onOpenNotifications,
  selectedMapId,
  onSelectMapId,
  onDeployMatch,
}) => {
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode>('solo');
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [activeEmote, setActiveEmote] = useState<string | null>(null);

  // Matchmaking State Machine
  const [isMatchmaking, setIsMatchmaking] = useState(false);
  const [matchmakingTime, setMatchmakingTime] = useState(0);
  const [matchFound, setMatchFound] = useState(false);

  // Active Map details
  const currentMap = MAPS_LIST.find((m) => m.id === selectedMapId) || MAPS_LIST[0];

  // Matchmaking timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isMatchmaking && !matchFound) {
      timer = setInterval(() => {
        setMatchmakingTime((prev) => {
          if (prev >= 3) {
            setMatchFound(true);
            soundManager.playVictoryFanfare();
            setTimeout(() => {
              setIsMatchmaking(false);
              setMatchFound(false);
              onDeployMatch(selectedGameMode, 15, 'medium');
            }, 1200);
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isMatchmaking, matchFound, onDeployMatch, selectedGameMode]);

  const handleStartMatchmaking = () => {
    soundManager.playLootPickup();
    setMatchmakingTime(0);
    setMatchFound(false);
    setIsMatchmaking(true);
  };

  const handleCancelMatchmaking = () => {
    setIsMatchmaking(false);
    setMatchFound(false);
    setMatchmakingTime(0);
  };

  const handleTriggerEmote = () => {
    soundManager.playFootstep(1.5);
    const emotes = ['wave', 'victory'];
    const chosen = emotes[Math.floor(Math.random() * emotes.length)];
    setActiveEmote(chosen);
    setTimeout(() => {
      setActiveEmote(null);
    }, 2800);
  };

  const xpPercent = Math.min(100, Math.round((stats.xp / stats.xpToNextLevel) * 100));

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden select-none bg-[#09121f] text-slate-100 font-sans">
      {/* 1. Full 3D Cinematic Lobby (Portal Arch with glowing PLAY sign, platform, anime character, islands) */}
      <div className="absolute inset-0 z-0">
        <Lobby3D
          selectedOperatorId={stats.selectedOperatorId || 'op_ghost'}
          selectedWeaponId="ar_vanguard"
          mode="lobby"
          activeEmote={activeEmote}
        />
      </div>

      {/* Atmospheric Vignette Gradients */}
      <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-t from-[#060c17]/90 via-transparent to-[#060c17]/60" />
      <div className="absolute inset-y-0 left-0 w-64 z-[1] pointer-events-none bg-gradient-to-r from-[#060c17]/70 to-transparent hidden md:block" />
      <div className="absolute inset-y-0 right-0 w-64 z-[1] pointer-events-none bg-gradient-to-l from-[#060c17]/70 to-transparent hidden md:block" />

      {/* 2. TOP BAR (Profile Pill & Currencies Matching Reference Image 2) */}
      <header className="relative z-20 w-full flex items-center justify-between px-3 md:px-8 py-2.5">
        {/* Left: Player Profile Pill */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 bg-[#0b1728]/90 hover:bg-[#12233c] border border-cyan-500/40 rounded-2xl p-1.5 pr-4 transition-all shadow-xl active:scale-95 group text-left"
        >
          {/* Avatar Thumbnail */}
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-slate-800 border-2 border-cyan-400 overflow-hidden flex items-center justify-center shadow">
              {/* Mini anime head icon */}
              <div className="w-full h-full bg-[#1e293b] flex items-center justify-center">
                <div className="w-7 h-7 rounded-md bg-[#f8ebd8] flex items-center justify-center relative">
                  <div className="w-8 h-3 bg-[#f1f5f9] rounded-t-md absolute -top-1" />
                  <div className="flex gap-1.5 mt-1">
                    <span className="w-1 h-1.5 bg-[#06b6d4] rounded-full" />
                    <span className="w-1 h-1.5 bg-[#06b6d4] rounded-full" />
                  </div>
                </div>
              </div>
            </div>
            {/* Level Badge */}
            <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 rounded-md shadow">
              {stats.level}
            </span>
          </div>

          {/* Profile Name & Level */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-md font-mono">
                {stats.nickname.slice(0, 2).toUpperCase()}
              </span>
              <span className="text-xs md:text-sm font-bold text-white font-mono tracking-wide group-hover:text-cyan-400 transition-colors">
                {stats.nickname}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-600/60 px-1.5 py-0.2 rounded-md">
                {stats.rankTier}
              </span>
            </div>

            {/* XP Progress Bar */}
            <div className="flex items-center gap-2 mt-1">
              <div className="w-24 md:w-32 bg-[#070e1a] border border-slate-700/60 rounded-full h-2 overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
              <span className="text-[9px] font-mono text-slate-400">
                {stats.xp}/{stats.xpToNextLevel}
              </span>
            </div>
          </div>
        </button>

        {/* Right: Currencies & Utility Controls */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Gold Coins Badge */}
          <button
            onClick={onOpenShop}
            className="flex items-center gap-1.5 bg-[#0b1728]/90 hover:bg-[#12233c] border border-amber-500/50 rounded-xl px-3 py-1.5 shadow transition-transform active:scale-95 text-xs font-mono group"
          >
            <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span className="text-white font-bold">{stats.credits.toLocaleString()}</span>
            <span className="text-amber-400 font-black text-sm ml-0.5 group-hover:scale-125 transition-transform">+</span>
          </button>

          {/* Gems Badge */}
          <button
            onClick={onOpenShop}
            className="flex items-center gap-1.5 bg-[#0b1728]/90 hover:bg-[#12233c] border border-cyan-500/50 rounded-xl px-3 py-1.5 shadow transition-transform active:scale-95 text-xs font-mono group"
          >
            <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <span className="text-white font-bold">{stats.tokens.toLocaleString()}</span>
            <span className="text-cyan-400 font-black text-sm ml-0.5 group-hover:scale-125 transition-transform">+</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="w-9 h-9 rounded-xl bg-[#0b1728]/90 hover:bg-[#12233c] border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Mail / Notification Button */}
          <button
            onClick={onOpenNotifications}
            title="Tactical Announcements"
            className="w-9 h-9 rounded-xl bg-[#0b1728]/90 hover:bg-[#12233c] border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors relative"
          >
            <Mail className="w-4 h-4 text-cyan-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_6px_#f43f5e]" />
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            title="Settings"
            className="w-9 h-9 rounded-xl bg-[#0b1728]/90 hover:bg-[#12233c] border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-300 hover:text-white" />
          </button>
        </div>
      </header>

      {/* 3. CENTER BODY WITH LEFT MENU & IN-SCENE FLOATING WIDGETS */}
      <div className="relative z-10 flex-1 flex justify-between pointer-events-none px-3 md:px-8 py-2">
        {/* LEFT NAVIGATION MENU (Vertical Pill List Matching Reference Image 2) */}
        <div className="pointer-events-auto flex flex-col gap-2 self-start max-w-[140px] md:max-w-[160px]">
          {/* LOBBY BUTTON (Active Green State) */}
          <button
            type="button"
            className="flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider font-mono shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-emerald-300/40"
          >
            <Home className="w-4 h-4 stroke-[2.5]" />
            <span>LOBBY</span>
          </button>

          {/* SHOP BUTTON */}
          <button
            type="button"
            onClick={onOpenShop}
            className="flex items-center justify-between px-4 py-2.5 bg-[#0b1728]/90 hover:bg-[#12233c] border border-slate-700/80 hover:border-slate-500 text-slate-200 hover:text-white font-bold rounded-2xl text-xs uppercase tracking-wider font-mono shadow transition-all active:scale-95 group relative"
          >
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>SHOP</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
          </button>

          {/* INVENTORY BUTTON */}
          <button
            type="button"
            onClick={onOpenInventory}
            className="flex items-center gap-2.5 px-4 py-2.5 bg-[#0b1728]/90 hover:bg-[#12233c] border border-slate-700/80 hover:border-slate-500 text-slate-200 hover:text-white font-bold rounded-2xl text-xs uppercase tracking-wider font-mono shadow transition-all active:scale-95 group"
          >
            <Package className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span>INVENTORY</span>
          </button>

          {/* MISSIONS BUTTON */}
          <button
            type="button"
            onClick={onOpenMissions}
            className="flex items-center justify-between px-4 py-2.5 bg-[#0b1728]/90 hover:bg-[#12233c] border border-slate-700/80 hover:border-slate-500 text-slate-200 hover:text-white font-bold rounded-2xl text-xs uppercase tracking-wider font-mono shadow transition-all active:scale-95 group"
          >
            <div className="flex items-center gap-2.5">
              <Star className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>MISSIONS</span>
            </div>
            <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 rounded-full">
              3
            </span>
          </button>

          {/* RANK TIER BUTTON */}
          <button
            type="button"
            onClick={onOpenRank}
            className="flex items-center gap-2.5 px-4 py-2.5 bg-[#0b1728]/90 hover:bg-[#12233c] border border-slate-700/80 hover:border-slate-500 text-slate-200 hover:text-white font-bold rounded-2xl text-xs uppercase tracking-wider font-mono shadow transition-all active:scale-95 group"
          >
            <Trophy className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>RANK TIER</span>
          </button>

          {/* FRIENDS BUTTON */}
          <button
            type="button"
            onClick={onOpenFriends}
            className="flex items-center gap-2.5 px-4 py-2.5 bg-[#0b1728]/90 hover:bg-[#12233c] border border-slate-700/80 hover:border-slate-500 text-slate-200 hover:text-white font-bold rounded-2xl text-xs uppercase tracking-wider font-mono shadow transition-all active:scale-95 group"
          >
            <Users className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span>FRIENDS</span>
          </button>
        </div>

        {/* IN-LOBBY WALL DISPLAY WIDGETS (Desktop & Tablet) */}
        <div className="hidden lg:flex items-start justify-between flex-1 mx-6 pointer-events-none">
          {/* Left Wall Screen: MAP SELECT Wall Panel (Matching Reference Image 2) */}
          <div className="pointer-events-auto bg-[#0b1728]/85 backdrop-blur-sm border border-cyan-500/40 rounded-2xl p-3 shadow-xl max-w-sm mt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 font-mono tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>MAP SELECT</span>
              </div>
              <button
                onClick={onOpenMapSelect}
                className="text-[10px] text-slate-400 hover:text-cyan-400 font-mono underline"
              >
                View All
              </button>
            </div>

            {/* 3 Interactive Map Thumbnails */}
            <div className="grid grid-cols-3 gap-2">
              {MAPS_LIST.slice(0, 3).map((map) => {
                const isSelected = map.id === selectedMapId;
                return (
                  <button
                    key={map.id}
                    onClick={() => onSelectMapId(map.id)}
                    className={`flex flex-col text-left p-1.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-950/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                        : 'border-slate-700 bg-slate-900/60 hover:border-slate-500'
                    }`}
                  >
                    <div className="h-10 rounded-lg bg-slate-800 flex items-center justify-center mb-1 overflow-hidden relative">
                      <div className={`absolute inset-0 bg-gradient-to-br ${map.bgGradient} opacity-60`} />
                      <span className="text-[10px] font-bold text-white relative z-10 font-mono">
                        {map.name.slice(0, 3).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-white truncate font-mono">
                      {map.name}
                    </span>
                    <span className="text-[8px] text-slate-400 font-mono">
                      {map.difficulty}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Wall Screen: TOP PLAYER Leaderboard & Daily Reward (Matching Reference Image 2) */}
          <div className="pointer-events-auto flex flex-col items-end gap-3 mt-4">
            {/* Top Player Leaderboard Card */}
            <div className="bg-[#0b1728]/85 backdrop-blur-sm border border-cyan-500/40 rounded-2xl p-3 shadow-xl w-56 font-mono">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-2 border-b border-slate-800 pb-1.5">
                <Crown className="w-3.5 h-3.5 fill-amber-400" />
                <span className="tracking-wider">TOP PLAYER</span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-amber-300 font-bold">
                  <div className="flex items-center gap-1.5">
                    <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>ShadowX</span>
                  </div>
                  <span>12,450</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-bold">2</span>
                    <span>Razer99</span>
                  </div>
                  <span>11,230</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-bold">3</span>
                    <span>Velocity</span>
                  </div>
                  <span>9,876</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 font-bold">4</span>
                    <span>SigmaPro</span>
                  </div>
                  <span>8,542</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 font-bold">5</span>
                    <span>Frosty</span>
                  </div>
                  <span>7,321</span>
                </div>
              </div>
            </div>

            {/* Daily Reward Interactive Gift Box */}
            <button
              onClick={onOpenDailyReward}
              className="flex items-center gap-2 bg-[#0b1728]/90 hover:bg-[#12233c] border border-cyan-500/50 hover:border-cyan-400 rounded-2xl px-3.5 py-2 text-xs font-mono font-bold text-white shadow-xl transition-transform active:scale-95 group relative"
            >
              <Gift className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
              <span>DAILY REWARD</span>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_#f43f5e]" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM DOCK (Banner, Customization Tabs, Mode Card, and Massive PLAY Button) */}
      <footer className="relative z-20 w-full px-3 md:px-8 pb-4 pt-1 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Bottom Left: NEW MAP FOREST ARENA Banner (Matching Reference Image 2) */}
        <button
          onClick={onOpenMapSelect}
          className="w-full md:w-auto flex items-center gap-3 bg-[#0b1728]/90 hover:bg-[#12233c] border border-emerald-500/40 rounded-2xl p-2.5 pr-4 shadow-xl text-left transition-transform active:scale-95 group"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-400/50 overflow-hidden flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-black font-mono text-emerald-400">MAP</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-black text-amber-400 bg-amber-950/70 px-1.5 py-0.2 rounded">
                NEW MAP
              </span>
              <span className="text-xs font-bold text-white font-mono uppercase group-hover:text-emerald-400 transition-colors">
                {currentMap.name}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              Explore the new battlefield!
            </p>
          </div>
        </button>

        {/* Center Bottom: Customization Tabs (CHARACTER, SKIN, EMOTE, WEAPON) */}
        <div className="flex items-center gap-1.5 md:gap-2 bg-[#0b1728]/90 backdrop-blur-sm border border-slate-700/80 rounded-2xl p-1 shadow-2xl">
          {/* CHARACTER TAB */}
          <button
            onClick={onOpenCharacter}
            className="flex items-center gap-1.5 px-3 md:px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/60 rounded-xl text-emerald-300 font-mono text-xs font-bold shadow hover:bg-emerald-500/30 transition-colors active:scale-95"
          >
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span>CHARACTER</span>
          </button>

          {/* SKIN TAB */}
          <button
            onClick={onOpenInventory}
            className="flex items-center gap-1.5 px-3 md:px-4 py-2 hover:bg-slate-800/80 rounded-xl text-slate-300 hover:text-white font-mono text-xs font-bold transition-colors active:scale-95"
          >
            <Shirt className="w-3.5 h-3.5 text-cyan-400" />
            <span>SKIN</span>
          </button>

          {/* EMOTE TAB */}
          <button
            onClick={handleTriggerEmote}
            className="flex items-center gap-1.5 px-3 md:px-4 py-2 hover:bg-slate-800/80 rounded-xl text-slate-300 hover:text-white font-mono text-xs font-bold transition-colors active:scale-95"
          >
            <Smile className="w-3.5 h-3.5 text-amber-400" />
            <span>EMOTE</span>
          </button>

          {/* WEAPON TAB */}
          <button
            onClick={onOpenArmory}
            className="flex items-center gap-1.5 px-3 md:px-4 py-2 hover:bg-slate-800/80 rounded-xl text-slate-300 hover:text-white font-mono text-xs font-bold transition-colors active:scale-95"
          >
            <Crosshair className="w-3.5 h-3.5 text-rose-400" />
            <span>WEAPON</span>
          </button>
        </div>

        {/* Bottom Right: Mode Selector & Massive PLAY Button */}
        <div className="w-full md:w-auto flex items-center justify-end gap-3">
          {/* Game Mode Card */}
          <div className="relative">
            <button
              onClick={() => setShowModeDropdown(!showModeDropdown)}
              className="flex items-center gap-2.5 bg-[#0b1728]/90 hover:bg-[#12233c] border border-cyan-500/40 rounded-2xl p-2 pr-3 text-left transition-transform active:scale-95 group shadow"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
                  {selectedGameMode}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-black text-white font-mono uppercase group-hover:text-cyan-400 transition-colors">
                    {selectedGameMode}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  Battle Royale
                </span>
              </div>
            </button>

            {/* Mode Dropdown Menu */}
            {showModeDropdown && (
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-[#0b1728] border border-cyan-500/50 rounded-2xl p-2 shadow-2xl z-30 font-mono">
                {(['solo', 'duo', 'squad', 'training'] as GameMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      setSelectedGameMode(mode);
                      setShowModeDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold uppercase transition-colors ${
                      selectedGameMode === mode
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span>{mode}</span>
                    <span className="text-[10px] text-slate-500">
                      {mode === 'solo' ? '1-Player' : mode === 'duo' ? '2-Squad' : mode === 'squad' ? '4-Squad' : 'Practice'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Giant Glowing Emerald Green PLAY Button (Matching Reference Image 2) */}
          <button
            data-start="true"
            onClick={handleStartMatchmaking}
            className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 md:px-12 py-3.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black rounded-2xl text-xl md:text-2xl uppercase tracking-widest font-display shadow-[0_0_30px_rgba(16,185,129,0.5)] border-2 border-emerald-200/60 transition-transform active:scale-95 group"
          >
            <Play className="w-6 h-6 md:w-7 md:h-7 fill-slate-950 text-slate-950 group-hover:scale-110 transition-transform" />
            <span>PLAY</span>
          </button>
        </div>
      </footer>

      {/* 5. MATCHMAKING MODAL / OVERLAY */}
      {isMatchmaking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
          <div className="w-full max-w-md bg-[#091322] border-2 border-cyan-500/60 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,240,255,0.3)] text-center font-mono relative">
            <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-400 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(0,240,255,0.4)]">
              {matchFound ? (
                <CheckCircle className="w-8 h-8 text-emerald-400 animate-bounce" />
              ) : (
                <Radar className="w-8 h-8 text-cyan-400 animate-spin" />
              )}
            </div>

            <h3 className="text-xl font-black text-white uppercase font-display tracking-wider mb-1">
              {matchFound ? 'MATCH FOUND!' : 'SEARCHING FOR MATCH'}
            </h3>
            <span className="text-xs text-cyan-400 tracking-widest uppercase">
              {matchFound ? 'DEPLOYING SQUAD TO FRONTIER ISLAND...' : 'REGION: ASIA-EAST // TOURNAMENT PROTOCOL'}
            </span>

            {/* Timer & Details */}
            <div className="my-5 p-3.5 bg-[#070e1a] border border-slate-700/80 rounded-2xl flex items-center justify-around text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">TIME ELAPSED</span>
                <span className="text-base font-bold text-white font-mono">
                  00:0{matchmakingTime}
                </span>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div>
                <span className="text-slate-500 block text-[10px]">MODE</span>
                <span className="text-xs font-bold text-cyan-400 uppercase">
                  {selectedGameMode}
                </span>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div>
                <span className="text-slate-500 block text-[10px]">MAP</span>
                <span className="text-xs font-bold text-emerald-400 truncate max-w-[80px] block">
                  {currentMap.name}
                </span>
              </div>
            </div>

            {!matchFound ? (
              <button
                onClick={handleCancelMatchmaking}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 hover:text-white uppercase tracking-wider transition-colors"
              >
                CANCEL MATCHMAKING
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-400 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>CONNECTING COMBAT SIMULATION...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
