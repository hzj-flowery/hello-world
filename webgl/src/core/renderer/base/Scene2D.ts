
import { Rectangle } from "../2d/Rectangle";
import Device from "../../Device";
import { Label } from "../2d/Label";
import { RenderOfflineSprite } from "../2d/RenderOfflineSprite";
import Scene from "./Scene";
import InstantiateSprite from "../2d/InstantiateSprite";
import { UvSprite } from "../2d/UvSprite";
import { syRender } from "../data/RenderData";
import { DepthSprite } from "../2d/DepthSprite";

export default class Scene2D extends Scene {
    
    private _rectangle:Rectangle;
    private _instantiateSprite:InstantiateSprite;
    private _label:Label;
    private _renderSprite:RenderOfflineSprite;
    private _depthSprite:DepthSprite;//深度纹理
    private _uvSprite:UvSprite;
    constructor(){
        super();
    }

    public init(): void {

    
        this._rectangle = new Rectangle();
        this._rectangle.setPosition(Device.Instance.width/2,Device.Instance.height/2, -100);
        this._rectangle.spriteFrame = "res/map1.png";
        this.addChild(this._rectangle);


        this._uvSprite = new UvSprite();
        this._uvSprite.setPosition(Device.Instance.width/2,0.5,0);
        this._uvSprite.spriteFrame = "res/tree.png";
        this.addChild(this._uvSprite);

        this._instantiateSprite = new InstantiateSprite();
        this._instantiateSprite.setScale(0.5,0.5,0.5);
        this._instantiateSprite.setPosition(0.2,0.2,0);
        this.addChild(this._instantiateSprite);

        this._renderSprite = new RenderOfflineSprite();
        this._renderSprite.setPosition(Device.Instance.width/2+200,Device.Instance.height/2+200, -100);
        this._renderSprite.spriteFrame = {
            place:syRender.AttachPlace.Color
        }
        this.addChild(this._renderSprite);

        this._depthSprite = new DepthSprite();
        this._depthSprite.setPosition(Device.Instance.width/2-200,Device.Instance.height/2+200, -100);
        this._depthSprite.spriteFrame = {
            place:syRender.AttachPlace.Depth
        }
        this.addChild(this._depthSprite);

        

        this._label = new Label();
        this._label.setPosition(0.0,0.0,0);
        this._label.spriteFrame = "res/8x8-font.png";
        this._label.content = "czj520"
        this.addChild(this._label);
    }
}