import { SY } from "../base/Sprite";
import CustomTextureData from "../data/CustomTextureData";
import { syPrimitives } from "../shader/Primitives";

export class Plane extends SY.SpriteBase{
    constructor(planeWidth:number,planeHeight:number,subdivisionAcross:number=1,subdivisionDown:number=1){
        super();
        this._planeHeight = planeHeight;
        this._planeWidth = planeWidth;
        this._subdivisionAcross = subdivisionAcross;
        this._subdivisionDown = subdivisionDown;
        this.onLocalInit();
    }
    private _planeWidth:number = 20;//地形宽度
    private _planeHeight:number = 20;//地形高度
    private _subdivisionAcross:number = 1;//横排细分
    private _subdivisionDown:number = 1;//竖排细分
    private _widthCount:number = 20;
    private _heightCount:number = 20;
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
    }

    public setCellCounts(widthCount:number,heightCount:number):void{
        this._widthCount = widthCount;
        this._heightCount = heightCount;
        this.spriteFrame = CustomTextureData.getBoardData(this._widthCount,this._heightCount);
    }
}