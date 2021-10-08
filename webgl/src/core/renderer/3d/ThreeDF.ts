import { SY } from "../base/Sprite";
import { syPrimitives } from "../primitive/Primitives";

export class ThreeDF extends SY.SpriteBase{
    onInit(){
        let vertexData = syPrimitives.create3DFVertices();
        this.createIndexsBuffer(vertexData.indices);
        this.createNormalsBuffer(vertexData.normal, 3);
        this.createUVsBuffer(vertexData.texcoord, 2);
        this.createVertexsBuffer(vertexData.position, 3);
    }
}


