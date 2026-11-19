import React from "react";
import { AbsoluteFill } from "remotion";
import { timings } from "../helpers/timings";
import { CaptionLine } from "./CaptionLine";

// One persistent HTML layer for the whole reel. Each line gets its own
// <Sequence> (inside CaptionLine) computed straight from timings.json, so
// editing that file re-times every caption without touching this component.
export const Captions: React.FC = () => {
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {timings.lines.map((line) => (
        <CaptionLine key={line.id} line={line} />
      ))}
    </AbsoluteFill>
  );
};
