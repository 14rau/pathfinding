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

    // map the movement to specific movements
    movement = movement.map(e => {
        switch(e) {
            case "up": return ["y", 1];
            case "down": return ["y", -1];
            case "left": return ["x", -1];
            case "right": return ["x", +1];
        }
    })

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
    var agentObject;
    var goalObject;

    
    map2d.forEach((e, ei) => {
        e.forEach((p, pi) => {
            // our problem is, that the coordinate system in the 3d view starts on the bottom left, the array kinda starts in the top left. So we need to invert some values
            switch(p) {
                case 1:
                    const wall = new ModelInstance(pi, map2d.length - ei-1, 1, 0, 0, 0, 0.5 );
                    modelRender.addInstance(wall, 'wall');
                    break;
                case 3:
                    const start = new ModelInstance(pi, map2d.length - ei-1, 0.35, 0, 0, 0, 0.2 );
                    modelRender.addInstance(start, 'start');
                    // spawn the agent
                    agentObject = new ModelInstance(pi, map2d.length - ei-1, 1, 0, 0, 0, 0.2 );
                    modelRender.addInstance(agentObject, 'agent');
                    break;
                case 4:
                    goalObject = new ModelInstance(pi, map2d.length - ei-1, 0.35, 0, 0, 0, 0.2 );
                    modelRender.addInstance(goalObject, 'goal');
                    break;

            }
            // render the ground for every element in the scene
            const obj = new ModelInstance(ei, pi, 0, 0, 0, 0, 0.5 );
            modelRender.addInstance(obj, 'none');
        });
    })

    var lastUpdateTime;
    var move = 0;
    const render = () => {
        var currentTime = new Date().getTime()
        GLC.clear(1.0, 1.0, 1.0, 1.0);
        if(agentObject && movement.length && Array.isArray(movement)) {
            if(lastUpdateTime) {
                var delta = currentTime - lastUpdateTime;
                // first axis is axis, second is amount
                agentObject.move(movement[0][0], (movement[0][1] * delta) / 1000.0);
                move += (movement[0][1] * delta) / 1000.0;
                if((Math.abs(move)) >= Math.abs(movement[0][1])) {
                    movement.shift();
                    move = 0;
                }
            }   
            lastUpdateTime = new Date().getTime();
        }
        modelRender.render(light, camera);
        window.requestAnimationFrame(render);
    }

    window.requestAnimationFrame(render);
}