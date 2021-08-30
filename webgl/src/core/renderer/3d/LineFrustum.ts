
import { glMatrix } from "../../math/Matrix";
import { SY } from "../base/Sprite";
import { syRender } from "../data/RenderData";
import { syGL } from "../gfx/syGLEnums";

/**
 * 绘制的顶点数据
 */
var VertData = {
    position: [
        -1, -1, -1,
        1, -1, -1,
        -1, 1, -1,
        1, 1, -1,
        -1, -1, 1,
        1, -1, 1,
        -1, 1, 1,
        1, 1, 1,
        0, 0, -1,
        0, 0, 1,
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
        8, 9,
    ],
}

export class LineFrustum extends SY.SpriteBasePolygon {
    private _lightWorldMatrix: Float32Array;
    private _lightProjectInverseMatrix: Float32Array;
    private _tempMatrix:Float32Array;
    onInit(): void {
        this._glPrimitiveType = syGL.PrimitiveType.LINES;
        this.createIndexsBuffer(VertData.indices);
        this._lightWorldMatrix = glMatrix.mat4.identity(null);
        this._lightProjectInverseMatrix = glMatrix.mat4.identity(null);
        this._tempMatrix = glMatrix.mat4.identity(null);
        this.color = [1.0,0.0,0.0,1.0];
        this._defineUse.SY_USE_MAT = 0.1;
        super.onInit();
        this.updatePositionData(VertData.position)
        
    }

    protected collectRenderData(time:number){
        glMatrix.mat4.copy(this._tempMatrix,this._lightWorldMatrix)
        this.createCustomMatrix(this._tempMatrix);
        super.collectRenderData(time)
    }
    
    /**
     * 更新pv矩阵
     * @param proj 
     * @param view 
     */
    public updateProjView(proj:Float32Array,view:Float32Array):void{
        glMatrix.mat4.invert(this._lightProjectInverseMatrix, proj)
        glMatrix.mat4.multiply(this._lightWorldMatrix, view, this._lightProjectInverseMatrix);
    }
}