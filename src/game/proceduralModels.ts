/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { WeaponCategory } from '../types/game';

// Procedural Canvas Textures for Realistic Military Texturing
export function createCamoTexture(color1 = '#3a4435', color2 = '#232820', color3 = '#515e4a'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = color1;
  ctx.fillRect(0, 0, 256, 256);

  // Organic camo patches
  for (let i = 0; i < 28; i++) {
    ctx.fillStyle = i % 2 === 0 ? color2 : color3;
    ctx.beginPath();
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const r = 16 + Math.random() * 32;
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 15, y - 10, r * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createMetalGridTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#22252a';
  ctx.fillRect(0, 0, 128, 128);

  ctx.strokeStyle = '#333842';
  ctx.lineWidth = 2;
  for (let x = 0; x <= 128; x += 16) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 128);
    ctx.stroke();
  }
  for (let y = 0; y <= 128; y += 16) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(128, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createContainerCorrugatedTexture(baseColor = '#993322'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 128, 128);

  for (let x = 0; x < 128; x += 16) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x, 0, 6, 128);
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(x + 6, 0, 4, 128);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// --- Composite 3D Tactical Operator Model ---
export interface OperatorMeshGroup extends THREE.Group {
  parts: {
    head: THREE.Mesh;
    helmet: THREE.Mesh;
    vest: THREE.Mesh;
    backpack: THREE.Mesh;
    rightArm: THREE.Group;
    leftArm: THREE.Group;
    rightLeg: THREE.Mesh;
    leftLeg: THREE.Mesh;
    weaponMount: THREE.Group;
  };
  animTime: number;
}

export function createOperatorMesh(
  camoColor = '#2b3628',
  vestColor = '#1e231c',
  skinTone = '#d2a679'
): OperatorMeshGroup {
  const group = new THREE.Group() as OperatorMeshGroup;

  const skinMat = new THREE.MeshStandardMaterial({ color: skinTone, roughness: 0.6 });
  const uniformMat = new THREE.MeshStandardMaterial({
    color: camoColor,
    roughness: 0.8,
    metalness: 0.1,
  });
  const vestMat = new THREE.MeshStandardMaterial({
    color: vestColor,
    roughness: 0.5,
    metalness: 0.3,
  });
  const blackMat = new THREE.MeshStandardMaterial({
    color: 0x141619,
    roughness: 0.4,
    metalness: 0.6,
  });
  const visorMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.1,
    metalness: 0.9,
  });

  // 1. Pelvis / Lower Body
  const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.35), uniformMat);
  pelvis.position.y = 0.95;
  pelvis.castShadow = true;
  group.add(pelvis);

  // 2. Torso
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.65, 0.38), uniformMat);
  torso.position.y = 1.35;
  torso.castShadow = true;
  group.add(torso);

  // 3. Tactical Ballistic Vest (Accent & Secondary silhouette)
  const vest = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.52, 0.44), vestMat);
  vest.position.y = 1.36;
  vest.castShadow = true;
  group.add(vest);

  // Vest pouches
  const pouchGeom = new THREE.BoxGeometry(0.12, 0.14, 0.1);
  const pouchL = new THREE.Mesh(pouchGeom, blackMat);
  pouchL.position.set(-0.16, 1.25, 0.24);
  const pouchC = new THREE.Mesh(pouchGeom, blackMat);
  pouchC.position.set(0, 1.25, 0.24);
  const pouchR = new THREE.Mesh(pouchGeom, blackMat);
  pouchR.position.set(0.16, 1.25, 0.24);
  group.add(pouchL, pouchC, pouchR);

  // 4. Tactical Backpack
  const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.55, 0.24), vestMat);
  backpack.position.set(0, 1.36, -0.28);
  backpack.castShadow = true;
  group.add(backpack);

  // 5. Head
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.3, 0.28), skinMat);
  head.position.y = 1.82;
  head.castShadow = true;
  group.add(head);

  // 6. Tactical Kevlar Helmet & Visor
  const helmet = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.24, 0.34), vestMat);
  helmet.position.set(0, 1.94, 0);
  helmet.castShadow = true;
  group.add(helmet);

  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.08, 0.06), visorMat);
  visor.position.set(0, 1.84, 0.16);
  group.add(visor);

  // 7. Left & Right Legs
  const legGeom = new THREE.BoxGeometry(0.2, 0.85, 0.22);
  const leftLeg = new THREE.Mesh(legGeom, uniformMat);
  leftLeg.position.set(-0.16, 0.45, 0);
  leftLeg.castShadow = true;

  const rightLeg = new THREE.Mesh(legGeom, uniformMat);
  rightLeg.position.set(0.16, 0.45, 0);
  rightLeg.castShadow = true;

  // Combat boots
  const bootGeom = new THREE.BoxGeometry(0.22, 0.16, 0.3);
  const leftBoot = new THREE.Mesh(bootGeom, blackMat);
  leftBoot.position.set(0, -0.38, 0.04);
  leftLeg.add(leftBoot);

  const rightBoot = new THREE.Mesh(bootGeom, blackMat);
  rightBoot.position.set(0, -0.38, 0.04);
  rightLeg.add(rightBoot);

  group.add(leftLeg, rightLeg);

  // 8. Arms and Weapon Mount
  const armGeom = new THREE.BoxGeometry(0.16, 0.65, 0.16);

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.38, 1.6, 0);
  const leftArmMesh = new THREE.Mesh(armGeom, uniformMat);
  leftArmMesh.position.y = -0.28;
  leftArmMesh.castShadow = true;
  leftArm.add(leftArmMesh);
  group.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.38, 1.6, 0);
  const rightArmMesh = new THREE.Mesh(armGeom, uniformMat);
  rightArmMesh.position.y = -0.28;
  rightArmMesh.castShadow = true;
  rightArm.add(rightArmMesh);
  group.add(rightArm);

  // Weapon Mount Anchor (attached to right arm / chest area)
  const weaponMount = new THREE.Group();
  weaponMount.position.set(0.25, 1.3, 0.4);
  group.add(weaponMount);

  // Contact shadow disc on floor
  const shadowGeo = new THREE.CircleGeometry(0.5, 16);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
  });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.015;
  group.add(shadow);

  group.parts = {
    head,
    helmet,
    vest,
    backpack,
    rightArm,
    leftArm,
    rightLeg,
    leftLeg,
    weaponMount,
  };
  group.animTime = 0;

  return group;
}

