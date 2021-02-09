import PopupBase from "../PopupBase";
import UIHelper from "../../utils/UIHelper";
import { Path } from "../../utils/Path";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupNextFunctionPopInfoNode extends cc.Component {

    @property({ type: cc.Sprite, visible: true })
    _imageFunction: cc.Sprite = null;
    @property({ type: cc.Label, visible: true })
    _funcName: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    _label1: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    _label2: cc.Label = null;

    private _data;
    public init(data) {
        this._data = data;
    }
    onLoad() {
        if (!this._data) {
            return;
        }
        this._imageFunction.sizeMode = cc.Sprite.SizeMode.RAW;
        UIHelper.loadTexture(this._imageFunction, Path.getCommonIcon('main', this._data.icon));
        this._funcName.string = (this._data.name);
        var strArr: string[] = this._data.text.split('|');
        var string1 = strArr[0];
        if (string1) {
            this._label1.node.active = true;
            this._label1.string = (string1);
        } else {
            this._label1.node.active = false;
        }
        var string2 = strArr[1];
        if (string2) {
            this._label2.node.active = true;
            this._label2.string = (string2);
        } else {
            this._label2.node.active = false;
        }
    }
}