

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
import { syStateStringKey, syStateStringValue } from "../gfx/State";
import { SY } from "./Sprite";

export default class Scene2D extends Scene {

    private _mask: SY.UIImage;
    private _instantiateSprite: InstantiateSprite;
    private _label: Label;
    private _renderSprite: RenderOfflineSprite;
    private _pen: Pen;
    private _shadowMap: ShadowMap;//深度纹理
    private _uvSprite: SY.UIImage;
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
        
        // var testHttp = new SY.UIImage();
        // // testHttp.setPosition(200,200,-100)
        // // testHttp.setScale(0.2,0.2,1.0);
        // testHttp.pushPassContent(syRender.ShaderType.Sprite)
        // testHttp.spriteFrame = "res/uv_grid_opengl.jpg";
        // this.addChild(testHttp);

        // this._uvSprite = new SY.Sprite2D();
        // this._uvSprite.pushPassContent(syRender.ShaderType.UvSprite,[],[
        //     [syRender.PassCustomKey.DefineUse,syRender.ShaderDefineString.SY_USE_ALPHA_TEST,0.1]
        // ])
        // this._uvSprite.setPosition(Device.Instance.width/2,0.5,0);
        // this._uvSprite.spriteFrame = "res/tree.png";
        // this.addChild(this._uvSprite);

        // this._instantiateSprite = new InstantiateSprite();
        // this._instantiateSprite.setScale(0.5,0.5,0.5);
        // this._instantiateSprite.setPosition(420,120,-100);
        // this.addChild(this._instantiateSprite);



        this._shadowMap = new ShadowMap();
        this._shadowMap.setPosition(Device.Instance.width / 2, Device.Instance.height / 2 + 200, -100);
        this._shadowMap.spriteFrame = {
            place: syRender.AttachPlace.Color
        }
        this._shadowMap.setVisible(false);
        this.addChild(this._shadowMap);

        this._renderSprite = new RenderOfflineSprite();
        this._renderSprite.setPosition(Device.Instance.width / 2 + 200, Device.Instance.height / 2 + 200, -100);
        this._renderSprite.spriteFrame = {
            place: syRender.AttachPlace.Color
        }
        this.addChild(this._renderSprite);



        this._label = new Label();
        this._label.setPosition(0.0,0.0,0);
        this._label.spriteFrame = "res/fnt/word_0.png";
        this._label.content = '好好做人\n认真做事\n张曼最棒\n你是我的眼带走不完的梦\n也许那样你才可按的清'
        this.addChild(this._label);

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
        if (this._isPress && this._pen) {
            this._pen.pushScreenPos(ev.x, ev.y)
        }

        if (this._isPress && this._mask) {
            this._mask.setPosition(ev.x, Device.Instance.height - ev.y, -99);
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

        var rectangle1 = new SY.UIImage();
        rectangle1.alpha = 1.0;
        rectangle1.gZOrder = 1001;
        rectangle1.pushPassContent(syRender.ShaderType.Sprite, [

            [syStateStringKey.depthTest, syStateStringValue.depthTest.OFF],
            [syStateStringKey.depthFunc, syStateStringValue.depthFunc.LEQUAL],
            [syStateStringKey.depthWrite, syStateStringValue.depthWrite.ON],

            // [syStateStringKey.blendColorMask,syRender.ColorMask.ALL],

            [syStateStringKey.stencilTest, syStateStringValue.stencilTest.ON],
            [syStateStringKey.stencilSep, syStateStringValue.stencilSep.OFF],
            [syStateStringKey.stencilFunc, syStateStringValue.stencilFunc.EQUAL],
            [syStateStringKey.stencilRef, 10],
            [syStateStringKey.stencilMask, 0xffff],
            [syStateStringKey.stencilFailOp, syStateStringValue.stencilFailOp.KEEP],
            [syStateStringKey.stencilZFailOp, syStateStringValue.stencilZFailOp.KEEP],
            [syStateStringKey.stencilZPassOp, syStateStringValue.stencilZPassOp.KEEP],

            // [syStateStringKey.stencilTestFront,syStateStringValue.stencilTestFront.ON],
            // [syStateStringKey.stencilSep,syStateStringValue.stencilSep.ON],
            // [syStateStringKey.stencilFuncFront,syStateStringValue.stencilFuncFront.EQUAL],
            // [syStateStringKey.stencilRefFront,3],
            // [syStateStringKey.stencilMaskFront,0xffff],
            // [syStateStringKey.stencilFailOpFront,syStateStringValue.stencilFailOpFront.KEEP],
            // [syStateStringKey.stencilZFailOpFront,syStateStringValue.stencilZFailOpFront.KEEP],
            // [syStateStringKey.stencilZPassOpFront,syStateStringValue.stencilZPassOpFront.KEEP],
        ])
        rectangle1.setPosition(Device.Instance.width / 2, Device.Instance.height / 2 - 100, -100);
        rectangle1.spriteFrame = "res/1.png";
        this.addChild(rectangle1);

        //mask
        this._mask = new SY.Mask2D();
        this._mask.spriteFrame = "res/png/player_watch/1143.png";
        this._mask.gZOrder = 1000;
        this._mask.setScale(1.1, 1.1, 1.0)

        rectangle1.addChild(this._mask);

    }











































