import React, { useCallback, useEffect } from "react";
import { useSketchContext } from "../../context/sketchContext";

export const SKETCHPAD_WIDTH = 960;

export default ({ aspect }: { aspect: number }) => {
  const { canvasRef } = useSketchContext();

  let isDragging = false;
  let lastPosition: { x: number | null; y: number | null } = {
    x: null,
    y: null,
  };

  const getDraw = (context: CanvasRenderingContext2D) => {
    return (x: number, y: number) => {
      if (!isDragging) {
        return;
      }

      const scale =
        context.canvas.getBoundingClientRect().width / SKETCHPAD_WIDTH;

      context.lineCap = "round";
      context.lineWidth = 3;
      context.strokeStyle = "black";

      if (lastPosition.x === null || lastPosition.y === null) {
        context.moveTo(x / scale, y / scale);
      } else {
        context.moveTo(lastPosition.x, lastPosition.y);
      }
      context.lineTo(x / scale, y / scale);
      context.stroke();

      lastPosition.x = x / scale;
      lastPosition.y = y / scale;
    };
  };

  const getDragStart = (context: CanvasRenderingContext2D) => {
    return (event: MouseEvent | TouchEvent) => {
      if (!context) {
        return;
      }

      context.beginPath();
      isDragging = true;
    };
  };

  const getDragEnd = (context: CanvasRenderingContext2D) => {
    return (event: MouseEvent | TouchEvent) => {
      if (!context) {
        return;
      }

      context.closePath();
      isDragging = false;

      // 座標リセット
      lastPosition.x = null;
      lastPosition.y = null;
    };
  };

  const init = (canvas: HTMLCanvasElement) => {
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    reset(context);

    const draw = getDraw(context);

    canvas.addEventListener("mousedown", getDragStart(context));
    canvas.addEventListener("mouseup", getDragEnd(context));
    canvas.addEventListener("mouseout", getDragEnd(context));
    canvas.addEventListener("mousemove", (e) => {
      draw(e.layerX, e.layerY);
    });

    // SP用
    canvas.addEventListener("touchstart", getDragStart(context));
    canvas.addEventListener("touchcancel", getDragEnd(context));
    canvas.addEventListener("touchend", getDragEnd(context));
    canvas.addEventListener("touchmove", (e) => {
      // 描きづらいのでスワイプさせない
      e.preventDefault();

      let x = e.touches[0].clientX - canvas.getBoundingClientRect().left;
      let y = e.touches[0].clientY - canvas.getBoundingClientRect().top;

      draw(x, y);
    });
  };

  const reset = (context: CanvasRenderingContext2D) => {
    // Initialize (fill by white)
    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, SKETCHPAD_WIDTH, SKETCHPAD_WIDTH * aspect);
  };

  const initialization = setInterval(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    clearInterval(initialization);
    init(canvas);
  }, 500);

  return (
    <canvas
      ref={canvasRef}
      width={SKETCHPAD_WIDTH}
      height={SKETCHPAD_WIDTH * aspect}
    />
  );
};
