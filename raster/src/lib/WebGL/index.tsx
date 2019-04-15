import React from 'react';
import { AnimationHandler } from "./Init/index";
import { inject, observer } from 'mobx-react';
import { PageStore } from '../PageStore';
import { observable, toJS } from 'mobx';
import { Button } from '@blueprintjs/core';

interface IWebGLProps {
    pageStore?: PageStore;
}

@inject("pageStore")
@observer
export class WebGL extends React.Component<IWebGLProps>{

    public animationHandler: AnimationHandler;

    constructor(props) {
        super(props);
        this.props.pageStore.register(this);
    }
    
    componentDidMount(){
        console.log("called did mount")
        console.log(toJS(this.props.pageStore.mapData))
        this.animationHandler = new AnimationHandler("webgl", this.props.pageStore.mapData, this.props.pageStore.movement);
        this.animationHandler.run();
        console.log(this.animationHandler);
        this.animationHandler.subscribe(this);
        this.forceUpdate();
    }



    componentWillUpdate() {
        console.log("will update");
        console.log(JSON.stringify(this.props.pageStore.mapData))
        // this.animationHandler.updateMap(this.props.pageStore.mapData);
    }

    componentWillUnmount() {
        this.animationHandler.unsubscribe(this);
    }
    
    render() { 
        return <div>
            <canvas id="webgl" width="800" height="800" style={{ border: '1px solid black'}}></canvas>
            <Button
                onClick={
                    this.animationHandler ?
                    () => this.animationHandler.resetMovement() :
                    () => {}}
                text="Reset Agent"
            />
            <Button onClick={this.animationHandler ? () => this.animationHandler.toggleMovement() : () => {}} text={`${this.animationHandler && this.animationHandler.moving ? "Stop" : "Start" } Movement`}/>
            {JSON.stringify(this.animationHandler ? this.animationHandler.movementArray : "")}
        </div>
    }
}