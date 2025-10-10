"use client";
import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { createNoise2D } from "simplex-noise";

export default function Terrain({
  width = 200,
  depth = 200,
  segments = 120,
  audioData,
  zOffset = 0,
  flipped = false,
}) {
  const meshRef = useRef();
  const noise2D = useMemo(() => createNoise2D(), []);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, depth, segments, segments);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, [width, depth, segments]);

  // darker, transparent lines for background
  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color("#3a1d5f"),
        transparent: true,
        opacity: 0.80,
      }),
    []
  );

  // convert to edges
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);

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
      const sampleX = flipped ? width - x : x;

      const baseHeight = noise2D(sampleX * scale, (z + zOffset) * scale) * amp;
      const wave =
        Math.sin(sampleX * 0.1 + (z + zOffset) * 0.1 + time * 1.5) *
        0.5 *
        (audioFactor * 5);

      pos.setY(i, baseHeight + wave);
    }

    pos.needsUpdate = true;
  });

  return <lineSegments ref={meshRef} geometry={edges} material={material} position={[0, 0, zOffset]} />;
}
