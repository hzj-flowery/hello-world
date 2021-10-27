
import { glMatrix } from "../../math/Matrix";
import { G_BufferManager } from "../base/buffer/BufferManager";
import { SY } from "../base/Sprite";
import { syRender } from "../data/RenderData";
import { StateString, StateValueMap } from "../gfx/State";
import { syGL } from "../gfx/syGLEnums";
import { Pass } from "../shader/Pass";

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
        G_BufferManager.createBuffer(SY.GLID_TYPE.INDEX,this.materialId,VertData.indices,1);
        this._lightWorldMatrix = glMatrix.mat4.identity(null);
        this._lightProjectInverseMatrix = glMatrix.mat4.identity(null);
        this._tempMatrix = glMatrix.mat4.identity(null);
        this.setColor(255,0,0,255);

        this.pushPassContent(syRender.ShaderType.Sprite,[
            [StateString.primitiveType,StateValueMap.primitiveType.PT_LINES]
        ],[
            [syRender.PassCustomKey.DefineUse,syRender.ShaderDefineValue.SY_USE_MAT],
            [syRender.PassCustomKey.DefineUse,syRender.ShaderDefineValue.SY_USE_ADD_POSITION_SPACE],
            [syRender.PassCustomKey.DefineUse,syRender.ShaderDefineValue.SY_USE_TEXTURE,syRender.ShaderDefineValue.SY_USE_REMOVE_DEFINE]
        ]);

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