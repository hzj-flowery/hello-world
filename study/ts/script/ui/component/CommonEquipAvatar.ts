import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import UIHelper from "../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonEquipAvatar extends cc.Component {

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
    _callback: any;
    _equipId: any;

    updateUI(equipBaseId) {
        var equipParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_EQUIPMENT, equipBaseId);
        UIHelper.loadTexture(this._imageEquip, equipParam.icon_big);
    }
    showShadow(visible) {
        this._imageShadow.node.active = (visible);
    }
    setCallBack(callback) {
        if (this._callback) {
            this._callback = null;
        }
        this._callback = callback;
    }
    onTouchCallBack(sender, state) {
        this._callback && this._callback(this._userData);
    }
    _userData(_userData: any) {
        throw new Error("Method not implemented.");
    }
    setEquipId(equipId) {
        this._equipId = equipId;
    }
    getEquipId() {
        return this._equipId;
    }
    getHeight() {
        return this._imageEquip.node.height;
    }
    setShadowPosY(y) {
        var posy = -94;
        this._imageShadow.node.y = (posy + y);
    }

}