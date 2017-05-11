
import React from "react";

export const Box = ({box}) => {
    const boxProps = {
        className: 'box',
        style: {
            top: `${box.top * 100}%`,
            left: `${box.left * 100}%`
        }
    };
    return (
        <div {...boxProps}>{box.text}</div>
    )
};
