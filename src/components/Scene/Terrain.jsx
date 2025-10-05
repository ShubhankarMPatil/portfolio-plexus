"use client";
import React, { forwardRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { generateHeight } from "../../utils/noiseUtils";

const Terrain = forwardRef(
  ({ width = 200, depth = 200, segments = 100, speed = 0.02 }, ref) => {
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

    useFrame((_, delta) => {
      const pos = ref.current.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        const y = generateHeight(x, z + delta * 100);
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
    });

    return (
      <mesh ref={ref} geometry={geometry}>
        <meshBasicMaterial color="white" wireframe opacity={0.7} />
      </mesh>
    );
  }
);

export default Terrain;
