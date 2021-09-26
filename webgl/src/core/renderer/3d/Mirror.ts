
import { glMatrix } from "../../math/Matrix";
import { SY } from "../base/Sprite";
import { syRender } from "../data/RenderData";
import { syGL } from "../gfx/syGLEnums";
import { G_LightCenter } from "../light/LightCenter";
import { syPrimitives } from "../shader/Primitives";

export default class Mirror extends SY.SpriteBase {
    protected onInit() {
        let vertexData = syPrimitives.createSphereVertices(1, 24, 24);
        this.createIndexsBuffer(vertexData.indices);
        this.createNormalsBuffer(vertexData.normal, 3);
        this.createUVsBuffer(vertexData.texcoord, 2);
        this.createVertexsBuffer(vertexData.position, 3);

        this._glPrimitiveType = syGL.PrimitiveType.TRIANGLE_STRIP;
        this.color = [1, 0.5, 0.5, 1];
        this.pushPassContent(syRender.ShaderType.Mirror);
        super.onInit();
    }

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