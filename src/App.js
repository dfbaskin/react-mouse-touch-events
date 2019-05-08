import React, { useState, useCallback } from "react";
import { Boxes1 } from "./components/Boxes1";
import { Boxes2 } from "./components/Boxes2";
import "./App.css";

export function App() {
  const [hooksType, setHooksType] = useState(1);
  const onChange = useCallback(
    evt => {
      setHooksType(Number(evt.target.value));
    },
    [setHooksType]
  );
  const boxes = hooksType === 1 ? <Boxes1 /> : <Boxes2 />;

  return (
    <div className="App">
      <div>
        <h2>React Mouse/Touch Events Demo</h2>
        <p>
          Source:
          <a href="https://github.com/dfbaskin/react-mouse-touch-events">
            https://github.com/dfbaskin/react-mouse-touch-events
          </a>
        </p>
        <p onChange={onChange}>
          <label>
            <input type="radio" name="hooks-type" value={1} defaultChecked />{" "}
            Standard Hooks
          </label>
          <label>
            <input type="radio" name="hooks-type" value={2} /> useMethods
          </label>
        </p>
      </div>
      <div>{boxes}</div>
    </div>
  );
}
