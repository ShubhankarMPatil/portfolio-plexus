"use client";
import React, { useState, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import PlexusSphere from "./PlexusSphere";
import PlexusCube from "./PlexusCube";
import PlexusOctahedron from "./PlexusOctahedron";

export default function ShapeManager() {
  const [shape, setShape] = useState("sphere");
  const [opacity, setOpacity] = useState(1);
  const fadeRef = useRef(1);
  const switchingRef = useRef(false);
  const groupRef = useRef();

  const rightOffset = 30;
  const verticalOffset = 0;

  const shapes = ["sphere", "cube", "octahedron"];

  // Scroll-triggered fade & morph
  useEffect(() => {
    const handleScroll = () => {
      if (switchingRef.current) return;
      switchingRef.current = true;

      // Fade out
      const fadeOut = setInterval(() => {
        fadeRef.current -= 0.05;
        setOpacity(Math.max(fadeRef.current, 0));
        if (fadeRef.current <= 0) {
          clearInterval(fadeOut);

          // Switch shape to next in array
          setShape((prev) => {
            const currentIndex = shapes.indexOf(prev);
            const nextIndex = (currentIndex + 1) % shapes.length;
            return shapes[nextIndex];
          });

          // Fade in
          const fadeIn = setInterval(() => {
            fadeRef.current += 0.05;
            setOpacity(Math.min(fadeRef.current, 1));
            if (fadeRef.current >= 1) {
              clearInterval(fadeIn);
              switchingRef.current = false;
            }
          }, 50);
        }
      }, 50);
    };

    window.addEventListener("wheel", handleScroll);
    return () => window.removeEventListener("wheel", handleScroll);
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0000;
    }
  });

  return (
    <group ref={groupRef}>
      {shape === "sphere" && (
        <PlexusSphere opacity={opacity} offset={rightOffset} verticalOffset={verticalOffset} />
      )}
      {shape === "cube" && (
        <PlexusCube opacity={opacity} offset={rightOffset} verticalOffset={verticalOffset} />
      )}
      {shape === "octahedron" && (
        <PlexusOctahedron opacity={opacity} offset={rightOffset} verticalOffset={verticalOffset} />
      )}
    </group>
  );
}
