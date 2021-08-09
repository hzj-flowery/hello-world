import { glMatrix } from "../../math/Matrix";
import { SY } from "../base/Sprite";
import CustomTextureData from "../data/CustomTextureData";
import { syRender } from "../data/RenderData";
import { syPrimitives } from "../shader/Primitives";

export class Plane extends SY.SpriteBase{
    constructor(planeWidth:number,planeHeight:number){
        super();
        this._planeHeight = planeHeight;
        this._planeWidth = planeWidth;
        this.onLocalInit();
    }
    private _planeWidth:number = 20;//地形宽度
    private _planeHeight:number = 20;//地形高度
    private _subdivisionAcross:number = 1;//横排细分
    private _subdivisionDown:number = 1;//竖排细分
    private _widthCount:number = 20;
    private _heightCount:number = 20;

    private _customTempMatrix: Float32Array;
    private _tempMatrix: Float32Array;

    onLocalInit(){
        let vertexData = syPrimitives.createPlaneVertices( 
            this._planeWidth,  // width
            this._planeHeight,  // height
            this._subdivisionAcross,   // subdivisions across
            this._subdivisionDown,   // subdivisions down
            );
        this.createIndexsBuffer(vertexData.indices);
        this.createNormalsBuffer(vertexData.normal, 3);
        this.createUVsBuffer(vertexData.texcoord, 2);
        this.createVertexsBuffer(vertexData.position, 3);

        this._customTempMatrix = glMatrix.mat4.identity(null);
        this._tempMatrix = glMatrix.mat4.identity(null);
    }

    protected onInitFinish():void{
        console.log(this.shader);
    }

    protected collectRenderData(time: number) {
        glMatrix.mat4.copy(this._tempMatrix, this._customTempMatrix)
        this.createCustomMatrix(this._tempMatrix);
        super.collectRenderData(time)
      }
    
      /**
       * 更新pv矩阵
       * @param proj 
       * @param view 
       */
      public onBindGPUBufferDataBefore(rd:syRender.BaseData,proj: Float32Array, view: Float32Array): void {

        glMatrix.mat4.copy(this._customTempMatrix, rd.light.projectionMatrix);
        glMatrix.mat4.multiply(this._customTempMatrix, this._customTempMatrix, glMatrix.mat4.invert(null, rd.light.viewMatrix));
      }

    public setCellCounts(widthCount:number,heightCount:number):void{
        this._widthCount = widthCount;
        this._heightCount = heightCount;
        this.spriteFrame = CustomTextureData.getBoardData(this._widthCount,this._heightCount,[0xFF,0xCC]);
    }
}


