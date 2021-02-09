const { ccclass, property } = cc._decorator;

import CommonHeroIcon from '../../../ui/component/CommonHeroIcon'
import { G_UserData } from '../../../init';
import { PopUpPlayerFrameHelper } from './PopUpPlayerFrameHelper';
import { handler } from '../../../utils/handler';

@ccclass
export default class PopUpPlayerFrameItemCell extends cc.Component {

    @property({
        type: CommonHeroIcon,
        visible: true
    })
    _heroNode1: CommonHeroIcon = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _select1: cc.Sprite = null;


    private _callBack;
    private _itemSpacing = 22;
    private _frameItemData;

    updateUI(frameItemData) {
        this._heroNode1.onLoad();
        if (this._frameItemData != frameItemData) {
            this._heroNode1.updateIcon(G_UserData.getBase().getPlayerShowInfo(), null, frameItemData.getId());
        }
        this._frameItemData = frameItemData;
        if (G_UserData.getHeadFrame().isFrameHasRedPoint(frameItemData.getId())) {
            this._heroNode1.setRedPointVisible(true);
        } else {
            this._heroNode1.setRedPointVisible(false);
        }
        if (!frameItemData.isHave()) {
            this._heroNode1.setLocked(true);
            this._heroNode1.setHeroIconMask(true);
        } else {
            this._heroNode1.setLocked(false);
            this._heroNode1.setHeroIconMask(false);
        }
        if (frameItemData.getId() == PopUpPlayerFrameHelper.getCurrentTouchIndex()) {
            this._select1.node.active = (true);
            this._heroNode1.setRedPointVisible(false);
            G_UserData.getHeadFrame().deleteRedPointBy(frameItemData.getId());
        } else {
            this._select1.node.active = (false);
        }
        this._heroNode1.setCallBack(handler(this, this._onTouchCallBack));
    }
    _onTouchCallBack(sender, param) {
        PopUpPlayerFrameHelper.setCurrentTouchIndex(parseInt(this._frameItemData.getId()));
        if (this._callBack) {
            this._callBack(parseInt(this._frameItemData.getId()));
        }
    }
    setItemTouchCallBack(callback) {
        if (callback) {
            this._callBack = callback;
        }
    }
}