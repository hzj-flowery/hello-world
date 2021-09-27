

import { SY } from "../base/Sprite";
import { CubeData } from "../data/CubeData";
import { syRender } from "../data/RenderData";

export default class MirrorCube extends SY.SpriteBase {
    constructor() {
        super();
    }
    protected onInit(): void {
        var rd = CubeData.getData();
        this.createVertexsBuffer(rd.vertex,rd.dF.vertex_item_size);
        this.createIndexsBuffer(rd.indexs);
        this.createNormalsBuffer(rd.normals,rd.dF.normal_item_size);
        this.pushPassContent(syRender.ShaderType.Mirror)
    }
//     private defaultPath = [
//         'res/skybox/2/right+x.png',
//         'res/skybox/2/left-x.png',
//         'res/skybox/2/up-y.png',
//         'res/skybox/2/down+y.png',
//         'res/skybox/2/back-z.png',
//         'res/skybox/2/front+z.png'
//    ]
private defaultPath = [
    'res/skybox/cube/Bridge2/posx.jpg',
    'res/skybox/cube/Bridge2/negx.jpg',
    'res/skybox/cube/Bridge2/posy.jpg',
    'res/skybox/cube/Bridge2/negy.jpg',
    'res/skybox/cube/Bridge2/posz.jpg',
    'res/skybox/cube/Bridge2/negz.jpg'
]
   public setDefaultUrl(): void {
        this.spriteFrame = this.defaultPath;
   }
}