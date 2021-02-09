import ViewBase from "../../ViewBase";
import { G_SignalManager, G_UserData, G_SceneManager, G_NetworkManager } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import { handler } from "../../../utils/handler";
import { ReportParser } from "../../../fight/report/ReportParser";
import { BattleDataHelper } from "../../../utils/data/BattleDataHelper";
import { GuildDungeonDataHelper } from "../../../utils/data/GuildDungeonDataHelper";
import { MessageIDConst } from "../../../const/MessageIDConst";
import { Util } from "../../../utils/Util";
import GuildDungeonPlaybackItemNode from "./GuildDungeonPlaybackItemNode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildDungeonPlaybackNode extends ViewBase {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRoot: cc.Sprite = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listItemSource: cc.ScrollView = null;
    _listData: any;
    _signalGetArenaBattleReport;
    _signalGuildDungeonRecordSyn;
    _signalGuildDungeonMonsterGet;


    onCreate() {
        // var GuildDungeonPlaybackItemNode = require('GuildDungeonPlaybackItemNode');
        // this._listItemSource.setTemplate(GuildDungeonPlaybackItemNode);
        // this._listItemSource.setCallback(handler(this, this._onItemUpdate), handler(this, this._onItemSelected));
        // this._listItemSource.setCustomCallback(handler(this, this._onItemTouch));
    }
    onEnter() {
        this._signalGetArenaBattleReport = G_SignalManager.add(SignalConst.EVENT_GET_ARENA_BATTLE_REPORT, handler(this, this._onEventGetArenaBattleReport));
        this._signalGuildDungeonRecordSyn = G_SignalManager.add(SignalConst.EVENT_GUILD_DUNGEON_RECORD_SYN, handler(this, this._onEventGuildDungeonRecordSyn));
        this._signalGuildDungeonMonsterGet = G_SignalManager.add(SignalConst.EVENT_GUILD_DUNGEON_MONSTER_GET, handler(this, this._onEventGuildDungeonMonsterGet));
        this._updateList();
    }
    onExit() {
        this._signalGetArenaBattleReport.remove();
        this._signalGetArenaBattleReport = null;
        this._signalGuildDungeonRecordSyn.remove();
        this._signalGuildDungeonRecordSyn = null;
        this._signalGuildDungeonMonsterGet.remove();
        this._signalGuildDungeonMonsterGet = null;
        this.unschedule(this.updateEnemyList);
    }
    _onEventGetArenaBattleReport(id, message) {
        var reportId = message.battle_report;
        function enterFightView(message) {
            var battleReport = G_UserData.getFightReport().getReport();
            var fightReportData = G_UserData.getFightReport();
            var reportData = ReportParser.parse(battleReport);
            var isWin = fightReportData.isWin();
            var battleData = BattleDataHelper.parseGuildDungeonBattleReportData(message.battle_report, fightReportData.getLeftName(), fightReportData.getLeftOfficerLevel(), fightReportData.getRightName(), fightReportData.getRightOfficerLevel(), isWin);
            G_SceneManager.showScene('fight', reportData, battleData);
        }
        G_SceneManager.registerGetReport(reportId, function () {
            enterFightView(message);
        });
    }
    _onEventGuildDungeonRecordSyn(event) {
        this._updateList();
    }
    _onEventGuildDungeonMonsterGet(event) {
        this._updateList();
    }
    updateView() {
    }

    private count = 0;
    private recordIndex = 0;
    private curY = 0;
    _updateList() {
        this._listData = GuildDungeonDataHelper.getGuildDungeonSortedRecordList();
        this._listItemSource.content.removeAllChildren();
        this._listItemSource.content.height = 414;

        this.count = 0;
        this.recordIndex = 0;
        this.curY = 0;
        this.updateEnemyList();
        this.schedule(this.updateEnemyList, 0.1);


        // this._listItemSource.clearAll();
        // this._listItemSource.resize(this._listData.length);
    }

    private updateEnemyList() {
        this.count = 0;
        for (let i = this.recordIndex; i < this._listData.length; i++) {
            let cell = Util.getNode("prefab/guildDungeon/GuildDungeonPlaybackItemNode", GuildDungeonPlaybackItemNode) as GuildDungeonPlaybackItemNode;
            this._listItemSource.content.addChild(cell.node);
            cell.setIdx(i);
            cell.setCustomCallback(handler(this, this._onItemTouch));
            cell.updateData(this._listData[i], i);
            cell.node.x = 0;
            cell.node.y = (-i - 1) * 60;
            this.curY = Math.abs(cell.node.y) > 414 ? Math.abs(cell.node.y) : 414;

            this.recordIndex++;
            this.count++;
            if (this.count > 0) {
                break;
            }
        }

        if (this.recordIndex >= this._listData.length) {
            this.unschedule(this.updateEnemyList);
            this._listItemSource.content.height = this.curY;
        }
    }

    _onItemUpdate(item, index) {
        if (this._listData[index + 1]) {
            item.update(this._listData[index + 1], index + 1);
        }
    }
    _onItemSelected(item, index) {
    }
    _onItemTouch(index, reportId) {
        var data = this._listData[index];
        if (data) {
            G_NetworkManager.send(MessageIDConst.ID_C2S_GetBattleReport, { id: reportId });
        }
    }

}