"use client";
import React, { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import Terrain from "./Terrain";
import MusicReactiveLines from "./MusicReactiveLines";
import Lighting from "./Lighting";
import useAudioAnalyzer from "../../hooks/useAudioAnalyzer";

export default function SceneWrapper() {
  const audioRef = useRef();
  const { dataArray, isPlaying, togglePlayback } = useAudioAnalyzer(audioRef);

  return (
    <>
      {/* Audio DOM element outside Canvas */}
      <audio
        ref={audioRef}
        src="/audio/background.mp3"
        controls
        crossOrigin="anonymous"
        loop
        style={{ position: "absolute", top: 20, left: 20, zIndex: 10 }}
      />

      <Canvas camera={{ position: [0, 22, 45], fov: 60 }}>
        <Lighting />
        <Terrain audioData={dataArray} />
        <MusicReactiveLines audioData={dataArray} isPlaying={isPlaying} />
        <OrbitControls enablePan={false} enableZoom enableRotate />
      </Canvas>

      {/* Play/Pause Button (optional) */}
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
