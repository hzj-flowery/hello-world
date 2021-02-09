import CommonButtonSwitchLevel1 from "./CommonButtonSwitchLevel1";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonButtonSwitchLevel2 extends CommonButtonSwitchLevel1 {

    constructor() {
        super();
        this._highLight = true;
        this._highLightImg = {
            normal: 'img_btn_ctrl_small01_nml',
            down: "img_btn_ctrl_small01_nml",
            disable: "img_btn_ctrl_first01_nml_hui"
        };
        this._normalImg = {
            normal: "img_btn_ctrl_small02_nml",
            down: "img_btn_ctrl_small02_nml",
            disable: "img_btn_ctrl_first01_nml_hui"
        };
    }
}