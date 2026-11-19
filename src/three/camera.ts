// Pure, frame-driven camera math shared by every beat's <ThreeCanvas>.
// No useFrame() anywhere — the camera position is a deterministic function
// of the current frame, applied via useEffect like the starter's Phone.tsx.

export type PushInCamera = {
  readonly z: number;
  readonly fovDeg: number;
};

export type PushInConfig = {
  readonly startZ: number;
  readonly endZ: number;
  readonly fovDeg?: number;
};

// A slow, continuous dolly-in across a beat's own local timeline (0 at the
// beat's first frame). Clamped so holding on the last frame doesn't
// overshoot if this is ever called outside the beat's range.
export const getPushInCamera = (
  localFrame: number,
  durationInFrames: number,
  { startZ, endZ, fovDeg = 45 }: PushInConfig,
): PushInCamera => {
  const t = Math.min(1, Math.max(0, localFrame / Math.max(1, durationInFrames)));
  // ease-out: fast-ish start, settles gently — ok to hardcode this curve,
  // it's a visual-feel constant, not a caption timing.
  const eased = 1 - (1 - t) * (1 - t);
  const z = startZ + (endZ - startZ) * eased;
  return { z, fovDeg };
};
