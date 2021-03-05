import PopupCheckBase from "./PopupCheckBase";
import { PopupCheckEquipHelper } from "./PopupCheckEquipHelper";
import { Lang } from "../../../lang/Lang";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupCheckEquip extends PopupCheckBase {

    private TITLE = {
        [1]: "equip_check_title_1"
    }

    private helpFuncs = {
        [1]: PopupCheckEquipHelper._FROM_TYPE1,
    }

    public updateUI(fromType, clickOk) {
        super.updateUI(fromType, clickOk);
        super._updateInfo(this.helpFuncs[fromType](),
            PopupCheckEquipHelper.getMaxCount(fromType),
            Lang.get(this.TITLE[fromType]));
    }

    protected _onItemUpdate(item: cc.Node, index: number) {
        if (this._listData[index] != null) {
            super._onItemUpdate(item, index, PopupCheckEquipHelper.addEquipDataDesc(this._listData[index], this._fromType));
        }
    }
}