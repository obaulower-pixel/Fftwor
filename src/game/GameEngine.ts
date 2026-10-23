/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  WeaponDef,
  LootItem,
  SafeZoneState,
  BotDifficulty,
  GameSettings,
} from '../types/game';
import { WEAPON_DATABASE, OPERATOR_ROSTER } from './weapons';
import {
  createOperatorMesh,
  OperatorMeshGroup,
  createWeaponMesh,
  createMilitaryHangar,
  createWatchtower,
  createCargoContainer,
  createTacticalTruck,
  createPineTree,
  createTacticalLootCrate,
} from './proceduralModels';
import { MAP_OBSTACLES, generateIslandLoot, FRONTIER_POIS } from './islandMap';
import { BotState, createBot, updateBotAI, BOT_NAMES } from './botAI';
import { advanceSafeZone, isInsideSafeZone, calculateDamage, DEFAULT_SAFE_ZONE_PHASES, FAST_SAFE_ZONE_PHASES } from './rules';
import { soundManager } from './audio';

export interface GameEngineCallbacks {
  onHUDUpdate: (data: {
    health: number;
    maxHealth: number;
    armor: number;
    maxArmor: number;
    armorLevel: number;
    helmetLevel: number;
    backpackLevel: number;
    activeWeapon: WeaponDef | null;
    secondaryWeapon: WeaponDef | null;
    ammoInMag: number;
    reserveAmmo: number;
    aliveCount: number;
    killCount: number;
    damageDealt: number;
    safeZone: SafeZoneState;
    nearbyLoot: LootItem[];
    isAiming: boolean;
    isReloading: boolean;
    isCrouching: boolean;
    matchTime: number;
    crosshairHit: boolean;
    isHeadshotHit: boolean;
    compassHeading: number;
  }) => void;
  onVictory: (summary: { kills: number; damage: number; time: number }) => void;
  onDefeat: (summary: { kills: number; damage: number; time: number; killerName: string }) => void;
}

export class GameEngine {
  private container: HTMLDivElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private isSoftwareGl: boolean;
  private animFrameId = 0;
  private isDestroyed = false;

  // Settings
  private settings: GameSettings;
  private callbacks: GameEngineCallbacks;

  // Player State
  public playerMesh: OperatorMeshGroup;
  public playerWeaponGroup: THREE.Group;
  public playerPos = new THREE.Vector3(0, 0, 0);
  public playerVelocity = new THREE.Vector3(0, 0, 0);
  public playerRotationY = 0;
  public cameraPitch = 0.2; // vertical angle
  public cameraYaw = 0; // horizontal angle
  public cameraDist = 4.8;
  public health = 100;
  public maxHealth = 100;
  public armor = 100;
  public maxArmor = 100;
  public armorLevel = 1;
  public helmetLevel = 1;
  public backpackLevel = 1;
  public isAlive = true;
  public isAiming = false;
  public isReloading = false;
  public isCrouching = false;
  public isSprinting = false;
  public reloadTimer = 0;
  public primaryWeapon: WeaponDef = WEAPON_DATABASE.ar_vanguard;
  public secondaryWeapon: WeaponDef | null = WEAPON_DATABASE.hg_compact;
  public ammoInMag = 30;
  public ammoInventory: Record<string, number> = {
    '5.56mm': 120,
    '7.62mm': 60,
    '9mm': 90,
    '12gauge': 24,
    '.300mag': 15,
  };
  public killCount = 0;
  public damageDealt = 0;
  public lastShotTime = 0;

  // Camera Shake & Hitstop
  private trauma = 0;
  private hitFlashTimer = 0;
  private hitCrosshairTimer = 0;
  private hitWasHeadshot = false;

  // Input State
  public keys: Record<string, boolean> = {};
  public joystickVector = { x: 0, y: 0 };
  public lookTouchDelta = { x: 0, y: 0 };
  public isShootingHeld = false;

