"use client";
import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { useFrame } from "@react-three/fiber";

export default function MusicReactiveLines({ meshRef, reactivity }) {
  const scaleRef = useRef(1);
  const timeRef = useRef(0);

  useFrame(() => {
    timeRef.current += 0.03;

    // Random pulsing if no music is playing
    const randomPulse = 1 + Math.sin(timeRef.current) * 0.05;

    // Map reactivity (0–1) to pulse scale (1–1.3)
    const targetScale = reactivity > 0.02 ? 1 + reactivity * 0.3 : randomPulse;

    // Smooth transition using gsap
    gsap.to(scaleRef, {
      current: targetScale,
      duration: 0.2,
      overwrite: true,
    });

    if (meshRef.current) {
      meshRef.current.scale.set(scaleRef.current, 1, scaleRef.current);
    }
  });

  return null;
}
