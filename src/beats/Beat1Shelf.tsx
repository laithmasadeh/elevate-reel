import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BeatStage } from "../three/BeatStage";
import { MembershipCard } from "../three/MembershipCard";
import { CARD } from "../theme";

const COLS = 3;
const ROWS = 3;
const CARD_SCALE = 0.34;
const GAP_X = CARD.width * CARD_SCALE * 1.35;
const GAP_Y = CARD.height * CARD_SCALE * 1.55;
const MIDDLE_INDEX = 4; // center of the 3x3 grid

// Beat 1: a shelf of nine identical gold-edged cards. They stagger-pop in
// during the first second, then ~1.5s into the beat the middle card turns
// gold. The 1.5s cue is a hardcoded visual-timing constant per the brief —
// only caption text timing comes from timings.json, not this kind of
// micro-animation beat.
export const Beat1Shelf: React.FC<{ readonly durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const goldCueFrame = Math.round(1.5 * fps);
  const goldRampFrames = Math.round(0.5 * fps);
  const goldBlend = interpolate(
    frame,
    [goldCueFrame, goldCueFrame + goldRampFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const cards = Array.from({ length: COLS * ROWS }, (_, i) => i);

  return (
    <BeatStage
      durationInFrames={durationInFrames}
      push={{ startZ: 4.1, endZ: 3.8, fovDeg: 42 }}
    >
      {cards.map((i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const x = (col - 1) * GAP_X;
        const y = (1 - row) * GAP_Y;

        // Stagger: top-left first, reading order, ~2 frames apart.
        const entranceStart = i * 2;
        const localFrame = Math.max(0, frame - entranceStart);
        const pop = spring({
          frame: localFrame,
          fps,
          config: { damping: 11, mass: 0.6, stiffness: 130 },
        });
        const visible = frame >= entranceStart ? 1 : 0;

        return (
          <group key={i} position={[x, y, 0]} scale={CARD_SCALE * pop}>
            <MembershipCard
              goldBlend={i === MIDDLE_INDEX ? goldBlend : 0}
              brightness={visible}
            />
          </group>
        );
      })}
    </BeatStage>
  );
};
