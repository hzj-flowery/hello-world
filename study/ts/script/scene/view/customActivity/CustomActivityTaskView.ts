import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { CustomActivityConst } from "../../../const/CustomActivityConst";
import { DataConst } from "../../../const/DataConst";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import { Colors, G_ConfigLoader, G_GameAgent, G_Prompt, G_SceneManager, G_ServerTime, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonListView from "../../../ui/component/CommonListView";
import PopupSelectReward from "../../../ui/PopupSelectReward";
import PopupSelectRewardNum from "../../../ui/PopupSelectRewardNum";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { WayFuncDataHelper } from "../../../utils/data/WayFuncDataHelper";
import { handler } from "../../../utils/handler";
import { UserCheck } from "../../../utils/logic/UserCheck";
import { Path } from "../../../utils/Path";
import { ResourceData } from "../../../utils/resource/ResourceLoader";
import { table } from "../../../utils/table";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { UIPopupHelper } from "../../../utils/UIPopupHelper";
import ViewBase from "../../ViewBase";
import { CustomActivityUIHelper } from "./CustomActivityUIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CustomActivityTaskView extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _textNode: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textActDes: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textActTitle: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _listItemSource: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _countDownNode: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTimeTitle: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTime: cc.Label = null;



    @property({
        type: CommonListView,
        visible: true
    })
    _commonListView: CommonListView = null;

    protected preloadResList: ResourceData[] = [
        { path: Path.getPrefab("CustomActivityTaskItemCell", "customActivity"), type: cc.Prefab },
        { path: Path.getPrefab("CustomActivityExchangeItemCell", "customActivity"), type: cc.Prefab },
        { path: Path.getPrefab("CustomActivityRechargeTaskItemCell", "customActivity"), type: cc.Prefab },
        { path: Path.getPrefab("CustomActivityYuBiExchangeCell", "customActivity"), type: cc.Prefab },
        { path: Path.getPrefab("CustomActivitySingleRechargeItemCell", "customActivity"), type: cc.Prefab },
        { path: Path.getPrefab("CustomActivityBuyGoodsItemCell", "customActivity"), type: cc.Prefab },
    ];

    private _actView: any;
    private _actType: number;
    private _isExchangeTask: boolean;
    private _customActUnitData: any;
    private _listDatas: any;
    private _resetListData: any;
    private _refreshHandler: any;

    // public static waitEnterMsg(callBack, param) {

    // }

    setInitData(actView, actType) {
        this._actView = actView;
        this._actType = actType;
        this._isExchangeTask = false;
        this._customActUnitData = null;
        this._listDatas = null;
        this._resetListData = null;
    }
    onCreate() {

    }
    onEnter() {
        this._startRefreshHandler();
    }
    onExit() {
        this._endRefreshHandler();
    }
    _startRefreshHandler() {
        if (this._refreshHandler != null) {
            return;
        }
        this._refreshHandler = handler(this, this._onRefreshTick)
        this.schedule(this._refreshHandler, 1);
    }
    _endRefreshHandler() {
        if (this._refreshHandler != null) {
            this.unschedule(this._refreshHandler);
            this._refreshHandler = null;
        }
    }
    _onRefreshTick(dt) {
        var actUnitdata = this._customActUnitData;
        if (actUnitdata) {
            this._refreshActTime(actUnitdata);
        }
    }
    _refreshActTime(actUnitData) {
        if (this._listDatas && this._listDatas[1] && this._listDatas[1].actTaskUnitData.getQuest_type() == CustomActivityConst.CUSTOM_QUEST_TYPE_RESET_GUILD_ACT) {
            var endTime = G_ServerTime.secondsFromZero() + 3600 * 24;
            this._textTimeTitle.string = (Lang.get('activity_guild_sprint_downtime_title'));
            this._textTime.string = (CustomActivityUIHelper.getLeftDHMSFormat(endTime));
            return;
        }
        var timeStr = '';
        if (actUnitData.isActInRunTime()) {
            this._textTimeTitle.string = (Lang.get('activity_guild_sprint_downtime_title'));
            timeStr = CustomActivityUIHelper.getLeftDHMSFormat(actUnitData.getEnd_time());
        } else if (actUnitData.isActInPreviewTime()) {
            this._textTimeTitle.string = (Lang.get('activity_guild_sprint_uptime_title'));
            timeStr = CustomActivityUIHelper.getLeftDHMSFormat(actUnitData.getStart_time());
        } else {
            this._textTimeTitle.string = (Lang.get('activity_guild_sprint_downtime_title'));
            timeStr = CustomActivityUIHelper.getLeftDHMSFormat(actUnitData.getAward_time());
        }
        this._textTime.string = (timeStr);
    }
    _isExchangeAct() {
        return this._actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_SELL;
    }
    private _getPreLoadPrefab(data): string {
        if (data && data.actTaskUnitData.getQuest_type() == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SELL_ITEM) {
            return Path.getPrefab("CustomActivityBuyGoodsItemCell", "customActivity");
        }
        if (data && data.actTaskUnitData.getQuest_type() == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SINGLE_RECHARGE) {
            return Path.getPrefab("CustomActivitySingleRechargeItemCell", "customActivity");
        }
        if (data && data.actTaskUnitData.getQuest_type() == CustomActivityConst.CUSTOM_QUEST_TYPE_YUBI_EXCHANGE) {
            return Path.getPrefab("CustomActivityYuBiExchangeCell", "customActivity");
        }
        if (this._isExchangeAct()) {
            return Path.getPrefab("CustomActivityExchangeItemCell", "customActivity");
        } else if (this._actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PAY) {
            return Path.getPrefab("CustomActivityRechargeTaskItemCell", "customActivity");
        } else {
            return Path.getPrefab("CustomActivityTaskItemCell", "customActivity");
        }
    }

    private _lastViewCell: number = 0;
    private _getTemplate(data): cc.Node {
        if (data && data.actTaskUnitData.getQuest_type() == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SELL_ITEM) {
            {
                this._lastViewCell = 1;
                return cc.resources.get(Path.getPrefab("CustomActivityBuyGoodsItemCell", "customActivity"));
            }
        }
        if (data && data.actTaskUnitData.getQuest_type() == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SINGLE_RECHARGE) {
            {
                this._lastViewCell = 2;
                return cc.resources.get(Path.getPrefab("CustomActivitySingleRechargeItemCell", "customActivity"));
            }
        }
        if (this._isExchangeAct()) {
            this._lastViewCell = 3;
            return cc.resources.get(Path.getPrefab("CustomActivityExchangeItemCell", "customActivity"));
        } else if (this._actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PAY) {
            this._lastViewCell = 4;
            return cc.resources.get(Path.getPrefab("CustomActivityRechargeTaskItemCell", "customActivity"));
        } else {
            this._lastViewCell = 5;
            return cc.resources.get(Path.getPrefab("CustomActivityTaskItemCell", "customActivity"));
        }
    }
    private getCurTemplateIndex(data): number {
        if (data && data.actTaskUnitData.getQuest_type() == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SELL_ITEM) {
            {
                return 1;
            }
        }
        if (data && data.actTaskUnitData.getQuest_type() == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SINGLE_RECHARGE) {
            {
                return 2;
            }
        }
        if (this._isExchangeAct()) {
            return 3;
        } else if (this._actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PAY) {
            return 4;
        } else {
            return 5;
        }
        return 0;
    }
    private _getListViewData() {
        if (!this._listDatas) {
            this._pullListViewData();
        }
        return this._listDatas;
    }
    private _getCurrListViewData() {
        return this._getListViewData() || {};
    }
    private _pullListViewData() {
        if (!this._customActUnitData) {
            this._listDatas = {};
        } else {
            this._listDatas = G_UserData.getCustomActivity().getShowTaskUnitDataArrById(this._customActUnitData.getAct_id());
        }
    }
    _refreshListView(listView: CommonListView, listData: Array<any>) {
        cc.resources.load(this._getPreLoadPrefab(listData[0]), cc.Prefab, function () {
            if (!this.isValid || !this._customActUnitData) {
                return;
            }
            var curIndex = this.getCurTemplateIndex(listData[0]);
            this._listDatas = G_UserData.getCustomActivity().getShowTaskUnitDataArrById(this._customActUnitData.getAct_id());
            if (this._lastViewCell != curIndex) {
                listView.spawnCount = 4;
                listView.init(this._getTemplate(listData[0]), handler(this, this._onItemUpdate), handler(this, this._onItemSelected), handler(this, this._onItemTouch))
                listView.setData(listData.length);
                if (this._resetListData) {
                    listView.scrollView.scrollToTop();
                }
            }
            else {
                listView.setData(listData.length, 0);
            }
        }.bind(this))

    }
    _onItemUpdate(item, index) {
        var itemList = this._getCurrListViewData();
        var itemData = itemList[index];
        if (itemData)
            item.updateItem(index, [itemData]);
        else
            item.updateItem(index, null);

    }
    _onItemSelected(index, itemPos) {
        cc.warn('CustomActivityTaskView:_onItemTouch ' + ((index) + (' ' + (itemPos))));
        var itemList = this._getCurrListViewData();
        var itemData = itemList[itemPos];
        if (!itemData) {
            return;
        }
        if (!this._customActUnitData.checkActIsVisible()) {
            G_Prompt.showTip(Lang.get('customactivity_tips_already_finish'));
            return;
        }
        var actTaskUnitData = itemData.actTaskUnitData;
        var reachReceiveCondition = G_UserData.getCustomActivity().isTaskReachReceiveCondition(actTaskUnitData.getAct_id(), actTaskUnitData.getId());
        var canReceive = G_UserData.getCustomActivity().isTaskCanReceived(actTaskUnitData.getAct_id(), actTaskUnitData.getId());
        var functionId = this._customActUnitData.getFunctionId();
        if (reachReceiveCondition) {
            if (canReceive) {
                if (!this._checkRes(actTaskUnitData)) {
                    return;
                }
                if (this._isSingleGoodExchange(actTaskUnitData)) {
                    UIPopupHelper.popupExchangeItemsExt(actTaskUnitData);
                    return;
                }
                if (actTaskUnitData.isSelectReward()) {
                    this._showSelectRewarsPopup(actTaskUnitData);
                    return;
                }
                if (this._checkPkgFull(actTaskUnitData)) {
                    G_UserData.getCustomActivity().c2sGetCustomActivityAward(actTaskUnitData.getAct_id(), actTaskUnitData.getId(), null, null);
                }
            }
        } else {
            if (functionId != 0) {
                WayFuncDataHelper.gotoModuleByFuncId(functionId);
            } else if (actTaskUnitData.getQuest_type() == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SELL_ITEM) {
                var payId = actTaskUnitData.getParam2();
                var VipPay = G_ConfigLoader.getConfig(ConfigNameConst.VIP_PAY);
                var payCfg = VipPay.get(payId);
                //assert((payCfg, 'vip_pay not find id ' + (payId));
                G_GameAgent.pay(payCfg.id, payCfg.rmb, payCfg.product_id, payCfg.name, payCfg.name);
            }
        }
    }
    _onItemTouch(index, itemPos) {
        cc.warn('CustomActivityTaskView:_onItemTouch ' + ((index) + (' ' + (itemPos))));
        var itemList = this._getCurrListViewData();
        var itemData = itemList[itemPos + 1];
        if (!itemData) {
            return;
        }
        if (!this._customActUnitData.checkActIsVisible()) {
            G_Prompt.showTip(Lang.get('customactivity_tips_already_finish'));
            return;
        }
        var actTaskUnitData = itemData.actTaskUnitData;
        var reachReceiveCondition = G_UserData.getCustomActivity().isTaskReachReceiveCondition(actTaskUnitData.getAct_id(), actTaskUnitData.getId());
        var canReceive = G_UserData.getCustomActivity().isTaskCanReceived(actTaskUnitData.getAct_id(), actTaskUnitData.getId());
        var functionId = this._customActUnitData.getFunctionId();
        if (reachReceiveCondition) {
            if (canReceive) {
                if (!this._checkRes(actTaskUnitData)) {
                    return;
                }
                if (this._isSingleGoodExchange(actTaskUnitData)) {
                    UIPopupHelper.popupExchangeItemsExt(actTaskUnitData);
                    return;
                }
                if (actTaskUnitData.isSelectReward()) {
                    this._showSelectRewarsPopup(actTaskUnitData);
                    return;
                }
                if (this._checkPkgFull(actTaskUnitData)) {
                    G_UserData.getCustomActivity().c2sGetCustomActivityAward(actTaskUnitData.getAct_id(), actTaskUnitData.getId(), null, null);
                }
            }
        } else {
            if (functionId != 0) {
                WayFuncDataHelper.gotoModuleByFuncId(functionId);
            } else if (actTaskUnitData.getQuest_type() == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SELL_ITEM) {
                var payId = actTaskUnitData.getParam2();
                var VipPay = G_ConfigLoader.getConfig(ConfigNameConst.VIP_PAY);
                var payCfg = VipPay.get(payId);
                //assert((payCfg, 'vip_pay not find id ' + (payId));
                G_GameAgent.pay(payCfg.id, payCfg.rmb, payCfg.product_id, payCfg.name, payCfg.name);
            }
        }
    }
    _checkRes(actTaskUnitData) {
        var items = actTaskUnitData.getConsumeItems();
        cc.log(items);
        var canBuy = true;
        for (var k in items) {
            var v = items[k];
            canBuy = G_UserData.getCustomActivity().isEnoughValue(v.type, v.value, v.size);
            if (!canBuy) {
                if (actTaskUnitData && actTaskUnitData.getQuest_type() == CustomActivityConst.CUSTOM_QUEST_TYPE_YUBI_EXCHANGE) {
                    G_Prompt.showTip(Lang.get('common_jade2_not_enough1'));
                } else {
                    G_Prompt.showTip(Lang.get('common_res_not_enough'));
                }
                return canBuy;
            }
        }
        return canBuy;
    }
    _hasGold(actTaskUnitData) {
        var items = actTaskUnitData.getConsumeItems();
        for (var k in items) {
            var v = items[k];
            if (v.type == TypeConvertHelper.TYPE_RESOURCE || v.value == DataConst.RES_DIAMOND) {
                return v;
            }
        }
        return null;
    }
    _isSingleGoodExchange(actTaskUnitData) {
        var fixRewards = actTaskUnitData.getRewardItems();
        var hasSelectRewards = actTaskUnitData.isSelectReward();
        return this._isExchangeAct() && !hasSelectRewards;
    }
    _checkPkgFull(actTaskUnitData, index?): boolean {
        var rewards = actTaskUnitData.getRewardItems();
        var selectRewards = actTaskUnitData.getSelectRewardItems();
        if (selectRewards && selectRewards[index]) {
            var newRewards = [];
            for (var k in rewards) {
                var v = rewards[k];
                table.insert(newRewards, v);
            }
            table.insert(newRewards, selectRewards[index]);
            rewards = newRewards;
        }
        var full = UserCheck.checkPackFullByAwards(rewards);
        return !full;
    }
    _showSelectRewarsPopup(actTaskUnitData) {
        var callBackFunction = function (awardItem, index, total) {
            var confirmFunction = function () {
                if (awardItem == null) {
                    G_Prompt.showTip(Lang.get('recruit_choose_first'));
                    return true;
                }
                if (!this._checkPkgFull(actTaskUnitData, index)) {
                    return;
                }
                var rewardIndex = index + 1;
                if (G_UserData.getCustomActivity().isActivityExpiredById(actTaskUnitData.getAct_id())) {
                    G_Prompt.showTip(Lang.get('customactivity_tips_already_finish'));
                    return;
                }
                G_UserData.getCustomActivity().c2sGetCustomActivityAward(actTaskUnitData.getAct_id(), actTaskUnitData.getId(), rewardIndex, total);
            }.bind(this)
            var goldItem = this._hasGold(actTaskUnitData);
            if (goldItem) {
                var hintStr = Lang.get('customactivity_buy_confirm', { count: goldItem.size });
                UIPopupHelper.popupConfirm(hintStr, confirmFunction);
            } else {
                confirmFunction();
            }
        }.bind(this)
        var awardItems = actTaskUnitData.getSelectRewardItems();
        if (CustomActivityConst.CUSTOM_ACTIVITY_TYPE_SELL == actTaskUnitData.getActType()) {
            var [maxValue, _, _] = actTaskUnitData.getProgressValue();
            var goldItem = this._hasGold(actTaskUnitData);
            if (goldItem) {
                var resourceNum = UserDataHelper.getNumByTypeAndValue(goldItem.type, goldItem.value);
                maxValue = goldItem.size == 0 && 0 || Math.min(Math.floor(resourceNum / goldItem.size), maxValue);
            } else {
                var items = actTaskUnitData.getConsumeItems();
                for (var i in items) {
                    var v = items[i];
                    var itemNum = UserDataHelper.getNumByTypeAndValue(v.type, v.value);
                    maxValue = Math.min(itemNum, maxValue);
                }
            }
            G_SceneManager.openPopup(Path.getCommonPrefab("PopupSelectRewardNum"), function (p: PopupSelectRewardNum) {
                p.ctor(Lang.get('popup_title_select_reward'), callBackFunction);
                p.updateUI(awardItems);
                p.setMaxLimit(maxValue);
                p.openWithAction();
            });
        } else {
            G_SceneManager.openPopup(Path.getCommonPrefab("PopupSelectReward"), function (p: PopupSelectReward) {
                p.ctor(Lang.get('popup_title_select_reward'), callBackFunction);
                p.setTip(Lang.get("days7activity_receive_popup_tip"))
                p.updateUI(awardItems);
                p.openWithAction();
            });
        }
    }
    _refreshListData() {
        if (!this._resetListData && this._listDatas) {
            G_UserData.getCustomActivity().refreshShowTaskData(this._listDatas);
        } else {
            this._listDatas = null;
            var listViewData = this._getListViewData();
        }
        this._refreshListView(this._commonListView, this._listDatas);
    }
    _refreshDes() {
        if (!this._customActUnitData) {
            return;
        }
        this._textActTitle.string = (this._customActUnitData.getSub_title());
        this._createProgressRichText(this._customActUnitData.getDesc());
    }
    _createProgressRichText(msg) {
        var richMsg = CustomActivityUIHelper.getRichMsgListForHashText(msg, Colors.CUSTOM_ACT_DES_HILIGHT, null, Colors.CUSTOM_ACT_DES, null, 18);
        this._textNode.removeAllChildren();
        var widget = (new cc.Node()).addComponent(cc.RichText);
        widget.maxWidth = 450;
        widget.lineHeight = 20;
        widget.node.setAnchorPoint(new cc.Vec2(0, 1));
        this._textNode.addChild(widget.node);
        RichTextExtend.setRichText(widget, richMsg)

    }
    _refreshData() {
        this._refreshDes();
        this._refreshListData();
        if (this._customActUnitData) {
            this._refreshActTime(this._customActUnitData);
        }
    }
    refreshView(customActUnitData, resetListData) {
        var oldCustomActUnitData = this._customActUnitData;
        this._customActUnitData = customActUnitData;
        if (!oldCustomActUnitData) {
            this._resetListData = true;
        } else if (customActUnitData && oldCustomActUnitData.getAct_id() != customActUnitData.getAct_id()) {
            this._resetListData = true;
        } else {
            if (resetListData == null) {
                this._resetListData = true;
            } else {
                this._resetListData = resetListData;
            }
        }
        this._refreshData();
    }


}