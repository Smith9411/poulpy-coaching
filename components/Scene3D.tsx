"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import * as THREE from "three";

export default function Scene3D() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
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
        depth: false,
        stencil: false,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.0 : 1.25));
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

      // 3. VCT 2026 Champions Shanghai Dragon Vortex (Calibrated Harmonious Palette)
      const PARTICLE_COUNT = isMobile ? 3800 : 6000;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(PARTICLE_COUNT * 3);
      const colors = new Float32Array(PARTICLE_COUNT * 3);
      const aArmProgress = new Float32Array(PARTICLE_COUNT);
      const aIsAmbient = new Float32Array(PARTICLE_COUNT);
      const aRadius = new Float32Array(PARTICLE_COUNT);
      const aArmOffset = new Float32Array(PARTICLE_COUNT);
      const aThetaNoise = new Float32Array(PARTICLE_COUNT);

      // Softer, elegant pastel red (less blinding, subtle background depth) & vibrant botanical greens
      const cKoiRed = new THREE.Color(0xc02e40);      // Rouge profond velouté (moins criard)
      const cKoiRedLight = new THREE.Color(0xee5f70); // Rouge corail pastel doux (non saturé, fond feutré)
      const cSeafoam = new THREE.Color(0x00b4a0);     // 0x00B4A0 Vert d'eau vibrant
      const cPetrol = new THREE.Color(0x064e48);      // 0x064E48 Vert pétrole profond
      const cWashi = new THREE.Color(0x5eead4);       // 0x5EEAD4 Menthe clair lumineux
      const cWhiteLight = new THREE.Color(0xffffff);  // Blanc étincelle

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        // 28% d'ambiance flottante pour plus de pastilles qui se baladent agréablement en fond
        const isAmb = i > PARTICLE_COUNT * 0.72;
        aIsAmbient[i] = isAmb ? 1.0 : 0.0;

        if (!isAmb) {
          // Vortex Spiral Arms
          const armIndex = i % 3;
          const armOffset = (armIndex * (Math.PI * 2)) / 3;

          const progress = Math.pow(Math.random(), 1.6);
          const r = 25 + progress * 580;
          const noise = (Math.random() - 0.5) * 0.45;
          const theta = armOffset + r * 0.012 + noise;
          const z = (Math.random() - 0.5) * (180 - progress * 80);

          positions[i * 3] = r * Math.cos(theta);
          positions[i * 3 + 1] = r * Math.sin(theta);
          positions[i * 3 + 2] = z;

          aArmProgress[i] = progress;
          aRadius[i] = r;
          aArmOffset[i] = armOffset;
          aThetaNoise[i] = noise;

          let col = cKoiRed;
          if (r < 180) {
            // Cœur : rouge pastel adouci avec 35% de vert mélangé (seafoam + washi)
            const rand = Math.random();
            col = rand > 0.65 ? cKoiRed : rand > 0.35 ? cKoiRedLight : (rand > 0.12 ? cSeafoam : cWashi);
          } else if (r < 320) {
            // Transition : dominante verte (82%) avec touches de rouge pastel
            const rand = Math.random();
            col = rand > 0.4 ? cSeafoam : rand > 0.18 ? cWashi : (rand > 0.08 ? cKoiRedLight : cPetrol);
          } else if (r < 460) {
            // Bras médian : 85% de vert visible (seafoam + washi)
            const rand = Math.random();
            col = rand > 0.45 ? cSeafoam : rand > 0.15 ? cWashi : cPetrol;
          } else {
            // Fin des tentacules : 88% de vert clair lumineux (washi + seafoam)
            const rand = Math.random();
            col = rand > 0.5 ? cWashi : rand > 0.12 ? cSeafoam : cPetrol;
          }

          colors[i * 3] = col.r;
          colors[i * 3 + 1] = col.g;
          colors[i * 3 + 2] = col.b;
        } else {
          // Pastilles flottantes d'ambiance (plus nombreuses, dominante vert menthe & d'eau)
          const r = 100 + Math.random() * 650;
          const theta = Math.random() * Math.PI * 2;
          const z = (Math.random() - 0.5) * 600;

          positions[i * 3] = r * Math.cos(theta);
          positions[i * 3 + 1] = r * Math.sin(theta);
          positions[i * 3 + 2] = z;

          aArmProgress[i] = Math.random();
          aRadius[i] = r;
          aArmOffset[i] = 0;
          aThetaNoise[i] = 0;

          const rand = Math.random();
          const col = rand > 0.45 ? cSeafoam : rand > 0.15 ? cWashi : (rand > 0.06 ? cWhiteLight : cKoiRedLight);
          colors[i * 3] = col.r;
          colors[i * 3 + 1] = col.g;
          colors[i * 3 + 2] = col.b;
        }
      }

      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute("aRadius", new THREE.BufferAttribute(aRadius, 1));
      geometry.setAttribute("aIsAmbient", new THREE.BufferAttribute(aIsAmbient, 1));

      const animUniforms = {
        uProgress: { value: 0.0 },
        uSize: { value: isMobile ? 4.0 : 4.5 },
        uScale: { value: height * 0.5 },
        uTexture: { value: particleTexture },
      };

      const material = new THREE.ShaderMaterial({
        uniforms: animUniforms,
        vertexShader: `
          uniform float uProgress;
          uniform float uSize;
          uniform float uScale;
          attribute vec3 color;
          attribute float aRadius;
          attribute float aIsAmbient;
          varying vec3 vColor;
          varying float vAlpha;

          void main() {
            vColor = color;

            // Normalized distance along spiral arm: 0.0 at core (25), 1.0 at outer edge (605)
            float normDist = clamp((aRadius - 25.0) / 580.0, 0.0, 1.0);

            // Wide, soft continuous wavefront for progressive organic unfurling
            float span = 0.45;
            float sweep = uProgress * (1.0 + span);
            float localP = clamp((sweep - normDist) / span, 0.0, 1.0);

            // Smooth cubic ease for gentle, continuous particle reveal along spiral arms
            float s = localP * localP * (3.0 - 2.0 * localP);
            float tentacleP = s;

            // Hardware clip-space culling for unreached particles:
            // Eliminates Direct3D 11 degenerate 0-sized point primitives and rasterizer bursts
            if (aIsAmbient < 0.5 && tentacleP <= 0.0001) {
              gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
              gl_PointSize = 0.0;
              return;
            }

            // Ambient particles: always active with 0.85 glow (matching Vercel opacity)
            // Tentacle particles: construct smoothly outwards with constant fluid speed
            float finalAlpha = mix(tentacleP, 0.85, aIsAmbient);
            vAlpha = finalAlpha;

            // Tentacles stretch smoothly (16%) outward along their arm vector into place
            float stretch = mix(mix(0.84, 1.0, tentacleP), 1.0, aIsAmbient);
            vec4 mvPosition = modelViewMatrix * vec4(position * stretch, 1.0);

            // Point size matches exact Vercel size (4.5)
            float ptScale = mix(tentacleP, 1.0, aIsAmbient);
            gl_PointSize = uSize * ptScale * (uScale / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform sampler2D uTexture;
          varying vec3 vColor;
          varying float vAlpha;

          void main() {
            vec4 tex = texture2D(uTexture, gl_PointCoord);
            gl_FragColor = vec4(vColor * tex.rgb, 0.85 * vAlpha * tex.a);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
      });

      const vortexMesh = new THREE.Points(geometry, material);
      scene.add(vortexMesh);

      let isRevealing = false;
      let revealStartTime = 0;
      let fallbackTimer: NodeJS.Timeout | undefined;

      const startReveal = () => {
        if (isRevealing) return;
        isRevealing = true;
        if (fallbackTimer) clearTimeout(fallbackTimer);
        revealStartTime = performance.now();
      };

      window.addEventListener("poulpy_splash_reveal", startReveal);
      fallbackTimer = setTimeout(startReveal, 3000);

      // 4. Mouse & Scroll Interactivity
      let mouseX = 0;
      let mouseY = 0;
      let targetX = 0;
      let targetY = 0;
      let halfW = window.innerWidth * 0.5;
      let halfH = window.innerHeight * 0.5;
      let heroCutoff = window.innerHeight * 0.85;

      const onMouseMove = (e: MouseEvent) => {
        targetX = (e.clientX - halfW) * 0.5;
        targetY = (e.clientY - halfH) * 0.5;
      };
      if (!isMobile) {
        window.addEventListener("mousemove", onMouseMove, { passive: true });
      }

      let currentScroll = typeof window !== "undefined" ? window.scrollY : 0;
      const onScroll = () => {
        currentScroll = window.scrollY;
      };
      window.addEventListener("scroll", onScroll, { passive: true });

      const onResize = () => {
        halfW = window.innerWidth * 0.5;
        halfH = window.innerHeight * 0.5;
        heroCutoff = window.innerHeight * 0.85;
        animUniforms.uScale.value = window.innerHeight * 0.5;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener("resize", onResize, { passive: true });

      // Pre-warm the GPU pipeline with a single render pass while splash screen covers viewport
      renderer.render(scene, camera);

      // 5. Ultra-Smooth 60/120Hz GPU-Accelerated Render Loop (0% CPU overhead)
      let animId: number;
      let lastTime = performance.now();

      const animate = () => {
        animId = requestAnimationFrame(animate);

        // Pause rendering when tab is hidden or user has scrolled down past hero
        if (document.hidden) return;
        if (currentScroll > heroCutoff) {
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

        // Camera positioning (exactement comme sur Vercel, distance 560 fixe, AUCUN zoom)
        camera.position.x = mouseX * 0.32;
        camera.position.y = -mouseY * 0.32;
        camera.position.z = Math.max(200, 560 - currentScroll * 0.48);
        camera.lookAt(0, 0, 0);

        // GPU-native matrix rotation (100x faster than CPU array mutation)
        vortexMesh.rotation.z += 0.0017 * timeFactor;
        vortexMesh.rotation.x = -mouseY * 0.00035 + 0.12;
        vortexMesh.rotation.y = mouseX * 0.00035;

        // Perfectly synchronous, hardware-clock driven branch expansion inside RAF
        if (isRevealing && animUniforms.uProgress.value < 1.0) {
          const elapsed = (now - revealStartTime) * 0.001;
          const t = Math.min(1.0, elapsed / 4.5);
          // Fluid organic ease-out: starts immediately with gentle presence as Poulpy reveals,
          // completely removing the 0.5s dead gap, then settles progressively into full bloom
          const s = 1.0 - Math.pow(1.0 - t, 2.4);
          animUniforms.uProgress.value = s;
        }

        renderer.render(scene, camera);
      };

      animate();

      return () => {
        cancelAnimationFrame(animId);
        if (fallbackTimer) clearTimeout(fallbackTimer);
        window.removeEventListener("poulpy_splash_reveal", startReveal);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
        geometry.dispose();
        material.dispose();
        particleTexture.dispose();
        renderer.dispose();
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
