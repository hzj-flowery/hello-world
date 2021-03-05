import CommonButton from "./CommonButton";
import { Colors } from "../../init";
import UIHelper from "../../utils/UIHelper";
import { Path } from "../../utils/Path";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonButtonHighLight extends CommonButton {

    protected _btnType:number = 1; //1表示不做处理 2表示浅黄色按钮 3表示深黄色按钮
    public setBtnType(type):void{
        this._btnType = type;
    }
    setEnabled(e) {
        this.scheduleOnce(()=>{
            super.setEnabled(e);
        })
        this._text.node.color = e ? Colors.BUTTON_ONE_NOTE : Colors.BUTTON_ONE_DISABLE;
        UIHelper.enableOutline(this._text, e ? Colors.BUTTON_ONE_NOTE_OUTLINE : Colors.BUTTON_ONE_DISABLE_OUTLINE, 2);
    }

}