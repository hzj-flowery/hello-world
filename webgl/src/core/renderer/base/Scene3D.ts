import Scene from "./Scene";
import Cube from "../3d/Cube";
import SkyBox from "../3d/SkyBox";
import { Node } from "./Node";
import CustomTextureCube from "../3d/CustomTextureCube";
import CustomTextureData from "../data/CustomTextureData";
import Sphere from "../3d/Sphere";
import Spine from "./spine/Spine";
import MirrorCube from "../3d/MirrorCube";
import { Line } from "../3d/Line";
import { G_UISetting } from "../../ui/UiSetting";
import { glMatrix } from "../../math/Matrix";
import { syGL } from "../gfx/syGLEnums";
import { DeferredShading } from "../3d/DeferredShading";
import { RTT, RTTTest } from "../3d/RTT";
import Device from "../../Device";
import { RenderOffline3DSprite } from "../3d/RenderOffline3DSprite";
import { syRender } from "../data/RenderData";
import { LightCamera } from "../3d/LightCamera";
import ShadowCube from "../3d/ShadowCube";
import { Plane } from "../3d/Plane";
import { ThreeDF } from "../3d/ThreeDF";
import RobartInstantiate from "../3d/RobartInstantiate";
import ObjNode from "../3d/ObjNode";
import { syStateStringKey, syStateStringValue } from "../gfx/State";
import Mirror from "../3d/Mirror";
import { Object3D } from "../3d/Object3D";
import { UCS } from "../3d/UCS";
import { GameMainCamera } from "../camera/GameMainCamera";
import { BoxGeometry } from "../3d/geometry/BoxGeometry";
import { CircleGeometry } from "../3d/geometry/CircleGeometry";
import { TeapotGeometry } from "../3d/geometry/TeapotGeometry";
import { TubeGeometry } from "../3d/geometry/TubeGeometry";
import { IcosahedronGeometry } from "../3d/geometry/IcosahedronGeometry";
import { DodecahedronGeometry } from "../3d/geometry/DodecahedronGeometry";
import { RingGeometry } from "../3d/geometry/RingGeometry";
import { WireframeGeometry } from "../3d/geometry/WireframeGeometry";
import { LatheGeometry } from "../3d/geometry/LatheGeometry";
import { SphereGeometry } from "../3d/geometry/SphereGeometry";
import { TorusKnotGeometry } from "../3d/geometry/TorusKnotGeometry";
import { TorusGeometry } from "../3d/geometry/TorusGeometry";
import { Vector2 } from "../../math/Vector2";
import { PlaneGeometry } from "../3d/geometry/PlaneGeometry";
import { sy } from "../../Director";
import { SY } from "./Sprite";

export default class Scene3D extends Scene {

