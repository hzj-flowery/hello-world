import { SY } from "../base/Sprite";
import { glprimitive_type } from "../gfx/GLEnums";

var vertexshader3d =
    'attribute vec4 a_position;' +
    'attribute vec4 a_color;' +
    'attribute mat4 a_Matrix;' +

    'uniform mat4 u_MMatrix;' +
    'uniform mat4 u_VMatrix;' +
    'uniform mat4 u_PMatrix;' +

    'varying vec4 v_color;' +
    'void main() {' +
    'gl_Position =u_PMatrix*u_VMatrix*u_MMatrix* a_Matrix * a_position;' +
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
        this._glPrimitiveType = glprimitive_type.TRIANGLE_STRIP;
    }
    private _colorLoc: any;
    private _matrixLoc: any;
    private _posArray:Array<Array<number>>;
    protected onInit(): void {
        this.setContentSize(100, 200);

        this._vertStr = vertexshader3d;
        this._fragStr = fragmentshader3d;
        
        this.numInstances = 1;
        this._renderData._isDrawInstanced = true;
        this._renderData._drawInstancedVertNums = 4;
        this._renderData._drawInstancedNums = this.numInstances;

        

        this.produceRandomPosArray();
        
        
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
        this.createNodeCustomMatrixBuffer([], 4, this.matrixData.byteLength);
        var colorData = [];
        for (var j = 0; j < this.numInstances; j++) {
            var res = this.getRandowColor();
            colorData.push(res[0]);
            colorData.push(res[1]);
            colorData.push(res[2]);
            colorData.push(res[3]);
        }
        this.createNodeVertColorBuffer(colorData, 4);
    }
    private produceRandomPosArray():void{
        this._posArray = [];
        for(let j = 0;j<this.numInstances;j++)
        {
            let temp1 = Math.random();
            let temp2 = Math.random();
            let temp3 = Math.random();
            this._posArray[j] = [];
            this._posArray[j] = [-0.5*temp1 + j * 0.025,temp2,0];
        }
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
    private matrixData;
    private numInstances;
    protected onShader():void{
        this._colorLoc = this._shader.getCustomAttributeLocation("a_color");
        this._matrixLoc = this._shader.getCustomAttributeLocation('a_Matrix');
    }
    public onDrawBefore(time: number) {
        time *= 0.001; // seconds
        // update all the matrices
        this.matrices.forEach((mat, ndx) => {
            /**
             * 构造一个节点空间坐标系
             */
            this._glMatrix.mat4.identity(mat);
            this._glMatrix.mat4.translate(mat, mat, this._posArray[ndx]);
            this._glMatrix.mat4.rotateZ(mat, mat, time * (0.1 + 0.1 * ndx));
        });
        //更新缓冲区数据
        this.getBuffer(SY.GLID_TYPE.MATRIX).updateSubData(this.matrixData);

        let gl = this.gl;
        for (let i = 0; i < 4; ++i) {
            const loc = this._matrixLoc + i;
            // this line says this attribute only changes for each 1 instance
            gl.vertexAttribDivisor(loc, 1);
        }
        // this line says this attribute only changes for each 1 instance
        gl.vertexAttribDivisor(this._colorLoc, 1);

    }
    public onDrawAfter(): void {
        let gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.vertexAttribDivisor(this._colorLoc, 0);
        for (let i = 0; i < 4; ++i) {
            const loc = this._matrixLoc + i;
            gl.vertexAttribDivisor(loc, 0);
        }
        gl.disableVertexAttribArray(this._colorLoc);
        gl.disableVertexAttribArray(this._matrixLoc);
    }

}