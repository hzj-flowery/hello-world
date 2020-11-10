
import { SY } from "../base/Sprite";
import Device from "../../../Device";


//屏幕中間位置為（0.0,0.0）
//屏幕左上角為（-1.0，1.0）
//屏幕左下角為（-1.0，-1.0）
//屏幕右上角位（1.0,1.0）
//屏幕右下角為（1.0，-1.0）

const screenPoint = [
    { x: 0.0, y: 0.0, z: 0.0 },//屏幕中間 0
    { x: -1.0, y: 1.0, z: 0.0 },//左上角 1
    { x: -1.0, y: -1.0, z: 0.0 },//左下角 2
    { x: 1.0, y: -1.0, z: 0.0 },//右下角 3
    { x: 1.0, y: 1.0, z: 0.0 },//右上角 4  
]

var getRandomScaleVert = function () {
    var newPoint = [];
    // var scale = Math.random();
    var scale = 0.5;
    for (let j = 1; j < screenPoint.length; j++) {
        newPoint.push(screenPoint[j].x * scale);
        newPoint.push(screenPoint[j].y * scale);
        newPoint.push(screenPoint[j].z * scale);
    }
    return newPoint;
}

var vertextBaseCode =
    'attribute vec3 a_position;' +
    'attribute vec2 a_uv;' +

    'uniform mat4 u_MVMatrix;' +
    'uniform mat4 u_PMatrix;' +
    'varying vec2 vTextureCoordinates;' +

    'void main() {' +
    'gl_Position = u_PMatrix * u_MVMatrix * vec4(a_position, 1.0);' +
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
    constructor(gl) {
        super(gl);
        this._cameraType = 1;
    }
    protected onInit(): void {

        this.setContentSize(120,240);

        this.setShader(vertextBaseCode, fragBaseCode);
    }
}