class GlCommander{
    public gl!: WebGLRenderingContext;

    init(gl: any) {
        this.gl = gl;
    }

    clear(r: any,g: any, b: any, a: any) {
        this.gl.clearColor(r, g, b, a);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT)
    }

    createBuffer() {
        return this.gl.createBuffer();
    }

    // init float buffers

    bindArrayBuffer(buffer) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    }

    unbindArrayBuffer() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }

    addArrayBufferData(vertecies) {
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertecies), this.gl.STATIC_DRAW);
    }


    bindElementArrayBuffer(buffer) {
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
    }

    unbindElementArrayBuffer() {
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
    }

    addElementArrayBufferData(vertecies) {
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertecies), this.gl.STATIC_DRAW);
    }
}


export const GLC = new GlCommander();

