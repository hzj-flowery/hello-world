import { RenderTexture } from "./RenderTexture";
import { Texture, TextureOpts } from "./Texture";
import { Texture2D } from "./Texture2D";
import TextureCube from "./TextureCube";
import TextureCustom from "./TextureCustom";

class TextureManager{
    //创建一个纹理buffer
    private static createTexture2DBuffer(url: string): Texture {
        let texture = new Texture2D();
        (texture as Texture2D).url = url;
        return texture
    }
    private static createTextureCubeBuffer(arr: Array<string>): Texture {
        let texture = new TextureCube();
        (texture as TextureCube).url = arr;
        return texture;
    }
    private static createCustomTextureBuffer(data: TextureOpts): Texture {
        let texture = new TextureCustom();
        (texture as TextureCustom).url = data;
        return texture;
    }
    /**
     * 创建一个渲染纹理
     * @param data {type,place,width,height}
     */
    private static createRenderTextureBuffer(data: any): Texture {
        let texture = new RenderTexture();
        (texture as RenderTexture).attach(data.place, data.width, data.height);
        return texture;
    }
    static createTexture(url: string | Array<string> | TextureOpts | Object):Texture{
         //普通图片
         if (typeof url == "string") {
            return this.createTexture2DBuffer(url);
        }
        //天空盒
        else if (url instanceof Array && url.length == 6) {
            return this.createTextureCubeBuffer(url);
        }
        //自定义纹理
        else if (url instanceof TextureOpts) {
            return this.createCustomTextureBuffer(url);
        }
        else if (url instanceof Object && url["type"] == "RenderTexture") {
            return this.createRenderTextureBuffer(url);
        }
    }
}
export var G_TextureManager = TextureManager;