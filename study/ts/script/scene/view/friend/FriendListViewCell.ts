const {ccclass, property} = cc._decorator;

import CommonHeroIcon from '../../../ui/component/CommonHeroIcon'

import CommonPlayerName from '../../../ui/component/CommonPlayerName'

import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import UIHelper from '../../../utils/UIHelper';
import { Path } from '../../../utils/Path';
import { FriendConst } from '../../../const/FriendConst';
import { G_UserData, Colors } from '../../../init';
import { TextHelper } from '../../../utils/TextHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';

@ccclass
export default class FriendListViewCell extends ListViewCellBase {

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
   _btnGive: CommonButtonLevel1Highlight = null;

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
       type: cc.Sprite,
       visible: true
   })
   _alreadyDone: cc.Sprite = null;

   
    _data: any;
    _type: any;

   onInit(){
    var size = this._resourceNode.getContentSize();
    this.node.setContentSize(size.width, size.height);
   }
    onCreate() {
        this._btnGive.setString(Lang.get('common_btn_name_confirm'));
        this._btnGive.addClickEventListenerExDelay(handler(this, this._onBtnGive), 0);
    }
    updateUI(data, type, index) {
        if (!data) {
            return;
        }
        if (index % 2 == 1) {
            UIHelper.loadTexture(this._bg, Path.getUICommon('img_com_board_list02a'));
        } else if (index % 2 == 0) {
            UIHelper.loadTexture(this._bg, Path.getUICommon('img_com_board_list02b'));
        }
        this._data = data;
        this._type = type;
        if (type == FriendConst.FRIEND_LIST) {
            if (data.isCanGivePresent()) {
                this._btnGive.setVisible(true);
                this._alreadyDone.node.active = (false);
                this._btnGive.setString(Lang.get('lang_friend_btn_give'));
            } else {
                this._alreadyDone.node.active = (true);
                UIHelper.loadTexture(this._alreadyDone, Path.getTextSignet('txt_yizengsong'));
                this._btnGive.setVisible(false);
            }
        } else if (type == FriendConst.FRIEND_ENERGY) {
            if (data.isCanGetPresent()) {
                this._btnGive.setVisible(true);
                this._alreadyDone.node.active = (false);
                this._btnGive.setString(Lang.get('lang_friend_btn_get'));
            } else {
                this._btnGive.setVisible(false);
                this._alreadyDone.node.active = (true);
                UIHelper.loadTexture(this._alreadyDone, Path.getTextSignet('txt_yizengsong'));
            }
        } else if (type == FriendConst.FRIEND_BLACK) {
            this._btnGive.setVisible(true);
            this._alreadyDone.node.active = (false);
            this._btnGive.setString(Lang.get('lang_friend_btn_remove'));
        }
        this._icon.updateIcon(data.getPlayerShowInfo(), null, data.getHead_frame_id());
        this._icon.setLevel(data.getLevel());
        this._icon.setCallBack(function () {
            if (this._data) {
                G_UserData.getBase().c2sGetUserBaseInfo(this._data.getId());
            }
        }.bind(this));
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
    }
    _onBtnGive() {
        this.dispatchCustomCallback(this._data);
    }
}
