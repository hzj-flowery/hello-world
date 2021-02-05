import { SY } from "../base/Sprite";
import { syGL } from "../gfx/syGLEnums";

let vert = `attribute vec4 a_position;
        uniform mat4 u_MMatrix;
        uniform mat4 u_VMatrix;
        uniform mat4 u_PMatrix;
        void main() {
        gl_Position = u_PMatrix * u_VMatrix * u_MMatrix * a_position;
        }`
let frag = `precision mediump float;
        uniform vec4 u_color;
            void main() {
            gl_FragColor = u_color;  //线的颜色    
        }`

export class Line extends SY.SpriteBaseLine {
    constructor() {
        super();
        //画线
        this._glPrimitiveType = syGL.PrimitiveType.LINES;
    }
    protected onInit() {
        this._vertStr = vert;
        this._fragStr = frag;
        this.color = [1.0,0,0,1.0];
    }
}