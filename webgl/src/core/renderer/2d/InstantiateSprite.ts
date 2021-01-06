import { SY } from "../base/Sprite";
import { pseudoRandom } from "../../value-types/utils";
import Device from "../../Device";
import GameMainCamera from "../camera/GameMainCamera";
import enums from "../camera/enums";

var vertexshader3d =
    'attribute vec4 a_position;' +
    'attribute vec4 a_color;' +
    'attribute mat4 a_Matrix;' +

    'uniform mat4 u_MVMatrix;' +
    'uniform mat4 u_PMatrix;' +

    'varying vec4 v_color;' +
    'void main() {' +
    'gl_Position =u_PMatrix*u_MVMatrix* a_Matrix * a_position;' +
    'v_color = a_color;' +
    '}'
var fragmentshader3d =
    'precision mediump float;' +
    'varying vec4 v_color;' +
    'void main() {' +
    'gl_FragColor = v_color;' +
    '}'

export default class InstantiateSprite extends SY.Sprite2D {
    constructor() {
        super();
    }
    private _colorLoc: any;
    private _matrixLoc: any;

    protected onInit(): void {
        this.setContentSize(100,200);
        this.setShader(vertexshader3d, fragmentshader3d);

        this._colorLoc = this._shader.getCustomAttributeLocation("a_color");
        this._matrixLoc = this._shader.getCustomAttributeLocation('a_Matrix');
        var gl = this.gl;
        // setup matrixes, one per instance
        this.numInstances = 30;
        // make a typed array with one view per matrix
        this.matrixData = new Float32Array(this.numInstances * 16);
        this.matrices = [];
        for (let i = 0; i < this.numInstances; ++i) {
            const byteOffsetToMatrix = i * 16 * 4;//每一位是4个字节 4行4列
            const numFloatsForView = 16;
            this.matrices.push(new Float32Array(
                this.matrixData.buffer,
                byteOffsetToMatrix,
                numFloatsForView));
        }
        // this.matrixBuffer = gl.createBuffer();
        // this.gl.bindBuffer(gl.ARRAY_BUFFER, this.matrixBuffer);
        // // just allocate the buffer
        // this.gl.bufferData(gl.ARRAY_BUFFER, this.matrixData.byteLength, gl.DYNAMIC_DRAW);

        this.createNodeCustomMatrixBuffer([],16,this.matrixData.byteLength);


        var colorData = [];
        for (var j = 0; j < this.numInstances; j++) {
            var res = this.getRandowColor();
            colorData.push(res[0]);
            colorData.push(res[1]);
            colorData.push(res[2]);
            colorData.push(res[3]);
        }
        this.createNodeCustomColorBuffer(colorData,4);

    }
    private getRandowColor() {
        let ColorTest =
            [1, 0, 0, 1,  // red
                0, 1, 0, 1,  // green
                0, 0, 1, 1,  // blue
                1, 0, 1, 1,  // magenta
                0, 1, 1, 1,  // cyan
            ]
        var p = Math.floor(Math.random() * 10 / 2);
        if (p >= 5) p = 4;
        var data = ColorTest.slice(p * 4, p * 4 + 4);
        return data;
    }
    private matrices;
    // private matrixBuffer;
    private matrixData;
    private numInstances;
    public draw(time: number): void {
        if (Device.Instance.getContextType() == "webgl2") {
            this.drawWebgl2(time);
        }
        else {
            this.drawWebgl1(time);
        }
    }
    public drawWebgl2(time): void {
        var gl = this.gl;
        const numVertices = 4;
        time *= 0.001; // seconds

        this._shader.active();
        this._shader.setUseVertexAttribPointerForVertex(this.getGLID(SY.GLID_TYPE.VERTEX), this.getBufferItemSize(SY.GLID_TYPE.VERTEX));

        var newMV = this._glMatrix.mat4.create();
        var v = GameMainCamera.instance.getCamera(this._cameraType).getInversModelMatrix();
        var m = this.modelMatrix;
        this._glMatrix.mat4.mul(newMV, v, m)
        this._shader.setUseModelViewMatrix(newMV);
        var pMatix = GameMainCamera.instance.getCamera(this._cameraType).getProjectionMatrix();
        this._shader.setUseProjectionMatrix(pMatix);

        // update all the matrices
        this.matrices.forEach((mat, ndx) => {
            /**
             * 构造一个节点空间坐标系
             */
            this._glMatrix.mat4.identity(mat);

            if (Math.random() > 0.5)
                this._glMatrix.mat4.translate(mat, mat, [-0.5 + ndx * 0.025, 0, 0]);
            else
                this._glMatrix.mat4.translate(mat, mat, [-0.5, -0.5 + ndx * 0.025, 0]);

            this._glMatrix.mat4.rotateZ(mat, mat, time * (0.1 + 0.1 * ndx));
        });
        // upload the new matrix data
        // this.gl.bindBuffer(gl.ARRAY_BUFFER, this.matrixBuffer);
        // this.gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.matrixData);
        
        //更新缓冲区数据
        this.getBuffer(SY.GLID_TYPE.MATRIX).updateSubData(this.matrixData)

        // set all 4 attributes for matrix
        // 解析 
        // 每一个矩阵的大小是四行四列，矩阵中元素的类型是gl.FLOAT,即元素占用四个字节
        // 所以一个矩阵的占用字节数为4*4*4
        // 关于矩阵在shader中的位置计算，可以把矩阵想象成一个一维数组，元素类型是vec4
        // matrixLoc:表示矩阵的第1行在shader中的位置
        // matrixLoc+1:表示矩阵的第2行在shader中的位置
        // matrixLoc+2:表示矩阵的第3行在shader中的位置
        // matrixLoc+3:表示矩阵的第4行在shader中的位置    
        const bytesPerMatrix = 4 * 16;
        for (let i = 0; i < 4; ++i) {
            const loc = this._matrixLoc + i;
            gl.enableVertexAttribArray(loc);
            // note the stride and offset
            const offset = i * 16;  // 4 floats per row, 4 bytes per float
            gl.vertexAttribPointer(
                loc,              // location
                4,                // size (num values to pull from buffer per iteration)
                gl.FLOAT,         // type of data in buffer
                false,            // normalize
                bytesPerMatrix,   // stride, num bytes to advance to get to next set of values
                offset,           // offset in buffer
            );
            // this line says this attribute only changes for each 1 instance
            gl.vertexAttribDivisor(loc, 1);
        }

        this.getBuffer(SY.GLID_TYPE.MATRIX).updateSubData(this.matrixData)

        this._shader.setUseNodeCustomColor(this.getGLID(SY.GLID_TYPE.COLOR),this.getBufferItemSize(SY.GLID_TYPE.COLOR))

      
        // this line says this attribute only changes for each 1 instance
        gl.vertexAttribDivisor(this._colorLoc, 1);
        gl.drawArraysInstanced(
            gl.TRIANGLES,
            0,             // offset
            numVertices,   // num vertices per instance
            this.numInstances,  // num instances
        );

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.vertexAttribDivisor(this._colorLoc, 0);
        for (let i = 0; i < 4; ++i) {
            const loc = this._matrixLoc + i;
            gl.vertexAttribDivisor(loc, 0);
        }
        gl.disableVertexAttribArray(this._colorLoc);
        gl.disableVertexAttribArray(this._matrixLoc);

    }

