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
    // get instance of canvas element by given id
    const canvas = document.querySelector(`#${id}`);
    if(!canvas) return;
    // check if browser supports webgl
    const gl = canvas.getContext('webgl');
    if(!gl) return;
    // init our gl commander which we use to interact with webgl
    GLC.init(gl);

    MouseEvent.init();

    // map the movement to specific movements
    movement = movement.map(e => {
        switch(e) {
            case "up": return ["y", 1];
            case "down": return ["y", -1];
            case "left": return ["x", -1];
            case "right": return ["x", +1];
        }
    });

    // define the camera
    //default values: x = 0, y = 0, z = 10, pitch = 0, yaw = 0, roll = 0, near = 0.1, far = 1000, fov = 40
    const camera = new Camera(5, -2, 25, -20, 0, 0, 0.1, 1000, 40);

    // get informations from simple cube
    const { vertices, indices, normals, textureCoords } = Cube;

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

    // set variables, that will be used in the following process
    var agentObject; // we want to move the agent, thus we have to have some reference to it
    var goalObject; // we want to spin the goalObject, thus we want to have some reference to it

    // loop over each element in the array
    map2d.forEach((e, ei) => {
        e.forEach((p, pi) => {
            switch(p) {
                // our problem is, that the coordinate system in the 3d view starts on the bottom left, the array kinda starts in the top left. So we need to invert some values
                case 1:
                    const wall = new ModelInstance(pi, map2d.length - ei - 1, 1, 0, 0, 0, 0.5 );
                    modelRender.addInstance(wall, 'wall');
                    break;
                case 3:
                    const start = new ModelInstance(pi, map2d.length - ei - 1, 0.35, 0, 0, 0, 0.2 );
                    modelRender.addInstance(start, 'start');
                    // spawn the agent
                    agentObject = new ModelInstance(pi, map2d.length - ei - 1, 1, 0, 0, 0, 0.2 );
                    modelRender.addInstance(agentObject, 'agent');
                    break;
                case 4:
                    goalObject = new ModelInstance(pi, map2d.length - ei - 1, 0.35, 0, 0, 0, 0.2 );
                    modelRender.addInstance(goalObject, 'goal');
                    break;

            }
            // render the ground for every element in the scene
            const obj = new ModelInstance(ei, pi, 0, 0, 0, 0, 0.5 );
            modelRender.addInstance(obj, 'none');
        });
    })

    // we want to have the last update time. We will use it to mae smooth animations
    var lastUpdateTime;
    var move = 0; // save how far we moved
    const render = () => {
        var currentTime = new Date().getTime(); // current time for animations
        GLC.clear(1.0, 1.0, 1.0, 1.0); // clear the canvas
        if(agentObject && movement.length && Array.isArray(movement)) { // in case we have an agent, and a movement with length and we want to ensure we have an array
            // we check for length, but in theorie everything can have a length property
            if(lastUpdateTime) { // when we already updated, we want to go here
                var delta = currentTime - lastUpdateTime; // calculate our delta for the movement
                // first axis is axis, second is amount
                agentObject.move(movement[0][0], (movement[0][1] * delta) / 1000.0); // move the element on the specified axis ([0][0]) by the calculated amount
                move += (movement[0][1] * delta) / 1000.0; // update are move variable, so we know how far we already moved
                if((Math.abs(move)) >= Math.abs(movement[0][1])) { // check if we already have moved far enough: if so, drop the first element in the movement array and reset the move variable
                    movement.shift();
                    move = 0;
                }
            }   
            lastUpdateTime = new Date().getTime(); // we now have updated, so we have to update our last update time
        }
        modelRender.render(light, camera); // call render function to render the new view
        window.requestAnimationFrame(render); // request the browser window for the next render process
    }

    window.requestAnimationFrame(render); // initiate the first render
}