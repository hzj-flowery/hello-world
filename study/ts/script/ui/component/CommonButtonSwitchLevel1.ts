import CommonButton from "./CommonButton";
import { Path } from "../../utils/Path";
import { Colors } from "../../init";
import UIHelper from "../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonButtonSwitchLevel1 extends CommonButton {

    _highLight;
    _highLightImg;
    _normalImg;
    _isInitSwitch;

    constructor() {
        super();
        this._highLight = true;
        this._highLightImg = {
            normal: 'img_btn_ctrl_small01_nml',
            down: null,
            disable: null
        };
        this._normalImg = {
            normal: 'img_btn_ctrl_small02_nml',
            down: null,
            disable: null
        };
    }

    onLoad() {
        //super.onLoad();
        if (!this._isInitSwitch) {
            this.switchToHightLight()
        }
        this._button.enableAutoGrayEffect = true;
    }
    _switchBtnImg(highLight) {
        this._isInitSwitch = true;
        if (highLight) {
            this.loadTexture(Path.getUICommon(this._highLightImg.normal), this._highLightImg.down && Path.getUICommon(this._highLightImg.down), this._highLightImg.disable && Path.getUICommon(this._highLightImg.disable));
            this._text.node.color = (Colors.BUTTON_ONE_NORMAL);
            UIHelper.enableOutline(this._text, Colors.BUTTON_ONE_NORMAL_OUTLINE, 2);
        } else {
            this.loadTexture(Path.getUICommon(this._normalImg.normal), this._normalImg.down && Path.getUICommon(this._normalImg.down), this._normalImg.disable && Path.getUICommon(this._normalImg.disable));
            this._text.node.color = (Colors.BUTTON_ONE_NOTE);
            UIHelper.enableOutline(this._text, Colors.BUTTON_ONE_NOTE_OUTLINE, 2);
        }
    }

    setEnabled(e) {
        this._button.interactable = (e);
        if (this._highLight) {
            this._text.node.color = (e && Colors.BUTTON_ONE_NORMAL || Colors.BUTTON_ONE_DISABLE);
            UIHelper.enableOutline(this._text, e ? Colors.BUTTON_ONE_NORMAL_OUTLINE : Colors.BUTTON_ONE_DISABLE_OUTLINE, 2);
        } else {
            this._text.node.color = (e && Colors.BUTTON_ONE_NOTE || Colors.BUTTON_ONE_DISABLE);
            UIHelper.enableOutline(this._text, e ? Colors.BUTTON_ONE_NOTE_OUTLINE : Colors.BUTTON_ONE_DISABLE_OUTLINE, 2);
        }
    }
    enableHighLightStyle(hightLight) {
        this._highLight = hightLight;
        this._switchBtnImg(this._highLight);
        // var enable = this._button.node.active;
        var enable = this._button.interactable;
        this.setEnabled(enable);
    }
    reverseUI() {
        this.enableHighLightStyle(!this._highLight);
    }
    switchToHightLight() {
        this.enableHighLightStyle(true);
    }
    switchToNormal() {
        this.enableHighLightStyle(false);
    }

}