    private _cube1: Cube;
    private _skybox: SkyBox;
    private _plane:Plane;
    private _cubeNode: Cube;
    private _cubebumpNode: Cube;
    private _testAlphaCube:Cube;
    private _deferredShading: DeferredShading;
    private _renderSprite: RenderOffline3DSprite;
    private _ucs: UCS;
    private _rtt: RTT;
    private _rttTest:RTTTest;
    private _tableNode: Cube;
    private _alphaNode: Cube;
    private _spineNode: Spine;
    private _cube2: Cube;
    private _objNode:ObjNode;
    private _spotLightCube: Cube;
    private _fogCubeArr: Array<Cube>;
    private _customTexture: CustomTextureCube;
    private _centerNode: Node;
    private _shadowCube:ShadowCube;
    private _mirrorCube: MirrorCube;
    private _mirror:Mirror;
    private _robart:RobartInstantiate;
    private _sphere: Sphere;
    constructor() {
        super();
    }
    public init(): void {

        
        this._centerNode = new Node();
        this._centerNode.setPosition(0, 1.1, 0);
        this.addChild(this._centerNode);


        this._plane = new Plane(500,500,100,20);
        this._plane.rotateX = 90;
        this._plane.setScale(0.05,0.05,0.05)
        this._plane.pushPassContent(syRender.ShaderType.Sprite,[
            [syStateStringKey.cullMode,syStateStringValue.cullMode.NONE],
            [syStateStringKey.primitiveType,syStateStringValue.primitiveType.PT_TRIANGLES]
        ],[
            [syRender.PassCustomKey.DefineUse,syRender.ShaderDefineValue.SY_USE_TEXTURE_ONE],
            [syRender.PassCustomKey.DefineUse,syRender.ShaderDefineValue.SY_USE_FUNC_RIVER_FLOW]
        ]);
        this._plane.spriteFrame = "res/river.jpg"
        this.addChild(this._plane);
        this._plane.spriteFrame = "res/caustics.png";

      


        
        this._shadowCube = new ShadowCube();
        this._shadowCube.spriteFrame = "res/tree.png";
        this._shadowCube.setPosition(-10,0,0);
        this._centerNode.addChild(this._shadowCube);
        

        this._ucs = new UCS();
        this._ucs.setPosition(-10,12,0);
        this._centerNode.addChild(this._ucs)

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


       
        this._spineNode = new Spine();
        this._spineNode.x = -5;
        this._spineNode.y = 10;
        this.addChild(this._spineNode);

       

        this._customTexture = new CustomTextureCube();
        this._customTexture.spriteFrame = CustomTextureData.getRandomData(3, 5, syGL.TextureFormat.RGB8);
        this._customTexture.setPosition(0, 3.1, 0);
        this._centerNode.addChild(this._customTexture);

        

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
        this._rtt.gZOrder = 500;
        this._rtt.spriteFrame = {
            place: syRender.AttachPlace.MoreColor,
            param: [
                { type: syRender.BuiltinTexture.TEXTURE0, value: "res/deferred.png" },
                { type: syRender.BuiltinTexture.MAP_G_COLOR, value: null },
                { type: syRender.BuiltinTexture.MAP_G_POSITION, value: null },
                { type: syRender.BuiltinTexture.MAP_G_NORMAL, value: null },
                { type: syRender.BuiltinTexture.MAP_G_UV, value: null },
                { type: syRender.BuiltinTexture.MAP_G_DEPTH, value: null }
            ]
        }
        this._rtt.setPosition(-6, 10, 0);
        this._centerNode.addChild(this._rtt);

        this._rttTest = new RTTTest();
        this._rttTest.pushPassContent(syRender.ShaderType.RTT_Use)
        this._rttTest.gZOrder = 501;
        this._rttTest.setPosition(-5.5, 10, 0);
        this._centerNode.addChild(this._rttTest);

        // this._cube2 = new Cube();
        // this._cube2.setScale(100,0.1,100.0);
        // this._cube2.setPosition(0, -10, 0);
        // this._cube2.spriteFrame = "res/dragon.jpg";
        // this._centerNode.addChild(this._cube2);
        this._spotLightCube = new Cube();
        this._spotLightCube.setScale(100,50.0,10.0);
        this._spotLightCube.setPosition(0, 0, -130);
        this._spotLightCube.spriteFrame = "res/dragon.jpg";
        this._centerNode.addChild(this._spotLightCube);


        this._fogCubeArr = [];
        let fogCubeNums = 40;
        let fogNode = new Node();
        this._centerNode.addChild(fogNode);
        for(let j = 0;j<fogCubeNums;j++)
        {
            let fog = new Cube();
            fog.spriteFrame = "resources/f-texture.png";
            fog.setPosition(-2+j*1.1,0, j*2);
            fogNode.addChild(fog);
            this._fogCubeArr.push(fog);
        }
        

        
        
           
        // this._cubeNode = new Cube();
        // this._cubeNode.spriteFrame = "res/normal/normal/brick_diffuse.jpg";
        // this._cubeNode.setPosition(-3, 3.7, 5);
        // this._centerNode.addChild(this._cubeNode);

        // this._cubebumpNode = new Cube();
        // this._cubebumpNode.spriteFrame = "res/normal/normal/brick_diffuse.jpg";
        // this._cubebumpNode.setPosition(-6, 3.7, 5);
        // this._cubebumpNode.setBuiltSpriteFrame("res/normal/normal/brick_normal.jpg",syRender.BuiltinTexture.MAP_NORMAL)
        // this._centerNode.addChild(this._cubebumpNode);

        


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
        
        // this._cube1 = new Cube();
        // this._cube1.spriteFrame = "res/wicker.jpg";
        // this._cube1.setPosition(0,5,5);
        // this._cube1.setScale(0.5, 0.5, 0.5);
        // this._centerNode.addChild(this._cube1);

        

        this._skybox = new SkyBox();
        this._skybox.setDefaultUrl();
        this.addChild(this._skybox);

        // var boxG = new BoxGeometry(5);
        // boxG.pushPassContent(syRender.ShaderType.Sprite)
        // boxG.spriteFrame = "res/wicker.jpg";
        // boxG.setPosition(-3,5,5);
        // this.addChild(boxG);

        // var circleG = new CircleGeometry(5);
        // circleG.pushPassContent(syRender.ShaderType.Sprite)
        // circleG.spriteFrame = "res/wicker.jpg";
        // circleG.setPosition(3,5,5);
        // this.addChild(circleG);

        // var teapotG = new TeapotGeometry(1);
        // teapotG.pushPassContent(syRender.ShaderType.Sprite,[
        //     [syStateStringKey.primitiveType,syStateStringValue.primitiveType.PT_TRIANGLES]
        // ],[
        //     // [syRender.PassCustomKey.DefineUse,syRender.ShaderDefineValue.SY_USE_TEXTURE,syRender.ShaderDefineValue.SY_USE_REMOVE_DEFINE]
        // ]
        // )
        // teapotG.spriteFrame = "res/1.jpg";
        // // teapotG.setColor(255,0.0,0.0,255)
        // teapotG.setPosition(3,5,5);
        // this.addChild(teapotG);

      
        // var boxG = new BoxGeometry(2, 2, 2, 32, 32, 32);
        // boxG.addMorphGeometry()
        // boxG.pushPassContent(syRender.ShaderType.Sprite,[
        // ],[
        //     // [syRender.PassCustomKey.DefineUse,syRender.ShaderDefineValue.SY_USE_TEXTURE,syRender.ShaderDefineValue.SY_USE_REMOVE_DEFINE]
        //     [syRender.PassCustomKey.DefineUse,syRender.ShaderDefineValue.SY_USE_MORPHTARGETS],
        //     [syRender.PassCustomKey.DefineUse,syRender.ShaderDefineValue.SY_USE_MORPHTARGETS_RELATIVE],
        //     [syRender.PassCustomKey.DefineUse,syRender.ShaderDefineValue.SY_USE_FUNC_CATCH_FIRE],
        //     [syRender.PassCustomKey.DefineUse,syRender.ShaderDefineValue.SY_USE_FUNC_UNPACK_CUSTOM_TONE_MAPPING,syRender.ToneMapping.ACESFilmicToneMapping]
        // ])
        // boxG.spriteFrame = "res/1.jpg";
        // boxG.setPosition(3,8,5);
        // this.addChild(boxG);

        var boxG = new BoxGeometry(2, 2, 2, 32, 32, 32);

        boxG.pushPassContent(syRender.ShaderType.ShadowMap, [], [
            [syRender.PassCustomKey.DefineUse, syRender.ShaderDefineValue.SY_USE_FUNC_PACK]
        ]);

        boxG.pushPassContent(syRender.ShaderType.Sprite, [], [
            [syRender.PassCustomKey.DefineUse, syRender.ShaderDefineValue.SY_USE_FUNC_UNPACK],

            [syRender.PassCustomKey.DefineUse, syRender.ShaderDefineValue.SY_USE_NORMAL],
            [syRender.PassCustomKey.DefineUse, syRender.ShaderDefineValue.SY_USE_MAT],
            [syRender.PassCustomKey.DefineUse, syRender.ShaderDefineValue.SY_USE_LIGHT_AMBIENT],
            // [syRender.PassCustomKey.DefineUse,syRender.ShaderDefineValue.SY_USE_LIGHT_SPOT],
            [syRender.PassCustomKey.DefineUse, syRender.ShaderDefineValue.SY_USE_LIGHT_PARALLEL],
            // [syRender.PassCustomKey.DefineUse,syRender.ShaderDefineValue.SY_USE_LIGHT_POINT],
            // [syRender.PassCustomKey.DefineUse,syRender.ShaderDefineValue.SY_USE_LIGHT_SPECULAR],
            [syRender.PassCustomKey.DefineUse, syRender.ShaderDefineValue.SY_USE_FOG]
        ]);
        boxG.spriteFrame = "res/normal/normal/brick_diffuse.jpg";
        boxG.setPosition(0,8,5);
        this.addChild(boxG);


        var boxG1 = new BoxGeometry(2, 2, 2, 32, 32, 32);
        boxG1.pushPassContent(syRender.ShaderType.ShadowMap, [], [
            [syRender.PassCustomKey.DefineUse, syRender.ShaderDefineValue.SY_USE_FUNC_PACK]
        ]);
        boxG1.pushPassContent(syRender.ShaderType.Sprite, [], [
            [syRender.PassCustomKey.DefineUse, syRender.ShaderDefineValue.SY_USE_FUNC_UNPACK],
            [syRender.PassCustomKey.DefineUse, syRender.ShaderDefineValue.SY_USE_NORMAL],
            [syRender.PassCustomKey.DefineUse,syRender.ShaderDefineValue.SY_USE_TANGENT],
            [syRender.PassCustomKey.DefineUse, syRender.ShaderDefineValue.SY_USE_MAT],
            [syRender.PassCustomKey.DefineUse, syRender.ShaderDefineValue.SY_USE_LIGHT_AMBIENT],
            // [syRender.PassCustomKey.DefineUse,syRender.ShaderDefineValue.SY_USE_LIGHT_SPOT],
            [syRender.PassCustomKey.DefineUse, syRender.ShaderDefineValue.SY_USE_LIGHT_PARALLEL],
            // [syRender.PassCustomKey.DefineUse,syRender.ShaderDefineValue.SY_USE_LIGHT_POINT],
            // [syRender.PassCustomKey.DefineUse,syRender.ShaderDefineValue.SY_USE_LIGHT_SPECULAR],
            [syRender.PassCustomKey.DefineUse, syRender.ShaderDefineValue.SY_USE_FOG]
        ]);
        boxG1.spriteFrame = "res/normal/normal/brick_diffuse.jpg";
        boxG1.setBuiltSpriteFrame("res/normal/normal/brick_normal.jpg",syRender.BuiltinTexture.MAP_NORMAL)
        boxG1.setPosition(-3,8,5);
        this.addChild(boxG1);

        // this._objNode = new ObjNode();
        // this.addChild(this._objNode);

        var planeG = new PlaneGeometry(20, 20,100,10);
        planeG.pushPassContent(syRender.ShaderType.Test,[
        ],[
        ])
        planeG.setPosition(3,8,5);
        this.addChild(planeG);

        // var wireG = new WireframeGeometry(new PlaneGeometry(5,5,1,1))
        // wireG.pushPassContent(syRender.ShaderType.Sprite,[
        //     [syStateStringKey.primitiveType,syStateStringValue.primitiveType.PT_LINES]
        // ],[
        //     [syRender.PassCustomKey.DefineUse,syRender.ShaderDefineValue.SY_USE_TEXTURE,syRender.ShaderDefineValue.SY_USE_REMOVE_DEFINE]
        // ])
        // wireG.setPosition(3,5,5);
        // this.addChild(wireG);

        this._mirrorCube = new MirrorCube();
        this._mirrorCube.setDefaultUrl();
        this._mirrorCube.setPosition(-13,3.0,0);
        this.addChild(this._mirrorCube);

        // this._mirror = new Mirror();
        // this._mirror.setDefaultUrl();
        // this._mirror.setPosition(-3,3.0,0);
        // this.addChild(this._mirror);

        this._centerNode.addChild(new LightCamera());
        // var camera = GameMainCamera.instance.getCameraByUUid(syRender.CameraUUid.base3D)
        // var diff = [camera.x,camera.y,camera.z]
        
        G_UISetting.pushRenderCallBack((data)=>{
            // boxG.setMorphTargetInfluences(0,data.customValueZ?data.customValueZ:0)
            // boxG.setMorphTargetInfluences(1,data.customValue?data.customValue:0)

            // this._cubeNode.setPosition(-3, 3.7, data.customValueY?data.customValueY:0)
            // this._cubebumpNode.setPosition(-6, 3.7, data.customValueY?data.customValueY:0);

            // this._cubebumpNode.material.bumpScale = data.customValue?data.customValue:1;
            // this._robart.setPosition(data.customValueX,data.customValueY,data.customValueZ)
            // var cg = (data.customValue?-data.customValue:0.1)/10000;
            // this._robart.setScale(cg,cg,cg)
            // this._cube2.setPosition(0,data.customValue?-data.customValue:0,0)
            // this._spotLightCube.setPosition(0,0,data.customValue?-data.customValue:-130)
        //     this._cube1.setRotation(0,data.customValue?data.customValue:0,0)
        //     this._cube1.setPosition(0,data.customValue1?data.customValue1:0,5)
        //     this._cube1.setScale(data.customValue2?data.customValue2:1,data.customValue2?data.customValue2:1,data.customValue2?data.customValue2:1)

            
            // camera.lookAt([data.customValueX+diff[0],data.customValueY+diff[1],data.customValueZ+diff[2]],[data.customValueX,data.customValueY,data.customValueZ])
        })
        this.setPosition(0, 0, 0);
        setTimeout(this.rotateCenterNode.bind(this), 20);

    }

    protected collectRenderData(time): void {
        this._fogCubeArr.forEach((fog,index)=>{
            fog.rotate(0,1,0)
        })
        super.collectRenderData(time);
    }
    
    public rotateCenterNode() {
        // this._centerNode.rotate(0, 1, 0);
        this._mirrorCube.rotate(1,-1,-0.2);
        setTimeout(this.rotateCenterNode.bind(this), 20);
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