    public drawWebgl1(time): void {

        var testgl = Device.Instance.getWebglContext();
        var gl = this.gl;
        const ext = gl.getExtension('ANGLE_instanced_arrays');
        if (!ext) {
            console.log("no support ANGLE_instanced_arrays");
            return;
        }
        const numVertices = 12;


        time *= 0.001; // seconds

        const colorLoc = this._shader.getCustomAttributeLocation("a_color");
        const matrixLoc = this._shader.getCustomAttributeLocation('a_Matrix');


        this._shader.active();
        this._shader.setUseVertexAttribPointerForVertex(this.getGLID(SY.GLID_TYPE.VERTEX), this.getBufferItemSize(SY.GLID_TYPE.VERTEX));
        this._shader.setUseModelViewMatrix(this.modelMatrix);
        var pMatrix = GameMainCamera.instance.getCamera(this._cameraType).getProjectionMatrix();
        this._shader.setUseProjectionMatrix(pMatrix);

        // update all the matrices
        this.matrices.forEach((mat, ndx) => {

            /**
             * 构造一个节点空间坐标系
             */
            this._glMatrix.mat4.identity(mat);

            if (Math.random() > 0.5)
                this._glMatrix.mat4.translate(mat, mat, [-0.5 + ndx * 0.025, 0, 0]);
            else
                this._glMatrix.mat4.translate(mat, mat, [-0.5, -0.5 + ndx * 0.025, 0]);

            this._glMatrix.mat4.rotateZ(mat, mat, time * (0.1 + 0.1 * ndx));
        });
        // upload the new matrix data
        // this.gl.bindBuffer(gl.ARRAY_BUFFER, this.matrixBuffer);
        this.gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.matrixData);
        // set all 4 attributes for matrix
        const bytesPerMatrix = 4 * 16;
        for (let i = 0; i < 4; ++i) {
            const loc = matrixLoc + i;
            gl.enableVertexAttribArray(loc);
            // note the stride and offset
            const offset = i * 16;  // 4 floats per row, 4 bytes per float
            gl.vertexAttribPointer(
                loc,              // location
                4,                // size (num values to pull from buffer per iteration)
                gl.FLOAT,         // type of data in buffer
                false,            // normalize
                bytesPerMatrix,   // stride, num bytes to advance to get to next set of values
                offset,           // offset in buffer
            );
            // this line says this attribute only changes for each 1 instance
            ext.vertexAttribDivisorANGLE(loc, 1);
        }

        this._shader.setUseNodeCustomColor(this.getGLID(SY.GLID_TYPE.COLOR),this.getBufferItemSize(SY.GLID_TYPE.COLOR));

        // this line says this attribute only changes for each 1 instance
        ext.vertexAttribDivisorANGLE(colorLoc, 1);

        ext.drawArraysInstancedANGLE(
            gl.TRIANGLES,
            0,             // offset
            numVertices,   // num vertices per instance
            this.numInstances,  // num instances
        );

        ext.vertexAttribDivisorANGLE(this._colorLoc, 0);
        for (let i = 0; i < 4; ++i) {
            const loc = this._matrixLoc + i;
            ext.vertexAttribDivisorANGLE(loc, 0);
        }

    }


}