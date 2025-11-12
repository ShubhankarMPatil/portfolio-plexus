"use client";
import * as THREE from "three";
import React, { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useCameraStore } from "../../hooks/useCameraStore";

export default function PlexusOctahedron({
  radius = 8,
  count = 150,
  lineColor = "#ffffff",
  rotationSpeed = 0.05,
  offset = 40,
  opacity = 1,
}) {
  const meshRef = useRef();
  const { position, direction } = useCameraStore();

  // Function to generate random point on octahedron surface
  const randomPointOnOctahedron = (r) => {
    // Random direction
    const x = Math.random() * 2 - 1;
    const y = Math.random() * 2 - 1;
    const z = Math.random() * 2 - 1;
    const absSum = Math.abs(x) + Math.abs(y) + Math.abs(z);
    return new THREE.Vector3((x / absSum) * r, (y / absSum) * r, (z / absSum) * r);
  };

  const lines = useMemo(() => {
    const positions = [];
    const points = [];

    for (let i = 0; i < count; i++) {
      points.push(randomPointOnOctahedron(radius));
    }

    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dist = points[i].distanceTo(points[j]);
        if (dist < radius * 0.5) {
          positions.push(
            points[i].x, points[i].y, points[i].z,
            points[j].x, points[j].y, points[j].z
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

  const material = useRef(
    new THREE.LineBasicMaterial({
      color: new THREE.Color(lineColor),
      transparent: true,
      opacity,
    })
  );

  useEffect(() => {
    if (material.current) material.current.opacity = opacity;
  }, [opacity]);

  useFrame(() => {
    if (!meshRef.current) return;

    const camPos = new THREE.Vector3(...position);
    const camDir = new THREE.Vector3(...direction);
    const target = camPos.clone().add(camDir.multiplyScalar(offset));
    meshRef.current.position.lerp(target, 0.08);

    meshRef.current.rotation.y += rotationSpeed;
    meshRef.current.rotation.x += rotationSpeed * 0.3;

    const pos = meshRef.current.geometry.attributes.position;
    const t = performance.now() * 0.001;
    for (let i = 0; i < pos.count; i += 6) {
      pos.array[i + 1] += Math.sin(t + i) * 0.0003;
    }
    pos.needsUpdate = true;
  });

  return (
    <lineSegments
      ref={meshRef}
      geometry={geometry}
      material={material.current}
    />
  );
}
