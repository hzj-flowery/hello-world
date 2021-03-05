const {ccclass, property} = cc._decorator;

import CommonFullScreenActivityTitle from '../../../../ui/component/CommonFullScreenActivityTitle'

import CommonTalkNode from '../../../../ui/component/CommonTalkNode'
import ActivitySubView from '../ActivitySubView';
import { G_UserData, Colors, G_SignalManager, G_ServerTime, G_Prompt } from '../../../../init';
import { Lang } from '../../../../lang/Lang';
import { SignalConst } from '../../../../const/SignalConst';
import { handler } from '../../../../utils/handler';
import { ActivityConst } from '../../../../const/ActivityConst';
import { ActivityDataHelper } from '../../../../utils/data/ActivityDataHelper';
import { UIPopupHelper } from '../../../../utils/UIPopupHelper';
import CommonCustomListViewEx from '../../../../ui/component/CommonCustomListViewEx';

@ccclass
export default class WeeklyGiftPkgView extends ActivitySubView {

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
    _countDownNode: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTime: cc.Label = null;

    @property(cc.Prefab)
    WeeklyGiftPkgItemCell:cc.Prefab = null;

    
    _mainView: any;
    _activityId: any;
    _signalWelfareGiftPkgGetInfo: any;
    _signalWelfareGiftPkgGetReward: any;
    _refreshHandler: any;
    _listDatas: any;
    loadIndex:number = 0;
    scheduleHandler:any;


