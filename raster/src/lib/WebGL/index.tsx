import React from 'react';
import { AnimationHandler } from "./Init/index";
import { inject, observer } from 'mobx-react';
import { PageStore } from '../PageStore';

interface IWebGLProps {
    pageStore?: PageStore;
}

@inject("pageStore")
@observer
export class WebGL extends React.Component<IWebGLProps>{
    private animationHandler: AnimationHandler;
    
    componentDidMount(){
        this.animationHandler = new AnimationHandler("webgl", this.props.pageStore.mapData, this.props.pageStore.movement);
        this.animationHandler.init();
        this.animationHandler.run();
    }

    componentWillUpdate() {
        console.log(JSON.stringify(this.props.pageStore.mapData))
        this.animationHandler.updateMap(this.props.pageStore.mapData);
    }
    
    render() { 
        return <canvas id="webgl" width="800" height="800" style={{ border: '1px solid black'}}></canvas>
    }
}