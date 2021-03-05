import PopupBase from "../../../ui/PopupBase";
import CommonButton from "../../../ui/component/CommonButton";
import CommonButtonLevel2Normal from "../../../ui/component/CommonButtonLevel2Normal";
import { handler } from "../../../utils/handler";
import { G_ConfigLoader, G_EffectGfxMgr, G_SceneManager, G_ServerTime, G_SignalManager, G_UserData } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import { FunctionConst } from "../../../const/FunctionConst";
import CommonButtonLevel1Highlight from "../../../ui/component/CommonButtonLevel1Highlight";
import UIHelper from "../../../utils/UIHelper";
import { WxUtil } from "../../../utils/WxUtil";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { Path } from "../../../utils/Path";
import DailyMissionActiviyValue from "../achievement/DailyMissionActiviyValue";
import EffectGfxMoving from "../../../effect/EffectGfxMoving";
import { PopupGetRewards } from "../../../ui/PopupGetRewards";
import WxInviteUserItem from "./WxInviteUserItem";
import PopupReward from "../../../ui/popup/PopupReward";
import { Lang } from "../../../lang/Lang";
import CommonHelp from "../../../ui/component/CommonHelp";

const { ccclass, property } = cc._decorator;


@ccclass
export default class PopupWxShare extends PopupBase {

    @property({ type: cc.Sprite, visible: true })
    _boxImage1: cc.Sprite = null;
    @property({ type: cc.Sprite, visible: true })
    _boxImage2: cc.Sprite = null;
    @property({ type: cc.Sprite, visible: true })
    _boxImage3: cc.Sprite = null;
    @property({ type: CommonButtonLevel1Highlight, visible: true })
    _btnShare: CommonButtonLevel1Highlight = null;
    @property({ type: cc.ProgressBar, visible: true })
    _progress: cc.ProgressBar = null;

    @property({ type: cc.Label, visible: true })
    _textCountDown: cc.Label = null;

    @property({
        type: CommonHelp,
        visible: true
    })
    _commonHelpBig: CommonHelp = null;

    @property({ type: WxInviteUserItem, visible: true })
    _user0: WxInviteUserItem = null;
    @property({ type: WxInviteUserItem, visible: true })
    _user1: WxInviteUserItem = null;
    @property({ type: WxInviteUserItem, visible: true })
    _user2: WxInviteUserItem = null;
    @property({ type: WxInviteUserItem, visible: true })
    _user3: WxInviteUserItem = null;
    @property({ type: WxInviteUserItem, visible: true })
    _user4: WxInviteUserItem = null;

    private prizeStates: Number[] = [];



    private _boxRedpoint: Array<cc.Sprite> = [];
    private _boxEffect: Array<EffectGfxMoving> = [];
    _signalGetInviteUserLvAward: import("f:/mingjiangzhuan/main/assets/resources/script/utils/event/Slot").Slot;
    _signalGetInviteNumAward: import("f:/mingjiangzhuan/main/assets/resources/script/utils/event/Slot").Slot;
    private _targetTime: number;

    private _imgIdxs = [3,3,4];

    public static waitEnterMsg(callBack, params) {
        function onMsgCallBack() {
            callBack();
        }
        G_SignalManager.addOnce(SignalConst.EVENT_GetInviteAwardInfo, onMsgCallBack);
        G_UserData.getShareReward().c2sGetInviteAwardInfo();
    }

    onCreate() {
        this._btnShare.addClickEventListenerEx(handler(this, this.onClickShare));
        for (let i = 1; i <= 3; i++) {
            UIHelper.addEventListenerToNode(this.node, this["_boxImage" + i].node, 'PopupWxShare', 'onBoxClick', i)
        }
        this._commonHelpBig.updateUI(FunctionConst.FUNC_WX_SHARE);
        this._progress.progress = 0;
        this._btnShare.setString('邀请好友');
        this._signalGetInviteUserLvAward = G_SignalManager.add(SignalConst.EVENT_GetInviteUserLvAward, handler(this, this._onEventGetInviteUserLvAward));
        this._signalGetInviteNumAward = G_SignalManager.add(SignalConst.EVENT_GetInviteNumAward, handler(this, this._onEventGetInviteNumAward));
        this._startCountDown();
    }

    onExit() {
        this._signalGetInviteUserLvAward.remove();
        this._signalGetInviteUserLvAward = null;
        this._signalGetInviteNumAward.remove();
        this._signalGetInviteNumAward = null;
    }

    onEnter() {
        this.updateView();
    }

    _startCountDown() {
        this._targetTime = G_UserData.getShareReward().getActivityEndTime();
        this._textCountDown.node.parent.active = true;
        this._stopCountDown();
        this.schedule(this._updateCountDown, 1);
        this._updateCountDown();
    }

    _stopCountDown() {
        this.unschedule(this._updateCountDown);
    }


