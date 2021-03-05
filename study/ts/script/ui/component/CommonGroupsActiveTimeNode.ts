import { handler } from "../../utils/handler";
import { Lang } from "../../lang/Lang";
import { G_ResolutionManager, G_UserData, G_ServerTime, G_EffectGfxMgr, G_SignalManager } from "../../init";
import UIHelper from "../../utils/UIHelper";
import { Path } from "../../utils/Path";
import { SignalConst } from "../../const/SignalConst";
import UIActionHelper from "../../utils/UIActionHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonGroupsActiveTimeNode extends cc.Component {

    @property({ type: cc.Node, visible: true })
    _panelTouch: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _imageTouch: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _background: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _image_1: cc.Sprite = null;

    @property({ type: cc.Node, visible: true })
    _panel_Add: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _image_25: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageClockStatic: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _textTimeTitle: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _textLeftTime: cc.Label = null;

    @property({ type: cc.Node, visible: true })
    _nodeTimeEffect: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _imagePopup: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _text1: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _text2: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _textTime1: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _textTime2: cc.Label = null;

    private _showPopup = false;

    public onLoad() {
        this._imageTouch.on(cc.Node.EventType.TOUCH_START, handler(this, this._onClick))
        this._text1.string = (Lang.get('groups_active_time_title'));
        this._text2.string = (Lang.get('groups_assist_time_title'));
        this._panelTouch.setContentSize(G_ResolutionManager.getDesignCCSize());
        this._panelTouch.on(cc.Node.EventType.TOUCH_START, handler(this, this._onTouch));
        (this._panelTouch as any)._touchListener.setSwallowTouches(false);
    }

    public onEnable() {
    }

    public start() {
    }
    private _adjustTouchArea() {
        if (this.node.getComponent(cc.Widget) != null) {
            this.node.getComponent(cc.Widget).updateAlignment();
        }
        var nodePos = this.node.convertToWorldSpaceAR(cc.v2(0, 0));
        var size = G_ResolutionManager.getDesignCCSize();
        var posx = size.width / 2 - nodePos.x;
        var posy = size.height / 2 - nodePos.y;
        this._panelTouch.setPosition(posx, posy);
    }

    public updateUIOfStatic() {
        this._adjustTouchArea();
        UIHelper.loadTexture(this._imageClockStatic, Path.getQinTomb('img_qintomb_time01'));
        var leftTime = G_UserData.getBase().getGrave_left_sec();
        var assistLeftTime = G_UserData.getBase().getGrave_assist_sec();
        if (leftTime > 0) {
            this._textTimeTitle.string = (Lang.get('groups_active_time_title'));
            var leftTimeStr = G_ServerTime._secondToString(leftTime);
            this._textLeftTime.string = (leftTimeStr);
        } else {
            this._textTimeTitle.string = (Lang.get('groups_assist_time_title'));
            var leftTimeStr = G_ServerTime._secondToString(assistLeftTime);
            this._textLeftTime.string = (leftTimeStr);
        }
        this._textTime1.string = (G_ServerTime._secondToString(leftTime));
        this._textTime2.string = (G_ServerTime._secondToString(assistLeftTime));
        this._imagePopup.node.active = (this._showPopup);
    }

    private _onClick() {
        this._showPopup = !this._showPopup;
        this._imagePopup.node.active = (this._showPopup);
    }

    private _onTouch(event:cc.Event) {
        if (this._showPopup) {
            this._showPopup = false;
            this._imagePopup.node.active = (this._showPopup);
        }
    }

    public updateQinTomb() {
        var leftTime = G_UserData.getBase().getGrave_left_sec();
        var assistLeftTime = G_UserData.getBase().getGrave_assist_sec();
        this.updateUIOfStatic();
        if (leftTime > 0) {
            this._updateGraveLeftSec();
        } else if (assistLeftTime > 0) {
            this._updateGraveAssistSec();
        }
    }

    private _updateGraveAssistSec() {
        var leftSec = G_UserData.getBase().getGrave_left_sec();
        var beginTime = G_UserData.getBase().getGrave_begin_time();
        var assistLeftTime = G_UserData.getBase().getGrave_assist_sec();
        var assistBeginTime = G_UserData.getBase().getGrave_assist_begin_time();
        this._textTime2.node.stopAllActions();
        this._textTime1.node.stopAllActions();

        if (leftSec <= 0 && assistLeftTime > 0) {
            this._textTimeTitle.string = (Lang.get('groups_assist_time_title'));
            this._nodeTimeEffect.removeAllChildren();
            UIHelper.loadTexture(this._imageClockStatic, Path.getQinTomb('img_qintomb_time03'));
            G_EffectGfxMgr.createPlayGfx(this._nodeTimeEffect, 'effect_xianqinhuangling_biaolan', null, true);
            this._playAssistLeftSec(this._textLeftTime);
            this._playAssistLeftSec(this._textTime2);
            return true;
        }
        return false;
    }

    private _updateGraveLeftSec() {
        this._adjustTouchArea();
        var leftSec = G_UserData.getBase().getGrave_left_sec();
        var beginTime = G_UserData.getBase().getGrave_begin_time();
        var assistLeftTime = G_UserData.getBase().getGrave_assist_sec();
        var assistBeginTime = G_UserData.getBase().getGrave_assist_begin_time();
        this._textTime2.node.stopAllActions();
        this._textTime1.node.stopAllActions();

        if (beginTime > 0) {
            this._textTimeTitle.string = (Lang.get('groups_active_time_title'));
            this._nodeTimeEffect.removeAllChildren();
            UIHelper.loadTexture(this._imageClockStatic, Path.getQinTomb('img_qintomb_time02'));
            G_EffectGfxMgr.createPlayGfx(this._nodeTimeEffect, 'effect_xianqinhuangling_biao', null, true);
            this._playGraveLeftSec(this._textLeftTime);
            this._playGraveLeftSec(this._textTime1);
        }
    }

    private _playGraveLeftSec(timeNode: cc.Label) {
        var leftSec = G_UserData.getBase().getGrave_left_sec();
        var beginTime = G_UserData.getBase().getGrave_begin_time();
        if (beginTime == 0) {
            var endTime = leftSec + G_ServerTime.getTime();
            var leftTimeStr = G_ServerTime.getLeftSecondsString(endTime, '00:00:00');
            timeNode.node.stopAllActions();
            timeNode.string = (leftTimeStr);
            return;
        }
        timeNode.string = ('00:00:00');
        function timeUpdate() {
            var endTime = leftSec + beginTime;
            var leftTimeStr = G_ServerTime.getLeftSecondsString(endTime, '00:00:00');
            var curTime = G_ServerTime.getTime();
            if (curTime > endTime) {
                timeNode.node.stopAllActions();
                G_SignalManager.dispatch(SignalConst.EVENT_GRAVE_TIME_FINISH);
            } else {
                timeNode.string = (leftTimeStr);
            }
        }
        var action = UIActionHelper.createUpdateAction(function () {
            timeUpdate();
        }, 0.5);
        timeNode.node.runAction(action);
    }

    private _playAssistLeftSec(timeNode: cc.Label) {
        var leftSec = G_UserData.getBase().getGrave_assist_sec();
        var beginTime = G_UserData.getBase().getGrave_assist_begin_time();
        if (beginTime == 0) {
            var endTime = leftSec + G_ServerTime.getTime();
            var leftTimeStr = G_ServerTime.getLeftSecondsString(endTime, '00:00:00');
            timeNode.node.stopAllActions();
            timeNode.string = (leftTimeStr);
            return;
        }
        timeNode.string = ('00:00:00');
        function timeUpdate() {
            var endTime = leftSec + beginTime;
            var leftTimeStr = G_ServerTime.getLeftSecondsString(endTime, '00:00:00');
            var curTime = G_ServerTime.getTime();
            if (curTime > endTime) {
                timeNode.node.stopAllActions();
                G_SignalManager.dispatch(SignalConst.EVENT_GRAVE_TIME_FINISH);
            } else {
                timeNode.string = (leftTimeStr);
            }
        }
        var action = UIActionHelper.createUpdateAction(function () {
            timeUpdate();
        }, 0.5);
        timeNode.node.runAction(action);
    }
}