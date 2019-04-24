import * as React from "react";

export enum FieldType {
    NOTHING = 0,
    WALL,
    AGENT,
    START,
    GOAL,
    BLOCKED,
    PATH

}

export interface ITileProps {
    type: FieldType;
    size?: {
        width: number;
        height: number;
    }
    onClick: () => void;
    position: {
        x: number;
        y: number;
    }
}

export class Tile extends React.Component<ITileProps>{

    public static defaultProps = {
        size: {
            width: 40,
            height: 40
        }
    }

    public render() {
        if(!this.props.size) return <span>Missing Propertys</span>;

        return(
            <button
                style={{
                    backgroundColor: this.color,
                    display: "inline",
                    width: `${this.props.size.width}px`,
                    height: `${this.props.size.height}px`}}
                onClick={this.props.onClick}
                // we want the outer to be disabled, so you can't remove it
                disabled={this.props.type === FieldType.BLOCKED}
            />
        )
    }

    private get color() {
        switch(this.props.type) {
            case FieldType.NOTHING: return "grey";
            case FieldType.BLOCKED:
            case FieldType.WALL: return "black";
            case FieldType.START: return "yellow";
            case FieldType.AGENT: return "tomato";
            case FieldType.GOAL: return "green"
        }
    }
}