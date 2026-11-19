import React from "react";
import {
  AbsoluteFill,
  CanvasImage,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { arabicFontFamily } from "./fonts";
import { COLORS } from "./theme";
import { StudioBackdrop } from "./components/StudioBackdrop";

// Beat 7: the 3s end card (plus a few frames of transition overlap padded
// on by Reel.tsx). Logo fades in, the handle slides in under it, a gold
// line draws, then everything holds. The brief's "public/logo" path
// doesn't exist in this project — substituting
// public/elevate-consulting-logo-reversed.png (white mark + wordmark,
// transparent background), which is the only asset meant for a dark
// background; see the other two PNGs in public/ for primary (light bg)
// and the pre-baked Instagram square lockup.
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoOpacity = interpolate(frame, [0, fps * 0.7], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const handleStart = fps * 0.55;
  const handleProgress = interpolate(
    frame,
    [handleStart, handleStart + fps * 0.5],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    },
  );
  const handleOpacity = handleProgress;
  const handleTranslateY = interpolate(handleProgress, [0, 1], [24, 0]);

  const lineStart = fps * 0.95;
  const lineProgress = interpolate(
    frame,
    [lineStart, lineStart + fps * 0.6],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.65, 0, 0.35, 1),
    },
  );

  return (
    <AbsoluteFill>
      <StudioBackdrop />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <CanvasImage
          src={staticFile("elevate-consulting-logo-reversed.png")}
          style={{ width: 560, height: "auto", opacity: logoOpacity }}
        />

        <div
          style={{
            marginTop: 34,
            opacity: handleOpacity,
            translate: `0 ${handleTranslateY}px`,
            fontFamily: arabicFontFamily,
            fontWeight: 700,
            fontSize: 42,
            letterSpacing: 1,
            color: COLORS.cream,
          }}
        >
          @consult.elevate
        </div>

        <div
          style={{
            marginTop: 20,
            width: 220,
            height: 3,
            background: COLORS.gold,
            scale: `${lineProgress} 1`,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
