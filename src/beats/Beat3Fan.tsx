import React, { useMemo } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BeatStage } from "../three/BeatStage";
import { MembershipCard } from "../three/MembershipCard";
import { splitClausesWeighted, BeatLine } from "../helpers/timings";

const CARD_X = [-0.8, 0, 0.8];
const CARD_ROT_Y = [0.42, 0, -0.42];
const NEUTRAL_SCALE = 0.5;
const ACTIVE_BOOST = 0.05;
const DIM_DROP = 0.14;
// Kept small on purpose: moving a card toward the camera compounds with
// the scale boost above (perspective growth is nonlinear with depth), so
// a value much past this makes the active card balloon past the frame
// edges instead of just reading as "lifted".
const ACTIVE_Z = 0.1;

const weightWindow = (
  frame: number,
  start: number,
  end: number,
  ramp: number,
): number =>
  interpolate(frame, [start - ramp, start, end, end + ramp], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

// Beats 3 (lines l3 + l4, combined into one continuous shot). Three cards
// fan in (staggered pop, during the second half of l3), then as each of
// l4's three ".."-separated clauses is spoken, that card lifts forward and
// brightens while the other two dim — clause windows are derived from l4's
// own [start,end] + character-weighted clause lengths (splitClausesWeighted),
// never hardcoded.
export const Beat3Fan: React.FC<{
  readonly durationInFrames: number;
  readonly lines: readonly BeatLine[];
}> = ({ durationInFrames, lines }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Both l3 and l4 contain "..", so picking "the line with .." isn't
  // enough to tell them apart — l4 is the one split into the three
  // customer-type clauses, i.e. the one with the *most* ".." occurrences.
  const dotDotCount = (text: string) => (text.match(/\.\./g) ?? []).length;
  const clauseLine = lines.reduce((a, b) =>
    dotDotCount(b.text) > dotDotCount(a.text) ? b : a,
  );
  const setupLine = lines.find((l) => l.id !== clauseLine.id) ?? clauseLine;

  // Fall back defensively if timings.json ever changes shape — fan in at
  // the very start rather than crash.
  const fanWindowStart = setupLine
    ? setupLine.localFromFrame +
      (setupLine.localToFrame - setupLine.localFromFrame) * 0.5
    : 0;

  const clauseWindows = useMemo(() => {
    if (!clauseLine) return [];
    // splitClausesWeighted is unit-agnostic: feed it local frame numbers in
    // place of seconds and get clause windows back already in local frames.
    return splitClausesWeighted(
      clauseLine.text,
      clauseLine.localFromFrame,
      clauseLine.localToFrame,
    );
  }, [clauseLine]);

  return (
    <BeatStage
      durationInFrames={durationInFrames}
      push={{ startZ: 5.0, endZ: 4.4, fovDeg: 40 }}
    >
      {CARD_X.map((x, i) => {
        const entranceStart = fanWindowStart + i * 6;
        const localFrame = Math.max(0, frame - entranceStart);
        const fanPop = spring({
          frame: localFrame,
          fps,
          config: { damping: 12, mass: 0.6, stiffness: 120 },
        });

        const win = clauseWindows[i];
        const ownWeight = win
          ? weightWindow(frame, win.start, win.end, 10)
          : 0;
        const otherWeight = clauseWindows.length
          ? Math.max(
              ...clauseWindows
                .filter((_, j) => j !== i)
                .map((w) => weightWindow(frame, w.start, w.end, 10)),
            )
          : 0;

        const scale =
          NEUTRAL_SCALE * fanPop +
          ACTIVE_BOOST * ownWeight * fanPop -
          DIM_DROP * otherWeight * fanPop;
        const z = ACTIVE_Z * ownWeight;
        const brightness = Math.max(
          0.25,
          1 + 0.4 * ownWeight - 0.55 * otherWeight,
        );
        const rotY = CARD_ROT_Y[i] + ownWeight * -CARD_ROT_Y[i] * 0.6;

        // Never appear before its own fan-in cue.
        if (frame < entranceStart - 2 && fanPop < 0.02) {
          return null;
        }

        // The outer two cards sit close to the frame edge at rest; pulling
        // the active one in toward center as it grows keeps it from
        // clipping off-screen instead of just reading as "lifted".
        const liftedX = x * (1 - 0.48 * ownWeight);

        return (
          <group key={i} position={[liftedX, -0.05, z]} rotation={[0, rotY, 0]}>
            <group scale={Math.max(0.0001, scale)}>
              <MembershipCard brightness={brightness} />
            </group>
          </group>
        );
      })}
    </BeatStage>
  );
};
