import Device from "../../Device";
import { glMatrix } from "../../Matrix";
import { BufferAttribsData, ShaderData } from "../shader/Shader";
import { G_ShaderFactory } from "../shader/ShaderFactory";


let vertBase =
    `attribute vec4 a_position;
uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;
void main() {
gl_Position = u_projection * u_view * u_world * a_position;
}`
let fragBase =
    `precision mediump float;

//分解保存深度值
vec4 pack (float depth) {
    // 使用rgba 4字节共32位来存储z值,1个字节精度为1/256
    const vec4 bitShift = vec4(1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0);
    const vec4 bitMask = vec4(1.0/256.0, 1.0/256.0, 1.0/256.0, 0.0);
    // gl_FragCoord:片元的坐标,fract():返回数值的小数部分
    vec4 rgbaDepth = fract(depth * bitShift); //计算每个点的z值 
    rgbaDepth -= rgbaDepth.rgba * bitMask; // Cut off the value which do not fit in 8 bits
    return rgbaDepth;
}

void main() {
gl_FragColor = pack(gl_FragCoord.z);  //将深度值存在帧缓冲的颜色缓冲中 如果帧缓冲和窗口绑定 那么就显示出来 如果帧缓冲和纹理绑定就存储在纹理中
}`

class LightModel {
    constructor() {

    }
    private _colorProgramInfo: ShaderData;
    private _cubeLinesBufferInfo: BufferAttribsData;
    private gl: WebGLRenderingContext;
    public init() {
        this._colorProgramInfo = G_ShaderFactory.createProgramInfo(vertBase, fragBase);
        this.gl = Device.Instance.gl;

        this._cubeLinesBufferInfo = G_ShaderFactory.createBufferInfoFromArrays({
            position: [
                -1, -1, -1,
                1, -1, -1,
                -1, 1, -1,
                1, 1, -1,
                -1, -1, 1,
                1, -1, 1,
                -1, 1, 1,
                1, 1, 1,
            ],
            indices: [
                0, 1,
                1, 3,
                3, 2,
                2, 0,

                4, 5,
                5, 7,
                7, 6,
                6, 4,

                0, 4,
                1, 5,
                3, 7,
                2, 6,
            ],
        });
    }

    /**
 * 绘制光源
 * @param projectionMatrix 
 * @param cameraMatrix 
 * @param worldMatrix 
 */
    public drawFrustum(projectionMatrix, cameraMatrix, worldMatrix) {
        var gl = this.gl;
        const viewMatrix = glMatrix.mat4.invert(null, cameraMatrix);
        gl.useProgram(this._colorProgramInfo.spGlID);
        // Setup all the needed attributes.
        G_ShaderFactory.setBuffersAndAttributes(this._colorProgramInfo.attrSetters, this._cubeLinesBufferInfo);
        // scale the cube in Z so it's really long
        // to represent the texture is being projected to
        // infinity
        // Set the uniforms we just computed
        G_ShaderFactory.setUniforms(this._colorProgramInfo.uniSetters, {
            u_view: viewMatrix,
            u_projection: projectionMatrix,
            u_world: worldMatrix,
        });
        // calls gl.drawArrays or gl.drawElements
        G_ShaderFactory.drawBufferInfo(this._cubeLinesBufferInfo, gl.LINES);
    }

}

export var G_LightModel = new LightModel();