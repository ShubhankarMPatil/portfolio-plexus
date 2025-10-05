import React from "react";

export default function Lighting() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={0.6} />
    </>
  );
}
