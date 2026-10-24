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

export function createAnimeFaceTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Skin background
  ctx.fillStyle = '#ffe2d6';
  ctx.fillRect(0, 0, 128, 128);

  // Soft pink blush on cheeks
  ctx.fillStyle = 'rgba(251, 113, 133, 0.4)';
  ctx.beginPath();
  ctx.arc(28, 78, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(100, 78, 14, 0, Math.PI * 2);
  ctx.fill();

  // Left Eye (Big expressive dark anime chibi eye)
  ctx.fillStyle = '#111827';
  ctx.beginPath();
  ctx.ellipse(36, 52, 12, 17, 0, 0, Math.PI * 2);
  ctx.fill();

  // Left Eye white sparkles
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(33, 45, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(41, 58, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Right Eye
  ctx.fillStyle = '#111827';
  ctx.beginPath();
  ctx.ellipse(92, 52, 12, 17, 0, 0, Math.PI * 2);
  ctx.fill();

  // Right Eye white sparkles
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(89, 45, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(97, 58, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Delicate small smile
  ctx.strokeStyle = '#9f1239';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(64, 82, 8, 0.2, Math.PI - 0.2);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createGhostAnimeFaceTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Smooth fair skin
  ctx.fillStyle = '#f8ebd8';
  ctx.fillRect(0, 0, 256, 256);

  // Soft anime cheek blush
  ctx.fillStyle = 'rgba(244, 114, 182, 0.22)';
  ctx.beginPath();
  ctx.arc(56, 165, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(200, 165, 28, 0, Math.PI * 2);
  ctx.fill();

  // Left Eye: Focused anime style, sharp eyeliner, glowing cyan pupil
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(40, 110);
  ctx.quadraticCurveTo(75, 92, 110, 110);
  ctx.stroke();

  // Left Iris
  ctx.fillStyle = '#06b6d4';
  ctx.beginPath();
  ctx.ellipse(75, 120, 20, 26, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0891b2';
  ctx.beginPath();
  ctx.ellipse(75, 124, 14, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pupil
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(75, 122, 9, 0, Math.PI * 2);
  ctx.fill();

  // Glint highlights
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(68, 114, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(82, 128, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Left Eyebrow (cool silver-slate)
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(40, 86);
  ctx.quadraticCurveTo(72, 74, 108, 92);
  ctx.stroke();

  // Right Eye
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(146, 110);
  ctx.quadraticCurveTo(181, 92, 216, 110);
  ctx.stroke();

  // Right Iris
  ctx.fillStyle = '#06b6d4';
  ctx.beginPath();
  ctx.ellipse(181, 120, 20, 26, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0891b2';
  ctx.beginPath();
  ctx.ellipse(181, 124, 14, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Right Pupil
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(181, 122, 9, 0, Math.PI * 2);
  ctx.fill();

  // Right Eye highlights
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(174, 114, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(188, 128, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Right Eyebrow
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(148, 92);
  ctx.quadraticCurveTo(184, 74, 216, 86);
  ctx.stroke();

  // Delicate anime nose bridge
  ctx.strokeStyle = 'rgba(180, 83, 9, 0.35)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(128, 146);
  ctx.lineTo(125, 158);
  ctx.stroke();

  // Confident small smile / mouth
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(112, 186);
  ctx.quadraticCurveTo(128, 192, 144, 186);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createOperatorMesh(
  camoColor = '#2b3628',
  vestColor = '#1e231c',
  skinTone = '#d2a679',
  operatorId = 'op_ghost'
): OperatorMeshGroup {
  const group = new THREE.Group() as OperatorMeshGroup;
  const isGhostOp = operatorId === 'op_ghost' || operatorId === 'default' || operatorId === 'GHOSTOPERATOR';
  const isShadowOp = !isGhostOp && (operatorId === 'op_shadow' || camoColor === '#111827');

  const skinMat = isGhostOp
    ? new THREE.MeshStandardMaterial({
        color: 0xf8ebd8,
        roughness: 0.5,
        map: createGhostAnimeFaceTexture(),
      })
    : isShadowOp
    ? new THREE.MeshStandardMaterial({
        color: 0xffe2d6,
        roughness: 0.5,
        map: createAnimeFaceTexture(),
      })
    : new THREE.MeshStandardMaterial({ color: skinTone, roughness: 0.6 });

  // Outfits
  const mintGreenMat = new THREE.MeshStandardMaterial({
    color: 0x34d399, // Vibrant mint green
    roughness: 0.55,
    metalness: 0.1,
  });
  const darkTechMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.7,
    metalness: 0.2,
  });
  const tacticalRigMat = new THREE.MeshStandardMaterial({
    color: 0x111620,
    roughness: 0.45,
    metalness: 0.35,
  });
  const cyanGlowMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
  });
  const goldAccentMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.8,
    roughness: 0.3,
  });
  const silverHairMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.35,
    metalness: 0.15,
  });

  const uniformMat = isGhostOp
    ? mintGreenMat
    : isShadowOp
    ? new THREE.MeshStandardMaterial({ color: 0x14161a, roughness: 0.75, metalness: 0.1 })
    : new THREE.MeshStandardMaterial({ color: camoColor, roughness: 0.8, metalness: 0.1 });

  const vestMat = isGhostOp
    ? tacticalRigMat
    : isShadowOp
    ? new THREE.MeshStandardMaterial({ color: 0x181a1f, roughness: 0.5, metalness: 0.2 })
    : new THREE.MeshStandardMaterial({ color: vestColor, roughness: 0.5, metalness: 0.3 });

  const blackMat = new THREE.MeshStandardMaterial({
    color: 0x141619,
    roughness: 0.4,
    metalness: 0.6,
  });
  const whiteSneakerMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.3,
    metalness: 0.1,
  });
  const visorMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.1,
    metalness: 0.9,
  });

  // 1. Pelvis / Lower Body
  const pelvis = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.3, 0.35),
    isGhostOp ? darkTechMat : uniformMat
  );
  pelvis.position.y = 0.95;
  pelvis.castShadow = true;
  group.add(pelvis);

  // 2. Torso (Mint green tactical hoodie / jacket for Ghost)
  const torso = new THREE.Mesh(
    new THREE.BoxGeometry(isGhostOp ? 0.56 : isShadowOp ? 0.58 : 0.55, 0.65, isGhostOp ? 0.4 : isShadowOp ? 0.42 : 0.38),
    uniformMat
  );
  torso.position.y = 1.35;
  torso.castShadow = true;
  group.add(torso);

  // Ghost inner tech collar & zipper
  if (isGhostOp) {
    const collar = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.14, 0.28), darkTechMat);
    collar.position.set(0, 1.66, 0.02);
    group.add(collar);

    // Front silver zipper
    const zip = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.55, 0.02), silverHairMat);
    zip.position.set(0, 1.35, 0.21);
    group.add(zip);
  }

  // 3. Tactical Ballistic Vest / Chest Rig
  const vest = new THREE.Mesh(
    new THREE.BoxGeometry(isGhostOp ? 0.52 : isShadowOp ? 0.46 : 0.62, isGhostOp ? 0.42 : isShadowOp ? 0.24 : 0.52, isGhostOp ? 0.46 : isShadowOp ? 0.46 : 0.44),
    vestMat
  );
  vest.position.set(0, isGhostOp ? 1.34 : isShadowOp ? 1.22 : 1.36, isGhostOp ? 0.02 : isShadowOp ? 0.03 : 0);
  vest.castShadow = true;
  group.add(vest);

  if (isGhostOp) {
    // Front dual tactical magazine pouches
    const pouchGeom = new THREE.BoxGeometry(0.13, 0.18, 0.09);
    const pouchL = new THREE.Mesh(pouchGeom, darkTechMat);
    pouchL.position.set(-0.13, 1.28, 0.25);
    const pouchR = new THREE.Mesh(pouchGeom, darkTechMat);
    pouchR.position.set(0.13, 1.28, 0.25);
    group.add(pouchL, pouchR);

    // Chest metallic buckle clips
    const clipGeom = new THREE.BoxGeometry(0.06, 0.04, 0.02);
    const clipL = new THREE.Mesh(clipGeom, goldAccentMat);
    clipL.position.set(-0.13, 1.44, 0.25);
    const clipR = new THREE.Mesh(clipGeom, goldAccentMat);
    clipR.position.set(0.13, 1.44, 0.25);
    group.add(clipL, clipR);

    // Tactical antenna on left shoulder
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.24, 6), darkTechMat);
    ant.position.set(-0.22, 1.68, -0.1);
    ant.rotation.z = -0.15;
    group.add(ant);
  } else if (!isShadowOp) {
    // Vest pouches
    const pouchGeom = new THREE.BoxGeometry(0.12, 0.14, 0.1);
    const pouchL = new THREE.Mesh(pouchGeom, blackMat);
    pouchL.position.set(-0.16, 1.25, 0.24);
    const pouchC = new THREE.Mesh(pouchGeom, blackMat);
    pouchC.position.set(0, 1.25, 0.24);
    const pouchR = new THREE.Mesh(pouchGeom, blackMat);
    pouchR.position.set(0.16, 1.25, 0.24);
    group.add(pouchL, pouchC, pouchR);
  } else {
    // Hoodie drawstrings
    const stringGeom = new THREE.BoxGeometry(0.02, 0.22, 0.02);
    const stringMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0 });
    const stringL = new THREE.Mesh(stringGeom, stringMat);
    stringL.position.set(-0.08, 1.38, 0.23);
    const stringR = new THREE.Mesh(stringGeom, stringMat);
    stringR.position.set(0.08, 1.38, 0.23);
    group.add(stringL, stringR);
  }

  // 4. Tactical Backpack / Back Rig
  const backpack = new THREE.Mesh(
    new THREE.BoxGeometry(isGhostOp ? 0.38 : isShadowOp ? 0.38 : 0.44, 0.48, isGhostOp ? 0.18 : 0.22),
    vestMat
  );
  backpack.position.set(0, 1.36, isGhostOp ? -0.22 : isShadowOp ? -0.24 : -0.28);
  backpack.castShadow = true;
  group.add(backpack);

  // Glowing cyan chest core & harness lights (matching reference screenshots 1 & 2)
  const chestCore = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.03), cyanGlowMat);
  chestCore.position.set(0, 1.48, 0.22);
  group.add(chestCore);

  const harnessL = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.16, 0.02), cyanGlowMat);
  harnessL.position.set(-0.08, 1.28, 0.24);
  const harnessR = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.16, 0.02), cyanGlowMat);
  harnessR.position.set(0.08, 1.28, 0.24);
  group.add(harnessL, harnessR);

  // Tactical backpack antenna
  const bpAnt = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.35, 6), darkTechMat);
  bpAnt.position.set(0.14, 1.74, -0.25);
  group.add(bpAnt);

  // 5. Head
  const head = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.32, 0.3),
    skinMat
  );
  head.position.y = 1.84;
  head.castShadow = true;
  group.add(head);

  // 6. Hair & Face or Helmet
  let helmet: THREE.Mesh;
  if (isGhostOp) {
    // Ghost Operator: Anime Silver Hair Structure
    const hairGroup = new THREE.Group();

    // Base crown volume
    const crown = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.22, 0.34), silverHairMat);
    crown.position.set(0, 1.98, -0.02);
    hairGroup.add(crown);

    // Front Spiky Bangs (Anime fringe locks draping over forehead)
    const bangGeom = new THREE.ConeGeometry(0.065, 0.22, 4);
    const bang1 = new THREE.Mesh(bangGeom, silverHairMat);
    bang1.rotation.x = Math.PI - 0.4;
    bang1.rotation.z = 0.2;
    bang1.position.set(-0.09, 1.95, 0.16);

    const bang2 = new THREE.Mesh(bangGeom, silverHairMat);
    bang2.rotation.x = Math.PI - 0.35;
    bang2.rotation.z = -0.15;
    bang2.position.set(0.02, 1.96, 0.17);

    const bang3 = new THREE.Mesh(bangGeom, silverHairMat);
    bang3.rotation.x = Math.PI - 0.45;
    bang3.rotation.z = -0.3;
    bang3.position.set(0.11, 1.94, 0.15);

    // Sideburn locks framing the face
    const sideGeom = new THREE.BoxGeometry(0.05, 0.28, 0.12);
    const sideL = new THREE.Mesh(sideGeom, silverHairMat);
    sideL.position.set(-0.17, 1.84, 0.08);
    const sideR = new THREE.Mesh(sideGeom, silverHairMat);
    sideR.position.set(0.17, 1.84, 0.08);

    // Spiky top crown tufts
    const tuftGeom = new THREE.ConeGeometry(0.07, 0.24, 4);
    const tuft1 = new THREE.Mesh(tuftGeom, silverHairMat);
    tuft1.position.set(-0.06, 2.12, -0.04);
    tuft1.rotation.z = -0.2;
    tuft1.rotation.x = 0.2;

    const tuft2 = new THREE.Mesh(tuftGeom, silverHairMat);
    tuft2.position.set(0.07, 2.14, -0.06);
    tuft2.rotation.z = 0.25;
    tuft2.rotation.x = 0.1;

    // Back layered hair
    const backHair = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.3, 0.14), silverHairMat);
    backHair.position.set(0, 1.86, -0.15);

    hairGroup.add(bang1, bang2, bang3, sideL, sideR, tuft1, tuft2, backHair);
    group.add(hairGroup);

    // Folded mint green hood behind neck
    const hoodCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 0.18, 12), mintGreenMat);
    hoodCollar.position.set(0, 1.66, -0.08);
    group.add(hoodCollar);

    // High resolution Anime Face Plate
    const faceMat = new THREE.MeshStandardMaterial({
      map: createGhostAnimeFaceTexture(),
      roughness: 0.5,
    });
    const facePlane = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.28), faceMat);
    facePlane.position.set(0, 1.84, 0.152);
    group.add(facePlane);

    helmet = crown;
  } else if (isShadowOp) {
    helmet = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.40, 0.28), uniformMat);
    helmet.position.set(0, 1.86, -0.07);
    helmet.castShadow = true;

    const hoodTop = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.08, 0.18), uniformMat);
    hoodTop.position.set(0, 2.02, 0.09);
    group.add(hoodTop);

    const hoodLeft = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.34, 0.16), uniformMat);
    hoodLeft.position.set(-0.16, 1.83, 0.09);
    const hoodRight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.34, 0.16), uniformMat);
    hoodRight.position.set(0.16, 1.83, 0.09);
    group.add(hoodLeft, hoodRight);

    const chinWrap = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.08, 0.16), uniformMat);
    chinWrap.position.set(0, 1.67, 0.09);
    group.add(chinWrap);

    const cowl = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.34, 0.22, 16), uniformMat);
    cowl.position.set(0, 1.63, -0.01);
    group.add(cowl);

    const faceMat = new THREE.MeshStandardMaterial({
      map: createAnimeFaceTexture(),
      roughness: 0.5,
    });
    const facePlane = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.27), faceMat);
    facePlane.position.set(0, 1.84, 0.145);
    group.add(facePlane);
  } else {
    helmet = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.24, 0.34), vestMat);
    helmet.position.set(0, 1.94, 0);
    helmet.castShadow = true;

    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.08, 0.06), visorMat);
    visor.position.set(0, 1.84, 0.16);
    group.add(visor);
  }
  group.add(helmet);

  // 7. Left & Right Legs (Dark Tactical Cargo Pants)
  const pantsMat = isGhostOp ? darkTechMat : uniformMat;
  const legGeom = new THREE.BoxGeometry(0.2, 0.85, 0.22);
  const leftLeg = new THREE.Mesh(legGeom, pantsMat);
  leftLeg.position.set(-0.16, 0.45, 0);
  leftLeg.castShadow = true;

  const rightLeg = new THREE.Mesh(legGeom, pantsMat);
  rightLeg.position.set(0.16, 0.45, 0);
  rightLeg.castShadow = true;

  // Ghost Tactical Cargo Pockets & Mint Straps
  if (isGhostOp) {
    const cargoPocketGeom = new THREE.BoxGeometry(0.08, 0.18, 0.16);
    const cargoL = new THREE.Mesh(cargoPocketGeom, tacticalRigMat);
    cargoL.position.set(-0.12, 0.05, 0);
    leftLeg.add(cargoL);

    const cargoR = new THREE.Mesh(cargoPocketGeom, tacticalRigMat);
    cargoR.position.set(0.12, 0.05, 0);
    rightLeg.add(cargoR);

    // Hanging mint green tactical straps
    const strapGeom = new THREE.BoxGeometry(0.02, 0.24, 0.02);
    const strapL = new THREE.Mesh(strapGeom, mintGreenMat);
    strapL.position.set(-0.13, -0.08, 0.08);
    leftLeg.add(strapL);

    const strapR = new THREE.Mesh(strapGeom, mintGreenMat);
    strapR.position.set(0.13, -0.08, 0.08);
    rightLeg.add(strapR);

    // Reinforced Knee Pads
    const kneeGeom = new THREE.BoxGeometry(0.18, 0.14, 0.04);
    const kneeL = new THREE.Mesh(kneeGeom, tacticalRigMat);
    kneeL.position.set(0, -0.06, 0.12);
    leftLeg.add(kneeL);

    const kneeR = new THREE.Mesh(kneeGeom, tacticalRigMat);
    kneeR.position.set(0, -0.06, 0.12);
    rightLeg.add(kneeR);
  } else if (isShadowOp) {
    const cargoPocketGeom = new THREE.BoxGeometry(0.08, 0.18, 0.16);
    const cargoL = new THREE.Mesh(cargoPocketGeom, vestMat);
    cargoL.position.set(-0.12, 0.05, 0);
    leftLeg.add(cargoL);

    const cargoR = new THREE.Mesh(cargoPocketGeom, vestMat);
    cargoR.position.set(0.12, 0.05, 0);
    rightLeg.add(cargoR);
  }

  // Futuristic High-Top Sneakers (Mint & White)
  const bootGeom = new THREE.BoxGeometry(0.22, 0.16, 0.32);
  const leftBoot = new THREE.Mesh(bootGeom, isGhostOp ? whiteSneakerMat : isShadowOp ? whiteSneakerMat : blackMat);
  leftBoot.position.set(0, -0.38, 0.04);

  const rightBoot = new THREE.Mesh(bootGeom, isGhostOp ? whiteSneakerMat : isShadowOp ? whiteSneakerMat : blackMat);
  rightBoot.position.set(0, -0.38, 0.04);

  if (isGhostOp) {
    // Mint green sneaker side overlay
    const overlayGeom = new THREE.BoxGeometry(0.23, 0.10, 0.22);
    const overL = new THREE.Mesh(overlayGeom, mintGreenMat);
    overL.position.set(0, 0.02, 0.02);
    leftBoot.add(overL);

    const overR = new THREE.Mesh(overlayGeom, mintGreenMat);
    overR.position.set(0, 0.02, 0.02);
    rightBoot.add(overR);

    // Glowing cyan heel cushion
    const heelGlowGeom = new THREE.BoxGeometry(0.20, 0.04, 0.08);
    const heelL = new THREE.Mesh(heelGlowGeom, cyanGlowMat);
    heelL.position.set(0, -0.05, -0.12);
    leftBoot.add(heelL);

    const heelR = new THREE.Mesh(heelGlowGeom, cyanGlowMat);
    heelR.position.set(0, -0.05, -0.12);
    rightBoot.add(heelR);
  } else if (isShadowOp) {
    const soleGeom = new THREE.BoxGeometry(0.23, 0.04, 0.33);
    const soleMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 });
    const soleL = new THREE.Mesh(soleGeom, soleMat);
    soleL.position.y = -0.07;
    leftBoot.add(soleL);

    const soleR = new THREE.Mesh(soleGeom, soleMat);
    soleR.position.y = -0.07;
    rightBoot.add(soleR);
  }

  leftLeg.add(leftBoot);
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

  // Ghost Left Wrist Comms Smartwatch with Glowing Cyan Screen
  if (isGhostOp) {
    const watchBand = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.18), darkTechMat);
    watchBand.position.set(0, -0.38, 0);
    const watchScreen = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.06, 0.02), cyanGlowMat);
    watchScreen.position.set(-0.06, -0.38, 0.1);
    watchBand.add(watchScreen);
    leftArm.add(watchBand);

    // Fingerless tactical glove
    const glove = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.14, 0.17), tacticalRigMat);
    glove.position.set(0, -0.54, 0);
    leftArm.add(glove);
  }

  group.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.38, 1.6, 0);
  const rightArmMesh = new THREE.Mesh(armGeom, uniformMat);
  rightArmMesh.position.y = -0.28;
  rightArmMesh.castShadow = true;
  rightArm.add(rightArmMesh);

  if (isGhostOp) {
    // Tactical arm patch on right sleeve
    const patch = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.12, 0.1), darkTechMat);
    patch.position.set(0.09, -0.15, 0);
    rightArm.add(patch);

    // Fingerless glove
    const gloveR = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.14, 0.17), tacticalRigMat);
    gloveR.position.set(0, -0.54, 0);
    rightArm.add(gloveR);
  }

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

  // Vertical light beacon shaft into sky (matching reference screenshot Image 2)
  if (rarity === 'legendary' || rarity === 'epic') {
    const beaconGeo = new THREE.CylinderGeometry(0.06, 0.16, 26, 8, 1, true);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.32,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.y = 13;
    crate.add(beacon);
  }

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
