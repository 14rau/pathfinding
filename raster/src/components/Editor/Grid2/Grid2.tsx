import * as React from "react";
import { PageStore } from "../../../lib/PageStore";
import { FieldType } from "../Tile/Tile";
import { Editor } from "../Editor";
import { inject, observer } from "mobx-react";
import { toJS, observable } from "mobx";
import autobind from "autobind-decorator";
// constants
const tileSize = 10;
interface IEditor2Props {
    pageStore?: PageStore;
    type: FieldType;
    onChange: (y: number, x: number, type: FieldType) => void;
}

@inject("pageStore")
@observer
export class Grid2 extends React.Component<IEditor2Props>{
    @observable private drawing = false;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    public componentDidMount() {
        this.props.pageStore.register(this);
        this.ctx = this.canvas.getContext("2d");
        this.canvas.addEventListener("mousemove", this.handleMouse, false);
        this.canvas.addEventListener("mousedown", this.togglePaint, false);
        this.canvas.addEventListener("mouseup", this.togglePaint, false);
        this.updateMap();
    }

    @autobind
    private togglePaint() {
        if(this.drawing) this.props.pageStore.forceUpdate();
        this.drawing = !this.drawing;
    }

    @autobind
    private drawMouse(x, y) {
        this.ctx.fillStyle = "rgba(255,0,0,0.3)";
        this.ctx.fillRect(x * tileSize, y*tileSize, tileSize, tileSize);
        this.ctx.fillStyle = "";
    }

    @autobind
    private handleMouse(e: MouseEvent) {
        let x;
        let y;
        if (e.pageX || e.pageY) { 
            x = e.pageX;
            y = e.pageY;
        }
        else { 
            x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
            y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
        } 
        x -= this.canvas.offsetLeft;
        y -= this.canvas.offsetTop;
        y = Math.floor(y/tileSize);
        x = Math.floor(x/tileSize);
        this.updateMap();
        this.drawMouse(x, y)
        if(!this.drawing) return;
        this.props.onChange(y, x, this.props.type)
    }

    public updateMap() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.props.pageStore.mapData.forEach((e, yindex) => e.forEach((p, xindex) => {
            this.draw(p, xindex * tileSize  , yindex * tileSize, tileSize, tileSize);
        }));
    }


    public render() {
        return <canvas ref={e => this.canvas = e} width="800" height="800" style={{ border: '1px solid black'}} id="editor"></canvas>
    }

    private draw(type: FieldType,x ,y, width, height) {
        
        let color = Editor.options.find(e => e.value === type).color
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
        this.ctx.fillStyle = "";
    }

}