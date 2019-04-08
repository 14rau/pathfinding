import { GLC } from "./GlCommander";


export default (id: any) => {
    const canvas = document.querySelector(`#${id}`);

    if(!canvas) return;

    const gl = (canvas as any).getContext("webgl");

    if(!gl) return;
    GLC.clear(1.0, 0.0, 0.0, 1.0);
}