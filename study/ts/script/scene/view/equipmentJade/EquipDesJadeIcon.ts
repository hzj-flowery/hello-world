import CommonJadeIcon from "../../../ui/component/CommonJadeIcon";
import { Lang } from "../../../lang/Lang";
import { Colors } from "../../../init";
import UIHelper from "../../../utils/UIHelper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class EquipDesJadeIcon extends cc.Component {
    @property({
        type: CommonJadeIcon,
        visible: true
    })
    _jadeIcon: CommonJadeIcon = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    onLoad() {
        
    }

    onEnable(){
        this._jadeIcon.setTouchEnabled(false);
    }
    updateIcon(jadeId) {
        if (jadeId > 0) {
            this._jadeIcon.updateUI(jadeId);
            var params = this._jadeIcon.getItemParams();
            this._textName.string = (params.name);
            this._textName.node.color = (params.icon_color);
            UIHelper.updateTextOutline(this._textName, params.icon_color_outline);
        } else {
            this._textName.string = (Lang.get('not_inject_in_time'));
            this._textName.node.color = (Colors.getColor(5));
        }
    }
    
}