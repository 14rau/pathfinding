import GLC from '../GLCommander';
import ModelRenderer from '../Render/ModelRenderer';
import ModelType from '../Models/ModelType';
import ModelInstance from '../Models/ModelInstance';
import Cube from './cube';
import Light from '../LightSource';
import Material from '../Materials/material';
import Camera from '../Camera';
import MouseEvent from '../EventHandlers/mouse';
import autobind from 'autobind-decorator';

export class AnimationHandler{
    private lights: Map<any, any>;
    private cameras: Map<any, any>;
    private modelRender;
    private agent;
    private goalObject;
    private map2d = [];
    private movement = [];
    private movementCopy = [];
    private isMoving = false;
    private subscriber: React.Component[] = [];
    private startPosition = {
        y: 0,
        x: 0
    }

    private movementSpeedMultiplier = 4;

    // we don't want the isMoving variable to be changed from the outside, so we take a getter
    public get moving() {
        return this.isMoving;
    }

    constructor(private id, map2d, movement) {
        this.map2d = Object.assign(this.map2d, map2d);
        this.movement = movement.map(e => e);
        this.init();
    }

    // we want to tell the UI, that we are changing something in here, so we can 
    public subscribe(component: React.Component) {
        this.subscriber.push(component);
    }

    public unsubscribe(component) {
        this.subscriber.splice(this.subscriber.findIndex(component), 1);
    }

    public action() {
        this.subscriber.forEach(e => {
            e.forceUpdate();
        });
    }
    
    public toggleMovement() {
        console.log(this.isMoving, "isMoving call")
        this.isMoving = !this.isMoving;
    }

    public resetMovement() {
        this.modelRender.models.agent.instances = []; // despawn agents
        this.spawnAgent(this.startPosition.y, this.startPosition.x); // spawn new agent
        this.movement = this.movementCopy.map(e => e); // copy movement array
    }

    public updateMovementPath(movement) {
        this.resetMovement(); // resets agent back to spawn
        this.movement = movement;
        this.convert2DMap(); // converts current movement to new movement
    }

    public init() {
        const canvas = document.querySelector<HTMLCanvasElement>(`#${this.id}`);
        if(!canvas) throw new Error(`Canvas with id ${this.id} not found!`);
        // check if browser supports webgl
        const gl = canvas.getContext('webgl');
        if(!gl) {
            alert("Your Browser doesn't support WebGL!")
            throw new Error("Your Browser doesn't support WebGL!");
        }
        // init our gl commander which we use to interact with webgls
        GLC.init(gl);

        this.modelRender = new ModelRenderer();

        MouseEvent.init();
        this.initLights();
        this.initCameras();
        this.convert2DMap();
        // we want to make our copy after the convert
        this.movementCopy = this.movement.map(e => e);
        this.init3DObjects();
        this.createInitialScene();
    }

    private getType(id: number) {
        switch(id) {
            case 0: return "none";
            case 1: return "wall";
            case 3: return "start";
            case 4: return "goal";
        }
    }

    @autobind
    public updateMap(newMap) {
        for(let id in this.modelRender.models) {
            this.modelRender.models[id].instances = [];
        }
        this.createInitialScene();
    }

    public canMove(y, x, direction, movement) {
        return true;
        y = Math.ceil(y);
        x = Math.ceil(x);
        // y = this.map2d.length - y - 1;
        // console.log("---------------")
        // console.log("Current position: ", y, x)
        // console.log("Next Position: ")
        // switch(direction) {
        //       case "y": console.log(y + movement, x); break;
        //       case "x": console.log(y, x + movement); break;
        //   }
        // console.log("Field Type:")
        // switch(direction) {
        //       case "y": console.log((this.map2d[y + movement][x])); break
        //       case "x": console.log((this.map2d[y][x+movement])); break;
        //   }
        // switch(direction) {
        //     case "y": console.log (!((this.map2d[y + movement][x] === 1) || this.map2d[y + movement][x] == null)); break;
        //     case "x": console.log (!((this.map2d[y][x + movement] === 1) || (this.map2d[y][x + movement] == null))); break;
        // }
        try {
          switch(direction) {
                case "y": return !((this.map2d[y + movement][x] === 1) || this.map2d[y + movement][x] == null)
                case "x": return !((this.map2d[y][x + movement] === 1) || (this.map2d[y][x + movement] == null));
            }
        } catch(err) {
            console.log(err)
            return false;
        }
    }

    public spawnAgent(y, x) {
        this.agent = new ModelInstance(y, this.map2d.length - x - 1, 1, 0, 0, 0, 0.2 );
        this.modelRender.addInstance(this.agent, 'agent');
    }

