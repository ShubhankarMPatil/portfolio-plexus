"use client";
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import Terrain from "./Terrain";

export default function InfiniteTerrain({
  tileCount = 3,
  width = 200,
  depth = 200,
  segments = 120,
  audioData,
}) {
  const tilesRef = useRef([]);
  const tileSpacing = depth;

  const tiles = Array.from({ length: tileCount }, (_, i) => ({
    zOffset: i * tileSpacing,
    flipped: i % 2 === 1, // mirror every alternate tile
  }));

  useFrame(({ camera }) => {
    tilesRef.current.forEach((mesh, i) => {
      if (!mesh) return;

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
          flipped={tile.flipped}
          ref={(el) => (tilesRef.current[i] = el)}
        />
      ))}
    </>
  );
}
