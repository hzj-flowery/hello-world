const { ccclass, property } = cc._decorator;

import CommonButtonLevel2Highlight from '../../../ui/component/CommonButtonLevel2Highlight'

import GuildDungeonFightRecordNode from './GuildDungeonFightRecordNode'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { Lang } from '../../../lang/Lang';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { G_UserData, Colors, G_ServerTime } from '../../../init';
import UIHelper from '../../../utils/UIHelper';
import { Path } from '../../../utils/Path';
import CommonButtonLevel2Normal from '../../../ui/component/CommonButtonLevel2Normal';

@ccclass
export default class GuildDungeonPlaybackItemNode extends ListViewCellBase {

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
    _textRank: cc.Label = null;

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
        type: GuildDungeonFightRecordNode,
        visible: true
    })
    _record01: GuildDungeonFightRecordNode = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTime: cc.Label = null;

    @property({
        type: CommonButtonLevel2Normal,
        visible: true
    })
    _commonSeeBtn: CommonButtonLevel2Normal = null;
    _data: any;


    onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this._commonSeeBtn.setString(Lang.get('common_btn_playback'));
    }
    onButtonSee() {
        var record = this._data.record;
        var member = this._data.member;
        this.dispatchCustomCallback(record.getReport_id());
    }
    updateData(data, index) {
        this._data = data;
        var record = data.record;
        var member = data.member;
        var [officialName, officialColor, officialInfo] = UserDataHelper.getOfficialInfo(record.getPlayer_officer());
        this._imageBg.node.active = (index % 2 == 0);
        if (member) {
            this._textRank.string = (((parseInt(member.getRankPower()) + 1).toString()) + '.');
            this._textRank.node.color = (officialColor);
            UIHelper.updateTextOfficialOutline(this._textRank.node, record.getPlayer_officer());
        } else {
            this._textRank.string = ('');
        }
        UIHelper.loadTexture(this._imageOfficial, Path.getTextHero(officialInfo.picture));
        this._imageOfficial.sizeMode = cc.Sprite.SizeMode.RAW;
        this._textName.string = (record.getPlayer_name());
        this._textName.node.color = (officialColor);
        UIHelper.updateTextOfficialOutline(this._textName.node, record.getPlayer_officer());
        this._record01.updateView(record.isIs_win(), ((parseInt(record.getTarget_rank())).toString()) + ('.' + record.getTarget_name()), Colors.getOfficialColor(record.getTarget_officer()), Colors.getOfficialColorOutlineEx(record.getTarget_officer()));
        this._textTime.string = (G_ServerTime.getPassTime(record.getTime()));
    }

}