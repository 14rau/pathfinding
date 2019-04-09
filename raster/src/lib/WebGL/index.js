import React from 'react';
import init from './Init';

export default class WebGL extends React.Component{

    componentDidMount(){
        init('webgl', this.props.data, ["left", "down", "left", "left", "left", "left", "up","up","up","up","up","up","up","up","up","up","up","up","up","up","up", ]);
    }

    render(){
        return <canvas id="webgl" width="800" height="800" style={{ border: '1px solid black'}}></canvas>
    }
}