    //----------------------------------------------------------------------------------------------------------------------------------------------------------
    private blendTest(): void {
        var rectangle1 = new SY.UIImage();
        rectangle1.alpha = 1.0;
        rectangle1.pushPassContent(syRender.ShaderType.Sprite, [
            [syStateStringKey.blendSep, syStateStringValue.blendSep.ON],
            [syStateStringKey.depthTest, syStateStringValue.depthTest.ON],
            [syStateStringKey.depthWrite, syStateStringValue.depthWrite.ON],
            [syStateStringKey.depthFunc, syStateStringValue.depthFunc.LEQUAL],
            [syStateStringKey.blendSrc, syStateStringValue.blendSrc.SRC_ALPHA],
            [syStateStringKey.blendDst, syStateStringValue.blendDst.ONE_MINUS_SRC_ALPHA],
            [syStateStringKey.blendSrcAlpha, syStateStringValue.blendSrcAlpha.ZERO],
            [syStateStringKey.blendDstAlpha, syStateStringValue.blendDstAlpha.ONE]
        ],[
            [syRender.PassCustomKey.DefineUse,syRender.ShaderDefineValue.SY_USE_ALPHA_TEST,0.1]
        ])
        rectangle1.setPosition(Device.Instance.width / 2, Device.Instance.height / 2 - 100, -100);
        rectangle1.spriteFrame = "res/ground.png";
        this.addChild(rectangle1);

        this._mask = new SY.UIImage();
        this._mask.alpha = 1.0;
        this._mask.setScale(1.0, 1.0, 1.0)
        this._mask.pushPassContent(syRender.ShaderType.Sprite, [
            [syStateStringKey.blendSep, syStateStringValue.blendSep.ON],
            [syStateStringKey.depthTest, syStateStringValue.depthTest.ON],
            [syStateStringKey.depthWrite, syStateStringValue.depthWrite.ON],
            [syStateStringKey.depthFunc, syStateStringValue.depthFunc.LEQUAL],
            [syStateStringKey.blendSrc, syStateStringValue.blendSrc.SRC_ALPHA],
            [syStateStringKey.blendDst, syStateStringValue.blendDst.ONE_MINUS_SRC_ALPHA],
            [syStateStringKey.blendSrcAlpha, syStateStringValue.blendSrcAlpha.ZERO],
            [syStateStringKey.blendDstAlpha, syStateStringValue.blendDstAlpha.ONE],
        ])
        this._mask.setPosition(Device.Instance.width / 2, Device.Instance.height / 2, 0);
        this._mask.spriteFrame = "res/png/player_watch/104.png";
        this.addChild(this._mask);
    }
}