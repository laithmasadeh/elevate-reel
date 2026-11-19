import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Captions } from "./components/Captions";
import { StudioBackdrop } from "./components/StudioBackdrop";
import { Beat1Shelf } from "./beats/Beat1Shelf";
import { Beat2Compare } from "./beats/Beat2Compare";
import { Beat3Fan } from "./beats/Beat3Fan";
import { Beat4Question } from "./beats/Beat4Question";
import { Beat5Hero } from "./beats/Beat5Hero";
import { Beat6Drop } from "./beats/Beat6Drop";
import { EndCard } from "./EndCard";
import { beatFrameRange, endCardFrameRange, getLineById } from "./helpers/timings";

// A short crossfade only at the one hand-off where it can't desync a
// caption: the last content beat into the end card. Every beat-to-beat cut
// inside the reel is a hard cut via plain <Sequence>, because timings.json
// drives exact voiceover-aligned caption windows and any overlap there
// would eat into that timing. Padding the end card's own sequence by
// FADE_FRAMES keeps the composition's total duration exactly matching
// timings.json (content end + endCard.duration) — see transitions.md's
// "Duration calculation" note that a transition shortens the total by its
// own length unless compensated.
const FADE_FRAMES = 6;

export const Reel: React.FC = () => {
  const { fps } = useVideoConfig();

  const beat1 = beatFrameRange(1, fps);
  const beat2 = beatFrameRange(2, fps);
  const beat3 = beatFrameRange(3, fps);
  const beat4 = beatFrameRange(4, fps);
  const beat6 = beatFrameRange(6, fps);
  const endCard = endCardFrameRange(fps);

  // Beat 5 is three independent hero shots (l6/l7/l8), each its own hard
  // cut, each entering from a different side with its own figure.
  const l6 = getLineById("l6");
  const l7 = getLineById("l7");
  const l8 = getLineById("l8");
  const toFrames = (line: typeof l6) => ({
    from: Math.round(line.start * fps),
    durationInFrames: Math.round((line.end - line.start) * fps),
  });
  const l6Frames = toFrames(l6);
  const l7Frames = toFrames(l7);
  const l8Frames = toFrames(l8);

  const contentDurationInFrames = beat6.from + beat6.durationInFrames;

  // The 8 visual shots in order. Captions (in <Captions/>) use the exact
  // line start/end from timings.json, including the small silence gaps
  // between lines — but the 3D shot behind them should never go blank
  // during those gaps, so each shot's *visual* Sequence is stretched to
  // touch the next one: it starts where the previous shot's caption cue
  // begins and runs until the next shot's caption cue begins (the last
  // shot runs to the end of all content). This keeps every beat's own
  // choreography (pop-ins, lifts, drops) timed off its nominal cue while
  // making the camera/backdrop contiguous.
  const nominalStarts = [
    beat1.from,
    beat2.from,
    beat3.from,
    beat4.from,
    l6Frames.from,
    l7Frames.from,
    l8Frames.from,
    beat6.from,
  ];
  const shotFrom = nominalStarts.map((_, i) => (i === 0 ? 0 : nominalStarts[i]));
  const shotDuration = shotFrom.map((from, i) =>
    i < shotFrom.length - 1
      ? nominalStarts[i + 1] - from
      : contentDurationInFrames - from,
  );

  return (
    <AbsoluteFill>
      <StudioBackdrop />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={contentDurationInFrames}>
          <Sequence from={shotFrom[0]} durationInFrames={shotDuration[0]}>
            <Beat1Shelf durationInFrames={shotDuration[0]} />
          </Sequence>
          <Sequence from={shotFrom[1]} durationInFrames={shotDuration[1]}>
            <Beat2Compare durationInFrames={shotDuration[1]} />
          </Sequence>
          <Sequence from={shotFrom[2]} durationInFrames={shotDuration[2]}>
            <Beat3Fan durationInFrames={shotDuration[2]} lines={beat3.lines} />
          </Sequence>
          <Sequence from={shotFrom[3]} durationInFrames={shotDuration[3]}>
            <Beat4Question durationInFrames={shotDuration[3]} />
          </Sequence>
          <Sequence from={shotFrom[4]} durationInFrames={shotDuration[4]}>
            <Beat5Hero
              durationInFrames={shotDuration[4]}
              side="left"
              figureText="١ شهر"
            />
          </Sequence>
          <Sequence from={shotFrom[5]} durationInFrames={shotDuration[5]}>
            <Beat5Hero
              durationInFrames={shotDuration[5]}
              side="right"
              figureText="٣ أيام"
            />
          </Sequence>
          <Sequence from={shotFrom[6]} durationInFrames={shotDuration[6]}>
            <Beat5Hero
              durationInFrames={shotDuration[6]}
              side="bottom"
              figureText="٣٠٪ خصم"
            />
          </Sequence>
          <Sequence from={shotFrom[7]} durationInFrames={shotDuration[7]}>
            <Beat6Drop durationInFrames={shotDuration[7]} />
          </Sequence>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: FADE_FRAMES })}
        />
        <TransitionSeries.Sequence
          durationInFrames={endCard.durationInFrames + FADE_FRAMES}
        >
          <EndCard />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Captions />
    </AbsoluteFill>
  );
};
