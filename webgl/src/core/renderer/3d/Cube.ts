import { SY } from "../base/Sprite";
import { CubeData, CubeFace } from "../data/CubeData";


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
    'uniform sampler2D u_texture;' +

    'void main() {' +
    'gl_FragColor = texture2D(u_texture, vTextureCoordinates);' +
    '}'

export default class Cube extends SY.SpriteBase {
    constructor() {
        super();
    }
    protected onInit() {
        var rd = CubeData.getData();
        this.createVertexsBuffer(rd.vertex,rd.dF.vertex_item_size);
        this.createUVsBuffer(rd.uvData,rd.dF.uv_item_size);
        this.createIndexsBuffer(rd.indexs);
        this._vertStr = vertextBaseCode;
        this._fragStr = fragBaseCode;
        this._glPrimitiveType = this.gl.TRIANGLE_STRIP;
    }
}