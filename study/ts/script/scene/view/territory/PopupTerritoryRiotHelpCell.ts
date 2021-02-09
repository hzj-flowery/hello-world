const { ccclass, property } = cc._decorator;

import CommonResourceInfo from '../../../ui/component/CommonResourceInfo'

import CommonHeadFrame from '../../../ui/component/CommonHeadFrame'

import CommonHeroIcon from '../../../ui/component/CommonHeroIcon'

import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { handler } from '../../../utils/handler';
import { G_UserData, Colors } from '../../../init';
import { TerritoryHelper } from './TerritoryHelper';
import { Lang } from '../../../lang/Lang';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import UIHelper from '../../../utils/UIHelper';
import { Path } from '../../../utils/Path';

@ccclass
export default class PopupTerritoryRiotHelpCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _textBg: cc.Sprite = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _commonButton: CommonButtonLevel1Highlight = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPlayerName: cc.Label = null;

    @property({
        type: CommonHeroIcon,
        visible: true
    })
    _commonIconPlayer: CommonHeroIcon = null;

    @property({
        type: CommonHeadFrame,
        visible: true
    })
    _commonHeadFrame: CommonHeadFrame = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textHelpDesc: cc.Label = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _fileNodeCost: CommonResourceInfo = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRiotName: cc.Label = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _fileNodeReward: CommonResourceInfo = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panel_help_chat: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_official_title: cc.Sprite = null;


    _intervalTime: number;
    _btnGetAward: any;
    _imageGetAward: any;
    _riotInfo: any;


    initData() {
        this._intervalTime = 1.1;
    }
    onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this._commonButton.addClickEventListenerEx(handler(this, this._onButtonClick));
    }
    updateUI(index, cellValue) {
        this._riotInfo = cellValue;
        this._updateCell();
    }
    _updateCell() {
        var territoryId = this._riotInfo.territory_id;
        var eventId = this._riotInfo.event.info_id;
        var territroyName = G_UserData.getTerritory().getTerritoryName(territoryId);
        var eventCfg = TerritoryHelper.getRiotInfo(eventId);
        var eventName = eventCfg.riot_name;
        this._textRiotName.string = (eventName);
        this._textRiotName.node.color = (Colors.getColor(eventCfg.riot_color));
        TerritoryHelper.setTextBgByColor(this._textBg, eventCfg.riot_color);
        this._commonButton.setString(Lang.get('lang_territory_riot_repress'));
        var typeItem = TypeConvertHelper.convert(parseInt(eventCfg.consume_type), parseInt(eventCfg.consume_value), parseInt(eventCfg.consume_size));
        this._fileNodeCost.updateUI(eventCfg.consume_type, eventCfg.consume_value, eventCfg.consume_size);
        this._fileNodeCost.showResName(true, Lang.get('lang_territory_patrol_cost'));
        this._fileNodeReward.setTextColorToATypeColor();
        this._fileNodeReward.updateUI(eventCfg.riot_reward_type, eventCfg.riot_reward_value, eventCfg.riot_reward_size);
        this._fileNodeReward.showResName(true, Lang.get('lang_territory_help_reward'));
        this._commonIconPlayer.updateIcon(this._riotInfo.playeInfo, null, null, null);
        this._commonHeadFrame.updateUI(this._riotInfo.head_frame_id, this._commonIconPlayer.node.scale);
        this._commonHeadFrame.setLevel(this._riotInfo.level);
        this._textPlayerName.string = (this._riotInfo.name);
        this._textPlayerName.node.color = (Colors.getOfficialColor(this._riotInfo.office_level));
        UIHelper.updateTextOfficialOutline(this._textPlayerName.node, this._riotInfo.office_level);
        var contentText = TerritoryHelper.getTerritoryHelpBubble();
        this._textHelpDesc.string = (contentText);
        this._textHelpDesc["_updateRenderData"](true);
        // var panelHelpChat = this._panel_help_chat
        // var contentSize = panelHelpChat.getChildByName("background").getContentSize();
        // contentSize.width = this._textHelpDesc.node.getContentSize().width + 30;
        this._textHelpDesc.node.parent.width = this._textHelpDesc.node.getContentSize().width + 30;
        var officialInfo = G_UserData.getBase().getOfficialInfo(this._riotInfo.office_level)[0];
        UIHelper.loadTexture(this._image_official_title, Path.getTextHero(officialInfo.picture));
        this._image_official_title.sizeMode = cc.Sprite.SizeMode.RAW;
    }
    _onButtonClick(sender) {
        this.dispatchCustomCallback(this._riotInfo);
    }

}