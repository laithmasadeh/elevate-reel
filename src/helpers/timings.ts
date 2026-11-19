import timingsData from "../timings.json";

// Everything here is derived from src/timings.json so the whole reel
// re-times itself when the real voiceover arrives — nothing below should
// ever receive a hardcoded second/frame value for caption-driven content.

export type TimingLine = {
  readonly id: string;
  readonly beat: number;
  readonly start: number;
  readonly end: number;
  readonly text: string;
};

export type TimingsFile = {
  readonly fps: number;
  readonly lines: readonly TimingLine[];
  readonly endCard: {
    readonly start: number;
    readonly duration: number;
  };
};

export const timings = timingsData as TimingsFile;

export const secondsToFrames = (seconds: number, fps: number): number =>
  Math.round(seconds * fps);

export const getLinesForBeat = (beat: number): TimingLine[] =>
  timings.lines.filter((line) => line.beat === beat);

export const getLineById = (id: string): TimingLine => {
  const line = timings.lines.find((l) => l.id === id);
  if (!line) {
    throw new Error(`No timing line with id "${id}" in timings.json`);
  }
  return line;
};

// Frame range (relative to the whole composition) for a timing line.
export const lineFrameRange = (
  line: TimingLine,
  fps: number,
): { from: number; durationInFrames: number } => {
  const from = secondsToFrames(line.start, fps);
  const to = secondsToFrames(line.end, fps);
  return { from, durationInFrames: Math.max(1, to - from) };
};

export const totalDurationInFrames = (fps: number): number => {
  const lastLine = timings.lines[timings.lines.length - 1];
  const contentEnd = Math.max(lastLine.end, timings.endCard.start);
  const totalSeconds = Math.max(
    contentEnd,
    timings.endCard.start + timings.endCard.duration,
  );
  return secondsToFrames(totalSeconds, fps);
};

export const endCardFrameRange = (
  fps: number,
): { from: number; durationInFrames: number } => ({
  from: secondsToFrames(timings.endCard.start, fps),
  durationInFrames: secondsToFrames(timings.endCard.duration, fps),
});

export type BeatLine = TimingLine & {
  // Frame offsets local to the beat's own Sequence (0 at the beat's first
  // frame), so beat components never need to re-derive seconds themselves.
  readonly localFromFrame: number;
  readonly localToFrame: number;
};

export type BeatRange = {
  readonly beat: number;
  readonly from: number;
  readonly durationInFrames: number;
  readonly lines: readonly BeatLine[];
};

// Groups timings.json's lines by `beat`, spanning the beat's own frame
// range from its first line's start to its last line's end — this is how a
// multi-caption beat (e.g. beat 3 = lines l3+l4) gets a single continuous
// <Sequence> while still giving each beat component the exact local frame
// windows of its own lines/clauses to choreograph against.
export const beatFrameRange = (beat: number, fps: number): BeatRange => {
  const lines = getLinesForBeat(beat);
  if (lines.length === 0) {
    throw new Error(`No timing lines for beat ${beat}`);
  }
  const from = Math.min(...lines.map((l) => secondsToFrames(l.start, fps)));
  const to = Math.max(...lines.map((l) => secondsToFrames(l.end, fps)));

  return {
    beat,
    from,
    durationInFrames: Math.max(1, to - from),
    lines: lines.map((line) => ({
      ...line,
      localFromFrame: secondsToFrames(line.start, fps) - from,
      localToFrame: secondsToFrames(line.end, fps) - from,
    })),
  };
};

// --- Word and clause splitting -------------------------------------------
//
// Arabic letters change shape depending on their neighbours, so we only ever
// split on whitespace (whole words), never per-letter. See
// .agents/skills/remotion-best-practices/remotion-markup/arabic-text.md

export type TimedWord = {
  readonly word: string;
  readonly start: number;
  readonly end: number;
};

// Harakat/diacritic marks (U+064B-U+065F, U+0670, U+06D6-U+06ED). Stripped
// before weighing a word so a short word with marks doesn't get an
// inflated speaking duration.
const DIACRITICS = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;

const wordWeight = (word: string): number =>
  Math.max(1, word.replace(DIACRITICS, "").length);

// Splits `text` into whole words and distributes [start, end] proportionally
// by each word's character weight (not equal slices), so longer words get a
// longer highlight window. Punctuation glued to a word (e.g. "<word>..")
// stays part of that word, matching how captions should read.
export const splitWordsWeighted = (
  text: string,
  start: number,
  end: number,
): TimedWord[] => {
  const words = text.split(/\s+/).filter(Boolean);
  const weights = words.map(wordWeight);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const duration = end - start;

  let cursor = start;
  return words.map((word, i) => {
    const wordStart = cursor;
    const wordDuration = (weights[i] / totalWeight) * duration;
    const wordEnd = wordStart + wordDuration;
    cursor = wordEnd;
    return { word, start: wordStart, end: wordEnd };
  });
};

export type TimedClause = {
  readonly text: string;
  readonly words: string[];
  readonly start: number;
  readonly end: number;
};

// Splits a line into clauses on ".." (the script's own pause marker) and
// distributes [start, end] proportionally by each clause's character count.
export const splitClausesWeighted = (
  text: string,
  start: number,
  end: number,
): TimedClause[] => {
  const clauses = text
    .split("..")
    .map((c) => c.trim())
    .filter(Boolean);
  const weights = clauses.map((c) => c.replace(DIACRITICS, "").length);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const duration = end - start;

  let cursor = start;
  return clauses.map((clauseText, i) => {
    const clauseStart = cursor;
    const clauseDuration = (weights[i] / totalWeight) * duration;
    const clauseEnd = clauseStart + clauseDuration;
    cursor = clauseEnd;
    return {
      text: clauseText,
      words: clauseText.split(/\s+/).filter(Boolean),
      start: clauseStart,
      end: clauseEnd,
    };
  });
};
