export const INTERACTION_EVENTS = {
  PointerDown: "pointerdown",
  PointerMove: "pointermove",
  PointerUp: "pointerup",
} as const;

/**
 * Radians identifying the direction of the joystick
 */
export const RADIAN_QUADRANT_BINDING = {
  TopRight: 2.35619449,
  TopLeft: -2.35619449,
  BottomRight: 0.785398163,
  BottomLeft: -0.785398163,
} as const;
