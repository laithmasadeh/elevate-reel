import { useThree } from "@react-three/fiber";
import React, { useEffect } from "react";
import type { PushInCamera } from "./camera";

// Mirrors the starter's Phone.tsx idiom: set the camera's transform inside
// a useEffect (never useFrame), with every frame-derived value in the
// dependency array so it re-runs deterministically each render.
export const CameraRig: React.FC<PushInCamera> = ({ z, fovDeg }) => {
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    camera.position.set(0, 0, z);
    camera.lookAt(0, 0, 0);
    if ("fov" in camera) {
      camera.fov = fovDeg;
      camera.updateProjectionMatrix();
    }
  }, [camera, z, fovDeg]);

  return null;
};
