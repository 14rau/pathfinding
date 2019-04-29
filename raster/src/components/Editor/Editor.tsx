import React, { Component } from "react";
import { observer, inject } from "mobx-react"
import { observable, toJS } from "mobx";
import autobind from "autobind-decorator";
import { FieldType } from "./Tile/Tile";
import { Utils } from "../../lib/Util";
import { Grid } from "./Grid/Grid";
import { Hints } from "./Hints/Hints";
import { PageStore } from "../../lib/PageStore";
import { Button, Overlay, Classes } from "@blueprintjs/core";
import { maps } from "./mapCollection";



// -> This is the data we want to show
interface IEditorProps {
  x?: number;
  y?: number;
  pageStore?: PageStore;
}

@inject("pageStore")
@observer
export class Editor extends Component<IEditorProps> {

  @observable private mapLoader = JSON.stringify(maps[0].map);
  @observable private showImport = false;

  public static defaultProps = {
    x: 11,
    y: 11,
    pageStore: new PageStore()
  };

  // track the editor state -> in which mode are we? Set Goal, Walls, Start?
  @observable private editorState = FieldType.NOTHING;
  @observable private matrixInput = "";
  @observable private matrixName = "";

  private options = [{
    label: "House",
    value: FieldType.HOUSE,
    color: "black"
  }, {
    label: "None",
    value: FieldType.NOTHING,
    color: "grey"
  }, {
    label: "Goal",
    value: FieldType.GOAL,
    color: "green"
  }, {
    label: "Start",
    value: FieldType.START,
    color: "yellow"
  }, {
    label: "Skyscraper",
    value: FieldType.SKYSCRAPER,
    color: "lightgrey"
  }, {
    label: "Lawn",
    value: FieldType.LAWN,
    color: "lawngreen"
  }, {
    label: "Building Site",
    value: FieldType.BUILDINGSITE,
    color: "tomato"
  }]

  public render() {
    if (this.props.pageStore == null) {
      return <div>Page Store not injected</div>
    }
    return (
      <>
        <Overlay className={Classes.OVERLAY_SCROLL_CONTAINER} isOpen={this.showImport} onClose={() => this.showImport = false}>
          <div style={{ background: "ghostwhite", width: "400px", height: "400px" }}>
            <input value={this.matrixName} onChange={e => this.matrixName = e.target.value} />
            <textarea value={this.matrixInput} onChange={e => this.matrixInput = e.target.value} />
            <Button text="import" onClick={() => {
              let mapData = JSON.parse(this.matrixInput)
              if (window.localStorage.getItem("maps")) {
                window.localStorage.setItem("maps", JSON.stringify([{ map: this.matrixInput, name: this.matrixName }, ...JSON.parse(window.localStorage.getItem("maps"))]))
              } else {
                window.localStorage.setItem("maps", JSON.stringify([{ map: this.matrixInput, name: this.matrixName }]))
              }
              mapData.forEach((y, yi) => {
                y.forEach((x, xi) => {
                  this.onChangeData(yi, xi, x);
                })
              })
            }} />
          </div>
        </Overlay>
        Edit Type: {this.editorState} <br />
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div className="side">
            <div className="btn" style={{ marginTop: "16px" }} onClick={() => console.log(JSON.stringify(this.props.pageStore.mapData))}>show in console</div>

    
            {/* Tileselect */}
            <h4>Tiles</h4>
            <div style={{display: "flex", flexDirection: "column"}}>
              {this.options.map(e => <Button style={{border: `2px solid ${e.color}`}} active={this.editorState === e.value} text={e.label} onClick={() => this.editorState = e.value}/>)}
            </div>
            
            {/* Mapselect */}
            <h4>Maps</h4>
            <div style={{display: "flex", flexDirection: "column"}}>
              <Button text="load matrix" onClick={() => {
                let mapData = JSON.parse(JSON.parse(toJS(this.mapLoader)))
                mapData.forEach((y, yi) => {
                  (y as any).forEach((x, xi) => {
                    this.onChangeData(yi, xi, x);
                  })
                })
              }}>

              </Button>

              <Button text="import matrix" onClick={() => {
                this.showImport = true;
              }}/>
            </div>
            <select style={{ width: "100%" }} onChange={e => this.mapLoader = e.target.value}>
              {maps.map(e => <option value={JSON.stringify(e.map)}>{e.name}</option>)}
            </select>

          </div>
          <div>
            <span className="detailBadge">Y: {this.props.pageStore.sizeY} X: {this.props.pageStore.sizeX} <br /></span>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <Grid type={this.editorState} onChange={this.onChangeData} />
            </div>
          </div>
          <div>
            <Hints
              hints={
                this.options.map(e => ({
                  content: e.label,
                  color: e.color
                }))
              }
            />
          </div>
        </div>
      </>
    );
  }

  @autobind
  private onChangeYAxis(value: number) {
    if (value <= 0) return;
    if (value < this.props.pageStore.mapData.length) {
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
    if (value <= 0) return;
    if (value < this.props.pageStore.mapData[0].length) {
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
    if ([FieldType.START].includes(type)) {
      this.resetField(type);
    }

    let { mapData } = this.props.pageStore;
    this.replaceTiles(FieldType.PATH, FieldType.NOTHING, mapData);
    mapData[y][x] = type;
    this.props.pageStore.updateMap(mapData);
  }

  // Helper functions -> May add an Utils script?

  @autobind
  private resetField(type: FieldType) {
    this.props.pageStore.mapData.forEach((e, y) => {
      e.forEach((p, x) => {
        if (p === type) this.props.pageStore.mapData[y][x] = FieldType.NOTHING;
      });
    });
  }

  private replaceTiles(oldTile: FieldType, newTile: FieldType, map: FieldType[][]) {
    map.forEach((e, y) => {
      e.forEach((p, x) => {
        if (p === oldTile) {
          map[y][x] = newTile;
        }
      })
    })
    return map;
  }
}
