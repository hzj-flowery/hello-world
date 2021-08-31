
import { Rectangle } from "../2d/Rectangle";
import Device from "../../Device";
import { Label } from "../2d/Label";
import { RenderOfflineSprite } from "../2d/RenderOfflineSprite";
import Scene from "./Scene";
import InstantiateSprite from "../2d/InstantiateSprite";
import { UvSprite } from "../2d/UvSprite";
import { syRender } from "../data/RenderData";
import { ShadowMap } from "../2d/ShadowMap";
import { Pen } from "../2d/Pen";
import { G_InputControl } from "../../InputControl";
import { handler } from "../../../utils/handler";
import { glEnums } from "../gfx/GLapi";

export default class Scene2D extends Scene {
    
    private _rectangle:Rectangle;
    private _instantiateSprite:InstantiateSprite;
    private _label:Label;
    private _renderSprite:RenderOfflineSprite;
    private _pen:Pen;
    private _shadowMap:ShadowMap;//深度纹理
    private _uvSprite:UvSprite;
    constructor(){
        super();
    }
    

    //-------左上角 （0，0）
    //-------右下角 （960,640）
    public init(): void {

        // var rectangle1 = new Rectangle();
        // rectangle1.alpha = 1.0;
        // rectangle1.defineUse.SY_USE_PNG = 0.1;
        // rectangle1.pushPassContent(syRender.ShaderType.Sprite,[
        //     {
        //         "key":"blendSep",
        //         "des":"是否开启拆分混合，这个比较高级，这个可以指定颜色和alpha分开混合",
        //         "value":false
        //     },
        //     {
        //         "key": "depthTest",
        //         "value": true
        //     },
        //     {
        //         "key": "depthWrite",
        //         "value": true
        //     },
        //     {
        //         "key":"blendSrc",
        //         "des":"源颜色如何计算",
        //         "value":"BLEND_SRC_ALPHA"
        //     },
        //     {
        //         "key":"blendDst",
        //         "des":"目标颜色如何计算",
        //         "value":"BLEND_ONE_MINUS_SRC_ALPHA"
        //     },
        //     {
        //         "key": "blendSrcAlpha",
        //         "des":"源alpha如何计算",
        //         "value": "BLEND_SRC_ALPHA"
        //     },
        //     {
        //         "key": "blendDstAlpha",
        //         "des":"目标alpha如何计算",
        //         "value": "BLEND_ONE_MINUS_SRC_ALPHA"
        //     },                                                    
        // ])
        // rectangle1.setPosition(Device.Instance.width/2,Device.Instance.height/2-100, -100);
        // rectangle1.setScale(3,3,1);
        // rectangle1.spriteFrame = "res/ground.png";
        // this.addChild(rectangle1);



        /**
         * // blend-equation
            BLEND_FUNC_ADD: 32774,              // gl.FUNC_ADD
            BLEND_FUNC_SUBTRACT: 32778,         // gl.FUNC_SUBTRACT
            BLEND_FUNC_REVERSE_SUBTRACT: 32779, // gl.FUNC_REVERSE_SUBTRACT
        
            // blend
            BLEND_ZERO: 0,                          // gl.ZERO
            BLEND_ONE: 1,                           // gl.ONE
            BLEND_SRC_COLOR: 768,                   // gl.SRC_COLOR
            BLEND_ONE_MINUS_SRC_COLOR: 769,         // gl.ONE_MINUS_SRC_COLOR
            BLEND_DST_COLOR: 774,                   // gl.DST_COLOR
            BLEND_ONE_MINUS_DST_COLOR: 775,         // gl.ONE_MINUS_DST_COLOR
            BLEND_SRC_ALPHA: 770,                   // gl.SRC_ALPHA
            BLEND_ONE_MINUS_SRC_ALPHA: 771,         // gl.ONE_MINUS_SRC_ALPHA
            BLEND_DST_ALPHA: 772,                   // gl.DST_ALPHA
            BLEND_ONE_MINUS_DST_ALPHA: 773,         // gl.ONE_MINUS_DST_ALPHA
            BLEND_CONSTANT_COLOR: 32769,            // gl.CONSTANT_COLOR
            BLEND_ONE_MINUS_CONSTANT_COLOR: 32770,  // gl.ONE_MINUS_CONSTANT_COLOR
            BLEND_CONSTANT_ALPHA: 32771,            // gl.CONSTANT_ALPHA
            BLEND_ONE_MINUS_CONSTANT_ALPHA: 32772,  // gl.ONE_MINUS_CONSTANT_ALPHA
            BLEND_SRC_ALPHA_SATURATE: 776,          // gl.SRC_ALPHA_SATURATE
         */
        this._rectangle = new Rectangle();
        this._rectangle.alpha = 0.2;
        this._rectangle.defineUse.SY_USE_PNG = 0.0;
        this._rectangle.pushPassContent(syRender.ShaderType.Sprite,[
            {
                "key":"blendSep",
                "des":"是否开启拆分混合，这个比较高级，这个可以指定颜色和alpha分开混合",
                "value":true
            },
            {
                "key": "depthTest",
                "value": true
            },
            {
                "key": "depthWrite",
                "value": false
            },
            {
                "key": "depthFunc",
                "value": "DS_FUNC_LEQUAL"
            },
            {
                "key":"blendSrc",
                "des":"源颜色如何计算",
                "value":"BLEND_SRC_ALPHA"
            },
            {
                "key":"blendDst",
                "des":"目标颜色如何计算",
                "value":"BLEND_ONE_MINUS_SRC_ALPHA"
            },
            {
                "key": "blendSrcAlpha",
                "des":"源alpha如何计算",
                "value": "BLEND_ZERO"
            },
            {
                "key": "blendDstAlpha",
                "des":"目标alpha如何计算",
                "value": "BLEND_ONE"
            },                                                    
        ])
        this._rectangle.setPosition(Device.Instance.width/2,Device.Instance.height/2, -101);
        this._rectangle.spriteFrame = "res/deferred.png";
        this.addChild(this._rectangle);

       
      
         
        this._pen = new Pen();
        this._pen.spriteFrame = "res/bg_npc_06.png";
        this.addChild(this._pen);
        


        // this._uvSprite = new UvSprite();
        // this._uvSprite.setPosition(Device.Instance.width/2,0.5,0);
        // this._uvSprite.spriteFrame = "res/tree.png";
        // this.addChild(this._uvSprite);

        // this._instantiateSprite = new InstantiateSprite();
        // this._instantiateSprite.setScale(0.5,0.5,0.5);
        // this._instantiateSprite.setPosition(420,120,-100);
        // this.addChild(this._instantiateSprite);

        this._renderSprite = new RenderOfflineSprite();
        this._renderSprite.setPosition(Device.Instance.width/2+200,Device.Instance.height/2+200, -100);
        this._renderSprite.spriteFrame = {
            place:syRender.AttachPlace.Color
        }
        this.addChild(this._renderSprite);

        this._shadowMap = new ShadowMap();
        this._shadowMap.setPosition(Device.Instance.width/2,Device.Instance.height/2+200, -100);
        this._shadowMap.spriteFrame = {
            place:syRender.AttachPlace.Color
        }
        this._shadowMap.setVisible(false);
        this.addChild(this._shadowMap);

        

        // this._label = new Label();
        // this._label.setPosition(0.0,0.0,0);
        // this._label.spriteFrame = "res/8x8-font.png";
        // this._label.content = "go"
        // this.addChild(this._label);

        G_InputControl.registerMouseDownEvent(handler(this,this.onMouseDown));
        G_InputControl.registerMouseMoveEvent(handler(this,this.onMouseMove));
        G_InputControl.registerMouseUpEvent(handler(this,this.onMouseUp));
        G_InputControl.registerMouseOutEvent(handler(this,this.onMouseUp));
    }
    
    private _isPress:boolean = false;
    private onMouseDown(ev:MouseEvent):void{
       this._isPress = true;
       this._pen.pushScreenPos(ev.x,ev.y)
    }
    private onMouseMove(ev:MouseEvent):void{
        if(this._isPress)
        this._pen.pushScreenPos(ev.x,ev.y)
    }
    private onMouseUp(ev:MouseEvent):void{
        this._isPress = false;
        this._pen.clearScreenPos();
    }
    private onMouseOut():void{
        this._isPress = false;
        this._pen.clearScreenPos();
    }
}