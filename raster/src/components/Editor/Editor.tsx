import React, { Component } from "react";
import { observer, inject } from "mobx-react"
import { observable } from "mobx";
import autobind from "autobind-decorator";
import { FieldType } from "./Tile/Tile";
import { Utils } from "../../lib/Util";
import { Grid } from "./Grid/Grid";
import { Hints } from "./Hints/Hints";
import { PageStore } from "../../lib/PageStore";
import { Button } from "@blueprintjs/core";



// -> This is the data we want to show
interface IEditorProps {
  x?: number;
  y?: number;
  pageStore?: PageStore;
}

@inject("pageStore")
@observer
export class Editor extends Component<IEditorProps> {

  public static defaultProps = {
    x: 11,
    y: 11,
    pageStore: new PageStore()
  };

  // track the editor state -> in which mode are we? Set Goal, Walls, Start?
  @observable private editorState = FieldType.WALL;
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

  public render() {
    if(this.props.pageStore == null) {
        return <div>Page Store not injected</div>
    }
    return (
      <> 
          Edit Type: {this.editorState} <br/>
          <div style={{display: "flex", flexDirection: "row"}}>
            <div className="side">
                <div className="btn" style={{marginTop: "16px"}} onClick={() => console.log(JSON.stringify(this.props.pageStore.mapData))}>show in console</div>
                <Button text="load matrix" onClick={() => {
                    let mapData = JSON.parse(this.matrixInput)
                    mapData.forEach((y, yi) => {
                      y.forEach((x, xi) => {
                        this.onChangeData(yi, xi, x);
                      })
                    })
                  }}>
                    
                  </Button>
                <select style={{width: "100%"}} onChange={e => this.editorState = parseInt(e.target.value)}>
                  {this.options.map(e => <option value={e.value}>{e.label}</option>)}
                </select>
              <div className="slidercontainer">
                Y:
                <input className="slider" type="range" min={0} max={20} value={this.props.pageStore.sizeY} onChange={e => this.onChangeYAxis(parseInt(e.target.value))}/><br/>
              </div>
                <div className="slidercontainer">
                  X:
                  <input className="slider" type="range" min={0} max={20} value={this.props.pageStore.sizeX} onChange={e => this.onChangeXAxis(parseInt(e.target.value))}/><br/>
                </div>
              <textarea value={this.matrixInput} onChange={e => this.matrixInput = e.target.value}/>
              </div>
            <div>
              <span className="detailBadge">Y: {this.props.pageStore.sizeY} X: {this.props.pageStore.sizeX} <br/></span>
              <div style={{display: "flex", flexDirection: "row"}}>
                <Grid type={this.editorState} onChange={this.onChangeData}/>
              </div>
            </div>
            <div>
              <Hints
                hints={[
                  {color: "black", content: "Wall"},
                  {color: "green", content: "Goal"},
                  {color: "yellow", content: "Start"},
                  {color: "tomato", content: "Agent"},
                ]}
              />
            </div>
          </div>
          {JSON.stringify(this.replaceTiles(FieldType.BLOCKED, FieldType.WALL, this.props.pageStore.mapData))}
      </>
    );
  }

  @autobind
  private onChangeYAxis(value: number) {
    if(value <= 0) return;
    if(value < this.props.pageStore.mapData.length) {
      this.props.pageStore.mapData.splice(value, this.props.pageStore.mapData.length - value);
    } else {
      this.props.pageStore.mapData.push(
        Utils.getArrayWithLength(this.props.pageStore.mapData[0].length) // we can use 0 here, because we will always have at least 1 element
      )
    }
    this.props.pageStore.sizeY = value;
  }

  @autobind
  private onChangeXAxis(value: number) {
    if(value <= 0) return;
    if(value < this.props.pageStore.mapData[0].length) {
      this.props.pageStore.mapData.forEach(e => {
        e.splice(value, e.length - value);
      });
    } else {
      this.props.pageStore.mapData.forEach(e => {
        e.push(0);
      });
    }
    this.props.pageStore.sizeX = value;
  }

  @autobind
  private onChangeData(y: number, x: number, type: FieldType) {
    // there can only be one agent, one start and one goal
    if([FieldType.AGENT, FieldType.START, FieldType.GOAL].includes(type)) {
      this.resetField(type);
    }
    let { mapData } = this.props.pageStore;
    mapData[y][x] = type;
    this.props.pageStore.updateMap(mapData);
  }

  // Helper functions -> May add an Utils script?

  @autobind
  private resetField(type: FieldType) {
    this.props.pageStore.mapData.forEach((e, y) => {
      e.forEach((p, x) => {
        if(p === type) this.props.pageStore.mapData[y][x] = FieldType.NOTHING;
      });
    });
  }

  private replaceTiles(oldTile: FieldType, newTile: FieldType, map: FieldType[][]) {
    map.forEach((e, y) => {
      e.forEach((p, x) => {
        if(p === oldTile) {
          map[y][x] = newTile;
        }
      })
    })
    return map;
  }
}
