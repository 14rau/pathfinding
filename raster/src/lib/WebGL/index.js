import React from 'react';
import init from "./Init";

export class WebGL extends React.Component{

    componentDidMount(){
        init('webgl', this.props.data, this.props.path);
        //respawnAgent(0, 0);
        /*
    modelRender.models["agent"] = [];

    const vertices = Cube.vertices;
    const indices = Cube.indices;
    const normals = Cube.normals;
    const textureCoords = Cube.textureCoords;

    const agentMat = new Material();
    agentMat.addDiffuse(require('../resources/agent.png'));
    const agent = new ModelType(vertices, indices, normals, textureCoords);
    agent.addMaterial(agentMat);
    modelRender.registerNewModel(agent, 'agent');


    agentObject = new ModelInstance(y, x, 1, 0, 0, 0, 0.2 );
    modelRender.addInstance(agentObject, 'agent');
        */
    }

    render(){
        return <canvas id="webgl" width="800" height="800" style={{ border: '1px solid black'}}></canvas>
    }
}