
import React, {PureComponent} from "react";
import {Box} from "./box";
import {Subject} from "rxjs/Subject";
import "rxjs/add/operator/do";
import "rxjs/add/operator/map";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/switchMap";
import "rxjs/add/operator/takeUntil";

import "./boxes.css";

const boxCount = 10;
const boxWidth = 200;
const boxHeight = 70;

export class Boxes extends PureComponent {

    constructor() {
        super();
        this.state = {
            boxes: [],
            selectedBoxIndex: -1
        };
    }

    componentDidMount() {
        const {width, height} = this.divRef.getBoundingClientRect();
        this.setState(() => ({
            boxes: new Array(boxCount).fill().map((v, idx) => ({
                id: `box-${idx+1}`,
                top: Math.random() * (height - boxHeight),
                left: Math.random() * (width - boxWidth),
                width: boxWidth,
                height: boxHeight,
                text: `Box ${idx + 101}`
            })),
            selectedBoxIndex: 0
        }));
        this.subscriptions = [
            this.observeMouseEvents()
        ];
    }

    componentWillUnmount() {
        this.subscriptions.forEach(unsubscribe => unsubscribe());
    }

    setDivRef = (divRef) => {
        this.divRef = divRef;
    };

    observeMouseEvents() {
        this.mouseDownObservable = new Subject();
        this.mouseMoveObservable = new Subject();
        this.mouseUpObservable = new Subject();

        const mouseStream = this.mouseDownObservable
            .map(({x, y, offsetX, offsetY}) => ({
                x, y,
                offsetX, offsetY,
                found: this.findBox(x, y)
            }))
            .filter(({found}) => found !== -1)
            .do(({found}) => {
                this.setState(() => ({
                    selectedBoxIndex: found
                }));
            })
            .switchMap(({offsetX, offsetY}) => {
                return this.mouseMoveObservable
                    .do(({x, y}) => {
                        this.setState(({boxes, selectedBoxIndex}) => ({
                            boxes: boxes.map((box, idx) => {
                                return idx !== selectedBoxIndex ? box : {
                                    ...box,
                                    left: x - offsetX,
                                    top: y - offsetY
                                };
                            })
                        }));
                    })
                    .takeUntil(this.mouseUpObservable);
            });

        return mouseStream.subscribe();
    }

    onMouseDown = (evt) => {
        this.mouseDownObservable.next(this.getMouseEventData(evt));
    };

    onMouseMove = (evt) => {
        this.mouseMoveObservable.next(this.getMouseEventData(evt));
    };

    onMouseUp = (evt) => {
        this.mouseUpObservable.next(this.getMouseEventData(evt));
    };

    getMouseEventData(evt) {
        const {clientX, clientY, altKey, ctrlKey, shiftKey, target} = evt;
        const {left, top} = this.divRef.getBoundingClientRect();
        const {left: targetLeft, top: targetTop} = target.getBoundingClientRect();
        const x = clientX - left;
        const y = clientY - top;
        const offsetX = clientX - targetLeft;
        const offsetY = clientY - targetTop;
        return {x, y, offsetX, offsetY, altKey, ctrlKey, shiftKey};
    }

    findBox(x, y) {
        const {boxes, selectedBoxIndex} = this.state;
        const {found} = boxes.reduce((acc, box) => {
            const x1 = box.left;
            const x2 = box.left + box.width;
            const y1 = box.top;
            const y2 = box.top + box.height;
            if(!acc.final) {
                if(x >= x1 && x <= x2 && y >= y1 && y <= y2) {
                    acc.found = acc.idx;
                    if(acc.idx === selectedBoxIndex) {
                        acc.final = true;
                    }
                }
                acc.idx += 1;
            }
            return acc;
        }, {
            found: -1,
            final: false,
            idx: 0
        });
        return found;
    }

    render() {
        const {
            state,
            setDivRef: ref,
            onMouseDown,
            onMouseMove,
            onMouseUp
        } = this;
        const {boxes, selectedBoxIndex} = state;
        const divProps = {
            className: "boxes",
            ref,
            onMouseDown,
            onMouseMove,
            onMouseUp
        };
        return (
            <div {...divProps}>
                {boxes.map((box, idx) => {
                    const boxProps = {
                        key: box.id,
                        box,
                        isActive: idx === selectedBoxIndex
                    };
                    return <Box {...boxProps} />
                })}
            </div>
        )
    }
}
