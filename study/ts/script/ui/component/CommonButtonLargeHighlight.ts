import { TextHelper } from "../../utils/TextHelper";
import CommonButtonHighLight from "./CommonButtonHighLight";
import { Path } from "../../utils/Path";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonButtonLargeHighlight extends CommonButtonHighLight {
    onLoad() {
        this.loadTexture(Path.getUICommon("img_btn_ctrl_small02_nml"), null, null);
    }
}