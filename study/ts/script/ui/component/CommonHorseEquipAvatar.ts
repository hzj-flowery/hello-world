import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import UIHelper from "../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonHorseEquipAvatar extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageShadow: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageEquip: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;

    private _callback;
    private _userData;
    private _equipId;

    onLoad() {

        var button = this._panelTouch.addComponent(cc.Button);
        var clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node;
        clickEventHandler.component = "CommonHorseEquipAvatar";
        clickEventHandler.handler = "_onTouchCallBack";
        button.clickEvents.push(clickEventHandler);
    }

    public updateUI(equipBaseId) {
        var equipParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HORSE_EQUIP, equipBaseId);
        UIHelper.loadTexture(this._imageEquip, equipParam.icon_big);
    }

    public showShadow(visible) {
        this._imageShadow.node.active = (visible);
    }

    public setCallBack(callback) {
        if (this._callback) {
            this._callback = null;
        }
        this._callback = callback;
    }

    public _onTouchCallBack(sender, state) {
        if (this._callback) {
            this._callback(this._userData);
        }
    }

    public setEquipId(equipId) {
        this._equipId = equipId;
    }

    public getEquipId() {
        return this._equipId;
    }

    public getHeight() {
        return this._imageEquip.node.getContentSize().height;
    }
}