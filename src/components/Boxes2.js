import React, { useRef, useEffect } from "react";
import { Box } from "./Box";
import { BoxEditor } from "./BoxEditor";
import { usePointerEvents } from "../hooks/usePointerEvents";
import { boxesInitialState, boxesMethods } from "../hooks/boxesStateMethods";
import useMethods from "use-methods";

import "./Boxes.css";

export function Boxes2() {
  const [
    { boxes, selectedIndex, editMode },
    {
      createBoxes,
      selectBoxAtPoint,
      moveBox,
      setBoxEditMode,
      updateSelectedBox
    }
  ] = useMethods(boxesMethods, boxesInitialState);

  const containerRef = useRef(null);

  useEffect(() => {
    const count = 10;
    const { width, height } = containerRef.current.getBoundingClientRect();
    createBoxes({ width, height, count });
  }, [createBoxes]);

  const [, callbackApi] = useMethods(
    state => ({
      editItem({ x, y }) {
        selectBoxAtPoint({ x, y });
        setBoxEditMode(true);
      },
      findItem: selectBoxAtPoint,
      dragItem: moveBox,
      dragComplete() {}
    }),
    {}
  );

  const {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel
  } = usePointerEvents(containerRef, callbackApi);

  const divProps = {
    className: "boxes",
    ref: containerRef,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel
  };

  const boxEditorProps = {
    box: editMode ? boxes[selectedIndex] : undefined,
    onBoxModified: box => {
      updateSelectedBox(box);
    },
    cancelEditMode: () => {
      setBoxEditMode(false);
    }
  };

  return (
    <div {...divProps}>
      <BoxEditor {...boxEditorProps} />
      {boxes.map((box, idx) => (
        <Box key={box.id} box={box} isActive={idx === selectedIndex} />
      ))}
    </div>
  );
}
