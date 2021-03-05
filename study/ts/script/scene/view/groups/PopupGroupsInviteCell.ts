const { ccclass, property } = cc._decorator;

import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight'
import CommonHeadFrame from '../../../ui/component/CommonHeadFrame'
import CommonHeroIcon from '../../../ui/component/CommonHeroIcon'
import CommonPlayerName from '../../../ui/component/CommonPlayerName'
import { Lang } from '../../../lang/Lang';
import { Colors, G_UserData } from '../../../init';
import { TextHelper } from '../../../utils/TextHelper';
import UIHelper from '../../../utils/UIHelper';
import { Path } from '../../../utils/Path';

@ccclass
export default class PopupGroupsInviteCell extends cc.Component {

    @property({ type: cc.Node, visible: true })
    _resourceNode: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _bg: cc.Sprite = null;

    @property({ type: CommonPlayerName, visible: true })
    _playerName: CommonPlayerName = null;

    @property({ type: cc.Label, visible: true })
    _powerNum: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _guildName: cc.Label = null;

    @property({ type: CommonHeroIcon, visible: true })
    _icon: CommonHeroIcon = null;

    @property({ type: CommonHeadFrame, visible: true })
    _commonHeadFrame: CommonHeadFrame = null;

    @property({ type: cc.Label, visible: true })
    _btnText: cc.Label = null;

    @property({ type: CommonButtonLevel1Highlight, visible: true })
    _btnOk: CommonButtonLevel1Highlight = null;

    @property({ type: cc.Sprite, visible: true })
    _btnImg: cc.Sprite = null;

    private _data;
    private _customCallback;
    private _index;

    public onLoad() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this._btnText.string = (Lang.get('groups_level_different'));
        this._btnOk.setString(Lang.get('groups_invite'));
    }

    public updateUI(index, data) {

        this._index = index;
        this._data = data;

        this._btnOk.setVisible(false);
        this._btnText.node.active = (false);
        this._btnImg.node.active = (false);

        var covertId = data.covertId;
        var limitLevel = data.limitLevel;
        var userId = data.userId;
        var guildName = data.guildName;
        var playerName = data.playerName;
        var officerLevel = data.officerLevel;
        var level = data.level;
        var power = data.power;
        var maxLv = data.maxLv;
        var minLv = data.minLv;
        this._icon.updateUI(covertId, null, limitLevel);
        this._commonHeadFrame.updateUI(data.head_frame_id, this._icon.node.scale);
        this._commonHeadFrame.setLevel(level);
        this._playerName.updateUI(playerName, officerLevel);
        if (guildName && guildName != '') {
            this._guildName.string = (guildName);
            this._guildName.node.color = (Colors.BRIGHT_BG_ONE);
        } else {
            this._guildName.string = (Lang.get('siege_rank_no_crops'));
            this._guildName.node.color = (Colors.BRIGHT_BG_RED);
        }
        this._powerNum.string = (TextHelper.getAmountText(power));
        this._btnOk.setVisible(false);
        this._btnText.node.active = (false);
        this._btnImg.node.active = (false);
        if (level > maxLv || level < minLv) {
            this._btnText.node.active = (true);
            return;
        }
        if (G_UserData.getGroups().getMyGroupData().getInviteUserData(userId)) {
            this._btnImg.node.active = (true);
            return;
        }
        this._btnOk.setVisible(true);
        if (index % 2 != 0) {
            UIHelper.loadTexture(this._bg, Path.getUICommon('img_com_board_list02a'));
        } else {
            UIHelper.loadTexture(this._bg, Path.getUICommon('img_com_board_list02b'));
        }
    }

    public onBtnOk() {
        var userId = this._data.userId;
        if (this._customCallback) {
            this._customCallback(this._index, userId);
        }
    }

    public setCustomCallback(customCallback: Function) {
        this._customCallback = customCallback;
    }
}