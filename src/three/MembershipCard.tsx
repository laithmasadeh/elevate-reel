import React, { JSX, useMemo } from "react";
import { CARD, COLORS } from "../theme";
import { RoundedBox } from "../RoundedBox";

export type MembershipCardProps = {
  // Blend factor 0..1 from cream front face to full gold (the "middle card
  // turns gold" moment in beat 1). 0 = cream, 1 = solid gold.
  readonly goldBlend?: number;
  // Overall brightness/emissive multiplier, used to "dim" non-spoken cards
  // in beats 3/6 without changing hue.
  readonly brightness?: number;
} & Omit<JSX.IntrinsicElements["group"], "children">;

// A realistic gym-membership card. The gold edge is the card's own extruded
// side wall, not a second stacked plate: three.js's ExtrudeGeometry puts
// the front/back caps in material group 0 and the extruded side faces in
// material group 1 (verified in three's ExtrudeGeometry source — buildSide
// Faces() always calls addGroup(..., 1)), so the existing starter
// `RoundedBox`/`roundedRect()` helpers already support this by just handing
// it two materials via `attach="material-0"` / `attach="material-1"`. This
// reads as a true inlaid gold edge from any angle (fan/lift/tilt), unlike
// two stacked boxes which show a stepped "two-tier" side wall off-axis.
// A thin gold stripe near the top adds a card "detail" so it doesn't read
// as a flat colored UI box. No text is baked into any mesh — all Arabic
// figures are a separate HTML overlay.
export const MembershipCard: React.FC<MembershipCardProps> = ({
  goldBlend = 0,
  brightness = 1,
  ...groupProps
}) => {
  const creamColor = useMemo(() => {
    const cream = hexToRgb(COLORS.cream);
    const gold = hexToRgb(COLORS.goldSoft);
    return rgbToHex(lerpRgb(cream, gold, goldBlend));
  }, [goldBlend]);

  return (
    <group {...groupProps}>
      {/* Baked-in tilt so the gold edge (and a sense of depth) stays
          visible even when the parent beat points the card straight at the
          camera — layered under the parent's own transform/choreography. */}
      <group rotation={[CARD.tiltX, CARD.tiltY, 0]}>
      <RoundedBox
        width={CARD.width}
        height={CARD.height}
        radius={CARD.radius}
        depth={CARD.depth}
        curveSegments={CARD.curveSegments}
        position={[-CARD.width / 2, -CARD.height / 2, 0]}
      >
        {/* material-0: front + back caps (cream face) */}
        <meshPhysicalMaterial
          attach="material-0"
          color={creamColor}
          roughness={0.35}
          clearcoat={0.6}
          clearcoatRoughness={0.25}
          emissive={creamColor}
          emissiveIntensity={0.04 * brightness}
        />
        {/* material-1: extruded side wall = the gold edge, all the way around */}
        <meshStandardMaterial
          attach="material-1"
          color={COLORS.gold}
          metalness={0.85}
          roughness={0.3}
          emissive={COLORS.gold}
          emissiveIntensity={0.05 * brightness}
        />
      </RoundedBox>

      {/* Gold stripe near the top of the face — a card "detail" */}
      <mesh
        position={[0, CARD.height / 2 - CARD.stripeHeight * 1.1, CARD.depth + 0.001]}
      >
        <boxGeometry args={[CARD.width * 0.82, CARD.stripeHeight, 0.004]} />
        <meshStandardMaterial
          color={COLORS.gold}
          metalness={0.9}
          roughness={0.25}
        />
      </mesh>
      </group>
    </group>
  );
};

// --- tiny color helpers (no extra deps) ----------------------------------

type Rgb = readonly [number, number, number];

function hexToRgb(hex: string): Rgb {
  const clean = hex.replace("#", "");
  const n = parseInt(clean, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex([r, g, b]: Rgb): string {
  const toHex = (c: number) => {
    const hex = Math.round(Math.min(255, Math.max(0, c))).toString(16);
    return hex.length < 2 ? `0${hex}` : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function lerpRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}
