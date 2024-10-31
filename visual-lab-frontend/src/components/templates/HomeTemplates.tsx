import { useEffect, useMemo, useState } from "react";
import SketchPad, { SKETCHPAD_WIDTH } from "../features/Sketchpad";
import { useWindowSize } from "../../hooks/useWindowSize";
import React from "react";
import StyleSelector from "../features/StyleSelector";

const SketchPadWithMemo = React.memo(SketchPad);

export default function HomeTemplate() {
  const { windowWidth, windowHeight } = useWindowSize();

  // 画面サイズが縦長or横が800px未満の場合はレイアウトをverticalに、それ以外はhorizontalにする
  const [layout, setLayout] = useState(
    windowWidth < windowHeight || windowWidth < 960 ? "vertical" : "horizontal"
  );
  const [aspect, setAspect] = useState("16_9");

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const aspectRatio = (() => {
    if (aspect === "16_9") {
      return 9 / 16;
    } else if (aspect === "4_3") {
      return 3 / 4;
    }
    return 0;
  })();

  useEffect(() => {
    if (windowWidth < windowHeight || windowWidth < SKETCHPAD_WIDTH) {
      setLayout("vertical");
    } else {
      setLayout("horizontal");
    }

    if (layout === "vertical") {
      setWidth(windowWidth);
      setHeight(() => {
        if (aspect === "16_9") {
          return windowWidth * (9 / 16);
        } else if (aspect === "4_3") {
          return windowWidth * (3 / 4);
        }
        return 0;
      });
    } else {
      setWidth(SKETCHPAD_WIDTH);
      setHeight(() => {
        if (aspect === "16_9") {
          return 540;
        } else if (aspect === "4_3") {
          return 720;
        }
        return 0;
      });
    }
  }, [windowWidth, windowHeight]);

  const scale = useMemo(() => Math.min(1, width / SKETCHPAD_WIDTH), [width]);

  return (
    <div>
      <div
        style={{
          scale: scale.toString(),
          margin: `0 0 ${-1 * SKETCHPAD_WIDTH * aspectRatio * (1 - scale)}px`,
          transformOrigin: "left top",
        }}
      >
        <SketchPadWithMemo aspect={aspectRatio} />
      </div>

      <StyleSelector handleSelectStyle={() => {}} />

      <button value="" onClick={() => {}}>
        Generate Visual
      </button>
    </div>
  );
}
