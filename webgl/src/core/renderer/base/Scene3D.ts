import Scene from "./Scene";
import Ground from "../3d/Ground";
import Cube from "../3d/Cube";
import LightCube from "../3d/ParallelLightCube";
import SkyBox from "../3d/SkyBox";
import { Node } from "./Node";
import CustomTextureCube from "../3d/CustomTextureCube";
import CustomTextureData from "../data/CustomTextureData";
import Sphere from "../3d/Sphere";
import Spine from "./spine/Spine";
import MirrorCube from "../3d/MirrorCube";
import { Line } from "../3d/Line";
import { G_UISetting } from "../../ui/UiSetting";
import PointLightCube from "../3d/PointLightCube";
import SpotLightCube from "../3d/SpotLightCube";
import { FogCube } from "../3d/FogCube";
import { glMatrix } from "../../math/Matrix";
import { syGL } from "../gfx/syGLEnums";
import { DeferredShading } from "../3d/DeferredShading";
import { RTT } from "../3d/RTT";
import Device from "../../Device";
import { RenderOffline3DSprite } from "../3d/RenderOffline3DSprite";
import { syRender } from "../data/RenderData";
import { LightCamera } from "../3d/LightCamera";
import ShadowCube from "../3d/ShadowCube";
import { Plane } from "../3d/Plane";
import { ThreeDF } from "../3d/ThreeDF";
import RobartInstantiate from "../3d/RobartInstantiate";

export default class Scene3D extends Scene {

