
import React, {PureComponent} from "react";
import "./boxes.css";

const boxCount = 10;

export class Box extends PureComponent {
    render() {
        const {box} = this.props;
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
    }
}

export class Boxes extends PureComponent {

    constructor() {
        super();
        this.state = {
            boxes: new Array(boxCount).fill().map((v, idx) => ({
                id: `box-${idx+1}`,
                top: Math.random(),
                left: Math.random(),
                text: `Box ${Math.random()}`
            }))
        };
    }

    render() {
        const {boxes} = this.state;
        return (
            <div className="boxes">
                {boxes.map((box) => (
                    <Box key={box.id} box={box} />
                ))}
            </div>
        )
    }
}
