
const { ccclass, property } = cc._decorator;
import PopupBase from "../../../ui/PopupBase";
import { G_SignalManager, G_ServerTime, G_Prompt, G_UserData } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import { handler } from "../../../utils/handler";
import { Day7RechargeDataHelper } from "../../../utils/data/Day7RechargeDataHelper";
import { Lang } from "../../../lang/Lang";
import { PopupGetRewards } from "../../../ui/PopupGetRewards";
import { RechargeActivityUnitData } from "../../../data/RechargeActivityData";
import CommonIconTemplate from "../../../ui/component/CommonIconTemplate";
import CommonButtonLevel0Highlight from "../../../ui/component/CommonButtonLevel0Highlight";
import UIHelper from "../../../utils/UIHelper";
import CommonCheckBoxAnymoreHint from "../../../ui/component/CommonCheckBoxAnymoreHint";
import { Path } from "../../../utils/Path";

@ccclass
export default class PopupSuperChargeActivity extends PopupBase {

    @property({
        type: cc.Label,
        visible: true
    })
    _textCountDownTitle: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textCountDown: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textBuyNum: cc.Label = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _btnBuy: CommonButtonLevel0Highlight = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    icon1: CommonIconTemplate = null;
    @property({
        type: CommonIconTemplate,
        visible: true
    })
    icon2: CommonIconTemplate = null;
    @property({
        type: CommonIconTemplate,
        visible: true
    })
    icon3: CommonIconTemplate = null;
    @property({
        type: CommonIconTemplate,
        visible: true
    })
    icon4: CommonIconTemplate = null;
    @property({
        type: CommonIconTemplate,
        visible: true
    })
    icon5: CommonIconTemplate = null;
    @property({
        type: CommonIconTemplate,
        visible: true
    })
    icon6: CommonIconTemplate = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRate: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCost: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imgYuan: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imgTitle: cc.Sprite = null;

    @property({
        type: CommonCheckBoxAnymoreHint,
        visible: true
    })
    _commonCheckBoxAnymoreHint: CommonCheckBoxAnymoreHint = null;


    _signalRechargePrize;
    _targetTime;
    _signalRechargeInfo;
    _signalServerRecord;

    _curGroup = 0;



    onCreate() {
        this._btnBuy.addClickEventListenerEx(handler(this, this.onBtyBuy));
        this._signalRechargePrize = G_SignalManager.add(SignalConst.EVENT_SUPER_CHARGE_GIFT_REWARDS, handler(this, this._onEventRechargePrize));
        this._signalRechargeInfo = G_SignalManager.add(SignalConst.EVENT_SUPER_CHARGE_GIFT_INFO, handler(this, this._updateView));
        this._signalServerRecord = G_SignalManager.add(SignalConst.EVENT_SERVER_RECORD_CHANGE, handler(this, this._updateBuyNum));
    }

    onEnter() {
       this._updateView();
       this._updateBuyNum();
    }

    onExit() {
       this._stopCountDown();
        this._signalRechargePrize.remove();
        this._signalRechargePrize = null;
        this._signalRechargeInfo.remove();
        this._signalRechargeInfo = null;
        this._signalServerRecord.remove();
        this._signalServerRecord = null;
    }
    _updateBuyNum() {
        this._textBuyNum.string = G_UserData.getServerRecord().getRecordById(5) + '人已抢购';
    }

    _updateView() {
        if (G_UserData.getRechargeActivity().state == 1) {
            this.close();
            return;
        }
        if (G_UserData.getRechargeActivity().getGroup() != this._curGroup) {
            this._curGroup = G_UserData.getRechargeActivity().getGroup();

            var unitData: RechargeActivityUnitData = G_UserData.getRechargeActivity().getCurActUnitData();
            var info = unitData.getConfig();
            for (var i = 1; i <= 6; i++) {
                var iconType = info["type_" + i];
                var iconValue = info["value_" + i];
                var iconSize = info["size_" + i];
                this['icon' + i].unInitUI();
                this["icon" + i].initUI(iconType, iconValue, iconSize);
            }
            this._btnBuy.setString(info.price + '元领取');
            UIHelper.loadTexture(this._imgTitle, Path.getSuperChargeGiftTitleBg(info.big_bg));

            this._textRate.string = info.discount.toString();
            this._textCost.string = info.price.toString();
            UIHelper.updateLabelSize(this._textCost);
            this._imgYuan.node.x = this._textCost.node.x + this._textCost.node.width * this._textCost.node.scaleX + 20;
            this._startCountDown();
        }

    }

    _startCountDown() {
        this._targetTime = G_UserData.getRechargeActivity().getActivityEndTime();
        this._textCountDown.node.parent.active = true;
        this._stopCountDown();
        this.schedule(this._updateCountDown, 1);
        this._updateCountDown();
    }

    onBtyBuy() {
        G_UserData.getRechargeActivity().c2sBuy();
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

    _onEventRechargePrize(eventName, awards) {
        PopupGetRewards.showRewards(awards);
    }

    setModuleName(moduleDataName) {
        //this._commonCheckBoxAnymoreHint.setModuleName(moduleDataName);
    }
}