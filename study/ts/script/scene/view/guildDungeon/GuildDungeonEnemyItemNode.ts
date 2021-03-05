const { ccclass, property } = cc._decorator;

import GuildDungeonFightRecordNode from './GuildDungeonFightRecordNode'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import UIHelper from '../../../utils/UIHelper';
import { Colors } from '../../../init';

@ccclass
export default class GuildDungeonEnemyItemNode extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBg: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: GuildDungeonFightRecordNode,
        visible: true
    })
    _record01: GuildDungeonFightRecordNode = null;

    @property({
        type: GuildDungeonFightRecordNode,
        visible: true
    })
    _record02: GuildDungeonFightRecordNode = null;

    @property({
        type: GuildDungeonFightRecordNode,
        visible: true
    })
    _record03: GuildDungeonFightRecordNode = null;
    _recordNodeList: GuildDungeonFightRecordNode[];
    _data: any;


    onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this._recordNodeList = [
            this._record01,
            this._record02,
            this._record03
        ];
    }
    updateData(data, index) {
        this._data = data;
        var recordList = data.recordList;
        var memberList = data.memberList;
        var monster = data.monsterBattleUser;
        var rank = data.rank;
        var name = data.name;
        this._imageBg.node.active = (index % 2 == 0);
        this._textName.string = ((rank).toString() + ('.' + name));
        this._textName.node.color = (Colors.getOfficialColor(monster.getUser().getOfficer_level()));
        UIHelper.updateTextOfficialOutline(this._textName.node, monster.getUser().getOfficer_level());
        for (var k in this._recordNodeList) {
            var v = this._recordNodeList[k];
            var record = recordList[k];
            var member = memberList[k];
            if (record) {
                var attackName = null;
                if (member) {
                    attackName = (parseInt(member.getRankPower()) + 1).toString() + ('.' + record.getPlayer_name());
                } else {
                    attackName = record.getPlayer_name();
                }
                v.updateView(record.isIs_win(), attackName, Colors.getOfficialColor(record.getPlayer_officer()), Colors.getOfficialColorOutlineEx(record.getPlayer_officer()));
            } else {
                v.updateToEmptyRecordView();
            }
        }
    }
}