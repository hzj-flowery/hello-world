import UIHelper from "../../utils/UIHelper";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonEquipName3 extends cc.Component {

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_1: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textName: cc.Label = null;

   setName(equipId, rank?):void {
    var equipParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_EQUIPMENT, equipId);
    var equipName = equipParam.name;
    if (rank && rank > 0) {
        equipName = equipName + ('+' + rank);
    }
    this._textName.string = (equipName);
    this._textName.node.color = (equipParam.icon_color);
    this._textName.fontSize = (20);
    UIHelper.updateTextOutline(this._textName, equipParam);
}
setFontSize(size) {
    this._textName.fontSize = (size);
}
setNameWidth(width) {
    var size = this._textName.node.getContentSize();
    this._textName.node.setContentSize(width, size.height);
}

}