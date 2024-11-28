import React, { useEffect, useRef, useCallback } from "react";
import { useSketchContext } from "../../context/sketchContext";

export const SKETCHPAD_WIDTH = 960;

const SketchPad = ({ aspect }: { aspect: number }) => {
  const { canvasRef } = useSketchContext();
  const isDragging = useRef(false);
  const lastPosition = useRef<{ x: number | null; y: number | null }>({
    x: null,
    y: null,
  });

  const reset = useCallback(
    (context: CanvasRenderingContext2D) => {
      context.fillStyle = "#FFFFFF";
      context.fillRect(0, 0, SKETCHPAD_WIDTH, SKETCHPAD_WIDTH * aspect);
    },
    [aspect]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    reset(context);

    const draw = (x: number, y: number) => {
      if (!isDragging.current) return;

      const scale =
        context.canvas.getBoundingClientRect().width / SKETCHPAD_WIDTH;

      context.lineCap = "round";
      context.lineWidth = 3;
      context.strokeStyle = "black";

      if (lastPosition.current.x === null || lastPosition.current.y === null) {
        context.moveTo(x / scale, y / scale);
      } else {
        context.moveTo(lastPosition.current.x, lastPosition.current.y);
      }
      context.lineTo(x / scale, y / scale);
      context.stroke();

      lastPosition.current.x = x / scale;
      lastPosition.current.y = y / scale;
    };

    const dragStart = () => {
      context.beginPath();
      isDragging.current = true;
    };

    const dragEnd = () => {
      context.closePath();
      isDragging.current = false;
      lastPosition.current = { x: null, y: null };
    };

    canvas.addEventListener("mousedown", dragStart);
    canvas.addEventListener("mouseup", dragEnd);
    canvas.addEventListener("mouseout", dragEnd);
    canvas.addEventListener("mousemove", (e) => draw(e.layerX, e.layerY));
    canvas.addEventListener("touchstart", dragStart);
    canvas.addEventListener("touchend", dragEnd);
    canvas.addEventListener("touchcancel", dragEnd);
    canvas.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
        const x = e.touches[0].clientX - canvas.getBoundingClientRect().left;
        const y = e.touches[0].clientY - canvas.getBoundingClientRect().top;
        draw(x, y);
      },
      { passive: false }
    );

    return () => {
      canvas.removeEventListener("mousedown", dragStart);
      canvas.removeEventListener("mouseup", dragEnd);
      canvas.removeEventListener("mouseout", dragEnd);
      canvas.removeEventListener("mousemove", (e) => draw(e.layerX, e.layerY));
      canvas.removeEventListener("touchstart", dragStart);
      canvas.removeEventListener("touchend", dragEnd);
      canvas.removeEventListener("touchcancel", dragEnd);
      canvas.removeEventListener("touchmove", (e) => {
        e.preventDefault();
        const x = e.touches[0].clientX - canvas.getBoundingClientRect().left;
        const y = e.touches[0].clientY - canvas.getBoundingClientRect().top;
        draw(x, y);
      });
    };
  }, [canvasRef, reset]);

  return (
    <canvas
      ref={canvasRef}
      width={SKETCHPAD_WIDTH}
      height={SKETCHPAD_WIDTH * aspect}
    />
  );
};

export default React.memo(
  SketchPad,
  (prevProps, nextProps) => prevProps.aspect === nextProps.aspect
);
