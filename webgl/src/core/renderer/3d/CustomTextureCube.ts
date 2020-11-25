import { SY } from "../base/Sprite";
import { glprimitive_type } from "../gfx/GLEnums";
import { CubeData } from "../data/CubeData";

var vertextBaseCode =
    'attribute vec3 a_position;' +
    'attribute vec2 a_uv;' +

    'uniform mat4 u_MVMatrix;' +
    'uniform mat4 u_PMatrix;' +
    'varying vec2 vTextureCoordinates;' +

    'void main() {' +
    'gl_Position = u_PMatrix * u_MVMatrix * vec4(a_position, 1.0);' +
    'vTextureCoordinates = a_uv;' +
    '}'
//基础的shader的片段着色器
var fragBaseCode =
    'precision mediump float;' +

    'varying vec2 vTextureCoordinates;' +
    'uniform sampler2D u_texCoord;' +

    'void main() {' +
    'gl_FragColor = texture2D(u_texCoord, vTextureCoordinates);' +
    '}'

export default class CustomTextureCube extends SY.SpriteBase {
    constructor(gl) {
        super(gl);
    }
    protected onInit(): void {
        var positions =
            [
                -0.5, -0.5, -0.5,     //左下后
                -0.5, 0.5, -0.5,      //左上后   //背面左下三角形
                0.5, -0.5, -0.5,      //右下后
                                                //背面是个矩形 竖着放 斜角切开
                -0.5, 0.5, -0.5,      //左上后
                0.5, 0.5, -0.5,       //右上后   //背面右上三角形
                0.5, -0.5, -0.5,      //右下后

                -0.5, -0.5, 0.5,      //左下前
                0.5, -0.5, 0.5,       //右下前   //前面左下三角形
                -0.5, 0.5, 0.5,       //左上前
                                                //前面是个矩形 竖着放 斜角切开
                -0.5, 0.5, 0.5,       //左上前
                0.5, -0.5, 0.5,       //右下前   //前面右上三角形
                0.5, 0.5, 0.5,        //右上前

                -0.5, 0.5, -0.5,      //左上后
                -0.5, 0.5, 0.5,       //左上前    //上面左后三角形
                0.5, 0.5, -0.5,       //右上后
                                                 //上面是个矩形 平铺  斜角切开（/）
                -0.5, 0.5, 0.5,       //左上前
                0.5, 0.5, 0.5,        //右上前     //上面右前三角形
                0.5, 0.5, -0.5,       //右上后

                -0.5, -0.5, -0.5,     //左下后
                0.5, -0.5, -0.5,      //右下后     //下面左后三角形
                -0.5, -0.5, 0.5,      //左下前
                                                  //下面是个矩形 平铺 斜角切开（/）
                -0.5, -0.5, 0.5,      //左下前
                0.5, -0.5, -0.5,      //右下后     //下面右前三角形
                0.5, -0.5, 0.5,       //右下前

                -0.5, -0.5, -0.5,     //左下后
                -0.5, -0.5, 0.5,      //左下前      //左面下后三角形
                -0.5, 0.5, -0.5,      //左上后
                                                   //左面是个矩形 面朝左右 斜角切开
                -0.5, -0.5, 0.5,      //左下前
                -0.5, 0.5, 0.5,       //左上前      //左面上前三角形
                -0.5, 0.5, -0.5,      //左上后

                0.5, -0.5, -0.5,      //右下后  
                0.5, 0.5, -0.5,       //右上后      //右面下后三角形 
                0.5, -0.5, 0.5,       //右下前
                                                   //右面是个矩形 面朝左右 斜角切开
                0.5, -0.5, 0.5,       //右下前
                0.5, 0.5, -0.5,       //右上后      //右面上前三角形
                0.5, 0.5, 0.5,        //右上前

            ];
        positions.forEach(function(v,index){
            positions[index] = positions[index]*2;
        })
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

        this.createVertexsBuffer(positions, 3);
        this.createUVsBuffer(uvs, 2);
        
        this._glPrimitiveType = glprimitive_type.TRIANGLES;
        this.setShader(vertextBaseCode, fragBaseCode);


    }
}