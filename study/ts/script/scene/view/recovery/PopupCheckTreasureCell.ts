import PopupCheckCellBase from "./PopupCheckCellBase";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import UIHelper from "../../../utils/UIHelper";
import { Path } from "../../../utils/Path";
import CommonDesValue from "../../../ui/component/CommonDesValue";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupCheckTreasureCell extends PopupCheckCellBase {

    @property({ type: cc.Sprite, visible: true })
    _imageLevel: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _textLevel: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _textRank: cc.Label = null;

    @property({ type: CommonDesValue, visible: true })
    _nodeDes3: CommonDesValue = null;

    public updateUI(index: number, data, isAdded) {
        if (data == null) {
            this.node.active = false;
            return;
        }
        super.updateUI(index, data, isAdded, TypeConvertHelper.TYPE_TREASURE);
        var level = data.getLevel();
        var rank = data.getRefine_level();

        var icon = this._item.getCommonIcon();
        var params = icon.getItemParams();
        UIHelper.loadTexture(this._imageLevel, Path.getUICommonFrame("img_iconsmithingbg_0" + params.color));
        this._textLevel.string = level;
        this._imageLevel.node.active = level > 0;
        this._textRank.string = "+" + rank;
        this._textRank.node.active = rank > 0;

        this._updateDes(data);

        let info = data.desValue[2];
        if (info) {
            this._nodeDes3.updateUI(info.des, info.value);
            this._nodeDes3.setValueColor(info.colorValue);
            this._nodeDes3.setVisible(true);
        } else {
            this._nodeDes3.setVisible(false);
        }
    }
}