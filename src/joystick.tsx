import * as React from "react";
import type {
  JoyStickProps,
  JoystickDirection,
  JoystickUpdateEvent,
  JoystickCoordinates,
} from "@/types";
import { INTERACTION_EVENTS, RADIAN_QUADRANT_BINDING } from "@/constants";
import { getShapeBounds } from "@/utils/getBound";

const JoyStick = React.forwardRef<
  React.ElementRef<"div">,
  React.HTMLAttributes<HTMLDivElement> & JoyStickProps
>(
  (
    {
      size = 100,
      followCursor,
      controlPlaneShape = "circle",
      baseShape = "circle",
      minDistance,
      throttle = 500, // ms
      baseColor,
      baseImage,
      sticky,
      stickColor,
      stickImage,
      stickSize = 50,
      stickShape = "circle",
      pos,
      disabled,
      move,
      start,
      stop,
      ...props
    },
    _ref
  ) => {
    // state
    let _pointerId: number | null = null;
    let _parentRect: DOMRect | null = null;
    let _frameId: number | null = null;
    let _dragging = false;
    const baseRef = React.useRef<HTMLDivElement | null>(null);
    const stickRef = React.useRef<HTMLButtonElement | null>(null);
    const [coordinates, setCoordinates] = React.useState<JoystickCoordinates>();

    const radius = size / 2;

    const throttleMoveCallBack = (() => {
      let lastCall = 0;

      return (e: JoystickUpdateEvent) => {
        const now = new Date().getTime();
        const throttleAmount = throttle;
        if (now - lastCall < throttleAmount) {
          return;
        }
        lastCall = now;
        if (move) {
          return move(e);
        }
      };
    })();

    /**
     * Update position of joystick - set state and trigger DOM manipulation
     * @param coordinates
     */
    const updatePos = (coordinates: JoystickCoordinates) => {
      _frameId = window.requestAnimationFrame(() => {
        setCoordinates(coordinates);
      });

      if (minDistance !== undefined && coordinates.distance < minDistance)
        return;

      throttleMoveCallBack({
        type: "move",
        x: (coordinates.relativeX * 2) / size,
        y: -((coordinates.relativeY * 2) / size),
        direction: coordinates.direction,
        distance: coordinates.distance,
      });
    };

    /**
     * Use ArcTan2 (4 Quadrant inverse tangent) to identify the direction the joystick is pointing
     * https://docs.oracle.com/cd/B12037_01/olap.101/b10339/x_arcsin003.htm
     * @param atan2: number
     */
    const getDirection = (atan2: number): JoystickDirection => {
      if (
        atan2 > RADIAN_QUADRANT_BINDING.TopRight ||
        atan2 < RADIAN_QUADRANT_BINDING.TopLeft
      ) {
        return "FORWARD";
      } else if (
        atan2 < RADIAN_QUADRANT_BINDING.TopRight &&
        atan2 > RADIAN_QUADRANT_BINDING.BottomRight
      ) {
        return "RIGHT";
      } else if (atan2 < RADIAN_QUADRANT_BINDING.BottomLeft) {
        return "LEFT";
      }
      return "BACKWARD";
    };

    /**
     * Hypotenuse distance calculation
     * @param x: number
     * @param y: number
     * @private
     */
    const getDistance = (x: number, y: number): number => {
      return Math.hypot(x, y);
    };
    const getDistanceToPercentile = (distance: number): number => {
      const percentageBaseSize = (distance / (size / 2)) * 100;
      if (percentageBaseSize > 100) {
        return 100;
      }
      return percentageBaseSize;
    };

    /**
     * Calculate X/Y and ArcTan within the bounds of the joystick
     * @param event
     */
    const pointerMove = (e: PointerEvent) => {
      e.preventDefault();
      if (
        !_parentRect ||
        (_dragging && !followCursor && e.pointerId !== _pointerId)
      )
        return;

      const absoluteY = e.clientY;
      const absoluteX = e.clientX;
      let relativeX = absoluteX - _parentRect.left - radius;
      let relativeY = absoluteY - _parentRect.top - radius;
      const distance = getDistance(relativeX, relativeY);
      const bounded = getShapeBounds({
        shape: controlPlaneShape || baseShape,
        absoluteX,
        absoluteY,
        relativeX,
        relativeY,
        distance,
        radius,
        baseSize: size,
        parentRect: _parentRect,
      });

      relativeX = bounded.relativeX;
      relativeY = bounded.relativeY;

      const atan2 = Math.atan2(relativeX, relativeY);

      updatePos({
        relativeX,
        relativeY,
        distance: getDistanceToPercentile(distance),
        direction: getDirection(atan2),
        axisX: absoluteX - _parentRect.left,
        axisY: absoluteY - _parentRect.top,
      });
    };

    /**
     * Handle pointer up and de-register listen events
     * @private
     */
    const pointerUp = (e: PointerEvent) => {
      if (e.pointerId !== _pointerId) return;

      _frameId = window.requestAnimationFrame(() => {
        _dragging = false;
        if (!sticky) {
          setCoordinates(undefined);
        }
      });

      window.removeEventListener(INTERACTION_EVENTS.PointerUp, pointerUp);
      window.removeEventListener(INTERACTION_EVENTS.PointerMove, pointerMove);

      _pointerId = null;
      if (stop) {
        stop({
          type: "stop",
          x: sticky
            ? coordinates
              ? (coordinates.relativeX * 2) / size
              : null
            : null,
          y: sticky
            ? coordinates
              ? (coordinates.relativeY * 2) / size
              : null
            : null,
          direction: sticky
            ? coordinates
              ? coordinates.direction
              : null
            : null,
          distance: sticky ? (coordinates ? coordinates.distance : null) : null,
        });
      }
    };

    /**
     * Handle pointerdown event
     * @param e PointerEvent
     * @private
     */
    const pointerDown = (e: React.PointerEvent) => {
      if (disabled || followCursor || !baseRef.current || !stickRef.current)
        return;

      // TODO: use ref instead not variable
      _parentRect = baseRef.current.getBoundingClientRect();
      _dragging = true;

      window.addEventListener(INTERACTION_EVENTS.PointerUp, pointerUp);
      window.addEventListener(INTERACTION_EVENTS.PointerMove, pointerMove);
      _pointerId = e.pointerId;
      stickRef.current.setPointerCapture(e.pointerId);

      if (start) {
        start({
          type: "start",
          x: null,
          y: null,
          distance: null,
          direction: null,
        });
      }
    };

    const getBaseStyle: () => React.CSSProperties = () => {
      const baseStyle: React.CSSProperties = {
        // TODO: remove border radius (just for test)
        borderRadius: size,

        height: `${size}px`,
        width: `${size}px`,
        background: baseColor ?? "#000033",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      };

      if (baseImage) {
        baseStyle.background = `url(${baseImage})`;
        baseStyle.backgroundSize = "100%";
      }

      return baseStyle;
    };

    const getStickStyle = (): React.CSSProperties => {
      const _stickSize = stickSize ? `${stickSize}px` : `${size / 1.5}px`;
      const stickStyle: React.CSSProperties = {
        // TODO: remove border radius (just for test)
        borderRadius: size,

        background: stickColor ?? "#3D59AB",
        cursor: "move",
        height: _stickSize,
        width: _stickSize,
        flexShrink: 0,
        touchAction: "none",
      };

      if (stickImage) {
        stickStyle.background = `url(${stickImage})`;
        stickStyle.backgroundSize = "100%";
      }

      if (pos) {
        stickStyle.position = "absolute";
        stickStyle.transform = `translate3d(${(pos.x * size) / 2}px, ${
          -(pos.y * size) / 2
        }px, 0)`;
      }

      if (coordinates) {
        stickStyle.position = "absolute";
        stickStyle.transform = `translate3d(${coordinates.relativeX}px, ${coordinates.relativeY}px, 0)`;
      }

      return stickStyle;
    };

    React.useEffect(() => {
      if (!followCursor || !baseRef.current) return;

      _parentRect = baseRef.current?.getBoundingClientRect();
      _dragging = true;

      window.addEventListener(INTERACTION_EVENTS.PointerMove, (event) =>
        pointerMove(event)
      );

      if (start) {
        start({
          type: "start",
          x: null,
          y: null,
          distance: null,
          direction: null,
        });
      }

      // clean up
      return () => {
        if (followCursor) {
          window.removeEventListener(INTERACTION_EVENTS.PointerMove, (event) =>
            pointerMove(event)
          );
        }

        if (_frameId) {
          window.cancelAnimationFrame(_frameId);
        }
      };
    }, []);

    return (
      <div ref={baseRef} data-part="base" style={getBaseStyle()} {...props}>
        <button
          data-part="stick"
          ref={stickRef}
          disabled={disabled}
          onPointerDown={pointerDown}
          style={getStickStyle()}
        />
      </div>
    );
  }
);

JoyStick.displayName = "JoyStick";

export { JoyStick };
