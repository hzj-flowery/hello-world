import CommonIconBase from "./CommonIconBase";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import { UserDataHelper } from "../../utils/data/UserDataHelper";
import { Util } from "../../utils/Util";
import { G_SceneManager } from "../../init";
import { PopupItemInfo } from "../PopupItemInfo";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonTitle extends CommonIconBase {
    
    _callback: any;

    public static readonly WIDTH_CONST = 160;

    initData() {
        this._type = TypeConvertHelper.TYPE_TITLE;
    }
    setCallback(callback) {
        this._callback = callback;
    }
    refreshToEmpty(useUnknow) {
    }
    onLoad(){
        super.onLoad();
        this.initData();
    }
    updateUI(value, scale) {
        UserDataHelper.appendNodeTitle(this._imageIcon.node, value, 'CommonTitle');
        var itemParams = TypeConvertHelper.convert(this._type, value, null, null, null);
        this._itemParams = itemParams;
        scale = scale || 1;
        this._imageIcon.node.setScale(scale);
        this._imageBg.node.setScale(scale);
        this._imageBg.node.active = false;
        this._imageIcon.enabled = false;
    }
    _onTouchCallBack(sender, state) {
        if (this._callback) {
            this._callback(this._target, this._itemParams);
        }
        var type = this._type;
        var id = this._itemParams.cfg.id;
        if (this._itemParams) {
            G_SceneManager.openPopup("prefab/common/PopupItemInfo", (popup: PopupItemInfo) => {
                popup.updateUI(type, id);
                popup.openWithAction();
            });
        }
    }
    getPanelSize() {
        var size = this._imageIcon.node.getContentSize();
        size.width = CommonTitle.WIDTH_CONST;
        return size;
    }
    setIconMask() {
    }

}