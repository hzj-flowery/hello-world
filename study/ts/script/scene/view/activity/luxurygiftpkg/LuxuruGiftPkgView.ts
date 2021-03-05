const {ccclass, property} = cc._decorator;

import CommonFullScreenActivityTitle from '../../../../ui/component/CommonFullScreenActivityTitle'

import CommonButtonLevel0Highlight from '../../../../ui/component/CommonButtonLevel0Highlight'

import CommonTalkNode from '../../../../ui/component/CommonTalkNode'
import ActivitySubView from '../ActivitySubView';
import UIHelper from '../../../../utils/UIHelper';
import { G_UserData, G_EffectGfxMgr, Colors, G_SignalManager, G_Prompt, G_GameAgent, G_ConfigManager } from '../../../../init';
import { Lang } from '../../../../lang/Lang';
import { SignalConst } from '../../../../const/SignalConst';
import { handler } from '../../../../utils/handler';
import { ActivityConst } from '../../../../const/ActivityConst';
import { assert } from '../../../../utils/GlobleFunc';
import { PopupGetRewards } from '../../../../ui/PopupGetRewards';
import PopupBase from '../../../../ui/PopupBase';
import { UIPopupHelper } from '../../../../utils/UIPopupHelper';
import CommonListViewLineItem from '../../../../ui/component/CommonListViewLineItem';
import CommonCustomListViewEx from '../../../../ui/component/CommonCustomListViewEx';

