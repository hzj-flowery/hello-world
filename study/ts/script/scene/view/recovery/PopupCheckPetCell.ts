import PopupCheckCellBase from "./PopupCheckCellBase";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupCheckPetCell extends PopupCheckCellBase {
    @property({ type: cc.Node, visible: true })
    _imageMark1: cc.Node = null;

    public updateUI(index: number, data, isAdded) {
        if (data == null) {
            this.node.active = false;
            return;
        }
        super.updateUI(index, data, isAdded, TypeConvertHelper.TYPE_PET);

        var icon = this._item.getCommonIcon();
        var params = icon.getItemParams();
        
        this._item.setName(params.name);
        this._imageMark1.active = (data.isYoke);

        this._updateDes(data);
    }
}