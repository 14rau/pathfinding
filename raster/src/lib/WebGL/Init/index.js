import GLC from '../GLCommander';
import ModelRenderer from '../Render/ModelRenderer';
import ModelType from '../Models/ModelType';
import ModelInstance from '../Models/ModelInstance';
import Cube from './cube';
import Light from '../LightSource';
import Material from '../Materials/material';
import Camera from '../Camera';
import MouseEvent from '../EventHandlers/mouse';


export default (id, map2d, movement) => {
    const canvas = document.querySelector(`#${id}`);

    if(!canvas) {
        return;
    }

    const gl = canvas.getContext('webgl');

    if(!gl) {
        return;
    }

    GLC.init(gl);
    MouseEvent.init();

    const vertices = Cube.vertices;
    const indices = Cube.indices;
    const normals = Cube.normals;
    const textureCoords = Cube.textureCoords;

    const modelRender = new ModelRenderer();
    const light = new Light(100, 100, -100, 1.0, 1.0, 1.0, 0.1);


    // create models
    // Wall
    const wallMat = new Material();
    wallMat.addDiffuse(require('../resources/black.jpg'));
    const wall = new ModelType(vertices, indices, normals, textureCoords);
    wall.addMaterial(wallMat);
    modelRender.registerNewModel(wall, 'wall');

    // Empty space
    const gravel = new Material();
    gravel.addDiffuse(require('../resources/gravel.jpg'));
    const none = new ModelType(vertices, indices, normals, textureCoords);
    none.addMaterial(gravel);
    modelRender.registerNewModel(none, 'none');
    // x = 0, y = 0, z = 10, pitch = 0, yaw = 0, roll = 0, near = 0.1, far = 1000, fov = 40
    const camera = new Camera(5, -2, 25, -20, 0, 0, 0.1, 1000, 40);


    // Goal
    const goalMat = new Material();
    goalMat.addDiffuse(require('../resources/goal.jpg'));
    const goal = new ModelType(vertices, indices, normals, textureCoords);
    goal.addMaterial(goalMat);
    modelRender.registerNewModel(goal, 'goal');

    // Start
    const startMat = new Material();
    startMat.addDiffuse(require('../resources/start.jpg'));
    const start = new ModelType(vertices, indices, normals, textureCoords);
    start.addMaterial(startMat);
    modelRender.registerNewModel(start, 'start');

    // Agent
    const agentMat = new Material();
    agentMat.addDiffuse(require('../resources/agent.png'));
    const agent = new ModelType(vertices, indices, normals, textureCoords);
    agent.addMaterial(agentMat);
    modelRender.registerNewModel(agent, 'agent');
    var agentObject

    
    map2d.forEach((e, ei) => {
        e.forEach((p, pi) => {

            switch(p) {
                case 1:
                    const wall = new ModelInstance(ei, pi, 1, 0, 0, 0, 0.5 );
                    modelRender.addInstance(wall, 'wall');
                    break;
                case 3:
                    const start = new ModelInstance(ei, pi, 0.35, 0, 0, 0, 0.2 );
                    modelRender.addInstance(start, 'start');
                    // spawn the agent
                    agentObject = new ModelInstance(ei, pi, 1, 0, 0, 0, 0.2 );
                    modelRender.addInstance(agentObject, 'agent');
                    break;
                case 4:
                    const goal = new ModelInstance(ei, pi, 0.35, 0, 0, 0, 0.2 );
                    modelRender.addInstance(goal, 'goal');
                    break;

            }
            // render the ground for every element in the scene
            const obj = new ModelInstance(ei, pi, 0, 0, 0, 0, 0.5 );
            modelRender.addInstance(obj, 'none');
        });
    })

    const render = () => {
        GLC.clear(1.0, 1.0, 1.0, 1.0);
        if(agentObject && movement.length && Array.isArray(movement)) {
            agentObject.move(movement.pop());
        }
        agentObject.updateRotation(0,0,1);
        modelRender.render(light, camera);
        window.requestAnimationFrame(render);
    }

    window.requestAnimationFrame(render);
}