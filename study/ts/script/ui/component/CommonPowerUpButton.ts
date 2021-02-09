import UIHelper from "../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonPowerUpButton extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_Ring: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_Icon: cc.Sprite = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _image_Touch: cc.Button = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _string_Title: cc.Label = null;

    private _touchFunc: Function;
    private _funcIndex;

    public setTouchFunc(func) {
        this._touchFunc = func;
    }

    public setFuncIndex(index) {
        this._funcIndex = index;
    }

    public setFuncName(str) {
        this._string_Title.string = str;
    }

    public setIcon(icon) {
        UIHelper.loadTexture(this._image_Icon, icon);
        this._image_Icon.sizeMode = cc.Sprite.SizeMode.RAW;
    }

    public onClick() {
        if (this._touchFunc != null) {
            this._touchFunc(this._funcIndex);
        }
    }
}