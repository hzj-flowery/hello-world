const { ccclass, property } = cc._decorator;

import CommonRankIcon from '../../../ui/component/CommonRankIcon'

import CommonResourceInfo from '../../../ui/component/CommonResourceInfo'

import CommonTabGroupSmallHorizon from '../../../ui/component/CommonTabGroupSmallHorizon'

import CommonNormalMidPop from '../../../ui/component/CommonNormalMidPop'
import PopupBase from '../../../ui/PopupBase';
import { G_UserData, G_SignalManager, G_SceneManager } from '../../../init';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import { SignalConst } from '../../../const/SignalConst';
import PopupSiegeRankCell from './PopupSiegeRankCell';
import ListView from '../recovery/ListView';

@ccclass
export default class PopupSiegeRank extends PopupBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBase: cc.Node = null;

    @property({
        type: CommonNormalMidPop,
        visible: true
    })
    _rankBG: CommonNormalMidPop = null;

    @property({
        type: CommonTabGroupSmallHorizon,
        visible: true
    })
    _commonTabGroupSmallHorizon: CommonTabGroupSmallHorizon = null;

    @property({
        type: ListView,
        visible: true
    })
    _listRank: ListView = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textMyRank: cc.Label = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _rankReward: CommonResourceInfo = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _rewardTitle: cc.Label = null;

    @property({
        type: CommonRankIcon,
        visible: true
    })
    _myRankIcon: CommonRankIcon = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _popupSiegeRankCellPrefab: cc.Prefab = null;

    private _data;
    private _personReward;
    private _guildReward;
    private _selectTabIndex;
    private _signalRank;
    private _signalGuildRank;
    private _rankData;
    private _type;

    public init(personReward, guildReward) {
        this._data = G_UserData.getSiegeRankData();
        this._personReward = personReward;
        this._guildReward = guildReward;
        this._selectTabIndex = 0;
        this._signalRank = null;
        this._signalGuildRank = null;
        this._rankData = null;
        this._type = null;
        this.setClickOtherClose(true);
    }

    public onCreate() {
        this._rankBG.setTitle(Lang.get('siege_rank_title'));
        this._rankBG.addCloseEventListener(handler(this, this._onCloseClick));
        this._initTab();
    }

    public onEnter() {
        this._refreshMyRank();
        this._signalRank = G_SignalManager.add(SignalConst.EVENT_SIEGE_RANK, handler(this, this._onEventSiegeRank));
        this._signalGuildRank = G_SignalManager.add(SignalConst.EVENT_SIEGE_GUILD_RANK, handler(this, this._onEventSiegeGuildRank));
        G_UserData.getSiegeRankData().c2sGetRebelArmyHurtRank();
        var runningScene = G_SceneManager.getRunningScene();
        runningScene.addGetUserBaseInfoEvent();
    }

    public onExit() {
        this._signalRank.remove();
        this._signalRank = null;
        this._signalGuildRank.remove();
        this._signalGuildRank = null;
    }

    private _onCloseClick() {
        this.closeWithAction();
    }

    private _refreshMyRank() {
        var myRank = G_UserData.getSiegeData().getUserRank();
        if (myRank == 0) {
            this._textMyRank.string = (Lang.get('siege_rank_no_rank'));
            this._textMyRank.node.active = true;
            this._myRankIcon.node.active = false;
        } else if (myRank < 4) {
            this._textMyRank.node.active = false;
            this._myRankIcon.node.active = true;
            this._myRankIcon.setRank(myRank);
        } else {
            this._textMyRank.string = (myRank).toString();
            this._textMyRank.node.active = true;
            this._myRankIcon.node.active = false;
        }
        if (myRank != 0) {
            var reward = this._personReward;
            if (reward) {
                this._rankReward.updateUI(reward.type, reward.value, reward.size);
                this._rankReward.node.active = true;
                this._rewardTitle.node.active = true;
            }
        } else {
            this._rewardTitle.node.active = false;
            this._rankReward.node.active = false;
        }
    }

    private _refreshMyGuildRank() {
        var myGuildRank = G_UserData.getSiegeData().getUserGuildRank();
        if (myGuildRank == 0) {
            this._textMyRank.string = (Lang.get('siege_rank_no_rank'));
            this._textMyRank.node.active = true;
            this._myRankIcon.node.active = false;
        } else if (myGuildRank < 4) {
            this._myRankIcon.setRank(myGuildRank);
            this._textMyRank.node.active = false;
            this._myRankIcon.node.active = true;
        } else {
            this._textMyRank.string = (myGuildRank).toString();
            this._textMyRank.node.active = true;
            this._myRankIcon.node.active = false;
        }
        if (myGuildRank != 0) {
            var reward = this._guildReward;
            if (reward) {
                this._rankReward.updateUI(reward.type, reward.value, reward.size);
                this._rankReward.node.active = true;
                this._rewardTitle.node.active = true;
            }
        } else {
            this._rewardTitle.node.active = false;
            this._rankReward.node.active = false;
        }
    }

    private _refreshPersonRank() {
        this._listRank.clearAll();
        this._rankData = this._data.getRankDatas();
        this._type = PopupSiegeRankCell.TYPE_PERSON;
        var listView = this._listRank;
        listView.setTemplate(this._popupSiegeRankCellPrefab);
        listView.setCallback(handler(this, this._onRankUpdate));
        listView.setData(this._rankData);
    }

    private _refreshGuildRank() {
        this._listRank.clearAll();
        this._rankData = this._data.getGuildRankDatas();
        this._type = PopupSiegeRankCell.TYPE_GUILD;
        var listView = this._listRank;
        listView.setTemplate(this._popupSiegeRankCellPrefab);
        listView.setCallback(handler(this, this._onRankUpdate));
        listView.setData(this._rankData);
    }

    private _onRankUpdate(node:cc.Node, index) {
        let item:PopupSiegeRankCell = node.getComponent(PopupSiegeRankCell);
        var rankData = this._rankData;
        if (rankData.length > 0) {
            item.refreshInfo(rankData[index], this._type);
        }
    }

    private _onItemSelected(item, index) {
    }

    private _initTab() {
        var param = {
            callback: handler(this, this._onTabSelect),
            isVertical: 2,
            offset: 2,
            textList: [
                Lang.get('siege_rank_type1'),
                Lang.get('siege_rank_type2')
            ]
        };
        this._commonTabGroupSmallHorizon.recreateTabs(param);
        this._refreshPersonRank();
    }

    private _onTabSelect(index) {
        if (this._selectTabIndex == index) {
            return;
        }
        this._selectTabIndex = index;
        if (index == 0) {
            G_UserData.getSiegeRankData().c2sGetRebelArmyHurtRank();
            this._refreshMyRank();
        } else if (index == 1) {
            G_UserData.getSiegeRankData().c2sGetRebelArmyGuildHurtRank();
            this._refreshMyGuildRank();
        }
    }

    private _onEventSiegeRank() {
        this._refreshPersonRank();
    }

    private _onEventSiegeGuildRank() {
        this._refreshGuildRank();
    }
}