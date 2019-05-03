import * as React from "react";
import { PageStore } from "../../../lib/PageStore";
import { FieldType } from "../Tile/Tile";
import { Editor } from "../Editor";
import { inject, observer } from "mobx-react";
import { toJS, observable } from "mobx";
import autobind from "autobind-decorator";
import { ShiftKeys } from "@blueprintjs/core/lib/esm/components/hotkeys/hotkeyParser";
// constants
const tileSize = 6;
interface IEditor2Props {
    pageStore?: PageStore;
    type: FieldType;
    onChange: (y: number, x: number, type: FieldType) => void;
}

@inject("pageStore")
@observer
export class Grid2 extends React.Component<IEditor2Props>{
    @observable private drawing = false;
    private pos;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private changes: Map<string, any>;

    public componentDidMount() {
        this.changes = new Map();
        this.props.pageStore.register(this);
        this.ctx = this.canvas.getContext("2d");
        this.canvas.addEventListener("mousemove", this.handleMouse, false);
        this.canvas.addEventListener("mousedown", this.togglePaint, false);
        this.canvas.addEventListener("mouseup", this.togglePaint, false);
        this.updateMap();
    }

    @autobind
    private togglePaint() {
        if(this.drawing) {
            this.changes.forEach(e => {
                this.props.onChange(e.y, e.x, this.props.type);
            });
            this.updateMap();
            this.props.pageStore.forceUpdate();
            this.pos = null;
        };
        this.drawing = !this.drawing;
    }

    // @autobind
    // private drawMouse(x, y) {
    //     this.ctx.fillStyle = "rgba(255,0,0,0.3)";
    //     this.ctx.fillRect(x * tileSize, y*tileSize, tileSize * this.props.pageStore.brush, tileSize * this.props.pageStore.brush);
    //     this.ctx.fillStyle = "";
    // }

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
        if(!this.drawing) return;
        try {
            if(this.pos) {
                let oldPos = [this.pos[0], this.pos[1]];
                this.pos = [y,x];
                this.line(oldPos[1], oldPos[0], this.pos[1], this.pos[0]);
            } else {
                this.pos = [y,x];
                this.draw(this.props.type, x * tileSize, y * tileSize, tileSize, tileSize);
            }

            // for(let i = this.pos[0]; i < oldPos[0]; i++) {
            //     for(let p = this.pos[1]; p < oldPos[1]; p++) {
            //         this.draw(this.props.type, p * tileSize, i * tileSize, tileSize, tileSize);
            //         this.changes.set(`${p}|${i}`, {p, i});        
            //     }    
            // }

            

        } catch (err) {}
    }

    /**
     * Bresenham Algorithm
     */
    private line(x0, y0, x1, y1) {
        let dx = Math.abs(x1 - x0);
        let dy = Math.abs(y1 - y0);
        let sx = (x0 < x1) ? 1 : -1;
        let sy = (y0 < y1) ? 1 : -1;
        let err = dx - dy;

        while(true) {
            this.draw(this.props.type, x0 * tileSize, y0 * tileSize, tileSize, tileSize);
            this.changes.set(`${y0}|${x0}`, {y: y0, x: x0});
            if((x0 === x1) && (y0 === y1)) break;
            let e2 = 2*err;
            if(e2 > -dy) {err -= dy; x0 += sx;}
            if(e2 < dx) {err += dx; y0 += sy; }
        }
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

    private draw(type: FieldType, x, y, width, height) {
        let color = Editor.options.find(e => e.value === type).color
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
        this.ctx.fillStyle = "";
    }
}