import Device from "../../../Device";
import { glMatrix } from "../../../math/Matrix";
import { RenderDataPool, RenderDataType, SpineRenderData } from "../../data/RenderData";
import { ShaderData } from "../../shader/Shader";
import { G_ShaderFactory } from "../../shader/ShaderFactory";
import { Skeleton_Node } from "./Skeleton_Node";
import { Skeleton_Skin } from "./Skeleton_Skin";


var skinVS =
`attribute vec4 a_position;  //顶点位置
attribute vec3 a_normal;    //法线
attribute vec4 a_weights_0; //权重
attribute vec4 a_joints_0;  //受到哪些骨骼节点的影响
attribute vec2 a_uv;
uniform mat4 u_PMatrix;  //投影
uniform mat4 u_VMatrix;        //观察空间
uniform mat4 u_MMatrix;       //世界空间
uniform sampler2D u_jointTexture;   //骨骼矩阵纹理

uniform float u_numJoints;  //[6,7,8,9,10,11]
varying vec3 v_normal;
varying vec2 v_uv;
    //获取骨骼矩阵
    //一共有6个骨骼矩阵
    //0 1 2 3 4 5
    //每个顶点受到4个骨骼矩阵的影响
    /**
    RGBA RGBA RGBA RGBA  --矩阵1  16
    RGBA RGBA RGBA RGBA  --矩阵2  16
    RGBA RGBA RGBA RGBA  --矩阵3  16
    RGBA RGBA RGBA RGBA  --矩阵4  16
    RGBA RGBA RGBA RGBA  --矩阵5  16
    RGBA RGBA RGBA RGBA  --矩阵6  16
     */
mat4 getBoneMatrix(float jointNdx) {
float v = (jointNdx + 0.5) / u_numJoints;       //算出行
return mat4(                                                 //s      
texture2D(u_jointTexture, vec2(((0.5 + 0.0) / 4.), v)),  //0.125 
texture2D(u_jointTexture, vec2(((0.5 + 1.0) / 4.), v)),  //0.375 
texture2D(u_jointTexture, vec2(((0.5 + 2.0) / 4.), v)),  //0.625 
texture2D(u_jointTexture, vec2(((0.5 + 3.0) / 4.), v))); //0.875 
}
void main() {
mat4 skinMatrix =   getBoneMatrix(a_joints_0[0]) * a_weights_0[0] + getBoneMatrix(a_joints_0[1]) * a_weights_0[1] +
getBoneMatrix(a_joints_0[2]) * a_weights_0[2] +
getBoneMatrix(a_joints_0[3]) * a_weights_0[3];
mat4 world = u_MMatrix * skinMatrix;
gl_Position = u_PMatrix * u_VMatrix * world * a_position;
v_normal = mat3(world) * a_normal;
v_uv = a_uv;
}`
var fs =
`precision mediump float;        //精度
varying vec3 v_normal;          //法线
uniform vec4 u_diffuse;         //漫反射
uniform sampler2D u_texture;   //骨骼矩阵纹理
uniform vec3 u_lightDirection;  //光的方向
varying vec2 v_uv;
void main () {
vec3 normal = normalize(v_normal);
float light = dot(u_lightDirection,normal) * .5 + .5;
vec4 color = texture2D(u_texture,normalize(v_uv)); 
gl_FragColor = color+vec4(u_diffuse.rgb * light, u_diffuse.a);
}`

/**
 * 一个蒙皮渲染器负责管理一个皮肤节点，一个皮肤节点下面有若干个骨骼节点，
 * 这个皮肤节点就用这若干个骨骼节点来造一张骨骼纹理
 */

//皮肤渲染
export class Skeleton_SkinRenderer {
    /**
     * 网格的绘制信息
     * 主要包含顶点数据
     */
    private mesh:any;
    private skin: Skeleton_Skin;
    private skinProgramInfo: ShaderData;
    constructor(mesh, skin:Skeleton_Skin, gl) {
        this.mesh = mesh;
        this.skin = skin;
        this.skinProgramInfo = G_ShaderFactory.createProgramInfo(skinVS, fs);
    }
    /**
     *  
     * @param worldMatrix 当前3d模型的世界矩阵
     * @param sharedUniforms 
     */
    render(worldMatrix:Float32Array, sharedUniforms) {
        this.skin.update();
        for (const primitive of this.mesh.primitives) {
            var renderData = RenderDataPool.get(RenderDataType.Spine) as SpineRenderData;
            renderData._shaderData = this.skinProgramInfo;
            renderData._uniformData.push({
                u_MMatrix: worldMatrix,
                u_texture: this.skin._texture._glID,
                u_jointTexture: this.skin.jointTexture._glID,
                u_numJoints: this.skin.jointNodes.length,
            });
            renderData._projKey = "u_PMatrix";
            renderData._viewKey = "u_VMatrix";
            renderData._uniformData.push(primitive.material.uniforms);
            renderData._uniformData.push(sharedUniforms);
            renderData._attrbufferData = primitive.bufferInfo;
            Device.Instance.collectData(renderData);
        }
    }
}