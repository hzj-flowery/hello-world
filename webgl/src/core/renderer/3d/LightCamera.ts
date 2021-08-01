import { sy } from "../../Director";
import { glMatrix } from "../../math/Matrix";
import { G_UISetting } from "../../ui/UiSetting";
import { MathUtils } from "../../utils/MathUtils";
import { SY } from "../base/Sprite";
import Camera from "../camera/Camera";
import { LightData } from "../data/LightData";
import { syGL } from "../gfx/syGLEnums";
import { G_LightCenter } from "../light/LightCenter";
import { syPrimitives } from "../shader/Primitives";
import { Line } from "./Line";
import { LineFrustum } from "./LineFrustum";

/**
 * 绘制的顶点数据
 */
var VertData = {
    position: [
        0, 0, 0, 20, 0, 0,   //x轴
        0, 0, 0, 0, 20, 0,   //y轴
        0, 0, 0, 0, 0, 20    //z轴
    ]
}
/**
 * 光照摄像机
 */
export class LightCamera extends SY.SpriteBase {
    private _frustum: LineFrustum;
    onInit(): void {
        this._cameraMatrix = glMatrix.mat4.identity(null);
        this._projectMatrix = glMatrix.mat4.identity(null);
        this._lightReverseDir = new Float32Array(3);
        this.addFrustum()
        this.addSmallSun();
        this.addLine();
        G_UISetting.pushRenderCallBack(this.render.bind(this))
    }
    protected collectRenderData(time): void {
        this._sunSprite.rotate(1, 1, 1);
       
        super.collectRenderData(time);
    }

    private _cameraMatrix: Float32Array;   //相机矩阵
    private _projectMatrix: Float32Array;  //投影矩阵
    private _lightReverseDir: Float32Array;
    private _near: number = 0.1;
    private _far: number = 50;
    private _projWidth: number = 10;
    private _projHeight: number = 10;
    private _fieldOfView: number = 60;//光张开的视角
    private _perspective: boolean = false;//是否为透视

    //看向的目标位置
    private _targetX: number = 0;
    private _targetY: number = 0;
    private _targetZ: number = 0;
    public set targetX(p: number) { this._targetX = p; }
    public set targetY(p: number) { this._targetY = p; }
    public set targetZ(p: number) { this._targetZ = p; }
    public get targetX(): number { return this._targetX; }
    public get targetY(): number { return this._targetY; }
    public get targetZ(): number { return this._targetZ; }
    //眼睛的位置
    private _eyeX: number = 0;
    private _eyeY: number = 0;
    private _eyeZ: number = 0;
    public set eyeX(p: number) { this._eyeX = p; }
    public set eyeY(p: number) { this._eyeY = p; }
    public set eyeZ(p: number) { this._eyeZ = p; }
    public get eyeX(): number { return this._eyeX; }
    public get eyeY(): number { return this._eyeY; }
    public get eyeZ(): number { return this._eyeZ; }

    public get perspective(): boolean {
        return this._perspective;
    }
    public set perspective(p: boolean) {
        this._perspective = p;
    }
    public get fieldOfView(): number { return this._fieldOfView };
    public set fieldOfView(p: number) { this._fieldOfView = p };
    public get projWidth(): number { return this._projWidth };
    public set projWidth(p: number) { this._projWidth = p };
    public get projHeight(): number { return this._projHeight };
    public set projHeight(p: number) { this._projHeight = p };
    /**
     * 获取光照摄像机数据
     */
    public updateLightCameraData() {
        // first draw from the POV of the light
        /**
         * lightWorldMatrix是光照摄像机的视野坐标系
         * x  y  z  p
         * 0  4  8  12
         * 1  5  9  13
         * 2  6  10 14 这个其实是光照方向
         * 3  7  11 15 
         * 
         * 1  0  0  0
         * 0  1  0  0
         * 0  0  1  0 这个其实是光照方向
         * 0  0  0  1 
         */
        glMatrix.mat4.lookAt2(this._cameraMatrix,
            [this._eyeX, this._eyeY, this._eyeZ],          // position
            [this._targetX, this._targetY, this._targetZ], // target
            [0, 1, 0],                                              // up
        )
        glMatrix.vec3.normalize(this._lightReverseDir, this._cameraMatrix.slice(8, 11));
        this.perspective ? glMatrix.mat4.perspective(this._projectMatrix,
            MathUtils.degToRad(this.fieldOfView),
            this._projWidth / this._projHeight,
            this._near,  // near
            this._far)   // far
            : glMatrix.mat4.ortho(this._projectMatrix,
                -this._projWidth / 2,   // left
                this._projWidth / 2,   // right
                -this._projHeight / 2,  // bottom
                this._projHeight / 2,  // top
                this._near,                      // near
                this._far);                      // far

        var lightData = G_LightCenter.lightData;
        //取摄像机的中心方向作为聚光灯的方向
        lightData.spot.direction = [this._lightReverseDir[0], this._lightReverseDir[1], this._lightReverseDir[2]];
        this._lightLine.updateLinePos(VertData.position.concat([0, 0, 0, lightData.parallel.dirX, lightData.parallel.dirY, lightData.parallel.dirZ]));
        this._lightLine.color = [lightData.parallel.colR, lightData.parallel.colG, lightData.parallel.colB, lightData.parallel.colA];

    }

    private _sunSprite: SY.sySprite;
    private _lightLine: Line;
    private addSmallSun(): void {
        this._sunSprite = new SY.sySprite();
        let vertexData = syPrimitives.createSphereVertices(1, 24, 24);
        this._sunSprite.createIndexsBuffer(vertexData.indices);
        this._sunSprite.createNormalsBuffer(vertexData.normal, 3);
        this._sunSprite.createUVsBuffer(vertexData.texcoord, 2);
        this._sunSprite.createVertexsBuffer(vertexData.position, 3);
        this._sunSprite.setScale(0.3, 0.3, 0.3);
        this._sunSprite.spriteFrame = "res/light.jpg";
        this.addChild(this._sunSprite);
    }
    private addLine(): void {
        this._lightLine = new Line();
        this._lightLine.updateLinePos(VertData.position.concat([0, 0, 0, 1, 1, 1]));
        this.addChild(this._lightLine);
    }
    /**
     * 添加裁切空间
     */
    private addFrustum(): void {
        this._frustum = new LineFrustum();
        this.addChild(this._frustum);
    }

    private render(setting): void {
        this.eyeX = setting.eyeX;
        this.eyeY = setting.eyeY;
        this.eyeZ = setting.eyeZ;
        this.targetX = setting.lightTargetX;
        this.targetY = setting.lightTargetY;
        this.targetZ = setting.lightTargetZ;
        this.projWidth = setting.lightProjWidth
        this.projHeight = setting.lightProjHeight

        this.updateLightCameraData();
        this._frustum.updateProjView(this._projectMatrix, this._cameraMatrix);

        this._sunSprite.setPosition(this.eyeX, this.eyeY, this.eyeZ);
        this._lightLine.setPosition(this.eyeX, this.eyeY, this.eyeZ);
        
        
    }
}