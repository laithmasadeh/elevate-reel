import { useThree } from "@react-three/fiber";
import React, { useLayoutEffect } from "react";
import { PMREMGenerator } from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// Metal (the gold card edge/stripe, metalness ~0.85) has almost no diffuse
// albedo — without an environment to reflect, it renders nearly black
// outside of small specular highlights. This bakes a small procedural
// "room" into a PMREM and sets it as `scene.environment`, giving every
// metal material in the canvas something to reflect. Fully local/
// deterministic (three.js ships RoomEnvironment + PMREMGenerator, no
// network fetch, no drei), and it's a one-time asset bake on mount — not
// an animation, so it doesn't run afoul of the "no useFrame()" rule any
// more than the starter's own one-time OffscreenCanvas setup in Phone.tsx.
//
// Must be useLayoutEffect, not useEffect: @remotion/three's own capture
// mechanism (ManualFrameRenderer in ThreeCanvas.js) calls the single
// `advance()` that Remotion actually captures from inside a *passive*
// useEffect, and it's mounted as an earlier sibling of these children. If
// this ran as a passive effect too, React could fire that advance() first,
// capturing the frame before scene.environment was ever set. All layout
// effects in a tree run before any passive effect, so useLayoutEffect here
// guarantees the environment exists before that capture.
export const StudioEnvironment: React.FC = () => {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);

  useLayoutEffect(() => {
    const pmremGenerator = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const renderTarget = pmremGenerator.fromScene(room, 0.04);
    scene.environment = renderTarget.texture;

    return () => {
      scene.environment = null;
      renderTarget.texture.dispose();
      pmremGenerator.dispose();
    };
  }, [gl, scene]);

  return null;
};
