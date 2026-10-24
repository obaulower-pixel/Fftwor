/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createOperatorMesh, OperatorMeshGroup, createWeaponMesh } from '../game/proceduralModels';
import { OPERATOR_ROSTER, WEAPON_DATABASE } from '../game/weapons';

interface Lobby3DProps {
  selectedOperatorId: string;
  selectedWeaponId?: string;
  mode?: 'login' | 'lobby';
  activeEmote?: string | null;
}

function createPlaySignTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0a1728';
  ctx.fillRect(0, 0, 512, 160);

  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 10;
  ctx.strokeRect(8, 8, 496, 144);

  // High glow PLAY sign
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 30;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 96px "Chakra Petch", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PLAY', 256, 80);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createVortexTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(256, 256, 20, 256, 256, 256);
  grad.addColorStop(0, '#e0f2fe');
  grad.addColorStop(0.35, '#38bdf8');
  grad.addColorStop(0.7, '#0284c7');
  grad.addColorStop(0.9, '#0369a1');
  grad.addColorStop(1, '#082f49');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Concentric swirling energy rings
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  for (let r = 40; r < 240; r += 26) {
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(256, 256, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Energy arcs
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 6;
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    ctx.beginPath();
    ctx.arc(256, 256, 180, angle, angle + 0.4);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const Lobby3D: React.FC<Lobby3DProps> = ({
  selectedOperatorId,
  selectedWeaponId = 'ar_vanguard',
  mode = 'lobby',
  activeEmote = null,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;

    // Detect software WebGL
    const isSoftwareGl = (() => {
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
    const scene = new THREE.Scene();
    // Rich deep twilight cyan/navy background matching reference
    scene.background = new THREE.Color(0x0c1626);
    scene.fog = new THREE.FogExp2(0x0c1626, 0.022);

    const aspect = container.clientWidth / Math.max(container.clientHeight, 1);
    const isPortrait = aspect < 1.0;
    const camera = new THREE.PerspectiveCamera(isPortrait ? 58 : 45, aspect, 0.1, 100);

    // If login mode: frame operator to the right so login panel fits cleanly on the left
    const isLogin = mode === 'login';
    const initCamX = isLogin ? (isPortrait ? 0 : -0.85) : 0;
    const initCamY = isLogin ? 1.3 : 1.35;
    const initCamZ = isLogin ? (isPortrait ? 4.2 : 3.6) : (isPortrait ? 4.5 : 3.8);
    camera.position.set(initCamX, initCamY, initCamZ);
    camera.lookAt(isLogin ? (isPortrait ? 0 : 0.35) : 0, 1.2, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 3. Environment Map
    try {
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
    } catch {
      // no-op
    }

    // 4. Cinematic Lighting
    const sunLight = new THREE.DirectionalLight(0xfff7ed, 2.8);
    sunLight.position.set(6, 10, 6);
    sunLight.castShadow = !isSoftwareGl;
    scene.add(sunLight);

    const cyanRimLight = new THREE.DirectionalLight(0x00f0ff, 3.2);
    cyanRimLight.position.set(-6, 4, -4);
    scene.add(cyanRimLight);

    const portalGlowLight = new THREE.PointLight(0x00f0ff, 4.5, 12);
    portalGlowLight.position.set(0, 2.5, -4.2);
    scene.add(portalGlowLight);

    const floorLight = new THREE.PointLight(0x10b981, 1.8, 8);
    floorLight.position.set(0, 0.3, 0);
    scene.add(floorLight);

    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.1);
    scene.add(ambientLight);

    // 5. Circular Holographic Platform (Multi-Tier with Neon Rings)
    const baseFloorGeo = new THREE.CylinderGeometry(6.5, 7.0, 0.3, 48);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.35,
      metalness: 0.8,
    });
    const baseFloor = new THREE.Mesh(baseFloorGeo, floorMat);
    baseFloor.position.y = -0.15;
    baseFloor.receiveShadow = true;
    scene.add(baseFloor);

    // Central circular pedestal
    const pedestalGeo = new THREE.CylinderGeometry(2.4, 2.6, 0.15, 48);
    const pedMat = new THREE.MeshStandardMaterial({
      color: 0x182436,
      roughness: 0.4,
      metalness: 0.75,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedMat);
    pedestal.position.y = 0.05;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Outer Glowing Cyan Ring
    const outerRingGeo = new THREE.RingGeometry(2.25, 2.38, 48);
    const cyanRingMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
    });
    const outerRing = new THREE.Mesh(outerRingGeo, cyanRingMat);
    outerRing.rotation.x = -Math.PI / 2;
    outerRing.position.y = 0.13;
    scene.add(outerRing);

    // Inner Glowing Emerald Ring
    const innerRingGeo = new THREE.RingGeometry(1.6, 1.7, 48);
    const emeraldRingMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, emeraldRingMat);
    innerRing.rotation.x = -Math.PI / 2;
    innerRing.position.y = 0.131;
    scene.add(innerRing);

    // Holographic Directional Chevrons pointing to the portal
    const chevronGroup = new THREE.Group();
    const chevMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    for (let c = -1; c <= 1; c++) {
      const armL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.01, 0.22), chevMat);
      armL.position.set(c * 0.5 - 0.06, 0.132, 0.5);
      armL.rotation.y = -0.6;
      const armR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.01, 0.22), chevMat);
      armR.position.set(c * 0.5 + 0.06, 0.132, 0.5);
      armR.rotation.y = 0.6;
      chevronGroup.add(armL, armR);
    }
    scene.add(chevronGroup);

    // 6. Giant Glowing Cyber Portal Gate (Directly Behind Character)
    const portalGroup = new THREE.Group();
    portalGroup.position.set(0, 0, -4.5);

    const gateMat = new THREE.MeshStandardMaterial({
      color: 0x111c2e,
      roughness: 0.5,
      metalness: 0.85,
    });
    const neonCyanMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const neonBlueMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    // Left and Right Massive Gate Pillars
    const pillarGeo = new THREE.BoxGeometry(0.9, 4.8, 1.1);
    const leftPillar = new THREE.Mesh(pillarGeo, gateMat);
    leftPillar.position.set(-2.5, 2.4, 0);
    const rightPillar = new THREE.Mesh(pillarGeo, gateMat);
    rightPillar.position.set(2.5, 2.4, 0);

    // Segmented glowing neon strips on pillars
    for (let i = 0; i < 4; i++) {
      const stripL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.45, 1.12), neonCyanMat);
      stripL.position.set(-2.5, 1.0 + i * 0.85, 0);
      const stripR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.45, 1.12), neonCyanMat);
      stripR.position.set(2.5, 1.0 + i * 0.85, 0);
      portalGroup.add(stripL, stripR);
    }

    // Top Arch Lintel
    const lintelGeo = new THREE.BoxGeometry(5.9, 1.2, 1.1);
    const lintel = new THREE.Mesh(lintelGeo, gateMat);
    lintel.position.set(0, 4.8, 0);

    // Glowing PLAY Sign Board on Top of Arch
    const playSignGeo = new THREE.BoxGeometry(2.6, 0.85, 0.2);
    const playSignMat = new THREE.MeshStandardMaterial({
      map: createPlaySignTexture(),
      roughness: 0.2,
      metalness: 0.5,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.6,
    });
    const playSign = new THREE.Mesh(playSignGeo, playSignMat);
    playSign.position.set(0, 5.75, 0.2);
    portalGroup.add(playSign);

    // Swirling Energy Vortex Inside Portal Opening
    const vortexGeo = new THREE.CircleGeometry(2.1, 36);
    const vortexMat = new THREE.MeshBasicMaterial({
      map: createVortexTexture(),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92,
    });
    const vortex = new THREE.Mesh(vortexGeo, vortexMat);
    vortex.position.set(0, 2.4, -0.05);
    portalGroup.add(vortex);

    portalGroup.add(leftPillar, rightPillar, lintel);
    scene.add(portalGroup);

    // 7. Surrounding Environment (Campfire, NPC Booth, Supply Crate, Floating Islands)
    // Left: Campfire with Glowing Embers
    const campGroup = new THREE.Group();
    campGroup.position.set(-3.6, 0.15, -1.6);
    const stoneRingGeo = new THREE.TorusGeometry(0.45, 0.12, 8, 16);
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    const stoneRing = new THREE.Mesh(stoneRingGeo, stoneMat);
    stoneRing.rotation.x = Math.PI / 2;
    campGroup.add(stoneRing);

    const fireLight = new THREE.PointLight(0xf97316, 2.0, 4.5);
    fireLight.position.set(0, 0.4, 0);
    campGroup.add(fireLight);

    const flameGeo = new THREE.ConeGeometry(0.2, 0.55, 6);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.set(0, 0.28, 0);
    campGroup.add(flame);
    scene.add(campGroup);

    // Right: Reception Booth & Voxel NPC
    const boothGroup = new THREE.Group();
    boothGroup.position.set(3.8, 0, -1.4);

    const deskGeo = new THREE.BoxGeometry(1.6, 0.9, 0.8);
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
    const desk = new THREE.Mesh(deskGeo, deskMat);
    desk.position.set(0, 0.45, 0);
    boothGroup.add(desk);

    // Cute Voxel NPC behind desk
    const npcGroup = new THREE.Group();
    npcGroup.position.set(0, 0.9, -0.3);
    const npcTorso = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.5, 0.28), new THREE.MeshStandardMaterial({ color: 0x0284c7 }));
    const npcHead = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.28), new THREE.MeshStandardMaterial({ color: 0xf8ebd8 }));
    npcHead.position.y = 0.42;
    const npcHat = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.12, 0.34), new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
    npcHat.position.y = 0.6;
    npcGroup.add(npcTorso, npcHead, npcHat);
    boothGroup.add(npcGroup);

    // Wooden Supply Crate
    const crateGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const crateMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.8 });
    const crate = new THREE.Mesh(crateGeo, crateMat);
    crate.position.set(1.2, 0.4, 0.1);
    boothGroup.add(crate);

    scene.add(boothGroup);

    // Distant Floating Sky Islands
    const islandGroup = new THREE.Group();
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 });

    const islandPositions = [
      [-9, 6, -15, 3.2],
      [10, 7.5, -16, 3.8],
      [0, 10, -22, 5.0],
    ];
    islandPositions.forEach(([x, y, z, s]) => {
      const isl = new THREE.Group();
      isl.position.set(x, y, z);
      isl.scale.set(s, s, s);

      const top = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 0.3, 7), grassMat);
      const bottom = new THREE.Mesh(new THREE.ConeGeometry(1.3, 2.2, 7), rockMat);
      bottom.rotation.x = Math.PI;
      bottom.position.y = -1.1;

      isl.add(top, bottom);
      islandGroup.add(isl);
    });
    scene.add(islandGroup);

    // Floating Ambient Energy Sparks / Particles
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 12;
      particlePositions[i * 3 + 1] = Math.random() * 5 + 0.2;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.08,
      transparent: true,
      opacity: 0.7,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 8. Operator 3D Model
    const op = OPERATOR_ROSTER.find((o) => o.id === selectedOperatorId) || OPERATOR_ROSTER[0];
    const operatorMesh = createOperatorMesh(op.avatarColor, '#111620', '#f8ebd8', selectedOperatorId || 'op_ghost');
    scene.add(operatorMesh);

    // Attach chosen weapon
    const weaponDef = WEAPON_DATABASE[selectedWeaponId] || WEAPON_DATABASE.ar_vanguard;
    const weaponMesh = createWeaponMesh(weaponDef.category);
    operatorMesh.parts.weaponMount.add(weaponMesh);
    operatorMesh.parts.rightArm.rotation.x = -Math.PI / 3;

    // 9. Interactive Turntable & Zoom Controls
    let isDragging = false;
    let prevMouseX = 0;
    let targetRotationY = isLogin ? 0.25 : 0.05;
    let currentRotationY = targetRotationY;
    let targetCameraDist = initCamZ;
    let currentCameraDist = initCamZ;

    const onPointerDown = (e: PointerEvent) => {
      // Don't drag if clicked on interactive buttons
      isDragging = true;
      prevMouseX = e.clientX;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      prevMouseX = e.clientX;
      targetRotationY += deltaX * 0.009;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      targetCameraDist = Math.max(2.4, Math.min(5.2, targetCameraDist + e.deltaY * 0.003));
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    container.addEventListener('wheel', onWheel, { passive: true });

    // 10. Animation Loop
    let animId = 0;
    let lastT = performance.now();

    const tick = () => {
      const now = performance.now();
      const dt = Math.min((now - lastT) / 1000, 0.05);
      lastT = now;

      // Turntable rotation & zoom dampening
      currentRotationY = THREE.MathUtils.damp(currentRotationY, targetRotationY, 10, dt);
      operatorMesh.rotation.y = currentRotationY;

      currentCameraDist = THREE.MathUtils.damp(currentCameraDist, targetCameraDist, 10, dt);
      camera.position.z = currentCameraDist;

      // Swirl vortex animation
      vortex.rotation.z += dt * 0.8;

      // Idle breathing & natural weight shifting
      const breath = Math.sin(now * 0.0025) * 0.025;
      const sway = Math.sin(now * 0.0015) * 0.03;
      operatorMesh.parts.vest.scale.set(1 + breath, 1 + breath, 1 + breath);
      operatorMesh.parts.head.rotation.y = sway * 0.5;
      operatorMesh.parts.head.rotation.x = breath * 0.3;

      // Emote handling
      if (activeEmote === 'wave') {
        operatorMesh.parts.leftArm.rotation.x = -Math.PI / 1.5 + Math.sin(now * 0.008) * 0.35;
        operatorMesh.parts.leftArm.rotation.z = Math.sin(now * 0.008) * 0.25;
      } else if (activeEmote === 'victory') {
        operatorMesh.parts.rightArm.rotation.x = -Math.PI / 1.1;
        operatorMesh.parts.leftArm.rotation.x = -Math.PI / 1.1;
      } else {
        operatorMesh.parts.rightArm.rotation.x = -Math.PI / 3 + breath * 0.4;
        operatorMesh.parts.leftArm.rotation.x = breath * 0.2;
        operatorMesh.parts.leftArm.rotation.z = 0;
      }

      // Campfire flame flicker
      flame.scale.y = 0.9 + Math.sin(now * 0.015) * 0.2;
      fireLight.intensity = 1.8 + Math.sin(now * 0.02) * 0.4;

      // Float particle sparks upward
      const posAttr = particleGeo.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        let py = posAttr.getY(i) + dt * 0.4;
        if (py > 5.5) py = 0.2;
        posAttr.setY(i, py);
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);

      if (!isSoftwareGl) {
        animId = requestAnimationFrame(tick);
      } else {
        animId = window.setTimeout(tick, 70);
      }
    };

    if (isSoftwareGl) {
      animId = window.setTimeout(tick, 70);
    } else {
      animId = requestAnimationFrame(tick);
    }

    // Resize handler
    const onResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      const curAspect = w / Math.max(h, 1);
      camera.aspect = curAspect;
      camera.fov = curAspect < 1.0 ? 58 : 45;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(animId);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [selectedOperatorId, selectedWeaponId, mode, activeEmote]);

  return (
    <div className="relative w-full h-full cursor-grab active:cursor-grabbing select-none">
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
};
