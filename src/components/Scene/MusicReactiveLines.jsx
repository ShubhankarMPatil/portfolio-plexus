"use client";
import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export default function MusicReactiveLines({
  width = 200,
  depth = 200,
  segments = 120,
  audioData,
  isPlaying,
}) {
  const meshRef = useRef();

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, depth, segments, segments);
    geo.rotateX(-Math.PI / 2);
    const edges = new THREE.EdgesGeometry(geo);
    return edges;
  }, [width, depth, segments]);

  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color("#3a1d5f"), // darker purple tone
        transparent: true,
        opacity: 0.25, // faded look
      }),
    []
  );

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    const time = clock.getElapsedTime();
    const audioFactor =
      audioData && audioData.length
        ? audioData.reduce((a, b) => a + b, 0) / (audioData.length * 255)
        : 0;

    const scale = 1 + (isPlaying ? audioFactor * 0.5 : 0.1 * Math.abs(Math.sin(time)));
    meshRef.current.scale.set(scale, 1, scale);
  });

  return <lineSegments ref={meshRef} geometry={geometry} material={material} />;
}
