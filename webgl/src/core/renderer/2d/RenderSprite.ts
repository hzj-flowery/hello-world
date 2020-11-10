import { SY } from "../base/Sprite";
import { RenderTexture } from "../assets/RenderTexture";
import FrameBuffer from "../gfx/FrameBuffer";
import Device from "../../../Device";


    var vertextBaseCode =
    'attribute vec3 a_position;' +
    'attribute vec2 a_uv;' +

    'uniform mat4 u_MVMatrix;' +
    'uniform mat4 u_PMatrix;' +
    'varying vec2 vTextureCoordinates;' +

    'void main() {' +
    'gl_Position = u_PMatrix * u_MVMatrix * vec4(a_position, 1.0);' +
    'vTextureCoordinates =vec2(a_uv.x,a_uv.y);' +
    '}'
//基础的shader的片段着色器
var fragBaseCode =
    'precision mediump float;' +

    'varying vec2 vTextureCoordinates;' +
    'uniform sampler2D u_texCoord;' +

    'void main() {' +
    'gl_FragColor = texture2D(u_texCoord, vTextureCoordinates);' +
    '}'

export class RenderSprite extends SY.Sprite2D{
    constructor(gl){
        super(gl);
        this._cameraType = 1;
    }
    protected onInit(): void {
        this.setContentSize(Device.Instance.Width/4,Device.Instance.Height/4);
        this._texture = new RenderTexture(this.gl);
        this.setShader(vertextBaseCode,fragBaseCode);
    }
}