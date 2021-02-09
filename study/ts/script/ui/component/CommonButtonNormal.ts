import CommonButton from "./CommonButton";
import { Colors } from "../../init";
import UIHelper from "../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonButtonNormal extends CommonButton {

   
    setEnabled(e) {
        super.setEnabled(e);
        this._text.node.color = e ? Colors.BUTTON_ONE_NORMAL : Colors.BUTTON_ONE_DISABLE;
        UIHelper.enableOutline(this._text, e ? Colors.BUTTON_ONE_NORMAL_OUTLINE : Colors.BUTTON_ONE_DISABLE_OUTLINE, 2);
    }

}