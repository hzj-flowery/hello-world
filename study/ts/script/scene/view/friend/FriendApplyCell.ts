const {ccclass, property} = cc._decorator;

import CommonButtonSelect from '../../../ui/component/CommonButtonSelect'

import CommonButtonDelete from '../../../ui/component/CommonButtonDelete'

import CommonPlayerName from '../../../ui/component/CommonPlayerName'

import CommonHeadFrame from '../../../ui/component/CommonHeadFrame'

import CommonIconTemplate from '../../../ui/component/CommonIconTemplate'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { handler } from '../../../utils/handler';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { Colors } from '../../../init';
import { Lang } from '../../../lang/Lang';
import { Util } from '../../../utils/Util';
import { TextHelper } from '../../../utils/TextHelper';
import { Path } from '../../../utils/Path';
import UIHelper from '../../../utils/UIHelper';

@ccclass
export default class FriendApplyCell extends ListViewCellBase {

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
        type: CommonButtonDelete,
        visible: true
    })
    _buttonRefuse: CommonButtonDelete = null;

    @property({
        type: CommonButtonSelect,
        visible: true
    })
    _buttonAgree: CommonButtonSelect = null;
    
    _data: any;

    onInit(){
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }
    onCreate() {
        this._buttonRefuse.addClickEventListenerExDelay(handler(this, this._onButtonRefuse), 100);
        this._buttonAgree.addClickEventListenerExDelay(handler(this, this._onButtonAgree), 100);
    }
    updateUI(index, data) {
        this._data = data;
        if (this._icon.isInit()) {
            var heroIcon = this._icon.getIconTemplate();
            heroIcon.updateIcon(data.getPlayerShowInfo());
        } else {
            this._icon.unInitUI();
            this._icon.initUI(TypeConvertHelper.TYPE_HERO, data.getCovertId());
            var heroIcon = this._icon.getIconTemplate();
            heroIcon.updateIcon(data.getPlayerShowInfo());
        }
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
        if (index % 2 != 0) {
            UIHelper.loadTexture(this._bg, Path.getComplexRankUI('img_com_ranking04'));
        } else {
            UIHelper.loadTexture(this._bg, Path.getComplexRankUI('img_com_ranking05'));
        }
    }
    _onButtonAgree() {
        this.dispatchCustomCallback(this._data, true);
    }
    _onButtonRefuse() {
        this.dispatchCustomCallback(this._data, false);
    }
}
