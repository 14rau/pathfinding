import * as React from "react";
import { Tile, FieldType } from "../Tile/Tile";
import { observer, inject } from "mobx-react";
import { PageStore } from "../../../lib/PageStore";


export interface IGridProps{
    type: FieldType;
    onChange: (y: number, x: number, type: FieldType) => void;

    // injected
    pageStore?: PageStore;
}

@inject("pageStore")
@observer
export class Grid extends React.Component<IGridProps>{
    public render() {
        return <div>
            {this.props.pageStore.mapData.map((e, y) => <React.Fragment key={y}> {e.map((p, x) => <Tile position={{x,y}} key={`${x}/${y}`} onClick={(e) => this.props.onChange(y, x, this.props.type)} type={p} />)} <br/> </React.Fragment>)}
        </div>
    }
}