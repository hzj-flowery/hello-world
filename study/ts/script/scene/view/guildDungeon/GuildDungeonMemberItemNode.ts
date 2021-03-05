const { ccclass, property } = cc._decorator;

import GuildDungeonFightRecordNode from './GuildDungeonFightRecordNode'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { G_UserData, Colors } from '../../../init';
import { Path } from '../../../utils/Path';
import UIHelper from '../../../utils/UIHelper';

@ccclass
export default class GuildDungeonMemberItemNode extends ListViewCellBase {

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
        type: cc.Sprite,
        visible: true
    })
    _imageOfficial: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPoint: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRank: cc.Label = null;

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
        var member = data.member;
        var rank = parseInt(data.rank);
        var [officialName, officialColor, officialInfo] = UserDataHelper.getOfficialInfo(member.getOfficer_level())
        if (index == 35) {
            // dump(member);
        }
        this._imageBg.node.active = (index % 2 == 0);
        this._textRank.string = (((rank + 1).toString()) + '.');
        this._textRank.node.color = (officialColor);
        UIHelper.loadTexture(this._imageOfficial, Path.getTextHero(officialInfo.picture));
        // this._imageOfficial.loadTexture();
        this._imageOfficial.sizeMode = cc.Sprite.SizeMode.RAW;
        this._textName.string = (member.getName());
        this._textName.node.color = (officialColor);
        this._textPoint.string = ((member.getDungeon_point().toString()));
        for (var k in this._recordNodeList) {
            var v = this._recordNodeList[k];
            var record = recordList[k];
            if (record) {
                v.updateView(record.isIs_win(), (parseInt(record.getTarget_rank())).toString() + ('.' + record.getTarget_name()), Colors.getOfficialColor(record.getTarget_officer()), Colors.getOfficialColorOutlineEx(record.getTarget_officer()));
            } else {
                v.updateToEmptyRecordView();
            }
        }
    }

}