import { glMatrix } from "../Matrix";
import { BufferAttribsData, ShaderData } from "../renderer/shader/Shader";
import { G_ShaderFactory } from "../renderer/shader/ShaderFactory";

/**
 * 
 */
export class Graphic {
    constructor(gl) {
        this.gl = gl;
        this.init();
    }
    private gl: WebGLRenderingContext;
    private vert =
        'attribute vec4 a_position;' +
        'attribute vec4 a_color;' +
        'uniform mat4 u_worldViewProjection;' +
        'varying vec4 v_color;' +
        'void main() {' +
        'gl_Position = u_worldViewProjection * a_position;' +
        'gl_PointSize = 5.0;' +
        'v_color = a_color;' +
        '}'

    private frag =
        'precision mediump float;' +
        'uniform vec4 u_color;' +
        'varying vec4 v_color;' +
        'void main() {' +
        'gl_FragColor = u_color * v_color;' +
        '}'




    private _coordinateArrays = {
        position: [
            0, 0, 0,         //原点0   //0
            1, 0, 0,   //x   //1
            0, 1, 0,   //y   //2
            0, 0, 1,    //z  //3
            0, 0, 0,         //原点1  //4
            0, 0, 0,         //原点2  //5
            0, 0, 0,         //原点3  //6

            1.2, 0, 0,   //x轴延申    //7
            0, 1.2, 0,   //y轴延申    //8
            0, 0, 1.2,    //z轴延申   //9

            0, 0, 0, 0,
            0, 1, 1, 0
        ],
        color: [
            0, 0, 0, 1,       //  0 原点
            1, 0, 0, 1,       //  1  x     red    红色
            0, 1, 0, 1,       //  2  y     green  绿色
            0, 0, 1, 1,       //  3  z     blue   蓝色
            1, 0, 0, 1,       //  4  原点x     red
            0, 1, 0, 1,       //  5  原点y     green
            0, 0, 1, 1,        // 6  原点z     blue
            0, 0, 0, 1,        // 9
            0, 0, 0, 1,        // 10
            0, 0, 0, 1,        // 11
            1, 1, 0, 0,        // 12
            1, 1, 0, 0         // 13
        ],
        indices: [
            4, 1, 5, 2, 6, 3, 1, 7, 2, 8, 3, 9, 10, 11 //11 12 13
        ]
    }
    private _pointArrays = {
        position: [
            0, 0, 0,
            1, 0, 0,   //3
            0, 1, 0,   //7  
            0, 0, 1    //11
        ],
        color: [
            0, 0, 0, 1,
            1, 0, 0, 1,
            0, 1, 0, 1,
            0, 0, 1, 1
        ]
    }

    private init(): void {
        let scale = 6;
        for (var j = 0; j < this._coordinateArrays.position.length; j++) {
            this._coordinateArrays.position[j] = this._coordinateArrays.position[j] * scale;
        }

        this._pointBufferInfor = G_ShaderFactory.createBufferInfoFromArrays(this._pointArrays);

        //创建shader
        this._programInfor = G_ShaderFactory.createProgramInfo(this.vert, this.frag);
        //创建attribuffer
        this._coordinateBufferInfo = G_ShaderFactory.createBufferInfoFromArrays(this._coordinateArrays);
    }
    private _programInfor: ShaderData;
    private _coordinateBufferInfo: BufferAttribsData;
    private _pointBufferInfor: BufferAttribsData;
    /**
     * 绘制世界坐标系
     * 你想在上面位置来观察世界坐标系
     * @param proj 投影矩阵
     * @param camera 相机矩阵
     * @param world 世界矩阵  当前模型中的点需要乘以这个矩阵转换到世界坐标系下
     * 
     */
    public drawLine(proj: Float32Array, camera: Float32Array, world = glMatrix.mat4.identity(null)): void {
        var view = glMatrix.mat4.invert(null, camera)
        let pv = glMatrix.mat4.multiply(null, proj, view);
        glMatrix.mat4.multiply(pv, pv, world);
        this.gl.useProgram(this._programInfor.spGlID);
        G_ShaderFactory.setBuffersAndAttributes(this._programInfor.attrSetters, this._coordinateBufferInfo);
        G_ShaderFactory.setUniforms(this._programInfor.uniSetters, { u_worldViewProjection: pv });
        G_ShaderFactory.setUniforms(this._programInfor.uniSetters, { u_color: [1, 1, 1, 1] });
        G_ShaderFactory.drawBufferInfo(this._coordinateBufferInfo, this.gl.LINES);
    }

    private updatePoint(): void {
        var change = 0.1;
        this._pointArrays.position[3] = this._pointArrays.position[3] + change;//眼睛的位置
        this._pointArrays.position[7] = this._pointArrays.position[7] + change;
        this._pointArrays.position[11] = this._pointArrays.position[11] + change;
        this._pointBufferInfor = G_ShaderFactory.createBufferInfoFromArrays(this._pointArrays);
    }

    public drawPoint(proj: Float32Array, camera: Float32Array, world = glMatrix.mat4.identity(null)): void {
        this.updatePoint();
        var view = glMatrix.mat4.invert(null, camera)
        let vp = glMatrix.mat4.multiply(null, proj, view);
        glMatrix.mat4.multiply(vp, vp, world);

        this.gl.useProgram(this._programInfor.spGlID);
        G_ShaderFactory.setBuffersAndAttributes(this._programInfor.attrSetters, this._pointBufferInfor);
        G_ShaderFactory.setUniforms(this._programInfor.uniSetters, { u_worldViewProjection: vp });
        G_ShaderFactory.setUniforms(this._programInfor.uniSetters, { u_color: [1, 1, 1, 1] });
        G_ShaderFactory.drawBufferInfo(this._pointBufferInfor, this.gl.POINTS);

    }

}