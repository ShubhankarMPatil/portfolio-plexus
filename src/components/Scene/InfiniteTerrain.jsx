"use client";
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import Terrain from "./Terrain";

export default function InfiniteTerrain({ tileCount = 3, width = 200, depth = 200, segments = 120, audioData }) {
  const tilesRef = useRef([]);
  const tileSpacing = depth;

  // Initialize tiles
  const tiles = Array.from({ length: tileCount }, (_, i) => ({
    zOffset: i * tileSpacing
  }));

  useFrame(({ camera }) => {
    tilesRef.current.forEach((mesh, i) => {
      if (!mesh) return;

      // Recycle tiles if behind camera
      if (mesh.position.z - tileSpacing / 2 > camera.position.z) {
        mesh.position.z -= tileCount * tileSpacing;
      }
    });
  });

  return (
    <>
      {tiles.map((tile, i) => (
        <Terrain
          key={i}
          width={width}
          depth={depth}
          segments={segments}
          audioData={audioData}
          zOffset={tile.zOffset}
          ref={(el) => (tilesRef.current[i] = el)}
        />
      ))}
    </>
  );
}
