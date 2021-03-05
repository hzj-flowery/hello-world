const {ccclass, property} = cc._decorator;

import CommonResourceInfoList from '../../../ui/component/CommonResourceInfoList'

import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight'
import CommonListItem from '../../../ui/component/CommonListItem';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import { TextHelper } from '../../../utils/TextHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { Colors, G_UserData } from '../../../init';
import UIHelper from '../../../utils/UIHelper';
import CommonUI from '../../../ui/component/CommonUI';
import { Path } from '../../../utils/Path';
import { ArenaConst } from '../../../const/ArenaConst';
import { ArenaHelper } from './ArenaHelper';
import CommonHeroIcon from '../../../ui/component/CommonHeroIcon';

@ccclass
export default class PopupArenaRankCell extends CommonListItem {

   @property({
       type: cc.Node,
       visible: true
   })
   _resourceNode: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _scrollView: cc.Node = null;

   @property({
       type: CommonButtonLevel1Highlight,
       visible: true
   })
   _btnLookUp: CommonButtonLevel1Highlight = null;

   @property({
       type: CommonResourceInfoList,
       visible: true
   })
   _resInfo1: CommonResourceInfoList = null;

   @property({
       type: CommonResourceInfoList,
       visible: true
   })
   _resInfo2: CommonResourceInfoList = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _rankBg: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _rankValueBg: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textRank: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textPlayerName: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textPower: cc.Label = null;
   private _playerData:any;
onLoad() {
    var size = this._resourceNode.getContentSize();
    this.node.setContentSize(size.width, size.height);
    this._btnLookUp.setString(Lang.get('arena_top_rank_cell_btn_txt'));
    this._btnLookUp.addClickEventListenerEx(handler(this, this._onButtonClick));
}
updateUI(index, cellValue) {
    this._updatePlayerInfo(index, cellValue[0]);
}
_updatePlayerInfo(index, playerData) {
    this._playerData = playerData;
    this._textPlayerName.string = (playerData.name);
    this._textPlayerName.string = playerData.name;
    this._textPower.string = (TextHelper.getAmountText(playerData.power));
    var heroList = playerData.heros;
    var updateAvatar = function (playerData, commHero:CommonHeroIcon) {
        var [avatarBaseId, table] = UserDataHelper.convertAvatarId(playerData);
        commHero.updateIcon(table,null,null);
    }
    for (var j = 1;j<=6;j++) {
        var commHero = this._scrollView.getChildByName("content").getChildByName('Common_hero' + j) as cc.Node;
        commHero.active = (false);
    }
    for (var i=1;i<=heroList.length;i++) {
        var hero = heroList[i-1];
        if (hero != 0) {
            var commHero1 = this._scrollView.getChildByName("content").getChildByName('Common_hero' + i).getComponent(CommonHeroIcon) as CommonHeroIcon;
            if (hero < 100) {
                updateAvatar(playerData, commHero1);
            } else {
                commHero1.updateUI(hero);
            }
            commHero1.node.active = (true);
        }
    }
    var officelLevel = playerData.officer_level || 0;
    this._textPlayerName.node.color = (Colors.getOfficialColor(officelLevel));
    UIHelper.updateTextOfficialOutline(this._textPlayerName.node, officelLevel);
    var rank = playerData.rank || 0;
    if (rank <= 3 && rank > 0) {
        this._rankBg.node.addComponent(CommonUI).loadTexture(Path.getComplexRankUI('img_midsize_ranking0' + rank));
        this._rankValueBg.node.addComponent(CommonUI).loadTexture(Path.getComplexRankUI('img_qizhi0' + rank));
        this._rankValueBg.node.active = (true);
        this._textRank.string = (rank);
    } else {
        this._rankBg.node.addComponent(CommonUI).loadTexture(Path.getComplexRankUI('img_midsize_ranking04'));
        this._rankValueBg.node.active = (false);
        this._textRank.node.active = (true);
        if (rank == 0) {
            this._textRank.string = (Lang.get('arena_rank_zero'));
        } else {
            this._textRank.string = (rank);
        }
    }
    if (rank < 4 && rank > 0) {
        this._textRank.node.color = (ArenaConst.RANK_COLOR[rank]);
    } else {
        this._textRank.node.color = (Colors.BRIGHT_BG_ONE);
    }
    var awardList = ArenaHelper.getAwardListByRank(rank);
    cc.log(awardList);
    for (var i = 1;i<=awardList.length;i++) {
        var value = awardList[i-1];
        (this['_resInfo' + i] as CommonResourceInfoList).setVisible(true);
        (this['_resInfo' + i] as CommonResourceInfoList).updateUI(value.type, value.value, value.size);
        (this['_resInfo' + i] as CommonResourceInfoList).setTextColorToBTypeColor();
        (this['_resInfo' + i] as CommonResourceInfoList).setFontSize(20);
    }
}
_onButtonClick(sender) {
    cc.warn('PopupArenaRankCell:_onButtonClick');
    var curSelectedPos = this.itemID;
    if (this._playerData.user_id == G_UserData.getBase().getId()) {
        return;
    }
    this.dispatchCustomCallback(curSelectedPos);
}


}