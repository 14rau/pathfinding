import * as React from "react";

export enum FieldType {
    NOTHING = 0,
    HOUSE,
    AGENT,
    START,
    GOAL,
    BLOCKED,
    PATH,
    SKYSCRAPER,
    LAWN,
    BUILDINGSITE

}

export interface ITileProps {
    type: FieldType;
    size?: {
        width: number;
        height: number;
    }
    onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
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
            case FieldType.HOUSE: return "black";
            case FieldType.START: return "yellow";
            case FieldType.AGENT: return "tomato";
            case FieldType.GOAL: return "green";
            case FieldType.SKYSCRAPER: return "lightgrey";
            case FieldType.LAWN: return "lawngreen";
            case FieldType.BUILDINGSITE: return "tomato";
        }
    }
}