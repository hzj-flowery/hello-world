import CommonIconBase from "./CommonIconBase";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import { G_SceneManager } from "../../init";
import PopupTacticsDetail from "../popup/PopupTacticsDetail";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonTacticsIcon extends CommonIconBase {
    /**
     *
     */
    constructor() {
        super();
        this._type = TypeConvertHelper.TYPE_TACTICS;
    }
    _init() {
        CommonTacticsIcon.prototype._init.call(this);
    }
    updateUI(value, size?, rank?, limitLevel?, limitRedLevel?) {
        var itemParams = super.updateUI(value, size, rank, limitLevel, limitRedLevel);
        return itemParams;
    }
    _onTouchCallBack(sender, state) {
        if (state == cc.Node.EventType.TOUCH_END) {
            var moveOffsetX = Math.abs(sender.getTouchEndPosition().x - sender.getTouchBeganPosition().x);
            var moveOffsetY = Math.abs(sender.getTouchEndPosition().y - sender.getTouchBeganPosition().y);
            if (moveOffsetX < 20 && moveOffsetY < 20) {
                if (this._callback) {
                    this._callback(sender, this._itemParams);
                } else {
                    var baseId = this._itemParams.cfg.id;
                    G_SceneManager.openPopup('prefab/common/PopupTacticsDetail', (popup: PopupTacticsDetail) => {
                        popup.ctor(sender, baseId);
                        popup.open();
                    })
                }
            }
        }
    }
}