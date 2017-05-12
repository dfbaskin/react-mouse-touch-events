import React, { PureComponent } from 'react';
import {Boxes} from './components/boxes';
import './App.css';

export class App extends PureComponent {
    render() {
        return (
            <div className="App">
                <div>
                    <h2>React Mouse/Touch Events Demo</h2>
                    <p>
                        Source:
                        <a href="https://github.com/dfbaskin/react-mouse-touch-events">https://github.com/dfbaskin/react-mouse-touch-events</a>
                    </p>
                </div>
                <div>
                    <Boxes></Boxes>
                </div>
            </div>
        );
    }
}
