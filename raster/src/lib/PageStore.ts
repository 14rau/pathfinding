import { observable, action, toJS } from "mobx";
import autobind from "autobind-decorator";
import { WebGL } from "./WebGL";
import { maps } from "../components/Editor/mapCollection";
import { ApiController } from "./Api/Api";

export class PageStore {
    private apiController: ApiController;
    @observable public sizeX = 50;
    @observable public sizeY = 50;
    @observable public mapData = this.defaultTiles;
    @observable public movement = [];
    @observable public currentView = "mb";
    @observable public algorithm = 0;
    @observable public mouseDown = false;
    @observable public brush = 1;
    @observable public maps = [];
    @observable public mapName = "Default";

    private registredViews = [];
    
    constructor() {
      this.apiController = new ApiController("8080", "localhost", "http");
      this.loadMaps();
    }

    private async loadMaps() {
      let data = await this.apiController.post("maps", {});
      this.maps = [...maps, ...data];
    }

    public async uploadMap() {
      await this.apiController.post("save", {name: toJS(this.mapName), map: toJS(this.mapData)})
    }

    @autobind
    public reset() {
      this.mapData = this.defaultTiles;
    }

    public get defaultTiles() {
        // default tiles using sizes X and Y -> returns empty map
        let ret = [];
        for(let x = 0; x < this.sizeX; x++) {
          let xRow = [];
          for(let y = 0; y < this.sizeY; y++) {
            if(x === 0 || y === 0 || y === (this.sizeY - 1) || x === (this.sizeX - 1)) {
              xRow.push(8);
            } else {
              
              if(y === 3 && x === 4) {
                xRow.push(3)
              } else if (x === 1 && y === 0) {
                xRow.push(4);
              } else if(y === 40 && x === 40) {
                xRow.push(4)
              } else {
                xRow.push(8);
              }
            }
          }
          ret.push(xRow);
        }
        return ret;
      }

      public static emptySet(x, y) {
        // default tiles using sizes X and Y -> returns empty map
        let ret = [];
        for(let x = 0; x < x; x++) {
          let xRow = [];
          for(let y = 0; y < y; y++) {
            xRow.push(1);
          }
          ret.push(xRow);
        }
        return ret;
      }

    @autobind
    @action
    public setView(str: string) {
        this.currentView = str;
    }

    @autobind
    @action
    public setMovement(movement: string[]) {
      this.movement = movement;
      this.registredViews.forEach(e => e.update())
    }

    public register(view: any){
      this.registredViews.push(view);
    }

    public forceUpdate() {
      this.registredViews.forEach(e => {
        if(e.animationHandler) {
          e.animationHandler.updateMap();
        } else {
          e.updateMap();
        }
      });
    }

    @autobind
    @action
    public updateMap(mapData) {
      this.mapData = mapData;
      this.forceUpdate();
    }
}