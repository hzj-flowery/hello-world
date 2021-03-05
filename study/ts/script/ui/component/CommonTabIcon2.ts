import { handler } from "../../utils/handler";
import UIHelper from "../../utils/UIHelper";
import CommonTabIcon from "./CommonTabIcon";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonTabIcon2 extends cc.Component {
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBg: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _text: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imgDesc: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imgDescSel: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRedPoint: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;
    private _index: any;
    private _clickCallBack: any;

    updateUI(txt, bselected, index, imgPath, imgSelPath) {
        this._index = index;
        this._imageBg.node.active = (bselected);
        this._text.string = (txt);
        if (this._imgDesc) {
            UIHelper.loadTexture(this._imgDesc, imgPath);
        }
        if (this._imgDescSel) {
            UIHelper.loadTexture(this._imgDescSel, imgSelPath);
            this._imgDescSel.node.active = (bselected);
        }
    }
    setClickCallback(callback) {
        this._clickCallBack = callback;
        UIHelper.addClickEventListenerEx(this._panelTouch, handler(this, this._onPanelTouch))
    }
    showRedPoint(show) {
        this._imageRedPoint.node.active = (show);
    }
    setSelected(selected) {
        this._imageBg.node.active = (selected);
        if (this._imgDescSel) {
            this._imgDescSel.node.active = (selected);
        }
    }
    _onPanelTouch(sender, state) {
        this.setSelected(true);
        if (this._clickCallBack) {
            this._clickCallBack(this._index);
        }
    }
}