import ViewBase from "../../ViewBase";
import { G_SignalManager, G_ResolutionManager } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import { handler } from "../../../utils/handler";
import { GuildWarDataHelper } from "../../../utils/data/GuildWarDataHelper";
import { GuildWarConst } from "../../../const/GuildWarConst";
import { Lang } from "../../../lang/Lang";
import { Util } from "../../../utils/Util";
import GuildWarTaskNode from "./GuildWarTaskNode";
import GuildWarHurtRankNode from "./GuildWarHurtRankNode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildWarTaskListNode extends ViewBase {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTaskBg: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _taskNodeParent: cc.Node = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listItemSource: cc.ScrollView = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRankBg: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageArrow: cc.Sprite = null;

    public static SHOW_RANK_NUM = 3;
    _cityId: any;
    _listData: any[];
    _buildList: any;
    _crystalConfig: any;
    _guildWarTaskNode: any;
    _isClose: boolean;
    _signalGuildWarBattleInfoSyn: any;
    _signalGuildWarBattleInfoGet: any;
    _signalGuildWarCampReverse: any;
    _signalGuildWarRankChange: any;
    _signalGuildWarBuildingChange: any;
    initData(cityId) {
        this._cityId = cityId;
        this._guildWarTaskNode = null;
        this._listData = [];
        this._crystalConfig = null;
        this._buildList = null;
        this._isClose = false;
    }
    onCreate() {
        this.node.x = -1 * G_ResolutionManager.getDesignWidth();
        this.node.y = 0.5 * G_ResolutionManager.getDesignHeight();
        var cell = Util.getNode("prefab/guildwarbattle/GuildWarTaskNode", GuildWarTaskNode) as GuildWarTaskNode;
        this._guildWarTaskNode = cell;
        this._taskNodeParent.addChild(cell.node);
        this._refreshData();
    }
    onEnter() {
        this._signalGuildWarBattleInfoSyn = G_SignalManager.add(SignalConst.EVENT_GUILD_WAR_BATTLE_INFO_SYN, handler(this, this._onEventGuildWarBattleInfoSyn));
        this._signalGuildWarBattleInfoGet = G_SignalManager.add(SignalConst.EVENT_GUILD_WAR_BATTLE_INFO_GET, handler(this, this._onEventGuildWarBattleInfoGet));
        this._signalGuildWarCampReverse = G_SignalManager.add(SignalConst.EVENT_GUILD_WAR_CAMP_REVERSE, handler(this, this._onEventGuildWarCampReverse));
        this._signalGuildWarRankChange = G_SignalManager.add(SignalConst.EVENT_GUILD_WAR_RANK_CHANGE, handler(this, this._onEventGuildWarBattleRankChange));
        this._signalGuildWarBuildingChange = G_SignalManager.add(SignalConst.EVENT_GUILD_WAR_BUILDING_CHANGE, handler(this, this._onEventGuildWarBattleBuildingChange));
        this._refreshView();
    }
    onExit() {
        this._signalGuildWarBattleInfoSyn.remove();
        this._signalGuildWarBattleInfoSyn = null;
        this._signalGuildWarBattleInfoGet.remove();
        this._signalGuildWarBattleInfoGet = null;
        this._signalGuildWarCampReverse.remove();
        this._signalGuildWarCampReverse = null;
        this._signalGuildWarRankChange.remove();
        this._signalGuildWarRankChange = null;
        this._signalGuildWarBuildingChange.remove();
        this._signalGuildWarBuildingChange = null;
    }
    _onEventGuildWarBattleInfoSyn(event) {
    }
    _onEventGuildWarBattleInfoGet(event, cityId) {
        this._cityId = cityId;
        this._refreshData();
        this._refreshView();
    }
    _onEventGuildWarCampReverse(event) {
        this._refreshTaskNodeList();
    }
    _onEventGuildWarBattleRankChange(event) {
        this._updateList();
    }
    _onEventGuildWarBattleBuildingChange(event) {
        this._refreshTaskNodeList();
    }
    _refreshData() {
        var pointId = GuildWarDataHelper.getPointIdByCityIdPointType(this._cityId, GuildWarConst.POINT_TYPE_CRYSTAL);
        this._crystalConfig = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(this._cityId, pointId);
        this._buildList = GuildWarDataHelper.getGuildWarBuildingList(this._cityId);
    }
    _refreshTaskNodeList() {
        var pointType = GuildWarConst.POINT_TYPE_CRYSTAL;
        var isDefender = GuildWarDataHelper.selfIsDefender(this._cityId);
        var taskData = null;
        if (isDefender) {
            taskData = { des: Lang.get('guildwar_point_task_des_list2')[pointType] };
        } else {
            taskData = { des: Lang.get('guildwar_point_task_des_list')[pointType] };
        }
        this._guildWarTaskNode.updateUI(taskData);
    }
    _refreshView() {
        this._refreshTaskNodeList();
        this._updateList();
    }
    _updateList() {
        this._listData = GuildWarDataHelper.getGuildWarHurtRankList();
        this._listItemSource.content.removeAllChildren();
        this._listItemSource.content.height = 0;
        var size = this._listData.length;
        for (let i = 0; i < size; i++) {
            let cell = Util.getNode("prefab/guildwarbattle/GuildWarHurtRankNode", GuildWarHurtRankNode) as GuildWarHurtRankNode;
            this._listItemSource.content.addChild(cell.node);
            cell.updateUI(this._listData[i], i, this._crystalConfig.build_hp, true)
            cell.node.x = 0;
            cell.node.y = (i + 1) * -37;
            this._listItemSource.content.height = Math.abs(cell.node.y);
        }
        if (size == 0) {
            this._imageTaskBg.node.active = (false);
            return;
        } else if (size == 1) {
            this._listItemSource.node.setContentSize(cc.size(234, 37));
        } else if (size == 2) {
            this._listItemSource.node.setContentSize(cc.size(234, 74));
        } else if (size == 3) {
            this._listItemSource.node.setContentSize(cc.size(234, 111));
        }
        this._imageTaskBg.node.active = (true);
    }
    _onItemUpdate(item, index) {
        if (this._listData[index + 1]) {
            item.updateUI(this._listData[index + 1], index + 1, this._crystalConfig.build_hp, true);
        }
    }
    _onItemSelected(item, index) {
    }
    _onItemTouch(index) {
    }
    onButtonArrow(sender) {
        var isClose = !this._isClose;
        this._setWindowState(isClose);
    }
    _setWindowState(isClose) {
        this._isClose = isClose;
        var posX = this._imageArrow.node.x;
        this._imageArrow.node.x = (this._isClose ? 100 : 276);
        this._imageArrow.node.setScale(this._isClose ? -1 : 1);
        this._imageTaskBg.node.active = (!this._isClose);
    }

}