

import Device from "../../Device";
import { Label } from "../2d/Label";
import { RenderOfflineSprite } from "../2d/RenderOfflineSprite";
import Scene from "./Scene";
import InstantiateSprite from "../2d/InstantiateSprite";
import { syRender } from "../data/RenderData";
import { ShadowMap } from "../2d/ShadowMap";
import { Pen } from "../2d/Pen";
import { G_InputControl } from "../../InputControl";
import { handler } from "../../../utils/handler";
import { glEnums } from "../gfx/GLapi";
import { StateString, StateValueMap } from "../gfx/State";
import { SY } from "./Sprite";

export default class Scene2D extends Scene {

    private _rectangle: SY.Sprite2D;
    private _instantiateSprite: InstantiateSprite;
    private _label: Label;
    private _renderSprite: RenderOfflineSprite;
    private _pen: Pen;
    private _shadowMap: ShadowMap;//深度纹理
    private _uvSprite: SY.Sprite2D;
    constructor() {
        super();
    }


    //-------左上角 （0，0）
    //-------右下角 （960,640）
    public init(): void {




        // this.blendTest();

        this.stencilTest();

        this._pen = new Pen();
        this._pen.spriteFrame = "res/bg_npc_06.png";
        this.addChild(this._pen);



        // this._uvSprite = new SY.Sprite2D();
        // this._uvSprite.pushPassContent(syRender.ShaderType.UvSprite)
        // this._uvSprite.setPosition(Device.Instance.width/2,0.5,0);
        // this._uvSprite.spriteFrame = "res/tree.png";
        // this.addChild(this._uvSprite);

        // this._instantiateSprite = new InstantiateSprite();
        // this._instantiateSprite.setScale(0.5,0.5,0.5);
        // this._instantiateSprite.setPosition(420,120,-100);
        // this.addChild(this._instantiateSprite);

        this._renderSprite = new RenderOfflineSprite();
        this._renderSprite.setPosition(Device.Instance.width / 2 + 200, Device.Instance.height / 2 + 200, -100);
        this._renderSprite.spriteFrame = {
            place: syRender.AttachPlace.Color
        }
        this.addChild(this._renderSprite);

        this._shadowMap = new ShadowMap();
        this._shadowMap.setPosition(Device.Instance.width / 2, Device.Instance.height / 2 + 200, -100);
        this._shadowMap.spriteFrame = {
            place: syRender.AttachPlace.Color
        }
        this._shadowMap.setVisible(false);
        this.addChild(this._shadowMap);



        // this._label = new Label();
        // this._label.setPosition(0.0,0.0,0);
        // this._label.spriteFrame = "res/8x8-font.png";
        // this._label.content = "go"
        // this.addChild(this._label);

        G_InputControl.registerMouseDownEvent(handler(this, this.onMouseDown));
        G_InputControl.registerMouseMoveEvent(handler(this, this.onMouseMove));
        G_InputControl.registerMouseUpEvent(handler(this, this.onMouseUp));
        G_InputControl.registerMouseOutEvent(handler(this, this.onMouseUp));
    }

    private _isPress: boolean = false;
    private onMouseDown(ev: MouseEvent): void {
        this._isPress = true;
        this._pen.pushScreenPos(ev.x, ev.y)
    }
    private onMouseMove(ev: MouseEvent): void {
        if (this._isPress)
            {
                this._pen.pushScreenPos(ev.x, ev.y)
                 

                this._rectangle.setPosition(ev.x,Device.Instance.height - ev.y, -100);
            }
    }
    private onMouseUp(ev: MouseEvent): void {
        this._isPress = false;
        this._pen.clearScreenPos();
    }
    private onMouseOut(): void {
        this._isPress = false;
        this._pen.clearScreenPos();
    }

