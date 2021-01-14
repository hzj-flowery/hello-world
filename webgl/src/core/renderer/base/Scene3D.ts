import Scene from "./Scene";
import Ground from "../3d/Ground";
import Cube from "../3d/Cube";
import LightCube from "../3d/LightCube";
import SkyBox from "../3d/SkyBox";
import { Node } from "./Node";
import CustomTextureCube from "../3d/CustomTextureCube";
import CustomTextureData from "../data/CustomTextureData";
import { gltex_config_format } from "../gfx/GLEnums";
import Sphere from "../3d/Sphere";
import Spine from "./spine/Spine";
import { SpotLight } from "../light/SpotLight";
import { ThreeDLight } from "../light/ThreeDLight";
import MirrorCube from "../3d/MirrorCube";
import { PointLightFCube } from "../3d/PointLightFCube";
import { Line } from "../3d/Line";
import { G_UISetting } from "../../ui/UiSetting";
import PointLightCube from "../3d/PointLightCube";

export default class Scene3D extends Scene {

    private _lightCube: LightCube;
    private _skybox: SkyBox;
    private _floorNode: Ground;
    private _cubeNode: Cube;
    private _tableNode: Cube;
    private _spineNode: Spine;
    private _pointLightCube:PointLightCube;
    private _customTexture: CustomTextureCube;
    private _centerNode: Node;
    private _mirrorCube:MirrorCube;
    private _FLightPoint:PointLightFCube;
    private _FLightSpot:SpotLight;
    private _FLightThreeD:ThreeDLight;
    private _sphere: Sphere;
    constructor() {
        super();
    }
    public init(): void {
        
        // let lightNode = new Node();
        // this.addChild(lightNode);
        // this._FLightPoint = new PointLightFCube();
        // this._FLightPoint.rotateX = 0;
        // this._FLightPoint.setPosition(-50, -75, -15);
        // lightNode.addChild(this._FLightPoint);
        // this._FLightPoint.Url = "res/models/char/F.json";

        // this._FLightSpot = new SpotLight();
        // this._FLightSpot.setPosition(0,-20,-100);
        // this.addChild(this._FLightSpot);
        // this._FLightSpot.Url = "res/models/char/F.json";

        // this._FLightThreeD = new ThreeDLight();
        // this._FLightThreeD.setPosition(0,20,-100);
        // this.addChild(this._FLightThreeD);
        // this._FLightThreeD.Url = "res/models/char/F.json";

        
        this._centerNode = new Node();
        this._centerNode.setPosition(0, 1.1, 0);
        this.addChild(this._centerNode);
        

       

        var spNode = new Node();
        this._sphere = new Sphere();
        spNode.setPosition(0, 5, 0);
        spNode.addChild(this._sphere);
        this._centerNode.addChild(spNode);

        this._floorNode = new Ground();
        this._floorNode.spriteFrame = "res/ground.jpg";
        this.addChild(this._floorNode);

        this._spineNode = new Spine();
        this._spineNode.x = 0;
        this.addChild(this._spineNode);

        this._customTexture = new CustomTextureCube();
        this._customTexture.spriteFrame = CustomTextureData.getRandomData(3, 5, gltex_config_format.RGB8);
        this._customTexture.setPosition(0, 3.1, 0);
        this._centerNode.addChild(this._customTexture);

        this._tableNode = new Cube();
        this._tableNode.spriteFrame = "res/wood.jpg";
        this._tableNode.setPosition(0, 1, 0);
        this._tableNode.setScale(2.0, 0.1, 2.0);
        this._centerNode.addChild(this._tableNode);

        this._cubeNode = new Cube();
        this._cubeNode.spriteFrame = "res/wicker.jpg";
        this._cubeNode.setPosition(0, 1.7, 0);
        this._cubeNode.setScale(0.5, 0.5, 0.5);
        this._centerNode.addChild(this._cubeNode);

        this._pointLightCube = new PointLightCube();
        this._pointLightCube.setPosition(-2.7, 0, 10);
        this._centerNode.addChild(this._pointLightCube);

        

        // 绘制 4 个腿
        for (var i = -1; i <= 1; i += 2) {
            for (var j = -1; j <= 1; j += 2) {
                var node = new Cube();
                node.setPosition(i * 19, -0.1, j * 19);
                node.setScale(0.1, 1.0, 0.1);
                node.spriteFrame = "res/wood.jpg";
                this._centerNode.addChild(node);
            }
        }

        this._lightCube = new LightCube();
        this._lightCube.spriteFrame = "res/wicker.jpg";
        this._lightCube.setPosition(-5, 2.7, 0);
        this._lightCube.setScale(0.5, 0.5, 0.5);
        this._centerNode.addChild(this._lightCube);
        
        

        this._skybox = new SkyBox();
        this._skybox.setDefaultUrl();
        this.addChild(this._skybox);

        let tempNode = new Node();
        tempNode.setPosition(-10,-3.0,0);
        this.addChild(tempNode);
        this._mirrorCube = new MirrorCube();
        this._mirrorCube.setDefaultUrl();
        tempNode.addChild(this._mirrorCube);

        this.setPosition(0, 0, 0);
        // setTimeout(this.rotateCenterNode.bind(this), 20);

    }
    
    public rotateCenterNode() {
        this._centerNode.rotate(0, 1, 0);
        this._mirrorCube.rotate(1,-1,-0.2);
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
            this._floorNode.spriteFrame = "res/ground.jpg";
            this._cubeNode.spriteFrame = "res/wicker.jpg";
            this._tableNode.spriteFrame = "res/wood.jpg";
        }, 7000)
    }
}