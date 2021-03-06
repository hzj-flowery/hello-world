import { Texture } from "./Texture";
import {syGL} from "../../gfx/syGLEnums";

/**
 * 立方体纹理
 */
export default class TextureCube extends Texture {
    constructor() {
        super();
        this._target = this._gl.TEXTURE_CUBE_MAP;
    }
    private faceInfos: Array<{ target, url }>;
    /**
     * @param path 
     * 0:right
     * 1:left
     * 2:up
     * 3:down
     * 4:back
     * 5:front
     */
    public set url(path: Array<string>) {
        this.faceInfos = [
            {
                target: this._gl.TEXTURE_CUBE_MAP_POSITIVE_X,
                url: path[0],
            },
            {
                target: this._gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
                url: path[1],
            },
            {
                target: this._gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
                url: path[2],
            },
            {
                target: this._gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
                url: path[3],
            },
            {
                target: this._gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
                url: path[4],
            },
            {
                target: this._gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
                url: path[5],
            },
        ];

        this.loadFaceInfor();
    }

    //加载各个面信息
    private loadFaceInfor(): void {
        var gl = this._gl;
        var texture = this.glID;
        gl.bindTexture(this._target, texture);
        var loadedCount = 0;
        this.faceInfos.forEach((faceInfo) => {
            const { target, url } = faceInfo;

            // Upload the canvas to the cubemap face.
            const level = 0;
            const internalFormat = gl.RGBA;
            const format = gl.RGBA;
            const type = gl.UNSIGNED_BYTE;
            const width = 512;
            const height = 512;
            // setup each face so it's immediately renderable
            gl.texImage2D(target, level, format, width, height, 0, internalFormat, type, null);


            // Asynchronously load an image
            const image = new Image();
            image.src = url;
            image.addEventListener('load', function () {
                console.log("加载图片成功啦---");
                // Now that the image has loaded make copy it to the texture.
                gl.bindTexture(this._target, texture);
                 // Y 轴取反
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

                gl.texImage2D(target, level, format, internalFormat, type, image);
                loadedCount++;
                if(loadedCount==6)
                this.loaded = true;
                //   gl.generateMipmap(gl.TEXTURE_CUBE_MAP);

            }.bind(this));
        });
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        this.texParameteri(syGL.TexFilter.LINEAR,syGL.TexFilter.LINEAR,syGL.TextureWrap.MIRROR,syGL.TextureWrap.MIRROR)
    }
}