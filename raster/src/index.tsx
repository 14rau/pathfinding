import React from 'react';
import ReactDOM from 'react-dom';
import GLC from './lib/WebGL/GLCommander';
import './index.css';

import * as serviceWorker from './serviceWorker';
import WebGL from './lib/WebGL';

// sideeffect




ReactDOM.render(<WebGL data={[[1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,1],[1,0,1,1,1,1,0,1,1,1],[1,0,1,0,0,0,0,0,0,1],[1,0,1,1,0,1,1,1,0,1],[1,0,0,1,0,1,0,0,0,1],[1,0,3,1,0,1,0,1,1,1],[1,1,1,1,0,1,0,0,0,1],[1,4,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1]]}/>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
