"use client";

import React, { useEffect, useState } from "react";

export default function TacticalCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [trail, setTrail] = useState({ x: -100, y: -100 });
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let targetX = -100;
    let targetY = -100;
    let currX = -100;
    let currY = -100;
    let animId: number;

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      setPos({ x: e.clientX, y: e.clientY });
      if (!visible) setVisible(true);
    };

    const onOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      if (
        el?.closest("button") ||
        el?.closest("a") ||
        el?.closest(".interactive-target") ||
        el?.closest(".reticle-box")
      ) {
        setHovered(true);
      } else {
        setHovered(false);
      }
    };

    const onDown = () => setClicked(true);
    const onUp = () => setClicked(false);
    const onLeave = () => setVisible(false);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeave);

    const loop = () => {
      currX += (targetX - currX) * 0.22;
      currY += (targetY - currY) * 0.22;
      setTrail({ x: currX, y: currY });
      animId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] hidden md:block overflow-hidden">
      {/* Outer Tactical Reticle */}
      <div
        className={`fixed -translate-x-1/2 -translate-y-1/2 transition-all duration-100 ease-out border ${
          hovered
            ? "w-10 h-10 border-[#00ff41] bg-[rgba(0,255,65,0.08)] scale-125"
            : clicked
            ? "w-8 h-8 border-[#ff0033] bg-[rgba(255,0,51,0.15)] scale-90"
            : "w-7 h-7 border-[rgba(0,240,255,0.4)] bg-transparent"
        }`}
        style={{
          left: `${trail.x}px`,
          top: `${trail.y}px`,
        }}
      >
        {/* Reticle corner ticks */}
        <span className="absolute -top-1 -left-1 w-1.5 h-1.5 border-t border-l border-white" />
        <span className="absolute -top-1 -right-1 w-1.5 h-1.5 border-t border-r border-white" />
        <span className="absolute -bottom-1 -left-1 w-1.5 h-1.5 border-b border-l border-white" />
        <span className="absolute -bottom-1 -right-1 w-1.5 h-1.5 border-b border-r border-white" />
      </div>

      {/* Center Sniper Dot */}
      <div
        className={`fixed -translate-x-1/2 -translate-y-1/2 w-1 h-1 transition-colors duration-75 ${
          hovered ? "bg-[#00ff41]" : clicked ? "bg-[#ff0033]" : "bg-[#00f0ff]"
        }`}
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
        }}
      />
    </div>
  );
}
