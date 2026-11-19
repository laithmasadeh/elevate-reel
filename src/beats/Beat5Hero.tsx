import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BeatStage } from "../three/BeatStage";
import { MembershipCard } from "../three/MembershipCard";
import { PriceTag } from "../components/PriceTag";

export type HeroSide = "left" | "right" | "bottom";

const START_OFFSET: Record<HeroSide, [number, number]> = {
  left: [-2.7, 0],
  right: [2.7, 0],
  bottom: [0, -2.1],
};

// Beat 5, one of three independent hero shots (lines l6/l7/l8): a single
// card enters from its own side and settles centered, then a price-tag
// badge with the big Arabic figure pops in on top — no count-up, the
// figure just appears at full value with the brief's "quick spring pop".
export const Beat5Hero: React.FC<{
  readonly durationInFrames: number;
  readonly side: HeroSide;
  readonly figureText: string;
}> = ({ durationInFrames, side, figureText }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const [startX, startY] = START_OFFSET[side];
  const entrance = spring({
    frame,
    fps,
    config: { damping: 15, mass: 0.85, stiffness: 95 },
  });
  const x = interpolate(entrance, [0, 1], [startX, 0]);
  const y = interpolate(entrance, [0, 1], [startY, 0]);
  const spin = interpolate(entrance, [0, 1], [side === "right" ? 0.6 : -0.6, 0]);

  const badgeStart = 22;

  return (
    <BeatStage
      durationInFrames={durationInFrames}
      push={{ startZ: 2.9, endZ: 2.5, fovDeg: 36 }}
      overlay={
        <PriceTag text={figureText} startFrame={badgeStart} yPercent={37} />
      }
    >
      <group position={[x, y, 0]} rotation={[0, spin, 0]} scale={0.62}>
        <MembershipCard />
      </group>
    </BeatStage>
  );
};
