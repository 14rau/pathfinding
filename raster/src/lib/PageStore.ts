import { observable, action } from "mobx";
import autobind from "autobind-decorator";

export class PageStore {
    @observable public sizeX = 11;
    @observable public sizeY = 11;
    @observable public mapData = this.defaultTiles;
    @observable public movement = ["left", "left", "left"];
    @observable public currentView = "ng";

    public get defaultTiles() {
        // default tiles using sizes X and Y -> returns empty map
        let ret = [];
        for(let x = 0; x < this.sizeX; x++) {
          let xRow = [];
          for(let y = 0; y < this.sizeY; y++) {
            if(x === 0 || y === 0 || y === (this.sizeY - 1) || x === (this.sizeX - 1)) {
              xRow.push(5);
            } else {
              xRow.push(0);
            }
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
}