import CommonButtonHighLight from "./CommonButtonHighLight";
import { Path } from "../../utils/Path";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonButtonLevel0Highlight extends CommonButtonHighLight {
    onLoad() {
        //this.loadTexture(Path.getUICommon("img_btn_ctrl_large02_nml"), null, null);
    }
}