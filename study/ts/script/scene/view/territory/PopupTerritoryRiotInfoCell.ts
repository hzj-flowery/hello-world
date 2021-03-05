const { ccclass, property } = cc._decorator;

import CommonIconTemplate from '../../../ui/component/CommonIconTemplate'

import CommonListViewLineItem from '../../../ui/component/CommonListViewLineItem'

import CommonButtonSwitchLevel1 from '../../../ui/component/CommonButtonSwitchLevel1'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { handler } from '../../../utils/handler';
import { TerritoryHelper } from './TerritoryHelper';
import { G_ServerTime, G_UserData, Colors } from '../../../init';
import { Lang } from '../../../lang/Lang';
import { TerritoryConst } from '../../../const/TerritoryConst';
import { Path } from '../../../utils/Path';
import UIHelper from '../../../utils/UIHelper';

@ccclass
export default class PopupTerritoryRiotInfoCell extends ListViewCellBase {

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
        type: cc.Label,
        visible: true
    })
    _textCityName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRiotName: cc.Label = null;

    @property({
        type: CommonButtonSwitchLevel1,
        visible: true
    })
    _commonButton: CommonButtonSwitchLevel1 = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCondition: cc.Label = null;

    @property({
        type: CommonListViewLineItem,
        visible: true
    })
    _listViewItem: CommonListViewLineItem = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _scrollView: cc.Node = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _commonIcon1: CommonIconTemplate = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _commonIcon2: CommonIconTemplate = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _commonIcon3: CommonIconTemplate = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _commonIcon4: CommonIconTemplate = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _commonIcon5: CommonIconTemplate = null;
    _intervalTime: number;
    _awardInfo: any;
    _imageGetAward: any;
    _btnGetAward: any;
    _riotInfo: any;


    initData() {
        this._btnGetAward = null;
        this._imageGetAward = null;
        this._awardInfo = null;
        this._intervalTime = 1.1;
    }
    onCreate() {
        this.initData();
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this.schedule(this._updateTime, 0);
        this._commonButton.addClickEventListenerEx(handler(this, this.onButtonClick));
    }
    updateUI(index, cellValue) {
        this._riotInfo = cellValue;
        this._updateName();
        this._updateReward();
        this._updateTime(0);
    }
    _updateTime(dt) {
        if (this.node.active == false) {
            return;
        }
        this._intervalTime = this._intervalTime + dt;
        if (this._intervalTime > 1 && this._riotInfo) {
            var riotEvent = this._riotInfo;
            if (riotEvent) {
                var riotNeedTime = parseInt(TerritoryHelper.getTerritoryParameter('riot_continue_time'));
                var riotEndTime = riotEvent.time + riotNeedTime;
                var riotString = G_ServerTime.getLeftSecondsString(riotEndTime);
                if (riotString == '-') {
                    this._textCondition.string = (' ');
                    return;
                }
                var pendingStr = Lang.get('lang_territory_riot_cell_time');
                this._textCondition.string = (pendingStr + (' ' + riotString));
            }
            this._intervalTime = 0;
        }
    }
    _updateName() {
        var territoryId = this._riotInfo.territory_id;
        var eventId = this._riotInfo.info_id;
        var territroyName = G_UserData.getTerritory().getTerritoryName(territoryId);
        var eventCfg = TerritoryHelper.getRiotInfo(eventId);
        var eventName = eventCfg.riot_name;
        this._textCondition.node.active = (true);
        this._textCityName.string = (territroyName + ' : ');
        this._textRiotName.string = (eventName);
        TerritoryHelper.setTextBgByColor(this._textBg, eventCfg.riot_color);
        this._textCityName.node.color = (Colors.getColor(eventCfg.riot_color));
        this._textRiotName.node.color = (Colors.getColor(eventCfg.riot_color));
        this._textRiotName.node.x = (this._textCityName.node.getContentSize().width + 15);
        var stateIndex = TerritoryHelper.getRiotEventState(this._riotInfo);
        this._commonButton.setVisible(true);
        // this.updateImageView('Image_text', { visible: false });
        this._resourceNode.getChildByName('Image_text').active = false;
        if (stateIndex == 1) {
            this._commonButton.switchToHightLight();
        } else {
            this._commonButton.switchToNormal();
        }
        this._commonButton.setString(Lang.get('lang_territory_riot_state' + stateIndex));
        this._commonButton.setEnabled(true);
        if (stateIndex == TerritoryConst.RIOT_TAKE || stateIndex == TerritoryConst.RIOT_TAKEN || stateIndex == TerritoryConst.RIOT_OVERTIME) {
            this._textCondition.node.active = (false);
        }
        if (stateIndex == TerritoryConst.RIOT_HELPED) {
            this._commonButton.setEnabled(false);
        }
        if (stateIndex == TerritoryConst.RIOT_TAKEN) {
            this._commonButton.setVisible(false);

            this._resourceNode.getChildByName('Image_text').active = true;
            UIHelper.loadTexture(this._resourceNode.getChildByName('Image_text').getComponent(cc.Sprite), Path.getTextSignet('txt_yilingqu01'));
        }
        if (stateIndex == TerritoryConst.RIOT_OVERTIME) {
            this._commonButton.setVisible(false);

            this._resourceNode.getChildByName('Image_text').active = true;
            UIHelper.loadTexture(this._resourceNode.getChildByName('Image_text').getComponent(cc.Sprite), Path.getTextSignet('txt_yichaoshi01'));

        }
    }
    _updateReward() {
        var eventId = this._riotInfo.info_id;
        var eventCfg = TerritoryHelper.getRiotInfo(eventId);
        var awardList = [];
        for (var i = 1; i <= 5; i++) {
            if (eventCfg['reward_type' + i] > 0) {
                var award: any = {};
                award.type = eventCfg['reward_type' + i];
                award.value = eventCfg['reward_value' + i];
                award.size = eventCfg['reward_size' + i];
                awardList.push(award);
            }
            this['_commonIcon' + i].node.active = (false);
        }
        this._listViewItem.updateUI(awardList);
    }
    onButtonClick(sender) {
        var stateIndex = TerritoryHelper.getRiotEventState(this._riotInfo);
        this.dispatchCustomCallback([stateIndex, this._riotInfo]);
    }

}