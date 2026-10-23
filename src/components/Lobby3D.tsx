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
}

export const Lobby3D: React.FC<Lobby3DProps> = ({ selectedOperatorId, selectedWeaponId = 'ar_vanguard' }) => {
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
    scene.background = new THREE.Color(0x0a0e14);
    scene.fog = new THREE.FogExp2(0x0a0e14, 0.035);

    const aspect = container.clientWidth / Math.max(container.clientHeight, 1);
    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    camera.position.set(0, 1.4, 4.0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 3. Environment map
    try {
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
    } catch {
      // no-op
    }

    // 4. Studio Lighting
    const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.5);
    keyLight.position.set(4, 6, 4);
    keyLight.castShadow = !isSoftwareGl;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.0);
    rimLight.position.set(-4, 3, -4);
    scene.add(rimLight);

    const fillLight = new THREE.AmbientLight(0x223040, 0.8);
    scene.add(fillLight);

    // 5. Military Hangar Platform & Backdrop
    const platformGeo = new THREE.CylinderGeometry(2.6, 2.8, 0.2, 32);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x181f2a,
      roughness: 0.6,
      metalness: 0.7,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = -0.1;
    platform.receiveShadow = true;
    scene.add(platform);

    const ringGeo = new THREE.RingGeometry(2.2, 2.4, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.01;
    scene.add(ring);

    // 6. Operator 3D Model
    const op = OPERATOR_ROSTER.find((o) => o.id === selectedOperatorId) || OPERATOR_ROSTER[0];
    const operatorMesh = createOperatorMesh(op.avatarColor, '#1c241e', '#e0b58e');
    scene.add(operatorMesh);

    // Attach chosen weapon
    const weaponDef = WEAPON_DATABASE[selectedWeaponId] || WEAPON_DATABASE.ar_vanguard;
    const weaponMesh = createWeaponMesh(weaponDef.category);
    operatorMesh.parts.weaponMount.add(weaponMesh);
    operatorMesh.parts.rightArm.rotation.x = -Math.PI / 3;

    // 7. Interactive Turntable & Zoom Controls
    let isDragging = false;
    let prevMouseX = 0;
    let targetRotationY = 0.35; // dynamic 3/4 tactical pose
    let currentRotationY = 0.35;
    let targetCameraDist = 3.6;
    let currentCameraDist = 3.6;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      prevMouseX = e.clientX;
      targetRotationY += deltaX * 0.01;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      targetCameraDist = Math.max(2.2, Math.min(5.5, targetCameraDist + e.deltaY * 0.003));
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    container.addEventListener('wheel', onWheel, { passive: true });

    // 8. Animation Loop
    let animId = 0;
    let lastT = performance.now();

    const tick = () => {
      const now = performance.now();
      const dt = Math.min((now - lastT) / 1000, 0.05);
      lastT = now;

      // Smooth turntable rotation and camera zoom
      currentRotationY = THREE.MathUtils.damp(currentRotationY, targetRotationY, 10, dt);
      operatorMesh.rotation.y = currentRotationY;

      currentCameraDist = THREE.MathUtils.damp(currentCameraDist, targetCameraDist, 10, dt);
      camera.position.z = currentCameraDist;

      // Subtle breathing idle animation
      const breath = Math.sin(now * 0.002) * 0.02;
      operatorMesh.parts.vest.scale.set(1 + breath, 1 + breath, 1 + breath);
      operatorMesh.parts.rightArm.rotation.x = -Math.PI / 3 + breath * 0.5;

      renderer.render(scene, camera);

      if (!isSoftwareGl) {
        animId = requestAnimationFrame(tick);
      } else {
        // pace software WebGL
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
      camera.aspect = w / Math.max(h, 1);
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
  }, [selectedOperatorId, selectedWeaponId]);

  return (
    <div className="relative w-full h-full cursor-grab active:cursor-grabbing select-none">
      <div ref={mountRef} className="w-full h-full" />
      {/* 360 Drag & Zoom Indicator Pill */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/80 border border-slate-700/60 rounded-full px-4 py-1 text-[11px] text-slate-300 font-mono tracking-widest pointer-events-none flex items-center gap-2 shadow-lg">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span>DRAG TO ROTATE · SCROLL TO ZOOM</span>
      </div>
    </div>
  );
};
