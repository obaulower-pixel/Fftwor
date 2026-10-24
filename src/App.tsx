/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Play,
  User,
  Package,
  Crosshair,
  ShoppingBag,
  Gift,
  Target,
  Trophy,
  Settings as SettingsIcon,
  RotateCw,
} from 'lucide-react';

import {
  PlayerStats,
  GameSettings,
  GameMode,
  BotDifficulty,
  WeaponDef,
  LootItem,
  SafeZoneState,
  Mission,
} from './types/game';

import { WEAPON_DATABASE } from './game/weapons';
import { soundManager } from './game/audio';
import { GameEngine } from './game/GameEngine';
import { calculateMatchRewards } from './game/rules';

// Modals and Screens
import { TitleScreen } from './components/TitleScreen';
import { Lobby3D } from './components/Lobby3D';
import { LobbyView } from './components/LobbyView';
import { TopNavbar } from './components/TopNavbar';
import { PlayModal } from './components/PlayModal';
import { CharacterModal } from './components/CharacterModal';
import { ArmoryModal } from './components/ArmoryModal';
import { VaultModal } from './components/VaultModal';
import { ShopModal } from './components/ShopModal';
import { WheelModal } from './components/WheelModal';
import { MissionsModal } from './components/MissionsModal';
import { RankModal } from './components/RankModal';
import { SettingsModal } from './components/SettingsModal';
import { ProfileModal } from './components/ProfileModal';
import { MapSelectModal } from './components/MapSelectModal';
import { DailyRewardModal } from './components/DailyRewardModal';
import { FriendsModal } from './components/FriendsModal';
import { NotificationsModal } from './components/NotificationsModal';
import { GameHUD } from './components/GameHUD';
import { WorldMapModal } from './components/WorldMapModal';
import { MatchInventoryModal } from './components/MatchInventoryModal';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';

type AppState = 'title' | 'lobby' | 'playing' | 'paused' | 'gameover';

