/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';

interface CharacterSpriteProps {
  animation?: 'idle' | 'walk' | 'run' | 'jump' | 'crouch';
  size?: number;
  className?: string;
  fps?: number;
}

const ANIMATION_CONFIG = {
  idle: { row: 0, frameCount: 4, fps: 4 },
  walk: { row: 1, frameCount: 6, fps: 8 },
  run: { row: 2, frameCount: 6, fps: 12 },
  jump: { row: 3, frameCount: 4, fps: 6 },
  crouch: { row: 3, frameCount: 1, startCol: 5, fps: 1 },
};

const SPRITE_URL = '/assets/aistudio/Picsart_26-10-24_12-09-02-254_719afedd.png';
const CELL_SIZE = 256;

export const CharacterSprite: React.FC<CharacterSpriteProps> = ({
  animation = 'idle',
  size = 120,
  className = '',
  fps,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = SPRITE_URL;
    imgRef.current = img;

    let frame = 0;
    let animId = 0;
    let lastTime = performance.now();

    const config = ANIMATION_CONFIG[animation] || ANIMATION_CONFIG.idle;
    const targetFps = fps || config.fps;
    const frameInterval = 1000 / targetFps;

    const render = (now: number) => {
      const elapsed = now - lastTime;
      if (elapsed >= frameInterval) {
        lastTime = now - (elapsed % frameInterval);
        frame = (frame + 1) % config.frameCount;

        const canvas = canvasRef.current;
        if (canvas && img.complete && img.naturalWidth > 0) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const col = (config as any).startCol !== undefined ? (config as any).startCol : frame;
            const sx = col * CELL_SIZE;
            const sy = config.row * CELL_SIZE;

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, sx, sy, CELL_SIZE, CELL_SIZE, 0, 0, canvas.width, canvas.height);
          }
        }
      }
      animId = requestAnimationFrame(render);
    };

    img.onload = () => {
      // Draw first frame immediately
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const col = (config as any).startCol !== undefined ? (config as any).startCol : 0;
          ctx.drawImage(img, col * CELL_SIZE, config.row * CELL_SIZE, CELL_SIZE, CELL_SIZE, 0, 0, canvas.width, canvas.height);
        }
      }
      animId = requestAnimationFrame(render);
    };

    if (img.complete) {
      animId = requestAnimationFrame(render);
    }

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [animation, fps]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={`inline-block drop-shadow-md pointer-events-none ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
};
