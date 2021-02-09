import CommonButton from "./CommonButton";
import CommonButtonHighLight from "./CommonButtonHighLight";
import { Path } from "../../utils/Path";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonButtonLevel1Highlight extends CommonButtonHighLight {
    onLoad() {
        // if(this._btnType==1||this._btnType==3)
        // //深黄色按钮
        // this.loadTexture(Path.getUICommon("img_btn_ctrl_small02_nml"), null, null);
        // else if(this._btnType==2)
        // //浅黄色按钮
        // this.loadTexture(Path.getUICommon("img_btn_ctrl_small01_nml"), null, null);
    }
    //浅黄色按钮
    public switchNormal():void{
        this.loadTexture(Path.getUICommon("img_btn_ctrl_small01_nml"), null, null);
    }
}
