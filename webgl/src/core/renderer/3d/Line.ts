import { SY } from "../base/Sprite";
import { glprimitive_type } from "../gfx/GLEnums";

let vert = `attribute vec4 a_position;
        uniform mat4 u_MMatrix;
        uniform mat4 u_VMatrix;
        uniform mat4 u_PMatrix;
        void main() {
        gl_Position = u_PMatrix * u_VMatrix * u_MMatrix * a_position;
        }`
let frag = `precision mediump float;
    void main() {
    gl_FragColor = vec4(1.0,0.0,0.0,1.0);  //线的颜色    
}`

export class Line extends SY.SpriteBase{
    constructor(){
        super();
        
    }
    protected onInit(){

        let positions = [
            0,0,0,
            0.5,0.5,0.5,
            -1,0.5,-1,
            0.3,-1,0.3,
        ]
        let indexs = [
            0,1,2,3
        ]
        this.createVertexsBuffer(positions,3);
        this.createIndexsBuffer(indexs);
        this._vertStr = vert;
        this._fragStr = frag;
        //画线
        this._glPrimitiveType = glprimitive_type.LINES;
    }
    protected collectRenderData(time):void{
        super.collectRenderData(time);
    }
}