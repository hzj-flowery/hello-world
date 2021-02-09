import CommonButtonSwitchLevel1 from "./CommonButtonSwitchLevel1";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonButtonSwitchLevel0 extends CommonButtonSwitchLevel1 {

    constructor() {
        super();
        this._highLight = true;
        this._highLightImg = {
            normal: 'img_btn_ctrl_large02_nml',
            down: null,
            disable: null
        };
        this._normalImg = {
            normal: 'img_btn_ctrl_large01_nml',
            down: null,
            disable: null
        };
    }
}