
import { SY } from "../base/Sprite";
import { CubeData } from "../data/CubeData";
import { glEnums } from "../gfx/GLapi";


/**
 * 图片尺寸大小一样否则会有显示不出来的问题
 */

export default class SkyBox extends SY.SpriteBase {
     constructor() {
          super();
     }
     protected onInit(): void {
          var rd = CubeData.getData();
          this.createVertexsBuffer(rd.vertex, rd.dF.vertex_item_size);
          this.createIndexsBuffer(rd.indexs);
          this._glPrimitiveType = this.gl.TRIANGLE_STRIP;
     }
     private defaultPath = [
          'res/skybox/2/right+x.png',
          'res/skybox/2/left-x.png',
          'res/skybox/2/up-y.png',
          'res/skybox/2/down+y.png',
          'res/skybox/2/back-z.png',
          'res/skybox/2/front+z.png'
     ]
     // private defaultPath = [
     //      'res/skybox/3/1.jpg',
     //      'res/skybox/3/2.jpg',
     //      'res/skybox/3/3.jpg',
     //      'res/skybox/3/4.jpg',
     //      'res/skybox/3/5.jpg',
     //      'res/skybox/3/6.jpg'
     // ]
     public setDefaultUrl(): void {
          this.spriteFrame = this.defaultPath;
     }

     public onDrawBefore():void{
          let a = 10;
     }


}