// --- Composite 3D Weapon Models ---
export function createWeaponMesh(category: WeaponCategory, skinColor = '#2d333b'): THREE.Group {
  const group = new THREE.Group();

  const gunMetal = new THREE.MeshStandardMaterial({
    color: 0x1f2328,
    metalness: 0.85,
    roughness: 0.25,
  });
  const camoBody = new THREE.MeshStandardMaterial({
    color: skinColor,
    metalness: 0.4,
    roughness: 0.5,
  });
  const orangeAccent = new THREE.MeshStandardMaterial({
    color: 0xf97316,
    metalness: 0.5,
    roughness: 0.3,
  });

  if (category === 'assault_rifle') {
    // Receiver / Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.45), camoBody);
    body.position.z = 0;
    group.add(body);

    // Barrel
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8), gunMetal);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.02, 0.38);
    group.add(barrel);

    // Handguard
    const handguard = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.09, 0.25), camoBody);
    handguard.position.set(0, 0.02, 0.25);
    group.add(handguard);

    // Tactical Stock
    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.15, 0.26), gunMetal);
    stock.position.set(0, -0.01, -0.32);
    group.add(stock);

    // Curved Curved Magazine
    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.22, 0.1), gunMetal);
    mag.rotation.x = -0.2;
    mag.position.set(0, -0.16, 0.05);
    group.add(mag);

    // Tactical Holo Sight
    const sightBase = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 0.12), gunMetal);
    sightBase.position.set(0, 0.1, 0.02);
    const sightReticle = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, 0.02), orangeAccent);
    sightReticle.position.set(0, 0.13, 0.02);
    group.add(sightBase, sightReticle);

    // Muzzle Brake
    const muzzle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.08, 8), gunMetal);
    muzzle.rotation.x = Math.PI / 2;
    muzzle.position.set(0, 0.02, 0.6);
    group.add(muzzle);
  } else if (category === 'sniper_rifle') {
    // Long heavy receiver
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.16, 0.6), camoBody);
    group.add(body);

    // Long fluted barrel
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.75, 8), gunMetal);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.03, 0.58);
    group.add(barrel);

    // High magnification Scope
    const scopeTube = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.32, 12), gunMetal);
    scopeTube.rotation.x = Math.PI / 2;
    scopeTube.position.set(0, 0.14, 0.02);
    const scopeRingF = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.06, 12), orangeAccent);
    scopeRingF.rotation.x = Math.PI / 2;
    scopeRingF.position.set(0, 0.14, 0.14);
    group.add(scopeTube, scopeRingF);

    // Stock & Bipod
    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.16, 0.35), gunMetal);
    stock.position.set(0, -0.02, -0.42);
    group.add(stock);
  } else if (category === 'submachine_gun') {
    // Compact SMG
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.12, 0.32), camoBody);
    group.add(body);

    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.22, 8), gunMetal);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.01, 0.22);
    group.add(barrel);

    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.25, 0.06), gunMetal);
    mag.position.set(0, -0.18, 0.04);
    group.add(mag);

    const foldStock = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.2), gunMetal);
    foldStock.position.set(0, 0.02, -0.22);
    group.add(foldStock);
  } else if (category === 'shotgun') {
    // Heavy dual-tube shotgun
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.16, 0.42), camoBody);
    group.add(body);

    const barrel1 = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.45, 8), gunMetal);
    barrel1.rotation.x = Math.PI / 2;
    barrel1.position.set(0, 0.03, 0.4);

    const magTube = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.4, 8), gunMetal);
    magTube.rotation.x = Math.PI / 2;
    magTube.position.set(0, -0.03, 0.38);

    const pumpGrip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.09, 0.16), orangeAccent);
    pumpGrip.position.set(0, -0.03, 0.32);

    group.add(barrel1, magTube, pumpGrip);
  } else if (category === 'pistol') {
    const slide = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.22), gunMetal);
    slide.position.set(0, 0.04, 0);

    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 0.08), camoBody);
    grip.rotation.x = 0.2;
    grip.position.set(0, -0.06, -0.04);

    group.add(slide, grip);
  } else {
    // Melee combat knife
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.06, 0.28), gunMetal);
    blade.position.set(0, 0, 0.14);

    const hilt = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 0.12), camoBody);
    hilt.position.set(0, 0, -0.06);

    group.add(blade, hilt);
  }

  // Scale weapon group for character holding
  group.scale.set(0.85, 0.85, 0.85);
  return group;
}

