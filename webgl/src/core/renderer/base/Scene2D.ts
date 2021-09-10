

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

    private _mask: SY.Sprite2D;
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

        // this.stencilTest();

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
        // this._pen.pushScreenPos(ev.x, ev.y)
    }
    private onMouseMove(ev: MouseEvent): void {
        if (this._isPress&&this._mask)
            {
                // this._pen.pushScreenPos(ev.x, ev.y)
                this._mask.setPosition(ev.x,Device.Instance.height - ev.y, -99);
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

        var rectangle1 = new SY.Sprite2D();
        rectangle1.alpha = 1.0; 
        rectangle1.gZOrder = 1001;
        rectangle1.pushPassContent(syRender.ShaderType.Sprite, [

            [StateString.depthTest,StateValueMap.depthTest.OFF],
            [StateString.depthFunc,StateValueMap.depthFunc.LEQUAL],
            [StateString.depthWrite,StateValueMap.depthWrite.ON],

            // [StateString.blendColorMask,syRender.ColorMask.ALL],

            [StateString.stencilTest,StateValueMap.stencilTest.ON],
            [StateString.stencilSep,StateValueMap.stencilSep.OFF],
            [StateString.stencilFunc,StateValueMap.stencilFunc.EQUAL],
            [StateString.stencilRef,10],
            [StateString.stencilMask,0xffff],
            [StateString.stencilFailOp,StateValueMap.stencilFailOp.KEEP],
            [StateString.stencilZFailOp,StateValueMap.stencilZFailOp.KEEP],
            [StateString.stencilZPassOp,StateValueMap.stencilZPassOp.KEEP],

            // [StateString.stencilTestFront,StateValueMap.stencilTestFront.ON],
            // [StateString.stencilSep,StateValueMap.stencilSep.ON],
            // [StateString.stencilFuncFront,StateValueMap.stencilFuncFront.EQUAL],
            // [StateString.stencilRefFront,3],
            // [StateString.stencilMaskFront,0xffff],
            // [StateString.stencilFailOpFront,StateValueMap.stencilFailOpFront.KEEP],
            // [StateString.stencilZFailOpFront,StateValueMap.stencilZFailOpFront.KEEP],
            // [StateString.stencilZPassOpFront,StateValueMap.stencilZPassOpFront.KEEP],
        ])
        rectangle1.setPosition(Device.Instance.width / 2, Device.Instance.height / 2 - 100,-100);
        rectangle1.spriteFrame = "res/1.png";
        this.addChild(rectangle1);

        //mask
        this._mask = new SY.Mask2D();
        this._mask.spriteFrame = "res/png/player_watch/1143.png";
        this._mask.gZOrder = 1000;
        this._mask.setScale(1.1,1.1,1.0)
        
        rectangle1.addChild(this._mask);

    }











































//----------------------------------------------------------------------------------------------------------------------------------------------------------
    private blendTest(): void {
        var rectangle1 = new SY.Sprite2D();
        rectangle1.alpha = 1.0;
        rectangle1.defineUse.SY_USE_ALPHA_TEST = 0.1;
        rectangle1.pushPassContent(syRender.ShaderType.Sprite, [
            [StateString.blendSep,StateValueMap.blendSep.ON],
            [StateString.depthTest,StateValueMap.depthTest.ON],
            [StateString.depthWrite,StateValueMap.depthWrite.ON],
            [StateString.depthFunc,StateValueMap.depthFunc.LEQUAL],
            [StateString.blendSrc,StateValueMap.blendSrc.SRC_ALPHA],
            [StateString.blendDst,StateValueMap.blendDst.ONE_MINUS_SRC_ALPHA],
            [StateString.blendSrcAlpha,StateValueMap.blendSrcAlpha.ZERO],
            [StateString.blendDstAlpha,StateValueMap.blendDstAlpha.ONE],
        ])
        rectangle1.setPosition(Device.Instance.width / 2, Device.Instance.height / 2 - 100, -100);
        rectangle1.spriteFrame = "res/ground.png";
        this.addChild(rectangle1);

        this._mask = new SY.Sprite2D();
        this._mask.alpha = 1.0;
        this._mask.setScale(1.0,1.0,1.0)
        this._mask.defineUse.SY_USE_ALPHA_TEST = 0.0;
        this._mask.pushPassContent(syRender.ShaderType.Sprite, [
            [StateString.blendSep,StateValueMap.blendSep.ON],
            [StateString.depthTest,StateValueMap.depthTest.ON],
            [StateString.depthWrite,StateValueMap.depthWrite.ON],
            [StateString.depthFunc,StateValueMap.depthFunc.LEQUAL],
            [StateString.blendSrc,StateValueMap.blendSrc.SRC_ALPHA],
            [StateString.blendDst,StateValueMap.blendDst.ONE_MINUS_SRC_ALPHA],
            [StateString.blendSrcAlpha,StateValueMap.blendSrcAlpha.ZERO],
            [StateString.blendDstAlpha,StateValueMap.blendDstAlpha.ONE],
        ])
        this._mask.setPosition(Device.Instance.width / 2, Device.Instance.height / 2, 0);
        this._mask.spriteFrame = "res/png/player_watch/104.png";
        this.addChild(this._mask);
    }
}