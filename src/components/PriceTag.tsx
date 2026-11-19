import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { arabicFontFamily } from "../fonts";
import { COLORS } from "../theme";

type Props = {
  readonly text: string;
  readonly startFrame: number;
  readonly xPercent?: number;
  readonly yPercent?: number;
};

// The "price tag" badge for beat 5's big figures (١ شهر / ٣ أيام / ٣٠٪ خصم).
// A cream ribbon-tag shape (clip-path pentagon + a punched "hole") holding
// the Arabic figure in Noto Sans Arabic 900. Pops in with a small
// overshoot-and-settle spring, like a tag swinging to rest.
export const PriceTag: React.FC<Props> = ({
  text,
  startFrame,
  xPercent = 50,
  yPercent = 40,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = Math.max(0, frame - startFrame);
  const pop = spring({
    frame: localFrame,
    fps,
    config: { damping: 9, mass: 0.6, stiffness: 120 },
  });
  const settleRotate = spring({
    frame: localFrame,
    fps,
    config: { damping: 12, mass: 0.7 },
  });

  const opacity = frame < startFrame ? 0 : 1;
  const rotateDeg = (1 - settleRotate) * -8;

  return (
    <div
      style={{
        position: "absolute",
        left: `${xPercent}%`,
        top: `${yPercent}%`,
        translate: "-50% -50%",
        scale: pop,
        rotate: `${rotateDeg}deg`,
        opacity,
      }}
    >
      <div
        style={{
          position: "relative",
          width: 360,
          height: 184,
          background: COLORS.cream,
          clipPath:
            "polygon(14% 0%, 100% 0%, 100% 100%, 14% 100%, 0% 50%)",
          boxShadow: `0 10px 30px rgba(0,0,0,0.35)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 34,
            top: "50%",
            translate: "0 -50%",
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: COLORS.tealDark,
          }}
        />
        <span
          dir="rtl"
          lang="ar"
          style={{
            display: "inline-block",
            marginInlineStart: 20,
            fontFamily: arabicFontFamily,
            fontWeight: 900,
            fontSize: 72,
            lineHeight: 1,
            color: COLORS.tealDark,
            whiteSpace: "nowrap",
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};
