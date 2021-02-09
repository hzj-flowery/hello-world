import PopupCheckCellBase from "./PopupCheckCellBase";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { HorseDataHelper } from "../../../utils/data/HorseDataHelper";
import AttributeConst from "../../../const/AttributeConst";
import { TextHelper } from "../../../utils/TextHelper";
import CommonDesValue from "../../../ui/component/CommonDesValue";
import { Colors } from "../../../init";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupCheckHorseCell extends PopupCheckCellBase {
    public updateUI(index: number, data, isAdded) {
        if (data == null) {
            this.node.active = false;
            return;
        }
        super.updateUI(index, data, isAdded, TypeConvertHelper.TYPE_HORSE);
        var baseId = data.getBase_id();
        var star = data.getStar();
        let name = HorseDataHelper.getHorseName(baseId, star);
        this._item.setName(name);
        this._showAttrDes(data);
    }

    private _showAttrDes(data) {
        var showAttrIds = [
            AttributeConst.ATK,
            AttributeConst.HP
        ];
        var info = HorseDataHelper.getHorseAttrInfo(data);
        let nodesDes: CommonDesValue[] = [this._nodeDes1, this._nodeDes2];
        for (let i = 0; i < nodesDes.length; i++) {
            var attrId = showAttrIds[i];
            var value = info[attrId];
            if (value) {
                var [attrName, attrValue] = TextHelper.getAttrBasicText(attrId, value);
                attrName = TextHelper.expandTextByLen(attrName, 4);
                nodesDes[i].updateUI(attrName, '+' + attrValue);
                nodesDes[i].setValueColor(Colors.BRIGHT_BG_GREEN);
                nodesDes[i].setVisible(true);
            } else {
                nodesDes[i].setVisible(false);
            }
        }
    }
}