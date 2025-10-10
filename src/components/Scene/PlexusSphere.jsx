"use client";
import * as THREE from "three";
import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useCameraStore } from "../../hooks/useCameraStore";

export default function PlexusSphere({
  radius = 8,
  count = 180,
  lineColor = "#ffffff",
  rotationSpeed = 0.001,
  offset = 40,
}) {
  const meshRef = useRef();
  const { position, direction } = useCameraStore();

  // build plexus-like random lines
  const lines = useMemo(() => {
    const positions = [];
    const sphere = new THREE.SphereGeometry(radius, 32, 32);
    const vertices = sphere.attributes.position.array;
    const points = [];

    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * (vertices.length / 3)) * 3;
      points.push(
        new THREE.Vector3(vertices[idx], vertices[idx + 1], vertices[idx + 2])
      );
    }

    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dist = points[i].distanceTo(points[j]);
        if (dist < radius * 0.45) {
          positions.push(
            points[i].x,
            points[i].y,
            points[i].z,
            points[j].x,
            points[j].y,
            points[j].z
          );
        }
      }
    }

    return new Float32Array(positions);
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
    const camPos = new THREE.Vector3(...position);
    const camDir = new THREE.Vector3(...direction);
    const target = camPos.clone().add(camDir.multiplyScalar(offset));
    meshRef.current.position.lerp(target, 0.08);

    // slow, elegant rotation
    meshRef.current.rotation.y += rotationSpeed;
    meshRef.current.rotation.x += rotationSpeed * 0.3;

    // gentle vertex jitter for a “living” effect
    const pos = meshRef.current.geometry.attributes.position;
    const t = performance.now() * 0.001;
    for (let i = 0; i < pos.count; i += 6) {
      pos.array[i + 1] += Math.sin(t + i) * 0.0003; // subtle Y movement
    }
    pos.needsUpdate = true;
  });

  return <lineSegments ref={meshRef} geometry={geometry} material={material} />;
}
