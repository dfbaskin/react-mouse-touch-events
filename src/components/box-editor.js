import React, { PureComponent } from "react";
import { boxHeight, boxWidth } from "./box-values";

const nonActiveBox = {
  top: 0,
  left: -9999,
  width: boxWidth,
  height: boxHeight,
  text: ""
};

export class BoxEditor extends PureComponent {
  constructor() {
    super();
    this.state = {
      text: ""
    };
  }

  componentWillUpdate(nextProps) {
    if (nextProps.box && this.props.box !== nextProps.box) {
      this.inputRef.focus();
      this.setState(() => ({
        text: nextProps.box.text
      }));
      setTimeout(() => {
        this.inputRef.select();
      });
    }
  }

  setInputRef = inputRef => {
    this.inputRef = inputRef;
  };

  onChange = evt => {
    const text = evt.target.value;
    this.setState(() => ({ text }));
  };

  onKeyDown = evt => {
    const { box, onBoxModified } = this.props;
    if (evt.key === "Enter") {
      evt.preventDefault();
      onBoxModified({
        ...box,
        text: this.state.text
      });
      this.exitEditMode();
    } else if (evt.key === "Escape") {
      evt.preventDefault();
      this.exitEditMode();
    }
  };

  exitEditMode() {
    const { cancelEditMode } = this.props;
    this.setState(() => ({ text: "" }));
    cancelEditMode();
    this.inputRef.blur();
  }

  render() {
    const { props, onChange, onKeyDown, setInputRef } = this;
    const { box = nonActiveBox } = props;
    const { top, left, width, height } = box;
    const boxProps = {
      className: "box active editor",
      style: { top, left, width, height }
    };
    const inputProps = {
      type: "text",
      value: this.state.text,
      onChange,
      onKeyDown,
      ref: setInputRef
    };
    return (
      <div {...boxProps}>
        <input {...inputProps} />
      </div>
    );
  }
}
