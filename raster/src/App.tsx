import React, { Component } from "react";
import { observer } from "mobx-react"
import { observable } from "mobx";
import './App.css';
import { Grid } from './components/Grid/Grid';
import { FieldType } from "./components/Tile/Tile";
import autobind from "autobind-decorator";


// -> This is the data we want to show
@observer
class App extends Component {

  // track the editor state -> in which mode are we? Set Goal, Walls, Start?
  @observable private sizeX = 10;
  @observable private sizeY = 10;
  @observable private editorState = FieldType.WALL;
  @observable private data = this.defaultTiles
  @observable private matrixInput = "";

  private options = [{
    label: "Wall",
    value: FieldType.WALL
  }, {
    label: "None",
    value: FieldType.NOTHING
  }, {
    label: "Goal",
    value: FieldType.GOAL
  }, {
    label: "Start",
    value: FieldType.START
  }, ]

  public get defaultTiles() {
    // default tiles using sizes X and Y -> returns empty map
    let ret = [];
    for(let x = 0; x < this.sizeX; x++) {
      let xRow = [];
      for(let y = 0; y < this.sizeY; y++) {
        xRow.push(0);
      }
      ret.push(xRow);
    }
    return ret;
  }

  render() {
    return (
      <>
          <h3>School Project: Pathfinding</h3>
          Edit Type: {this.editorState} <br/>
          <div style={{display: "flex", flexDirection: "row"}}>
            <div className="side">
                <div className="btn" style={{marginTop: "16px"}} onClick={() => console.log(JSON.stringify(this.data))}>show in console</div>
                <div className="btn" onClick={() => this.data = JSON.parse(this.matrixInput)}>load matrix</div>
                <select style={{width: "100%"}} onChange={e => this.editorState = parseInt(e.target.value)}>
                  {this.options.map(e => <option value={e.value}>{e.label}</option>)}
                </select>
              <div className="slidercontainer">
                Y:
                <input className="slider" type="range" min={0} max={20} value={this.sizeY} onChange={e => this.onChangeYAxis(parseInt(e.target.value))}/><br/>
              </div>
                <div className="slidercontainer">
                  X:
                  <input className="slider" type="range" min={0} max={20} value={this.sizeX} onChange={e => this.onChangeXAxis(parseInt(e.target.value))}/><br/>
                </div>
              <textarea value={this.matrixInput} onChange={e => this.matrixInput = e.target.value}/>
              </div>
            <div>
              <span className="detailBadge">Y: {this.sizeY} X: {this.sizeX} <br/></span>
              <div style={{display: "flex", flexDirection: "row"}}>
                <Grid data={this.data} type={this.editorState} onChange={this.onChangeData}/>
              </div>
            </div>
            <div>
              <ul>
                <li>Wall: <div style={{width: "10px", height: "10px", backgroundColor: "black"}}/></li>
                <li>Goal: <div style={{width: "10px", height: "10px", backgroundColor: "green"}}/></li>
                <li>Start: <div style={{width: "10px", height: "10px", backgroundColor: "yellow"}}/></li>
                <li>Agent: <div style={{width: "10px", height: "10px", backgroundColor: "tomato"}}/></li>
              </ul>
            </div>
          </div>
      </>
    );
  }

  @autobind
  private onChangeYAxis(value: number) {
    if(value <= 0) return;
    if(value < this.data.length) {
      this.data.splice(value, this.data.length - value);
    } else {
      this.data.push(
        this.getArrayWithLength(this.data[0].length) // we can use 0 here, because we will always have at least 1 element
      )
    }
    this.sizeY = value;
  }

  @autobind
  private onChangeXAxis(value: number) {
    if(value <= 0) return;
    if(value < this.data[0].length) {
      this.data.forEach(e => {
        e.splice(value, e.length - value);
      });
    } else {
      this.data.forEach(e => {
        e.push(0);
      });
    }
    this.sizeX = value;
  }

  @autobind
  private onChangeData(y: number, x: number, type: FieldType) {
    // there can only be one agent, one start and one goal
    if([FieldType.AGENT, FieldType.START, FieldType.GOAL].includes(type)) {
      this.resetField(type);
    }
    this.data[y][x] = type;
  }

  // Helper functions -> May add an Utils script?

  private getArrayWithLength(len: number) {
    let ret = [];
    for(let i = 0; i < len; i++) {
      ret.push(0);
    }
    return ret;
  }

  @autobind
  private resetField(type: FieldType) {
    this.data.forEach((e, y) => {
      e.forEach((p, x) => {
        if(p === type) this.data[y][x] = FieldType.NOTHING;
      });
    });
  }
}

export default App;
