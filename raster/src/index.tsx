import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

let args = document.location.search.split("?")[1].split("&");
console.log(args);
let propertys = args.map(e => {
    let prop = e.split("=");
    return {
        [prop[0]]: prop[1]
    }
});
console.log(propertys)

ReactDOM.render(<App/>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