    _updateCountDown() {
        if (!this._textCountDown) {
            return;
        }
        var curTime = G_ServerTime.getTime();
        var countDown = this._targetTime - curTime;
        if (countDown > 0) {
            // this._textCountDownTitle.string = Lang.get('day7_recharge_activity_title');
            var [_, timeString] = G_ServerTime.getLeftDHMSFormatD(this._targetTime);
            this._textCountDown.string = timeString;
        } else {
            this._stopCountDown();

            this._textCountDown.node.parent.active = false;
        }
    }

    _onEventGetInviteUserLvAward(id, info, awards) {
        PopupGetRewards.showRewards(awards);
        this.updateView();
    }
    _onEventGetInviteNumAward(id, arr, awards) {
        PopupGetRewards.showRewards(awards);
        this.updateView();
    }


    updateView() {
        var data = G_UserData.getShareReward();
        var userInfos = data.getUser_info();
        for (var i = 0; i < 5; i++) {
            this["_user" + i].updateData(userInfos[i]);
        }
        var cnt
        for (var i = 1; i <= 3; i++) {
            var boxImage: cc.Sprite = this["_boxImage" + i];
            var cfg = G_ConfigLoader.getConfig(ConfigNameConst.SHARE_REWARD).get(i + 3);
            var conditons = cfg.parameter.split('|');
            var needCnt = Number(conditons[0]);
            var needLv = Number(conditons[1]);
            cnt = 0;
            for (var key in userInfos) {
                var v = userInfos[key];
                if (v.lv >= needLv) {
                    cnt++;
                }
            }
            var state = 0;
            var imgIdx = this._imgIdxs[i -1];
            if (cnt >= needCnt) {
                var hasGetReward = data.getInvite_num_award_id().indexOf(i + 3) != -1;
                if (hasGetReward) {
                    UIHelper.loadTexture(boxImage, Path.getChapterBox(DailyMissionActiviyValue.BOX_PNG[imgIdx][2]));
                    this._removeBoxFlash(i);
                    state = 2;
                } else {
                    UIHelper.loadTexture(boxImage, Path.getChapterBox(DailyMissionActiviyValue.BOX_PNG[imgIdx][1]))
                    this._createBoxEffect(i);
                    state = 1;
                }
            } else {
                UIHelper.loadTexture(boxImage, Path.getChapterBox(DailyMissionActiviyValue.BOX_PNG[imgIdx][0]))
            }
            this.prizeStates.push(state);
        }
        // if (cnt <= 3) {
        //     this._progress.progress = 0.5 * cnt / 3;
        // } else {
        //     this._progress.progress = Math.min(0.5 + 0.5 * (cnt - 3) / 2, 1);
        // }
    }

    onBoxClick(sender, i) {
        var cfg = G_ConfigLoader.getConfig(ConfigNameConst.SHARE_REWARD).get(i + 3);
        var state = this.prizeStates[i - 1];
        if (state == 1) {
            G_UserData.getShareReward().c2sGetInviteNumAward(i + 3);
        } else if (state == 0) {
            var rewards = [];
            for (var j = 1; j <= 4; j++) {
                if(cfg["reward_type" + j]) {
                    var item = {
                        type: cfg["reward_type" + j],
                        value: cfg["reward_value" + j],
                        size: cfg["reward_size" + j]
                    };
                    rewards.push(item);
                }
            }
            G_SceneManager.openPopup(Path.getCommonPrefab("PopupReward"), (popup: PopupReward) => {
                popup.setClickOtherClose(true);
                popup.setInitData(Lang.get('daily_task_box'), false, true);
                popup.updateUI(rewards);
                var conditons = cfg.parameter.split('|');
                var needCnt = Number(conditons[0]);
                var needLv = Number(conditons[1]);
                popup.setDetailText(needCnt + "个好友达成" + needLv + "级可领取");
                popup.openWithTarget(sender.currentTarget);
            })
        }
    }

    _createBoxEffect(index) {
        if (this._boxEffect[index] || this._boxRedpoint[index]) {
            return;
        }
        var baseNode = this["_boxImage" + index].node;
        if (!baseNode) {
            return;
        }
        var effect = G_EffectGfxMgr.createPlayMovingGfx(baseNode, 'moving_boxflash', null, null, false);
        this._boxEffect[index] = effect;
        var redPoint = UIHelper.newSprite(Path.getUICommon('img_redpoint'));
        baseNode.addChild(redPoint.node);
        redPoint.node.setPosition(cc.v2(80 / 2, 66 / 2));
        this._boxRedpoint[index] = redPoint;
    }
    _removeBoxFlash(index) {
        if (this._boxEffect[index]) {
            this._boxEffect[index].node.destroy();
            this._boxEffect[index] = null;
        }
        if (this._boxRedpoint[index]) {
            this._boxRedpoint[index].node.destroy();
            this._boxRedpoint[index] = null;
        }
    }

    onClickShare() {
        WxUtil.shareAppMessage('名将传终于出小游戏啦', null);
    }
}