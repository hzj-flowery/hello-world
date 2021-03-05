import CommonEquipIcon from "../../../ui/component/CommonEquipIcon";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import UIHelper from "../../../utils/UIHelper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class EquipDetailSuitIcon extends cc.Component {
    @property({
        type: CommonEquipIcon,
        visible: true
    })
    _fileNodeEquip: CommonEquipIcon = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    updateView(equipId, needMask) {
        this._fileNodeEquip.updateUI(equipId);
        this._fileNodeEquip.setIconMask(needMask);
        var equipParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_EQUIPMENT, equipId);
        this._textName.string = (equipParam.name);
        this._textName.node.color = (equipParam.icon_color);
        UIHelper.updateTextOutline(this._textName, equipParam);
    }
    setIconMask(needMask) {
        this._fileNodeEquip.setIconMask(needMask);
    }
}