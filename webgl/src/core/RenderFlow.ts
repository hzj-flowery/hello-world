
import Device from "./Device";
import Scene2D from "./renderer/base/Scene2D";
import Scene3D from "./renderer/base/Scene3D";
import GameMainCamera from "./renderer/camera/GameMainCamera";




export default class RenderFlow {

    private gl:WebGLRenderingContext;
    private canvas: any;
    private _3dScene:Scene3D;
    private _2dScene:Scene2D;
    constructor() {
        this.gl = Device.Instance.gl;
        this.canvas = Device.Instance.canvas;
    }
    public startup() {
        this._3dScene = new Scene3D();
        this._3dScene.init();
        this._2dScene = new Scene2D();
        this._2dScene.init();
        Device.Instance.setViewPort(GameMainCamera.instance.get2DCamera().rect);
        this.loopScale();
    }
    private _add:number;
    private _lastFrameStartTime:number;//上一帧的时间
    private _frameRate:number = 0;//帧率
    private loopScale():void{
        this._add = 0.01;
        var loop = function(time){
            let curFrameTime =  time-this._lastFrameStartTime;
            let standardFrameTime = (1000/this._frameRate);
            this._lastFrameStartTime = time;
            if(curFrameTime>standardFrameTime)
            {
                Device.Instance.startDraw(time,this._2dScene,this._3dScene);
            }
            requestAnimationFrame(loop);
        }.bind(this);
        this._lastFrameStartTime = 0;
        this._frameRate = 60;
        loop(0);
    }
    


}

