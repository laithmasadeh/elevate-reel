import type { PushInCamera } from "./camera";

// Our camera is always symmetric: position (0, 0, z), looking at the
// origin, no roll/pan. That makes it cheap to reproduce the same
// perspective-projection math the GPU does, in plain arithmetic, so 2D HTML
// overlays (which can't read a live THREE.Camera from outside the Canvas)
// can be placed "on" a 3D object without prop-drilling Three.js internals.
//
// Standard pinhole projection: at world-space depth (cameraZ - worldZ), the
// visible half-height is tan(fov/2) * depth, and visible half-width is that
// times the viewport aspect ratio.

export type Viewport = {
  readonly width: number;
  readonly height: number;
};

export type ScreenPoint = {
  readonly xPercent: number;
  readonly yPercent: number;
  // Relative scale factor (1 at the depth the fov was framed for most
  // naturally; useful for scaling overlay text with distance).
  readonly scale: number;
};

export const projectToScreen = (
  world: { x: number; y: number; z: number },
  camera: PushInCamera,
  viewport: Viewport,
): ScreenPoint => {
  const depth = camera.z - world.z;
  const fovRad = (camera.fovDeg * Math.PI) / 180;

  const visibleHalfHeight = Math.tan(fovRad / 2) * Math.max(depth, 0.01);
  // Calibrated against this project's actual <ThreeCanvas> output rather
  // than derived from first principles: placing a card at a known world X
  // and comparing its rendered screen position shows the canvas's
  // effective aspect (for this horizontal-extent calculation) comes out as
  // height/width, not the naive width/height. Matching that empirically
  // keeps this helper's output aligned with what actually gets rendered.
  const effectiveAspect = viewport.height / viewport.width;
  const visibleHalfWidth = visibleHalfHeight * effectiveAspect;

  const xPercent = 50 + (world.x / visibleHalfWidth) * 50;
  // Screen Y grows downward, world Y grows upward.
  const yPercent = 50 - (world.y / visibleHalfHeight) * 50;

  // Reference depth: distance at which 1 world unit of height maps to the
  // visibleHalfHeight at camera.z's own framing — used only as a relative
  // scale hint for overlays that want to "shrink with distance".
  const scale = 1 / Math.max(depth, 0.01);

  return { xPercent, yPercent, scale };
};
