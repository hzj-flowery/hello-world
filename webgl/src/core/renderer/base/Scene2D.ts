
import { Rectangle } from "../2d/Rectangle";
import Device from "../../Device";
import { Label } from "../2d/Label";
import { RenderOfflineSprite } from "../2d/RenderOfflineSprite";
import FirstSprite from "../2d/FirstSprite";
import TwoSprite from "../2d/TwoSprite";
import Scene from "./Scene";
import InstantiateSprite from "../2d/InstantiateSprite";

export default class Scene2D extends Scene {
    
    private _rectangle:Rectangle;
    private _firstSprite:FirstSprite;
    private _instantiateSprite:InstantiateSprite;
    private _label:Label;
    private _renderSprite:RenderOfflineSprite;
    
    constructor(){
        super();
    }

    public init(): void {

    
        this._rectangle = new Rectangle();
        this._rectangle.setPosition(0.5, 0, 0);
        this._rectangle.spriteFrame = "res/tree.jpg";
        this.addChild(this._rectangle);

        // this._firstSprite = new FirstSprite();
        // this._firstSprite.setPosition(0,1,0);
        // this.addChild(this._firstSprite);

        this._instantiateSprite = new InstantiateSprite();
        this._instantiateSprite.setScale(0.5,0.5,0.5);
        this._instantiateSprite.setPosition(0.2,0.2,0);
        this.addChild(this._instantiateSprite);

        this._renderSprite = new RenderOfflineSprite();
        this._renderSprite.setPosition(0.6,0.8,0);
        this._renderSprite.spriteFrame = {
            type:"RenderTexture",
            place:"color",
            width:Device.Instance.width,
            height:Device.Instance.height
        }
        this.addChild(this._renderSprite);

        

        this._label = new Label();
        this._label.setPosition(0.0,0.0,0);
        this._label.spriteFrame = "res/8x8-font.png";
        this._label.content = "111"
        this.addChild(this._label);
    }
}