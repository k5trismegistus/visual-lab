import { useEffect, useMemo, useState } from "react";
import SketchPad, { SKETCHPAD_WIDTH } from "../features/Sketchpad";
import { useWindowSize } from "../../hooks/useWindowSize";
import React from "react";
import StyleSelector from "../features/StyleSelector";
import { useSketchContext } from "../../context/sketchContext";
const SketchPadWithMemo = React.memo(SketchPad, (prevProps, nextProps) => {
  return prevProps.aspect === nextProps.aspect;
});

export default function HomeTemplate() {
  const { windowWidth, windowHeight } = useWindowSize();
  const [layout, setLayout] = useState(
    windowWidth < windowHeight || windowWidth < 960 ? "vertical" : "horizontal"
  );

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const { aspect } = useSketchContext();

  const aspectRatio = useMemo(() => {
    if (aspect === "16_9") {
      return 9 / 16;
    } else if (aspect === "4_3") {
      return 3 / 4;
    }
    return 0;
  }, [aspect]);

  useEffect(() => {
    if (windowWidth < windowHeight || windowWidth < SKETCHPAD_WIDTH) {
      setLayout("vertical");
    } else {
      setLayout("horizontal");
    }

    if (layout === "vertical") {
      setWidth(windowWidth);
      setHeight(windowWidth * aspectRatio);
    } else {
      setWidth(SKETCHPAD_WIDTH);
      setHeight(SKETCHPAD_WIDTH * aspectRatio);
    }
  }, [windowWidth, windowHeight, aspectRatio, layout]);

  const scale = useMemo(() => Math.min(1, width / SKETCHPAD_WIDTH), [width]);

  return (
    <div className="relative">
      <div className="flex max-w-full flex-wrap">
        <div
          style={{
            scale: scale.toString(),
            margin: `0 0 ${-1 * SKETCHPAD_WIDTH * aspectRatio * (1 - scale)}px`,
            transformOrigin: "left top",
          }}
        >
          <SketchPadWithMemo aspect={aspectRatio} />
        </div>

        <div style={{ maxWidth: SKETCHPAD_WIDTH }}>
          <StyleSelector />
        </div>
      </div>
    </div>
  );
}
