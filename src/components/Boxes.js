import React, {
  useRef,
  useEffect,
  useReducer,
  useCallback,
  useMemo
} from "react";
import { Box } from "./Box";
import { BoxEditor } from "./BoxEditor";
import { usePointerEvents } from "../hooks/usePointerEvents";
import {
  createBoxesAction,
  initialState,
  reducer,
  setBoxEditModeAction,
  selectBoxAtPointAction,
  moveBoxAction,
  updateSelectedBoxAction
} from "../hooks/boxesState";

import "./Boxes.css";

export function Boxes() {
  const [{ boxes, selectedIndex, editMode }, dispatch] = useReducer(
    reducer,
    initialState
  );

  const containerRef = useRef(null);

  useEffect(() => {
    const count = 10;
    const { width, height } = containerRef.current.getBoundingClientRect();
    dispatch(createBoxesAction({ width, height, count }));
  }, []);

  const editItem = useCallback(({ x, y }) => {
    dispatch(selectBoxAtPointAction({ x, y }));
    dispatch(setBoxEditModeAction({ editMode: true }));
  }, []);
  const findItem = useCallback(({ x, y }) => {
    dispatch(selectBoxAtPointAction({ x, y }));
    return true;
  }, []);
  const dragItem = useCallback(({ x, y, offsetX, offsetY }) => {
    dispatch(moveBoxAction({ x, y, offsetX, offsetY }));
  }, []);
  const dragComplete = useCallback(() => {}, []);
  const callbackApi = useMemo(
    () => ({
      editItem,
      findItem,
      dragItem,
      dragComplete
    }),
    [editItem, findItem, dragItem, dragComplete]
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
      dispatch(updateSelectedBoxAction({ box }));
    },
    cancelEditMode: () => {
      dispatch(setBoxEditModeAction({ editMode: false }));
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