// --- Composite 3D Map Props (Hangars, Containers, Watchtowers, Loot Crates) ---

export function createMilitaryHangar(): THREE.Group {
  const hangar = new THREE.Group();

  const metalTexture = createMetalGridTexture();
  const hangarMat = new THREE.MeshStandardMaterial({
    color: 0x4a5568,
    roughness: 0.6,
    metalness: 0.5,
    map: metalTexture,
  });
  const ribMat = new THREE.MeshStandardMaterial({
    color: 0x2d3748,
    roughness: 0.4,
    metalness: 0.7,
  });

  // Half-cylinder roof
  const archGeom = new THREE.CylinderGeometry(14, 14, 28, 16, 1, false, 0, Math.PI);
  const archMesh = new THREE.Mesh(archGeom, hangarMat);
  archMesh.rotation.z = Math.PI / 2;
  archMesh.position.set(0, 0, 0);
  archMesh.castShadow = true;
  archMesh.receiveShadow = true;
  hangar.add(archMesh);

  // Exterior structural arches (ribs)
  for (let z = -12; z <= 12; z += 6) {
    const ribGeom = new THREE.TorusGeometry(14.2, 0.4, 8, 24, Math.PI);
    const ribMesh = new THREE.Mesh(ribGeom, ribMat);
    ribMesh.position.set(0, 0, z);
    hangar.add(ribMesh);
  }

  // Interior concrete floor
  const floorGeom = new THREE.PlaneGeometry(28, 28);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x24282f, roughness: 0.9 });
  const floor = new THREE.Mesh(floorGeom, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  hangar.add(floor);

  return hangar;
}

export function createWatchtower(): THREE.Group {
  const tower = new THREE.Group();

  const steelMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.5,
    metalness: 0.7,
  });
  const platformMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.8,
    metalness: 0.3,
  });

  // 4 Main Pillars
  const legGeom = new THREE.CylinderGeometry(0.2, 0.28, 12, 6);
  const positions = [
    [-2.2, 6, -2.2],
    [2.2, 6, -2.2],
    [-2.2, 6, 2.2],
    [2.2, 6, 2.2],
  ];
  positions.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(legGeom, steelMat);
    leg.position.set(x, y, z);
    leg.castShadow = true;
    tower.add(leg);
  });

  // Platform at top
  const platform = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.4, 5.2), platformMat);
  platform.position.y = 12;
  platform.castShadow = true;
  platform.receiveShadow = true;
  tower.add(platform);

  // Guard Rails
  const railMat = new THREE.MeshStandardMaterial({ color: 0xf97316, metalness: 0.4 });
  const railGeom = new THREE.BoxGeometry(5.2, 0.8, 0.1);
  const railN = new THREE.Mesh(railGeom, railMat);
  railN.position.set(0, 12.6, 2.55);
  const railS = new THREE.Mesh(railGeom, railMat);
  railS.position.set(0, 12.6, -2.55);
  tower.add(railN, railS);

  // Roof
  const roof = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.25, 5.6), steelMat);
  roof.position.y = 15;
  roof.castShadow = true;
  tower.add(roof);

  return tower;
}

