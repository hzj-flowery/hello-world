
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
import { StateString } from "../gfx/State";

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

        var rectangle1 = new Rectangle();
        rectangle1.alpha = 0.5;
        rectangle1.defineUse.SY_USE_ALPHA_TEST = 0.1;
        rectangle1.pushPassContent(syRender.ShaderType.Sprite,[
            {
                "key":StateString.blendSep,
                "des":"是否开启拆分混合，这个比较高级，这个可以指定颜色和alpha分开混合",
                "value":true
            },
            {
                "key": StateString.depthTest,
                "value": true
            },
            {
                "key": StateString.depthWrite,
                "value": false

            },
            {
                "key": StateString.depthFunc,
                "value": glEnums.DS_FUNC_LEQUAL
            },
            {
                "key":StateString.blendSrc,
                "des":"源颜色如何计算",
                "value":glEnums.BLEND_SRC_ALPHA
            },
            {
                "key":StateString.blendDst,
                "des":"目标颜色如何计算",
                "value":glEnums.BLEND_ONE_MINUS_SRC_ALPHA 
            },
            {
                "key": StateString.blendSrcAlpha,
                "des":"源alpha如何计算",
                "value": glEnums.BLEND_ZERO
            },
            {
                "key": StateString.blendDstAlpha,
                "des":"目标alpha如何计算",
                "value": glEnums.BLEND_ONE
            },                                                    
        ])
        rectangle1.setPosition(Device.Instance.width/2,Device.Instance.height/2-100, -100);
        rectangle1.setScale(3,3,1);
        rectangle1.spriteFrame = "res/ground.png";
        this.addChild(rectangle1);

        this._rectangle = new Rectangle();
        this._rectangle.alpha = 0.2;
        this._rectangle.defineUse.SY_USE_ALPHA_TEST = 0.0;
        this._rectangle.pushPassContent(syRender.ShaderType.Sprite,[
            {
                "key":StateString.blendSep,
                "des":"是否开启拆分混合，这个比较高级，这个可以指定颜色和alpha分开混合",
                "value":true
            },
            {
                "key": StateString.depthTest,
                "value": true
            },
            {
                "key": StateString.depthWrite,
                "value": false
            },
            {
                "key": StateString.depthFunc,
                "value": glEnums.DS_FUNC_LEQUAL
            },
            {
                "key":StateString.blendSrc,
                "des":"源颜色如何计算",
                "value":glEnums.BLEND_SRC_ALPHA
            },
            {
                "key":StateString.blendDst,
                "des":"目标颜色如何计算",
                "value":glEnums.BLEND_ONE_MINUS_SRC_ALPHA 
            },
            {
                "key": StateString.blendSrcAlpha,
                "des":"源alpha如何计算",
                "value": glEnums.BLEND_ZERO
            },
            {
                "key": StateString.blendDstAlpha,
                "des":"目标alpha如何计算",
                "value": glEnums.BLEND_ONE
            },                                                    
        ])
        this._rectangle.setPosition(Device.Instance.width/2,Device.Instance.height/2, -100);
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