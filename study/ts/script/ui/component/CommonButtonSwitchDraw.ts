import { Path } from "../../utils/Path";
import { handler } from "../../utils/handler";
import CommonUI from "./CommonUI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonButtonSwitchDraw extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image2: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageText2: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image1: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageText1: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;

    private _isDrawing;
    private _pos1: cc.Vec2;
    private _pos2: cc.Vec2;
    private _callback;

    _init() {
        this._panelTouch.on(cc.Node.EventType.TOUCH_START, handler(this, this._onPanelTouch));
        var ps1 = this._image1.node.getPosition();
        var ps2 = this._image2.node.getPosition();
        this._pos1 = new cc.Vec2(ps1.x, ps1.y);
        this._pos2 = new cc.Vec2(ps2.x, ps2.y);
    }

    onEnable(): void {
        this._init();
    }
    setState(isDrawing) {
        this._isDrawing = isDrawing;
        this._updateUI();
    }
    setCallback(callback) {
        this._callback = callback;
    }
    _updateUI() {
        if (!this._isDrawing) {
            this._image1.addComponent(CommonUI).loadTexture(Path.getCommonIcon('system', 'icon_zhandou01'));
            this._imageText1.addComponent(CommonUI).loadTexture(Path.getTextSystem('txt_zhandou01'));
            this._image2.addComponent(CommonUI).loadTexture(Path.getCommonIcon('system', 'icon_lihui02'));
            this._imageText2.addComponent(CommonUI).loadTexture(Path.getTextSystem('txt_lihui01'));
        } else {
            this._image1.addComponent(CommonUI).loadTexture(Path.getCommonIcon('system', 'icon_lihui01'));
            this._imageText1.addComponent(CommonUI).loadTexture(Path.getTextSystem('txt_lihui01'));
            this._image2.addComponent(CommonUI).loadTexture(Path.getCommonIcon('system', 'icon_zhandou02'));
            this._imageText2.addComponent(CommonUI).loadTexture(Path.getTextSystem('txt_zhandou01'));
        }
    }
    _onPanelTouch() {
        this._isDrawing = !this._isDrawing;
        this._updateUI();
        if (this._callback) {
            this._callback(this._isDrawing);
        }
    }



}