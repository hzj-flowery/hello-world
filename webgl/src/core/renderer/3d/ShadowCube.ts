import { glMatrix } from "../../math/Matrix";
import { G_BufferManager } from "../base/buffer/BufferManager";
import { SY } from "../base/Sprite";
import { CubeData } from "../data/CubeData";
import { syRender } from "../data/RenderData";
import { G_LightCenter } from "../light/LightCenter";

export default class ShadowCube extends SY.ShadowSprite {
  constructor() {
    super();
  }

  protected onInit() {
    var rd = CubeData.getData();
    G_BufferManager.createBuffer(SY.GLID_TYPE.VERTEX,this.attributeId,rd.vertex, rd.dF.vertex_item_size)
    G_BufferManager.createBuffer(SY.GLID_TYPE.INDEX,this.attributeId,rd.indexs,1);
    G_BufferManager.createBuffer(SY.GLID_TYPE.NORMAL,this.attributeId,rd.normals, rd.dF.normal_item_size);
    G_BufferManager.createBuffer(SY.GLID_TYPE.UV,this.attributeId,rd.uvData, rd.dF.uv_item_size);
    super.onInit();
  }

}