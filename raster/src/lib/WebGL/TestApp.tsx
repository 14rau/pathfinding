import * as React from "react";
import init from "./init";


export default class App extends React.Component{

  public componentDidMount() {
    init("webgl");
  }

  public render() {
    return <canvas id="webgl" width="400" height="400" style={{border: "1px solid black"}}>
      
    </canvas>
  }
}