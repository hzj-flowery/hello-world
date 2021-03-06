import { glMatrix } from "../../math/Matrix";
import { SY } from "../base/Sprite";
import { syGL } from "../gfx/syGLEnums";
import { G_LightCenter } from "./LightCenter";
    ``

export class  LineFrumstum extends SY.SpriteBase {
    constructor() {
        super();
        this._glPrimitiveType = syGL.PrimitiveType.LINES;
    }
    private _lightWorldMatrix: Float32Array;
    private _lightProjectInverseMatrix: Float32Array;
    onInit():void{
        let position = [
            -1, -1, -1,
            1, -1, -1,
            -1, 1, -1,
            1, 1, -1,
            -1, -1, 1,
            1, -1, 1,
            -1, 1, 1,
            1, 1, 1,
            0,0,-1,
            0,0,1,
        ];
        let indices = [
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
            8,9,
        ];
        this.createVertexsBuffer(position,3);
        this.createIndexsBuffer(indices);
        this._lightWorldMatrix = glMatrix.mat4.identity(null);
        this._lightProjectInverseMatrix = glMatrix.mat4.identity(null);
    }
    protected collectRenderData(time):void{
        let lightData = G_LightCenter.updateLightCameraData();
        glMatrix.mat4.invert(this._lightProjectInverseMatrix, lightData.project)
        glMatrix.mat4.multiply(this._lightWorldMatrix, lightData.mat, this._lightProjectInverseMatrix);
        this.createCustomMatrix(this._lightWorldMatrix);
         super.collectRenderData(time);
    }
}