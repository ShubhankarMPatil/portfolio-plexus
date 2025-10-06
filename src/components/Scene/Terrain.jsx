"use client";
import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { createNoise2D } from "simplex-noise";

export default function Terrain({ width = 200, depth = 200, segments = 120, audioData }) {
  const meshRef = useRef();

  // ✅ createNoise2D returns a function you can call directly
  const noise2D = useMemo(() => createNoise2D(), []);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, depth, segments, segments);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, [width, depth, segments]);

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0xffffff,
      wireframe: true,
    });
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;

    const pos = meshRef.current.geometry.attributes.position;
    const time = state.clock.elapsedTime;
    const data = audioData || [];

    // Average of 64 frequency bins (0–1 range)
    const audioFactor =
      data.length > 0
        ? data.reduce((a, b) => a + b, 0) / (data.length * 255)
        : 0.2;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // ✅ Base randomized terrain using simplex noise
      const baseHeight = noise2D(x * 0.05, z * 0.05) * 4;

      // ✅ Subtle time-based ripple (animated + music-reactive)
      const wave =
        Math.sin(x * 0.1 + z * 0.1 + time * 1.5) * 0.5 * (audioFactor * 5);

      // Combine both
      const y = baseHeight + wave;
      pos.setY(i, y);
    }

    pos.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
  });

  return <mesh ref={meshRef} geometry={geometry} material={material} />;
}
