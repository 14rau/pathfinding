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
import { Grid2 } from "./Grid2/Grid2";



// -> This is the data we want to show
interface IEditorProps {
  x?: number;
  y?: number;
  pageStore?: PageStore;
}

const brush = [{
  type: "1x1",
  value: 1
},{
  type: "2x2",
  value: 2
},{
  type: "3x3",
  value: 3
},{
  type: "4x4",
  value: 4
}]

@inject("pageStore")
@observer
export class Editor extends Component<IEditorProps> {

  @observable private mapLoader = [];
  @observable private showImport = false;

  public static defaultProps = {
    x: 11,
    y: 11,
    pageStore: new PageStore()
  };

  // track the editor state -> in which mode are we? Set Goal, Walls, Start?
  @observable private editorState = FieldType.NOTHING;
  @observable private matrixInput = "";

  public static options = [{
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
            <textarea value={this.matrixInput} onChange={e => this.matrixInput = e.target.value} />
            <Button text="import" onClick={() => {
              let mapData = JSON.parse(this.matrixInput)
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
            
            <h4>Brush</h4>
              <select style={{ width: "100%" }} onChange={e => this.props.pageStore.brush = parseInt(e.target.value)}>
                {brush.map(e => <option value={e.value}>{e.type}</option>)}
              </select>
    
            {/* Tileselect */}
            <h4>Tiles</h4>
            <div style={{display: "flex", flexDirection: "column"}}>
              {Editor.options.map(e => <Button style={{border: `2px solid ${e.color}`}} active={this.editorState === e.value} text={e.label} onClick={() => this.editorState = e.value}/>)}
            </div>
            
            {/* Mapselect */}
            <h4>Maps</h4>
            <div style={{display: "flex", flexDirection: "column"}}>
              <Button text="load matrix" onClick={() => {
                this.mapLoader.forEach((y, yi) => {
                  (y as any).forEach((x, xi) => {
                    this.onChangeData(yi, xi, x);
                  })
                })
                this.props.pageStore.updateMap(this.mapLoader);
              }}>

              </Button>

              <Button text="import matrix" onClick={() => {
                this.showImport = true;
              }}/>
            </div>
            <select style={{ width: "100%" }} onChange={e => this.mapLoader = JSON.parse(e.target.value)}>
              {this.props.pageStore.maps.map(e => <option value={JSON.stringify(e.map)}>{e.name}</option>)}
            </select>

          </div>
          <div>
            <span className="detailBadge">Y: {this.props.pageStore.sizeY} X: {this.props.pageStore.sizeX} <br /></span>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <Grid2 type={this.editorState} onChange={this.onChangeData} />
            </div>
          </div>
          <div>
            <Hints
              hints={
                Editor.options.map(e => ({
                  content: e.label,
                  color: e.color
                }))
              }
            />
            <Button text="Upload" onClick={this.props.pageStore.uploadMap}/>
            <Button text="Reset" onClick={this.props.pageStore.reset}/>
            <input value={this.props.pageStore.mapName} onChange={e => this.props.pageStore.mapName = e.target.value}/>
          </div>
        </div>
      </>
    );
  }

  @autobind
  private onChangeData(y: number, x: number, type: FieldType) {
    // there can only be one agent, one start and one goal
    if ([FieldType.START].includes(type)) {
      this.resetField(type);
    }
    this.replaceTiles(FieldType.PATH, FieldType.NOTHING, this.props.pageStore.mapData);
    this.props.pageStore.mapData[y][x] = type;
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
