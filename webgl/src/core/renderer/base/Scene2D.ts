import { Node } from "./Node";
import Scene from "./Scene";
import OrthoCamera from "../camera/OrthoCamera";
import { Rectangle } from "../2d/Rectangle";
import Device from "../../Device";
import { Label } from "../2d/Label";
import { RenderSprite } from "../2d/RenderSprite";
import FirstSprite from "../2d/FirstSprite";
import TwoSprite from "../2d/TwoSprite";
import GameMainCamera from "../camera/GameMainCamera";
import enums from "../camera/enums";
import { RenderTexture } from "../assets/RenderTexture";

export default class Scene2D extends Scene {
    
    private _2dCamera: OrthoCamera;
    private _rectangle:Rectangle;
    private _firstSprite:FirstSprite;
    private _twoSprite:TwoSprite;
    private _label:Label;
    private _renderSprite:RenderSprite;
    
    constructor(){
        super();
    }

    public init(): void {

        var gl = Device.Instance.gl;
        this._2dCamera  = GameMainCamera.instance.setCamera(enums.PROJ_ORTHO,gl.canvas.width/gl.canvas.height);
        this._2dCamera.lookAt([0, 0, 0]);
        this.setFatherMatrix(this._2dCamera.getModelViewMatrix());

        // this._rectangle = new Rectangle(gl);
        // this._rectangle.setPosition(0.5, 0, 0);
        // this._rectangle.url = "res/tree.jpg";
        // this.addChild(this._rectangle);

        // this._firstSprite = new FirstSprite(gl);
        // this._firstSprite.setPosition(0,1,0);
        // this.addChild(this._firstSprite);

        // this._twoSprite = new TwoSprite(gl);
        // this._twoSprite.setScale(0.2,0.2,0.2);
        // this.addChild(this._twoSprite);

        this._renderSprite = new RenderSprite(gl);
        this._renderSprite.setPosition(0.6,0.8,0);
        this.addChild(this._renderSprite);

        this._2dCamera.targetTexture = this._renderSprite.texture as RenderTexture;;

        // this._label = new Label(gl);
        // this._label.setPosition(0.0,0.0,0);
        // this._label.url = "res/8x8-font.png";
        // this._label.content = "zm5"
        // this.addChild(this._label);
    }

    public getFrameBuffer():any{
        return this._2dCamera.getFramebuffer();
    }
}