  // World Elements
  private lootItems: LootItem[] = [];
  private lootMeshes: Map<string, THREE.Group> = new Map();
  private bots: BotState[] = [];
  private safeZoneMesh: THREE.Mesh;
  private dangerZoneMesh: THREE.Mesh;
  public safeZoneState: SafeZoneState;
  private matchTime = 0;
  private lastTime = performance.now();
  private safeZoneDamageTimer = 0;

  // Bullet Tracers and Particles
  private bullets: Array<{
    pos: THREE.Vector3;
    dir: THREE.Vector3;
    speed: number;
    distanceLeft: number;
    damage: number;
    isPlayerShot: boolean;
    mesh: THREE.Mesh;
  }> = [];
  private bulletMaterial: THREE.MeshBasicMaterial;
  private bulletGeometry: THREE.CylinderGeometry;

  constructor(
    container: HTMLDivElement,
    settings: GameSettings,
    selectedOperatorId: string,
    callbacks: GameEngineCallbacks
  ) {
    this.container = container;
    this.settings = settings;
    this.callbacks = callbacks;

    // Detect software WebGL
    this.isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0c111a);
    this.scene.fog = new THREE.FogExp2(0x0c111a, 0.0055);

    const aspect = container.clientWidth / Math.max(container.clientHeight, 1);
    this.camera = new THREE.PerspectiveCamera(65, aspect, 0.1, 800);

