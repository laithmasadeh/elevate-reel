import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { StudioBackdrop } from "../components/StudioBackdrop";
import { getPushInCamera, PushInConfig } from "./camera";
import { CameraRig } from "./CameraRig";
import { SceneLights } from "./SceneLights";
import { StudioEnvironment } from "./StudioEnvironment";

type Props = {
  readonly durationInFrames: number;
  readonly push: PushInConfig;
  readonly children: React.ReactNode;
  readonly overlay?: React.ReactNode;
  // Set on the back layer of a dual-canvas shot (beat 2) so its canvas is
  // transparent and blurred by the parent via plain CSS — no WebGL
  // postprocessing, see src/beats/Beat2Compare.tsx.
  readonly canvasStyle?: React.CSSProperties;
  readonly showBackdrop?: boolean;
};

// Shared rig for every beat: dark-teal CSS backdrop, one <ThreeCanvas> with
// the common lighting + a slow push-in camera driven by useCurrentFrame(),
// and an optional sibling HTML overlay for Arabic headline/figure text.
export const BeatStage: React.FC<Props> = ({
  durationInFrames,
  push,
  children,
  overlay,
  canvasStyle,
  showBackdrop = true,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const camera = getPushInCamera(frame, durationInFrames, push);

  return (
    <AbsoluteFill>
      {showBackdrop ? <StudioBackdrop /> : null}
      <div style={{ position: "absolute", inset: 0, ...canvasStyle }}>
        <ThreeCanvas linear width={width} height={height}>
          <CameraRig z={camera.z} fovDeg={camera.fovDeg} />
          <StudioEnvironment />
          <SceneLights />
          {children}
        </ThreeCanvas>
      </div>
      {overlay ? <AbsoluteFill>{overlay}</AbsoluteFill> : null}
    </AbsoluteFill>
  );
};
