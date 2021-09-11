
import { SY } from "../base/Sprite";
import { CubeData } from "../data/CubeData";
import { syRender } from "../data/RenderData";




  

export default class PointLightCube extends SY.SpriteBase {
  constructor() {
    super();
  }
  protected onInit() {
    var rd = CubeData.getData();
    this.createVertexsBuffer(rd.vertex, rd.dF.vertex_item_size);
    this.createIndexsBuffer(rd.indexs);
    this.createNormalsBuffer(rd.normals, rd.dF.normal_item_size);
    this.createUVsBuffer(rd.uvData, rd.dF.uv_item_size);
    this._glPrimitiveType = this.gl.TRIANGLE_STRIP;
    this.color = [1, 1.0, 1.0, 1.0];
    this.pushPassContent(syRender.ShaderType.Light_Point);
  }
}