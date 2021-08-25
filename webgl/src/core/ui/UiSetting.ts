

export class UIStatusData {
    public static cam2DPosX: number = 0;
    public static cam2DPosY: number = 0;
    public static cam2DPosZ: number = 0;
    public static cam2DRotX: number = 0;  // in degrees
    public static cam2DRotY: number = 0;  // in degrees
    public static cam2DRotZ: number = 0;  // in degrees

    public static cam3DFieldOfView: number = 60;  // in degrees
    public static cam3DPosX: number = 0;
    public static cam3DPosY: number = 2;
    public static cam3DPosZ: number = 20;
    public static cam3DRotX: number = 0;
    public static cam3DRotY: number = 0;
    public static cam3DRotZ: number = 0;
    public static cam3DNear: number = 1;
    public static cam3DFar: number = 200;

   
    //平行光
    public static parallelDirX: number = 8; //
    public static parallelDirY: number = 5; //
    public static parallelDirZ: number = -10;   //
    public static parallelColR: number = 0.1; //
    public static parallelColG: number = 0.1; //
    public static parallelColB: number = 0.1;   //
    public static parallelColA: number = 1.0;   //

     //聚光
     public static spotInnerLimit: number = 10;//点光内围
     public static spotOuterLimit: number = 20;//点光外围
     public static spotDirX: number = 0; //
     public static spotDirY: number = 0; //
     public static spotDirZ: number = 1;   //
     public static spotColR: number = 1; //
     public static spotColG: number = 1; //
     public static spotColB: number = 1;   //
     public static spotColA: number = 1;   //
    
     //高光
     public static specularShininess:number = 140;
     public static specularColR: number = 1; //
     public static specularColG: number = 0; //
     public static specularColB: number = 0;   //
     public static specularColA: number = 1.0;   //
     
     //环境光
     public static ambientColR: number = 0.1; //
     public static ambientColG: number = 0.1; //
     public static ambientColB: number = 0.1;   //
     public static ambientColA: number = 1.0;   //
     
     //点光
     public static pointColR: number = 0.1; //
     public static pointColG: number = 0.1; //
     public static pointColB: number = 0.1;   //
     public static pointColA: number = 1.0;   //
     
     //雾
     public static fogColR: number = 0.1; //
     public static fogColG: number = 0.1; //
     public static fogColB: number = 0.1;   //
     public static fogColA: number = 1.0;   //
     public static fogDensity:number = 0.095;

    
    public static eyeX: number = 2.5; //光照摄像机的x轴坐标
    public static eyeY: number = 4.8; //光照摄像机的y轴坐标
    public static eyeZ: number = 7;   //光照摄像机的z轴坐标 
    public static lightTargetX: number = 3.5; //光照摄像机看向的目标的x轴坐标
    public static lightTargetY: number = 0;   //光照摄像机看向的目标的y轴坐标
    public static lightTargetZ: number = 3.5; //光照摄像机看向的目标的z轴坐标
    public static lightProjWidth: number = 2; //光照摄像机渲染的屏幕宽度
    public static lightProjHeight: number = 2; //光照摄像机渲染的屏幕高度
    public static lightFieldOfView: number = 120;   //视角fov
    public static lightBias: number = 0.005;
    
   

