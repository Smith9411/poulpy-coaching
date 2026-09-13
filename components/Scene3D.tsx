"use client";

import React, { useEffect, useRef } from "react";
import type * as THREE from "three";

export default function Scene3D() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let unmounted = false;
    let cleanupFn: (() => void) | undefined;

    // Asynchronously import Three.js so main UI/scroll never block
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
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0);
      mount.appendChild(renderer.domElement);

      // 2. Soft Glow Droplet Texture (In-memory)
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

      // 3. Permanent Infinite Tentacle Spiral (Fluid Coherent Flow)
      const PARTICLE_COUNT = 6500;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(PARTICLE_COUNT * 3);
      const colors = new Float32Array(PARTICLE_COUNT * 3);

      // Spiral particle parameters
      const ARMS_COUNT = 4; // 4 Organic Poulpy Tentacle Spiral Arms
      const baseArm = new Uint8Array(PARTICLE_COUNT);
      const armProgress = new Float32Array(PARTICLE_COUNT);
      const armOffsetAngle = new Float32Array(PARTICLE_COUNT);
      const armScatterR = new Float32Array(PARTICLE_COUNT);
      const armScatterZ = new Float32Array(PARTICLE_COUNT);
      const flowSpeed = new Float32Array(PARTICLE_COUNT);
      const isAmbient = new Uint8Array(PARTICLE_COUNT);

      // Pastel Palette
      const cCoral = new THREE.Color(0xff7582);      // Core Pastel Coral
      const cCoralLight = new THREE.Color(0xffa3ad); // Luminous Coral Spark
      const cSlate = new THREE.Color(0x8fafd4);      // Pastel Slate / Ink
      const cMatcha = new THREE.Color(0xa4de87);     // Pastel Bamboo Matcha
      const cWhiteInk = new THREE.Color(0xf6f6f2);   // Sumi-e Pearl / Pollen

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const ambient = i > PARTICLE_COUNT * 0.85;
        isAmbient[i] = ambient ? 1 : 0;

        if (!ambient) {
          // Distributed along 4 spiral tentacle arms
          const arm = i % ARMS_COUNT;
          baseArm[i] = arm;

          // Normalized distance along the tentacle curve (0.0 to 1.0)
          const p = Math.pow(Math.random(), 1.4);
          armProgress[i] = p;

          // Subtle natural scatter around the core spiral spine
          armOffsetAngle[i] = (Math.random() - 0.5) * (0.28 + (1 - p) * 0.15);
          armScatterR[i] = (Math.random() - 0.5) * (18 + p * 32);
          armScatterZ[i] = (Math.random() - 0.5) * (60 + p * 90);

          // Flow speed along the spiral curve
          flowSpeed[i] = 0.00045 + Math.random() * 0.00035;

          // Compute initial position
          const armAngle = (arm * (Math.PI * 2)) / ARMS_COUNT;
          const r = 25 + p * 580 + armScatterR[i];
          const spiralCurvature = 0.0075;
          const theta = armAngle + r * spiralCurvature + armOffsetAngle[i];
          const z = armScatterZ[i];

          positions[i * 3] = r * Math.cos(theta);
          positions[i * 3 + 1] = r * Math.sin(theta);
          positions[i * 3 + 2] = z;

          // Color gradation from center coral to outer slate / matcha
          let col = cCoral;
          if (p < 0.22) {
            col = Math.random() > 0.35 ? cCoral : cCoralLight;
          } else if (p < 0.65) {
            col = Math.random() > 0.4 ? cSlate : cCoral;
          } else {
            col = Math.random() > 0.5 ? cSlate : cMatcha;
          }

          colors[i * 3] = col.r;
          colors[i * 3 + 1] = col.g;
          colors[i * 3 + 2] = col.b;
        } else {
          // Ambient drifting spores
          const r = 80 + Math.random() * 700;
          const theta = Math.random() * Math.PI * 2;
          const z = (Math.random() - 0.5) * 500;

          armProgress[i] = r;
          armOffsetAngle[i] = theta;
          flowSpeed[i] = (Math.random() - 0.5) * 0.0003;
          armScatterZ[i] = z;

          positions[i * 3] = r * Math.cos(theta);
          positions[i * 3 + 1] = r * Math.sin(theta);
          positions[i * 3 + 2] = z;

          const rand = Math.random();
          const col = rand > 0.6 ? cMatcha : rand > 0.3 ? cWhiteInk : cSlate;
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
        opacity: 0.88,
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

      // Immediate initial render
      renderer.render(scene, camera);

      // 5. Infinite Coherent Living Spiral Animation Loop
      let animId: number;
      let lastTime = performance.now();
      let globalRotation = 0;

      const animate = () => {
        animId = requestAnimationFrame(animate);

        const now = performance.now();
        const delta = Math.min((now - lastTime) * 0.001, 0.05);
        lastTime = now;

        const currentScroll = typeof window !== "undefined" ? window.scrollY : 0;

        // Smooth mouse follow
        mouseX += (targetX - mouseX) * 0.045;
        mouseY += (targetY - mouseY) * 0.045;

        // Camera positioning with smooth scroll parallax
        camera.position.x = mouseX * 0.32;
        camera.position.y = -mouseY * 0.32;
        camera.position.z = Math.max(200, 560 - currentScroll * 0.48);
        camera.lookAt(0, 0, 0);

        // Constant, serene global rotation of the entire tentacle system
        globalRotation += delta * 0.16;
        vortexMesh.rotation.x = -mouseY * 0.00035 + 0.12;
        vortexMesh.rotation.y = mouseX * 0.00035;

        // Update particle positions while strictly maintaining the permanent spiral geometry
        const posAttr = geometry.attributes.position as THREE.BufferAttribute;
        const posArray = posAttr.array as Float32Array;

        const vortexCenterX = mouseX * 0.18;
        const vortexCenterY = -mouseY * 0.18;
        const spiralCurvature = 0.0075;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const i3 = i * 3;

          if (isAmbient[i] === 0) {
            // Tentacle particles smoothly advance along the curve and cycle seamlessly
            let p = armProgress[i] + flowSpeed[i] * (delta * 60);
            if (p > 1.0) p -= 1.0;
            armProgress[i] = p;

            const arm = baseArm[i];
            const armAngle = (arm * (Math.PI * 2)) / ARMS_COUNT + globalRotation;
            const r = 25 + p * 580 + armScatterR[i];
            const theta = armAngle + r * spiralCurvature + armOffsetAngle[i];

            // Organic breathing wave
            const waveZ = Math.sin(now * 0.0018 + p * 8 + arm) * (8 + p * 14);

            posArray[i3] = vortexCenterX + r * Math.cos(theta);
            posArray[i3 + 1] = vortexCenterY + r * Math.sin(theta);
            posArray[i3 + 2] = armScatterZ[i] + waveZ;
          } else {
            // Ambient solar spores gently drift
            armOffsetAngle[i] += flowSpeed[i] * (delta * 60);
            const r = armProgress[i];
            const theta = armOffsetAngle[i];

            posArray[i3] = vortexCenterX + r * Math.cos(theta);
            posArray[i3 + 1] = vortexCenterY + r * Math.sin(theta);
            posArray[i3 + 2] = armScatterZ[i] + Math.sin(now * 0.001 + i) * 12;
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
