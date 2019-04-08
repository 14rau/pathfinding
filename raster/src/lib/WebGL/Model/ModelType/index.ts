import { GLC } from "../../GlCommander";


export default class ModelType {
    private vertexBuffer: WebGLBuffer;
    private indexBuffer: WebGLBuffer;
    constructor(private vertecies: any, private indicies: any) {
        this._genVertexBuffer();
        this._genIndexBuffer();
    }

    _genVertexBuffer = () => {
        GLC.createBuffer();
        GLC.bindArrayBuffer(this.vertexBuffer);
        GLC.addArrayBufferData(this.vertecies);
        GLC.unbindArrayBuffer();
    }

    _genIndexBuffer = () => {
        this.indexBuffer = GLC.createBuffer();
        GLC.bindElementArrayBuffer(this.indexBuffer);
        GLC.addElementArrayBufferData(this.indicies);
        GLC.unbindElementArrayBuffer();
    }
}

