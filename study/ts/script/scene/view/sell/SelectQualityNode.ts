import { Colors } from "../../../init";
import { Lang } from "../../../lang/Lang";
import ViewBase from "../../ViewBase";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SelectQualityNode extends ViewBase {

   @property({
       type: cc.Label,
       visible: true
   })
   _selectTitle: cc.Label = null;

   @property({
       type: cc.Toggle,
       visible: true
   })
   _checkBox: cc.Toggle = null;

   private _colorQuality:number;

    ctor(colorQuality) {
        this._colorQuality = colorQuality;
    }
    onCreate(){
        var color = Colors.COLOR_QUALITY[this._colorQuality-1];
        if (color) {
            this._selectTitle.string = (Lang.get('lang_sellfragmentselect_quality_' + this._colorQuality));
            this._selectTitle.node.color = (color);
        }
    }
    onEnter(){
    }
    onExit(){
    }
    isSelected(){
        return this._checkBox.isChecked;
    }
    getColorQuality(){
        return this._colorQuality;
    }
}
