import ViewBase from "../../ViewBase";
import { G_SignalManager } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import { handler } from "../../../utils/handler";
import { GuildWarDataHelper } from "../../../utils/data/GuildWarDataHelper";
import { GuildWarConst } from "../../../const/GuildWarConst";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildWarHurtRankListNode extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _listItemSource: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _myGuildRankNode: cc.Node = null;

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
        type: cc.Sprite,
        visible: true
    })
    _imageTaskTitle: cc.Sprite = null;
    _cityId: any;
    _myGuildRankItem: any;
    _listData: any[];
    _crystalConfig: any;
    _signalGuildWarBattleInfoSyn: any;
    _signalGuildWarBattleInfoGet: any;
    _signalGuildWarRankChange: any;

    initData(cityId) {
        this._cityId = cityId;
        this._myGuildRankItem = null;
        this._listData = [];
        this._crystalConfig = null;
    }
    onCreate() {
        this._refreshData();
        // var GuildWarHurtRankNode = require('GuildWarHurtRankNode');
        // this._listItemSource.setTemplate(GuildWarHurtRankNode);
        // this._listItemSource.setCallback(handler(this, this._onItemUpdate), handler(this, this._onItemSelected));
        // this._listItemSource.setCustomCallback(handler(this, this._onItemTouch));
        // this._myGuildRankItem = new GuildWarHurtRankNode();
        // this._myGuildRankNode.addChild(this._myGuildRankItem);
    }
    onEnter() {
        this._signalGuildWarBattleInfoSyn = G_SignalManager.add(SignalConst.EVENT_GUILD_WAR_BATTLE_INFO_SYN, handler(this, this._onEventGuildWarBattleInfoSyn));
        this._signalGuildWarBattleInfoGet = G_SignalManager.add(SignalConst.EVENT_GUILD_WAR_BATTLE_INFO_GET, handler(this, this._onEventGuildWarBattleInfoGet));
        this._signalGuildWarRankChange = G_SignalManager.add(SignalConst.EVENT_GUILD_WAR_RANK_CHANGE, handler(this, this._onEventGuildWarBattleRankChange));
        this._updateView();
    }
    onExit() {
        this._signalGuildWarBattleInfoSyn.remove();
        this._signalGuildWarBattleInfoSyn = null;
        this._signalGuildWarBattleInfoGet.remove();
        this._signalGuildWarBattleInfoGet = null;
        this._signalGuildWarRankChange.remove();
        this._signalGuildWarRankChange = null;
    }
    _onEventGuildWarBattleInfoSyn(event) {
    }
    _onEventGuildWarBattleRankChange(event) {
        this._updateList();
    }
    _onEventGuildWarBattleInfoGet(event, cityId) {
        this._cityId = cityId;
        this._refreshData();
        this._updateView();
    }
    _updateList() {
        this._listData = GuildWarDataHelper.getGuildWarHurtRankList();
        // this._listItemSource.clearAll();
        // this._listItemSource.resize(math.min(this._listData.length, GuildWarHurtRankListNode.SHOW_RANK_NUM));
    }
    _onItemUpdate(item, index) {
        if (this._listData[index + 1]) {
            item.updateUI(this._listData[index + 1], index + 1, this._crystalConfig.build_hp, false);
        }
    }
    _onItemSelected(item, index) {
    }
    _onItemTouch(index) {
    }
    _refreshData() {
        var pointId = GuildWarDataHelper.getPointIdByCityIdPointType(this._cityId, GuildWarConst.POINT_TYPE_CRYSTAL);
        this._crystalConfig = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(this._cityId, pointId);
    }
    _refreshMyGuildRank() {
        var rankData = GuildWarDataHelper.getMyGuildWarRankData(this._listData);
        if (!rankData) {
            this._myGuildRankItem.setVisible(false);
            return;
        }
        this._myGuildRankItem.setVisible(true);
        this._myGuildRankItem.updateUI(rankData, 1, this._crystalConfig.build_hp);
    }
    _updateView() {
        this._updateList();
        this._refreshMyGuildRank();
    }

}