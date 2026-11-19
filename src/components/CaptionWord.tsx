import React from "react";
import { interpolate, interpolateColors } from "remotion";
import { COLORS } from "../theme";

type Props = {
  readonly word: string;
  // Frames, relative to the caption line's own Sequence (can be negative /
  // beyond the line's end for words at the very start/end — interpolate
  // clamps on both sides).
  readonly startFrame: number;
  readonly endFrame: number;
  readonly frame: number;
};

// Karaoke word: starts at 35%-opacity white, flashes gold while it's the
// spoken word, then settles to solid white — never staying gold
// permanently. Also pops in with a quick inline-block scale spring the
// moment it starts being spoken. Whole-word only, never per-letter, and no
// letterSpacing (both per arabic-text.md).
export const CaptionWord: React.FC<Props> = ({
  word,
  startFrame,
  endFrame,
  frame,
}) => {
  const durFrames = Math.max(0.5, endFrame - startFrame);
  const ramp = Math.max(0.4, Math.min(3, durFrames * 0.3));

  const k1 = startFrame - ramp;
  const k2 = startFrame;
  const k3 = Math.max(k2 + 0.1, endFrame - ramp);
  const k4 = Math.max(k3 + 0.1, endFrame);

  const color = interpolateColors(
    frame,
    [k1, k2, k3, k4],
    [COLORS.dimWhite, COLORS.gold, COLORS.gold, COLORS.white],
  );

  const scale = interpolate(frame, [k1, k2], [0.86, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <span
      style={{
        display: "inline-block",
        color,
        scale,
        transformOrigin: "50% 65%",
      }}
    >
      {word}
    </span>
  );
};
