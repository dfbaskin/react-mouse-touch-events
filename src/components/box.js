import React from "react";

export const Box = ({ isActive, box: { top, left, width, height, text } }) => {
  const boxProps = {
    className: "box" + (isActive ? " active" : ""),
    style: {
      top,
      left,
      width,
      height
    }
  };
  return <div {...boxProps}>{text}</div>;
};
