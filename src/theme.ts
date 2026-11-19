// Shared visual language for the reel. One style only: dark teal studio,
// soft gold rim light, cream gold-edged cards. Keep every beat pulling from
// these constants so nothing drifts into a second palette.

export const COLORS = {
  tealDark: "#0F3634",
  tealLight: "#175553",
  gold: "#E3B45C",
  goldSoft: "#F0CE8C",
  cream: "#FBF4E4",
  dimWhite: "rgba(255, 255, 255, 0.35)",
  white: "#FFFFFF",
} as const;

// Safe-area rules from the brief: nothing important in the top 84px, captions
// live 120px above the bottom with 40px side margins.
export const SAFE_AREA = {
  top: 84,
  bottom: 120,
  side: 40,
} as const;

// Card proportions in Three.js world units. A gym membership card, not a
// square — roughly ISO/IEC 7810 ID-1 proportions.
export const CARD = {
  width: 1.62,
  height: 1.02,
  // The gold edge IS this depth: the extruded side wall of the card gets
  // the gold material (see MembershipCard.tsx), so it needs to be chunky
  // enough to read on screen, not a realistic ID-card thinness.
  depth: 0.075,
  radius: 0.09,
  stripeHeight: 0.16,
  curveSegments: 8,
  // Small constant tilt applied to every card so the gold edge (and a
  // sense of depth) stays visible even in "face the camera" shots — a
  // perfectly orthogonal card would hide its own side wall.
  tiltX: -0.12,
  tiltY: 0.16,
} as const;
