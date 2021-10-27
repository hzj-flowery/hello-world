
import { glMatrix } from "../../math/Matrix";
import { G_BufferManager } from "../base/buffer/BufferManager";
import { SY } from "../base/Sprite";
import { syRender } from "../data/RenderData";
import { syGL } from "../gfx/syGLEnums";
import { G_LightCenter } from "../light/LightCenter";
import { syPrimitives } from "../primitive/Primitives";

export default class Mirror extends SY.SpriteBase {
    protected onInit() {
        let vertexData = syPrimitives.createSphereVertices(1, 24, 24);
        G_BufferManager.createBuffer(SY.GLID_TYPE.INDEX,this.materialId,vertexData.indices,1);
        G_BufferManager.createBuffer(SY.GLID_TYPE.NORMAL,this.materialId,vertexData.normal, 3);
        G_BufferManager.createBuffer(SY.GLID_TYPE.UV,this.materialId,vertexData.texcoord, 2);
        G_BufferManager.createBuffer(SY.GLID_TYPE.VERTEX,this.materialId,vertexData.position, 3)
        this.setColor(255,122.5,122.5,255);
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