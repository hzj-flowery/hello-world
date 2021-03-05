const {ccclass, property} = cc._decorator;

import CommonFullScreenActivityTitle from '../../../../ui/component/CommonFullScreenActivityTitle'

import CommonHeroAvatar from '../../../../ui/component/CommonHeroAvatar'

import CommonTalkNode from '../../../../ui/component/CommonTalkNode'
import ActivitySubView from '../ActivitySubView';
import UIHelper from '../../../../utils/UIHelper';
import { G_UserData, G_SignalManager, G_Prompt, G_ServerTime, Colors } from '../../../../init';
import { SignalConst } from '../../../../const/SignalConst';
import { handler } from '../../../../utils/handler';
import { Lang } from '../../../../lang/Lang';
import { Path } from '../../../../utils/Path';

@ccclass
export default class DinnerView extends ActivitySubView {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageJc: cc.Sprite = null;

    @property({
        type: CommonTalkNode,
        visible: true
    })
    _commonBubble: CommonTalkNode = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _hero: CommonHeroAvatar = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageDesk: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageWine: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _chicken: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textDinnerName01: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textDinnerName02: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textDinnerName03: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textDinnerTime01: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textDinnerTime02: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textDinnerTime03: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _selectImage: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCD: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCDHint: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCDTitle: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageClick: cc.Sprite = null;

    _activityId: any;
    _dinnerNameTimeTexts: cc.Label[][];
    _signalWelfareDinnerGetInfo: any;
    _signalWelfareDinnerEat: any;
    _signalWelfareDinnerReEat;
    _clickEffectShow: any;