    ctor(mainView, activityId) {
        this._mainView = mainView;
        this._activityId = activityId;
    }
    _pullData() {
        var hasActivityServerData = G_UserData.getActivity().hasActivityData(this._activityId);
        if (!hasActivityServerData) {
            G_UserData.getActivity().pullActivityData(this._activityId);
        }
        return hasActivityServerData;
    }
    onCreate() {
        this._commonBubble.setBubbleColor(Colors.BRIGHT_BG_ONE);
        this._commonBubble.setString(Lang.get('lang_activity_weeklygiftpkg_talk'), 325, true, 325, 76);
        this._initListView(this._listView);
    }
    onEnter() {
        this._signalWelfareGiftPkgGetInfo = G_SignalManager.add(SignalConst.EVENT_WELFARE_GIFT_PKG_GET_INFO, handler(this, this._onEventWelfareGiftPkgGetInfo));
        this._signalWelfareGiftPkgGetReward = G_SignalManager.add(SignalConst.EVENT_WELFARE_GIFT_PKG_GET_REWARD, handler(this, this._onEventWelfareGiftPkgGetReward));
        var hasServerData = this._pullData();
        if (hasServerData && G_UserData.getActivityWeeklyGiftPkg().isExpired()) {
            G_UserData.getActivity().pullActivityData(this._activityId);
        }
        this.refreshData();
        this._startRefreshHandler();
    }
    onExit() {
        this._signalWelfareGiftPkgGetInfo.remove();
        this._signalWelfareGiftPkgGetInfo = null;
        this._signalWelfareGiftPkgGetReward.remove();
        this._signalWelfareGiftPkgGetReward = null;
        this._endRefreshHandler();
    }
    exitModule(){
        //this._listView.clearAll();
    }
    _startRefreshHandler() {
        this.schedule(handler(this, this._onRefreshTick), 1);
    }
    _endRefreshHandler() {
        this.unschedule(handler(this, this._onRefreshTick));
    }
    _onRefreshTick(dt) {
        this._refreshActTime();
    }
    _onEventWelfareGiftPkgGetInfo(event, id, message) {
        if (message.discount_type != ActivityConst.GIFT_PKG_TYPE_WEEKLY) {
            return;
        }
        this.refreshData();
    }
    _onEventWelfareGiftPkgGetReward(event, id, message, giftId) {
        if (message.discount_type != ActivityConst.GIFT_PKG_TYPE_WEEKLY) {
            return;
        }
        var index = null;
        var listDatas = this._getListDatas();
        for (var k=0; k<listDatas.length; k++) {
            var v = listDatas[k];
            if (v.getId() == giftId) {
                index = k+1;
            }
        }
        if (index) {
            this._refreshItemNodeByIndex(index);
        }
        this._onShowRewardItems(message);
    }
    _onShowRewardItems(message) {
        var ids = (message['id']) || [];
        var awards = G_UserData.getActivityWeeklyGiftPkg().getRewards(ids);
        if (awards) {
            G_Prompt.showAwards(awards);
        }
    }
    _initListView(listView) {
        listView.setTemplate(this.WeeklyGiftPkgItemCell);
        listView.setCallback(handler(this, this._onItemUpdate), handler(this, this._onItemSelected));
        listView.setCustomCallback(handler(this, this._onItemTouch));
    }
    _refreshListView(listView, itemList) {
        var lineCount = itemList.length;
        //logWarn('WeeklyGiftPkgView:line  ' + lineCount);
        if(this.scheduleHandler){
            this.unschedule(this.scheduleHandler);
            this.scheduleHandler = null;
        }
        this.loadIndex = 0;
        listView.clearAll();
        this.scheduleHandler = handler(this,this.loadListViewCell);
        this.schedule(this.scheduleHandler, 0.1);
        //listView.resize(lineCount);
        console.log('WeeklyGiftPkgView _refreshListView');
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
        this._listView.resize(this.loadIndex, 2, false);
    }
    _getListDatas() {
        return this._listDatas;
    }
    _onItemUpdate(item, index) {
        //logWarn('WeeklyGiftPkgView:_onItemUpdate  ' + (index + 1));
        var itemList = this._getListDatas();
        item.updateInfo(itemList[index]);
    }
    _onItemSelected(item, index) {
        //logWarn('WeeklyGiftPkgView:_onItemSelected ');
    }
    _onItemTouch(index, itemPos) {
        //logWarn('WeeklyGiftPkgView:_onItemTouch ' + (tostring(index) + (' ' + tostring(itemPos))));
        var data = this._listDatas[itemPos];
        var id = data.getId();
        var [success, errorMsg, funcName] = data.checkIsCanBuy();
        if (success) {
            if (ActivityDataHelper.checkPackBeforeGetActReward(data)) {
                G_UserData.getActivityWeeklyGiftPkg().c2sActDiscount(id);
            }
        } else if (funcName == 'enoughVip') {
            UIPopupHelper.popupVIPNoEnough();
        } else if (funcName == 'enoughCash') {
            errorMsg();
        }
    }
    _refreshActTime() {
        var updateTime = G_UserData.getActivityWeeklyGiftPkg().getExpiredTime();
        var isShowUpdateTime = updateTime > 0;
        var timeStr = G_ServerTime.getLeftDHMSFormat(updateTime);
        var text = Lang.get('lang_activity_weeklygiftpkg_refresh_time', { date: timeStr });
        this._textTime.string = (text);
        this._textTime.node.active = (isShowUpdateTime);
    }
    _refreshListData() {
        var allData = G_UserData.getActivityWeeklyGiftPkg().getAllShowUnitDatas();
        this._listDatas = allData;
        this._refreshListView(this._listView, this._listDatas);
    }
    refreshData() {
        this._refreshActTime();
        this._refreshListData();
    }
    enterModule() {
        this._commonBubble.doAnim();
    }
    _refreshItemNodeByIndex(index) {
        var itemNode = this._findItemNodeByIndex(index);
        if (itemNode) {
            var unitData = this._listDatas[index-1];
            itemNode.updateInfo(unitData);
        }
    }
    _findItemNodeByIndex(index) {
        var lineIndex = index;
        var items = this._listView.getItems();
        if (!items) {
            return null;
        }
        var itemCellNode = null;
        for (let k in items) {
            var v = items[k];
            if (v.getTag() + 1 == lineIndex) {
                itemCellNode = v;
            }
        }
        return itemCellNode;
    }

}
