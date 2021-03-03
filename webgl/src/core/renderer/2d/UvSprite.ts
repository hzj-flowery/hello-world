import { SY } from "../base/Sprite";


var vertextBaseCode =
    `attribute vec3 a_position;
     attribute vec2 a_uv;

     uniform mat4 u_MMatrix;
     uniform mat4 u_VMatrix;
     uniform mat4 u_PMatrix;
     varying vec2 v_uv;

     void main() {
     gl_Position = u_PMatrix * u_VMatrix *u_MMatrix* vec4(a_position, 1.0);
     v_uv = a_uv;
     }`
//基础的shader的片段着色器
var fragBaseCode =
    `precision mediump float;
     varying vec2 v_uv;
     uniform float u_time;
     uniform sampler2D u_texture;
     
     void main() {
        vec2 uv = v_uv;
        float time = mod(u_time/100.0,90.0);
        float sinX = sin(time); //0-1
        if(uv.x>sinX)discard;
        vec4 normal  = texture2D(u_texture, uv);
        if(normal.a>0.1)
        gl_FragColor = normal*normal.a;
        else
        discard;
    }`

export class UvSprite extends SY.Sprite2D {
    constructor() {
        super();
        // this.sizeMode = SY.SpriteSizeMode.RAW;
    }
    protected onInit(): void {
        this.setContentSize(100,100);
        this._vertStr = vertextBaseCode;
        this._fragStr = fragBaseCode;
    }
}