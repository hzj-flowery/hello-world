
class UISetting {
    constructor() {

    }
    private UI:any;
    private widgets = {};
    private settings = {
        cam2DPosX: 0,
        cam2DPosY: 0,
        cam2DPosZ: 0,
        cam2DRotX: 0,  // in degrees
        cam2DRotY: 0,  // in degrees
        cam2DRotZ: 0,  // in degrees

        cam3DFieldOfView: 60,  // in degrees
        cam3DPosX: 0,
        cam3DPosY: 2,
        cam3DPosZ: 20,
        cam3DRotX: 0,
        cam3DRotY: 0,
        cam3DRotZ: 0,
        cam3DNear: 1,
        cam3DFar: 200,

        lightPosX: 2.5, //光照摄像机的x轴坐标
        lightPosY: 4.8, //光照摄像机的y轴坐标
        lightPosZ: 7,   //光照摄像机的z轴坐标
        lightDirX: 8, //光照摄像机的x轴坐标
        lightDirY: 5, //光照摄像机的y轴坐标
        lightDirZ: -10,   //光照摄像机的z轴坐标
        lightColorR: 0.1, //光的颜色
        lightColorG: 0.1, //光的颜色
        lightColorB: 0.1,   //光的颜色
        lightColorA: 1.0,   //光颜色的透明通道
        lightTargetX: 3.5, //光照摄像机看向的目标的x轴坐标
        lightTargetY: 0,   //光照摄像机看向的目标的y轴坐标
        lightTargetZ: 3.5, //光照摄像机看向的目标的z轴坐标
        lightProjWidth: 10, //光照摄像机渲染的屏幕宽度
        lightProjHeight: 10, //光照摄像机渲染的屏幕高度
        lightFieldOfView: 120,   //视角fov
        lightBias: 0.005,

    };
    // //初始化UI
    public setUI(): void {
        var render = this.render.bind(this);
        this.UI = window["webglLessonsUI"];
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
            { type: 'slider', key: 'lightPosX', min: -50, max: 50, change: this.render.bind(this), precision: 2, step: 0.001, },
            { type: 'slider', key: 'lightPosY', min: -50, max: 50, change: this.render.bind(this), precision: 2, step: 0.001, },
            { type: 'slider', key: 'lightPosZ', min: -50, max: 50, change: this.render.bind(this), precision: 2, step: 0.001, },

            { type: 'slider', key: 'lightDirX', min: -10, max: 10, change: this.render.bind(this), precision: 2, step: 1, },
            { type: 'slider', key: 'lightDirY', min: -10, max: 10, change: this.render.bind(this), precision: 2, step: 1, },
            { type: 'slider', key: 'lightDirZ', min: -10, max: 10, change: this.render.bind(this), precision: 2, step: 1, },

            { type: 'slider', key: 'lightColorR', min: 0, max: 1, change: this.render.bind(this), precision: 2, step: 0.01, },
            { type: 'slider', key: 'lightColorG', min: 0, max: 1, change: this.render.bind(this), precision: 2, step: 0.01, },
            { type: 'slider', key: 'lightColorB', min: 0, max: 1, change: this.render.bind(this), precision: 2, step: 0.01, },
            { type: 'slider', key: 'lightColorA', min: 0, max: 1, change: this.render.bind(this), precision: 2, step: 0.01, },

            { type: 'slider', key: 'lightTargetX', min: -50, max: 50, change: this.render.bind(this), precision: 2, step: 0.001, },
            { type: 'slider', key: 'lightTargetY', min: -50, max: 50, change: this.render.bind(this), precision: 2, step: 0.001, },
            { type: 'slider', key: 'lightTargetZ', min: -50, max: 50, change: this.render.bind(this), precision: 2, step: 0.001, },
            { type: 'slider', key: 'lightProjWidth', min: 0, max: 100, change: this.render.bind(this), precision: 2, step: 0.001, },
            { type: 'slider', key: 'lightProjHeight', min: 0, max: 100, change: this.render.bind(this), precision: 2, step: 0.001, },
            { type: 'slider', key: 'lightFieldOfView', min: 1, max: 179, change: this.render.bind(this), },
            { type: 'slider', key: 'lightBias', min: 0.005, max: 0.001, change: this.render.bind(this), precision: 3, step: 0.001, },
        ]
        this.widgets = this.UI.setupUI(document.querySelector('#ui'), this.settings, [].concat(light));
        this.render();
    }

    private _sensitivity:number = 0.3;
    //更新相机z坐标
    public updateCameraZ(scaleBig?) {
        this.settings.cam3DPosZ = scaleBig == true ? this.settings.cam3DPosZ - this._sensitivity : this.settings.cam3DPosZ + this._sensitivity;
        this.UI.updateUI(this.widgets, this.settings);
        this.render();
    }
    public updateCameraY(up?) {
        this.settings.cam3DPosY = up == true ? this.settings.cam3DPosY - this._sensitivity : this.settings.cam3DPosY + this._sensitivity;
        this.UI.updateUI(this.widgets, this.settings);
        this.render();
    }
    public updateCameraX(right?) {
        this.settings.cam3DPosX = right == true ? this.settings.cam3DPosX - this._sensitivity : this.settings.cam3DPosX + this._sensitivity;
        this.UI.updateUI(this.widgets, this.settings);
        this.render();
    }
    private render(): void {
        if (this._renderCallBackArray.length > 0) {
            this._renderCallBackArray.forEach((fn, index) => {
                fn(this.settings);
            });
        }
    }
    private _renderCallBackArray: Array<Function> = [];
    public pushRenderCallBack(cb: Function): void {
        this._renderCallBackArray.indexOf(cb) < 0 ? this._renderCallBackArray.push(cb) : console.log("已经存在 无需再次绑定");
        this.render();
    }
    public getSettings(): any {
        return this.settings;
    }
}

export var G_UISetting = new UISetting();