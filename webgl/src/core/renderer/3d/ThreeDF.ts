import { G_BufferManager } from "../base/buffer/BufferManager";
import { SY } from "../base/Sprite";
import { syPrimitives } from "../primitive/Primitives";

export class ThreeDF extends SY.SpriteBase{
    onInit(){
        let vertexData = syPrimitives.create3DFVertices();
        G_BufferManager.createBuffer(SY.GLID_TYPE.INDEX,this.materialId,vertexData.indices,1);
        G_BufferManager.createBuffer(SY.GLID_TYPE.NORMAL,this.materialId,vertexData.normal, 3);
        G_BufferManager.createBuffer(SY.GLID_TYPE.UV,this.materialId,vertexData.texcoord, 2);
        G_BufferManager.createBuffer(SY.GLID_TYPE.VERTEX,this.materialId,vertexData.position, 3)
    }
}


