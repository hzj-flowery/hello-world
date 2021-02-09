const {ccclass, property} = cc._decorator;

import CommonTabGroupHorizon8 from '../../../ui/component/CommonTabGroupHorizon8'
import PopupBase from '../../../ui/PopupBase';
import UIHelper from '../../../utils/UIHelper';
import { G_SignalManager, G_UserData, G_Prompt, Colors, G_ServerTime } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import { Day7ActivityConst } from '../../../const/Day7ActivityConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { PopupGetRewards } from '../../../ui/PopupGetRewards';
import { Lang } from '../../../lang/Lang';
import { table } from '../../../utils/table';
import { WayFuncDataHelper } from '../../../utils/data/WayFuncDataHelper';
import { UserCheck } from '../../../utils/logic/UserCheck';
import PopupSelectReward from '../../../ui/PopupSelectReward';
import { assert } from '../../../utils/GlobleFunc';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { Path } from '../../../utils/Path';
import CommonCustomListViewEx from '../../../ui/component/CommonCustomListViewEx';
import Day7ActivityDiscountView from './Day7ActivityDiscountView';
import UICreateHelper from '../../../utils/UICreateHelper';

interface iItemData{
    imageNormal:cc.Node,
    imageDown:cc.Node,
    index:number,
    text:cc.Label,
    redPoint:cc.Node,
    finishTag:cc.Node,
    panelWiget:cc.Node,
    imageBg:cc.Node,
}

