"use client";

import React, { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Postpone heavy layout recalculations until after hero intro animation finishes completely
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 7000);

    const onFirstScroll = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener("scroll", onFirstScroll, { passive: true, once: true });

    return () => {
      clearTimeout(refreshTimer);
      window.removeEventListener("scroll", onFirstScroll);
    };
  }, []);

  return <>{children}</>;
}

