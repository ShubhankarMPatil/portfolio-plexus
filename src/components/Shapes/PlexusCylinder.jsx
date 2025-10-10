"use client";
import * as THREE from "three";
import React, { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useCameraStore } from "../../hooks/useCameraStore";

export default function PlexusCylinder({
  radius = 8,
  count = 100,
  lineColor = "#ffffff",
  rotationSpeed = 0.001,
  offset = 40,
  verticalOffset = 0,
  opacity = 1,
}) {
  const meshRef = useRef();
  const { position, direction } = useCameraStore();

  const lines = useMemo(() => {
    const positions = [];
    const cylinder = new THREE.CylinderGeometry(radius, radius, 32, 32);
    const vertices = cylinder.attributes.position.array;
    const points = [];

    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * (vertices.length / 3)) * 3;
      points.push(
        new THREE.Vector3(vertices[idx], vertices[idx + 1], vertices[idx + 2])
      );
    }

    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        if (points[i].distanceTo(points[j]) < radius * 0.45) {
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
      opacity: opacity,
    })
  );

  // Update opacity when prop changes
  useEffect(() => {
    if (material.current) material.current.opacity = opacity;
  }, [opacity]);

  useFrame(() => {
    if (!meshRef.current) return;

    const camPos = new THREE.Vector3(...position);
    const camDir = new THREE.Vector3(...direction);

    // Offset right and vertically
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(
      new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), camDir.clone().normalize())
    );
    const target = camPos.clone()
      .add(camDir.multiplyScalar(offset))
      .add(right.multiplyScalar(offset)) // push right
      .add(new THREE.Vector3(0, verticalOffset, 0)); // vertical adjustment

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

  return <lineSegments ref={meshRef} geometry={geometry} material={material.current} />;
}
