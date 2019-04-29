import GLC from '../GLCommander';

class MouseListener {
    constructor(){
        this.onWheelListeners = [];
        this.onDragListeners = [];
        this.onWheelDrag = [];
    }

    init = () => {
        let x = 0;
        let y = 0;
        let dragging = false;
        let wheel = false;

        GLC.gl.canvas.onwheel = (e) => {
            this.onWheelListeners.forEach(listener => {
                listener.onWheel(e);
            })
        }

        GLC.gl.canvas.onmousedown = (e) => {
            x = e.clientX;
            y = e.clientY;
            dragging = true;
            if(e.button === 1) wheel = true;
        }

        GLC.gl.canvas.onmouseup = () => {
            dragging = false;
            wheel = false;
        }

        GLC.gl.canvas.onmousemove = (e) => {
            if (dragging) {
                const dx = x - e.clientX;
                const dy = y - e.clientY;
                x = e.clientX;
                y = e.clientY;
                if(!wheel) {
                    this.onDragListeners.forEach(listener => {
                        listener.onDrag(dx, dy);
                    });
                } else {
                    this.onDragListeners.forEach(listener => {
                        listener.onWheelDrag(dx, dy);
                    });
                }

            }
        }
    }

    subscribeToDrag = (listener) => {
        this.onDragListeners.push(listener);
    }

    subscribeToWheel = (listener) => {
        this.onWheelListeners.push(listener)
    }

    subscribeToWheelDrag = (listener) => {
        this.onWheelDrag.push(listener)
    }
}

const MouseEvent = new MouseListener();
export default MouseEvent;