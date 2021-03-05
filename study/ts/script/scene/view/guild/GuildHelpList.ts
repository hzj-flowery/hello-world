const { ccclass, property } = cc._decorator;

import { BuyCountIDConst } from '../../../const/BuyCountIDConst';
import { SignalConst } from '../../../const/SignalConst';
import VipFunctionIDConst from '../../../const/VipFunctionIDConst';
import { G_SignalManager, G_UserData, G_Prompt } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonEmptyListNode from '../../../ui/component/CommonEmptyListNode';
import { PopupGetRewards } from '../../../ui/PopupGetRewards';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { handler } from '../../../utils/handler';
import ViewBase from '../../ViewBase';
import GuildHelpListCell from './GuildHelpListCell';
import CommonListView from '../../../ui/component/CommonListView';

@ccclass
export default class GuildHelpList extends ViewBase {

    @property({
        type: CommonListView,
        visible: true
    })
    _listItemSource: CommonListView = null;

    @property({
        type: CommonEmptyListNode,
        visible: true
    })
    _nodeEmpty: CommonEmptyListNode = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textHelpTitle: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCount: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCdTime: cc.Label = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _cell: cc.Prefab = null;

    _signalGuildGetHelpList;
    _signalGuildSurHelpSuccess;
    _signalCommonCountChange;
    _refreshHandler: any;
    _guildHelpList: any;
    _reqData: any;

    onCreate() {
        // this._listItemSource.setTemplate(GuildHelpListCell);
        // this._listItemSource.setCallback(handler(this, this._onItemUpdate), handler(this, this._onItemSelected));
        // this._listItemSource.setCustomCallback(handler(this, this._onItemTouch));
        this._listItemSource.init(this._cell, handler(this, this._onItemUpdate), handler(this, this._onItemTouch));
        this._textCdTime.node.active = (false);
    }
    onEnter() {
        this._signalGuildGetHelpList = G_SignalManager.add(SignalConst.EVENT_GUILD_GET_HELP_LIST_SUCCESS, handler(this, this._onEventGuildGetHelpList));
        this._signalGuildSurHelpSuccess = G_SignalManager.add(SignalConst.EVENT_GUILD_SUR_HELP_SUCCESS, handler(this, this._surHelpSuccess));
        this._signalCommonCountChange = G_SignalManager.add(SignalConst.EVENT_COMMON_COUNT_CHANGE, handler(this, this._onEventCommonCountChange));
        this._startRefreshHandler();
    }
    onExit() {
        this._signalGuildGetHelpList.remove();
        this._signalGuildGetHelpList = null;
        this._signalGuildSurHelpSuccess.remove();
        this._signalGuildSurHelpSuccess = null;
        this._signalCommonCountChange.remove();
        this._signalCommonCountChange = null;
        this._endRefreshHandler();
    }
    _startRefreshHandler() {
        this.schedule(this._onRefreshTick, 1);
    }
    _endRefreshHandler() {
        this.unschedule(this._onRefreshTick);
    }
    _onRefreshTick(dt) {
        this._updateCDTime();
    }
    updateView() {
        G_UserData.getGuild().c2sGetGuildHelp();
    }
    _updateInfo(reset:boolean) {
        this._updateList(reset);
        var count = G_UserData.getGuild().getUserGuildInfo().getAsk_help_cnt();
        var buyCount = G_UserData.getGuild().getUserGuildInfo().getAsk_help_buy();
        var showFreeCount = count > 0 && buyCount <= 0;
        if (showFreeCount) {
            var times = UserDataHelper.getSupportTimes();
            this._textCount.string = (count + (' / ' + times));
            this._textHelpTitle.string = (Lang.get('guild_help_free_count_title'));
        } else {
            var [currentValue, maxValue] = G_UserData.getVip().getVipTimesByFuncId(VipFunctionIDConst.GUILD_HELP_GOLD_BUY_COUNT);
            this._textCount.string = (currentValue - buyCount + (' / ' + currentValue));
            this._textHelpTitle.string = (Lang.get('guild_help_gold_count_title'));
        }
        var countSize = this._textCount.node.getContentSize();
        this._textCdTime.node.x = (countSize.width + this._textCount.node.x + 6);
        this._updateCDTime();
    }
    _updateCDTime() {
    }
    _updateList(reset:boolean = true) {
        this._guildHelpList = G_UserData.getGuild().getGuildHelpListBySort();
        this._listItemSource.setData(Math.ceil(this._guildHelpList.length/2), 0, reset);
        this._nodeEmpty.node.active = (this._guildHelpList.length <= 0);
    }
    _onItemUpdate(item, index, type) {

        var startIndex = index * 2 + 0;
        var endIndex = startIndex + 1;
        var itemLine = [];
        if (this._guildHelpList.length > 0) {
            for (var i = startIndex; i <= endIndex && i < this._guildHelpList.length; i++) {
                var itemData = this._guildHelpList[i];
                itemLine.push(itemData);
            }
        }
        if (itemLine.length <= 0) {
            itemLine = null;
        }
        item.updateItem(index, itemLine, type);
    }
    _onItemSelected(item, index) {
    }
    _onItemTouch(index, args) {
        let [subIndex, fragmentId] = args;
        var data = this._guildHelpList[index * 2 + subIndex];
        if (data) {
            if (!UserDataHelper.checkCanGuildHelpOther(fragmentId)) {
                return;
            }
            var count = G_UserData.getGuild().getUserGuildInfo().getAsk_help_cnt();
            if (count <= 0) {
                this._reqData = data;
                G_UserData.getGuild().c2sBuyCommonCount();
                return;
            }
            var uid = data.getMember().getUid();
            var helpNo = data.getHelp_base().getHelp_no();
            G_UserData.getGuild().c2sSurGuildHelp(uid, helpNo);
        }
    }
    _surHelpSuccess(eventName, award) {
        if (!G_UserData.getGuild().isInGuild()) {
            return;
        }
        this._updateInfo(false);
        // PopupGetRewards = PopupGetRewards();
        G_Prompt.showAwards(award);
    }
    _onEventCommonCountChange(eventName, countFunctionId) {
        if (!G_UserData.getGuild().isInGuild()) {
            return;
        }
        // var BuyCountIDConst = require('BuyCountIDConst');
        if (countFunctionId == BuyCountIDConst.GUILD_HELP && this._reqData) {
            var data = this._reqData;
            this._reqData = null;
            var uid = data.getMember().getUid();
            var helpNo = data.getHelp_base().getHelp_no();
            G_UserData.getGuild().c2sSurGuildHelp(uid, helpNo);
        }
    }
    _onEventGuildGetHelpList(event) {
        if (!G_UserData.getGuild().isInGuild()) {
            return;
        }
        this._updateInfo(true);
    }

}