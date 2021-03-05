import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import CommonIconBase from "./CommonIconBase";
import { Util } from "../../utils/Util";
import { PopupItemInfo } from "../PopupItemInfo";
import { UIPopupHelper } from "../../utils/UIPopupHelper";
import PopupBase from "../PopupBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonResourceIcon extends CommonIconBase {

    // @property({
    //     type: cc.Sprite,
    //     visible: true
    // })
    // _imageBg: cc.Sprite = null;

    // @property({
    //     type: cc.Sprite,
    //     visible: true
    // })
    // _imageIcon: cc.Sprite = null;

    private _textItemTopNum;

    onLoad(): void {
        super.onLoad();
        this._type = TypeConvertHelper.TYPE_RESOURCE;
    }

    updateUI(value, size?, rank?) {
        var itemParams = super.updateUI(value, size, rank);
        if (itemParams.size != null) {
            this.setCount(itemParams.size);
        }
    }

    _onTouchCallBack(sender, state) {
        if (this._callback) {
            this._callback(sender, this._itemParams);
        } else {
            PopupBase.loadCommonPrefab("PopupItemInfo", (popupItemInfo) => {
                popupItemInfo.updateUI(this._type, this._itemParams.cfg.id);
                popupItemInfo.openWithAction();
            })
        }
    }

}