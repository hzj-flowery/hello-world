import LoaderManager from "../../LoaderManager";
import {gltex_filter, glTextureFmtInfor } from "../gfx/GLEnums";
import { Texture, TextureUpdateOpts } from "./Texture";

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
        var image = LoaderManager.instance.getCacheImage(soucePath);
        this._url = soucePath;

        var options = new TextureUpdateOpts();
        options.image = image;
        options.width = image.width;
        options.height = image.height;
        this.updateOptions(options);
        this.onLoadImageFinish(image);

        console.log("bytes----------",this._bites);
    }

    //加载图片完成
    private onLoadImageFinish(image:HTMLImageElement):void{
        
        this.loaded = true;
         // 指定当前操作的贴图
        this._gl.bindTexture(this._target,this._glID);
        // Y 轴取反
        this._gl.pixelStorei(this._gl.UNPACK_FLIP_Y_WEBGL, true);

        var formatInfo = glTextureFmtInfor(this._format);

        // 创建贴图, 绑定对应的图像并设置数据格式
         // this._gl.texImage2D(
         //      this._target,
         //      0, // 就是这个参数指定几级 Mipmap
         //      this._gl.RGBA, 
         //      this._gl.RGBA, 
         //      this._gl.UNSIGNED_BYTE, 
         //      image);
         //256*256   p(gpu内存) = width * height * 4 /1024 = 256k
         this._gl.texImage2D(this._target,0, formatInfo.format,formatInfo.internalFormat,formatInfo.pixelType, image);
         //256*256  p(gpu内存) = width * height * 3 /1024 =342 - 342/4 = 192k 相当于内存减少1/4
          //this._gl.texImage2D(this._target, 0, this._gl.RGB,this._gl.RGB, this._gl.UNSIGNED_BYTE, image);
        
        //   this._gl.pixelStorei(this._gl.UNPACK_FLIP_Y_WEBGL, true);

         // 生成 MipMap 映射
         // 首先要调用此方法
         // 要在texImage2D 后调用，否则会报错error:GL_INVALID_OPERATION  gl.generateMipmap(this._target)
         //如果开启此技术对于256*256这个贴图 它的内存占用会比原来多出三分之一
         //256*256 p(gpu内存) = (width * height * 4 /1024)*(4/3) =342
         //能够使用这个技术的图片的宽高必须是2的幂
         //此技术开启以后，会生成以下级别的图片，256*256这个是0级
         //级别：128*128（1）,64*64（1）,32*32（1）,16*16（1）,8*8（1）,4*4（1）,2*2（1）,1*1（1）
         //实时渲染时，根据采样密度选择其中的某一级纹理，以此避免运行时的大量计算
         if(this._genMipmaps&&this.isPow2(image.width)&&this.isPow2(image.height))
         {
            //  this._gl.hint(this._gl.GENERATE_MIPMAP_HINT, this._gl.NICEST);
            this._gl.generateMipmap(this._target);
            this.updateGenMipMapsAddBites();
         }
         else if(this._genMipmaps)
         {
             console.warn('NPOT textures do not support mipmap filter');
             this._genMipmaps = false;
         }


        //特别注意
        if(this.isPow2(image.width)==false||this.isPow2(image.height)==false)
        {
            console.warn('WebGL1 doesn\'t support all wrap modes with NPOT textures');
        }
        
        /**
         * MIN_FILTER 和 MAG_FILTER
         * -------------对于纹理的放大
         * 一个纹理是由离散的数据组成的，比如一个 2x2 的纹理是由 4 个像素组成的，使用 (0,0)、(0, 1) 等四个坐标去纹理上取样，自然可以取到对应的像素颜色；
         * 但是，如果使用非整数坐标到这个纹理上去取色。比如，当这个纹理被「拉近」之后，在屏幕上占据了 4x4 一共 16 个像素，
         * 那么就会使用 (0.33,0) 之类的坐标去取值，如何根据离散的 4 个像素颜色去计算 (0.33,0) 处的颜色，就取决于参数 MAG_FILTER
         * MAG_FILTER（放大） 有两个可选项，NEAREST 和 LINEAR。
         * 顾名思义，NEAREST 就是去取距离当前坐标最近的那个像素的颜色，而 LINEAR 则会根据距离当前坐标最近的 4 个点去内插计算出一个数值
         * NEAREST：速度快，但图片被放的比较大的时候,图片的颗粒感会比较明显
         * LINEAR： 速度慢点，但图片会显示的更顺滑一点
         * -------------对于纹理的缩小
         * MIN_FILTER（缩小） 有以下 6 个可选配置项：
         * NEAREST
         * LINEAR
         * NEAREST_MIPMAP_NEAREST
         * NEAREST_MIPMAP_LINEAR
         * LINEAR_MIPMAP_NEAREST
         * LINEAR_MIPMAP_LINEAR
         * 前两个配置项和 MAG_FILTER 的含义和作用是完全一样的。
         * 但问题是，当纹理被缩小时，原纹理中并不是每一个像素周围都会落上采样点，这就导致了某些像素，完全没有参与纹理的计算，新纹理丢失了一些信息。
         * 假设一种极端的情况，就是一个纹理彻底缩小为了一个点，那么这个点的值应当是纹理上所有像素颜色的平均值，这才比较合理。
         * 但是 NEAREST 只会从纹理中取一个点，而 LINEAR 也只是从纹理中取了四个点计算了一下而已。这时候，就该用上 MIPMAP 了
         * 
         * 为了在纹理缩小也获得比较好的效果，需要按照采样密度，选择一定数量（通常大于 LINEAR 的 4 个，极端情况下为原纹理上所有像素）的像素进行计算。
         * 实时进行计算的开销是很大的，所有有一种称为 MIPMAP（金字塔）的技术。
         * 在纹理创建之初，就为纹理创建好 MIPMAP，比如对 512x512 的纹理，依次建立 256x256（称为 1 级 Mipmap）、128x128（称为 2 级 Mipmap） 乃至 2x2、1x1 的纹理。
         * 实时渲染时，根据采样密度选择其中的某一级纹理，以此避免运行时的大量计算
         */
        // 设定参数, 放大滤镜和缩小滤镜的采样方式
        //放大
        this._gl.texParameteri(this._target, this._gl.TEXTURE_MAG_FILTER,gltex_filter.LINEAR);
        //缩小
        //一旦使用(NEAREST_MIPMAP_NEAREST，NEAREST_MIPMAP_LINEAR，LINEAR_MIPMAP_NEAREST，LINEAR_MIPMAP_LINEAR)
        if(this._genMipmaps)
        {
             //说明就要使用mipmap了啊
            this._gl.texParameteri(this._target, this._gl.TEXTURE_MIN_FILTER,gltex_filter.LINEAR_MIPMAP_LINEAR);
        }
        else
        {
            this._gl.texParameteri(this._target, this._gl.TEXTURE_MIN_FILTER,gltex_filter.LINEAR);
        }

        // 设定参数, x 轴和 y 轴为镜面重复绘制
        //纹理的填充模式
        /**
         * gl.REPEAT
         * gl.CLAMP_TO_EDGE
         * gl.MIRRORED_REPEAT
         */
        //水平方向
        this._gl.texParameteri(this._target, this._gl.TEXTURE_WRAP_S,this._wrapS);
        //垂直方向
        this._gl.texParameteri(this._target, this._gl.TEXTURE_WRAP_T,this._wrapT);

        

        // 清除当前操作的贴图
        this._gl.bindTexture(this._target, null);
    }

    public destroy():void{
        super.destroy();
    }

    //判断当前数是不是2的幂
    public isPow2(v) {
    return !(v & (v - 1)) && (!!v);
}

}