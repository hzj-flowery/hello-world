import { glMatrix } from "../../math/Matrix";
import { SY } from "../base/Sprite";
import { CubeData } from "../data/CubeData";

export default class ShadowCube extends SY.SpriteBase {
  constructor() {
    super();
  }

  private _customTempMatrix: Float32Array;
  private _tempMatrix: Float32Array;

  protected onInit() {
    var rd = CubeData.getData();
    this.createVertexsBuffer(rd.vertex, rd.dF.vertex_item_size);
    this.createIndexsBuffer(rd.indexs);
    this.createNormalsBuffer(rd.normals, rd.dF.normal_item_size);
    this.createUVsBuffer(rd.uvData, rd.dF.uv_item_size);
    this._glPrimitiveType = this.gl.TRIANGLE_STRIP;
    this.color = [1, 1.0, 1.0, 1.0];

    this._customTempMatrix = glMatrix.mat4.identity(null);
    this._tempMatrix = glMatrix.mat4.identity(null);

  }

  protected collectRenderData(time: number) {
    glMatrix.mat4.copy(this._tempMatrix, this._customTempMatrix)
    this.createCustomMatrix(this._tempMatrix);
    super.collectRenderData(time)
  }

  /**
   * 更新pv矩阵
   * @param proj 
   * @param view 
   */
  public updateProjView(proj: Float32Array, view: Float32Array): void {
    glMatrix.mat4.copy(this._customTempMatrix, proj);
    glMatrix.mat4.multiply(this._customTempMatrix, this._customTempMatrix, glMatrix.mat4.invert(null, view));
  }

}