    public static up: boolean = false;
    public static down: boolean = false;
    public static left: boolean = false;
    public static right: boolean = false;
    public static ahead: boolean = false;
    public static back: boolean = false;
}
class UISetting {
    constructor() {

    }
    private UI: any;
    private widgets = {};
    // //初始化UI
    public setUI(): void {
        var render = this.render.bind(this);
        this.UI = window["webglLessonsUI"];
        let custom = [
            { type: 'slider', key: 'customValue', min: 0, max: 360, change: render, },
        ]
        let camera2D = [
            //2d相机
            { type: 'slider', key: 'cam2DPosX', min: -10, max: 10, change: render, precision: 2, step: 0.1 },
            { type: 'slider', key: 'cam2DPosY', min: -10, max: 10, change: render, precision: 2, step: 0.1 },
            { type: 'slider', key: 'cam2DPosZ', min: -10, max: 10, change: render, precision: 2, step: 0.1 },
            { type: 'slider', key: 'cam2DRotX', min: 0, max: 360, change: render, },
            { type: 'slider', key: 'cam2DRotY', min: 0, max: 360, change: render, },
            { type: 'slider', key: 'cam2DRotZ', min: 0, max: 360, change: render, },
        ]
        let camera3D = [
            //3d相机
            { type: 'slider', key: 'cam3DFieldOfView', min: 0, max: 180, change: render, },
            { type: 'slider', key: 'cam3DPosX', min: -100, max: 100, change: render, },
            { type: 'slider', key: 'cam3DPosY', min: -100, max: 100, change: render, },
            { type: 'slider', key: 'cam3DPosZ', min: -100, max: 200, change: render, },
            { type: 'slider', key: 'cam3DRotX', min: 0, max: 360, change: render, },
            { type: 'slider', key: 'cam3DRotY', min: 0, max: 360, change: render, },
            { type: 'slider', key: 'cam3DRotZ', min: 0, max: 360, change: render, },
            { type: 'slider', key: 'cam3DNear', min: 1, max: 300, change: render, },
            { type: 'slider', key: 'cam3DFar', min: 1, max: 300, change: render, },
        ]
        let light = [
            //平行光
            // { type: 'slider', key: 'parallelDirX', min: -10, max: 10, change: this.render.bind(this), precision: 2, step: 1, },
            // { type: 'slider', key: 'parallelDirY', min: -10, max: 10, change: this.render.bind(this), precision: 2, step: 1, },
            // { type: 'slider', key: 'parallelDirZ', min: -10, max: 10, change: this.render.bind(this), precision: 2, step: 1, },
            // { type: 'slider', key: 'parallelColR', min: 0, max: 1, change: this.render.bind(this), precision: 2, step: 0.01, },
            // { type: 'slider', key: 'parallelColG', min: 0, max: 1, change: this.render.bind(this), precision: 2, step: 0.01, },
            // { type: 'slider', key: 'parallelColB', min: 0, max: 1, change: this.render.bind(this), precision: 2, step: 0.01, },
            // { type: 'slider', key: 'parallelColA', min: 0, max: 1, change: this.render.bind(this), precision: 2, step: 0.01, },
            
            //聚光
            // { type: 'slider', key: 'spotInnerLimit', min: 0, max: 180, change: this.render.bind(this), precision: 2, step: 1, },
            // { type: 'slider', key: 'spotOuterLimit', min: 0, max: 180, change: this.render.bind(this), precision: 2, step: 1, },
            // { type: 'slider', key: 'spotDirX', min: -10, max: 10, change: this.render.bind(this), precision: 2, step: 1, },
            // { type: 'slider', key: 'spotDirY', min: -10, max: 10, change: this.render.bind(this), precision: 2, step: 1, },
            // { type: 'slider', key: 'spotDirZ', min: -10, max: 10, change: this.render.bind(this), precision: 2, step: 1, },
            // { type: 'slider', key: 'spotColR', min: 0, max: 1, change: this.render.bind(this), precision: 2, step: 0.01, },
            // { type: 'slider', key: 'spotColG', min: 0, max: 1, change: this.render.bind(this), precision: 2, step: 0.01, },
            // { type: 'slider', key: 'spotColB', min: 0, max: 1, change: this.render.bind(this), precision: 2, step: 0.01, },
            // { type: 'slider', key: 'spotColA', min: 0, max: 1, change: this.render.bind(this), precision: 2, step: 0.01, },

            //环境光
            // { type: 'slider', key: 'ambientColR', min: 0, max: 1, change: this.render.bind(this), precision: 2, step: 0.01, },
            // { type: 'slider', key: 'ambientColG', min: 0, max: 1, change: this.render.bind(this), precision: 2, step: 0.01, },
            // { type: 'slider', key: 'ambientColB', min: 0, max: 1, change: this.render.bind(this), precision: 2, step: 0.01, },
            // { type: 'slider', key: 'ambientColA', min: 0, max: 1, change: this.render.bind(this), precision: 2, step: 0.01, },

            //高光
            // { type: 'slider', key: 'specularColR', min: 0, max: 1, change: this.render.bind(this), precision: 2, step: 0.01, },
            // { type: 'slider', key: 'specularColG', min: 0, max: 1, change: this.render.bind(this), precision: 2, step: 0.01, },
            // { type: 'slider', key: 'specularColB', min: 0, max: 1, change: this.render.bind(this), precision: 2, step: 0.01, },
            // { type: 'slider', key: 'specularColA', min: 0, max: 1, change: this.render.bind(this), precision: 2, step: 0.01, },
            // { type: 'slider', key: 'specularShininess', min: 0, max: 200, change: this.render.bind(this), precision: 2, step: 0.01, },
            
            //点光
            // { type: 'slider', key: 'pointColR', min: 0, max: 1, change: this.render.bind(this), precision: 2, step: 0.01, },
            // { type: 'slider', key: 'pointColG', min: 0, max: 1, change: this.render.bind(this), precision: 2, step: 0.01, },
            // { type: 'slider', key: 'pointColB', min: 0, max: 1, change: this.render.bind(this), precision: 2, step: 0.01, },
            // { type: 'slider', key: 'pointColA', min: 0, max: 1, change: this.render.bind(this), precision: 2, step: 0.01, },

            //雾
            // { type: 'slider', key: 'fogColR', min: 0, max: 1, change: this.render.bind(this), precision: 2, step: 0.01, },
            // { type: 'slider', key: 'fogColG', min: 0, max: 1, change: this.render.bind(this), precision: 2, step: 0.01, },
            // { type: 'slider', key: 'fogColB', min: 0, max: 1, change: this.render.bind(this), precision: 2, step: 0.01, },
            // { type: 'slider', key: 'fogColA', min: 0, max: 1, change: this.render.bind(this), precision: 2, step: 0.01, },
            // { type: 'slider', key: 'fogDensity', min: 0, max: 0.1, change: this.render.bind(this), precision: 3, step: 0.001, },
            
            
            { type: 'slider', key: 'eyeX', min: -50, max: 50, change: this.render.bind(this), precision: 2, step: 0.01, },
            { type: 'slider', key: 'eyeY', min: -50, max: 50, change: this.render.bind(this), precision: 2, step: 0.01, },
            { type: 'slider', key: 'eyeZ', min: -50, max: 50, change: this.render.bind(this), precision: 2, step: 0.01, },
            { type: 'slider', key: 'lightTargetX', min: -50, max: 50, change: this.render.bind(this), precision: 2, step: 0.01, },
            { type: 'slider', key: 'lightTargetY', min: -50, max: 50, change: this.render.bind(this), precision: 2, step: 0.01, },
            { type: 'slider', key: 'lightTargetZ', min: -50, max: 50, change: this.render.bind(this), precision: 2, step: 0.01, },
            { type: 'slider', key: 'lightProjWidth', min: 1, max: 50, change: this.render.bind(this), precision: 2, step: 0.1, },
            { type: 'slider', key: 'lightProjHeight', min: 1, max: 50, change: this.render.bind(this), precision: 2, step: 0.1, },
            // { type: 'slider', key: 'lightFieldOfView', min: 1, max: 179, change: this.render.bind(this), },
            // { type: 'slider', key: 'lightBias', min: 0.005, max: 0.001, change: this.render.bind(this), precision: 3, step: 0.001, },
        ]
        let fish = [
            { type: 'checkbox', key: 'up', min: -10, max: 10, change: this.render.bind(this, "up") },
            { type: 'checkbox', key: 'down', min: -10, max: 10, change: this.render.bind(this, "down") },
            { type: 'checkbox', key: 'left', min: -10, max: 10, change: this.render.bind(this, "left") },
            { type: 'checkbox', key: 'right', min: 0, max: 1, change: this.render.bind(this, "right") },
            { type: 'checkbox', key: 'ahead', min: 0, max: 1, change: this.render.bind(this, "ahead") },
            { type: 'checkbox', key: 'back', min: 0, max: 1, change: this.render.bind(this, "back") }
        ]
        this.widgets = this.UI.setupUI(document.querySelector('#ui'), UIStatusData, [].concat(custom,light));
        this.render();
    }

