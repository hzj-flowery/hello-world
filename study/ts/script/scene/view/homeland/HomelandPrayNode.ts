import UIHelper from "../../../utils/UIHelper";
import { G_EffectGfxMgr, G_UserData, G_Prompt, G_AudioManager } from "../../../init";
import { HomelandConst } from "../../../const/HomelandConst";
import { Lang } from "../../../lang/Lang";
import { AudioConst } from "../../../const/AudioConst";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HomelandPrayNode extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeMoving: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _redPoint: cc.Sprite = null;
    _homelandType: any;
    _callback: any;

    ctor(homelandType, callback) {
        this._homelandType = homelandType;
        this._callback = callback;
        UIHelper.addEventListenerToNode(this.node, this._panelTouch, 'HomelandPrayNode', '_onClick');
    }

    onLoad() {
        this.node.setPosition(cc.v2(0, -220));
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeMoving, 'moving_shenshu_lianhuadeng');
    }
    _onClick() {
        if (this.isFriendTree()) {
            return;
        }
        var curLevel = G_UserData.getHomeland().getMainTreeLevel();
        var unlockLevel = HomelandConst.getUnlockPrayLevel();
        if (curLevel < unlockLevel) {
            G_Prompt.showTip(Lang.get('homeland_pray_level_not_reach_tip', { level: unlockLevel }));
            return;
        }
        if (this._callback) {
            G_AudioManager.playSoundWithId(AudioConst.SOUND_QiFU);
            this._callback();
        }
    }
    isFriendTree() {
        if (this._homelandType == HomelandConst.FRIEND_TREE) {
            return true;
        }
        return false;
    }
    updateRedPoint() {
        if (this.isFriendTree() == false) {
            var show = G_UserData.getHomeland().getPrayRestCount() > 0;
            this._redPoint.node.active = (show);
        } else {
            this._redPoint.node.active = (false);
        }
    }

}