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

export default class Scene3D extends Scene {

    private _lightCube: LightCube;
    private _skybox: SkyBox;
    private _floorNode: Ground;
    private _cubeNode: Cube;
    private _tableNode: Cube;
    private _spineNode:Spine;
    private _customTexture: CustomTextureCube;
    private _cameraView:CameraView;
    private _centerNode:Node;
    private _3dCamera:PerspectiveCamera;
    private _cameraFrustum:CameraFrustum;
    private _sphere:Sphere;
    constructor() {
        super();
    }
    public init(): void {
        
        var gl = Device.Instance.gl;
        this._3dCamera = GameMainCamera.instance.setCamera(enums.PROJ_PERSPECTIVE,gl.canvas.width/gl.canvas.height) as PerspectiveCamera;
        
        this._centerNode = new Node();
        this._centerNode.setPosition(0, 1.1, 0);
        this.addChild(this._centerNode);
        
        var spNode = new Node();
        this._sphere = new Sphere(gl);
        spNode.setPosition(0,5,0);
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
        
        this._cameraView = new CameraView(gl);
        this.addChild(this._cameraView);

        this._cameraFrustum = new CameraFrustum(gl);

        this._3dCamera.rotate(0,90,0);
        this._3dCamera.lookAt([0,0,-50]);
        this.setPosition(10,0,0);

        

        setTimeout(this.rotateCenterNode.bind(this),20);
    }
    public rotateCenterNode(){
        this._centerNode.rotate(0,1,0);
        setTimeout(this.rotateCenterNode.bind(this),20);
    }
    private readyRenderDraw():void{

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
    
    public readyDraw(time): void {
        this._3dCamera.rotate(0,0,1);
        this._3dCamera.readyDraw(time);
        
        var vp = this._3dCamera.getVP();
        this._cameraFrustum.testDraw(vp,this._3dCamera.Aspect,this._3dCamera.Near,this._3dCamera.Far/10,MathUtils.radToDeg(this._3dCamera.Fovy));

        
        super.readyDraw(time);
    }
}