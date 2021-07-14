import Device from "../../Device";
import { SY } from "../base/Sprite";
import { RenderTexture } from "../base/texture/RenderTexture";
import { CameraIndex, GameMainCamera } from "../camera/GameMainCamera";
import { CubeData } from "../data/CubeData";
import { syRender } from "../data/RenderData";

/**
 * 延迟渲染
 */
export class RTT extends SY.SpriteBase {
    constructor() {
        super();
    }
    private _virtualCameraIndex: CameraIndex = CameraIndex.normal1;
    protected onInit() {
        var rd = CubeData.getData();
        this.createVertexsBuffer(rd.vertex, rd.dF.vertex_item_size);
        this.createUVsBuffer(rd.uvData, rd.dF.uv_item_size);
        this.createIndexsBuffer(rd.indexs);
        this.createNormalsBuffer(rd.normals, rd.dF.normal_item_size)
        this._glPrimitiveType = this.gl.TRIANGLE_STRIP;
    }
    public onDrawBefore(time: number, rd: syRender.BaseData): void {
        let gl = Device.Instance.gl;
        if (rd.pass && rd.pass.drawType == syRender.DrawType.Single) {
            if ((this._texture as RenderTexture).moreTexture&&(this._texture as RenderTexture).moreTexture.length > 1) {
                //删除一个自定义tex
                var nums = (this._texture as RenderTexture).moreTexture.length-1;
                var COLOR_ATTACHMENT = []
                for(let k=0;k<nums;k++)
                {
                    COLOR_ATTACHMENT.push(gl["COLOR_ATTACHMENT"+k]);
                }
                gl.drawBuffers(COLOR_ATTACHMENT);
            }
        }
    }
    public onDrawAfter(time: number): void {

    }
    protected onSetTextureUrl(): void {

        GameMainCamera.instance.getCameraIndex(this._virtualCameraIndex).targetTexture = this.texture as RenderTexture;
    }
    public setVirtualCameraIndex(index: CameraIndex): void {
        this._virtualCameraIndex = index;
        GameMainCamera.instance.createVituralCamera(0, index, syRender.DrawType.Single);
    }
}