"use client";
import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { generateHeight } from "../../utils/noiseUtils";

export default function Terrain({
  width = 200,
  depth = 200,
  segments = 100,
  speed = 0.02,
}) {
  const meshRef = useRef();
  const timeRef = useRef(0);

  // Create geometry and base positions
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, depth, segments, segments);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = generateHeight(x, z);
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, [width, depth, segments]);

  useFrame(() => {
    timeRef.current += speed;
    const pos = meshRef.current.geometry.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = generateHeight(x, z + timeRef.current * 10);
      pos.setY(i, y);
    }

    pos.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshBasicMaterial
        color="white"
        wireframe
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}
