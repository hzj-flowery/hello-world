import { SY } from "../base/Sprite";


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

export default class Ground extends SY.Sprite {
    constructor(gl) {
        super(gl);
    }
    protected onInit(): void {
        // 顶点数据
        var floorVertexPosition = [
            // Plane in y=0
            5.0, 0.0, 5.0, //v0
            5.0, 0.0, -5.0, //v1
            -5.0, 0.0, -5.0, //v2
            -5.0, 0.0, 5.0]; //v3

        this.createVertexsBuffer(floorVertexPosition, 3);
        //uv 数据
        var floorVertexTextureCoordinates = [
            2.0, 0.0,
            2.0, 2.0,
            0.0, 2.0,
            0.0, 0.0
        ];
        this.createUVsBuffer(floorVertexTextureCoordinates, 2);

        // 索引数据
        var floorVertexIndices = [0, 1, 2, 3];
        this.createIndexsBuffer(floorVertexIndices);
        this.setShader(vertextBaseCode,fragBaseCode);
    }
}