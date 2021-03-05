import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import UIHelper from "../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonHistoryWeaponAvatar extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageShadow: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageWeapon: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panel_click: cc.Node = null;
    _callback: any;

    updateUI(weaponBaseId) {
        var weaponParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HISTORY_HERO_WEAPON, weaponBaseId);
        UIHelper.loadTexture(this._imageWeapon, weaponParam.icon_big);
        UIHelper.addEventListenerToNode(this.node, this._panel_click, 'CommonHistoryWeaponAvatar', '_onTouchCallBack');
    }
    setTouchEnabled(enable) {
        var btn = this._panel_click.getComponent(cc.Button);
        if (btn) {
            btn.enabled = (enable);
        }

        //this._panel_click.setSwallowTouches(false);
    }
    setCallBack(callback) {
        if (this._callback) {
            this._callback = null;
        }
        this._callback = callback;
    }
    _onTouchCallBack(sender) {
        if (this._callback) {
            this._callback();
        }
    }
    showShadow(visible) {
        this._imageShadow.node.active = (visible);
    }
}