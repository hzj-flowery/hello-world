
import { G_BufferManager } from "../base/buffer/BufferManager";
import { SY } from "../base/Sprite";
import { syRender } from "../data/RenderData";

export class Object3D extends SY.SpriteBase {
    private _mesh: syRender.Mesh;
    constructor(mesh: syRender.Mesh) {
        super();
        this._mesh = mesh;
        this.localInit();
    }
    private localInit(): void {
        G_BufferManager.createBuffer(SY.GLID_TYPE.VERTEX,this.attributeId,this._mesh.positions,3)
        G_BufferManager.createBuffer(SY.GLID_TYPE.UV,this.attributeId,this._mesh.uvs,2);
        G_BufferManager.createBuffer(SY.GLID_TYPE.NORMAL,this.attributeId,this._mesh.normals,3)
        G_BufferManager.createBuffer(SY.GLID_TYPE.INDEX,this.attributeId,this._mesh.indices,1);
    }

    protected collectRenderData(time:number){
        super.collectRenderData(time)
    }
}