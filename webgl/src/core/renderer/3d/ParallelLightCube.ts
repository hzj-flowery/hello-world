
import { SY } from "../base/Sprite";
import { CubeData } from "../data/CubeData";
import { syRender } from "../data/RenderData";

/**
 * 如果将三维物体的朝向和光的方向点乘， 结果为 1 则物体朝向和光照方向相同，为 -1 则物体朝向和光照方向相反
 * 所以应该是发现和光的反向相乘，再乘以光的颜色，就是光反射的颜色，
 */

/**
 * 光照立方体
 */
export default class ParallelLightCube extends SY.SpriteBase {
    constructor() {
        super();
    }
    protected onInit() {
        var rd = CubeData.getData();
        this.createVertexsBuffer(rd.vertex,rd.dF.vertex_item_size);
        this.createUVsBuffer(rd.uvData,rd.dF.uv_item_size);
        this.createIndexsBuffer(rd.indexs);
        this.createNormalsBuffer(rd.normals,rd.dF.normal_item_size);
        this.pushPassContent(syRender.ShaderType.Light_Parallel)
    }
}