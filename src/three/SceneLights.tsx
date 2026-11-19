import React from "react";
import { COLORS } from "../theme";

// The one lighting rig used in every beat's <ThreeCanvas>: a cool, dim
// ambient fill (keeps the teal studio from going pure black), a soft cream
// key light from the front-top, and a gold rim light from behind that
// matches the studio's #E3B45C accent. Static per-frame on purpose — only
// the camera and the cards themselves animate via useCurrentFrame(), per
// the 3d.md rule against anything not driven by the frame.
export const SceneLights: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.55} color={COLORS.tealLight} />
      <directionalLight
        position={[1.4, 2.2, 2.6]}
        intensity={1.5}
        color={COLORS.cream}
      />
      <pointLight
        position={[-1.8, 0.6, -1.6]}
        intensity={2.2}
        distance={6}
        decay={1.6}
        color={COLORS.gold}
      />
      <pointLight
        position={[1.6, -0.8, 1.2]}
        intensity={0.35}
        distance={5}
        decay={2}
        color={COLORS.tealLight}
      />
    </>
  );
};
