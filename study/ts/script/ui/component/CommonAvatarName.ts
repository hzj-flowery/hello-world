import { G_UserData } from "../../init";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import UIHelper from "../../utils/UIHelper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonAvatarName extends cc.Component {

   @property({
       type: cc.Label,
       visible: true
   })
   _textName: cc.Label = null;

   private _enableOutline:boolean;


   setName(baseId, rankLevel?) {
    if (baseId == null) {
        this.node.active = (false);
        return;
    }
    var param = null;
    if (baseId == 0) {
        var roleId = G_UserData.getHero().getRoleBaseId();
        param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, roleId);
    } else {
        param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_AVATAR, baseId);
    }
    var name = param.name;
    if (rankLevel && rankLevel > 0) {
        name = name + ('+' + rankLevel);
    }
    this._textName.string = (name);
    this._textName.node.color = (param.icon_color);
    UIHelper.updateTextOutline(this._textName, param);
    this.node.active = (true);
}
enableOutline(enable) {
    this._enableOutline = enable;
}
setFontSize(size) {
    this._textName.fontSize = (size);
}


}