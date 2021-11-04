import { SY } from "../base/Sprite";
import { syRender } from "../data/RenderData";
import box from "../primitive/CreateBox";
import cone from "../primitive/CreateCone";
import { syPrimitives } from "../primitive/Primitives";
import sphere from "../primitive/CreateSphere";
import torus from "../primitive/CreateTorus";
import { Object3D } from "./Object3D";

/**
 * 坐标系
 */
export class UCS extends SY.SpriteBase{

    private _objX:Object3D;
    private _objY:Object3D;
    private _objZ:Object3D;
    private _center:Object3D;
    private _torus:Object3D;
    protected onInit(){
        var boxData = box({width:0.1,height:5,length:0.1});
        var coneData = cone();
        var sphereData = sphere(0.2);
        var mesh = syRender.Mesh.create();
        mesh.combine(boxData,0,2.5,0)
        mesh.combine(coneData,0,5,0);
 
        this._objX = new Object3D(mesh);
        this._objX.spriteFrame = "res/bindu.jpg";
        this._objX.rotateZ = -90;
        this._objX.pushPassContent(syRender.ShaderType.Sprite);
        this.addChild(this._objX);

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
        this._center.spriteFrame = "res/f-texture.png"
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
        

    }
}