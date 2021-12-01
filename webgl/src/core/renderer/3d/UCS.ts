import { SY } from "../base/Sprite";
import { syRender } from "../data/RenderData";
import box from "../primitive/CreateBox";
import cone from "../primitive/CreateCone";
import { syPrimitives } from "../primitive/Primitives";
import sphere from "../primitive/CreateSphere";
import torus from "../primitive/CreateTorus";
import { Object3D } from "./Object3D";
import { G_UISetting } from "../../ui/UiSetting";
import CustomTextureData from "../data/CustomTextureData";
import { LightData, structValueNames } from "../data/LightData";
import { Vector3 } from "../../math/Vector3";
import { Line } from "./Line";

/**
 * 坐标系
 */
export class UCS extends SY.SpriteBase {

    private _objX: Object3D;
    private _objY: Object3D;
    private _objZ: Object3D;
    private _objPoint: Object3D;
    private _center: Object3D;
    private _torus: Object3D;
    private _Line: Line;

    private _tempLightData: any = {};
    protected onInit() {
        var boxData = box({ width: 0.1, height: 5, length: 0.1 });
        var coneData = cone();
        var sphereData = sphere(0.2);
        var mesh = syRender.Mesh.create();
        var lineMesh = syRender.Mesh.create();
        var pointMesh = syRender.Mesh.create();
        lineMesh.combine(boxData)
        pointMesh.combine(sphereData)
        mesh.combine(boxData, 0, 2.5, 0)
        mesh.combine(coneData, 0, 5, 0);

        this._objX = new Object3D(mesh);
        this._objX.spriteFrame = "res/bindu.jpg";
        this._objX.rotateZ = -90;
        this._objX.pushPassContent(syRender.ShaderType.Sprite);
        this.addChild(this._objX);

        this._objPoint = new Object3D(pointMesh);
        this._objPoint.spriteFrame = CustomTextureData.getData(100, 100, [255, 0, 0, 255]);
        this._objPoint.pushPassContent(syRender.ShaderType.Sprite);
        this.addChild(this._objPoint);

        this._Line = new Line();
        this._Line.updatePositionData([0, 0, 0, 1, 1, 1]);
        this.addChild(this._Line);



        this._objY = new Object3D(mesh);
        this._objY.spriteFrame = "res/wicker.jpg";
        this._objY.pushPassContent(syRender.ShaderType.Sprite);
        this.addChild(this._objY);

        this._objZ = new Object3D(mesh);
        this._objZ.spriteFrame = "res/light.jpg";
        this._objZ.rotateX = -90;
        this._objZ.pushPassContent(syRender.ShaderType.Sprite);
        this.addChild(this._objZ);

        var meshCenter = syRender.Mesh.create();
        meshCenter.combine(sphereData);
        this._center = new Object3D(meshCenter);
        this._center.spriteFrame = CustomTextureData.getData(100, 100, [255, 0, 0, 255]);
        this._center.pushPassContent(syRender.ShaderType.Sprite);
        this.addChild(this._center);

        var torusData = torus()
        var meshTorus = syRender.Mesh.create();
        meshTorus.combine(torusData)
        this._torus = new Object3D(meshTorus);
        this._torus.spriteFrame = "res/f-texture.png"
        this._torus.y = 2;
        this._torus.pushPassContent(syRender.ShaderType.Sprite);
        this.addChild(this._torus);
        G_UISetting.pushRenderCallBack((data) => {

            var targetPos = [data.customValueX1 ? data.customValueX1 : 0, data.customValueY1 ? data.customValueY1 : 0, data.customValueZ1 ? data.customValueZ1 : 0]
            // var originPos = [data.customValueX?data.customValueX:0, data.customValueY?data.customValueY:0, data.customValueZ?data.customValueZ:0]
            var originPos = [this.x, this.y, this.z]
            var colorData = [data.customColorValueX ? data.customColorValueX : 0, data.customColorValueY ? data.customColorValueY : 0, data.customColorValueZ ? data.customColorValueZ : 0]
            this.setPosition(originPos[0], originPos[1], originPos[2])
            var color = CustomTextureData.getData(100, 100, colorData);
            this._objPoint.texture.reUpload(color.data as Uint8Array)
            this._center.texture.reUpload(color.data as Uint8Array)


            this._Line.updatePositionData([0, 0, 0, targetPos[0], targetPos[1], targetPos[2]]);

            this._objPoint.setPosition(targetPos[0], targetPos[1], targetPos[2])
            this._tempLightData = {};
            this._tempLightData.diffuse = [colorData[0] / 255, colorData[1] / 255, colorData[2] / 255]
            this._tempLightData.direction = [];
            this._tempLightData.direction[0] = 0 - targetPos[0]
            this._tempLightData.direction[1] = 0 - targetPos[1]
            this._tempLightData.direction[2] = 0 - targetPos[2]
            this._tempLightData.position = originPos
            this._tempLightData.constant = data.constant ? data.constant : 0.05;
            this._tempLightData.linear = data.linear ? data.linear : 0.09;
            this._tempLightData.quadratic = data.quadratic ? data.quadratic : 0.032;

            LightData.pushStructValues(this.tag, this._tempLightData)


        })

    }
    /**
       * updatePosData
       */
     onDataDirty() {
        var originPos = [this.x, this.y, this.z]
        this._tempLightData.position = originPos
        LightData.pushStructValues(this.tag, this._tempLightData)
    }
}