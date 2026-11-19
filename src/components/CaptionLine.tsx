import React from "react";
import { Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { arabicFontFamily } from "../fonts";
import { SAFE_AREA } from "../theme";
import { lineFrameRange, splitWordsWeighted, TimingLine } from "../helpers/timings";
import { CaptionWord } from "./CaptionWord";

const LineContent: React.FC<{ readonly line: TimingLine }> = ({ line }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = splitWordsWeighted(line.text, 0, line.end - line.start);

  return (
    <div
      dir="rtl"
      lang="ar"
      style={{
        position: "absolute",
        left: SAFE_AREA.side,
        right: SAFE_AREA.side,
        bottom: SAFE_AREA.bottom,
        display: "flex",
        flexWrap: "wrap",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "baseline",
        columnGap: "0.4em",
        rowGap: "0.18em",
        fontFamily: arabicFontFamily,
        fontWeight: 700,
        fontSize: 58,
        lineHeight: 1.3,
        textAlign: "center",
        textWrap: "balance",
      }}
    >
      {words.map((w, i) => (
        <CaptionWord
          key={`${line.id}-${i}`}
          word={w.word}
          startFrame={w.start * fps}
          endFrame={w.end * fps}
          frame={frame}
        />
      ))}
    </div>
  );
};

export const CaptionLine: React.FC<{ readonly line: TimingLine }> = ({
  line,
}) => {
  const { fps } = useVideoConfig();
  const { from, durationInFrames } = lineFrameRange(line, fps);

  return (
    <Sequence from={from} durationInFrames={durationInFrames} layout="none">
      <LineContent line={line} />
    </Sequence>
  );
};