    private stencilTest(): void {
        
    
        //mask
        this._rectangle = new SY.Sprite2D();
        this._rectangle.alpha = 0.9;
        this._rectangle.defineUse.SY_USE_ALPHA_TEST = 0.1;
        this._rectangle.pushPassContent(syRender.ShaderType.Sprite, [
            
            //深度
            [StateString.depthTest,StateValueMap.depthTest.on],
            [StateString.depthFunc,StateValueMap.depthFunc.DS_FUNC_LEQUAL],
            [StateString.depthWrite,StateValueMap.depthWrite.off],
            
            //混合
            [StateString.blend,StateValueMap.blend.on],
            [StateString.blendSep,StateValueMap.blendSep.on],
            [StateString.blendSrc,StateValueMap.blendSrc.BLEND_SRC_ALPHA],
            [StateString.blendDst,StateValueMap.blendDst.BLEND_ONE_MINUS_SRC_ALPHA],
            [StateString.blendSrcAlpha,StateValueMap.blendSrcAlpha.BLEND_ZERO],
            [StateString.blendDstAlpha,StateValueMap.blendDstAlpha.BLEND_ONE],
            [StateString.blendColorMask,syRender.ColorMask.NONE],

            // [StateString.stencilTestFront,StateValueMap.stencilTestFront.on],
            // [StateString.stencilSep,StateValueMap.stencilSep.on],
            // [StateString.stencilFuncFront,StateValueMap.stencilFuncFront.DS_FUNC_ALWAYS],
            // [StateString.stencilRefFront,1],
            // [StateString.stencilMaskFront,0xff],
            // [StateString.stencilFailOpFront,StateValueMap.stencilFailOpFront.STENCIL_OP_KEEP],
            // [StateString.stencilZFailOpFront,StateValueMap.stencilZFailOpFront.STENCIL_OP_KEEP],
            // [StateString.stencilZPassOpFront,StateValueMap.stencilZPassOpFront.STENCIL_OP_REPLACE]
        ])
        this._rectangle.setPosition(Device.Instance.width / 2, Device.Instance.height / 2, -100);
        this._rectangle.spriteFrame = "res/map1.png";
        this.addChild(this._rectangle);



        var rectangle1 = new SY.Sprite2D();
        rectangle1.alpha = 0.9;
        rectangle1.defineUse.SY_USE_ALPHA_TEST = 0.1;
        rectangle1.pushPassContent(syRender.ShaderType.Sprite, [

            [StateString.depthTest,StateValueMap.depthTest.on],
            [StateString.depthFunc,StateValueMap.depthFunc.DS_FUNC_LEQUAL],
            [StateString.depthWrite,StateValueMap.depthWrite.off],

            
            [StateString.blend,StateValueMap.blend.on],
            [StateString.blendSep,StateValueMap.blendSep.on],
            [StateString.blendSrc,StateValueMap.blendSrc.BLEND_SRC_ALPHA],
            [StateString.blendDst,StateValueMap.blendDst.BLEND_ONE_MINUS_SRC_ALPHA],
            [StateString.blendSrcAlpha,StateValueMap.blendSrcAlpha.BLEND_ZERO],
            [StateString.blendDstAlpha,StateValueMap.blendDstAlpha.BLEND_ONE],
            [StateString.blendColorMask,syRender.ColorMask.ALL],

            // [StateString.stencilTestFront,StateValueMap.stencilTestFront.on],
            // [StateString.stencilSep,StateValueMap.stencilSep.on],
            // [StateString.stencilFuncFront,StateValueMap.stencilFuncFront.DS_FUNC_EQUAL],
            // [StateString.stencilRefFront,1],
            // [StateString.stencilMaskFront,0xff],
            // [StateString.stencilFailOpFront,StateValueMap.stencilFailOpFront.STENCIL_OP_KEEP],
            // [StateString.stencilZFailOpFront,StateValueMap.stencilZFailOpFront.STENCIL_OP_KEEP],
            // [StateString.stencilZPassOpFront,StateValueMap.stencilZPassOpFront.STENCIL_OP_KEEP],
        ])
        rectangle1.setPosition(Device.Instance.width / 2, Device.Instance.height / 2 - 100, -100);
        rectangle1.spriteFrame = "res/1.png";
        this.addChild(rectangle1);

    }

    private blendTest(): void {
        var rectangle1 = new SY.Sprite2D();
        rectangle1.alpha = 0.5;
        rectangle1.defineUse.SY_USE_ALPHA_TEST = 0.1;
        rectangle1.pushPassContent(syRender.ShaderType.Sprite, [
            [StateString.blendSep,StateValueMap.blendSep.on],
            [StateString.depthTest,StateValueMap.depthTest.on],
            [StateString.depthWrite,StateValueMap.depthWrite.off],
            [StateString.depthFunc,StateValueMap.depthFunc.DS_FUNC_LEQUAL],
            [StateString.blendSrc,StateValueMap.blendSrc.BLEND_SRC_ALPHA],
            [StateString.blendDst,StateValueMap.blendDst.BLEND_ONE_MINUS_SRC_ALPHA],
            [StateString.blendSrcAlpha,StateValueMap.blendSrcAlpha.BLEND_ZERO],
            [StateString.blendDstAlpha,StateValueMap.blendDstAlpha.BLEND_ONE],
        ])
        rectangle1.setPosition(Device.Instance.width / 2, Device.Instance.height / 2 - 100, -100);
        rectangle1.spriteFrame = "res/ground.png";
        this.addChild(rectangle1);

        this._rectangle = new SY.Sprite2D();
        this._rectangle.alpha = 0.2;
        this._rectangle.setScale(0.3,0.3,1.0)
        this._rectangle.defineUse.SY_USE_ALPHA_TEST = 0.0;
        this._rectangle.pushPassContent(syRender.ShaderType.Sprite, [
            [StateString.blendSep,StateValueMap.blendSep.on],
            [StateString.depthTest,StateValueMap.depthTest.on],
            [StateString.depthWrite,StateValueMap.depthWrite.off],
            [StateString.depthFunc,StateValueMap.depthFunc.DS_FUNC_LEQUAL],
            [StateString.blendSrc,StateValueMap.blendSrc.BLEND_SRC_ALPHA],
            [StateString.blendDst,StateValueMap.blendDst.BLEND_ONE_MINUS_SRC_ALPHA],
            [StateString.blendSrcAlpha,StateValueMap.blendSrcAlpha.BLEND_ZERO],
            [StateString.blendDstAlpha,StateValueMap.blendDstAlpha.BLEND_ONE],
        ])
        this._rectangle.setPosition(Device.Instance.width / 2, Device.Instance.height / 2, -100);
        this._rectangle.spriteFrame = "res/deferred.png";
        this.addChild(this._rectangle);
    }
}