    private _lightCube: LightCube;
    private _skybox: SkyBox;
    private _floorNode: Ground;
    private _plane:Plane;
    private _cubeNode: Cube;
    private _testAlphaCube:Cube;
    private _deferredShading: DeferredShading;
    private _renderSprite: RenderOffline3DSprite;
    private _renderSprite1: RenderOffline3DSprite;
    private _renderSprite2: RenderOffline3DSprite;
    private _rtt: RTT;
    private _tableNode: Cube;
    private _alphaNode: Cube;
    private _spineNode: Spine;
    private _pointLightCube: PointLightCube;
    private _spotLightCube: SpotLightCube;
    private _fogCubeArr: Array<FogCube>;
    private _customTexture: CustomTextureCube;
    private _centerNode: Node;
    private _shadowCube:ShadowCube;
    private _mirrorCube: MirrorCube;
    private _robart:RobartInstantiate;
    private _sphere: Sphere;
    constructor() {
        super();
    }
    public init(): void {

        
        this._centerNode = new Node();
        this._centerNode.setPosition(0, 1.1, 0);
        this.addChild(this._centerNode);


        this._plane = new Plane(200,200);
        this._plane.setCellCounts(40,40);
        this.addChild(this._plane);

        
        this._shadowCube = new ShadowCube();
        this._shadowCube.spriteFrame = "res/tree.png";
        this._shadowCube.setPosition(-10,0,0);
        this._centerNode.addChild(this._shadowCube);


        var spNode = new Node();
        this._sphere = new Sphere();
        this._sphere.spriteFrame="res/ball.jpg";
        spNode.setPosition(3,3, 0);
        spNode.addChild(this._sphere);
        this._centerNode.addChild(spNode);

        this._robart = new RobartInstantiate();
        this._robart.x = 5;
        this._robart.y = 10;
        this.addChild(this._robart);
        // this._floorNode = new Ground();
        // this._floorNode.spriteFrame = "res/ground.jpg";
        // this._floorNode.z = -20;
        // this.addChild(this._floorNode);

       
        this._spineNode = new Spine();
        this._spineNode.x = -5;
        this._spineNode.y = 10;
        this.addChild(this._spineNode);

        // this._customTexture = new CustomTextureCube();
        // this._customTexture.spriteFrame = CustomTextureData.getRandomData(3, 5, syGL.TextureFormat.RGB8);
        // this._customTexture.setPosition(0, 3.1, 0);
        // this._centerNode.addChild(this._customTexture);

        

        // this._alphaNode = new Cube();
        // // this._alphaNode.alpha = 0.3
        // this._alphaNode.spriteFrame = "res/good.jpg";
        // this._alphaNode.setPosition(0, 3, 0);
        // this._alphaNode.setScale(2.0, 2.0, 2.0);
        // this._centerNode.addChild(this._alphaNode);


 
        //  this._threeDF = new ThreeDF();
        //  this._threeDF.spriteFrame="res/dragon.png";
        //  this._threeDF.setPosition(0,0,-200);
        //  this._centerNode.addChild(this._threeDF);


        // this._deferredShading = new DeferredShading();
        // this._deferredShading.spriteFrame = "res/dragon.png";
        // this._deferredShading.setPosition(-3,10,0);
        // this._centerNode.addChild(this._deferredShading);

        // this._renderSprite = new RenderOffline3DSprite();
        // this._renderSprite.setRenderTextureUUid(syRender.RenderTextureUUid.other1);
        // this._renderSprite.spriteFrame = {
        //     place:syRender.AttachPlace.Color,
        // }
        // this._renderSprite.setPosition(-3,10,0);
        // this._centerNode.addChild(this._renderSprite);

        // this._renderSprite1 = new RenderOffline3DSprite();
        // this._renderSprite1.setRenderTextureUUid(syRender.RenderTextureUUid.other2);
        // this._renderSprite1.spriteFrame = {
        //     place:syRender.AttachPlace.Color,
        // }
        // this._renderSprite1.setPosition(3,10,0);
        // this._centerNode.addChild(this._renderSprite1);


        this._rtt = new RTT();
        this._rtt.spriteFrame = {
            place: syRender.AttachPlace.MoreColor,
            param: [
                { type: syRender.DeferredTexture.None, value: "res/deferred.png" },
                { type: syRender.DeferredTexture.Color, value: null },
                { type: syRender.DeferredTexture.Position, value: null },
                { type: syRender.DeferredTexture.Normal, value: null },
                { type: syRender.DeferredTexture.UV, value: null },
                { type: syRender.DeferredTexture.Depth, value: null }]
        }
        this._rtt.setPosition(-6, 10, 0);
        this._centerNode.addChild(this._rtt);

      

        // this._pointLightCube = new PointLightCube();
        // this._pointLightCube.setScale(100,0.1,100.0);
        // this._pointLightCube.setPosition(0, -10, 0);
        // this._pointLightCube.spriteFrame = "res/dragon.jpg";
        // this._centerNode.addChild(this._pointLightCube);
        this._spotLightCube = new SpotLightCube();
        this._spotLightCube.setScale(100,50.0,10.0);
        this._spotLightCube.setPosition(0, 0, -130);
        this._spotLightCube.spriteFrame = "res/dragon.jpg";
        this._centerNode.addChild(this._spotLightCube);

        // this._fogCubeArr = [];
        // let fogCubeNums = 40;
        // let fogNode = new Node();
        // this._centerNode.addChild(fogNode);
        // for(let j = 0;j<fogCubeNums;j++)
        // {
        //     let fog = new FogCube();
        //     fog.spriteFrame = "resources/f-texture.png";
        //     fog.setPosition(-2+j*1.1,0, j*2);
        //     fogNode.addChild(fog);
        //     this._fogCubeArr.push(fog);
        // }
        

        
        
           
        this._cubeNode = new Cube();
        this._cubeNode.spriteFrame = "res/wicker.jpg";
        this._cubeNode.setPosition(0, 1.7, 0);
        this._cubeNode.setScale(0.5, 0.5, 0.5);
        this._centerNode.addChild(this._cubeNode);
        this._tableNode = new Cube();
        this._tableNode.spriteFrame = "res/wood.jpg";
        this._tableNode.setPosition(0, 1, 0);
        this._tableNode.setScale(2.0, 0.1, 2.0);
        this._centerNode.addChild(this._tableNode);

        this._testAlphaCube = new Cube();
        this._testAlphaCube.spriteFrame = "res/ground.png";
        this._testAlphaCube.setPosition(0, 0, -20);
        this._testAlphaCube.setScale(10, 5, 1);
        this._centerNode.addChild(this._testAlphaCube);

        // 绘制 4 个腿
        for (var i = -1; i <= 1; i += 2) {
            for (var j = -1; j <= 1; j += 2) {
                var node = new Cube();
                node.setPosition(i * 1.9, -0.1, j * 1.9);
                node.setScale(0.1, 1.0, 0.1);
                node.spriteFrame = "res/wood.jpg";
                this._centerNode.addChild(node);
            }
        }
        
        // this._lightCube = new LightCube();
        // this._lightCube.spriteFrame = "res/wicker.jpg";
        // this._lightCube.setPosition(0,5,5);
        // this._lightCube.setScale(0.5, 0.5, 0.5);
        // this._centerNode.addChild(this._lightCube);

        

        this._skybox = new SkyBox();
        this._skybox.setDefaultUrl();
        this.addChild(this._skybox);

        this._mirrorCube = new MirrorCube();
        this._mirrorCube.setDefaultUrl();
        this._mirrorCube.setPosition(-13,3.0,0);
        this.addChild(this._mirrorCube);

        this._centerNode.addChild(new LightCamera());

        G_UISetting.pushRenderCallBack((data)=>{
            // this._robart.setPosition(-5,10,data.customValue?-data.customValue:0)
            // var cg = (data.customValue?-data.customValue:0.1)/10000;
            // this._robart.setScale(cg,cg,cg)
            // this._pointLightCube.setPosition(0,data.customValue?-data.customValue:0,0)
            // this._spotLightCube.setPosition(0,0,data.customValue?-data.customValue:-130)
        //     this._lightCube.setRotation(0,data.customValue?data.customValue:0,0)
        //     this._lightCube.setPosition(0,data.customValue1?data.customValue1:0,5)
        //     this._lightCube.setScale(data.customValue2?data.customValue2:1,data.customValue2?data.customValue2:1,data.customValue2?data.customValue2:1)
        })
        this.setPosition(0, 0, 0);
        setTimeout(this.rotateCenterNode.bind(this), 20);

    }

    protected collectRenderData(time): void {
        // this._fogCubeArr.forEach((fog,index)=>{
        //     fog.rotate(0,1,0)
        // })
        super.collectRenderData(time);
    }

    public rotateCenterNode() {
        // this._centerNode.rotate(0, 1, 0);
        // this._mirrorCube.rotate(1,-1,-0.2);
        // setTimeout(this.rotateCenterNode.bind(this), 20);
    }
    private readyRenderDraw(): void {

    }
    private deleteGPUTexture(): void {
        // setTimeout(() => {
        //     this._floorNode.destroy();
        //     this._cubeNode.destroy();
        //     this._tableNode.destroy();
        // }, 5000)
        // setTimeout(() => {
        //     this._floorNode.spriteFrame = "res/ground.jpg";
        //     this._cubeNode.spriteFrame = "res/wicker.jpg";
        //     this._tableNode.spriteFrame = "res/wood.jpg";
        // }, 7000)
    }
}