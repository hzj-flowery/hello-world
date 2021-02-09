import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import { HorseDataHelper } from "../../utils/data/HorseDataHelper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonHorseName extends cc.Component {

   @property({
       type: cc.Label,
       visible: true
   })
   _textName: cc.Label = null;

    setName(horseId, star) {
        var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HORSE, horseId);
        var name = HorseDataHelper.getHorseName(horseId, star);
        this._textName.string = (name);
        this._textName.node.color = (param.icon_color);
    }
    setFontSize(size) {
        this._textName.fontSize = (size);
    }
}
