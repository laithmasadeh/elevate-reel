import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BeatStage } from "../three/BeatStage";
import { MembershipCard } from "../three/MembershipCard";

const CARD_X = [-0.95, 0, 0.95];
const DROP_FROM_Y = 2.6;
const START_FRACTIONS = [0.06, 0.3, 0.54];

// Beat 6 (lines l9 + l10): the three archetype cards drop into place one
// by one, spread across the combined duration of both lines.
export const Beat6Drop: React.FC<{ readonly durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <BeatStage
      durationInFrames={durationInFrames}
      push={{ startZ: 3.5, endZ: 3.1, fovDeg: 40 }}
    >
      {CARD_X.map((x, i) => {
        const dropStart = durationInFrames * START_FRACTIONS[i];
        const localFrame = Math.max(0, frame - dropStart);
        const fall = spring({
          frame: localFrame,
          fps,
          config: { damping: 9, mass: 0.7, stiffness: 140 },
        });
        const y = interpolate(fall, [0, 1], [DROP_FROM_Y, 0]);
        const visible = frame >= dropStart - 1 ? 1 : 0;

        return (
          <group key={i} position={[x, y, 0]} scale={0.44 * visible}>
            <MembershipCard />
          </group>
        );
      })}
    </BeatStage>
  );
};
