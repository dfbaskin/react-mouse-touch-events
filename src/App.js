import React, { PureComponent } from 'react';
import {Boxes} from './components/boxes';
import './App.css';

export class App extends PureComponent {
    render() {
        return (
            <div className="App">
                <div>
                    <h2>React Mouse/Touch Events Demo</h2>
                </div>
                <div>
                    <Boxes></Boxes>
                </div>
            </div>
        );
    }
}
