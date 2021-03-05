const {ccclass, property} = cc._decorator;

import CommonFullScreenActivityTitle from '../../../../ui/component/CommonFullScreenActivityTitle'

import CommonButtonLevel0Highlight from '../../../../ui/component/CommonButtonLevel0Highlight'

import CommonVipNode from '../../../../ui/component/CommonVipNode'

import CommonTabGroupHorizon from '../../../../ui/component/CommonTabGroupHorizon'
import { ActivityOpenServerFundConst } from '../../../../const/ActivityOpenServerFundConst';
import ActivitySubView from '../ActivitySubView';
import UIHelper from '../../../../utils/UIHelper';
import { G_UserData, G_SignalManager, G_Prompt } from '../../../../init';
import { SignalConst } from '../../../../const/SignalConst';
import { handler } from '../../../../utils/handler';
import { RedPointHelper } from '../../../../data/RedPointHelper';
import { FunctionConst } from '../../../../const/FunctionConst';
import { ActivityConst } from '../../../../const/ActivityConst';
import { WayFuncDataHelper } from '../../../../utils/data/WayFuncDataHelper';
import { Lang } from '../../../../lang/Lang';
import { UserDataHelper } from '../../../../utils/data/UserDataHelper';
import CommonCustomListViewEx from '../../../../ui/component/CommonCustomListViewEx';
import { Path } from '../../../../utils/Path';
import { ActivityDataHelper } from '../../../../utils/data/ActivityDataHelper';

var NPC_DIALOGUE_RICH_TEXT_WIDTH = 330;
var MAX_DIGIT_NUMBER = 4;

@ccclass
export default class OpenServerFundView extends ActivitySubView {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTotalNum: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageFanli: cc.Sprite = null;

    @property({
        type: CommonTabGroupHorizon,
        visible: true
    })
    _tabGroup: CommonTabGroupHorizon = null;

    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _listItemSource: CommonCustomListViewEx = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeVip: cc.Node = null;

    @property({
        type: CommonVipNode,
        visible: true
    })
    _textMinVip: CommonVipNode = null;

    @property({
        type: CommonVipNode,
        visible: true
    })
    _textVip: CommonVipNode = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeFundDes: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRmb: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTotalRmb: cc.Sprite = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _commonBuy: CommonButtonLevel0Highlight = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCurrStage: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBuy: cc.Sprite = null;

    @property(cc.Prefab)
    OpenServerFundItemCell:cc.Prefab = null;


    static FUND_TYPE_LIST = [
        ActivityOpenServerFundConst.FUND_TYPE_GROW,
        ActivityOpenServerFundConst.FUND_TYPE_SERVER_REWARD
    ];
    static FUND_RMB_IMGS = {
        30: 'img_chengzhangjijin_zi03',
        50: 'img_chengzhangjijin_zi04',
        98: 'img_chengzhangjijin_zi05'
    };
    static FUND_GOLD_IMGS = {
        3000: 'img_chengzhangjijin_zi01',
        5000: 'img_chengzhangjijin_zi02',
        9800: 'img_chengzhangjijin_zi06',
        10800: 'img_chengzhangjijin_zi07'
    };
    _mainView: any;
    _activityId: any;
    _paramShowFundGroup: any;
    _listDatas: any[];
    _selectTabIndex: number;
    _peopleLabels: any[];
    _signalWelfareFundOpenServerGetInfo: any;
    _signalWelfareFundOpenServerGetReward: any;
    _signalServerRecordChange: any;
    _signalRedPointUpdate: any;
    _signalVipExpChange: any;
    loadIndex:number = 0;
    scheduleHandler:any;


