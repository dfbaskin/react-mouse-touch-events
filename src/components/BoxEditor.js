import React, { useState, useRef, useEffect } from "react";
import { boxHeight, boxWidth } from "../hooks/boxesState";

const nonActiveBox = {
  top: 0,
  left: -9999,
  width: boxWidth,
  height: boxHeight
};

export function BoxEditor({ box, onBoxModified, cancelEditMode }) {
  const [text, setText] = useState("");
  const inputRef = useRef(null);
  useEffect(() => {
    if (box) {
      inputRef.current.focus();
      setText(box.text);
      setTimeout(() => {
        inputRef.current.select();
      });
    }
  }, [box]);

  const { top, left, width, height } = box || nonActiveBox;
  const boxProps = {
    className: "box active editor",
    style: { top, left, width, height }
  };
  const inputProps = {
    type: "text",
    value: text,
    onChange: evt => setText(evt.target.value),
    onKeyDown: evt => {
      if (box) {
        if (evt.key === "Enter") {
          evt.preventDefault();
          onBoxModified({ ...box, text });
          cancelEditMode();
        } else if (evt.key === "Escape") {
          evt.preventDefault();
          cancelEditMode();
        }
      }
    },
    onBlur: () => {
      if (box) {
        onBoxModified({ ...box, text });
        cancelEditMode();
      }
    },
    ref: inputRef
  };
  return (
    <div {...boxProps}>
      <input {...inputProps} />
    </div>
  );
}
