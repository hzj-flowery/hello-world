import ViewBase from "../../ViewBase";
import { handler } from "../../../utils/handler";
import { G_SignalManager } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { GuildDungeonDataHelper } from "../../../utils/data/GuildDungeonDataHelper";
import GuildDungeonEnemyItemNode from "./GuildDungeonEnemyItemNode";
import { Util } from "../../../utils/Util";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildDungeonEnemyNode extends ViewBase {

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
    _listData: any[];
    _signalGuildDungeonRecordSyn: any;
    _signalGuildDungeonMonsterGet: any;

    onCreate() {
        // var GuildDungeonEnemyItemNode = require('GuildDungeonEnemyItemNode');
        // this._listItemSource.setTemplate(GuildDungeonEnemyItemNode);
        // this._listItemSource.setCallback(handler(this, this._onItemUpdate), handler(this, this._onItemSelected));
        // this._listItemSource.setCustomCallback(handler(this, this._onItemTouch));
    }
    onEnter() {
        this._signalGuildDungeonRecordSyn = G_SignalManager.add(SignalConst.EVENT_GUILD_DUNGEON_RECORD_SYN, handler(this, this._onEventGuildDungeonRecordSyn));
        this._signalGuildDungeonMonsterGet = G_SignalManager.add(SignalConst.EVENT_GUILD_DUNGEON_MONSTER_GET, handler(this, this._onEventGuildDungeonMonsterGet));
        this._updateList();
    }
    onExit() {
        this._signalGuildDungeonRecordSyn.remove();
        this._signalGuildDungeonRecordSyn = null;
        this._signalGuildDungeonMonsterGet.remove();
        this._signalGuildDungeonMonsterGet = null;
        this.unschedule(this.updateEnemyList);
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
        this._listData = GuildDungeonDataHelper.getGuildDungeonMonsterList();
        this._listItemSource.content.removeAllChildren();
        this._listItemSource.content.height = 414;
        this.count = 0;
        this.recordIndex = 0;
        this.curY = 0;
        this.updateEnemyList();
        this.schedule(this.updateEnemyList, 0.1);
    }

    private updateEnemyList() {
        this.count = 0;
        for (let i = this.recordIndex; i < this._listData.length; i++) {
            let cell = Util.getNode("prefab/guildDungeon/GuildDungeonEnemyItemNode", GuildDungeonEnemyItemNode) as GuildDungeonEnemyItemNode;
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
    _onItemTouch(index) {
    }

}