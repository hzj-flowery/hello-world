import { glMatrix } from "../../math/Matrix";
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
    this.createVertexsBuffer(rd.vertex, rd.dF.vertex_item_size);
    this.createIndexsBuffer(rd.indexs);
    this.createNormalsBuffer(rd.normals, rd.dF.normal_item_size);
    this.createUVsBuffer(rd.uvData, rd.dF.uv_item_size);
    super.onInit();
  }

}