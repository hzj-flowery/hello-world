import { handler } from "../../utils/handler";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import UIHelper from "../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonTreasureAvatar extends cc.Component {

    private static readonly EXPORTED_METHODS = [
        "updateUI",
        "showShadow",
        "setCallBack",
        "setTouchEnabled"
    ]

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageShadow: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTreasure: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panel_click: cc.Node = null;
    _callback: any;
    _userData: any;

    onLoad(){
        
    }

    updateUI(treasureBaseId) {
        var treasureParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_TREASURE, treasureBaseId);
        UIHelper.loadTexture(this._imageTreasure.getComponent(cc.Sprite), treasureParam.icon_big);
    }
    setTouchEnabled(enable) {
        // this._panel_click.setTouchEnabled(enable);
        // this._panel_click.setSwallowTouches(false);
    }
    setCallBack(callback) {
        if (this._callback) {
            this._callback = null;
        }
        this._callback = callback;
    }
    onTouchCallBack(sender) {
        if (this._callback) {
            this._callback(this._userData);
        }
    }
    showShadow(visible) {
        this._imageShadow.node.active = (visible);
    }

}