@ccclass
export default class PopupDay7Activity extends PopupBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode1: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeLeftTabRoot: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageListBg: cc.Sprite = null;

    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _listItemSource: CommonCustomListViewEx = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeDiscount: cc.Node = null;

    @property({
        type: CommonTabGroupHorizon8,
        visible: true
    })
    _commonTabGroupHorizon: CommonTabGroupHorizon8 = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonClose: cc.Button = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTime: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageActivityEnd: cc.Sprite = null;

    @property(cc.Prefab)
    Day7ActivityDiscountView:cc.Prefab = null;

    @property(cc.Prefab)
    Day7ActivityItemCell:cc.Prefab = null;


    static MAIN_TAB_SEVEN_DAY_POS = {
        x: 84.56,
        y: 43.31
    };
    static HERO_SHOW_INTERVAL = 3;
    
    _selectedFirstTabIndex: number;
    _selectedSecondTabIndex: number;
    _mainTabGroupData: any[];
    _listDatas: any;
    _currListData: any;
    _refreshHandler: any;
    _finishTags: any[];
    _signalDay7ActGetInfo: any;
    _signalDay7ActUpdateProgress: any;
    _signalDay7ActGetTaskReward: any;
    _signalDay7ActGetBuyDiscountShop: any;
    _signalRedPointUpdate: any;
    _leftTabGroupItemData: iItemData[];
    _day7ActDiscountNode: Day7ActivityDiscountView;


    ctor() {
        this._selectedFirstTabIndex = -1;
        this._selectedSecondTabIndex = -1;
        this._mainTabGroupData = null;
        this._listDatas = {};
        this._currListData = null;
        this._refreshHandler = null;
        this._finishTags = [];
        UIHelper.addEventListener(this.node, this._buttonClose, 'PopupDay7Activity', '_onClickClose');
    }
    onCreate() {
        this.ctor();
        this._initData();
        this._initListView(this._listItemSource);
        this._initMainTabGroup();
    }
    onEnter() {
        this._signalDay7ActGetInfo = G_SignalManager.add(SignalConst.EVENT_DAY7_ACT_GET_INFO, handler(this, this._onEventDay7ActGetInfo));
        this._signalDay7ActUpdateProgress = G_SignalManager.add(SignalConst.EVENT_DAY7_ACT_UPDATE_PROGRESS, handler(this, this._onEventDay7ActUpdateProgress));
        this._signalDay7ActGetTaskReward = G_SignalManager.add(SignalConst.EVENT_DAY7_ACT_GET_TASK_REWARD, handler(this, this._onEventDay7ActGetTaskReward));
        this._signalDay7ActGetBuyDiscountShop = G_SignalManager.add(SignalConst.EVENT_DAY7_ACT_GET_BUY_DISCOUNT_SHOP, handler(this, this._onEventDay7ActGetBuyDiscountShop));
        this._signalRedPointUpdate = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
        if (G_UserData.getDay7Activity().isExpired()) {
            G_UserData.getDay7Activity().pullData();
        }
        this._refreshActTime();
        this._mainTabGroupData = this._makeMainTabGroupData();
        this._initMainTabGroup();
        var currDay = G_UserData.getDay7Activity().getCurrent_day();
        if (currDay > 0) {
            this._selectedFirstTabIndex = -1;
            if (currDay <= Day7ActivityConst.DAY_NUM) {
                this._setTabIndex(currDay);
            } else {
                this._setTabIndex(Day7ActivityConst.DAY_NUM);
            }
        }
        this._startRefreshHandler();
        this._refreshFinishTag();
    }
    onExit() {
        this._signalDay7ActGetInfo.remove();
        this._signalDay7ActGetInfo = null;
        this._signalDay7ActUpdateProgress.remove();
        this._signalDay7ActUpdateProgress = null;
        this._signalDay7ActGetTaskReward.remove();
        this._signalDay7ActGetTaskReward = null;
        this._signalDay7ActGetBuyDiscountShop.remove();
        this._signalDay7ActGetBuyDiscountShop = null;
        this._signalRedPointUpdate.remove();
        this._signalRedPointUpdate = null;
        this._endRefreshHandler();
    }
    _refreshRedPoint() {
        this._refreshTabGroupRedPoint();
        this._refreshSubTabGroupRedPoint();
    }
    _refreshTabGroupRedPoint() {
        var tabDataList = this._getMainTabGroupData();
        for (let k in tabDataList) {
            var v = tabDataList[k];
            var redPointShow = G_UserData.getDay7Activity().hasRedPoint({ day: v });
            //logWarn(k + ('------------------------' + tostring(redPointShow)));
            this.setRedPointByTabIndex(k, redPointShow);
        }
    }
    _refreshSubTabGroupRedPoint() {
        var day = this._selectedFirstTabIndex;
        if (day <= 0) {
            return;
        }
        var tabList = G_UserData.getDay7Activity().getTabListByDay(day);
        for (let k=0; k<tabList.length; k++) {
            var v = tabList[k];
            var redPointShow = G_UserData.getDay7Activity().hasRedPoint(v);
            this._commonTabGroupHorizon.setRedPointByTabIndex(k+1, redPointShow);
        }
    }
    _onEventRedPointUpdate(event, funcId, param) {
        if (funcId != FunctionConst.FUNC_WEEK_ACTIVITY) {
            return;
        }
        if (!param) {
            return;
        }
        this._refreshRedPoint();
    }
    _startRefreshHandler() {
        if (this._refreshHandler != null) {
            return;
        }
        this._refreshHandler = handler(this, this._onRefreshTick);
        this.schedule(this._refreshHandler, 1);
    }
    _endRefreshHandler() {
        if (this._refreshHandler != null) {
            this.unschedule(this._refreshHandler);
            this._refreshHandler = null;
        }
    }
    _onRefreshTick(dt) {
        this._refreshActTime();
    }
    _onEventDay7ActGetInfo(event, id, message) {
        this._refreshActTime();
        if (this._selectedFirstTabIndex == -1) {
            if (G_UserData.getDay7Activity().isInActRunTime()) {
                this._setTabIndex(G_UserData.getDay7Activity().getCurrent_day());
            } else {
                this._setTabIndex(Day7ActivityConst.DAY_NUM);
            }
        } else {
            this._refreshListData();
        }
    }
    _onEventDay7ActUpdateProgress(event, id, message) {
        this._refreshListData();
    }
    _onEventDay7ActGetTaskReward(event, id, message) {
        this._showRewards(message);
    }
    _onEventDay7ActGetBuyDiscountShop(event, id, message) {
        this._refreshListData();
        this._showRewards(message);
    }
    _showRewards(message) {
        var awards = (message['awards']);
        if (awards) {
            PopupGetRewards.showRewards(awards);
        }
    }
    _onClickClose(sender) {
        this.close();
    }
    _initData() {
        this._selectedFirstTabIndex = -1;
        this._selectedSecondTabIndex = -1;
        this._mainTabGroupData = [];
        this._listDatas = {};
        this._nodeDiscount.removeAllChildren();
        this._day7ActDiscountNode = cc.instantiate(this.Day7ActivityDiscountView).getComponent(Day7ActivityDiscountView);
        this._nodeDiscount.addChild(this._day7ActDiscountNode.node);
    }
    _s2cBuyShopGoods(id, message) {
    }
    _onTabSelect(index) {
        let currentDay = G_UserData.getDay7Activity().getCurrent_day();
        var show = index <= currentDay + 1; // G_UserData.getDay7Activity().isDayCanReceive(index);  改成可提前预览下一天奖励
        if (!show) {
            G_Prompt.showTip(Lang.get('days7activity_act_open_tip', { day: index }));
            return false;
        }
        this._selectMainTab(index);
        return true;
    }
    _onSecondTabSelect(index, sender) {
        this._selectSubTag(index+1);
        this._updateFinishTagView();
    }
    _refreshMainTagContent() {
        this._listDatas = {};
        var oldTabData = this._getMainTabData(this._selectedFirstTabIndex);
        this._mainTabGroupData = this._makeMainTabGroupData();
        this._initMainTabGroup();
        var newSelectIndex = this._seekTabIndexByTabData(oldTabData);
        var isResetTabIndex = newSelectIndex == 0;
        if (isResetTabIndex) {
            this._selectedFirstTabIndex = -1;
            this._setTabIndex(1);
        } else {
            if (newSelectIndex != this._selectedFirstTabIndex) {
                this._setTabIndex(newSelectIndex);
            } else {
                this._refreshListData();
            }
        }
    }
    setRedPointByTabIndex(k, show) {
        var itemData = this._leftTabGroupItemData[k];
        if (itemData.redPoint) {
            itemData.redPoint.active = (show);
        } else {
            UICreateHelper.showRedPoint(itemData.panelWiget, show, cc.v2(0.85, 0.8));
        }
    }
    _refreshTabItem(itemData:iItemData, bright) {
        if (itemData.index != Day7ActivityConst.DAY_NUM) {
            itemData.imageNormal.active = (!bright);
            itemData.imageDown.active = (bright);
            if (itemData.text) {
                itemData.text.node.color = (bright && Colors.DAY7_TAB_BRIGHT || Colors.DAY7_TAB_NORMAL);
            }
        } else {
            if (itemData.text) {
                itemData.text.node.color = (Colors.DAY7_TAB_BRIGHT);
                UIHelper.enableOutline(itemData.text, Colors.DAY7_TAB_BRIGHT_OUTLINE, 2);
            }
        }
    }
    _setTabIndex(index) {///1-
        if (!this._leftTabGroupItemData) {
            return false;
        }
        var itemData = this._leftTabGroupItemData[index-1];
        if (!itemData) {
            return false;
        }
        var oldIndex = this._selectedFirstTabIndex;
        var success = this._onTabSelect(index);
        if (success) {
            for (let k=1; k<=this._leftTabGroupItemData.length; k++) {
                var itemData1 = this._leftTabGroupItemData[k-1];
                if (k != index) {
                    this._refreshTabItem(itemData1, false);
                }
            }
            this._refreshTabItem(itemData, true);
        }
        return success;
    }
    _onTabClick(event:cc.Event) {
        var sender = event.target;
        var index = parseInt(sender.name);
        this._setTabIndex(index);
    }
    _initMainTabGroup() {
        if (!this._leftTabGroupItemData) {
            this._leftTabGroupItemData = [];
            var names = Lang.get('days7activity_tab_names');
            var children = this._nodeLeftTabRoot.children;
            for (var k = 1; k <= children.length; k++) {
                var instNode = children[k-1];
                var itemData = {
                    index: k,
                    panelWiget: instNode
                } as iItemData;
                if (k != Day7ActivityConst.DAY_NUM) {
                    itemData.imageNormal = UIHelper.seekNodeByName(instNode, 'Image_normal');
                    itemData.imageDown = UIHelper.seekNodeByName(instNode, 'Image_down');
                    itemData.text = UIHelper.seekNodeByName(instNode, 'Text').getComponent(cc.Label);
                    itemData.finishTag = UIHelper.seekNodeByName(instNode, 'FinishTag');
                    if (itemData.text) {
                        itemData.text.string = (names[k-1]);
                    }
                    itemData.imageNormal.name = (k).toString();
                    itemData.imageDown.name = (k).toString();
                    UIHelper.addClickEventListenerEx(itemData.imageNormal, handler(this, this._onTabClick));
                    UIHelper.addClickEventListenerEx(itemData.imageDown, handler(this, this._onTabClick));
                    
                    itemData.redPoint = UIHelper.seekNodeByName(instNode, 'redPoint');
                } else {
                    itemData.imageBg = UIHelper.seekNodeByName(instNode, 'Image_bg');
                    itemData.redPoint = UIHelper.seekNodeByName(instNode, 'redPoint');
                    itemData.text = null;//UIHelper.seekNodeByName(instNode, 'Text').getComponent(cc.Label);
                    itemData.imageBg.name = (k).toString();
                    UIHelper.addClickEventListenerEx(itemData.imageBg, handler(this, this._onTabClick));
                    itemData.finishTag = UIHelper.seekNodeByName(instNode, 'FinishTag');
                }
                this._refreshTabItem(itemData, false);
                table.insert(this._leftTabGroupItemData, itemData);
            }
        }
        this._refreshTabGroupRedPoint();
    }
    _initSecondTabGroup(textList) {
        var param = {
            offset: 0,
            isVertical: 2,
            callback: handler(this, this._onSecondTabSelect),
            textList: textList || []
        };
        this._commonTabGroupHorizon.recreateTabs(param);
        this._refreshSubTabGroupRedPoint();
    }
    _seekTabIndexByTabData(tabData) {
        if (!tabData) {
            return 0;
        }
        var actListData = this._getMainTabGroupData();
        for (let k=1; k<=actListData.length; k++) {
            var v = actListData[k-1];
            if (v == tabData) {
                return k;
            }
        }
        return 0;
    }
    _makeMainTabGroupData() {
        return [
            1,
            2,
            3,
            4,
            5,
            6,
            7
        ];
    }
    _getMainTabGroupData() {
        return this._mainTabGroupData;
    }
    _getMainTabData(tabIndex?) {//1-
        var mainTabGroupData = this._getMainTabGroupData();
        if (!mainTabGroupData) {
            return null;
        }
        if (!tabIndex) {
            tabIndex = this._selectedFirstTabIndex;
        }
        if (tabIndex < 0) {
            return null;
        }
        return mainTabGroupData[tabIndex-1];
    }
    _getListViewData(leftTag, secondTag) {
        if (leftTag == -1 || secondTag == -1) {
            return null;
        }
        if (!this._listDatas[leftTag]) {
            this._listDatas[leftTag] = {};
        }
        if (!this._listDatas[leftTag][secondTag]) {
            this._pullListViewData(leftTag, secondTag);
        }
        return this._listDatas[leftTag][secondTag] || {};
    }
    _getCurrListViewData() {
        return this._getListViewData(this._selectedFirstTabIndex, this._selectedSecondTabIndex);
    }
    _pullListViewData(leftTag, secondTag) {
        var day = this._getMainTabData(leftTag);
        //assert(day, 'handle a unknow leftTag:' + tostring(leftTag));
        var shopListData = G_UserData.getDay7Activity().getActUnitDataList(leftTag, secondTag);
        this._listDatas[leftTag][secondTag] = shopListData;
    }
    _initListView(listView:CommonCustomListViewEx) {
        listView.setTemplate(this.Day7ActivityItemCell);
        listView.setCallback(handler(this, this._onItemUpdate), handler(this, this._onItemSelected));
        listView.setCustomCallback(handler(this, this._onItemTouch));
    }
    _refreshListView(listView:CommonCustomListViewEx, listData) {
        this._currListData = listData;
        var lineCount = listData.length;
        listView.clearAll();
        listView.resize(lineCount);
        listView.scrollToTop();
    }
    _onItemUpdate(item, index) {
        if (!this._currListData) {
            return;
        }
        var itemList = this._currListData;
        var itemData = itemList[index];
        if (itemData) {
            item.updateInfo(itemData);
        }
    }
    _onItemSelected(item, index) {
    }
    _onItemTouch(index, itemPos) {
        //logWarn('PopupDay7Activity:_onItemTouch ' + (tostring(index) + (' ' + tostring(itemPos))));
        var itemList = this._getCurrListViewData();
        var actTaskUnitData = itemList[itemPos-1];
        if (actTaskUnitData) {
            var reachReceiveCondition = G_UserData.getDay7Activity().isTaskReachReceiveCondition(actTaskUnitData.getId());
            var canReceive = G_UserData.getDay7Activity().isTaskCanReceived(actTaskUnitData.getId());
            var cfg = actTaskUnitData.getConfig();
            if (reachReceiveCondition) {
                if (canReceive) {
                    var rewardType = actTaskUnitData.getConfig().reward_type;
                    if (rewardType == Day7ActivityConst.REWARD_TYPE_ALL && this._checkPack(actTaskUnitData)) {
                        G_UserData.getDay7Activity().c2sSevenDaysReward(actTaskUnitData.getId(), null);
                    } else if (rewardType == Day7ActivityConst.REWARD_TYPE_SELECT) {
                        this._showSelectRewarsPopup(actTaskUnitData);
                    }
                }
            } else {
                if (cfg.function_id != 0) {
                    //logWarn('PopupDay7Activity:function skip ' + tostring(cfg.function_id));
                    //var WayFuncDataHelper = require('WayFuncDataHelper');
                    WayFuncDataHelper.gotoModuleByFuncId(cfg.function_id);
                }
            }
        }
    }
    _checkPack(actTaskUnitData, index?) {
        var rewards = actTaskUnitData.getRewards();
        var oneReward = null;
        if(index != null){
            oneReward = rewards[index];
        }
        rewards = oneReward && [oneReward] || rewards;
        var full = UserCheck.checkPackFullByAwards(rewards);
        return !full;
    }
    _showSelectRewarsPopup(actTaskUnitData) {
        let callBackFunction = function (awardItem, index) {
            if (awardItem == null) {
                G_Prompt.showTip(Lang.get('common_choose_item'));
                return true;
            }
            if (!this._checkPack(actTaskUnitData, index)) {
                return;
            }
            var rewardIndex = index+1;
            G_UserData.getDay7Activity().c2sSevenDaysReward(actTaskUnitData.getId(), rewardIndex);
            return false;
        }.bind(this);
        var awardItems = actTaskUnitData.getRewards();
        PopupBase.loadCommonPrefab('PopupSelectReward', (popup:PopupSelectReward)=>{
            popup.ctor(Lang.get('days7activity_receive_popup'), callBackFunction);
            popup.setTip(Lang.get('days7activity_receive_popup_tip'));
            popup.updateUI(awardItems);
            popup.openWithAction();
        });

    }
    _selectMainTab(tagIndex) {
        if (this._selectedFirstTabIndex == tagIndex) {
            return;
        }
        this._selectedFirstTabIndex = tagIndex;
        this._refreshSubTabGroup();
        var secondTabIndex = this._selectedSecondTabIndex;
        this._selectedSecondTabIndex = -1;
        secondTabIndex = Math.max(secondTabIndex, 1);
        secondTabIndex = secondTabIndex > this._commonTabGroupHorizon.getTabCount() && 1 || secondTabIndex;
        if (this._commonTabGroupHorizon.getTabCount() > 0) {
            this._commonTabGroupHorizon.node.active = (true);
            this._commonTabGroupHorizon.setTabIndex(secondTabIndex-1);
        } else {
            this._commonTabGroupHorizon.node.active = (false);
        }
    }
    _refreshSubTabGroup() {
        var day = this._getMainTabData();
        var tabList = G_UserData.getDay7Activity().getTabListByDay(day);
        var makeTabNames = function (tabList) {
            var textList = [];
            for (let k in tabList) {
                var v = tabList[k];
                table.insert(textList, v.name);
            }
            return textList;
        };
        var textList = makeTabNames(tabList);
        this._initSecondTabGroup(textList);
    }
    _selectSubTag(tagIndex) {
        if (this._selectedSecondTabIndex == tagIndex) {
            return;
        }
        this._selectedSecondTabIndex = tagIndex;
        var tabData = G_UserData.getDay7Activity().getTabData(this._selectedFirstTabIndex, this._selectedSecondTabIndex);
        if (tabData.type == Day7ActivityConst.TAB_TYPE_TASK) {
            this._listItemSource.node.active = (true);
            this._day7ActDiscountNode.node.active = (false);
            var listViewData = this._getListViewData(this._selectedFirstTabIndex, this._selectedSecondTabIndex);
            this._refreshListView(this._listItemSource, listViewData);
        } else if (tabData.type == Day7ActivityConst.TAB_TYPE_DISCOUNT) {
            this._listItemSource.node.active = (false);
            this._day7ActDiscountNode.node.active = (true);
            var listViewData = this._getListViewData(this._selectedFirstTabIndex, this._selectedSecondTabIndex);
            this._day7ActDiscountNode.refreshDiscountView(listViewData[0]);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_CLICK, FunctionConst.FUNC_WEEK_ACTIVITY, {
            day: this._selectedFirstTabIndex,
            sheet: this._selectedSecondTabIndex
        });
    }
    _onClickBtn(sender) {
        var id = sender.getTag();
        var listViewData = this._getCurrListViewData();
        var data = listViewData[0];
      //assert((data, 'PopupDay7Activity buy discount item fail');
        var success = LogicCheckHelper.enoughCash(data.gold_price), popFunc;
        if (success) {
            G_UserData.getDay7Activity().c2sSevenDaysShop(id);
        } else {
            popFunc();
        }
    }
    _refreshListData() {
        this._listDatas = {};
        var currSecondTagIndex = this._selectedSecondTabIndex;
        this._selectedSecondTabIndex = -1;
        if (this._selectedFirstTabIndex != -1 && currSecondTagIndex != -1) {
            this._selectSubTag(currSecondTagIndex);
        }
        this._refreshFinishTag();
    }
    refreshData() {
        this._refreshMainTagContent();
        this._refreshActTime();
    }
    _refreshActTime() {
        if (!G_UserData.getDay7Activity().isHasData()) {
            this._textTime.node.active = (false);
            this._imageActivityEnd.node.active = (false);
            return;
        }
        var text = '';
        if (G_UserData.getDay7Activity().isInActRunTime()) {
            var timeStr = G_ServerTime.getLeftDHMSFormat(G_UserData.getDay7Activity().getActEndTime());
            text = Lang.get('days7activity_act_end_time', { time: timeStr });
            this._imageActivityEnd.node.active = (false);
        } else {
            var timeStr = G_ServerTime.getLeftDHMSFormat(G_UserData.getDay7Activity().getActRewardEndTime());
            text = Lang.get('days7activity_act_reward_time', { time: timeStr });
            this._imageActivityEnd.node.active = (true);
        }
        this._textTime.node.active = (true);
        this._textTime.string = (text);
    }
    _refreshFinishTag() {
        var isFinish = function(firstTabInde, secondTabInde) {
            var tabData = G_UserData.getDay7Activity().getTabData(firstTabInde, secondTabInde);
            var listViewData = this._getListViewData(firstTabInde, secondTabInde);
            if (tabData && listViewData) {
                if (tabData.type == Day7ActivityConst.TAB_TYPE_TASK) {
                    var isAllFinish = true;
                    for (let _tmp in listViewData) {
                        var unitData = listViewData[_tmp];
                        var hasReceived = G_UserData.getDay7Activity().isTaskReceivedReward(unitData.getId());
                        if (!hasReceived) {
                            isAllFinish = false;
                            break;
                        }
                    }
                    return isAllFinish;
                } else if (tabData.type == Day7ActivityConst.TAB_TYPE_DISCOUNT) {
                    var unitData = listViewData[0];
                    var reachBuyCondition = G_UserData.getDay7Activity().isShopDiscountReachBuyCondition(unitData.id);
                    var canBuy = G_UserData.getDay7Activity().isShopDiscountCanBuy(unitData.id);
                    if (reachBuyCondition && !canBuy) {
                        return true;
                    }
                }
            }
            return false;
        }.bind(this);
        for (let k=1; k<=this._leftTabGroupItemData.length; k++) {
            var _tmp = this._leftTabGroupItemData[k-1];
            if (this._finishTags.length < k) {
                var tag = {} as any;
                tag.children = [];
                tag.isAllFinish = false;
                this._finishTags.push(tag);
            }
            var children = this._finishTags[k-1].children;
            if (!this._finishTags[k-1].isAllFinish) {
                var show = G_UserData.getDay7Activity().isDayCanReceive(k);
                if (show) {
                    var tabList = G_UserData.getDay7Activity().getTabListByDay(k) || [];
                    for (let j=1; j<=tabList.length; j++) {
                        var _tmp1 = tabList[j-1];
                        if (children.length < j) {
                            children.push(isFinish(k, j));
                        }
                    }
                    var isAllFinish = true;
                    for (let i in children) {
                        var v = children[i];
                        if (!v) {
                            isAllFinish = false;
                            break;
                        }
                    }
                    this._finishTags[k-1].isAllFinish = isAllFinish;
                }
            }
        }
        this._updateFinishTagView();
    }
    _updateFinishTagView() {
        for (let k = 0; k<this._finishTags.length; k++) {
            var v = this._finishTags[k];
            var itemData = this._leftTabGroupItemData[k];
            //print(itemData, itemData.finishTag);
            if (itemData && itemData.finishTag) {
                itemData.finishTag.active = (v.isAllFinish);
            }
            if (this._selectedFirstTabIndex == k+1) {
                for (var i=0; i<v.children.length; i++) {
                    var j = v.children[i];
                    if (j) {
                        this._commonTabGroupHorizon.addCustomTag(i+1, {
                            texture: Path.getTextSignet('txt_7day_done'),
                            position: cc.v2(-32, -12)
                        });
                    } else {
                        this._commonTabGroupHorizon.removeCustomTag(i+1);
                    }
                }
            }
        }
    }

}
