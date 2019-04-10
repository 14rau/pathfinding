import * as React from "react";
import { Spinner } from "@blueprintjs/core";


/*
/*
div.fadeMe {
  opacity:    0.5; 
  background: #000; 
  width:      100%;
  height:     100%; 
  z-index:    10;
  top:        0; 
  left:       0; 
  position:   fixed; 
}
*/

export class Loading extends React.Component {
    public render() {
        return <div style={{
            opacity: 0.5,
            background: "#000",
            width: "100%",
            height: "100%",
            zIndex: 10,
            top: 0,
            left: 0,
            position: "fixed"
        }}>
            <Spinner intent="primary" size={Spinner.SIZE_LARGE}/>
        </div>
    }
}