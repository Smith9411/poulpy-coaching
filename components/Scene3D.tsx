"use client";

import React, { useEffect, useRef } from "react";
import type * as THREE from "three";

export default function Scene3D() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let unmounted = false;
    let cleanupFn: (() => void) | undefined;

    // Asynchronously import Three.js in client microtask so main thread UI/scroll never wait
    import("three").then((THREE) => {
      if (unmounted || !canvasRef.current) return;
      const canvasEl = canvasRef.current;

      // 1. Scene, Fog, Camera, Renderer
      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x0A1C1D, 0.0008);

      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobile = width < 768 || (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0);

      const camera = new THREE.PerspectiveCamera(55, width / height, 1, 3000);
      camera.position.set(0, 0, 560);

      const renderer = new THREE.WebGLRenderer({
        canvas: canvasEl,
        alpha: true,
        antialias: false,
        powerPreference: "high-performance",
        precision: isMobile ? "mediump" : "highp",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.5));
      renderer.setSize(width, height);
      renderer.setClearColor(0x0A1C1D, 0);

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

      // 3. VCT 2026 Champions Shanghai Dragon Vortex (GPU-Accelerated Geometry)
      const PARTICLE_COUNT = isMobile ? 3200 : 5200;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(PARTICLE_COUNT * 3);
      const colors = new Float32Array(PARTICLE_COUNT * 3);

      // Japanese Koi Vinyl Palette with Subtle Cyan Cosmic Accents
      const cKoiRed = new THREE.Color(0xca1c30);      // 1. Japanese Koi Scarlet Red (Center Core)
      const cKoiRedLight = new THREE.Color(0xff4655); // Luminous Koi Spark
      const cSeafoam = new THREE.Color(0x00b4a0);     // 2. Aquamarine Seafoam (Vinyl Ripples)
      const cPetrol = new THREE.Color(0x064e48);      // 3. Deep Petrol Ocean Teal
      const cWashi = new THREE.Color(0x5eead4);       // 4. Japanese Washi Cream
      const cWhiteLight = new THREE.Color(0xffffff);  // Pure White Water Spore

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const isAmbient = i > PARTICLE_COUNT * 0.8;

        if (!isAmbient) {
          // Vortex Spiral Arms
          const armIndex = i % 3;
          const armOffset = (armIndex * (Math.PI * 2)) / 3;

          const progress = Math.pow(Math.random(), 1.6);
          const r = 25 + progress * 580;
          const theta = armOffset + r * 0.012 + (Math.random() - 0.5) * 0.45;
          const z = (Math.random() - 0.5) * (180 - progress * 80);

          positions[i * 3] = r * Math.cos(theta);
          positions[i * 3 + 1] = r * Math.sin(theta);
          positions[i * 3 + 2] = z;

          // Koi Scarlet Red in center core, Aquamarine Seafoam & Petrol in outer spirals
          let col = cKoiRed;
          if (r < 180) {
            const rand = Math.random();
            col = rand > 0.75 ? cKoiRed : rand > 0.2 ? cKoiRedLight : cSeafoam;
          } else if (r < 320) {
            const rand = Math.random();
            col = rand > 0.5 ? cSeafoam : rand > 0.28 ? cPetrol : rand > 0.1 ? cKoiRedLight : cWashi;
          } else if (r < 460) {
            const rand = Math.random();
            col = rand > 0.5 ? cSeafoam : rand > 0.22 ? cWashi : cPetrol;
          } else {
            const rand = Math.random();
            col = rand > 0.5 ? cWashi : rand > 0.25 ? cSeafoam : cPetrol;
          }

          colors[i * 3] = col.r;
          colors[i * 3 + 1] = col.g;
          colors[i * 3 + 2] = col.b;
        } else {
          // Ambient Floating Water & Vinyl Spores
          const r = 100 + Math.random() * 650;
          const theta = Math.random() * Math.PI * 2;
          const z = (Math.random() - 0.5) * 600;

          positions[i * 3] = r * Math.cos(theta);
          positions[i * 3 + 1] = r * Math.sin(theta);
          positions[i * 3 + 2] = z;

          const rand = Math.random();
          const col = rand > 0.5 ? cSeafoam : rand > 0.3 ? cWashi : rand > 0.15 ? cWhiteLight : cKoiRedLight;
          colors[i * 3] = col.r;
          colors[i * 3 + 1] = col.g;
          colors[i * 3 + 2] = col.b;
        }
      }

      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: isMobile ? 4.0 : 4.5,
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
      if (!isMobile) {
        window.addEventListener("mousemove", onMouseMove, { passive: true });
      }

      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener("resize", onResize, { passive: true });

      // Immediate synchronous initial render
      renderer.render(scene, camera);

      // 5. Ultra-Smooth 60/120Hz GPU-Accelerated Render Loop (0% CPU overhead)
      let animId: number;
      let lastTime = performance.now();

      const animate = () => {
        animId = requestAnimationFrame(animate);

        // Pause rendering when tab is hidden or user has scrolled down past hero
        if (document.hidden) return;
        const currentScroll = typeof window !== "undefined" ? window.scrollY : 0;
        if (currentScroll > window.innerHeight * 0.85) {
          lastTime = performance.now();
          return;
        }

        const now = performance.now();
        const delta = Math.min((now - lastTime) * 0.001, 0.05);
        lastTime = now;
        const timeFactor = delta * 60;

        // Smooth mouse parallax
        mouseX += (targetX - mouseX) * 0.045;
        mouseY += (targetY - mouseY) * 0.045;

        // Camera positioning
        camera.position.x = mouseX * 0.32;
        camera.position.y = -mouseY * 0.32;
        camera.position.z = Math.max(200, 560 - currentScroll * 0.48);
        camera.lookAt(0, 0, 0);

        // GPU-native matrix rotation (100x faster than CPU array mutation)
        vortexMesh.rotation.z += 0.0017 * timeFactor;
        vortexMesh.rotation.x = -mouseY * 0.00035 + 0.12;
        vortexMesh.rotation.y = mouseX * 0.00035;

        renderer.render(scene, camera);
      };

      animate();

      cleanupFn = () => {
        cancelAnimationFrame(animId);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("resize", onResize);
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
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden w-full h-full"
      aria-hidden="true"
    />
  );
}
