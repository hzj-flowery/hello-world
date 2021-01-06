
import { Rectangle } from "../2d/Rectangle";
import Device from "../../Device";
import { Label } from "../2d/Label";
import { RenderOfflineSprite } from "../2d/RenderOfflineSprite";
import FirstSprite from "../2d/FirstSprite";
import TwoSprite from "../2d/TwoSprite";
import Scene from "./Scene";

export default class Scene2D extends Scene {
    
    private _rectangle:Rectangle;
    private _firstSprite:FirstSprite;
    private _twoSprite:TwoSprite;
    private _label:Label;
    private _renderSprite:RenderOfflineSprite;
    
    constructor(){
        super();
    }

    public init(): void {

    
        this._rectangle = new Rectangle();
        this._rectangle.setPosition(0.5, 0, 0);
        this._rectangle.url = "res/tree.jpg";
        this.addChild(this._rectangle);

        // this._firstSprite = new FirstSprite();
        // this._firstSprite.setPosition(0,1,0);
        // this.addChild(this._firstSprite);

        this._twoSprite = new TwoSprite();
        this._twoSprite.setScale(0.2,0.2,0.2);
        this.addChild(this._twoSprite);

        this._renderSprite = new RenderOfflineSprite();
        this._renderSprite.setPosition(0.6,0.8,0);
        this._renderSprite.url = {
            type:"RenderTexture",
            place:"color",
            width:Device.Instance.width,
            height:Device.Instance.height
        }
        this.addChild(this._renderSprite);

        

        this._label = new Label();
        this._label.setPosition(0.0,0.0,0);
        this._label.url = "res/8x8-font.png";
        this._label.content = "111"
        this.addChild(this._label);
    }
}