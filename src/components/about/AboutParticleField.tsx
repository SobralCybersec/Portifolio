'use client';

import { useReducedMotion } from 'framer-motion';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  MathUtils,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Timer,
  WebGLRenderer,
} from 'three';
import { useEffect, useRef } from 'react';

const vertexShader = /* glsl */ `
  attribute vec4 aRandom;
  attribute vec3 aColor;

  uniform float uTime;
  uniform float uSpread;
  uniform float uBaseSize;
  uniform float uSizeRandomness;

  varying vec4 vRandom;
  varying vec3 vColor;

  void main() {
    vRandom = aRandom;
    vColor = aColor;

    vec3 pos = position * uSpread;
    pos.z *= 10.0;

    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    modelPosition.x += sin(uTime * aRandom.z + 6.28 * aRandom.w) * mix(0.1, 1.5, aRandom.x);
    modelPosition.y += sin(uTime * aRandom.y + 6.28 * aRandom.x) * mix(0.1, 1.5, aRandom.w);
    modelPosition.z += sin(uTime * aRandom.w + 6.28 * aRandom.y) * mix(0.1, 1.5, aRandom.z);

    vec4 viewPosition = viewMatrix * modelPosition;
    gl_PointSize = (uBaseSize * (1.0 + uSizeRandomness * (aRandom.x - 0.5))) / length(viewPosition.xyz);
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uAlphaParticles;

  varying vec4 vRandom;
  varying vec3 vColor;

  void main() {
    vec2 uv = gl_PointCoord.xy;
    float distanceFromCenter = length(uv - vec2(0.5));
    if (distanceFromCenter > 0.5) discard;

    float alpha = uAlphaParticles > 0.5
      ? smoothstep(0.5, 0.4, distanceFromCenter) * 0.8
      : 1.0;
    vec3 animatedColor = vColor + 0.16 * sin(uv.yxx + uTime + vRandom.y * 6.28);
    gl_FragColor = vec4(animatedColor, alpha);
  }
`;

interface AboutParticleFieldProps {
  className?: string;
  particleColors?: string[];
  particleCount?: number;
  particleSpread?: number;
  speed?: number;
  hoverFactor?: number;
}

const colorToRgb = (hex: string): [number, number, number] => {
  const normalized = hex.replace('#', '');
  const value = normalized.length === 3
    ? normalized.split('').map((part) => `${part}${part}`).join('')
    : normalized;
  const number = Number.parseInt(value, 16);
  return [((number >> 16) & 255) / 255, ((number >> 8) & 255) / 255, (number & 255) / 255];
};

const seededRandom = (seed: number) => {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
};

export default function AboutParticleField({
  className = '',
  particleColors = ['#a855f7', '#8b5cf6', '#3b82f6'],
  particleCount = 150,
  particleSpread = 1.6,
  speed = 0.45,
  hoverFactor = 0.3,
}: AboutParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const colorKey = particleColors.join('|');

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return;

    try {
      const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
      if (!context) return;
    } catch {
      return;
    }

    let renderer: WebGLRenderer;

    try {
      renderer = new WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: 'high-performance',
      });
    } catch {
      // WebGL is optional decoration; browsers without a usable context keep page content.
      return;
    }
    renderer.setClearColor(0, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

    const scene = new Scene();
    const camera = new PerspectiveCamera(15, 1, 0.1, 100);
    camera.position.set(0, 0, 18);

    const positions = new Float32Array(particleCount * 3);
    const randoms = new Float32Array(particleCount * 4);
    const colors = new Float32Array(particleCount * 3);
    const colorValues = colorKey ? colorKey.split('|') : ['#a855f7'];
    const safeColors = colorValues.length ? colorValues : ['#a855f7'];

    for (let index = 0; index < particleCount; index += 1) {
      let x = 0;
      let y = 0;
      let z = 0;
      let length = 2;
      let seed = index * 17 + 1;
      while (length > 1 || length === 0) {
        x = seededRandom(seed += 1) * 2 - 1;
        y = seededRandom(seed += 1) * 2 - 1;
        z = seededRandom(seed += 1) * 2 - 1;
        length = x * x + y * y + z * z;
      }

      const radius = Math.cbrt(seededRandom(seed += 1));
      positions.set([x * radius, y * radius, z * radius], index * 3);
      randoms.set([
        seededRandom(seed += 1),
        seededRandom(seed += 1),
        seededRandom(seed += 1),
        seededRandom(seed += 1),
      ], index * 4);
      colors.set(colorToRgb(safeColors[index % safeColors.length]), index * 3);
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('aRandom', new BufferAttribute(randoms, 4));
    geometry.setAttribute('aColor', new BufferAttribute(colors, 3));

    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uSpread: { value: particleSpread },
        uBaseSize: { value: 110 },
        uSizeRandomness: { value: 1 },
        uAlphaParticles: { value: 1 },
      },
    });
    const points = new Points(geometry, material);
    points.frustumCulled = false;
    scene.add(points);

    const timer = new Timer();
    timer.connect(document);
    const pointer = { x: 0, y: 0 };

    const resize = () => {
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      points.scale.setScalar(Math.max(width / 1200, 0.85));
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((event.clientY / window.innerHeight) * 2 - 1);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    let animationId = 0;
    let lastFrame = 0;
    let active = true;
    const frameInterval = 1000 / 30;
    const render = (time: number) => {
      if (!active || document.hidden) {
        animationId = 0;
        return;
      }

      if (lastFrame !== 0 && time - lastFrame < frameInterval) {
        animationId = requestAnimationFrame(render);
        return;
      }

      lastFrame = time;
      timer.update(time);
      const elapsed = timer.getElapsed();
      const delta = Math.min(timer.getDelta(), 0.05);
      material.uniforms.uTime.value = elapsed * speed;

      const targetX = -pointer.x * hoverFactor;
      const targetY = -pointer.y * hoverFactor;
      points.position.x = MathUtils.lerp(points.position.x, targetX, Math.min(delta * 3, 1));
      points.position.y = MathUtils.lerp(points.position.y, targetY, Math.min(delta * 3, 1));
      points.rotation.x = Math.sin(elapsed * 0.18) * 0.08;
      points.rotation.y = Math.cos(elapsed * 0.12) * 0.12;
      points.rotation.z += delta * 0.018;
      renderer.render(scene, camera);

      if (!shouldReduceMotion) animationId = requestAnimationFrame(render);
    };

    render(performance.now());

    const start = () => {
      if (!shouldReduceMotion && animationId === 0) {
        animationId = requestAnimationFrame(render);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        active = false;
        if (animationId) cancelAnimationFrame(animationId);
        animationId = 0;
      } else {
        active = true;
        lastFrame = 0;
        start();
      }
    };

    const observer = typeof IntersectionObserver === 'undefined'
      ? null
      : new IntersectionObserver(([entry]) => {
        active = entry.isIntersecting;
        if (active) start();
        else if (animationId) {
          cancelAnimationFrame(animationId);
          animationId = 0;
        }
      });

    observer?.observe(canvas);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      observer?.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      timer.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [colorKey, hoverFactor, particleCount, particleSpread, shouldReduceMotion, speed]);

  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
