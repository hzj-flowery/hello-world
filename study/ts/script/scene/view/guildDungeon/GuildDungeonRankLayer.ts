import { SignalConst } from "../../../const/SignalConst";
import { G_SignalManager } from "../../../init";
import { GuildDungeonDataHelper } from "../../../utils/data/GuildDungeonDataHelper";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { handler } from "../../../utils/handler";
import { Util } from "../../../utils/Util";
import ViewBase from "../../ViewBase";
import GuildDungeonRankItem from "./GuildDungeonRankItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildDungeonRankLayer extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node_LeftTop: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageArrowBg: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageArrow: cc.Sprite = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listItemSource: cc.ScrollView = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _myGuildRankNode: cc.Node = null;

    _signalGuildDungeonRecordSyn;
    _signalGuildDungeonMonsterGet;
    _isFold: boolean;
    _listData: any;
    _myGuildRankItem: GuildDungeonRankItem;
    onCreate() {
        let res = cc.resources.get("prefab/guildDungeon/GuildDungeonRankItem");
        let node1 = cc.instantiate(res) as cc.Node;
        this._myGuildRankItem = node1.getComponent(GuildDungeonRankItem) as GuildDungeonRankItem;
        this._myGuildRankNode.addChild(this._myGuildRankItem.node);
    }
    onEnter() {
        this._signalGuildDungeonRecordSyn = G_SignalManager.add(SignalConst.EVENT_GUILD_DUNGEON_RECORD_SYN, handler(this, this._onEventGuildDungeonRecordSyn));
        this._signalGuildDungeonMonsterGet = G_SignalManager.add(SignalConst.EVENT_GUILD_DUNGEON_MONSTER_GET, handler(this, this._onEventGuildDungeonMonsterGet));

        this._updateList();
        this._refreshMyGuildRank();
    }
    onExit() {
        this._signalGuildDungeonRecordSyn.remove();
        this._signalGuildDungeonRecordSyn = null;
        this._signalGuildDungeonMonsterGet.remove();
        this._signalGuildDungeonMonsterGet = null;
    }
    _onEventGuildDungeonRecordSyn(event) {
        this._updateView();
    }
    _onEventGuildDungeonMonsterGet(event) {
        this._updateView();
    }
    _updateList() {
        this._listData = UserDataHelper.getGuildDungeonSortedRankList();
        this._listItemSource.content.removeAllChildren();
        this._listItemSource.content.height = 189;
        for (let i = 0; i < this._listData.length; i++) {
            let cell = Util.getNode("prefab/guildDungeon/GuildDungeonRankItem", GuildDungeonRankItem) as GuildDungeonRankItem;
            this._listItemSource.content.addChild(cell.node);
            cell.updateUI(this._listData[i], i);
            cell.node.x = 0;
            cell.node.y = -(1 + i) * 34;
            this._listItemSource.content.height = Math.abs(cell.node.y) > 189 ? Math.abs(cell.node.y) : 189;
        }
    }
    _onItemUpdate(item, index) {
        if (this._listData[index]) {
            item.updateUI(this._listData[index], index);
        }
    }
    _onItemSelected(item, index) {
    }
    _onItemTouch(index) {
    }
    _refreshMyGuildRank() {
        var rankData = GuildDungeonDataHelper.getMyGuildDungeonRankData();
        this._myGuildRankItem.updateUI(rankData, 1);
    }
    _closeWindow(fold) {
        this.node.stopAllActions();
        var posX = this._imageArrowBg.node.x;
        var callAction = cc.callFunc(function () {
            this._imageArrow.setScale(fold && -1 || 1);
        });
        var action = cc.moveTo(0.3, cc.v2(fold && -posX || 0, this._node_LeftTop.y));
        var runningAction = cc.sequence(action, callAction);
        this._node_LeftTop.runAction(runningAction);
    }
    _onButtonArrow(sender) {
        this._isFold = !this._isFold;
        this._closeWindow(this._isFold);
    }
    _updateView() {
        this._updateList();
        this._refreshMyGuildRank();
    }

}