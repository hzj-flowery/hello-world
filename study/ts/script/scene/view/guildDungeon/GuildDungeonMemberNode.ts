import ViewBase from "../../ViewBase";
import { GuildDataHelper } from "../../../utils/data/GuildDataHelper";
import { G_SignalManager } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import { handler } from "../../../utils/handler";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { Util } from "../../../utils/Util";
import GuildDungeonMemberItemNode from "./GuildDungeonMemberItemNode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildDungeonMemberNode extends ViewBase {

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
    _signalGuildDungeonRecordSyn: any;
    _signalGuildDungeonMonsterGet: any;


    onCreate() {
        // var GuildDungeonMemberItemNode = require('GuildDungeonMemberItemNode');
        // this._listItemSource.setTemplate(GuildDungeonMemberItemNode);
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
        this._listData = UserDataHelper.getGuildDungeonMemberList();
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
            let cell = Util.getNode("prefab/guildDungeon/GuildDungeonMemberItemNode", GuildDungeonMemberItemNode) as GuildDungeonMemberItemNode;
            this._listItemSource.content.addChild(cell.node);
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