import PopupCheckCellBase from "./PopupCheckCellBase";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupCheckInstrumentCell extends PopupCheckCellBase {

    @property({ type: cc.Label, visible: true })
    _textRank: cc.Label = null;

    public updateUI(index: number, data, isAdded) {
        if (data == null) {
            this.node.active = false;
            return;
        }
        super.updateUI(index, data, isAdded, TypeConvertHelper.TYPE_INSTRUMENT);
        var baseId = data.getBase_id();
        var level = data.getLevel();
        var limitLevel = data.getLimit_level();

        var icon = this._item.getCommonIcon();
        icon.getIconTemplate().updateUI(baseId, null, limitLevel);

        var params = icon.getItemParams();
        this._item.setName(params.name, params.icon_color);
        this._textRank.string = "+" + level;
        this._textRank.node.active = level > 0;

        this._updateDes(data);
    }
}