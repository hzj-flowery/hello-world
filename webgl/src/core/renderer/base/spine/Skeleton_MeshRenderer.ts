import Device from "../../../Device";
import { glMatrix } from "../../../math/Matrix";
import {syRender} from "../../data/RenderData";
import { Pass } from "../../shader/Pass";
import { ShaderProgram } from "../../shader/Shader";
import { G_ShaderFactory } from "../../shader/ShaderFactory";
import { Skeleton_Node } from "./Skeleton_Node";
 
//网格渲染
export class Skeleton_MeshRenderer {
    private mesh;
    private gl: WebGLRenderingContext;
    private _temWolrdMatrix:Float32Array;//世界矩阵
    constructor(mesh, gl: WebGLRenderingContext) {
        this.mesh = mesh;
        this.gl = gl;
        this._temWolrdMatrix = glMatrix.mat4.identity(null);
    }
    public render(node: Skeleton_Node,worldMatrix:Float32Array,sharedUniforms,pass:Pass) {
        glMatrix.mat4.mul(this._temWolrdMatrix,worldMatrix,node.worldMatrix);
        for (const primitive of this.mesh.primitives) {
            var renderData = syRender.DataPool.get(syRender.QueueItemType.Normal) as syRender.QueueItemData;
            renderData._shaderData = pass.program;
            renderData.pass = pass;
            renderData._attrbufferData = primitive.bufferInfo;
            renderData._uniformData.push({u_world: this._temWolrdMatrix});
            renderData._uniformData.push(primitive.material.uniforms);
            renderData._uniformData.push(sharedUniforms);
            Device.Instance.collectData(renderData);
        }
    }
}