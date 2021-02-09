import PopupCheckCellBase from "./PopupCheckCellBase";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PopupCheckHorseEquipCell extends PopupCheckCellBase {
    public updateUI(index: number, data, isAdded) {
        if (data == null) {
            this.node.active = false;
            return;
        }
        super.updateUI(index, data, isAdded, TypeConvertHelper.TYPE_HORSE_EQUIP);
        this._updateDes(data);
    }
}