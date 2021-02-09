import ViewBase from "../../ViewBase";
import { G_Prompt, G_SignalManager, G_GameAgent, G_UserData, G_ConfigLoader } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import { handler } from "../../../utils/handler";
import { assert } from "../../../utils/GlobleFunc";
import CommonCustomListViewEx from "../../../ui/component/CommonCustomListViewEx";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { DataConst } from "../../../const/DataConst";
import UIHelper from "../../../utils/UIHelper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class VipRechargeView extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _pageViewVip: cc.Node = null;

    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _listItemSource: CommonCustomListViewEx = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textJadeTip: cc.Label = null;

    
     
    //普通元宝充值
    @property(cc.Prefab)
    vipRechargePageView:cc.Prefab = null;
    
    //玉璧充值
    @property(cc.Prefab)
    VipRechargeJadePageView:cc.Prefab = null;

    _parentView: any;
    _signalGetRechargeNotice: any;
    _signalGetRecharge: any;
    _signalGetRechargeFirstBuyReset: any;
    _signalVipExpChange: any;
    _itemList: any[];
    _rechargeList:any[];

    private _itemType:number //充值的类型

    private _selectIndex:number = -1;

    loadIndex:number = 0;
    scheduleHandler:any;

    ctor(parent,itemType) {
        this._itemList = [];
        this._parentView = parent;
        this._itemType = itemType;
    }

    onCreate() {
        if(this._itemType==DataConst.RES_JADE2)
        {
            this._listItemSource.setTemplate(this.VipRechargeJadePageView);
            this._textJadeTip.node.active = (true);
            UIHelper.enableOutline(this._textJadeTip,new cc.Color(232,167,12))
        }
        else
        {
            this._listItemSource.setTemplate(this.vipRechargePageView);
            this._textJadeTip.node.active = (false)
        }
        this._listItemSource.setCallback(handler(this, this._onItemUpdate), handler(this, this._onItemSelected));
        this._listItemSource.setCustomCallback(handler(this, this._onItemTouch));

        this._textJadeTip.node.active = (false);//关闭提示
    }
    _updateItemData() {
        if (this._itemType == DataConst.RES_JADE2) {
            this._rechargeList = G_UserData.getVipPay().getJadeRechargeList();
        } else {
            this._rechargeList = G_UserData.getVipPay().getRechargeList();
        }

        var pageSize = Math.ceil(this._rechargeList.length / 4);
        var itemList = [];
        for (var i = 1; i<=pageSize; i++) {
            var temp = [];
            for (var j = 1; j<=4; j++) {
                var index = (i - 1) * 4 + j;
                var item = this._rechargeList[index-1];
                if (item) {
                    temp.push(item);
                }
            }
            itemList.push(temp);
        }
        this._itemList = itemList;
    }
    _updateListView() {
        this._updateItemData();
        this.unInstallTimer();
        this.loadIndex = 0;
        this._listItemSource.clearAll();
        this.scheduleHandler = handler(this, this.loadListViewCell);
        this.schedule(this.scheduleHandler, 0.01);
        //this._listItemSource.resize(this._itemList.length);
        console.log("VipRechargeView _updateListView");
    }
    loadListViewCell(){
        this.loadIndex++;
        if(this.loadIndex >= this._itemList.length){
            this.unInstallTimer();
            this.loadIndex = this._itemList.length;
        }
        this._listItemSource.resize(this.loadIndex, 2, false);
    }
    unInstallTimer(){
        if(this.scheduleHandler){
            this.unschedule(this.scheduleHandler);
            this.scheduleHandler = null;
        }
    }
    _onItemUpdate(item, index) {
        if (this._itemList[index]) {
            item.updateUI(this._itemList[index]);
        }
    }
    _onItemSelected(item, index) {
    }
    _onItemTouch(index, itemTag) {
        //logWarn(' VipRechargeView:_onItemTouch ' + itemTag);
        this._selectIndex = index;
        var vipPayData = G_ConfigLoader.getConfig(ConfigNameConst.VIP_PAY).get(itemTag);//require('app.config.vip_pay').get(itemTag);
      //assert((vipPayData, 'can not find item in vip pay config by id ' + itemTag);
        G_GameAgent.pay(vipPayData.id, vipPayData.rmb, vipPayData.product_id, vipPayData.name, vipPayData.name);
    }
    isRootScene() {
        return true;
    }
    onEnter() {
        this._signalGetRecharge = G_SignalManager.add(SignalConst.EVENT_RECHARGE_GET_INFO, handler(this, this._onEventGetRecharge));
        this._signalGetRechargeNotice = G_SignalManager.add(SignalConst.EVENT_RECHARGE_NOTICE, handler(this, this._onEventGetRechargeNotice));
        this._signalGetRechargeFirstBuyReset = G_SignalManager.add(SignalConst.EVENT_RECHARGE_FIRST_BUY_RESET, handler(this, this._onEventGetRechargeFirstBuyReset));
        this._signalVipExpChange = G_SignalManager.add(SignalConst.EVENT_VIP_EXP_CHANGE, handler(this, this._onEventVipExpChange));
        this._updateListView();
    }
    onExit() {
        this._signalGetRechargeNotice.remove();
        this._signalGetRechargeNotice = null;
        this._signalGetRecharge.remove();
        this._signalGetRecharge = null;
        this._signalGetRechargeFirstBuyReset.remove();
        this._signalGetRechargeFirstBuyReset = null;
        this._signalVipExpChange.remove();
        this._signalVipExpChange = null;
    }
    _onEventGetRecharge(id, message) {
        //dump(message);
        //this._updateListView();
        if(this._selectIndex >= 0){
            this._listItemSource.updateItemByID(this._selectIndex);
        }
        if (this._parentView && this._parentView.updateView) {
            this._parentView.updateView();
        }
    }
    _onEventGetRechargeNotice(id, message) {
        //dump(message);
        G_Prompt.showTip('充值成功');
    }
    _onEventGetRechargeFirstBuyReset(id, message) {
        if(this._selectIndex >= 0){
            this._listItemSource.updateItemByID(this._selectIndex);
        }
    }
    _onEventVipExpChange(event) {
        if(this._selectIndex >= 0){
            this._listItemSource.updateItemByID(this._selectIndex);
        }
    }

}
