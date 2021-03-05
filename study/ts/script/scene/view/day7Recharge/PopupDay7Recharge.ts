const { ccclass, property } = cc._decorator;
import PopupBase from "../../../ui/PopupBase";
import { G_SignalManager, G_ServerTime, G_Prompt, G_UserData } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import { handler } from "../../../utils/handler";
import { Day7RechargeDataHelper } from "../../../utils/data/Day7RechargeDataHelper";
import { Lang } from "../../../lang/Lang";
import { PopupGetRewards } from "../../../ui/PopupGetRewards";
import { Day7RechargeConst } from "../../../const/Day7RechargeConst";
import CommonListView from "../../../ui/component/CommonListView";

@ccclass
export default class PopupDay7Recharge extends PopupBase {

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
        type: cc.Sprite,
        visible: true
    })
    _imageActivityEnd: cc.Sprite = null;

    @property({
        type: CommonListView,
        visible: true
    })
    _listView: CommonListView = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    cell: cc.Prefab = null;

    _signalRechargePrize;
    _targetTime1;
    _targetTime2;

    _listData: any[];


    onCreate() {
        this._listData = [];
        this._listView.init(this.cell, handler(this, this._onItemUpdate), handler(this, this._onItemTouch));
    }

    onEnter() {
        this._signalRechargePrize = G_SignalManager.add(SignalConst.EVENT_DAY7_RECHARGE_PRIZE, handler(this, this._onEventRechargePrize));

        this._targetTime1 = Day7RechargeDataHelper.getActivityEndTime();
        this._targetTime2 = Day7RechargeDataHelper.getAwardEndTime();

        this._startCountDown()
        this._updateView()
    }

    onExit() {
        this._stopCountDown();
        this._signalRechargePrize.remove();
        this._signalRechargePrize = null;
    }

    _updateView(reset: boolean = true) {
        this._listData = Day7RechargeDataHelper.getAwardListWithType(Day7RechargeConst.TASK_TYPE_1);
        this._listView.setData(this._listData.length, 1, reset)
    }

    _onItemUpdate(item, index, type) {
        var data = this._listData[index];
        item.updateItem(index, data, type);
    }

    _onItemTouch(index, t) {
        var curTime = G_ServerTime.getTime();
        if (curTime > this._targetTime2) {
            G_Prompt.showTip(Lang.get("day7_recharge_award_time_out"));
            return;
        }
        var data = this._listData[index];
        var id = data.info.id;
        G_UserData.getDay7Recharge().c2sSevenDaysMoneyPrize(id)
    }

    _startCountDown() {
        this._stopCountDown();
        this.schedule(handler(this, this._updateCountDown), 1);
        this._updateCountDown();
    }

    _stopCountDown() {
        this.unscheduleAllCallbacks();
    }

    _updateCountDown() {
        var curTime = G_ServerTime.getTime();
        var countDown1 = this._targetTime1 - curTime;
        if (countDown1 > 0) {
            this._textCountDownTitle.string = Lang.get('day7_recharge_activity_title');
            var [_, timeString] = G_ServerTime.getLeftDHMSFormatD(this._targetTime1);
            this._textCountDown.string = timeString;
            this._imageActivityEnd.node.active = false;
        } else {
            this._textCountDownTitle.string = Lang.get('day7_recharge_receive_title');
            this._imageActivityEnd.node.active = true;
            var countDown2 = this._targetTime2 - curTime;
            if (countDown2 >= 0) {
                var [_, timeString] = G_ServerTime.getLeftDHMSFormatD(this._targetTime2);
                this._textCountDown.string = timeString;
            } else {
                this._textCountDownTitle.string = Lang.get('day7_recharge_receive_finish');
                this._stopCountDown();
            }
        }
    }

    _onEventRechargePrize(eventName, awards) {
        this._updateView(false);
        PopupGetRewards.showRewards(awards);
    }
}