    ctor(activityId) {
        this._activityId = activityId;
        this._imageClick.node.on('touchend', this._onClickEat, this, true);
    }
    _pullData() {
        var hasActivityServerData = G_UserData.getActivity().hasActivityData(this._activityId);
        if (!hasActivityServerData) {
            G_UserData.getActivity().pullActivityData(this._activityId);
        }
        return hasActivityServerData;
    }
    onCreate() {
        this._dinnerNameTimeTexts = [
            [
                this._textDinnerName01,
                this._textDinnerTime01
            ],
            [
                this._textDinnerName02,
                this._textDinnerTime02
            ],
            [
                this._textDinnerName03,
                this._textDinnerTime03
            ]
        ];
        this._initDinnerTimeText();
    }
    onEnter() {
        this._signalWelfareDinnerGetInfo = G_SignalManager.add(SignalConst.EVENT_WELFARE_DINNER_GET_INFO, handler(this, this._onEventWelfareDinnerGetInfo));
        this._signalWelfareDinnerEat = G_SignalManager.add(SignalConst.EVENT_WELFARE_DINNER_EAT, handler(this, this._onEventWelfareDinnerEat));
        this._signalWelfareDinnerReEat = G_SignalManager.add(SignalConst.EVENT_WELFARE_DINNER_REEAT, handler(this, this._onEventWelfareDinnerReEat));
        var hasServerData = this._pullData();
        if (hasServerData && G_UserData.getActivityDinner().isExpired()) {
            G_UserData.getActivity().pullActivityData(this._activityId);
        }
        this._refreshData();
        // if (this._refreshHandler != null) {
        //     return;
        // }
        // this._refreshHandler = SchedulerHelper.newSchedule(handler(this, this._onRefreshTick), 1);
        this.schedule(handler(this, this._onRefreshTick), 1);

        this._hero.updateUI(216);
        this._hero.node.scaleX = -(1.5);
        this._hero.node.scaleY = (1.5);
    }
    onExit() {
        this._signalWelfareDinnerGetInfo.remove();
        this._signalWelfareDinnerGetInfo = null;
        this._signalWelfareDinnerEat.remove();
        this._signalWelfareDinnerEat = null;
        this._signalWelfareDinnerReEat.remove();
        this._signalWelfareDinnerReEat = null;
        // if (this._refreshHandler != null) {
        //     SchedulerHelper.cancelSchedule(this._refreshHandler);
        //     this._refreshHandler = null;
        // }
        this.unschedule(handler(this, this._onRefreshTick));
    }
    enterModule() {
        this._refreshNpcText();
    }
    _onRefreshTick(dt) {
        this._refreshData();
    }
    _refreshData() {
        this._refreshDinnerTimeText();
        this._refreshNpcText();
        this._refreshCdText();
        this._refreshClickEffect();
    }
    _onEventWelfareDinnerGetInfo(event, id, message) {
        this._refreshData();
    }
    _onEventWelfareDinnerEat(event, id, message) {
        this._refreshData();
        this._onShowRewardItems(message);
    }
    _onEventWelfareDinnerReEat(event, id, message) {
        this._refreshData();
        this._onShowRewardItems(message);
    }
    _onShowRewardItems(message) {
        var awards = message['awards'] || {};
        if (awards) {
            G_Prompt.showAwards(awards);
        }
        this._hero.playAnimationOnce('style');
    }
    _onClickEat(sender) {
        G_UserData.getActivityDinner().c2sActDinner();
    }
    _initDinnerTimeText() {
        var dinnerUnitDatas = G_UserData.getActivityDinner().getTodayAllDinnerUnitDatas();
        for (let k=0; k<this._dinnerNameTimeTexts.length;k++) {
            var nameTimeText = this._dinnerNameTimeTexts[k];
            var dinnerUnitData = dinnerUnitDatas[k];
            if (!dinnerUnitData) {
                nameTimeText[0].node.active = (false);
                nameTimeText[1].node.active = (false);
            } else {
                nameTimeText[0].node.active = (true);
                nameTimeText[1].node.active = (true);
                nameTimeText[0].string = (dinnerUnitData.getConfig().name + Lang.get('lang_activity_dinner_colon'));
                nameTimeText[1].string = (dinnerUnitData.getConfig().time_txt);
            }
        }
    }
    _refreshDinnerTimeText() {
        var dinnerUnitDatas = G_UserData.getActivityDinner().getTodayAllDinnerUnitDatas();
        this._selectImage.node.active = (false);
        for (let k=0; k<this._dinnerNameTimeTexts.length;k++) {
            var nameTimeText = this._dinnerNameTimeTexts[k];
            var dinnerUnitData = dinnerUnitDatas[k];
            if (dinnerUnitData) {
                if (dinnerUnitData.isInDinnerTime()) {
                    nameTimeText[0].node.color = (Colors.BRIGHT_BG_RED);
                    nameTimeText[1].node.color = (Colors.BRIGHT_BG_RED);
                    this._selectImage.node.y = (nameTimeText[0].node.y);
                    this._selectImage.node.active = (true);
                } else {
                    nameTimeText[0].node.color = (Colors.BRIGHT_BG_TWO);
                    nameTimeText[1].node.color = (Colors.BRIGHT_BG_TWO);
                }
            }
        }
    }
    _runClickZoomAction(node) {
        node.stopAllActions();
        var action1 = cc.scaleTo(0.6, 1.3);
        var action2 = cc.scaleTo(0.6, 1);
        var seq = cc.sequence(action1, action2);
        var rep = cc.repeatForever(seq);
        node.runAction(rep);
    }
    _refreshCdText() {
        var hasData = G_UserData.getActivityDinner().getBaseActivityData().isHasData();
        if (!hasData) {
            this._textCD.node.active = (false);
            this._textCDTitle.node.active = (false);
            this._textCDHint.node.active = (false);
            return;
        }
        var [text, cdText] = this._getCDHintText();
        if (cdText) {
            this._textCD.node.active = (true);
            this._textCDTitle.node.active = (true);
            this._textCDHint.node.active = (false);
            this._textCD.string = (cdText);
            this._textCDTitle.string = (text);
        } else {
            this._textCD.node.active = (false);
            this._textCDTitle.node.active = (false);
            this._textCDHint.node.active = (true);
            this._textCDHint.string = (text);
        }
    }
    _getCDHintText() {
        var actDinner = G_UserData.getActivityDinner();
        var currDinnerUnitData = actDinner.getCurrDinnerUnitData();
        if (currDinnerUnitData) {
            if (!currDinnerUnitData.hasEatDinner()) {
                return [Lang.get('lang_activity_dinner_cd_hint_01', { dinnerName: currDinnerUnitData.getConfig().name })];
            }
        }
        var nextDinnerUnitData = actDinner.getNextDinnerUnitData();
        if (nextDinnerUnitData) {
            var curTime = G_ServerTime.getTime();
            var hasSeconds = G_ServerTime.secondsFromToday(curTime);
            var cdSeconds = nextDinnerUnitData.getStartTime() - hasSeconds;
            var cdText = G_ServerTime._secondToString(cdSeconds);
            return [
                Lang.get('lang_activity_dinner_cd_hint_02'),
                cdText
            ];
        } else {
            return [Lang.get('lang_activity_dinner_cd_hint_03')];
        }
    }
    _getNpcText() {
    }
    _refreshNpcText() {
    }
    _setNpcText(text) {
    }
    _refreshClickEffect() {
        var hasData = G_UserData.getActivityDinner().getBaseActivityData().isHasData();
        var currDinnerUnitData = G_UserData.getActivityDinner().getCurrDinnerUnitData();
        if (currDinnerUnitData && !currDinnerUnitData.hasEatDinner()) {
            this._showClickEffect(true);
        } else {
            this._showClickEffect(false);
        }
    }
    _showClickEffect(isShow) {
        if (this._clickEffectShow == isShow) {
            return;
        }
        this._clickEffectShow = isShow;
        if (isShow) {
            this._chicken.node.active = (true);
            UIHelper.loadTexture(this._imageWine, Path.getActivityRes('img_yanhui_jiu'));
            this._imageClick.node.active = (true);
            this._runClickZoomAction(this._imageClick.node);
        } else {
            UIHelper.loadTexture(this._imageWine, Path.getActivityRes('img_yanhui_jiukai'));
            this._chicken.node.active = (false);
            this._imageClick.node.active = (false);
        }
    }
}
