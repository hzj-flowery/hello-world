const {ccclass, property} = cc._decorator;

import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight'

import CommonPlayerName from '../../../ui/component/CommonPlayerName'

import CommonHeadFrame from '../../../ui/component/CommonHeadFrame'

import CommonIconTemplate from '../../../ui/component/CommonIconTemplate'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { Lang } from '../../../lang/Lang';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { Colors } from '../../../init';
import { Util } from '../../../utils/Util';
import { TextHelper } from '../../../utils/TextHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import UIHelper from '../../../utils/UIHelper';
import { Path } from '../../../utils/Path';
import { handler } from '../../../utils/handler';

@ccclass
export default class FriendSuggestCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _bg: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _guildName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _level: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _powerNum: cc.Label = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _icon: CommonIconTemplate = null;

    @property({
        type: CommonHeadFrame,
        visible: true
    })
    _commonHeadFrame: CommonHeadFrame = null;

    @property({
        type: CommonPlayerName,
        visible: true
    })
    _playerName: CommonPlayerName = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _stateText: cc.Label = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _btnAdd: CommonButtonLevel1Highlight = null;
    
    _data: any;


    onInit(){
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }
    onCreate() {
        this._btnAdd.setString(Lang.get('common_btn_add_friend'));
        this._btnAdd.addClickEventListenerExDelay(handler(this, this._onButtonAdd), 0);
    }
    updateUI(index, data) {
        this._data = data;
        this._icon.unInitUI();
        this._icon.initUI(TypeConvertHelper.TYPE_HERO, data.getCovertId());
        this._commonHeadFrame.updateUI(data.getHead_frame_id(), this._icon.node.scaleX);
        this._playerName.updateUI(data.getName(), data.getOffice_level());
        var guildName = data.getGuild_name();
        if (guildName && guildName != '') {
            this._guildName.string = (guildName);
            this._guildName.node.color = (Colors.BRIGHT_BG_ONE);
        } else {
            this._guildName.string = (Lang.get('siege_rank_no_crops'));
            this._guildName.node.color = (Colors.BRIGHT_BG_RED);
        }
        this._level.string = (Util.format('%d', data.getLevel()));
        this._powerNum.string = (TextHelper.getAmountText(data.getPower()));
        var [onlineText, color] = UserDataHelper.getOnlineText(data.getOnline());
        this._stateText.string = (onlineText);
        this._stateText.node.color = (color);
        if (index % 2 != 0) {
            UIHelper.loadTexture(this._bg,Path.getComplexRankUI('img_com_ranking04'));
        } else {
            UIHelper.loadTexture(this._bg,Path.getComplexRankUI('img_com_ranking05'));
        }
    }
    _onButtonAdd() {
        this.dispatchCustomCallback(this._data);
    }

}
