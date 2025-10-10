"use client";
import React, { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

import ShapeManager from "../Shapes/ShapeManager";
import Lighting from "./Lighting";
import InfiniteTerrain from "./InfiniteTerrain";
import MusicReactiveLines from "./MusicReactiveLines";
import CameraMover from "./CameraMover";
import useAudioSource from "../../hooks/useAudioSource";

export default function SceneWrapper() {
  const audioRef = useRef();
  const [mode, setMode] = useState("internal");
  const { dataArray, isPlaying } = useAudioSource(audioRef, mode);

  const fogColor = 0x000000;

  return (
    <>
      <audio
        ref={audioRef}
        src="/audio/background.mp3"
        loop
        crossOrigin="anonymous"
        style={{ display: "none" }}
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
        <ShapeManager />
        <InfiniteTerrain audioData={dataArray} />
        <MusicReactiveLines audioData={dataArray} isPlaying={isPlaying} />
        <CameraMover speed={0.02} />

        {/* Bloom postprocessing */}
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            height={300}
            intensity={1.2}
          />
        </EffectComposer>
      </Canvas>

      <div style={{ position: "absolute", bottom: 20, left: 20 }}>
        <button
          onClick={() => {
            if (mode === "internal") setMode("external");
            else {
              setMode("internal");
              audioRef.current.play();
            }
          }}
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
    </>
  );
}
