// import ViewBase from "../../ViewBase";

// const {ccclass, property} = cc._decorator;
// @ccclass
// export default class CustomActivityReturnGiftView extends ViewBase {
//     ctor(actView, actType) {
//         this._actView = actView;
//         this._actType = actType;
//         this._customActUnitData = null;
//         this._listDatas = null;
//         this._resetListData = null;
//         this._listItemSource = null;
//         this._textActTitle = null;
//         this._textActDes = null;
//         this._textNode = null;
//         var resource = {
//             file: Path.getCSB('CustomActivityTaskView', 'customactivity'),
//             size: G_ResolutionManager.getDesignSize(),
//             binding: {}
//         };
//     }
//     onCreate() {
//         this._initListView(this._listItemSource);
//     }
//     onEnter() {
//         this._startRefreshHandler();
//     }
//     onExit() {
//         this._endRefreshHandler();
//     }
//     _startRefreshHandler() {
//         var SchedulerHelper = require('SchedulerHelper');
//         if (this._refreshHandler != null) {
//             return;
//         }
//         this._refreshHandler = SchedulerHelper.newSchedule(handler(this, this._onRefreshTick), 1);
//     }
//     _endRefreshHandler() {
//         var SchedulerHelper = require('SchedulerHelper');
//         if (this._refreshHandler != null) {
//             SchedulerHelper.cancelSchedule(this._refreshHandler);
//             this._refreshHandler = null;
//         }
//     }
//     _onRefreshTick(dt) {
//         var actUnitdata = this._customActUnitData;
//         if (actUnitdata) {
//             this._refreshActTime(actUnitdata);
//         }
//     }
//     _refreshActTime(actUnitData) {
//         var CustomActivityUIHelper = require('CustomActivityUIHelper');
//         var timeStr = '';
//         if (actUnitData.isActInRunTime()) {
//             this._textTimeTitle.setString(Lang.get('activity_guild_sprint_downtime_title'));
//             timeStr = CustomActivityUIHelper.getLeftDHMSFormat(actUnitData.getEnd_time());
//         } else if (actUnitData.isActInPreviewTime()) {
//             this._textTimeTitle.setString(Lang.get('activity_guild_sprint_uptime_title'));
//             timeStr = CustomActivityUIHelper.getLeftDHMSFormat(actUnitData.getStart_time());
//         } else {
//             this._textTimeTitle.setString(Lang.get('activity_guild_sprint_downtime_title'));
//             timeStr = CustomActivityUIHelper.getLeftDHMSFormat(actUnitData.getAward_time());
//         }
//         this._textTime.setString(timeStr);
//     }
//     _isExchangeAct() {
//         return this._actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_SELL;
//     }
//     _getTemplate(data) {
//         var CustomActivityTaskItemCell = require('CustomActivityTaskItemCell');
//         return CustomActivityTaskItemCell;
//     }
//     _getListViewData() {
//         if (!this._listDatas) {
//             this._listDatas = G_UserData.getCustomActivity().getReturnGiftList();
//         }
//         return this._listDatas;
//     }
//     _getCurrListViewData() {
//         return this._getListViewData() || {};
//     }
//     _initListView(listView) {
//         listView.setCallback(handler(this, this._onItemUpdate), handler(this, this._onItemSelected));
//         listView.setCustomCallback(handler(this, this._onItemTouch));
//     }
//     _refreshListView(listView, listData) {
//         var cell = require('CustomActivityReturnGiftCell');
//         listView.setTemplate(cell);
//         var lineCount = listData.length;
//         listView.clearAll();
//         listView.resize(lineCount);
//         if (this._resetListData) {
//             listView.jumpToTop();
//         }
//     }
//     _onItemUpdate(item, index) {
//         var itemList = this._getCurrListViewData();
//         var itemData = itemList[index + 1];
//         if (itemData) {
//             item.updateInfo(itemData);
//         }
//     }
//     _onItemSelected(item, index) {
//     }
//     _onItemTouch(index, itemPos) {
//         var returnSvr = G_UserData.getBase().getReturnSvr();
//         if (returnSvr == null) {
//             G_Prompt.showTip(Lang.get('return_server_can_not_recharge'));
//             return;
//         }
//         logWarn('CustomActivityReturnGiftView:_onItemTouch ' + (tostring(index) + (' ' + tostring(itemPos))));
//         var itemList = this._getCurrListViewData();
//         var itemData = itemList[itemPos + 1];
//         if (!itemData) {
//             return;
//         }
//         var giftId = itemData.giftId;
//         G_UserData.getCustomActivity().c2sCheckBuyReturnGift(giftId);
//     }
//     _checkRes(actTaskUnitData) {
//         var items = actTaskUnitData.getConsumeItems();
//         dump(items);
//         var canBuy = true;
//         for (k in items) {
//             var v = items[k];
//             canBuy = G_UserData.getCustomActivity().isEnoughValue(v.type, v.value, v.size);
//             if (!canBuy) {
//                 G_Prompt.showTip(Lang.get('common_res_not_enough'));
//                 return canBuy;
//             }
//         }
//         return canBuy;
//     }
//     _refreshListData() {
//         this._listDatas = G_UserData.getCustomActivity().getReturnGiftList();
//         dump(this._listDatas);
//         this._refreshListView(this._listItemSource, this._listDatas);
//     }
//     _refreshDes() {
//         if (!this._customActUnitData) {
//             return;
//         }
//         this._textActTitle.setString(this._customActUnitData.getSub_title());
//         this._createProgressRichText(this._customActUnitData.getDesc());
//     }
//     _createProgressRichText(msg) {
//         var CustomActivityUIHelper = require('CustomActivityUIHelper');
//         var RichTextHelper = require('RichTextHelper');
//         var richMsg = json.encode(CustomActivityUIHelper.getRichMsgListForHashText(msg, Colors.CUSTOM_ACT_DES_HILIGHT, null, Colors.CUSTOM_ACT_DES, null, 18));
//         this._textNode.removeAllChildren();
//         var widget = ccui.RichText.createWithContent(richMsg);
//         widget.setAnchorPoint(cc.p(0, 1));
//         widget.ignoreContentAdaptWithSize(false);
//         widget.setContentSize(cc.size(450, 0));
//         this._textNode.addChild(widget);
//     }
//     _refreshData() {
//         this._refreshDes();
//         this._refreshListData();
//         if (this._customActUnitData) {
//             this._refreshActTime(this._customActUnitData);
//         }
//     }
//     refreshView(customActUnitData, resetListData) {
//         var oldCustomActUnitData = this._customActUnitData;
//         this._customActUnitData = customActUnitData;
//         if (!oldCustomActUnitData) {
//             this._resetListData = true;
//         } else if (customActUnitData && oldCustomActUnitData.getAct_id() != customActUnitData.getAct_id()) {
//             this._resetListData = true;
//         } else {
//             if (resetListData == null) {
//                 this._resetListData = true;
//             } else {
//                 this._resetListData = resetListData;
//             }
//         }
//         this._refreshData();
//     }
// }
