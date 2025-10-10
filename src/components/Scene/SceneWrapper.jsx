"use client";
import React, { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

import InfiniteTerrain from "./InfiniteTerrain";
import MusicReactiveLines from "./MusicReactiveLines";
import Lighting from "./Lighting";
import CameraMover from "./CameraMover";
import PlexusSphere from "./PlexusSphere"; // 👈 import new component
import { useAudioSource } from "../../hooks/useAudioSource";
import PlexusMorph from "./PlexusMorph";

export default function SceneWrapper() {
  const audioRef = useRef();
  const [mode, setMode] = useState("internal");
  const { dataArray } = useAudioSource(audioRef, mode);
  const [morphTarget, setMorphTarget] = useState("sphere");


  const fogColor = 0x000000;

  return (
    <>
      {mode === "internal" && (
        <audio
          ref={audioRef}
          src="/audio/background.mp3"
          controls
          crossOrigin="anonymous"
          loop
          style={{ position: "absolute", top: -100, left: -100, zIndex: 10 }}
        />
      )}

      <Canvas
        camera={{ position: [0, 22, 45], fov: 60 }}
        gl={{ antialias: true }}
        onCreated={({ scene, gl }) => {
          scene.fog = new THREE.Fog(fogColor, 10, 150);
          gl.setClearColor(fogColor);
        }}
      >
        <Lighting />

        {/* Fade/darken background slightly */}
        <group>
          <InfiniteTerrain audioData={dataArray} />
          <MusicReactiveLines audioData={dataArray} />
        </group>

        {/* Foreground rotating plexus sphere */}
        <PlexusMorph morphTarget={mode === "internal" ? "sphere" : "cube"} />


        {/* Add bloom for a soft glowing effect */}
        <EffectComposer>
          <Bloom
            intensity={1.2}
            luminanceThreshold={0.1}
            luminanceSmoothing={0.9}
            height={300}
          />
        </EffectComposer>

        <CameraMover speed={0.02} />
        <OrbitControls />
      </Canvas>

      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: 20,
          display: "flex",
          gap: "10px",
        }}
      >
        <button
          onClick={() => setMode((m) => (m === "internal" ? "external" : "internal"))}
          style={{
            background: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {mode === "internal" ? "Use Other Tab Audio" : "Use Built-in Music"}
        </button>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: 20,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <button
          onClick={() => setMode((m) => (m === "internal" ? "external" : "internal"))}
          style={{
            background: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {mode === "internal" ? "Use Other Tab Audio" : "Use Built-in Music"}
        </button>

        <button
          onClick={() => setMorphTarget((t) => (t === "sphere" ? "cube" : "sphere"))}
          style={{
            background: "#111",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Morph to {morphTarget === "sphere" ? "Cube" : "Sphere"}
        </button>
      </div>

    </>
  );
}
