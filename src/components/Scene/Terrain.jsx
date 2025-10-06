"use client";
import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { createNoise2D } from "simplex-noise";

export default function Terrain({
  width = 200,
  depth = 200,
  segments = 120,
  audioData,
}) {
  const meshRef = useRef();
  const { camera } = useThree();
  const noise2D = useMemo(() => createNoise2D(), []);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, depth, segments, segments);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, [width, depth, segments]);

  // 🎨 === COLOR CONTROLS ===
  // You can change these two lines to adjust your vaporwave palette easily.
  const COLOR_TOP = "#ffffff"; // ← pink / magenta tone
  const COLOR_BOTTOM = "#000000"; // ← blue / purple tone

  // Fog color and range
  const FOG_COLOR = "#000000";
  const FOG_NEAR = 10;
  const FOG_FAR = 100;

  // 🎨 Shader material with gradient & fog
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColorTop: { value: new THREE.Color(COLOR_TOP) },
        uColorBottom: { value: new THREE.Color(COLOR_BOTTOM) },
        uFogColor: { value: new THREE.Color(FOG_COLOR) },
        uFogNear: { value: FOG_NEAR },
        uFogFar: { value: FOG_FAR },
        uCameraPos: { value: new THREE.Vector3() },
      },
      vertexShader: `
        varying float vY;
        varying vec3 vWorldPos;
        void main() {
          vY = position.y;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uColorTop;
        uniform vec3 uColorBottom;
        uniform vec3 uFogColor;
        uniform float uFogNear;
        uniform float uFogFar;
        uniform vec3 uCameraPos;

        varying float vY;
        varying vec3 vWorldPos;

        void main() {
          // Gradient based on height
          float heightMix = smoothstep(-10.0, 10.0, vY);
          vec3 baseColor = mix(uColorBottom, uColorTop, heightMix);

          // Proper world-space distance-based fog
          float dist = distance(uCameraPos, vWorldPos);
          float fogFactor = smoothstep(uFogNear, uFogFar, dist);

          vec3 color = mix(baseColor, uFogColor, fogFactor);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      wireframe: true,
    });
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;

    const pos = meshRef.current.geometry.attributes.position;
    const time = state.clock.elapsedTime;
    const data = audioData || [];

    // Update camera position for fog calculations
    material.uniforms.uCameraPos.value.copy(camera.position);

    const audioFactor =
      data.length > 0
        ? data.reduce((a, b) => a + b, 0) / (data.length * 255)
        : 0.2;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // Terrain base + reactive animation
      const baseHeight = noise2D(x * 0.05, z * 0.05) * 4;
      const wave =
        Math.sin(x * 0.1 + z * 0.1 + time * 1.5) * 0.5 * (audioFactor * 5);
      const y = baseHeight + wave;

      pos.setY(i, y);
    }

    pos.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
    material.uniforms.uTime.value = time;
  });

  return (
    <mesh ref={meshRef} geometry={geometry} material={material} />
  );
}
