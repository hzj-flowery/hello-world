const { ccclass, property } = cc._decorator;

import CommonIconTemplate from '../../../ui/component/CommonIconTemplate'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { Path } from '../../../utils/Path';
import UIHelper from '../../../utils/UIHelper';
import { GuildWarMemberData } from '../../../data/GuildWarMemberData';
import { GuildWarDataHelper } from '../../../utils/data/GuildWarDataHelper';
import { Lang } from '../../../lang/Lang';

@ccclass
export default class GuildWarRecordItemCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _panel: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textReward: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textAttackCrystal: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textAttackGate: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textAttack: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textKill: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true,
        override: true
    })
    _name: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _official: cc.Sprite = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _commonItemIcon: CommonIconTemplate = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRank: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBox: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textContribution: cc.Label = null;
    _data: any;
    public static CELL_SIZE = cc.size(944, 74);


    onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }
    _onButtonSee() {
        var record = this._data.record;
        var member = this._data.member;
        this.dispatchCustomCallback(record.getReport_id());
    }
    updateUI(data, index) {
        this._data = data;
        var [officialName, officialColor, officialInfo] = UserDataHelper.getOfficialInfo(data.getOfficer_level());
        this._textRank.string = ((index + 1) + '.');
        this._textRank.node.color = (officialColor);
        UIHelper.loadTexture(this._official, Path.getOfficialImg(officialInfo.picture));
        // this._official.ignoreContentAdaptWithSize(true);
        this._name.string = (data.getUser_name());
        this._name.node.color = (officialColor);
        this._textContribution.string = (data.getValue(GuildWarMemberData.KEY_CONTRIBUTION));
        this._textAttack.string = (data.getValue(GuildWarMemberData.KEY_ATTACK));
        this._textKill.string = (data.getValue(GuildWarMemberData.KEY_KILL));
        var config = GuildWarDataHelper.getRecordConfigByMerit(data.getValue(GuildWarMemberData.KEY_CONTRIBUTION));
        if (config) {
            this._commonItemIcon.unInitUI();
            this._commonItemIcon.initUI(config.type, config.value, config.size);
            this._commonItemIcon.setTouchEnabled(true);
            this._textReward.string = (Lang.get('guildwar_record_item_num', { value: config.size }));
            this._imageBox.node.active = (false);
        } else {
            this._imageBox.node.active = (true);
            this._textReward.string = (Lang.get('guildwar_record_item_num', { value: 0 }));
        }
        if (index % 2 == 0) {
            UIHelper.loadTexture(this._panel, Path.getUICommon('img_com_board_list01b'));
        } else {
            UIHelper.loadTexture(this._panel, Path.getUICommon('img_com_board_list01a'));
        }
        this._panel.node.setContentSize(GuildWarRecordItemCell.CELL_SIZE);
    }

}