    private _sensitivity: number = 0.3;
    //更新相机z坐标
    public updateCameraZ(scaleBig?) {
        UIStatusData.cam3DPosZ = scaleBig == true ? UIStatusData.cam3DPosZ - this._sensitivity : UIStatusData.cam3DPosZ + this._sensitivity;
        this.UI.updateUI(this.widgets, UIStatusData);
        this.render();
    }
    public updateCameraY(up?) {
        UIStatusData.cam3DPosY = up == true ? UIStatusData.cam3DPosY - this._sensitivity : UIStatusData.cam3DPosY + this._sensitivity;
        this.UI.updateUI(this.widgets, UIStatusData);
        this.render();
    }
    public updateCameraX(right?) {
        UIStatusData.cam3DPosX = right == true ? UIStatusData.cam3DPosX - this._sensitivity : UIStatusData.cam3DPosX + this._sensitivity;
        this.UI.updateUI(this.widgets, UIStatusData);
        this.render();
    }
    private render(event?): void {

        if (event) {
            let p = ["up", "down", "left", "right", "ahead", "back"]
            for (let i = 0; i < p.length; i++) {
                p[i] == event ? UIStatusData[p[i]] = true : UIStatusData[p[i]] = false;
            }
        }

        if (this._renderCallBackArray.length > 0) {
            this._renderCallBackArray.forEach((fn, index) => {
                fn(UIStatusData);
            });
        }

    }
    private _renderCallBackArray: Array<Function> = [];
    public pushRenderCallBack(cb: Function): void {
        this._renderCallBackArray.indexOf(cb) < 0 ? this._renderCallBackArray.push(cb) : console.log("已经存在 无需再次绑定");
        this.render();
    }
    public getSettings() {
        return UIStatusData;
    }
}

export var G_UISetting = new UISetting();