    // 2. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl && this.settings.graphicsQuality !== 'low',
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.5));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl && this.settings.graphicsQuality !== 'low';
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // 3. Studio Environment Reflection
    try {
      const pmrem = new THREE.PMREMGenerator(this.renderer);
      this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
    } catch {
      // fallback
    }

    // 4. Lighting Rig
    const sunLight = new THREE.DirectionalLight(0xfff4e6, 2.2);
    sunLight.position.set(120, 180, 80);
    sunLight.castShadow = this.renderer.shadowMap.enabled;
    if (sunLight.castShadow) {
      sunLight.shadow.mapSize.width = 1024;
      sunLight.shadow.mapSize.height = 1024;
      sunLight.shadow.camera.near = 10;
      sunLight.shadow.camera.far = 400;
      const d = 120;
      sunLight.shadow.camera.left = -d;
      sunLight.shadow.camera.right = d;
      sunLight.shadow.camera.top = d;
      sunLight.shadow.camera.bottom = -d;
      sunLight.shadow.bias = -0.0005;
      sunLight.shadow.normalBias = 0.02;
    }
    this.scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(0x7da4d9, 0x1f271c, 0.9);
    this.scene.add(hemiLight);

    // 5. Build Island Terrain & Ocean
    this.buildTerrain();

    // 6. Spawn Map Obstacles & POIs
    this.spawnObstacles();

    // 7. Spawn Loot Items
    this.lootItems = generateIslandLoot();
    this.spawnLootMeshes();

    // 8. Safe Zone Cylinder & Circle Indicator
    this.safeZoneState = {
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
    };

    const safeZoneGeo = new THREE.CylinderGeometry(1, 1, 60, 48, 1, true);
    const safeZoneMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.safeZoneMesh = new THREE.Mesh(safeZoneGeo, safeZoneMat);
    this.safeZoneMesh.position.y = 30;
    this.scene.add(this.safeZoneMesh);

    const dangerZoneGeo = new THREE.RingGeometry(1, 1.05, 48);
    const dangerZoneMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      side: THREE.DoubleSide,
    });
    this.dangerZoneMesh = new THREE.Mesh(dangerZoneGeo, dangerZoneMat);
    this.dangerZoneMesh.rotation.x = -Math.PI / 2;
    this.dangerZoneMesh.position.y = 0.1;
    this.scene.add(this.dangerZoneMesh);

    // 9. Create Player Character
    const op = OPERATOR_ROSTER.find((o) => o.id === selectedOperatorId) || OPERATOR_ROSTER[0];
    this.playerMesh = createOperatorMesh(op.avatarColor, '#18201a', '#e0b288');
    this.playerMesh.position.set(0, 0, 15);
    this.playerPos.set(0, 0, 15);
    this.scene.add(this.playerMesh);

    // Attach Weapon to player right arm mount
    this.playerWeaponGroup = createWeaponMesh(this.primaryWeapon.category);
    this.playerMesh.parts.weaponMount.add(this.playerWeaponGroup);
    this.playerMesh.parts.rightArm.rotation.x = -Math.PI / 3;

    // 10. Spawn Bots across POIs
    this.spawnBots();

    // 11. Bullet reusable assets
    this.bulletGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 6);
    this.bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });

    // 12. Bind Listeners
    this.bindInputs();

    // 13. Pre-warm shaders
    if (!this.isSoftwareGl) {
      try {
        this.renderer.compile(this.scene, this.camera);
      } catch {
        // no-op
      }
    }

    // 14. Start Game Loop
    this.startLoop();
  }

  private buildTerrain() {
    // Large Island Ground Plane
    const terrainGeo = new THREE.PlaneGeometry(550, 550, 32, 32);
    // Displace vertices subtly for rolling military hills
    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      // Gentle elevation around POIs
      const hill = Math.sin(vx * 0.015) * Math.cos(vy * 0.015) * 3.5;
      pos.setZ(i, hill);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x273624,
      roughness: 0.9,
      metalness: 0.05,
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.y = 0;
    terrain.receiveShadow = true;
    this.scene.add(terrain);

    // Surrounding Ocean Water
    const waterGeo = new THREE.PlaneGeometry(1200, 1200);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0f2b38,
      roughness: 0.15,
      metalness: 0.8,
      transparent: true,
      opacity: 0.9,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.4;
    this.scene.add(water);

    // Island Coast Sand Ring
    const sandRingGeo = new THREE.RingGeometry(240, 275, 48);
    const sandRingMat = new THREE.MeshStandardMaterial({
      color: 0x8a7756,
      roughness: 0.95,
      side: THREE.DoubleSide,
    });
    const sandRing = new THREE.Mesh(sandRingGeo, sandRingMat);
    sandRing.rotation.x = -Math.PI / 2;
    sandRing.position.y = -0.15;
    this.scene.add(sandRing);
  }

  private spawnObstacles() {
    MAP_OBSTACLES.forEach((obs) => {
      let mesh: THREE.Group | null = null;
      if (obs.type === 'hangar') {
        mesh = createMilitaryHangar();
      } else if (obs.type === 'watchtower') {
        mesh = createWatchtower();
      } else if (obs.type === 'container') {
        mesh = createCargoContainer(obs.color);
      } else if (obs.type === 'truck') {
        mesh = createTacticalTruck();
      } else if (obs.type === 'tree') {
        mesh = createPineTree();
      }

      if (mesh) {
        mesh.position.set(obs.x, 0, obs.z);
        if (obs.rotation) mesh.rotation.y = obs.rotation;
        this.scene.add(mesh);
      }
    });
  }

  private spawnLootMeshes() {
    this.lootItems.forEach((item) => {
      const crate = createTacticalLootCrate(item.rarity);
      crate.position.set(item.x, 0, item.z);
      this.scene.add(crate);
      this.lootMeshes.set(item.id, crate);
    });
  }

  private spawnGraceTimer = 5.0; // 5-second initial airdrop landing protection

  private spawnBots() {
    const botCount = Math.min(this.settings.botCount || 10, 16);
    const difficulty = this.settings.botDifficulty || 'normal';

    // Filter POIs that are not right on top of the player's initial landing zone (0, 0, 15)
    const distantPois = FRONTIER_POIS.filter((p) => Math.hypot(p.x, p.z) > 40);

    for (let i = 0; i < botCount; i++) {
      const name = BOT_NAMES[i % BOT_NAMES.length];
      const poi = distantPois[i % distantPois.length];
      const offsetX = (Math.random() - 0.5) * 35;
      const offsetZ = (Math.random() - 0.5) * 35;
      const bot = createBot(
        `bot_${i + 1}`,
        name,
        difficulty,
        poi.x + offsetX,
        poi.z + offsetZ,
        i % 2 === 0 ? '#384333' : '#2b3341'
      );
      this.bots.push(bot);
      this.scene.add(bot.mesh);
    }
  }

  private bindInputs() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleBlur);
    window.addEventListener('resize', this.handleResize);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    this.keys[e.code] = true;

    if (e.code === 'KeyR' && !this.isReloading) {
      this.startReload();
    }
    if (e.code === 'KeyC') {
      this.isCrouching = !this.isCrouching;
    }
    if (e.code === 'KeyE') {
      this.pickupNearestLoot();
    }
    if (e.code === 'Digit1') {
      this.switchWeapon(0);
    }
    if (e.code === 'Digit2') {
      this.switchWeapon(1);
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys[e.code] = false;
  };

  private handleBlur = () => {
    this.keys = {};
    this.isShootingHeld = false;
  };

  private handleResize = () => {
    if (!this.container || !this.renderer || !this.camera) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / Math.max(h, 1);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  // --- Weapon Actions ---
  public shoot() {
    if (!this.isAlive || this.isReloading) return;

    const now = performance.now() / 1000;
    const fireInterval = 60 / this.primaryWeapon.fireRate;
    if (now - this.lastShotTime < fireInterval) return;

    if (this.ammoInMag <= 0) {
      this.startReload();
      return;
    }

    this.lastShotTime = now;
    this.ammoInMag -= 1;

    // Play procedural sound
    soundManager.playGunshot(this.primaryWeapon.category as any);

    // Add recoil kick
    this.cameraPitch -= this.primaryWeapon.recoil * 0.04;
    this.trauma = Math.min(1.0, this.trauma + this.primaryWeapon.recoil * 0.35);

    // Project bullet in forward camera aim direction
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);

    // Apply spread
    const spreadVal = this.isAiming ? this.primaryWeapon.spread * 0.4 : this.primaryWeapon.spread;
    forward.x += (Math.random() - 0.5) * spreadVal;
    forward.y += (Math.random() - 0.5) * spreadVal;
    forward.z += (Math.random() - 0.5) * spreadVal;
    forward.normalize();

    const spawnPoint = this.playerPos.clone().add(new THREE.Vector3(0, 1.4, 0)).addScaledVector(forward, 0.8);

    const bulletMesh = new THREE.Mesh(this.bulletGeometry, this.bulletMaterial);
    bulletMesh.position.copy(spawnPoint);
    bulletMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), forward);
    this.scene.add(bulletMesh);

    this.bullets.push({
      pos: spawnPoint,
      dir: forward,
      speed: this.primaryWeapon.bulletSpeed,
      distanceLeft: this.primaryWeapon.range,
      damage: this.primaryWeapon.damage,
      isPlayerShot: true,
      mesh: bulletMesh,
    });
  }

  public startReload() {
    if (this.isReloading) return;
    const needed = this.primaryWeapon.magazineCapacity - this.ammoInMag;
    const available = this.ammoInventory[this.primaryWeapon.ammoType] || 0;
    if (needed <= 0 || available <= 0) return;

    this.isReloading = true;
    this.reloadTimer = this.primaryWeapon.reloadTime;
    soundManager.playReload();
  }

  public switchWeapon(index: number) {
    if (index === 1 && this.secondaryWeapon) {
      const temp = this.primaryWeapon;
      this.primaryWeapon = this.secondaryWeapon;
      this.secondaryWeapon = temp;
      this.ammoInMag = this.primaryWeapon.magazineCapacity;
      this.isReloading = false;

      // Recreate 3D weapon mesh
      this.playerMesh.parts.weaponMount.clear();
      this.playerWeaponGroup = createWeaponMesh(this.primaryWeapon.category);
      this.playerMesh.parts.weaponMount.add(this.playerWeaponGroup);
      soundManager.playReload();
    }
  }

  public pickupNearestLoot() {
    const nearby = this.getNearbyLoot(3.5);
    if (nearby.length > 0) {
      const item = nearby[0];
      this.collectLoot(item);
    }
  }

  public collectLoot(item: LootItem) {
    soundManager.playLootPickup();

    if (item.type === 'weapon' && item.weaponDefId && WEAPON_DATABASE[item.weaponDefId]) {
      this.primaryWeapon = WEAPON_DATABASE[item.weaponDefId];
      this.ammoInMag = this.primaryWeapon.magazineCapacity;
      this.isReloading = false;

      this.playerMesh.parts.weaponMount.clear();
      this.playerWeaponGroup = createWeaponMesh(this.primaryWeapon.category);
      this.playerMesh.parts.weaponMount.add(this.playerWeaponGroup);
    } else if (item.type === 'ammo' && item.ammoType) {
      this.ammoInventory[item.ammoType] = (this.ammoInventory[item.ammoType] || 0) + item.amount;
    } else if (item.type === 'armor' && item.level) {
      this.armorLevel = Math.max(this.armorLevel, item.level);
      this.armor = Math.min(this.maxArmor, this.armor + 50);
    } else if (item.type === 'helmet' && item.level) {
      this.helmetLevel = Math.max(this.helmetLevel, item.level);
    } else if (item.type === 'backpack' && item.level) {
      this.backpackLevel = Math.max(this.backpackLevel, item.level);
    } else if (item.type === 'medkit') {
      this.health = Math.min(this.maxHealth, this.health + 75);
    } else if (item.type === 'bandage') {
      this.health = Math.min(this.maxHealth, this.health + 25);
    }

    // Remove from world & mesh map
    this.lootItems = this.lootItems.filter((l) => l.id !== item.id);
    const mesh = this.lootMeshes.get(item.id);
    if (mesh) {
      this.scene.remove(mesh);
      this.lootMeshes.delete(item.id);
    }
  }

  public getNearbyLoot(maxDist = 3.8): LootItem[] {
    return this.lootItems.filter((item) => {
      const dx = item.x - this.playerPos.x;
      const dz = item.z - this.playerPos.z;
      return dx * dx + dz * dz <= maxDist * maxDist;
    });
  }

  // --- Main Simulation Loop ---
  private startLoop() {
    const tick = () => {
      if (this.isDestroyed) return;

      const now = performance.now();
      const rawDt = (now - this.lastTime) / 1000;
      this.lastTime = now;
      const dt = Math.min(rawDt, 0.05); // clamped dt for collision safety

      this.updateSimulation(dt);
      this.render();

      if (this.isSoftwareGl) {
        this.afterDraw(tick);
      } else {
        this.animFrameId = requestAnimationFrame(tick);
      }
    };

    if (this.isSoftwareGl) {
      this.afterDraw(tick);
    } else {
      this.animFrameId = requestAnimationFrame(tick);
    }
  }

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.isDestroyed) return;
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.animFrameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.animFrameId = window.setTimeout(cb, 60);
      }
    };
    this.animFrameId = window.setTimeout(poll, 5);
  }

  private updateSimulation(dt: number) {
    if (!this.isAlive) return;

    this.matchTime += dt;
    if (this.spawnGraceTimer > 0) {
      this.spawnGraceTimer -= dt;
    }

    // 1. Advance Safe Zone
    this.safeZoneState = advanceSafeZone(this.safeZoneState, FAST_SAFE_ZONE_PHASES, dt);

    // Update safe zone visual mesh
    this.safeZoneMesh.position.set(this.safeZoneState.currentCenter.x, 30, this.safeZoneState.currentCenter.z);
    this.safeZoneMesh.scale.set(this.safeZoneState.currentRadius, 1, this.safeZoneState.currentRadius);

    this.dangerZoneMesh.position.set(this.safeZoneState.targetCenter.x, 0.1, this.safeZoneState.targetCenter.z);
    this.dangerZoneMesh.scale.set(this.safeZoneState.targetRadius, this.safeZoneState.targetRadius, 1);

    // Safe zone damage tick to player
    this.safeZoneDamageTimer += dt;
    if (this.safeZoneDamageTimer >= 1.0) {
      this.safeZoneDamageTimer = 0;
      const inZone = isInsideSafeZone(
        this.playerPos.x,
        this.playerPos.z,
        this.safeZoneState.currentCenter.x,
        this.safeZoneState.currentCenter.z,
        this.safeZoneState.currentRadius
      );
      if (!inZone) {
        this.health -= this.safeZoneState.damagePerSec;
        this.trauma = Math.min(1.0, this.trauma + 0.3);
        soundManager.playZoneAlert();
        if (this.health <= 0) {
          this.health = 0;
          this.isAlive = false;
          soundManager.playDefeat();
          this.callbacks.onDefeat({
            kills: this.killCount,
            damage: Math.round(this.damageDealt),
            time: Math.round(this.matchTime),
            killerName: 'Deadly Zone Barrier',
          });
        }
      }
    }

    // 2. Player Reload Progress
    if (this.isReloading) {
      this.reloadTimer -= dt;
      if (this.reloadTimer <= 0) {
        this.isReloading = false;
        const needed = this.primaryWeapon.magazineCapacity - this.ammoInMag;
        const available = this.ammoInventory[this.primaryWeapon.ammoType] || 0;
        const loaded = Math.min(needed, available);
        this.ammoInMag += loaded;
        this.ammoInventory[this.primaryWeapon.ammoType] = available - loaded;
      }
    }

    // 3. Continuous Shooting
    if (this.isShootingHeld && !this.isReloading) {
      this.shoot();
    }

    // 4. Player Movement Input
    let moveX = 0;
    let moveZ = 0;

    // Keyboard WASD
    if (this.keys['KeyW']) moveZ -= 1;
    if (this.keys['KeyS']) moveZ += 1;
    if (this.keys['KeyA']) moveX -= 1;
    if (this.keys['KeyD']) moveX += 1;

    // Mobile Virtual Joystick
    if (Math.abs(this.joystickVector.x) > 0.05 || Math.abs(this.joystickVector.y) > 0.05) {
      moveX += this.joystickVector.x;
      moveZ += this.joystickVector.y;
    }

    // Camera touch swipe delta
    if (Math.abs(this.lookTouchDelta.x) > 0 || Math.abs(this.lookTouchDelta.y) > 0) {
      const sens = this.settings.cameraSensitivity * 0.003;
      this.cameraYaw -= this.lookTouchDelta.x * sens;
      this.cameraPitch = Math.max(-0.4, Math.min(0.85, this.cameraPitch + this.lookTouchDelta.y * sens));
      this.lookTouchDelta = { x: 0, y: 0 };
    }

    // Normalize movement vector
    const moveLen = Math.hypot(moveX, moveZ);
    if (moveLen > 1) {
      moveX /= moveLen;
      moveZ /= moveLen;
    }

    // Calculate forward and right relative to camera yaw
    const forward = new THREE.Vector3(-Math.sin(this.cameraYaw), 0, -Math.cos(this.cameraYaw));
    const right = new THREE.Vector3(Math.cos(this.cameraYaw), 0, -Math.sin(this.cameraYaw));

    const moveDirection = new THREE.Vector3()
      .addScaledVector(forward, -moveZ)
      .addScaledVector(right, moveX);

    this.isSprinting = !!this.keys['ShiftLeft'] || (this.settings.autoSprint && moveLen > 0.85);
    const baseSpeed = this.isCrouching ? 2.5 : this.isSprinting ? 7.2 : 4.8;
    this.playerVelocity.copy(moveDirection).multiplyScalar(baseSpeed);

    // Apply movement & collision with obstacles
    const nextPos = this.playerPos.clone().addScaledVector(this.playerVelocity, dt);
    let collided = false;
    for (const obs of MAP_OBSTACLES) {
      const dist = Math.hypot(nextPos.x - obs.x, nextPos.z - obs.z);
      if (dist < obs.radius + 0.6) {
        collided = true;
        break;
      }
    }
    if (!collided) {
      this.playerPos.copy(nextPos);
    }

    // Keep on island bounds
    this.playerPos.x = Math.max(-240, Math.min(240, this.playerPos.x));
    this.playerPos.z = Math.max(-240, Math.min(240, this.playerPos.z));

    // Update Player Model
    this.playerMesh.position.copy(this.playerPos);
    this.playerRotationY = this.cameraYaw;
    this.playerMesh.rotation.y = this.playerRotationY;

    // Operator animation
    this.playerMesh.animTime += dt * (moveLen > 0.1 ? (this.isSprinting ? 12 : 8) : 1.2);
    const legWalk = Math.sin(this.playerMesh.animTime);

    if (moveLen > 0.1) {
      this.playerMesh.parts.leftLeg.rotation.x = legWalk * 0.65;
      this.playerMesh.parts.rightLeg.rotation.x = -legWalk * 0.65;
      this.playerMesh.parts.leftArm.rotation.x = -legWalk * 0.45;

      // Play footstep audio periodically
      if (Math.abs(legWalk) > 0.95 && Math.random() < 0.15) {
        soundManager.playFootstep(this.isSprinting ? 1.4 : 1.0);
      }
    } else {
      this.playerMesh.parts.leftLeg.rotation.x = 0;
      this.playerMesh.parts.rightLeg.rotation.x = 0;
      this.playerMesh.parts.leftArm.rotation.x = 0.2;
    }

    // 5. Update Third-Person Camera with exponential damping
    const targetDist = this.isAiming ? 2.6 : 4.6;
    this.cameraDist = THREE.MathUtils.damp(this.cameraDist, targetDist, 10, dt);

    const camOffset = new THREE.Vector3(
      Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch) * this.cameraDist,
      Math.sin(this.cameraPitch) * this.cameraDist + (this.isCrouching ? 1.2 : 1.8),
      Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch) * this.cameraDist
    );

    // Camera Trauma Decay
    if (this.trauma > 0) {
      this.trauma = Math.max(0, this.trauma - dt * 2.0);
      const shake = this.trauma * this.trauma * 0.08;
      camOffset.x += (Math.random() - 0.5) * shake;
      camOffset.y += (Math.random() - 0.5) * shake;
      camOffset.z += (Math.random() - 0.5) * shake;
    }

    this.camera.position.copy(this.playerPos).add(camOffset);
    const lookTarget = this.playerPos.clone().add(new THREE.Vector3(0, this.isCrouching ? 1.1 : 1.6, 0));
    this.camera.lookAt(lookTarget);

    // 6. Update Bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      const stepDist = b.speed * dt;
      b.pos.addScaledVector(b.dir, stepDist);
      b.mesh.position.copy(b.pos);
      b.distanceLeft -= stepDist;

      // Hit test against Bots (if shot by player)
      if (b.isPlayerShot) {
        for (const bot of this.bots) {
          if (!bot.isAlive) continue;
          const distToBot = b.pos.distanceTo(bot.position.clone().add(new THREE.Vector3(0, 1.2, 0)));
          if (distToBot < 1.1) {
            // Hit Bot!
            const isHead = b.pos.y > bot.position.y + 1.6;
            const dmgCalc = calculateDamage(b.damage, isHead, bot.armorLevel, bot.helmetLevel);

            bot.health -= dmgCalc.finalHealthDamage;
            this.damageDealt += dmgCalc.finalHealthDamage;

            this.hitCrosshairTimer = 0.15;
            this.hitWasHeadshot = isHead;
            soundManager.playHitmarker(isHead);

            if (bot.health <= 0) {
              bot.health = 0;
              bot.isAlive = false;
              this.scene.remove(bot.mesh);
              this.killCount += 1;
              soundManager.playKillElimination();

              // Drop death crate at bot location
              const deathCrate = createTacticalLootCrate('legendary');
              deathCrate.position.set(bot.position.x, 0, bot.position.z);
              this.scene.add(deathCrate);
            }

            // Remove bullet
            this.scene.remove(b.mesh);
            this.bullets.splice(i, 1);
            break;
          }
        }
      }

      if (b.distanceLeft <= 0) {
        this.scene.remove(b.mesh);
        this.bullets.splice(i, 1);
      }
    }

    // 7. Update Bot AI & Firing
    const aliveBots = this.bots.filter((b) => b.isAlive);
    for (const bot of aliveBots) {
      const decision = updateBotAI(
        bot,
        dt,
        this.playerPos,
        this.isAlive,
        this.safeZoneState.currentCenter,
        this.safeZoneState.currentRadius,
        this.bots,
        this.matchTime
      );

      if (decision.shouldShoot && decision.shootDirection) {
        soundManager.playGunshot(bot.weapon.category as any);

        if (decision.hitTarget && this.spawnGraceTimer <= 0) {
          // Bot hits player
          const dmg = calculateDamage(decision.damage, decision.isHeadshot, this.armorLevel, this.helmetLevel);
          if (this.armor > 0) {
            this.armor = Math.max(0, this.armor - dmg.armorDamage);
          }
          this.health -= dmg.finalHealthDamage;
          this.trauma = Math.min(1.0, this.trauma + 0.45);

          if (this.health <= 0) {
            this.health = 0;
            this.isAlive = false;
            soundManager.playDefeat();
            this.callbacks.onDefeat({
              kills: this.killCount,
              damage: Math.round(this.damageDealt),
              time: Math.round(this.matchTime),
              killerName: bot.name,
            });
            break;
          }
        }
      }
    }

    // Check Victory Condition
    const totalAlive = aliveBots.length + (this.isAlive ? 1 : 0);
    if (totalAlive === 1 && this.isAlive) {
      soundManager.playVictory();
      this.callbacks.onVictory({
        kills: this.killCount,
        damage: Math.round(this.damageDealt),
        time: Math.round(this.matchTime),
      });
    }

    // 8. Auto-pickup loot if enabled
    if (this.settings.autoPickup) {
      const nearby = this.getNearbyLoot(2.0);
      if (nearby.length > 0) {
        // Collect ammo and meds automatically
        const autoCollect = nearby.filter((i) => i.type === 'ammo' || i.type === 'medkit' || i.type === 'bandage');
        if (autoCollect.length > 0) {
          this.collectLoot(autoCollect[0]);
        }
      }
    }

    // 9. Throttle React HUD updates
    if (this.hitCrosshairTimer > 0) {
      this.hitCrosshairTimer -= dt;
    }

    const headingDeg = Math.round(((-this.cameraYaw * 180) / Math.PI + 360) % 360);

    this.callbacks.onHUDUpdate({
      health: Math.max(0, Math.round(this.health)),
      maxHealth: this.maxHealth,
      armor: Math.max(0, Math.round(this.armor)),
      maxArmor: this.maxArmor,
      armorLevel: this.armorLevel,
      helmetLevel: this.helmetLevel,
      backpackLevel: this.backpackLevel,
      activeWeapon: this.primaryWeapon,
      secondaryWeapon: this.secondaryWeapon,
      ammoInMag: this.ammoInMag,
      reserveAmmo: this.ammoInventory[this.primaryWeapon.ammoType] || 0,
      aliveCount: totalAlive,
      killCount: this.killCount,
      damageDealt: Math.round(this.damageDealt),
      safeZone: this.safeZoneState,
      nearbyLoot: this.getNearbyLoot(3.8),
      isAiming: this.isAiming,
      isReloading: this.isReloading,
      isCrouching: this.isCrouching,
      matchTime: Math.round(this.matchTime),
      crosshairHit: this.hitCrosshairTimer > 0,
      isHeadshotHit: this.hitWasHeadshot,
      compassHeading: headingDeg,
    });
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  public destroy() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.animFrameId);
    clearTimeout(this.animFrameId);

    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);
    window.removeEventListener('resize', this.handleResize);

    try {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    } catch {
      // no-op
    }
  }
}
