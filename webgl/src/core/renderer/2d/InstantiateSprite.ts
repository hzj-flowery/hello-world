import LoaderManager from "../../LoaderManager";
import { G_DrawEngine } from "../base/DrawEngine";
import { SY } from "../base/Sprite";
import { syGL } from "../gfx/syGLEnums";

/**
 * 误区：
 * 实例化绘制的矩阵其实就是一个数组，里面包含了4个item,每个item都是一个vec4
 */

export default class InstantiateSprite extends SY.SpriteInstance {
    constructor() {
        super();
    }
    private _posArray: Array<Array<number>>;
    protected onInit(): void {
        super.onInit();
        this.setContentSize(100, 200);
        this.numInstances = 2;
        this.InstanceVertNums = 4;
        this.pushDivisor("a_color", false);
        this.pushDivisor("a_matrix", true);
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
        this.createVertMatrixBuffer([], 4, this.matrixData.byteLength);
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
    private produceRandomPosArray(): void {
        this._posArray = [];
        for (let j = 0; j < this.numInstances; j++) {
            let temp1 = Math.random();
            let temp2 = Math.random();
            let temp3 = Math.random();
            this._posArray[j] = [];
            this._posArray[j] = [-0.5 * temp1 + j * 0.025, temp2, 0];
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
        this.getBuffer(SY.GLID_TYPE.VERT_MATRIX).updateSubData(this.matrixData);
        super.onDrawBefore(time);
    }

}