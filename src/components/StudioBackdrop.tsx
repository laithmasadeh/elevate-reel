import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS } from "../theme";

// The dark-teal studio cyclorama, sitting behind every beat's transparent
// <ThreeCanvas>. Pure CSS: a radial gradient (lighter teal pool where the
// gold rim light would naturally bloom) over the darker teal base, plus a
// couple of soft blurred "bokeh" discs for ambient depth — the subtle
// background depth-of-field feel the brief asks for, achieved without any
// WebGL postprocessing.
export const StudioBackdrop: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 65% at 50% 38%, ${COLORS.tealLight} 0%, ${COLORS.tealDark} 62%, #091f1e 100%)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "8%",
          left: "-12%",
          width: 420,
          height: 420,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.gold}33 0%, transparent 70%)`,
          filter: "blur(40px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "12%",
          right: "-10%",
          width: 360,
          height: 360,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.tealLight}66 0%, transparent 70%)`,
          filter: "blur(50px)",
        }}
      />
    </AbsoluteFill>
  );
};
