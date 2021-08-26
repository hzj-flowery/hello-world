import { glMatrix } from "../../math/Matrix";
import { SY } from "../base/Sprite";
import CustomTextureData from "../data/CustomTextureData";
import { syRender } from "../data/RenderData";
import { G_LightCenter } from "../light/LightCenter";
import { syPrimitives } from "../shader/Primitives";

export class Plane extends SY.ShadowSprite{
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
        
        this.color = [0.5, 0.5, 1, 1];
    }

    protected onInitFinish():void{
        console.log(this.shader);
    }

    public setCellCounts(widthCount:number,heightCount:number):void{
        this._widthCount = widthCount;
        this._heightCount = heightCount;
        this.spriteFrame = CustomTextureData.getBoardData(this._widthCount,this._heightCount,[0xFF,0xCC]);
    }
}


