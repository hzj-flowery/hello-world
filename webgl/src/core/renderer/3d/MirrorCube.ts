
import { SY } from "../base/Sprite";
import { CubeData } from "../data/CubeData";
import { glprimitive_type } from "../gfx/GLEnums";
import { ShaderUseVariantType } from "../shader/ShaderUseVariantType";

var vertextBaseCode =
`attribute vec4 a_position;
attribute vec4 a_normal;
uniform mat4 u_PVMatrix;
uniform mat4 u_MMatrix;
varying vec3 v_position;
varying vec3 v_normal;

void main() {
    v_position = (u_MMatrix * a_position).xyz;
    v_normal = vec3(u_MMatrix * a_normal);
    gl_Position = u_PVMatrix * u_MMatrix * a_position;
}
`
//基础的shader的片段着色器
var fragBaseCode =
`precision highp float;
varying vec3 v_position;
varying vec3 v_normal;
uniform samplerCube u_cubeTexture;
uniform vec3 u_cameraWorldPosition;

void main() {
    vec3 normal = normalize(v_normal);
    vec3 eyeToSurfaceDir = normalize(v_position - u_cameraWorldPosition);
    vec3 direction = reflect(eyeToSurfaceDir,normal);
    gl_FragColor = textureCube(u_cubeTexture, direction);
}
`

export default class MirrorCube extends SY.SpriteBase {
    constructor() {
        super();
    }
    protected onInit(): void {
        var rd = CubeData.getData();
        this.createVertexsBuffer(rd.vertex,rd.dF.vertex_item_size);
        this.createIndexsBuffer(rd.indexs);
        this.createNormalsBuffer(rd.normals,rd.dF.normal_item_size);
        this._vertStr = vertextBaseCode;
        this._fragStr = fragBaseCode;
        this._glPrimitiveType = this.gl.TRIANGLE_STRIP;
    }
    protected onShader(){
        this._shader.pushShaderVariant(ShaderUseVariantType.ProjectionView);
        this._shader.pushShaderVariant(ShaderUseVariantType.Model);
        this._shader.pushShaderVariant(ShaderUseVariantType.CameraWorldPosition);
        this._shader.pushShaderVariant(ShaderUseVariantType.CUBE_COORD);
    }
    private defaultPath = [
        'res/skybox/2/right+x.png',
        'res/skybox/2/left-x.png',
        'res/skybox/2/up-y.png',
        'res/skybox/2/down+y.png',
        'res/skybox/2/back-z.png',
        'res/skybox/2/front+z.png'
   ]
   public setDefaultUrl(): void {
        this.spriteFrame = this.defaultPath;
   }
}