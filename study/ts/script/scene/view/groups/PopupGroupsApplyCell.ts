const { ccclass, property } = cc._decorator;

import CommonButtonSelect2 from '../../../ui/component/CommonButtonSelect2'
import CommonButtonDelete2 from '../../../ui/component/CommonButtonDelete2'
import CommonPlayerName from '../../../ui/component/CommonPlayerName'
import CommonHeadFrame from '../../../ui/component/CommonHeadFrame'
import CommonHeroIcon from '../../../ui/component/CommonHeroIcon'
import { Colors, G_ServerTime } from '../../../init';
import { Lang } from '../../../lang/Lang';
import { GroupsConst } from '../../../const/GroupsConst';
import { TextHelper } from '../../../utils/TextHelper';
import UIHelper from '../../../utils/UIHelper';
import { Path } from '../../../utils/Path';
import { handler } from '../../../utils/handler';

@ccclass
export default class PopupGroupsApplyCell extends cc.Component {

    @property({ type: cc.Node, visible: true })
    _resourceNode: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _bg: cc.Sprite = null;

    @property({ type: CommonHeroIcon, visible: true })
    _icon: CommonHeroIcon = null;

    @property({ type: CommonHeadFrame, visible: true })
    _commonHeadFrame: CommonHeadFrame = null;

    @property({ type: CommonPlayerName, visible: true })
    _playerName: CommonPlayerName = null;

    @property({ type: cc.Label, visible: true })
    _powerNum: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _guildName: cc.Label = null;

    @property({ type: CommonButtonDelete2, visible: true })
    _buttonRefuse: CommonButtonDelete2 = null;

    @property({ type: CommonButtonSelect2, visible: true })
    _buttonAgree: CommonButtonSelect2 = null;

    private _data;
    private _customCallback;
    private _index;

    public onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }

    public updateUI(index, data) {
        this._index = index;
        this._data = data;

        this._icon.updateUI(data.getCovertId(), null, data.getLimitLevel());
        this._commonHeadFrame.updateUI(data.getHead_frame_id(), this._icon.node.scale);
        this._commonHeadFrame.setLevel(data.getLevel());
        this._playerName.updateUI(data.getName(), data.getOffice_level());
        var guildName = data.getGuild_name();
        if (guildName && guildName != '') {
            this._guildName.string = (guildName);
            this._guildName.node.color = (Colors.BRIGHT_BG_ONE);
        } else {
            this._guildName.string = (Lang.get('siege_rank_no_crops'));
            this._guildName.node.color = (Colors.BRIGHT_BG_RED);
        }
        this._powerNum.string = (TextHelper.getAmountText(data.getPower()));
        if (data && !data.isEndApply()) {
            var applyEndTime = data.getApplyEndTime();
            this._buttonRefuse.startCountDown(applyEndTime, handler(this, this._countDownEnd), handler(this, this._countDownFormatStr));
        }
        if (index % 2 != 0) {
            UIHelper.loadTexture(this._bg, Path.getUICommon('img_com_board_list02a'))
        } else {
            UIHelper.loadTexture(this._bg, Path.getUICommon('img_com_board_list02b'))
        }
    }

    private _countDownEnd() {
    }

    private _countDownFormatStr(endTime) {
        var time = G_ServerTime.getLeftSeconds(endTime);
        var str = '';
        if (time < 10) {
            str = ' ';
        }
        str = str + (time + 's');
        return str;
    }

    public onButtonAgree() {
        if (this._customCallback) {
            this._customCallback(this._index, 1, GroupsConst.OK);
        }
    }

    public onButtonRefuse() {
        if (this._customCallback) {
            this._customCallback(this._index, 1, GroupsConst.NO);
        }
    }

    public setCustomCallback(customCallback: Function) {
        this._customCallback = customCallback;
    }
}