"use client";
import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { createNoise2D } from "simplex-noise";

export default function Terrain(
  {
    width = 200,
    depth = 200,
    segments = 120,
    audioData,
    zOffset = 0,
    flipped = false, // controls mirrored elevation
  },
  ref
) {
  const meshRef = useRef();
  const noise2D = useMemo(() => createNoise2D(), []);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, depth, segments, segments);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, [width, depth, segments]);

  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color: 0xffffff, wireframe: true }),
    []
  );

  useFrame((state) => {
    if (!meshRef.current) return;
    const pos = meshRef.current.geometry.attributes.position;
    const time = state.clock.elapsedTime;
    const data = audioData || [];
    const audioFactor =
      data.length > 0
        ? data.reduce((a, b) => a + b, 0) / (data.length * 255)
        : 0.2;

    const scale = 0.05;
    const amp = 4;

    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let z = pos.getZ(i);

      // Mirror the noise sampling on X-axis if flipped
      const sampleX = flipped ? width - x : x;

      // Use mirrored noise sampling so edges line up
      const baseHeight = noise2D(sampleX * scale, (z + zOffset) * scale) * amp;

      // Add music-reactive wave
      const wave =
        Math.sin(sampleX * 0.1 + (z + zOffset) * 0.1 + time * 1.5) *
        0.5 *
        (audioFactor * 5);

      pos.setY(i, baseHeight + wave);
    }

    pos.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
  });

  return (
    <mesh
      ref={(el) => {
        meshRef.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
      }}
      geometry={geometry}
      material={material}
      position={[0, 0, zOffset]}
    />
  );
}