    private createInitialScene() {
        this.map2d.forEach((e, ei) => {
            e.forEach((p, pi) => {
                switch(p) {
                    // our problem is, that the coordinate system in the 3d view starts on the bottom left, the array kinda starts in the top left. So we need to invert some values
                    case 1:
                        const wall = new ModelInstance(pi, this.map2d.length - ei - 1, 1, 0, 0, 0, 0.5 );
                        this.modelRender.addInstance(wall, 'wall');
                        break;
                        case 3:
                        const start = new ModelInstance(pi, this.map2d.length - ei - 1, 0.35, 0, 0, 0, 0.2 );
                        this.modelRender.addInstance(start, 'start');
                        this.startPosition = {
                            y: pi,
                            x: ei
                        };
                        // spawn the agent
                        this.agent = new ModelInstance(pi, this.map2d.length - ei - 1, 1, 0, 0, 0, 0.2 );
                        this.modelRender.addInstance(this.agent, 'agent');
                        break;
                        case 4:
                        this.goalObject = new ModelInstance(pi, this.map2d.length - ei - 1, 0.35, 0, 0, 0, 0.2 );
                        this.modelRender.addInstance(this.goalObject, 'goal');
                        break;
    
                }

                // render the ground for every element in the scene
                const obj = new ModelInstance(ei, pi, 0, 0, 0, 0, 0.5 );
                this.modelRender.addInstance(obj, 'none');
            });
        })
    }

    private convert2DMap(){
        // map the movement to specific movements
        this.movement = this.movement.map(e => {
            switch(e) {
                case "up": return ["y", 1];
                case "down": return ["y", -1];
                case "left": return ["x", -1];
                case "right": return ["x", 1];
            }
        });
    }

    public get movementArray() {
        return this.movement.map( e => {
            switch(e[0]) {
                case "y":
                    switch(e[1]) {
                        case 1: return "up"
                        case -1: return "down"
                    }
                case "x":
                switch(e[1]) {
                    case 1: return "right"
                    case -1: return "left"
                }
            }
        })
    }

    private initCameras() {
        this.cameras = new Map();
        this.cameras.set("default", new Camera(8, -5, 40, -20, 0, 0, 0.1, 1000, 40));
    }

    private initLights() {
        this.lights = new Map();
        this.lights.set("default", new Light(100, 100, -100, 1.0, 1.0, 1.0, 0.1));
    }

    private init3DObjects() {
         // get informations from simple cube
        const { vertices, indices, normals, textureCoords } = Cube;

        const wallMat = new Material();
        wallMat.addDiffuse(require('../resources/black.jpg'));
        const wall = new ModelType(vertices, indices, normals, textureCoords);
        wall.addMaterial(wallMat);
        this.modelRender.registerNewModel(wall, 'wall');
    
        // Empty space
        const gravel = new Material();
        gravel.addDiffuse(require('../resources/gravel.jpg'));
        const none = new ModelType(vertices, indices, normals, textureCoords);
        none.addMaterial(gravel);
        this.modelRender.registerNewModel(none, 'none');
    
        // Goal
        const goalMat = new Material();
        goalMat.addDiffuse(require('../resources/goal.jpg'));
        const goal = new ModelType(vertices, indices, normals, textureCoords);
        goal.addMaterial(goalMat);
        this.modelRender.registerNewModel(goal, 'goal');
    
        // Start
        const startMat = new Material();
        startMat.addDiffuse(require('../resources/start.jpg'));
        const start = new ModelType(vertices, indices, normals, textureCoords);
        start.addMaterial(startMat);
        this.modelRender.registerNewModel(start, 'start');
    
        // Agent
        const agentMat = new Material();
        agentMat.addDiffuse(require('../resources/agent.png'));
        const agent = new ModelType(vertices, indices, normals, textureCoords);
        agent.addMaterial(agentMat);
        this.modelRender.registerNewModel(agent, 'agent');
    }

    public run() {
        var lastUpdateTime;
        var move = 0; // save how far we moved
        const render = () => {

            var currentTime = new Date().getTime(); // current time for animations
            GLC.clear(1.0, 1.0, 1.0, 1.0); // clear the canvas
            // moving animation should only be played when the agent is moving
            if(this.agent && this.movement.length && Array.isArray(this.movement) && this.isMoving) { // in case we have an agent, and a movement with length and we want to ensure we have an array

                // we check for length, but in theorie everything can have a length property
                if(lastUpdateTime) { // when we already updated, we want to go here
                    if(!this.canMove(this.agent.y, this.agent.x, this.movement[0][0], this.movement[0][1])) {
                        this.movement.shift();
                        this.action();
                    } else {
                        var delta = currentTime - lastUpdateTime; // calculate our delta for the movement
                        // first axis is axis, second is amount
                        this.agent.move(this.movement[0][0], (this.movement[0][1] * delta * this.movementSpeedMultiplier) / 1000.0); // move the element on the specified axis ([0][0]) by the calculated amount
                        move += (this.movement[0][1] * delta * this.movementSpeedMultiplier) / 1000.0; // update are move variable, so we know how far we already moved
                        if((Math.abs(move)) >= Math.abs(this.movement[0][1])) { // check if we already have moved far enough: if so, drop the first element in the movement array and reset the move variable
                            this.movement.shift();
                            this.action();
                            move = 0;
                        }
                    }
                }   
            }
            // when there is no movement left, set is moving to false, since we're not moving anymore
            if(this.isMoving && this.movement.length === 0) this.toggleMovement();

            lastUpdateTime = new Date().getTime(); // we now have updated, so we have to update our last update time
            this.modelRender.render(this.lights.get("default"), this.cameras.get("default")); // call render function to render the new view
            window.requestAnimationFrame(render); // request the browser window for the next render process
        }
        window.requestAnimationFrame(render); // initiate the first render
    }
}