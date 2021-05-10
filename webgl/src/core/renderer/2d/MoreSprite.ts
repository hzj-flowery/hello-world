import { SY } from "../base/Sprite";
import { pseudoRandom } from "../../value-types/utils";
import Device from "../../Device";
import GameMainCamera from "../camera/GameMainCamera";
import enums from "../camera/enums";

export default class MoreSprite extends SY.Sprite2D {
    constructor() {
        super();
    }
    private _colorLoc: any;
    private _matrixLoc: any;

    protected onInit(): void {
        this.setContentSize(100,200);
        this._colorLoc = this.shader.getCustomAttributeLocation("a_color");
        this._matrixLoc = this.shader.getCustomAttributeLocation('a_matrix');
        var gl = this.gl;
        // setup matrixes, one per instance
        this.numInstances = 3;
        // make a typed array with one view per matrix
        this.matrixData = new Float32Array(this.numInstances * 16);
        this.matrices = [];
        for (let i = 0; i < this.numInstances; ++i) {
            const byteOffsetToMatrix = i * 16 * 4;
            const numFloatsForView = 16;
            this.matrices.push(new Float32Array(
                this.matrixData.buffer,
                byteOffsetToMatrix,
                numFloatsForView));
        }
        this.matrixBuffer = gl.createBuffer();
        this.gl.bindBuffer(gl.ARRAY_BUFFER, this.matrixBuffer);
        // just allocate the buffer
        this.gl.bufferData(gl.ARRAY_BUFFER, this.matrixData.byteLength, gl.DYNAMIC_DRAW);


        // setup colors, one per instance
        this.colorBuffer = gl.createBuffer();
        this.gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);

        var colorData = [];
        for (var j = 0; j < this.numInstances; j++) {
            var res = this.getRandowColor();
            colorData.push(res[0]);
            colorData.push(res[1]);
            colorData.push(res[2]);
            colorData.push(res[3]);
        }
        this.gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);

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
    private matrixBuffer;
    private matrixData;
    private colorBuffer;
    private numInstances;
    public collectRenderData(time: number): void {
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

        this.shader.active();
        this.shader.setUseVertexAttribPointerForVertex(this.getGLID(SY.GLID_TYPE.VERTEX), this.getBufferItemSize(SY.GLID_TYPE.VERTEX));

        var newMV = this._glMatrix.mat4.create();
        var v = GameMainCamera.instance.getCamera(this._cameraType).getInversModelMatrix();
        var m = this.modelMatrix;
        this._glMatrix.mat4.mul(newMV, v, m)
        this.shader.setUseModelViewMatrix(newMV);
        var pMatix = GameMainCamera.instance.getCamera(this._cameraType).getProjectionMatrix();
        this.shader.setUseProjectionMatrix(pMatix);

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
        this.gl.bindBuffer(gl.ARRAY_BUFFER, this.matrixBuffer);
        this.gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.matrixData);
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

        // set attribute for color
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.enableVertexAttribArray(this._colorLoc);
        gl.vertexAttribPointer(this._colorLoc, 4, gl.FLOAT, false, 0, 0);
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

        const colorLoc = this.shader.getCustomAttributeLocation("a_color");
        const matrixLoc = this.shader.getCustomAttributeLocation('a_matrix');


        this.shader.active();
        this.shader.setUseVertexAttribPointerForVertex(this.getGLID(SY.GLID_TYPE.VERTEX), this.getBufferItemSize(SY.GLID_TYPE.VERTEX));
        this.shader.setUseModelViewMatrix(this.modelMatrix);
        var pMatrix = GameMainCamera.instance.getCamera(this._cameraType).getProjectionMatrix();
        this.shader.setUseProjectionMatrix(pMatrix);

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
        this.gl.bindBuffer(gl.ARRAY_BUFFER, this.matrixBuffer);
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

        // set attribute for color
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.enableVertexAttribArray(colorLoc);
        gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
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