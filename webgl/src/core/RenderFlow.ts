
import Device from "./Device";
import Scene2D from "./renderer/base/Scene2D";
import Scene3D from "./renderer/base/Scene3D";
import { G_Stage } from "./renderer/base/Stage";
import enums from "./renderer/camera/enums";
import {CameraUUid, GameMainCamera} from "./renderer/camera/GameMainCamera";
import PerspectiveCamera from "./renderer/camera/PerspectiveCamera";




export default class RenderFlow {
    private _3dScene:Scene3D;
    private _2dScene:Scene2D;
    public startup() {

        GameMainCamera.instance.registerCamera(0,CameraUUid.base3D,G_Stage)
        GameMainCamera.instance.registerCamera(1,CameraUUid.base2D,G_Stage)
        GameMainCamera.instance.registerCamera(0,CameraUUid.Depth,G_Stage)
        GameMainCamera.instance.initRenderData();

        this._3dScene = new Scene3D();
        this._3dScene.init();
        this._2dScene = new Scene2D();
        this._2dScene.init();
        
        G_Stage.addChild(this._3dScene);
        G_Stage.addChild(this._2dScene);
        this.loopScale();
    }

    private loopScale():void{
        var loop = function(time){
            Device.Instance.startDraw(time,G_Stage);
            requestAnimationFrame(loop);
        }.bind(this);
        loop(0);
    }
    


}

