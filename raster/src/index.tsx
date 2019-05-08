import React from 'react';
import ReactDOM from 'react-dom';
import GLC from './lib/WebGL/GLCommander';
import './index.css';

import * as serviceWorker from './serviceWorker';
import { Provider } from 'mobx-react';
import { PageStore } from './lib/PageStore';
import "@blueprintjs/core/lib/css/blueprint.css"
import "@blueprintjs/icons/lib/css/blueprint-icons.css"
import { ApiController } from './lib/Api/Api';
import { PageWrapper } from './PageWrapper';

// sideeffect
(window as any).apiHost = "localhost";
(window as any).api = new ApiController("8080", (window as any).apiHost, "http");


ReactDOM.render(
    <Provider pageStore={new PageStore()} apiController={new ApiController("8080", (window as any).apiHost, "http")}>
        <div className="bp3-dark">
            <PageWrapper/>
        </div>
    </Provider>
    , document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
