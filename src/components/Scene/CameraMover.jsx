"use client";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

export default function CameraMover({ speed = 0.02 }) {
  const ref = useRef();

  useFrame(({ camera }) => {
    // Move camera slowly forward
    camera.position.z += speed;

    // Keep the camera looking slightly downward for the terrain
    camera.lookAt(0, 0, camera.position.z + 75);

    camera.updateMatrixWorld();
  });

  return null;
}
