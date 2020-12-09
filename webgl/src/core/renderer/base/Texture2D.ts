import LoaderManager from "../../LoaderManager";
import { glTextureFmtInfor, gltex_filter } from "../gfx/GLEnums";
import { Texture, TextureOpts } from "./Texture";

/*

//gl.texImage2D将 pixels 指定给绑定的纹理对象
// WebGL1:
void gl.texImage2D(target, level, internalformat, width, height, border, format, type, ArrayBufferView? pixels);
void gl.texImage2D(target, level, internalformat, format, type, ImageData? pixels);
void gl.texImage2D(target, level, internalformat, format, type, HTMLImageElement? pixels);
void gl.texImage2D(target, level, internalformat, format, type, HTMLCanvasElement? pixels);
void gl.texImage2D(target, level, internalformat, format, type, HTMLVideoElement? pixels);
void gl.texImage2D(target, level, internalformat, format, type, ImageBitmap? pixels);

// WebGL2:
void gl.texImage2D(target, level, internalformat, width, height, border, format, type, GLintptr offset);
void gl.texImage2D(target, level, internalformat, width, height, border, format, type, HTMLCanvasElement source);
void gl.texImage2D(target, level, internalformat, width, height, border, format, type, HTMLImageElement source); 
void gl.texImage2D(target, level, internalformat, width, height, border, format, type, HTMLVideoElement source); 
void gl.texImage2D(target, level, internalformat, width, height, border, format, type, ImageBitmap source);
void gl.texImage2D(target, level, internalformat, width, height, border, format, type, ImageData source);
void gl.texImage2D(target, level, internalformat, width, height, border, format, type, ArrayBufferView srcData, srcOffset);

参数值解析
internalformat        type            通道数 通道字节数
RGBA         	 UNSIGNED_BYTE	        4	    4
RGB	             UNSIGNED_BYTE	        3	    3
RGBA             UNSIGNED_SHORT_4_4_4_4	4	    2
RGBA         	 UNSIGNED_SHORT_5_5_5_1	4	    2
RGB	             UNSIGNED_SHORT_5_6_5   3	    2
LUMINANCE_ALPHA	 UNSIGNED_BYTE       	2	    2
LUMINANCE   	 UNSIGNED_BYTE      	1	    1
ALPHA       	 UNSIGNED_BYTE       	1	    1
注意internalformat的值必须和format值保持一致


//gl.texParameteri设置纹理参数
gl.texParameteri(target, pname, param) ，将param的值赋给绑定到目标的纹理对象的pname参数上。
参数：
target: gl.TEXTURE_2D 或 gl.TEXTURE_CUBE_MAP
pname: 可指定4个纹理参数

放大（gl.TEXTURE_MAP_FILTER）:当纹理的绘制范围比纹理本身更大时，如何获取纹理颜色。比如，将16*16的纹理图像映射到32*32像素的空间时，纹理的尺寸变为原始的两倍。默认值为gl.LINEAR。
缩小（gl.TEXTURE_MIN_FILTER）: 当纹理的绘制返回比纹理本身更小时，如何获取纹素颜色。比如，将32*32的纹理图像映射到16*16像素空间里，纹理的尺寸就只有原始的一般。默认值为gl.NEAREST_MIPMAP_LINEAR。
水平填充（gl.TEXTURE_WRAP_S）: 表示如何对纹理图像左侧或右侧区域进行填充。默认值为gl.REPEAT。
垂直填充（gl.TEXTURE_WRAP_T）: 表示如何对纹理图像上方和下方的区域进行填充。默认值为gl.REPEAT。
param: 纹理参数的值

可赋给 gl.TEXTURE_MAP_FILTER 和 gl.TEXTURE_MIN_FILTER 参数的值

gl.NEAREST: 使用原纹理上距离映射后像素中心最近的那个像素的颜色值，作为新像素的值。

gl.LINEAR: 使用距离新像素中心最近的四个像素的颜色值的加权平均，作为新像素的值（和gl.NEAREST相比，该方法图像质量更好，但也会有较大的开销。）

可赋给 gl.TEXTURE_WRAP_S 和 gl.TEXTURE_WRAP_T 的常量：

gl.REPEAT: 平铺式的重复纹理


gl.MIRRORED_REPEAT: 镜像对称的重复纹理

gl.CLAMP_TO_EDGE: 使用纹理图像边缘值
*/

export class Texture2D extends Texture{
    constructor(gl){
        super(gl);
        this._target = gl.TEXTURE_2D;
    }
    private _url:string;
    public set url(soucePath){
        this._url = soucePath;
        LoaderManager.instance.load(this._url,null,this.onLoadFinish.bind(this));
    }
    private onLoadFinish(image:HTMLImageElement):void{

        console.log("soucePath-------",this._url,image);
        var options = new TextureOpts();
        options.data = image;
        options.width = image.width;
        options.height = image.height;
        options.unpackFlipY = true;
        options.magFilter = gltex_filter.LINEAR;
        options.minFilter = gltex_filter.LINEAR_MIPMAP_LINEAR;
        options.checkValid();
        this.updateOptions(options);
        this.upload();
        this.loaded = true;
    }
    public destroy():void{
        super.destroy();
    }

}