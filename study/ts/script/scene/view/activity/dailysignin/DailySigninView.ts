const {ccclass, property} = cc._decorator;

import CommonFullScreenActivityTitle from '../../../../ui/component/CommonFullScreenActivityTitle'
import CommonCustomListViewEx from '../../../../ui/component/CommonCustomListViewEx';
import ActivitySubView from '../ActivitySubView';
import { G_UserData, G_SignalManager, G_Prompt } from '../../../../init';
import { SignalConst } from '../../../../const/SignalConst';
import { handler } from '../../../../utils/handler';
import { ActivityConst } from '../../../../const/ActivityConst';
import { ActivityDataHelper } from '../../../../utils/data/ActivityDataHelper';
import { Lang } from '../../../../lang/Lang';
import { UIPopupHelper } from '../../../../utils/UIPopupHelper';
import { LogicCheckHelper } from '../../../../utils/LogicCheckHelper';
import DailySigninItemCell from './DailySigninItemCell';

@ccclass
export default class DailySigninView extends ActivitySubView {

    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _listView: CommonCustomListViewEx = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _richTextNode: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _bitmapFontLabel: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTian: cc.Label = null;

    @property(cc.Prefab)
    DailySigninItemCell:cc.Prefab = null;


    _mainView: any;
    _activityId: any;
    _signalWelfareSigninGetInfo: any;
    _signalWelfareSigninDoSignin: any;
    _listDatas: any[];
    _todaySignUnitData: any;
    _todayItemNode: any;
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
        this._initListView(this._listView);
    }
    onEnter() {
        this._signalWelfareSigninGetInfo = G_SignalManager.add(SignalConst.EVENT_WELFARE_SIGNIN_GET_INFO, handler(this, this._onEventWelfareSigninGetInfo));
        this._signalWelfareSigninDoSignin = G_SignalManager.add(SignalConst.EVENT_WELFARE_SIGNIN_DO_SIGNIN, handler(this, this._onEventWelfareSigninDoSignin));
        var hasServerData = this._pullData();
        if (hasServerData && G_UserData.getActivityDailySignin().isExpired()) {
            G_UserData.getActivity().pullActivityData(this._activityId);
        }
        if (hasServerData) {
            this.refreshData();
        }
    }
    onExit() {
        this._signalWelfareSigninGetInfo.remove();
        this._signalWelfareSigninGetInfo = null;
        this._signalWelfareSigninDoSignin.remove();
        this._signalWelfareSigninDoSignin = null;        
    }
    enterModule() {
    }
    exitModule(){
        // this._listView.clearAll();
        // if(this.scheduleHandler){
        //     this.unschedule(this.scheduleHandler);
        // }
    }
    _onEventWelfareSigninGetInfo(event, id, message) {
        this.refreshData();
    }
    _onEventWelfareSigninDoSignin(event, id, message) {
        this._refreshTotalSigninDayView();
        this._refreshItemNodeByIndex(message.day + 1);
        this._onShowRewardItems(message);
        this._refreshTodaySignUnitData();
    }
    _initListView(listView) {
        listView.setTemplate(this.DailySigninItemCell);
        listView.setCallback(handler(this, this._onItemUpdate), handler(this, this._onItemSelected), handler(this, this._scrollEvent));
        listView.setCustomCallback(handler(this, this._onItemTouch));
    }
    _refreshListView(listView:CommonCustomListViewEx, itemList) {
        var lineCount = Math.ceil(itemList.length / DailySigninItemCell.LINE_ITEM_NUM);
        if(this.scheduleHandler){
            this.unschedule(this.scheduleHandler);
            this.scheduleHandler = null;
        }
        listView.clearAll();
        this.loadIndex = 0;
        this.scheduleHandler = handler(this,this.resizeListView);
        this.schedule(this.scheduleHandler, 0.1);
        //listView.resize(1);
    }
    resizeListView(){
        var lineCount = Math.ceil(this._listDatas.length / DailySigninItemCell.LINE_ITEM_NUM);
        if(this.loadIndex >= lineCount){
            this.unschedule(this.scheduleHandler);
            this.scheduleHandler = null;
            this._refreshLightZorder();
            return;
        }
        this.loadIndex++;
        this._listView.resize(this.loadIndex, 2, false);
    }
    _refreshItemNodeByIndex(index) {
        var itemNode = this._findItemNodeByIndex(index);
        if (itemNode) {
            var dailySigninUnitData = this._listDatas[index-1];
            itemNode.updateInfo(dailySigninUnitData);
        }
    }
    _findItemNodeByIndex(index) {
        var lineIndex = Math.ceil(index / DailySigninItemCell.LINE_ITEM_NUM);
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
        if (!itemCellNode) {
            return null;
        }
        var secondIndex = index - (lineIndex - 1) * DailySigninItemCell.LINE_ITEM_NUM;
        return itemCellNode.getItemNodeByIndex(secondIndex);
    }
    _getListDatas():any[] {
        return this._listDatas;
    }
    _scrollEvent(sender, eventType) {
        if (eventType == cc.ScrollView.EventType.SCROLL_ENDED) {
            this._refreshLightZorder();
        }
    }
    _refreshLightZorder() {
        var signUnitData = this._todaySignUnitData;
        if (!signUnitData) {
            return;
        }
        var item = this._todayItemNode;
        if (!item) {
            item = this._findItemNodeByIndex(signUnitData.getDay());
            if(!item){
                return;
            }
            this._todayItemNode = item;
        }
        if (this._isItemInListView(item, this._listView)) {
            item.setLightEffectGlobalZorder(1);
        } else {
            item.setLightEffectGlobalZorder(0);
        }
    }
    _isItemInListView(item:cc.Component, listView:cc.Component) {
        var size = {
            width: 131,
            height: 123
        };
        var listSize = listView.node.getContentSize();
        var worldPos = item.node.getParent().convertToWorldSpaceAR(cc.v2(item.node.getPosition()));
        var viewPos = listView.node.convertToNodeSpaceAR(cc.v2(worldPos));
        viewPos.y = viewPos.y - size.height * 0.5;
        if (viewPos.y < -1 || viewPos.y + size.height > listSize.height + 1) {
            return false;
        }
        return true;
    }
    _onItemUpdate(item, index) {
        var startIndex = index * DailySigninItemCell.LINE_ITEM_NUM + 1;
        //logWarn('DailySigninView:_onItemUpdate  ' + startIndex);
        var endIndex = startIndex + DailySigninItemCell.LINE_ITEM_NUM - 1;
        var itemLine = [];
        var itemList = this._getListDatas();
        if (itemList.length > 0) {
            for (var i = startIndex; i<=endIndex; i++) {
                var itemData = itemList[i-1];
                if (itemData) {
                    itemLine.push(itemData);
                }
            }
            item.updateUI(index, itemLine);
        }
    }
    _onItemSelected(item, index) {
        //logWarn('DailySigninView:_onItemSelected ');
    }
    _onItemTouch(index, itemPos) {
        //logWarn('DailySigninView:_onItemTouch ' + (tostring(index) + (' ' + tostring(itemPos))));
        var data = this._listDatas[itemPos-1];
        if (data.getState() == ActivityConst.CHECKIN_STATE_RIGHT_TIME && ActivityDataHelper.checkPackBeforeGetActReward(data)) {
            G_UserData.getActivityDailySignin().c2sActCheckin();
        } else if (data.getState() == ActivityConst.CHECKIN_STATE_OVER_TIME && ActivityDataHelper.checkPackBeforeGetActReward(data)) {
            var needGold = G_UserData.getActivityDailySignin().getReSigninCostGold();
            var warnText = Lang.get('lang_activity_dailysign_resignin_warn', { gold: needGold });
            UIPopupHelper.popupConfirm(warnText, function () {
                var [success, popFunc] = LogicCheckHelper.enoughCash(needGold);
                if (success) {
                    G_UserData.getActivityDailySignin().c2sActReCheckin(data.getDay());
                } else {
                    popFunc();
                }
            });
        }
    }
    _onShowRewardItems(message) {
        var awards = message['reward'];
        if (awards) {
            G_Prompt.showAwards(awards);
        }
    }
    _refreshTotalSigninDayView(dayCount?:number) {
        dayCount = dayCount || G_UserData.getActivityDailySignin().getCheckinCount();
        this._bitmapFontLabel.string = ((dayCount).toString());
        //var size = this._bitmapFontLabel.node.getContentSize();
        //this._textTian.node.x = (this._bitmapFontLabel.node.x + size.width + 4);
    }
    refreshData() {
        console.log("DailySigninView refreshData");
        var allData = G_UserData.getActivityDailySignin().getAllSigninUnitDatas();
        this._listDatas = allData;
        this._refreshTodaySignUnitData();
        this._refreshListView(this._listView, this._listDatas);
        var dayCount = G_UserData.getActivityDailySignin().getCheckinCount();
        this._refreshTotalSigninDayView(dayCount);
        var currSignDay = G_UserData.getActivityDailySignin().getCurrSignDay();
        if (currSignDay && currSignDay > 21) {
            this._listView.getInnerContainer().y = (0);
        }
    }
    _refreshTodaySignUnitData() {
        this._todaySignUnitData = this._getTodaySignUnitData();
        this._todayItemNode = null;
    }
    _getTodaySignUnitData() {
        for (let k in this._listDatas) {
            var v = this._listDatas[k];
            if (v.getState() == ActivityConst.CHECKIN_STATE_RIGHT_TIME) {
                return v;
            }
        }
        return null;
    }

}
