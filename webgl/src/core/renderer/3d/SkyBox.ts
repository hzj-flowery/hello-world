import LoaderManager from "../../LoaderManager";
import { SY } from "../base/Sprite";
import { CubeData } from "../data/CubeData";

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
     public setDefaultUrl(): void {
          this.spriteFrame = this.defaultPath;
     }


}