export type JoystickShape = "circle" | "square" | "axisY" | "axisX";

export type JoystickCoordinates = {
  relativeX: number;
  relativeY: number;
  axisX: number;
  axisY: number;
  direction: JoystickDirection;
  distance: number;
};

export type JoystickDirection = "FORWARD" | "RIGHT" | "LEFT" | "BACKWARD";

export type JoystickUpdateEvent = {
  type: "move" | "stop" | "start";
  x?: number | null;
  y?: number | null;
  direction: JoystickDirection | null;
  distance: number | null;
};

export type JoyStickProps = {
  size?: number;
  stickSize?: number;
  baseColor?: string;
  stickColor?: string;
  throttle?: number;
  disabled?: boolean;
  sticky?: boolean;
  move?: (event: JoystickUpdateEvent) => void;
  stop?: (event: JoystickUpdateEvent) => void;
  start?: (event: JoystickUpdateEvent) => void;
  stickImage?: string;
  baseImage?: string;
  followCursor?: boolean;
  baseShape?: JoystickShape;
  stickShape?: JoystickShape;
  controlPlaneShape?: JoystickShape;
  minDistance?: number;
  pos?: { x: number; y: number };
};
