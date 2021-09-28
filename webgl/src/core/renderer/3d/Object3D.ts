
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
        this.createVertexsBuffer(this._mesh.positions);
        this.createUVsBuffer(this._mesh.uvs);
        this.createNormalsBuffer(this._mesh.normals)
        this.createIndexsBuffer(this._mesh.indices);
    }

    protected collectRenderData(time:number){
        super.collectRenderData(time)
    }
}