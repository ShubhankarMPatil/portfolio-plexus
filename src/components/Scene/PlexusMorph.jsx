// PlexusMorph.jsx
"use client";
import * as THREE from "three";
import React, { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useCameraStore } from "../../hooks/useCameraStore";

export default function PlexusMorph({
  radius = 8,
  count = 180,
  lineColor = "#ffffff",
  rotationSpeed = 0.001,
  offset = 40,
  morphTarget = "sphere", // now controlled externally
  morphDuration = 2,
}) {
  const meshRef = useRef();
  const { position, direction } = useCameraStore();
  const morphRef = useRef(0);

  const samplePoints = (geometry, count) => {
    const verts = geometry.attributes.position.array;
    const points = [];
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * (verts.length / 3)) * 3;
      points.push(new THREE.Vector3(verts[idx], verts[idx + 1], verts[idx + 2]));
    }
    return points;
  };

  const { spherePoints, cubePoints, lines } = useMemo(() => {
    const sphereGeo = new THREE.SphereGeometry(radius, 32, 32);
    const cubeGeo = new THREE.BoxGeometry(radius * 1.4, radius * 1.4, radius * 1.4, 16, 16, 16);

    const spherePts = samplePoints(sphereGeo, count);
    const cubePts = samplePoints(cubeGeo, count);

    const positions = [];
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dist = spherePts[i].distanceTo(spherePts[j]);
        if (dist < radius * 0.45) {
          positions.push(
            spherePts[i].x,
            spherePts[i].y,
            spherePts[i].z,
            spherePts[j].x,
            spherePts[j].y,
            spherePts[j].z
          );
        }
      }
    }

    return {
      spherePoints: spherePts,
      cubePoints: cubePts,
      lines: new Float32Array(positions),
    };
  }, [radius, count]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(lines, 3));
    return geo;
  }, [lines]);

  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color(lineColor),
        transparent: true,
        opacity: 0.95,
      }),
    [lineColor]
  );

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // camera follow
    const camPos = new THREE.Vector3(...position);
    const camDir = new THREE.Vector3(...direction);
    const target = camPos.clone().add(camDir.multiplyScalar(offset));
    meshRef.current.position.lerp(target, 0.08);

    // rotation
    meshRef.current.rotation.y += rotationSpeed;
    meshRef.current.rotation.x += rotationSpeed * 0.3;

    // smooth morph lerp
    const targetMorph = morphTarget === "sphere" ? 0 : 1;
    morphRef.current += (targetMorph - morphRef.current) * delta * (1 / morphDuration);
    const m = morphRef.current;

    // morph geometry
    const pos = meshRef.current.geometry.attributes.position;
    const t = performance.now() * 0.001;

    for (let i = 0; i < pos.count; i += 6) {
      const idx = (i / 6) % spherePoints.length;
      const p1s = spherePoints[idx];
      const p1c = cubePoints[idx];
      const p = p1s.clone().lerp(p1c, m);

      pos.array[i] = p.x;
      pos.array[i + 1] = p.y + Math.sin(t + i) * 0.0003;
      pos.array[i + 2] = p.z;
    }

    pos.needsUpdate = true;
  });

  return <lineSegments ref={meshRef} geometry={geometry} material={material} />;
}