    ctor(mainView, activityId, showFundGroup) {
        this._mainView = mainView;
        this._activityId = activityId;
        this._paramShowFundGroup = showFundGroup;
        this._listDatas = [];
        this._selectTabIndex = 0;
        this._peopleLabels = [];
        UIHelper.addEventListener(this.node, this._commonBuy._button, 'OpenServerFundView', '_onBuyFund');
    }
    _pullData() {
        var hasActivityServerData = G_UserData.getActivity().hasActivityData(this._activityId);
        if (!hasActivityServerData) {
            G_UserData.getActivity().pullActivityData(this._activityId);
        }
        return hasActivityServerData;
    }
    onCreate() {
        this._initFundPeopleView();
        this._initTabGroup();
        this._initListView(this._listItemSource);
    }
    onEnter() {
        this._signalWelfareFundOpenServerGetInfo = G_SignalManager.add(SignalConst.EVENT_WELFARE_FUND_OPEN_SERVER_GET_INFO, handler(this, this._onEventWelfareFundOpenServerGetInfo));
        this._signalWelfareFundOpenServerGetReward = G_SignalManager.add(SignalConst.EVENT_WELFARE_FUND_OPEN_SERVER_GET_REWARD, handler(this, this._onEventWelfareFundOpenServerGetReward));
        this._signalServerRecordChange = G_SignalManager.add(SignalConst.EVENT_SERVER_RECORD_CHANGE, handler(this, this._onServerRecordChange));
        this._signalRedPointUpdate = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
        this._signalVipExpChange = G_SignalManager.add(SignalConst.EVENT_VIP_EXP_CHANGE, handler(this, this._onEventVipExpChange));
        var hasServerData = this._pullData();
        if (hasServerData && G_UserData.getActivityOpenServerFund().isExpired()) {
            G_UserData.getActivity().pullActivityData(this._activityId);
        }
        this._refreshVipView();
        this._refreshBuyFundView();
        this._refreshFundPeopleView();
        if (!this._selectTabIndex) {
            this._tabGroup.setTabIndex(0);
        } else {
            this._refreshListData();
        }
        this._refreshRedPoint();
    }
    onExit() {
        this._signalWelfareFundOpenServerGetInfo.remove();
        this._signalWelfareFundOpenServerGetInfo = null;
        this._signalWelfareFundOpenServerGetReward.remove();
        this._signalWelfareFundOpenServerGetReward = null;
        this._signalServerRecordChange.remove();
        this._signalServerRecordChange = null;
        this._signalRedPointUpdate.remove();
        this._signalRedPointUpdate = null;
        this._signalVipExpChange.remove();
        this._signalVipExpChange = null;
    }
    exitModule(){
        //this._listItemSource.clearAll();
    }
    _refreshRedPoint() {
        for (let k in OpenServerFundView.FUND_TYPE_LIST) {
            var fundType = OpenServerFundView.FUND_TYPE_LIST[k];
            var redPointShow = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_WELFARE, 'openServerFund', [
                fundType,
                this._paramShowFundGroup
            ]);
            this._tabGroup.setRedPointByTabIndex(Number(k)+1, redPointShow);
        }
    }
    _onEventRedPointUpdate(event, funcId, param) {
        if (funcId != FunctionConst.FUNC_WELFARE) {
            return;
        }
        if (!param || typeof(param) != 'object') {
            return;
        }
        if (param.actId == ActivityConst.ACT_ID_OPEN_SERVER_FUND) {
            this._refreshRedPoint();
        }
    }
    _onEventWelfareFundOpenServerGetInfo(event, id, message) {
        this.refreshData();
    }
    _onEventWelfareFundOpenServerGetReward(event, id, message) {
        var fundId = message.id;
        this._refreshListData();
        this._refreshBuyFundView();
        if (!this.isInShow()) {
            return;
        }
        var actOpenServerUnitData = G_UserData.getActivityOpenServerFund().getUnitDataById(fundId);
        if (actOpenServerUnitData) {
            var cfg = actOpenServerUnitData.getConfig();
            var awards = [{
                    type: cfg.reward_type,
                    value: cfg.reward_value,
                    size: cfg.reward_size
                }];
            if (awards) {
                G_Prompt.showAwards(awards);
            }
        }
    }
    _onEventVipExpChange() {
        this._refreshVipView();
        this._refreshBuyFundView();
    }
    _onServerRecordChange(event) {
        this._refreshListData();
        this._refreshFundPeopleView();
    }
    _onGoRechargeBtnClick() {
        WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_RECHARGE);
    }
    _initTabGroup() {
        var param = {
            rootNode: null,
            isVertical: 2,
            callback: handler(this, this._onTabSelect),
            textList: Lang.get('lang_activity_fund_tab_names')
        };
        this._tabGroup.recreateTabs(param);
    }
    _refreshVipView() {
        var vip = G_UserData.getVip().getLevel();
        this._textVip.setString((vip).toString());
        var lv2 = G_UserData.getActivityOpenServerFund().getGrowFundNeedVipLevel();
        this._textMinVip.setString((lv2).toString());
    }
    _initFundPeopleView() {
        for (var k = 1; k<=MAX_DIGIT_NUMBER; k++) {
            var node = this._imageTotalNum.node.getChildByName('AtlasLabel_' + (k));
            this._peopleLabels.push(node.getComponent(cc.Label));
        }
    }
    _refreshFundPeopleView() {
        var fundNum = G_UserData.getActivityOpenServerFund().getFundNum();
        var numArr = UserDataHelper.splitNumber(fundNum);
        for (let k in numArr) {
            var v = numArr[k];
            var label = this._peopleLabels[k];
            label.string = ((numArr[k]).toString());
        }
    }
    _getListViewData(index) {
        var fundType = OpenServerFundView.FUND_TYPE_LIST[index-1];
        return G_UserData.getActivityOpenServerFund().getUnitDataListByFundType(fundType, this._paramShowFundGroup);
    }
    _onTabSelect(index, sender) {
        index++;
        if (this._selectTabIndex == index) {
            return;
        }
        this._selectTabIndex = index;
        var listViewData = this._getListViewData(index);
        this._listDatas = listViewData;
        this._refreshListView(this._listItemSource, listViewData);
    }
    _initListView(listView) {
        listView.setTemplate(this.OpenServerFundItemCell);
        listView.setCallback(handler(this, this._onItemUpdate), handler(this, this._onItemSelected));
        listView.setCustomCallback(handler(this, this._onItemTouch));
    }
    _refreshListView(listView:CommonCustomListViewEx, itemList) {
        var lineCount = itemList.length;
        listView.clearAll();
        if(this.scheduleHandler){
            this.unschedule(this.scheduleHandler);
            this.scheduleHandler = null;
        }
        this.loadIndex = 0;
        this.scheduleHandler = handler(this,this.loadListViewCell);
        this.schedule(this.scheduleHandler, 0.1);
        //listView.resize(lineCount);
        console.log("OpenServerFundView _refreshListView");
        //listView.scrollToTop();
    }
    loadListViewCell(){
        if(this.loadIndex >= this._listDatas.length){
            if(this.scheduleHandler){
                this.unschedule(this.scheduleHandler);
                this.scheduleHandler = null;
            }
            return;
        }
        this.loadIndex++;
        this._listItemSource.resize(this.loadIndex, 2, false);
    }
    _refreshItemNodeByIndex(index) {
        var itemNode = this._findItemNodeByIndex(index);
        if (itemNode) {
            var data = this._listDatas[index];
            itemNode.updateUI(data);
        }
    }
    _findIndexByFundId(fundId) {
        if (!this._listDatas) {
            return null;
        }
        for (let k in this._listDatas) {
            var v = this._listDatas[k];
            if (v.getId() == fundId) {
                return k;
            }
        }
        return null;
    }
    _findItemNodeByIndex(index) {
        var lineIndex = index;
        var items = this._listItemSource.getItems();
        if (!items) {
            return null;
        }
        for (let k in items) {
            var v = items[k];
            if (v.getTag() == index - 1) {
                return v;
            }
        }
        return null;
    }
    _getListDatas() {
        return this._listDatas;
    }
    _onItemUpdate(item, index) {
        var itemList = this._getListDatas();
        var itemData = itemList[index];
        item.updateUI(itemData);
    }
    _onItemSelected(item, index) {
        //logWarn('OpenServerFundView:_onItemSelected ');
    }
    _onItemTouch(index, itemPos) {
        //logWarn('OpenServerFundView:_onItemTouch ' + (tostring(index) + (' ' + tostring(itemPos))));
        var data = this._listDatas[itemPos];
        var cfg = data.getConfig();
        if (ActivityDataHelper.checkPackBeforeGetActReward2(data)) {
            G_UserData.getActivityOpenServerFund().c2sActFund(cfg.id);
        }
    }
    _refreshListData() {
        var index = this._selectTabIndex;
        var listViewData = this._getListViewData(index);
        this._listDatas = listViewData;
        this._refreshListView(this._listItemSource, listViewData);
    }
    refreshData() {
        this._refreshListData();
        this._refreshFundPeopleView();
        this._refreshBuyFundView();
    }
    _onBuyFund(sender) {
        var isVipEnough = G_UserData.getActivityOpenServerFund().isVipEnoughForGrowFund();
        if (!isVipEnough) {
            this._onGoRechargeBtnClick();
            return;
        }
        if (G_UserData.getActivityOpenServerFund().isHasBuyCurrFund(this._paramShowFundGroup)) {
            return;
        }
        G_UserData.getActivityOpenServerFund().c2sBuyFund(this._paramShowFundGroup);
    }
    _refreshBuyFundView() {
        var hasBuy = G_UserData.getActivityOpenServerFund().isHasBuyCurrFund(this._paramShowFundGroup);
        var group = this._paramShowFundGroup || G_UserData.getActivityOpenServerFund().getCurrGroup();
        var groupInfo = G_UserData.getActivityOpenServerFund().getGroupInfo(group);
        var rmb = groupInfo.payCfg.rmb;
        var totalGold = parseInt(groupInfo.config.txt);
        var isVipEnough = G_UserData.getActivityOpenServerFund().isVipEnoughForGrowFund();
        this._imageBuy.node.active = (hasBuy);
        this._commonBuy.setVisible(!hasBuy);
        this._commonBuy.setString(isVipEnough && Lang.get('lang_activity_fund_buy_fund', { value: rmb }) || Lang.get('lang_activity_fund_recharge'));
        this._imageFanli.node.x = (group > 1 && 125 || 177);
        this._imageFanli.node.setScale(group > 1 && 0.91 || 1);
        this._textCurrStage.string = (Lang.get('lang_activity_fund_stage', { value: group }));
        this._textCurrStage.node.active = (group > 1);
        UIHelper.loadTexture(this._imageRmb, Path.getActivityTextRes(OpenServerFundView.FUND_RMB_IMGS[rmb]));
        UIHelper.loadTexture(this._imageTotalRmb, Path.getActivityTextRes(OpenServerFundView.FUND_GOLD_IMGS[totalGold]));
    }    

}
