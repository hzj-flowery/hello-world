import Device from "../../../Device";
import { RenderDataPool, RenderDataType, SpineRenderData } from "../../data/RenderData";
import { ShaderData } from "../../shader/Shader";
import { G_ShaderFactory } from "../../shader/ShaderFactory";
import { Skeleton_Node } from "./Skeleton_Node";
import { Skeleton_Skin } from "./Skeleton_Skin";


var skinVS =
    'attribute vec4 a_POSITION;' +  //顶点位置
    'attribute vec3 a_NORMAL;' +    //法线
    'attribute vec4 a_WEIGHTS_0;' + //权重
    'attribute vec4 a_JOINTS_0;' +
    'attribute vec2 a_TEXCOORD_0;' +
    'uniform mat4 u_projection;' +  //投影
    'uniform mat4 u_view;' +        //观察空间
    'uniform mat4 u_world;' +       //世界空间
    'uniform sampler2D u_jointTexture;' +   //骨骼矩阵纹理

    'uniform float u_numJoints;' +  //[6,7,8,9,10,11]
    'varying vec3 v_normal;' +
    'varying vec2 a_uv;' +
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
    'mat4 getBoneMatrix(float jointNdx) {' +
    'float v = (jointNdx + 0.5) / u_numJoints;' +       //算出行
    'return mat4(' +                                                 //s      
    'texture2D(u_jointTexture, vec2(((0.5 + 0.0) / 4.), v)),' +  //0.125 
    'texture2D(u_jointTexture, vec2(((0.5 + 1.0) / 4.), v)),' +  //0.375 
    'texture2D(u_jointTexture, vec2(((0.5 + 2.0) / 4.), v)),' +  //0.625 
    'texture2D(u_jointTexture, vec2(((0.5 + 3.0) / 4.), v)));' + //0.875 
    '}' +
    'void main() {' +
    'mat4 skinMatrix =   getBoneMatrix(a_JOINTS_0[0]) * a_WEIGHTS_0[0] +' +
    'getBoneMatrix(a_JOINTS_0[1]) * a_WEIGHTS_0[1] +' +
    'getBoneMatrix(a_JOINTS_0[2]) * a_WEIGHTS_0[2] +' +
    'getBoneMatrix(a_JOINTS_0[3]) * a_WEIGHTS_0[3];' +
    'mat4 world = u_world * skinMatrix;' +
    'gl_Position = u_projection * u_view * world * a_POSITION;' +
    'v_normal = mat3(world) * a_NORMAL;' +
    'a_uv = a_TEXCOORD_0;' +
    '}'
var fs =
    'precision mediump float;' +        //精度
    'varying vec3 v_normal;' +          //法线
    'uniform vec4 u_diffuse;' +         //漫反射
    'uniform sampler2D u_texCoord;' +   //骨骼矩阵纹理
    'uniform vec3 u_lightDirection;' +  //光的方向
    'varying vec2 a_uv;' +
    'void main () {' +
    'vec3 normal = normalize(v_normal);' +
    'float light = dot(u_lightDirection,normal) * .5 + .5;' +
    'vec4 color = texture2D(u_texCoord,normalize(a_uv)); ' +
    'gl_FragColor = color+vec4(u_diffuse.rgb * light, u_diffuse.a);' +
    '}'

//皮肤渲染
export class Skeleton_SkinRenderer {
    private mesh;
    private skin: Skeleton_Skin;
    private gl: WebGLRenderingContext;
    private skinProgramInfo: ShaderData;
    constructor(mesh, skin, gl) {
        this.mesh = mesh;
        this.skin = skin;
        this.gl = gl;
        this.skinProgramInfo = G_ShaderFactory.createProgramInfo(skinVS, fs);
    }
    render(node: Skeleton_Node, extViewLeftMatrix, sharedUniforms) {
        this.skin.update(node);
        for (const primitive of this.mesh.primitives) {
            var renderData = RenderDataPool.get(RenderDataType.Spine) as SpineRenderData;
            renderData._shaderData = this.skinProgramInfo;
            renderData._uniformData.push({
                u_world: node.worldMatrix,
                u_texCoord: this.skin._texture._glID,
                u_jointTexture: this.skin.jointTexture,
                u_numJoints: this.skin.joints.length,
            });
            renderData._extraViewLeftMatrix = extViewLeftMatrix;
            renderData._projKey = "u_projection";
            renderData._viewKey = "u_view";
            renderData._uniformData.push(primitive.material.uniforms);
            renderData._uniformData.push(sharedUniforms);
            renderData._attrbufferData = primitive.bufferInfo;
            Device.Instance.collectData(renderData);
        }
    }
}