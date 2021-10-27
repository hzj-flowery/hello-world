
import { G_BufferManager } from "../base/buffer/BufferManager";
import { SY } from "../base/Sprite";
import { syRender } from "../data/RenderData";
import { StateString, StateValueMap } from "../gfx/State";
import { syGL } from "../gfx/syGLEnums";


export default class CustomTextureCube extends SY.SpriteBase {
    constructor() {
        super();
    }
    protected onInit(): void {
        var positions =
            [
                -1, -1, -1,     //左下后
                -1, 1, -1,      //左上后   //背面左下三角形
                1, -1, -1,      //右下后
                                                //背面是个矩形 竖着放 斜角切开
                -1, 1, -1,      //左上后
                1, 1, -1,       //右上后   //背面右上三角形
                1, -1, -1,      //右下后

                -1, -1, 1,      //左下前
                1, -1, 1,       //右下前   //前面左下三角形
                -1, 1, 1,       //左上前
                                                //前面是个矩形 竖着放 斜角切开
                -1, 1, 1,       //左上前
                1, -1, 1,       //右下前   //前面右上三角形
                1, 1, 1,        //右上前

                -1, 1, -1,      //左上后
                -1, 1, 1,       //左上前    //上面左后三角形
                1, 1, -1,       //右上后
                                                 //上面是个矩形 平铺  斜角切开（/）
                -1, 1, 1,       //左上前
                1, 1, 1,        //右上前     //上面右前三角形
                1, 1, -1,       //右上后

                -1, -1, -1,     //左下后
                1, -1, -1,      //右下后     //下面左后三角形
                -1, -1, 1,      //左下前
                                                  //下面是个矩形 平铺 斜角切开（/）
                -1, -1, 1,      //左下前
                1, -1, -1,      //右下后     //下面右前三角形
                1, -1, 1,       //右下前

                -1, -1, -1,     //左下后
                -1, -1, 1,      //左下前      //左面下后三角形
                -1, 1, -1,      //左上后
                                                   //左面是个矩形 面朝左右 斜角切开
                -1, -1, 1,      //左下前
                -1, 1, 1,       //左上前      //左面上前三角形
                -1, 1, -1,      //左上后

                1, -1, -1,      //右下后  
                1, 1, -1,       //右上后      //右面下后三角形 
                1, -1, 1,       //右下前
                                                   //右面是个矩形 面朝左右 斜角切开
                1, -1, 1,       //右下前
                1, 1, -1,       //右上后      //右面上前三角形
                1, 1, 1,        //右上前

            ];
        var uvs = [
            0, 0,
            0, 1,
            1, 0,
            0, 1,    //背
            1, 1,
            1, 0,

            0, 0,    //左下前
            0, 1,    //右下前
            1, 0,    //左上前
            1, 0,    //左上前
            0, 1,    //右下前
            1, 1,    //右上前

            0, 0,
            0, 1,
            1, 0,
            0, 1,
            1, 1,
            1, 0,

            0, 0,
            0, 1,
            1, 0,
            1, 0,
            0, 1,
            1, 1,

            0, 0,
            0, 1,
            1, 0,
            0, 1,
            1, 1,
            1, 0,

            0, 0,
            0, 1,
            1, 0,
            1, 0,
            0, 1,
            1, 1,
        ]

        G_BufferManager.createBuffer(SY.GLID_TYPE.VERTEX,this.materialId,positions, 3)
        G_BufferManager.createBuffer(SY.GLID_TYPE.UV,this.materialId,uvs, 2);
        
        this.pushPassContent(syRender.ShaderType.Sprite,[
            [StateString.primitiveType,StateValueMap.primitiveType.PT_TRIANGLES]
        ])
    }
}