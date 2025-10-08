"use client";
import React, { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

import InfiniteTerrain from "./InfiniteTerrain";
import MusicReactiveLines from "./MusicReactiveLines";
import Lighting from "./Lighting";
import CameraMover from "./CameraMover";

import useAudioSource from "../../hooks/useAudioSource";

export default function SceneWrapper() {
  const audioRef = useRef();
  const { dataArray, isPlaying, mode, togglePlayback, toggleMode } =
    useAudioSource(audioRef);

  const fogColor = 0x000000;
  const lineColor = 0xffffff;

  return (
    <>
      {/* 🎵 Internal background music (only used in internal mode) */}
      <audio
        ref={audioRef}
        src="/audio/background.mp3"
        crossOrigin="anonymous"
        loop
        style={{ display: mode === "internal" ? "block" : "none" }}
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

      {/* 🎚️ UI Controls */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: 20,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <button
          style={{
            background: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
          onClick={togglePlayback}
          disabled={mode === "external"}
        >
          {isPlaying ? "Pause Music" : "Play Music"}
        </button>

        <button
          style={{
            background: mode === "external" ? "#00ffff" : "#ff00ff",
            border: "none",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
            color: "black",
          }}
          onClick={toggleMode}
        >
          {mode === "internal"
            ? "🎧 Use Other Tab Audio"
            : "🎶 Use Built-in Music"}
        </button>

        {mode === "external" && (
          <p style={{ color: "white", fontSize: "0.9rem", marginTop: 8 }}>
            Listening to shared tab audio...
          </p>
        )}
      </div>
    </>
  );
}
