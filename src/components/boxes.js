
import React, {PureComponent} from "react";
import {Box} from "./box";
import {boxHeight, boxWidth} from './box-values';
import {BoxEditor} from './box-editor';

import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import "rxjs/add/observable/merge";
import "rxjs/add/operator/do";
import "rxjs/add/operator/map";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/switchMap";
import "rxjs/add/operator/takeUntil";

import "./boxes.css";

const boxCount = 10;

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
            this.observeMouseEvents(),
            this.observeTouchEvents()
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
            .filter(({found}) => found !== -1 && !this.state.editMode)
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

    observeTouchEvents() {
        this.touchStartObservable = new Subject();
        this.touchMoveObservable = new Subject();
        this.touchEndObservable = new Subject();
        this.touchCancelObservable = new Subject();

        const touchFinishedStream = Observable.merge(this.touchEndObservable, this.touchCancelObservable);

        const touchStream = this.touchStartObservable
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
                return this.touchMoveObservable
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
                    .takeUntil(touchFinishedStream);
            });

        return touchStream.subscribe();
    }

    onTouchStart = (evt) => {
        evt.preventDefault();
        this.touchStartObservable.next(this.getTouchEventData(evt));
    };

    onTouchMove = (evt) => {
        evt.preventDefault();
        this.touchMoveObservable.next(this.getTouchEventData(evt));
    };

    onTouchEnd = (evt) => {
        evt.preventDefault();
        this.touchEndObservable.next(this.getTouchEventData(evt));
    };

    onTouchCancel = (evt) => {
        evt.preventDefault();
        this.touchCancelObservable.next(this.getTouchEventData(evt));
    };

    getTouchEventData = (evt) => {
        const {changedTouches, target} = evt;
        const {clientX, clientY} = changedTouches[0];
        const {left, top} = this.divRef.getBoundingClientRect();
        const {left: targetLeft, top: targetTop} = target.getBoundingClientRect();
        const x = clientX - left;
        const y = clientY - top;
        const offsetX = clientX - targetLeft;
        const offsetY = clientY - targetTop;
        return {x, y, offsetX, offsetY};
    };

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

    onDoubleClick = (evt) => {
        const {x, y} = this.getMouseEventData(evt);
        const found = this.findBox(x, y);
        if(found !== -1) {
            this.setState(() => ({
                selectedBoxIndex: found,
                editMode: true
            }));
        }
    };

    cancelEditMode = () => {
        this.setState(() => ({
            editMode: false
        }));
    };

    render() {
        const {
            state,
            setDivRef: ref,
            onBoxModified,
            cancelEditMode,
            onMouseDown,
            onMouseMove,
            onMouseUp,
            onTouchStart,
            onTouchMove,
            onTouchEnd,
            onTouchCancel,
            onDoubleClick
        } = this;
        const {boxes, selectedBoxIndex, editMode} = state;
        const divProps = {
            className: "boxes",
            ref,
            onMouseDown,
            onMouseMove,
            onMouseUp,
            onTouchStart,
            onTouchMove,
            onTouchEnd,
            onTouchCancel,
            onDoubleClick
        };
        const boxEditorProps = {
            box: editMode ? boxes[selectedBoxIndex] : undefined,
            onBoxModified,
            cancelEditMode
        };
        return (
            <div {...divProps}>
                <BoxEditor {...boxEditorProps} />
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
