import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { arabicFontFamily } from "../fonts";
import { COLORS } from "../theme";

type Props = {
  readonly text: string;
  readonly startFrame: number;
  readonly fontSize?: number;
  readonly color?: string;
  readonly xPercent?: number;
  readonly yPercent?: number;
  readonly blurPx?: number;
};

// A big Arabic HTML headline (the giant "؟", a price figure, …) with the
// brief's "quick spring pop when a figure appears". Whole-text scale-in via
// inline-block, never per-letter; Noto Sans Arabic 900 for headlines.
export const HeadlineText: React.FC<Props> = ({
  text,
  startFrame,
  fontSize = 220,
  color = COLORS.gold,
  xPercent = 50,
  yPercent = 46,
  blurPx = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = Math.max(0, frame - startFrame);
  const pop = spring({
    frame: localFrame,
    fps,
    config: { damping: 11, mass: 0.55, stiffness: 140 },
  });

  const opacity = frame < startFrame ? 0 : 1;

  return (
    <div
      dir="rtl"
      lang="ar"
      style={{
        position: "absolute",
        left: `${xPercent}%`,
        top: `${yPercent}%`,
        transform: "translate(-50%, -50%)",
        opacity,
        filter: blurPx > 0 ? `blur(${blurPx}px)` : undefined,
      }}
    >
      <span
        style={{
          display: "inline-block",
          scale: pop,
          fontFamily: arabicFontFamily,
          fontWeight: 900,
          fontSize,
          color,
          textAlign: "center",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </span>
    </div>
  );
};