export function createCargoContainer(color = '#b91c1c'): THREE.Group {
  const container = new THREE.Group();
  const tex = createContainerCorrugatedTexture(color);

  const mat = new THREE.MeshStandardMaterial({
    map: tex,
    roughness: 0.6,
    metalness: 0.4,
  });
  const cornerMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.4,
    metalness: 0.8,
  });

  const body = new THREE.Mesh(new THREE.BoxGeometry(3.5, 3.2, 8.5), mat);
  body.position.y = 1.6;
  body.castShadow = true;
  body.receiveShadow = true;
  container.add(body);

  // Corner reinforcement castings
  const cornerGeom = new THREE.BoxGeometry(0.35, 3.25, 0.35);
  const corners = [
    [-1.75, 1.6, -4.25],
    [1.75, 1.6, -4.25],
    [-1.75, 1.6, 4.25],
    [1.75, 1.6, 4.25],
  ];
  corners.forEach(([x, y, z]) => {
    const c = new THREE.Mesh(cornerGeom, cornerMat);
    c.position.set(x, y, z);
    container.add(c);
  });

  return container;
}

export function createTacticalLootCrate(rarity = 'epic'): THREE.Group {
  const crate = new THREE.Group();

  const color =
    rarity === 'legendary' ? 0xeab308 : rarity === 'epic' ? 0xa855f7 : rarity === 'rare' ? 0x3b82f6 : 0x22c55e;

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x1f2937,
    roughness: 0.4,
    metalness: 0.7,
  });
  const glowMat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.6,
    roughness: 0.2,
  });

  const box = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 0.9), bodyMat);
  box.position.y = 0.3;
  box.castShadow = true;
  crate.add(box);

  // Rarity light band
  const band = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.1, 0.92), glowMat);
  band.position.y = 0.35;
  crate.add(band);

  return crate;
}

export function createTacticalTruck(): THREE.Group {
  const truck = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2e382d, roughness: 0.7, metalness: 0.3 });
  const cabMat = new THREE.MeshStandardMaterial({ color: 0x1f241e, roughness: 0.5, metalness: 0.5 });
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.9 });

  // Chassis / Bed
  const bed = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 5.5), bodyMat);
  bed.position.set(0, 1.3, -0.4);
  bed.castShadow = true;
  truck.add(bed);

  // Cab
  const cab = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.4, 2.2), cabMat);
  cab.position.set(0, 2.0, 1.5);
  cab.castShadow = true;
  truck.add(cab);

  // Windshield
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.7, 0.1), glassMat);
  windshield.position.set(0, 2.2, 2.62);
  windshield.rotation.x = 0.25;
  truck.add(windshield);

  // 4 Wheels
  const wheelGeom = new THREE.CylinderGeometry(0.55, 0.55, 0.45, 12);
  const wheels = [
    [-1.25, 0.55, 1.5],
    [1.25, 0.55, 1.5],
    [-1.25, 0.55, -1.8],
    [1.25, 0.55, -1.8],
  ];
  wheels.forEach(([x, y, z]) => {
    const w = new THREE.Mesh(wheelGeom, wheelMat);
    w.rotation.z = Math.PI / 2;
    w.position.set(x, y, z);
    w.castShadow = true;
    truck.add(w);
  });

  return truck;
}

export function createPineTree(): THREE.Group {
  const tree = new THREE.Group();

  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.9 });
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x1e3a1e, roughness: 0.8 });

  // Trunk
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 4.5, 6), trunkMat);
  trunk.position.y = 2.25;
  trunk.castShadow = true;
  tree.add(trunk);

  // 3 Tiers of Pine foliage
  const cone1 = new THREE.Mesh(new THREE.ConeGeometry(2.8, 3.5, 7), foliageMat);
  cone1.position.y = 4.2;
  cone1.castShadow = true;

  const cone2 = new THREE.Mesh(new THREE.ConeGeometry(2.2, 3.0, 7), foliageMat);
  cone2.position.y = 6.2;
  cone2.castShadow = true;

  const cone3 = new THREE.Mesh(new THREE.ConeGeometry(1.5, 2.5, 7), foliageMat);
  cone3.position.y = 7.8;
  cone3.castShadow = true;

  tree.add(cone1, cone2, cone3);

  return tree;
}
