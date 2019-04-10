import * as React from "react";

interface IHint{
    color: string;
    content: any;
}

interface IHintProps{
    hints: IHint[];
}

export class Hints extends React.Component<IHintProps>{
    public render() {
        return <ul>
            {this.props.hints.map(e => <li>{e.content} <div style={{width: "10px", height: "10px", backgroundColor: e.color}}/></li>)}
        </ul>
    }
}