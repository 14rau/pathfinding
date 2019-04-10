import React from 'react';
import ReactDOM from 'react-dom';
import GLC from './lib/WebGL/GLCommander';
import './index.css';

import * as serviceWorker from './serviceWorker';
import { Provider } from 'mobx-react';
import { PageStore } from './lib/PageStore';
import "@blueprintjs/core/lib/css/blueprint.css"
import "@blueprintjs/icons/lib/css/blueprint-icons.css"
import App from './App';

// sideeffect




ReactDOM.render(
    <Provider pageStore={new PageStore()}>
        <div className="bp3-dark">
            <App/>
        </div>
    </Provider>
    , document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
