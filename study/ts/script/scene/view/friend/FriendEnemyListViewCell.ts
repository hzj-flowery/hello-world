const {ccclass, property} = cc._decorator;

import CommonHeroIcon from '../../../ui/component/CommonHeroIcon'

import CommonPlayerName from '../../../ui/component/CommonPlayerName'

import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import UIHelper from '../../../utils/UIHelper';
import { Lang } from '../../../lang/Lang';
import { Path } from '../../../utils/Path';
import { G_UserData, Colors, G_Prompt } from '../../../init';
import { TextHelper } from '../../../utils/TextHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { EnemyHelper } from './EnemyHelper';

@ccclass
export default class FriendEnemyListViewCell extends ListViewCellBase {

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
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _btnRevenge: CommonButtonLevel1Highlight = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _stateText: cc.Label = null;

    @property({
        type: CommonPlayerName,
        visible: true
    })
    _playerName: CommonPlayerName = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _powerNum: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _guildName: cc.Label = null;

    @property({
        type: CommonHeroIcon,
        visible: true
    })
    _icon: CommonHeroIcon = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _mineName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _enemyFight: cc.Label = null;

    _data: any;

 
    onInit(){
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }
    onCreate() {
        this.onInit();
        UIHelper.addEventListener(this.node, this._btnRevenge._button, 'FriendEnemyListViewCell', '_onBtnRevenge');
        this._btnRevenge.setString(Lang.get('lang_friend_enemy_btn_fight'));
    }
    updateUI(data, index) {
        this._data = data;
        if (index % 2 == 1) {
            UIHelper.loadTexture(this._bg, Path.getComplexRankUI('img_com_ranking04'));
        } else if (index % 2 == 0) {
            UIHelper.loadTexture(this._bg, Path.getComplexRankUI('img_com_ranking05'));
        }
        this._icon.updateUI(data.getCovertId());
        this._icon.updateHeadFrame(data.getHead_frame_id());
        this._icon.setLevel(data.getLevel());
        this._icon.setCallBack(function () {
            if (this._data) {
                G_UserData.getBase().c2sGetUserBaseInfo(this._data.getUid());
            }
        });
        this._icon.setTouchEnabled(true);
        this._playerName.updateUI(data.getName(), data.getOffice_level());
        var guildName = data.getGuild_name();
        if (guildName && guildName != '') {
            this._guildName.string = (guildName);
            this._guildName.node.color = (Colors.BRIGHT_BG_TWO);
        } else {
            this._guildName.string = (Lang.get('siege_rank_no_crops'));
            this._guildName.node.color = (Colors.BRIGHT_BG_RED);
        }
        this._powerNum.string = (TextHelper.getAmountText(data.getPower()));
        var [onlineText, color] = UserDataHelper.getOnlineText(data.getOnline());
        this._stateText.string = (onlineText);
        this._stateText.node.color = (color);
        var mineName = data.getMine_name();
        if (mineName && mineName != '') {
            this._mineName.string = (mineName);
            this._mineName.node.color = (Colors.BRIGHT_BG_TWO);
        } else {
            this._mineName.string = (Lang.get('lang_friend_enemy_empty_mine_name'));
            this._mineName.node.color = (Colors.BRIGHT_BG_RED);
        }
        this._enemyFight.string = (data.getEnemy_value());
    }
    _onBtnRevenge() {
        if (this._data) {
            if (G_UserData.getEnemy().getCount() >= EnemyHelper.getDayMaxRevengeNum()) {
                G_Prompt.showTip(Lang.get('lang_friend_enemy_revenge_num_zero'));
                return;
            }
            var myGuildId = G_UserData.getGuild().getMyGuildId();
            if (myGuildId == this._data.getGuild_id() && myGuildId != 0) {
                G_Prompt.showTip(Lang.get('lang_friend_enemy_revenge_same_guild'));
                return;
            }
            G_UserData.getEnemy().c2sEnemyBattle(this._data.getUid());
        }
    }

}
