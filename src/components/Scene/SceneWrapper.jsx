"use client";
import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stats } from "@react-three/drei";
import * as THREE from "three";
import Lighting from "./Lighting";
import Terrain from "./Terrain";

export default function SceneWrapper() {
  return (
    <Canvas
      camera={{ position: [0, 15, 35], fov: 60 }}
      gl={{ antialias: true }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(new THREE.Color(0x000000));
        scene.fog = new THREE.FogExp2(0x000000, 0.04);
      }}
    >
      <Suspense fallback={null}>
        <Lighting />
        <Terrain />
      </Suspense>

      <OrbitControls enablePan={false} enableZoom enableRotate />
      <Stats />
    </Canvas>
  );
}
