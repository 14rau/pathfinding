import * as React from "react";
import { Tile, FieldType } from "../Tile/Tile";
import { observer } from "mobx-react";


export interface IGridProps{
    data: number[][];
    type: FieldType;
    onChange: (y: number, x: number, type: FieldType) => void;
}

@observer
export class Grid extends React.Component<IGridProps>{
    public render() {
        return <div>
            {this.props.data.map((e, y) => <React.Fragment key={y}> {e.map((p, x) => <Tile position={{x,y}} key={`${x}/${y}`} onClick={() => this.props.onChange(y, x, this.props.type)} type={p} />)} <br/> </React.Fragment>)}
        </div>
    }
}