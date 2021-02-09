const {ccclass, property} = cc._decorator;

import CommonFullScreenActivityTitle from '../../../../ui/component/CommonFullScreenActivityTitle'

import MonthlyCardItemCell from './MonthlyCardItemCell'
import ActivitySubView from '../ActivitySubView';
import { G_UserData, G_SignalManager, G_Prompt, G_GameAgent } from '../../../../init';
import { handler } from '../../../../utils/handler';
import { SignalConst } from '../../../../const/SignalConst';

@ccclass
export default class MonthlyCardView extends ActivitySubView {

   @property({
       type: MonthlyCardItemCell,
       visible: true
   })
   _fileNode1: MonthlyCardItemCell = null;

   @property({
       type: MonthlyCardItemCell,
       visible: true
   })
   _fileNode2: MonthlyCardItemCell = null;

   
    _mainView: any;
    _activityId: any;
    _cardNodeList: any[];
    _cardDataList: any;
    _signalWelfareMonthCardGetReward: any;
    _signalRechargeGetInfo;
    _reqSequence: any;


    ctor(mainView, activityId) {
        this._mainView = mainView;
        this._activityId = activityId;
        this._cardNodeList = [];
        this._cardDataList = G_UserData.getActivityMonthCard().getMonthCardCfgList();
    }
    _pullData() {
        var hasActivityServerData = G_UserData.getActivity().hasActivityData(this._activityId);
        if (!hasActivityServerData) {
            G_UserData.getActivity().pullActivityData(this._activityId);
        }
        return hasActivityServerData;
    }
    onCreate() {
        this._cardNodeList = [];
        this._cardNodeList.push(this._fileNode1);
        this._cardNodeList.push(this._fileNode2);
        this._fileNode1.ctor(1, handler(this, this._onBtnClick));
        this._fileNode2.ctor(2, handler(this, this._onBtnClick));
    }
    onEnter() {
        this._signalWelfareMonthCardGetReward = G_SignalManager.add(SignalConst.EVENT_WELFARE_MONTH_CARD_GET_REWARD, handler(this, this._onEventWelfareMonthCardGetReward));
        this._signalRechargeGetInfo = G_SignalManager.add(SignalConst.EVENT_RECHARGE_GET_INFO, handler(this, this._onEventRechargeGetInfo));
        var hasServerData = this._pullData();
        if (hasServerData && G_UserData.getActivityMonthCard().isExpired()) {
            G_UserData.getActivity().pullActivityData(this._activityId);
        }
        if (hasServerData) {
            this.refreshCardInfo();
        }
    }
    onExit() {
        this._signalWelfareMonthCardGetReward.remove();
        this._signalWelfareMonthCardGetReward = null;
        this._signalRechargeGetInfo.remove();
        this._signalRechargeGetInfo = null;
    }
    enterModule() {
    }
    _onEventWelfareMonthCardGetReward(event, id, message) {
        var awards = (message['reward']);
        if (awards) {
            G_Prompt.showAwards(awards);
        }
    }
    _onEventRechargeGetInfo(event, id, message) {
        this.refreshCardInfo();
    }
    _onEventRechargeNotice(event, id, message) {
        if (!this._reqSequence || this._reqSequence != message.product_id) {
            return;
        }
        this._reqSequence = null;
    }
    refreshCardInfo() {
        for (let k in this._cardNodeList) {
            var v = this._cardNodeList[k];
            v.refreshUI(this._cardDataList[k]);
        }
    }
    _onBtnClick(sender, data) {
        if (!data) {
            return;
        }
        var payCfg = data;
        var payId = payCfg.id;
        var monthlyCardData = G_UserData.getActivityMonthCard();
        var cardData = monthlyCardData.getMonthCardDataById(payId);
        if (cardData && cardData.isCanReceive()) {
            G_UserData.getActivityMonthCard().c2sUseMonthlyCard(payId);
        } else {
            this._reqSequence = payCfg.product_id;
            G_GameAgent.pay(payCfg.id, payCfg.rmb, payCfg.product_id, payCfg.name, payCfg.name);
        }
    }

}
