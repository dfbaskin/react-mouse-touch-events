
import React, {PureComponent} from "react";
import {Box} from "./box";
import {boxHeight, boxWidth} from './box-values';
import {BoxEditor} from './box-editor';
import Pointable from 'react-pointable';

import {Subject} from "rxjs/Subject";
import "rxjs/add/observable/merge";
import "rxjs/add/operator/do";
import "rxjs/add/operator/map";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/switchMap";
import "rxjs/add/operator/takeUntil";

import "./boxes.css";

const boxCount = 10;
const DOUBLE_TAP_DELAY = 300;

export class Boxes extends PureComponent {

    constructor() {
        super();
        this.state = {
            boxes: [],
            selectedBoxIndex: -1,
            editMode: false
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
            this.observePointerEvents()
        ];
    }

    componentWillUnmount() {
        this.subscriptions.forEach(unsubscribe => unsubscribe());
    }

    observePointerEvents() {
        this.pointerDownObservable = new Subject();
        this.pointerMoveObservable = new Subject();
        this.pointerUpObservable = new Subject();

        const pointerStream = this.pointerDownObservable
            .map(({x, y, offsetX, offsetY}) => ({
                x, y,
                offsetX, offsetY,
                found: this.findBox(x, y)
            }))
            .filter(({found}) => found !== -1 && !this.state.editMode)
            .do(({found}) => {
                this.setState(() => ({
                    selectedBoxIndex: found
                }));
            })
            .switchMap(({offsetX, offsetY}) => {
                return this.pointerMoveObservable
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
                    .takeUntil(this.pointerUpObservable);
            });

        return pointerStream.subscribe();
    }

    onPointerDown = (() => {
        let lastTime = Date.now();
        return (evt) => {

            const evtData = this.getPointerEventData(evt);

            const thisTime = Date.now();
            const elapsedTime = thisTime - lastTime;
            lastTime = thisTime;

            if(elapsedTime > DOUBLE_TAP_DELAY) {
                this.divRef.setPointerCapture(evt.pointerId);
                this.pointerDownObservable.next(evtData);
            } else {
                const {x, y} = evtData;
                const found = this.findBox(x, y);
                if(found !== -1) {
                    this.setState(() => ({
                        selectedBoxIndex: found,
                        editMode: true
                    }));
                }
            }
        };
    })();


    onPointerMove = (evt) => {
        this.pointerMoveObservable.next(this.getPointerEventData(evt));
    };

    onPointerUp = (evt) => {
        this.pointerUpObservable.next(this.getPointerEventData(evt));
    };

    onPointerCancel = (evt) => {
        this.divRef.releasePointerCapture(evt.pointerId);
    };

    getPointerEventData(evt) {
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

    onBoxModified = (updatedBox) => {
        this.setState(({boxes, selectedBoxIndex}) => ({
            boxes: boxes.map((box, idx) => {
                return idx === selectedBoxIndex ? updatedBox : box;
            })
        }));
    };

    cancelEditMode = () => {
        this.setState(() => ({
            editMode: false
        }));
    };

    setDivRef = (divRef) => {
        this.divRef = divRef;
    };

    render() {
        const {
            state,
            setDivRef: elementRef,
            onBoxModified,
            cancelEditMode,
            onPointerDown,
            onPointerMove,
            onPointerUp,
            onPointerCancel
        } = this;
        const {boxes, selectedBoxIndex, editMode} = state;
        const divProps = {
            className: "boxes",
            touchAction: "none",
            elementRef,
            onPointerDown,
            onPointerMove,
            onPointerUp,
            onPointerCancel
        };
        const boxEditorProps = {
            box: editMode ? boxes[selectedBoxIndex] : undefined,
            onBoxModified,
            cancelEditMode
        };
        return (
            <Pointable {...divProps}>
                <BoxEditor {...boxEditorProps} />
                {boxes.map((box, idx) => {
                    const boxProps = {
                        key: box.id,
                        box,
                        isActive: idx === selectedBoxIndex
                    };
                    return <Box {...boxProps} />
                })}
            </Pointable>
        );
    }
}
