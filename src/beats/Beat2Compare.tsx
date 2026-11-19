import React from "react";
import {
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BeatStage } from "../three/BeatStage";
import { MembershipCard } from "../three/MembershipCard";
import { getPushInCamera, PushInConfig } from "../three/camera";
import { projectToScreen } from "../three/project";
import { HeadlineText } from "../components/HeadlineText";
import { CARD } from "../theme";

const COLS = 3;
const ROWS = 3;
const CARD_SCALE = 0.34;
const GAP_X = CARD.width * CARD_SCALE * 1.35;
const GAP_Y = CARD.height * CARD_SCALE * 1.55;

const PHASE_A_RATIO = 0.45;

const PHASE_B_PUSH: PushInConfig = { startZ: 3.6, endZ: 3.1, fovDeg: 40 };
const FRONT_CARD = { x: 0, y: -0.02, z: 0.55 };
const BACK_LEFT_CARD = { x: -0.95, y: 0.22, z: -0.55 };
const BACK_RIGHT_CARD = { x: 0.95, y: 0.22, z: -0.55 };

// Beat 2, phase A: the same nine-card shelf from beat 1, but the cards
// recolor into three kinds (goldBlend 0 / 0.5 / 1 by i % 3) across this
// phase's own duration.
const PhaseA: React.FC<{ readonly durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const cards = Array.from({ length: COLS * ROWS }, (_, i) => i);
  const targets = [0, 0.5, 1];

  return (
    <BeatStage
      durationInFrames={durationInFrames}
      push={{ startZ: 4.1, endZ: 3.9, fovDeg: 42 }}
    >
      {cards.map((i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const x = (col - 1) * GAP_X;
        const y = (1 - row) * GAP_Y;
        const target = targets[i % 3];
        const goldBlend = interpolate(
          frame,
          [0, durationInFrames * 0.8],
          [0, target],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );

        return (
          <group key={i} position={[x, y, 0]} scale={CARD_SCALE}>
            <MembershipCard goldBlend={goldBlend} />
          </group>
        );
      })}
    </BeatStage>
  );
};

// Beat 2, phase B: one sharp card in front of two blurred ones, each
// blurred card carrying a big gold "؟". Two separate <ThreeCanvas> layers
// sharing the identical push-in camera (see src/three/camera.ts) — the
// back layer is wrapped in plain CSS blur, no WebGL postprocessing (see
// plan notes: @react-three/postprocessing's EffectComposer relies on
// useFrame(), forbidden by 3d.md; @remotion/effects' HtmlInCanvas depends
// on an experimental Chrome flag that previews differently in Studio than
// in a render, so it's unsuitable for the one shot that structurally needs
// it to look right everywhere).
const PhaseB: React.FC<{ readonly durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const camera = getPushInCamera(frame, durationInFrames, PHASE_B_PUSH);

  const leftLabel = projectToScreen(BACK_LEFT_CARD, camera, { width, height });
  const rightLabel = projectToScreen(BACK_RIGHT_CARD, camera, {
    width,
    height,
  });

  return (
    <>
      {/* Back layer: the two blurred cards, CSS-blurred canvas */}
      <BeatStage
        durationInFrames={durationInFrames}
        push={PHASE_B_PUSH}
        canvasStyle={{ filter: "blur(11px)" }}
      >
        <group position={[BACK_LEFT_CARD.x, BACK_LEFT_CARD.y, BACK_LEFT_CARD.z]} scale={0.46}>
          <MembershipCard brightness={0.7} />
        </group>
        <group
          position={[BACK_RIGHT_CARD.x, BACK_RIGHT_CARD.y, BACK_RIGHT_CARD.z]}
          scale={0.46}
        >
          <MembershipCard brightness={0.7} />
        </group>
      </BeatStage>

      {/* Front layer: the one sharp card, transparent canvas, no backdrop
          (the back layer already painted it) */}
      <BeatStage
        durationInFrames={durationInFrames}
        push={PHASE_B_PUSH}
        showBackdrop={false}
        overlay={
          <>
            <HeadlineText
              text="؟"
              startFrame={6}
              fontSize={110}
              xPercent={leftLabel.xPercent}
              yPercent={leftLabel.yPercent - 9}
              blurPx={4}
            />
            <HeadlineText
              text="؟"
              startFrame={10}
              fontSize={110}
              xPercent={rightLabel.xPercent}
              yPercent={rightLabel.yPercent - 9}
              blurPx={4}
            />
          </>
        }
      >
        <group position={[FRONT_CARD.x, FRONT_CARD.y, FRONT_CARD.z]} scale={0.48}>
          <MembershipCard />
        </group>
      </BeatStage>
    </>
  );
};

export const Beat2Compare: React.FC<{ readonly durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const cutFrame = Math.round(durationInFrames * PHASE_A_RATIO);

  return (
    <>
      <Sequence durationInFrames={cutFrame} layout="none">
        <PhaseA durationInFrames={cutFrame} />
      </Sequence>
      <Sequence
        from={cutFrame}
        durationInFrames={durationInFrames - cutFrame}
        layout="none"
      >
        <PhaseB durationInFrames={durationInFrames - cutFrame} />
      </Sequence>
    </>
  );
};
