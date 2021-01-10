
import { SY } from "../base/Sprite";
import enums from "../camera/enums";


var vertextBaseCode =
    'attribute vec3 a_position;' +
    'attribute vec2 a_uv;' +

    'uniform mat4 u_MMatrix;' +
    'uniform mat4 u_VMatrix;' +
    'uniform mat4 u_PMatrix;' +
    'varying vec2 vTextureCoordinates;' +

    'void main() {' +
    'gl_Position = u_PMatrix * u_VMatrix *u_MMatrix* vec4(a_position, 1.0);' +
    'vTextureCoordinates = a_uv;' +
    '}'
//基础的shader的片段着色器
var fragBaseCode =
    'precision mediump float;' +

    'varying vec2 vTextureCoordinates;' +
    'uniform sampler2D u_texCoord;' +

    'void main() {' +
    'gl_FragColor = texture2D(u_texCoord, vTextureCoordinates);' +
    '}'


export class Rectangle extends SY.Sprite2D {
    constructor() {
        super();
    }
    protected onInit(): void {

        this.setContentSize(120,240);

        this._vertStr = vertextBaseCode;
        this._fragStr = fragBaseCode;
    }
}