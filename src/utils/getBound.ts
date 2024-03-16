import { JoystickShape } from "@/types";

type GetShapeBoundParams = {
  shape: JoystickShape;
  absoluteX: number;
  absoluteY: number;
  relativeX: number;
  relativeY: number;
  distance: number;
  radius: number;
  baseSize: number;
  parentRect: DOMRect;
};

export const getShapeBounds = ({
  shape,
  absoluteX,
  absoluteY,
  relativeX,
  relativeY,
  distance,
  radius,
  baseSize,
  parentRect,
}: GetShapeBoundParams) => {
  switch (shape) {
    case "square":
      relativeX = getWithinBounds(
        absoluteX - parentRect.left - baseSize / 2,
        baseSize
      );
      relativeY = getWithinBounds(
        absoluteY - parentRect.top - baseSize / 2,
        baseSize
      );
      return { relativeX, relativeY };
    case "axisX":
      relativeX = getWithinBounds(
        absoluteX - parentRect.left - baseSize / 2,
        baseSize
      );
      relativeY = 0;
      return { relativeX, relativeY };

    case "axisY":
      relativeX = 0;
      relativeY = getWithinBounds(
        absoluteY - parentRect.top - baseSize / 2,
        baseSize
      );
      return { relativeX, relativeY };
    default:
      if (distance > radius) {
        relativeX *= radius / distance;
        relativeY *= radius / distance;
      }
      return { relativeX, relativeY };
  }
};

export const getWithinBounds = (value: number, baseSize: number): number => {
  const halfBaseSize = baseSize / 2;
  if (value > halfBaseSize) {
    return halfBaseSize;
  }
  if (value < -halfBaseSize) {
    return halfBaseSize * -1;
  }
  return value;
};
