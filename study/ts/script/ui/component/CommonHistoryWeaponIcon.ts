import { G_SceneManager } from "../../init";
import PopupHistoryHeroWeaponDetail from "../../scene/view/historyhero/PopupHistoryHeroWeaponDetail";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import CommonIconBase from "./CommonIconBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonHistoryWeaponIcon extends CommonIconBase {

    onLoad() {
        this._type = TypeConvertHelper.TYPE_HISTORY_HERO_WEAPON;
        super.onLoad();
    }
    updateUI(value, size) {
        var itemParams = super.updateUI(value, size);
        if (itemParams.size != null) {
            this.setCount(itemParams.size);
        }
    }
    setType(type) {
        this._type = type;
    }
    _onTouchCallBack(sender, state) {
        if (this._callback) {
            this._callback(sender, this._itemParams);
        } else {
            G_SceneManager.openPopup('prefab/historyhero/PopupHistoryHeroWeaponDetail', (p: PopupHistoryHeroWeaponDetail) => {
                p.ctor(this._itemParams.cfg.id);
                p.openWithAction();
            })
        }
    }
}