import { createTransformationMatrix } from '../../Utils/maths';

export default class ModelInstance {
    constructor(x, y, z, rx,ry,rz, scale){
        this.x = x;
        this.y = y;
        this.z = z;
        this.rx = rx;
        this.ry = ry;
        this.rz = rz;
        this.scale = scale;
        this.updateTransformationMatrix();
    }

    updateRotation = (rx, ry, rz) => {
        this.rx += rx;
        this.ry += ry;
        this.rz += rz;
        this.updateTransformationMatrix();
    }

    updateTransformationMatrix = () => {
        this.transformationMatrix = createTransformationMatrix(this.x, this.y, this.z, this.rx, this.ry, this.rz, this.scale);
    }

    move(direction, amount = 1) {
        switch(direction) {
            case "up": this.y += amount; break;
            case "down": this.y -= amount; break;
            case "left": this.x -= amount; break;
            case "right": this.x -= amount; break;
            default: return;
        }
        this.updateTransformationMatrix()
    
    }

    getTransformationMatrix = () => this.transformationMatrix;
}