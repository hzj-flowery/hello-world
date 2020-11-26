import Scene from "./Scene";
import Ground from "../3d/Ground";
import Cube from "../3d/Cube";
import LightCube from "../3d/LightCube";
import SkyBox from "../3d/SkyBox";
import Device from "../../../Device";
import { Node } from "./Node";
import CameraView from "../camera/CameraView";
import CustomTextureCube from "../3d/CustomTextureCube";
import CustomTextureData from "../data/CustomTextureData";
import { gltex_format } from "../gfx/GLEnums";
import GameMainCamera from "../camera/GameMainCamera";
import { couldStartTrivia } from "typescript";
import enums from "../camera/enums";
import OrthoCamera from "../camera/OrthoCamera";
import PerspectiveCamera from "../camera/PerspectiveCamera";
import Sphere from "../3d/Sphere";
import Spine from "../3d/Spine";
import { CameraFrustum } from "../camera/CameraFrustum";
import { glMatrix } from "../../Matrix";
import { MathUtils } from "../../utils/MathUtils";
import Camera from "../camera/Camera";
import { G_CameraModel } from "../camera/CameraModel";
import { PointLight } from "../light/PointLight";

export default class Scene3D extends Scene {

    private _lightCube: LightCube;
    private _skybox: SkyBox;
    private _floorNode: Ground;
    private _cubeNode: Cube;
    private _tableNode: Cube;
    private _spineNode: Spine;
    private _customTexture: CustomTextureCube;
    private _centerNode: Node;
    private _3dCamera: PerspectiveCamera;
    private _FLight:PointLight;
    private _sphere: Sphere;

      
    constructor() {
        super();
    }
    public init(): void {
        
        G_CameraModel.setRenderCallBack(this.renderCallBack.bind(this));
        
       

        this._FLight = new PointLight();
        // this._FLight.setScale(0.2,0.2,0.2);
        this._FLight.setPosition(0,0,300);
        this.addChild(this._FLight);
        this._FLight.Url = "res/models/char/F.json";

        this.renderCallBack(G_CameraModel.getSettings());


        var gl = Device.Instance.gl;
        this._centerNode = new Node();
        this._centerNode.setPosition(0, 1.1, 0);
        this.addChild(this._centerNode);

        var spNode = new Node();
        this._sphere = new Sphere(gl);
        spNode.setPosition(0, 5, 0);
        spNode.addChild(this._sphere);
        this._centerNode.addChild(spNode);

        this._floorNode = new Ground(gl);
        this._floorNode.url = "res/ground.jpg";
        this.addChild(this._floorNode);

        this._spineNode = new Spine(gl);
        this._spineNode.x = 0;
        this.addChild(this._spineNode);

        this._customTexture = new CustomTextureCube(gl);
        this._customTexture.url = CustomTextureData.getRandomData(3, 5, gltex_format.RGB8);
        this._customTexture.setPosition(0, 3.1, 0);
        this._centerNode.addChild(this._customTexture);

        this._tableNode = new Cube(gl);
        this._tableNode.url = "res/wood.jpg";
        this._tableNode.setPosition(0, 1, 0);
        this._tableNode.setScale(2.0, 0.1, 2.0);
        this._centerNode.addChild(this._tableNode);
        this._cubeNode = new Cube(gl);
        this._cubeNode.url = "res/wicker.jpg";
        this._cubeNode.setPosition(0, 1.7, 0);
        this._cubeNode.setScale(0.5, 0.5, 0.5);
        this._centerNode.addChild(this._cubeNode);

        // 绘制 4 个腿
        for (var i = -1; i <= 1; i += 2) {
            for (var j = -1; j <= 1; j += 2) {
                var node = new Cube(gl);
                node.setPosition(i * 19, -0.1, j * 19);
                node.setScale(0.1, 1.0, 0.1);
                node.url = "res/wood.jpg";
                this._centerNode.addChild(node);
            }
        }

        this._lightCube = new LightCube(gl);
        this._lightCube.url = "res/wicker.jpg";
        this._lightCube.setPosition(1, 2.7, 0);
        this._lightCube.setScale(0.5, 0.5, 0.5);
        this._centerNode.addChild(this._lightCube);

        this._skybox = new SkyBox(gl);
        this._skybox.setDefaultUrl();
        this.addChild(this._skybox);


       


        this.setPosition(0, 0, 0);



        setTimeout(this.rotateCenterNode.bind(this), 20);

        
    }
    
    private renderCallBack(settings:any):void{
        let gl = Device.Instance.gl;
        this._3dCamera = GameMainCamera.instance.setCamera(enums.PROJ_PERSPECTIVE, gl.canvas.width / gl.canvas.height,
            settings.cam1FieldOfView,settings.cam1Near,settings.cam1Far) as PerspectiveCamera;
        this._3dCamera.setPosition(settings.cam1PosX,settings.cam1PosY,settings.cam1PosZ);
        this._3dCamera.setRotation(settings.cam1RotX,settings.cam1RotY,settings.cam1RotZ);
        this._FLight.setPosition(settings.posX,settings.posY,settings.posZ);
        // this.setPosition(settings.posX,settings.posY,settings.posZ);
    }
    public rotateCenterNode() {
        this._centerNode.rotate(0, 1, 0);
        setTimeout(this.rotateCenterNode.bind(this), 20);
    }
    private readyRenderDraw(): void {

    }
    private deleteGPUTexture(): void {
        setTimeout(() => {
            this._floorNode.destroy();
            this._cubeNode.destroy();
            this._tableNode.destroy();
        }, 5000)
        setTimeout(() => {
            this._floorNode.url = "res/ground.jpg";
            this._cubeNode.url = "res/wicker.jpg";
            this._tableNode.url = "res/wood.jpg";
        }, 7000)
    }
    
    //获取摄像机
    public getCamera():Camera{
        return this._3dCamera;
    }

    public visit(time): void {
        // this._3dCamera.rotate(0,0,1);
        this._3dCamera.visit(time);
        super.visit(time);
    }
}