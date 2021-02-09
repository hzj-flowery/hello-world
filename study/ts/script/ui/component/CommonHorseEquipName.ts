import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import { HorseDataHelper } from "../../utils/data/HorseDataHelper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonHorseEquipName extends cc.Component {

   @property({
       type: cc.Label,
       visible: true
   })
   _textName: cc.Label = null;

    setName(equipId, rank?) {
        var equipParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HORSE_EQUIP, equipId);
        var equipName = equipParam.name;
        this._textName.string = (equipName);
        this._textName.node.color = (equipParam.icon_color);
    }
    setFontSize(size) {
        this._textName.fontSize = (size);
    }
}
