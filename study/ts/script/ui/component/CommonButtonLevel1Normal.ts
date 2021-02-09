import CommonButtonNormal from "./CommonButtonNormal";
import { Path } from "../../utils/Path";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonButtonLevel1Normal extends CommonButtonNormal {
    onLoad() {
        //this.loadTexture(Path.getUICommon("img_btn_ctrl_small01_nml"), null, null);
    }
}