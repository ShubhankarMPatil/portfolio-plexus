"use client";
import { useFrame } from "@react-three/fiber";
import { useCameraStore } from "../../hooks/useCameraStore";
import { useRef } from "react";
import * as THREE from "three";

export default function CameraMover({ speed = 0.02 }) {
  const ref = useRef();
  const { setPosition, setDirection } = useCameraStore();

  useFrame(({ camera }) => {
    // Move camera slowly forward
    camera.position.z += speed;

    // Keep the camera looking slightly downward for the terrain
    camera.lookAt(0, 0, camera.position.z + 75);

    // Update store with camera info
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    setDirection([dir.x, dir.y, dir.z]);
    setPosition([camera.position.x, camera.position.y, camera.position.z]);

    camera.updateMatrixWorld();
  });

  return null;
}