@ccclass
export default class LuxuruGiftPkgView extends ActivitySubView {

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
        type: CommonCustomListViewEx,
        visible: true
    })
    _listView: CommonCustomListViewEx = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelRemainDay: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _remainDay: cc.Label = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _btnBuy7Day: CommonButtonLevel0Highlight = null;

    @property(cc.Prefab)
    LuxuryGiftPkgItemCell:cc.Prefab = null;

    
    _mainView: any;
    _activityId: any;
    _listDatas: any[];
    _signalWelfareGiftPkgGetInfo: any;
    _signalWelfareGiftPkgGetReward: any;


    ctor(mainView, activityId) {
        this._mainView = mainView;
        this._activityId = activityId;

        this._listDatas = null;
        UIHelper.addEventListener(this.node, this._btnBuy7Day._button, 'LuxuruGiftPkgView', '_onBuy7Day');
    }
    _pullData() {
        var hasActivityServerData = G_UserData.getActivity().hasActivityData(this._activityId);
        if (!hasActivityServerData) {
            G_UserData.getActivity().pullActivityData(this._activityId);
        }
        return hasActivityServerData;
    }
    onCreate() {
        this._initListView(this._listView);
        var payCfg = G_UserData.getActivityLuxuryGiftPkg().getBuy7DaysPayConfig();
        this._btnBuy7Day.setString(Lang.get('lang_activity_luxurygiftpkg_buy_7day', { value: payCfg.rmb }));
        G_EffectGfxMgr.createPlayGfx(this._btnBuy7Day.node, 'effect_anniufaguang_big2');
        this._commonBubble.setBubbleColor(Colors.BRIGHT_BG_ONE);
        this._commonBubble.setString(Lang.get('lang_activity_luxurygiftpkg_bubble'), 363, true, 363, 87);
    }
    _updateBtnBuy7DayVisible(visible) {
        if (visible) {
            var vipLevel = G_UserData.getVip().getLevel();
            var vipLimit = G_UserData.getActivityLuxuryGiftPkg().getBuy7DayVipLimit();
            if (vipLevel < vipLimit) {
                this._btnBuy7Day.setVisible(false);
            } else {
                this._btnBuy7Day.setVisible(true);
            }
        } else {
            this._btnBuy7Day.setVisible(false);
        }
    }
    onEnter() {
        this._signalWelfareGiftPkgGetInfo = G_SignalManager.add(SignalConst.EVENT_WELFARE_GIFT_PKG_GET_INFO, handler(this, this._onEventWelfareGiftPkgGetInfo));
        this._signalWelfareGiftPkgGetReward = G_SignalManager.add(SignalConst.EVENT_WELFARE_GIFT_PKG_GET_REWARD, handler(this, this._onEventWelfareGiftPkgGetReward));
        var hasServerData = this._pullData();
        if (hasServerData && G_UserData.getActivityLuxuryGiftPkg().isExpired()) {
            G_UserData.getActivity().pullActivityData(this._activityId);
        }
        if (hasServerData) {
            this.refreshData();
        }
    }
    onExit() {
        this._signalWelfareGiftPkgGetInfo.remove();
        this._signalWelfareGiftPkgGetInfo = null;
        this._signalWelfareGiftPkgGetReward.remove();
        this._signalWelfareGiftPkgGetReward = null;
    }
    exitModule(){
        this._listView.clearAll();
    }
    _onEventWelfareGiftPkgGetInfo(event, id, message) {
        if (message.discount_type != ActivityConst.GIFT_PKG_TYPE_LUXURY) {
            return;
        }
        this.refreshData();
    }
    _onEventWelfareGiftPkgGetReward(event, id, message) {
        if (message.discount_type != ActivityConst.GIFT_PKG_TYPE_LUXURY) {
            return;
        }
        var ids = message['id'] || {};
        var unitData = G_UserData.getActivityLuxuryGiftPkg().getUnitData(ids[0]);
      //assert((unitData, 'LuxuryGiftPkgView _onEventWelfareGiftPkgGetReward unitData nil');
        if (!unitData) {
            return;
        }
        var index = unitData.getPayType();
        if (index) {
            this._refreshItemNodeByIndex(index);
        }
        this._onShowRewardItems(message);
    }
    _onShowRewardItems(message) {
        var awards = message['awards'] || null;
        var randomAwards = message['random_awards'] || null;
        if (awards) {
            G_Prompt.showAwards(awards);
        }
        if (randomAwards) {
            this.node.runAction(cc.sequence(cc.delayTime(1.5), cc.callFunc(function () {
                PopupBase.loadCommonPrefab('PopupGetRewards',(popupGetRewards:PopupGetRewards)=>{
                    popupGetRewards.show(randomAwards, null, null, null);
                });
            },this)));
        }
    }
    _initListView(listView) {
        listView.setTemplate(this.LuxuryGiftPkgItemCell);
        listView.setCallback(handler(this, this._onItemUpdate), handler(this, this._onItemSelected));
        listView.setCustomCallback(handler(this, this._onItemTouch));
    }
    _refreshListView(listView, itemList) {
        var lineCount = itemList.length;
        listView.clearAll();
        listView.resize(lineCount);
    }
    _refreshItemNodeByIndex(index) {
        var itemNode = this._findItemNodeByIndex(index);
        if (itemNode) {
            var data = this._listDatas[index-1];
            itemNode.updateUI(data, index-1);
        }
    }
    _findItemNodeByIndex(index) {
        var items = this._listView.getItems();
        if (!items) {
            return null;
        }
        for (let k in items) {
            var v = items[k];
            if (v.getTag() + 1 == index) {
                return v;
            }
        }
        return null;
    }
    _getListDatas() {
        return this._listDatas;
    }
    _onItemUpdate(item, index) {
        //logWarn('LuxuryGiftPkgView:_onItemUpdate  ' + index);
        var itemList = this._getListDatas();
        var itemData = itemList[index];
        item.updateUI(itemData, index);
    }
    _onItemSelected(item, index) {
        //logWarn('LuxuryGiftPkgView:_onItemSelected ');
    }
    _onItemTouch(index, itemPos) {
        //logWarn('LuxuryGiftPkgView:_onItemTouch ' + (tostring(index) + (' ' + tostring(itemPos))));
        var payType = itemPos + 1;
        if (G_UserData.getActivityLuxuryGiftPkg().isCanReceiveGiftPkg()) {
            G_UserData.getActivityLuxuryGiftPkg().c2sActDiscount(payType);
        } else {
            var vipLevel = G_UserData.getVip().getLevel();
            var unitDataList = G_UserData.getActivityLuxuryGiftPkg().getUnitDatasByPayType(payType);
            var actLuxuryGiftPkgUnitData = unitDataList[0];
            var cfg = actLuxuryGiftPkgUnitData.getConfig();
            var vipLimit = cfg.vip_limit || 0;
            if (vipLevel < vipLimit) {
                G_Prompt.showTip({ str: Lang.get('lang_activity_luxurygiftpkg_vip_limit', { num: vipLimit }) });
                return;
            }
            var payCfg = G_UserData.getActivityLuxuryGiftPkg().getGiftPkgPayCfgByIndex(payType);
            G_GameAgent.pay(payCfg.id, payCfg.rmb, payCfg.product_id, payCfg.name, payCfg.name);
        }
    }
    refreshData() {
        var allData = G_UserData.getActivityLuxuryGiftPkg().getGiftPkgPayCfgList();
        this._listDatas = allData;
        this._refreshListView(this._listView, this._listDatas);
        this._refreshBuy7DaysView();
    }
    enterModule() {
        this._commonBubble.doAnim();
    }
    _refreshBuy7DaysView() {
        var [showBuyBtn, remainDayNum] = G_UserData.getActivityLuxuryGiftPkg().isNeedBuy7Days();
        this._panelRemainDay.active = (!showBuyBtn && remainDayNum != 0);
        this._updateBtnBuy7DayVisible(showBuyBtn);
        this._remainDay.string = ((remainDayNum).toString());
    }
    _onBuy7Day(sender) {
        if (G_ConfigManager.isAppstore() == false) {
            if (G_UserData.getActivityLuxuryGiftPkg().hasBuyGoods()) {
                G_Prompt.showTip({ str: Lang.get('lang_activity_luxurygiftpkg_tomorrow_buy') });
                return;
            }
            var vipLevel = G_UserData.getVip().getLevel();
            var vipLimit = G_UserData.getActivityLuxuryGiftPkg().getBuy7DayVipLimit();
            if (vipLevel < vipLimit) {
                G_Prompt.showTip({ str: Lang.get('lang_activity_luxurygiftpkg_vip_limit', { num: vipLimit }) });
                return;
            }
        }
        var payCfg = G_UserData.getActivityLuxuryGiftPkg().getBuy7DaysPayConfig();
        G_GameAgent.pay(payCfg.id, payCfg.rmb, payCfg.product_id, payCfg.name, payCfg.name);
    }

}
