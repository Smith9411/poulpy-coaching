"use client";

import React, { useEffect, useRef } from "react";
import type * as THREE from "three";

export default function Scene3D() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let unmounted = false;
    let cleanupFn: (() => void) | undefined;

    // Asynchronously import Three.js in client microtask so main thread UI/scroll never wait
    import("three").then((THREE) => {
      if (unmounted || !mountRef.current) return;
      const mount = mountRef.current;

      // 1. Scene, Fog, Camera, Renderer
      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x06080a, 0.0008);

      const width = window.innerWidth;
      const height = window.innerHeight;

      const camera = new THREE.PerspectiveCamera(55, width / height, 1, 3000);
      camera.position.set(0, 0, 560);

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: "default",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0);
      mount.appendChild(renderer.domElement);

      // 2. Procedural Soft Glow Droplet Texture (In-memory, 0ms latency)
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        grad.addColorStop(0, "rgba(255, 255, 255, 1)");
        grad.addColorStop(0.35, "rgba(255, 255, 255, 0.75)");
        grad.addColorStop(0.7, "rgba(255, 255, 255, 0.2)");
        grad.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 32, 32);
      }
      const particleTexture = new THREE.CanvasTexture(canvas);

      // 3. Option 2: L'Encre Vivante & Pollen Solaire (Fluid Sumi-e Vortex)
      const PARTICLE_COUNT = 6000;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(PARTICLE_COUNT * 3);
      const colors = new Float32Array(PARTICLE_COUNT * 3);

      const radii = new Float32Array(PARTICLE_COUNT);
      const angles = new Float32Array(PARTICLE_COUNT);
      const speeds = new Float32Array(PARTICLE_COUNT);
      const zOffsets = new Float32Array(PARTICLE_COUNT);
      const verticalWaves = new Float32Array(PARTICLE_COUNT);
      const isPollen = new Uint8Array(PARTICLE_COUNT);

      // Pastel Palette
      const cCoral = new THREE.Color(0xff7582);      // Core Pastel Coral
      const cCoralLight = new THREE.Color(0xffa3ad); // Luminous Coral Spark
      const cSlate = new THREE.Color(0x8fafd4);      // Pastel Slate / Ink
      const cMatcha = new THREE.Color(0xa4de87);     // Pastel Bamboo Matcha
      const cWhiteInk = new THREE.Color(0xf6f6f2);   // Sumi-e Pearl / Pollen

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const isAmbient = i > PARTICLE_COUNT * 0.8;
        isPollen[i] = isAmbient ? 1 : 0;

        if (!isAmbient) {
          // Vortex Spiral Arms
          const armIndex = i % 3;
          const armOffset = (armIndex * (Math.PI * 2)) / 3;

          const progress = Math.pow(Math.random(), 1.6);
          const r = 25 + progress * 580;
          const theta = armOffset + r * 0.012 + (Math.random() - 0.5) * 0.45;
          const z = (Math.random() - 0.5) * (180 - progress * 80);

          radii[i] = r;
          angles[i] = theta;
          // Calibrated harmonic rotation: closer layer speeds so the spiral arms stay defined much longer
          speeds[i] = (0.00085 + 0.00028 / (r * 0.008 + 1)) * (0.97 + Math.random() * 0.06);
          zOffsets[i] = z;
          verticalWaves[i] = Math.random() * Math.PI * 2;

          positions[i * 3] = r * Math.cos(theta);
          positions[i * 3 + 1] = r * Math.sin(theta);
          positions[i * 3 + 2] = z;

          let col = cCoral;
          if (r < 120) {
            col = Math.random() > 0.4 ? cCoral : cCoralLight;
          } else if (r < 320) {
            col = Math.random() > 0.35 ? cSlate : cCoral;
          } else {
            col = Math.random() > 0.5 ? cSlate : cMatcha;
          }

          colors[i * 3] = col.r;
          colors[i * 3 + 1] = col.g;
          colors[i * 3 + 2] = col.b;
        } else {
          // Ambient Solar Pollen / Floating Spores
          const r = 100 + Math.random() * 650;
          const theta = Math.random() * Math.PI * 2;
          const z = (Math.random() - 0.5) * 600;

          radii[i] = r;
          angles[i] = theta;
          speeds[i] = (Math.random() - 0.5) * 0.0004;
          zOffsets[i] = z;
          verticalWaves[i] = Math.random() * Math.PI * 2;

          positions[i * 3] = r * Math.cos(theta);
          positions[i * 3 + 1] = r * Math.sin(theta);
          positions[i * 3 + 2] = z;

          const rand = Math.random();
          const col = rand > 0.5 ? cMatcha : rand > 0.25 ? cWhiteInk : cSlate;
          colors[i * 3] = col.r;
          colors[i * 3 + 1] = col.g;
          colors[i * 3 + 2] = col.b;
        }
      }

      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 4.5,
        map: particleTexture,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const vortexMesh = new THREE.Points(geometry, material);
      scene.add(vortexMesh);

      // 4. Mouse & Scroll Interactivity
      let mouseX = 0;
      let mouseY = 0;
      let targetX = 0;
      let targetY = 0;

      const onMouseMove = (e: MouseEvent) => {
        targetX = (e.clientX - window.innerWidth / 2) * 0.5;
        targetY = (e.clientY - window.innerHeight / 2) * 0.5;
      };
      window.addEventListener("mousemove", onMouseMove, { passive: true });

      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener("resize", onResize);

      // Immediate synchronous initial render
      renderer.render(scene, camera);

      // 5. Living Kinetic Animation Loop
      let animId: number;
      let lastTime = performance.now();

      const animate = () => {
        animId = requestAnimationFrame(animate);

        const currentScroll = typeof window !== "undefined" ? window.scrollY : 0;

        // When user scrolls past hero section, pause rendering to free 100% CPU/GPU for smooth scrolling
        if (currentScroll > window.innerHeight * 0.75) {
          return;
        }

        const now = performance.now();
        const delta = Math.min((now - lastTime) * 0.001, 0.05);
        lastTime = now;

        // Smooth mouse follow
        mouseX += (targetX - mouseX) * 0.045;
        mouseY += (targetY - mouseY) * 0.045;

        // Camera: parallax + plunge tunnel forward on scroll
        camera.position.x = mouseX * 0.32;
        camera.position.y = -mouseY * 0.32;
        camera.position.z = Math.max(200, 560 - currentScroll * 0.48);
        camera.lookAt(0, 0, 0);

        // Slow, tranquil, elegant vortex rotation
        vortexMesh.rotation.z += 0.0006;
        vortexMesh.rotation.x = -mouseY * 0.00035 + 0.12;
        vortexMesh.rotation.y = mouseX * 0.00035;

        // Update particle positions inside buffer
        const posAttr = geometry.attributes.position as THREE.BufferAttribute;
        const posArray = posAttr.array as Float32Array;

        const vortexCenterX = mouseX * 0.18;
        const vortexCenterY = -mouseY * 0.18;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
          angles[i] += speeds[i];
          verticalWaves[i] += delta * 0.55;

          const r = radii[i];
          const theta = angles[i];
          const i3 = i * 3;

          if (isPollen[i] === 0) {
            const waveZ = Math.sin(verticalWaves[i] + r * 0.02) * 14;
            posArray[i3] = vortexCenterX + r * Math.cos(theta);
            posArray[i3 + 1] = vortexCenterY + r * Math.sin(theta);
            posArray[i3 + 2] = zOffsets[i] + waveZ;
          } else {
            posArray[i3] = vortexCenterX + r * Math.cos(theta);
            posArray[i3 + 1] = vortexCenterY + r * Math.sin(theta);
            posArray[i3 + 2] = zOffsets[i] + Math.sin(verticalWaves[i]) * 16;
          }
        }

        posAttr.needsUpdate = true;

        renderer.render(scene, camera);
      };

      animate();

      cleanupFn = () => {
        cancelAnimationFrame(animId);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("resize", onResize);
        if (mount.contains(renderer.domElement)) {
          mount.removeChild(renderer.domElement);
        }
        geometry.dispose();
        material.dispose();
        particleTexture.dispose();
        renderer.dispose();
      };
    });

    return () => {
      unmounted = true;
      if (cleanupFn) cleanupFn();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
}
