import Device from "../../../Device";
import { glMatrix } from "../../../math/Matrix";
import {syRender} from "../../data/RenderData";
import { ShaderData } from "../../shader/Shader";
import { G_ShaderFactory } from "../../shader/ShaderFactory";
import { Skeleton_Node } from "./Skeleton_Node";

var meshVS =
   `attribute vec4 a_position;
   attribute vec3 a_normal;
   uniform mat4 u_projection;
   uniform mat4 u_view;
   uniform mat4 u_world;
   varying vec3 v_normal;
   void main() {
   gl_Position = u_projection * u_view * u_world * a_position;
   v_normal = mat3(u_world) * a_normal;
   }`

var fs =
  ` precision mediump float;        //精度
   varying vec3 v_normal;          //法线
   uniform vec4 u_diffuse;         //漫反射
   uniform sampler2D u_texture;   //骨骼矩阵纹理
   uniform vec3 u_spotDirection;  //光的方向
   varying vec2 a_texcoord;
   void main () {
   vec3 normal = normalize(v_normal);
   float light = dot(u_spotDirection,normal) * .5 + .5;
   vec4 color = texture2D(u_texture,normalize(a_texcoord)); 
   gl_FragColor = color+vec4(u_diffuse.rgb * light, u_diffuse.a);
   }`

    
//网格渲染
export class Skeleton_MeshRenderer {
    private mesh;
    private gl: WebGLRenderingContext;
    private meshProgramInfo: ShaderData;
    private _temWolrdMatrix:Float32Array;//世界矩阵
    constructor(mesh, gl: WebGLRenderingContext) {
        this.mesh = mesh;
        this.gl = gl;
        this.meshProgramInfo = G_ShaderFactory.createProgramInfo(meshVS, fs);
        this._temWolrdMatrix = glMatrix.mat4.identity(null);
    }
    public render(node: Skeleton_Node,worldMatrix:Float32Array,sharedUniforms) {
        glMatrix.mat4.mul(this._temWolrdMatrix,worldMatrix,node.worldMatrix);
        for (const primitive of this.mesh.primitives) {
            var renderData = syRender.DataPool.get(syRender.DataType.Normal) as syRender.NormalData;
            renderData._shaderData = this.meshProgramInfo;
            renderData._attrbufferData = primitive.bufferInfo;
            renderData._uniformData.push({u_world: this._temWolrdMatrix});
            renderData._uniformData.push(primitive.material.uniforms);
            renderData._uniformData.push(sharedUniforms);
            Device.Instance.collectData(renderData);
        }
    }
}