export default function App() {
  // Navigation & Game State Machine
  const [appState, setAppState] = useState<AppState>('title');
  const [isMuted, setIsMuted] = useState(false);

  // Modals Visibility
  const [isPlayModalOpen, setIsPlayModalOpen] = useState(false);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [isArmoryModalOpen, setIsArmoryModalOpen] = useState(false);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [isWheelModalOpen, setIsWheelModalOpen] = useState(false);
  const [isMissionsModalOpen, setIsMissionsModalOpen] = useState(false);
  const [isRankModalOpen, setIsRankModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isWorldMapOpen, setIsWorldMapOpen] = useState(false);
  const [isMatchInventoryOpen, setIsMatchInventoryOpen] = useState(false);
  const [isDailyRewardOpen, setIsDailyRewardOpen] = useState(false);
  const [isFriendsOpen, setIsFriendsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMapSelectOpen, setIsMapSelectOpen] = useState(false);
  const [selectedMapId, setSelectedMapId] = useState<string>('forest_arena');

  // Match Results State
  const [matchResult, setMatchResult] = useState<{
    isVictory: boolean;
    placement: number;
    totalParticipants: number;
    kills: number;
    damageDealt: number;
    survivalSeconds: number;
    xpEarned: number;
    creditsEarned: number;
    rankPointsDelta: number;
    eliminatedBy?: string;
  } | null>(null);

  // Player Career & Account State (Matches Reference Spec: Callsign GHOSTOPERATOR, Level 3, Rank Silver, XP 450/1000, 2400 Gold, 30 Gems)
  const [stats, setStats] = useState<PlayerStats>({
    nickname: 'GHOSTOPERATOR',
    playerId: 'LF-884920',
    isGuest: true,
    level: 3,
    xp: 450,
    xpToNextLevel: 1000,
    credits: 2400,
    tokens: 30,
    matchesPlayed: 8,
    victories: 2,
    totalKills: 19,
    totalDamage: 3850,
    rankTier: 'Silver',
    rankPoints: 1450,
    selectedOperatorId: 'op_ghost',
    equippedWeaponSkin: { ar_vanguard: 'default' },
    equippedOutfit: 'outfit_jungle',
    equippedBackpackSkin: 'default',
    equippedHelmetSkin: 'default',
  });

  const [unlockedOperators, setUnlockedOperators] = useState<string[]>([
    'op_ghost',
    'op_shadow',
    'op_stone',
    'op_chen',
  ]);
  const [ownedItemIds, setOwnedItemIds] = useState<string[]>([
    'outfit_jungle',
    'skin_matte',
    'para_camo',
  ]);
  const [equippedItems, setEquippedItems] = useState<Record<string, string>>({
    outfit: 'outfit_jungle',
    weapon_skin: 'skin_matte',
    helmet: 'default',
    backpack: 'default',
    parachute: 'para_camo',
  });

  // Missions
  const [missions, setMissions] = useState<Mission[]>([
    {
      id: 'm1',
      title: 'Neutralize Hostiles',
      description: 'Eliminate 3 hostile bots during battle royale deployment.',
      rewardCredits: 350,
      rewardXP: 250,
      target: 3,
      current: 2,
      completed: false,
      claimed: false,
    },
    {
      id: 'm2',
      title: 'Island Recon Survivor',
      description: 'Survive for at least 180 seconds on Frontier Island.',
      rewardCredits: 500,
      rewardXP: 300,
      target: 180,
      current: 180,
      completed: true,
      claimed: false,
    },
    {
      id: 'm3',
      title: 'Ballistic Firepower',
      description: 'Inflict 600 damage with any assault rifle or SMG.',
      rewardCredits: 400,
      rewardXP: 200,
      target: 600,
      current: 600,
      completed: true,
      claimed: false,
    },
  ]);

  // Settings
  const [settings, setSettings] = useState<GameSettings>({
    graphicsQuality: 'high',
    renderDistance: 350,
    cameraSensitivity: 5,
    adsSensitivity: 3,
    joystickSize: 100,
    buttonOpacity: 0.9,
    aimAssist: true,
    leftHanded: false,
    autoPickup: true,
    autoSprint: true,
    masterVolume: 0.8,
    musicVolume: 0.5,
    sfxVolume: 0.9,
    botCount: 10,
    botDifficulty: 'normal',
  });

  // In-Game Live HUD Data
  const [hudData, setHudData] = useState({
    health: 100,
    maxHealth: 100,
    armor: 100,
    maxArmor: 100,
    armorLevel: 1,
    helmetLevel: 1,
    backpackLevel: 1,
    activeWeapon: WEAPON_DATABASE.ar_vanguard as WeaponDef | null,
    secondaryWeapon: WEAPON_DATABASE.hg_compact as WeaponDef | null,
    ammoInMag: 30,
    reserveAmmo: 120,
    aliveCount: 11,
    killCount: 0,
    damageDealt: 0,
    safeZone: {
      currentCenter: { x: 0, z: 0 },
      currentRadius: 360,
      targetCenter: { x: 10, z: -15 },
      targetRadius: 240,
      phase: 1,
      totalPhases: 5,
      timeInCurrentPhase: 0,
      isShrinking: false,
      nextShrinkTime: 45,
      damagePerSec: 2.0,
    } as SafeZoneState,
    nearbyLoot: [] as LootItem[],
    isAiming: false,
    isReloading: false,
    isCrouching: false,
    matchTime: 0,
    crosshairHit: false,
    isHeadshotHit: false,
    compassHeading: 0,
  });

  // Game Engine Canvas Container Ref
  const gameMountRef = useRef<HTMLDivElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);

  // Sync state to body attribute for ultra-mode and testing
  useEffect(() => {
    document.body.dataset.state = appState;
  }, [appState]);

  // Check URL autostart param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      handleLogin({ nickname: 'AUTO_OPERATOR', isGuest: true, playerId: 'LF-AUTO1' });
    }
  }, []);

  // Sync sound settings
  useEffect(() => {
    soundManager.setVolumes(settings.masterVolume, settings.sfxVolume, settings.musicVolume);
  }, [settings.masterVolume, settings.sfxVolume, settings.musicVolume]);

  const toggleMute = () => {
    const isM = soundManager.toggleMute();
    setIsMuted(isM);
  };

  // --- Login Handler ---
  const handleLogin = (userStats: Partial<PlayerStats>) => {
    setStats((prev) => ({
      ...prev,
      ...userStats,
    }));
    setAppState('lobby');
    soundManager.startAmbientMusic();
  };

  // --- Start Match Deployment ---
  const handleDeployMatch = (mode: GameMode, botCount: number, botDifficulty: BotDifficulty) => {
    setIsPlayModalOpen(false);
    setAppState('playing');
    soundManager.stopAmbientMusic();

    // Give DOM a frame to mount canvas ref
    setTimeout(() => {
      if (!gameMountRef.current) return;

      // Clean up previous instance if any
      if (gameEngineRef.current) {
        gameEngineRef.current.destroy();
        gameEngineRef.current = null;
      }

      const matchSettings: GameSettings = {
        ...settings,
        botCount,
        botDifficulty,
      };

      const engine = new GameEngine(
        gameMountRef.current,
        matchSettings,
        stats.selectedOperatorId,
        {
          onHUDUpdate: (data) => {
            setHudData(data);
          },
          onVictory: (summary) => {
            handleMatchEnd(true, summary.kills, summary.damage, summary.time);
          },
          onDefeat: (summary) => {
            handleMatchEnd(false, summary.kills, summary.damage, summary.time, summary.killerName);
          },
        }
      );

      gameEngineRef.current = engine;
    }, 50);
  };

  const handleMatchEnd = (
    isVictory: boolean,
    kills: number,
    damage: number,
    time: number,
    killerName?: string
  ) => {
    const placement = isVictory ? 1 : Math.max(2, 11 - kills);
    const rewards = calculateMatchRewards(placement, kills, damage, time);

    setStats((prev) => {
      const newXP = prev.xp + rewards.totalXP;
      const leveledUp = newXP >= prev.xpToNextLevel;
      const level = leveledUp ? prev.level + 1 : prev.level;
      const xp = leveledUp ? newXP - prev.xpToNextLevel : newXP;
      const xpToNextLevel = leveledUp ? Math.round(prev.xpToNextLevel * 1.3) : prev.xpToNextLevel;

      return {
        ...prev,
        matchesPlayed: prev.matchesPlayed + 1,
        victories: isVictory ? prev.victories + 1 : prev.victories,
        totalKills: prev.totalKills + kills,
        totalDamage: prev.totalDamage + damage,
        level,
        xp,
        xpToNextLevel,
        credits: prev.credits + rewards.totalCredits,
        rankPoints: Math.max(0, prev.rankPoints + rewards.totalRankPoints),
      };
    });

    setMatchResult({
      isVictory,
      placement,
      totalParticipants: 11,
      kills,
      damageDealt: damage,
      survivalSeconds: time,
      xpEarned: rewards.totalXP,
      creditsEarned: rewards.totalCredits,
      rankPointsDelta: rewards.totalRankPoints,
      eliminatedBy: killerName,
    });

    setAppState('gameover');
  };

  const handleReturnToLobby = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.destroy();
      gameEngineRef.current = null;
    }
    setAppState('lobby');
    setMatchResult(null);
    soundManager.startAmbientMusic();
  };

  const handlePlayAgain = () => {
    handleDeployMatch('solo', settings.botCount, settings.botDifficulty);
  };

  // --- Purchase / Claim Handlers ---
  const handlePurchaseShopItem = (item: any) => {
    setStats((prev) => ({
      ...prev,
      credits: prev.credits - item.costCredits,
      tokens: prev.tokens - item.costTokens,
    }));
    setOwnedItemIds((prev) => [...prev, item.id]);
  };

  const handleClaimWheelPrize = (prize: any) => {
    setStats((prev) => {
      let credits = prev.credits;
      let tokens = prev.tokens;
      let xp = prev.xp;
      if (prize.type === 'credits') credits += prize.amount;
      if (prize.type === 'tokens') tokens += prize.amount;
      if (prize.type === 'xp') xp += prize.amount;
      return { ...prev, credits, tokens, xp };
    });
    if (prize.type === 'skin') {
      setOwnedItemIds((prev) => [...prev, 'outfit_desert']);
    }
  };

  const handleClaimMission = (missionId: string) => {
    const mission = missions.find((m) => m.id === missionId);
    if (!mission) return;

    setMissions((prev) =>
      prev.map((m) => (m.id === missionId ? { ...m, claimed: true } : m))
    );

    setStats((prev) => ({
      ...prev,
      credits: prev.credits + mission.rewardCredits,
      xp: prev.xp + mission.rewardXP,
    }));
  };

  const handleUnlockOperator = (id: string, cost: number) => {
    if (stats.credits < cost) return;
    setStats((prev) => ({
      ...prev,
      credits: prev.credits - cost,
      selectedOperatorId: id,
    }));
    setUnlockedOperators((prev) => [...prev, id]);
  };

  // --- In-Game Mobile HUD Actions ---
  const handleShootStart = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.isShootingHeld = true;
      gameEngineRef.current.shoot();
    }
  };
  const handleShootEnd = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.isShootingHeld = false;
    }
  };
  const handleToggleAim = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.isAiming = !gameEngineRef.current.isAiming;
    }
  };
  const handleReload = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.startReload();
    }
  };
  const handleToggleCrouch = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.isCrouching = !gameEngineRef.current.isCrouching;
    }
  };
  const handleJump = () => {
    // Jump feedback
    soundManager.playFootstep(1.5);
  };
  const handleSwitchWeapon = (idx: number) => {
    if (gameEngineRef.current) {
      gameEngineRef.current.switchWeapon(idx);
    }
  };
  const handlePickupLoot = (item: LootItem) => {
    if (gameEngineRef.current) {
      gameEngineRef.current.collectLoot(item);
    }
  };
  const handleJoystickMove = (x: number, y: number) => {
    if (gameEngineRef.current) {
      gameEngineRef.current.joystickVector = { x, y };
    }
  };
  const handleLookDelta = (dx: number, dy: number) => {
    if (gameEngineRef.current) {
      gameEngineRef.current.lookTouchDelta = { x: dx, y: dy };
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-black text-slate-100 font-sans select-none">
      {/* 1. TITLE SCREEN */}
      {appState === 'title' && <TitleScreen onLogin={handleLogin} />}

      {/* 2. LOBBY VIEW (Futuristic 3D Lobby + Reference Image 2 UI) */}
      {appState === 'lobby' && (
        <LobbyView
          stats={stats}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onOpenShop={() => setIsShopModalOpen(true)}
          onOpenInventory={() => setIsVaultModalOpen(true)}
          onOpenMissions={() => setIsMissionsModalOpen(true)}
          onOpenRank={() => setIsRankModalOpen(true)}
          onOpenFriends={() => setIsFriendsOpen(true)}
          onOpenCharacter={() => setIsCharacterModalOpen(true)}
          onOpenArmory={() => setIsArmoryModalOpen(true)}
          onOpenDailyReward={() => setIsDailyRewardOpen(true)}
          onOpenMapSelect={() => setIsMapSelectOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          selectedMapId={selectedMapId}
          onSelectMapId={setSelectedMapId}
          onDeployMatch={handleDeployMatch}
        />
      )}

      {/* 3. IN-GAME 3D CANVAS & PLAYING HUD */}
      {(appState === 'playing' || appState === 'paused' || appState === 'gameover') && (
        <div className="relative w-full h-full">
          {/* Three.js Isolated Canvas Mount */}
          <div ref={gameMountRef} className="w-full h-full" />

          {/* Active Mobile In-Game HUD */}
          {appState === 'playing' && (
            <GameHUD
              {...hudData}
              onShootStart={handleShootStart}
              onShootEnd={handleShootEnd}
              onToggleAim={handleToggleAim}
              onReload={handleReload}
              onToggleCrouch={handleToggleCrouch}
              onJump={handleJump}
              onSwitchWeapon={handleSwitchWeapon}
              onPickupLoot={handlePickupLoot}
              onOpenInventory={() => setIsMatchInventoryOpen(true)}
              onOpenMap={() => setIsWorldMapOpen(true)}
              onPause={() => setAppState('paused')}
              onJoystickMove={handleJoystickMove}
              onLookDelta={handleLookDelta}
            />
          )}

          {/* Pause Modal */}
          {appState === 'paused' && (
            <PauseModal
              isOpen={true}
              isMuted={isMuted}
              aliveCount={hudData.aliveCount}
              killCount={hudData.killCount}
              damageDealt={hudData.damageDealt}
              onResume={() => setAppState('playing')}
              onToggleMute={toggleMute}
              onRestart={() => handleDeployMatch('solo', settings.botCount, settings.botDifficulty)}
              onReturnToLobby={handleReturnToLobby}
            />
          )}

          {/* Victory / Defeat Modal */}
          {appState === 'gameover' && matchResult && (
            <GameOverModal
              {...matchResult}
              onReturnToLobby={handleReturnToLobby}
              onPlayAgain={handlePlayAgain}
            />
          )}

          {/* In-Match World Map Modal */}
          <WorldMapModal
            isOpen={isWorldMapOpen}
            onClose={() => setIsWorldMapOpen(false)}
            playerPos={gameEngineRef.current ? { x: gameEngineRef.current.playerPos.x, z: gameEngineRef.current.playerPos.z } : { x: 0, z: 0 }}
            safeZone={hudData.safeZone}
          />

          {/* In-Match Inventory Modal */}
          <MatchInventoryModal
            isOpen={isMatchInventoryOpen}
            onClose={() => setIsMatchInventoryOpen(false)}
            health={hudData.health}
            maxHealth={hudData.maxHealth}
            armor={hudData.armor}
            armorLevel={hudData.helmetLevel}
            helmetLevel={hudData.helmetLevel}
            backpackLevel={hudData.backpackLevel}
            primaryWeapon={hudData.activeWeapon}
            secondaryWeapon={hudData.secondaryWeapon}
            ammoInventory={gameEngineRef.current ? gameEngineRef.current.ammoInventory : {}}
            onUseMedkit={() => {
              if (gameEngineRef.current) {
                gameEngineRef.current.health = Math.min(gameEngineRef.current.maxHealth, gameEngineRef.current.health + 75);
                soundManager.playLootPickup();
              }
            }}
            onUseBandage={() => {
              if (gameEngineRef.current) {
                gameEngineRef.current.health = Math.min(gameEngineRef.current.maxHealth, gameEngineRef.current.health + 25);
                soundManager.playLootPickup();
              }
            }}
          />
        </div>
      )}

      {/* LOBBY MODALS */}
      <PlayModal
        isOpen={isPlayModalOpen}
        onClose={() => setIsPlayModalOpen(false)}
        onDeploy={handleDeployMatch}
      />

      <CharacterModal
        isOpen={isCharacterModalOpen}
        onClose={() => setIsCharacterModalOpen(false)}
        selectedOperatorId={stats.selectedOperatorId}
        unlockedOperators={unlockedOperators}
        credits={stats.credits}
        onSelectOperator={(id) => setStats((prev) => ({ ...prev, selectedOperatorId: id }))}
        onUnlockOperator={handleUnlockOperator}
      />

      <ArmoryModal
        isOpen={isArmoryModalOpen}
        onClose={() => setIsArmoryModalOpen(false)}
        equippedWeaponId="ar_vanguard"
        onEquipWeapon={() => setIsArmoryModalOpen(false)}
      />

      <VaultModal
        isOpen={isVaultModalOpen}
        onClose={() => setIsVaultModalOpen(false)}
        ownedItemIds={ownedItemIds}
        equippedItems={equippedItems}
        onEquipItem={(category, itemId) => {
          setEquippedItems((prev) => ({ ...prev, [category]: itemId }));
        }}
      />

      <ShopModal
        isOpen={isShopModalOpen}
        onClose={() => setIsShopModalOpen(false)}
        credits={stats.credits}
        tokens={stats.tokens}
        ownedItemIds={ownedItemIds}
        onPurchase={handlePurchaseShopItem}
      />

      <WheelModal
        isOpen={isWheelModalOpen}
        onClose={() => setIsWheelModalOpen(false)}
        onClaimPrize={handleClaimWheelPrize}
      />

      <MissionsModal
        isOpen={isMissionsModalOpen}
        onClose={() => setIsMissionsModalOpen(false)}
        missions={missions}
        onClaim={handleClaimMission}
      />

      <RankModal
        isOpen={isRankModalOpen}
        onClose={() => setIsRankModalOpen(false)}
        stats={stats}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        stats={stats}
        onUpdateNickname={(name) => setStats((prev) => ({ ...prev, nickname: name }))}
      />

      {/* ADDITIONAL IMMERSIVE LOBBY MODALS */}
      <MapSelectModal
        isOpen={isMapSelectOpen}
        onClose={() => setIsMapSelectOpen(false)}
        selectedMapId={selectedMapId}
        onSelectMap={(mapId) => setSelectedMapId(mapId)}
      />

      <DailyRewardModal
        isOpen={isDailyRewardOpen}
        onClose={() => setIsDailyRewardOpen(false)}
        onClaimReward={(credits, tokens) => {
          setStats((prev) => ({
            ...prev,
            credits: prev.credits + credits,
            tokens: prev.tokens + tokens,
          }));
        }}
      />

      <FriendsModal
        isOpen={isFriendsOpen}
        onClose={() => setIsFriendsOpen(false)}
        onInviteToSquad={(friendName) => {
          // squad invitation sent feedback
        }}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
}
