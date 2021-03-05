import PopupCheckBase from "./PopupCheckBase";
import { PopupCheckHorseEquipHelper } from "./PopupCheckHorseEquipHelper";
import { Lang } from "../../../lang/Lang";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupCheckHorseEquip extends PopupCheckBase {
    private TITLE = {
        [1]: "equip_check_title_1"
    }

    private helpFuncs = {
        [1]: PopupCheckHorseEquipHelper._FROM_TYPE1,
    }

    public updateUI(fromType, clickOk) {
        super.updateUI(fromType, clickOk);
        super._updateInfo(this.helpFuncs[fromType](),
            PopupCheckHorseEquipHelper.getMaxCount(fromType),
            Lang.get(this.TITLE[fromType]));
    }

    protected _onItemUpdate(item: cc.Node, index: number) {
        if (this._listData[index] != null) {
            super._onItemUpdate(item, index, PopupCheckHorseEquipHelper.addEquipDataDesc(this._listData[index], this._fromType));
        }
    }
}