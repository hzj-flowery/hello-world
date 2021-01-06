import { SY } from "../base/Sprite";
import Device from "../../Device";
import GameMainCamera from "../camera/GameMainCamera";
import { RenderTexture } from "../base/texture/RenderTexture";


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

export class RenderOfflineSprite extends SY.Sprite2D{
    constructor(){
        super();
        this._renderData._isOffline = true;
    }
    protected onInit(): void {
        this.setContentSize(Device.Instance.width/4,Device.Instance.height/4);
        this.setShader(vertextBaseCode,fragBaseCode);
    }
    protected onSetTextureUrl():void{
        
        GameMainCamera.instance.get2DCamera().targetTexture = this.texture as RenderTexture;
    }
}