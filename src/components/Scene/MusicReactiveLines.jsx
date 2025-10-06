"use client";
import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export default function MusicReactiveLines({ width = 200, depth = 200, segments = 120, audioData, isPlaying }) {
  const meshRef = useRef();      // ✅ initialize ref
  const seedsRef = useRef();

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, depth, segments, segments);
    geo.rotateX(-Math.PI / 2);

    // random seeds for idle pulsing
    const seeds = new Float32Array(geo.attributes.position.count);
    for (let i = 0; i < seeds.length; i++) seeds[i] = Math.random();
    seedsRef.current = seeds;

    // colors for lines
    const colors = new Float32Array(geo.attributes.position.count * 3);
    for (let i = 0; i < colors.length; i += 3) {
      colors[i] = colors[i + 1] = colors[i + 2] = 0.8; // base brightness
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    return geo;
  }, [width, depth, segments]);

  const material = useMemo(() => new THREE.LineBasicMaterial({
    vertexColors: true,
    toneMapped: false
  }), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return; // ✅ Guard added

    const colors = meshRef.current.geometry.attributes.color.array;
    const time = clock.getElapsedTime();

    for (let i = 0; i < colors.length; i += 3) {
      const seed = seedsRef.current[i / 3];
      const audioVal = audioData ? audioData[i % 64] / 255 : 0;
      const pulse = isPlaying
        ? 0.2 + audioVal * 0.8
        : 0.2 + 0.5 * Math.abs(Math.sin(time + seed * 10.0));

      colors[i] = colors[i + 1] = colors[i + 2] = THREE.MathUtils.clamp(pulse, 0, 1);
    }

    meshRef.current.geometry.attributes.color.needsUpdate = true;
  });

  return <lineSegments ref={meshRef} geometry={geometry} material={material} />;
}
