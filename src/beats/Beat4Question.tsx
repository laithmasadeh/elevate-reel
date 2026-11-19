import React from "react";
import { BeatStage } from "../three/BeatStage";
import { MembershipCard } from "../three/MembershipCard";
import { HeadlineText } from "../components/HeadlineText";

// Beat 4 (line l5, "طب كيف؟"): a giant gold "؟" dominates the frame. The
// brief keeps "one realistic 3D object per beat" consistent even here, so
// a single card still sits in the 3D layer — small, dim and softly blurred
// behind the headline, for object continuity rather than as the subject.
export const Beat4Question: React.FC<{ readonly durationInFrames: number }> = ({
  durationInFrames,
}) => {
  return (
    <BeatStage
      durationInFrames={durationInFrames}
      push={{ startZ: 3.3, endZ: 2.9, fovDeg: 38 }}
      canvasStyle={{ filter: "blur(6px)" }}
      overlay={
        <HeadlineText text="؟" startFrame={4} fontSize={430} yPercent={44} />
      }
    >
      <group position={[0, -0.55, -0.3]} scale={0.3}>
        <MembershipCard brightness={0.45} />
      </group>
    </BeatStage>
  );
};
