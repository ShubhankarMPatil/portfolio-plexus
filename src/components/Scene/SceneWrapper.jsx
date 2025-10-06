"use client";
import React, { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

import InfiniteTerrain from "./InfiniteTerrain";
import MusicReactiveLines from "./MusicReactiveLines";
import Lighting from "./Lighting";
import useAudioAnalyzer from "../../hooks/useAudioAnalyzer";
import CameraMover from "./CameraMover";


export default function SceneWrapper() {
  const audioRef = useRef();
  const { dataArray, isPlaying, togglePlayback } = useAudioAnalyzer(audioRef);

  // 🎨 Vaporwave colors (adjust these for pink/blue gradient)
  const fogColor = 0x000000; // dark violet / black
  const lineColor = 0xffffff; // white lines

  return (
    <>
      <audio
        ref={audioRef}
        src="/audio/background.mp3"
        controls
        crossOrigin="anonymous"
        loop
        style={{ position: "absolute", top: 20, left: 20, zIndex: 10 }}
      />

      <Canvas
        camera={{ position: [0, 22, 45], fov: 60 }}
        gl={{ antialias: true }}
        onCreated={({ scene, gl }) => {
          scene.fog = new THREE.Fog(fogColor, 10, 150);
          gl.setClearColor(fogColor);
        }}
      >
        <Lighting />
        <InfiniteTerrain audioData={dataArray} />
        <MusicReactiveLines audioData={dataArray} isPlaying={isPlaying} />
        <CameraMover speed={0.02} />
      </Canvas>

      <div style={{ position: "absolute", bottom: 20, left: 20 }}>
        <button
          style={{
            background: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
          onClick={togglePlayback}
        >
          {isPlaying ? "Pause Music" : "Play Music"}
        </button>
      </div>
    </>
  );
}
