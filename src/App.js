import React from "react";
import { Boxes } from "./components/boxes";
import "./App.css";

export function App() {
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
      </div>
      <div>
        <Boxes />>
      </div>
    </div>
  );
}
