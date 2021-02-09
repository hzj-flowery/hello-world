const {ccclass, property} = cc._decorator;

import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight'
import CommonListItem from '../../../ui/component/CommonListItem';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import CommonUI from '../../../ui/component/CommonUI';
import { Path } from '../../../utils/Path';
import { G_ServerTime, G_UserData } from '../../../init';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import CommonHeroIcon from '../../../ui/component/CommonHeroIcon';
import { TextHelper } from '../../../utils/TextHelper';

@ccclass
export default class PopupArenaPeekCell extends CommonListItem {

   @property({
       type: cc.Node,
       visible: true
   })
   _resourceNode: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodePlayer1: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodePlayer2: cc.Node = null;

   @property({
       type: CommonButtonLevel1Highlight,
       visible: true
   })
   _btnLookUp: CommonButtonLevel1Highlight = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageRank: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageRankValue: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textRankValue: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _playerName1: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _fightTime: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _playerName2: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textRankDesc: cc.Label = null;

   private _arenaBattle:any;


onLoad() {
    this._btnLookUp.setString(Lang.get('arena_top_rank_cell_btn_txt'));
    var size = this._resourceNode.getContentSize();
    this.node.setContentSize(size.width, size.height);
    this._btnLookUp.addClickEventListenerEx(handler(this, this._onButtonClick));
}
updateUI(index, cellData) {
    var cellValue = cellData[0];
    if (cellValue == null) {
        return;
    }
    var attack = cellValue.attack;
    var defense = cellValue.defense;
    this._arenaBattle = cellValue;
    this._updatePlayerInfo(this._nodePlayer1, this._playerName1, attack);
    this._updatePlayerInfo(this._nodePlayer2, this._playerName2, defense);
    this._textRankDesc.string = Lang.get('arena_peek_rank_change', { rank2: (cellValue.defense_rank)});
    if (cellValue.defense_rank <= 3) {
        var desContentSize = this._textRankDesc.node.getContentSize();
        this._imageRankValue.node.active = (true);
        this._textRankValue.node.active = (false);
        this._imageRank.node.addComponent(CommonUI).loadTexture(Path.getComplexRankUI('icon_ranking0' + cellValue.defense_rank));
        this._imageRankValue.node.addComponent(CommonUI).loadTexture(Path.getComplexRankUI('txt_ranking0' + cellValue.defense_rank));
    } else {
        this._imageRankValue.node.active = (false);
        this._textRankValue.node.active = (true);
        this._imageRank.node.addComponent(CommonUI).loadTexture(Path.getComplexRankUI('icon_ranking04'));
        this._textRankValue.string = (cellValue.defense_rank || '');
    }
    var leftTime = cellValue['time'];
    if (!leftTime) {
        this._fightTime.node.active = (false);
    } else {
        this._fightTime.node.active = (true);
        this._fightTime.string = (G_ServerTime.getPassTime(leftTime));
    }
}
_updatePlayerInfo(nodePlayer:cc.Node, labelName:cc.Label, battleUser) {
    var scrollView = nodePlayer.getChildByName('Scroll_View') as cc.Node;
    var commonHeroArr = (scrollView.getChildByName("content") as cc.Node).children;
    function updateAvatar(battleUser, commHero:CommonHeroIcon, hero) {
        var [avatarBaseId, table] = UserDataHelper.convertAvatarId(battleUser.user);
        if (avatarBaseId > 0) {
            commHero.updateIcon(table);
        } else {
            commHero.updateUI(hero.base_id);
        }
    }
    for (var index = 1;index<=commonHeroArr.length;index++) {
        var commHero = commonHeroArr[index-1] as cc.Node;
        var hero = battleUser.heros[index-1];
        var chc = commHero.getComponent(CommonHeroIcon) as CommonHeroIcon;
        commHero.active = (true);
        if (index == 1) {
            updateAvatar(battleUser, chc, hero);
        } else {
            if (hero) {
                chc.updateUI(hero.base_id);
            } else {
                chc.refreshToEmpty();
            }
        }
    }
    var srcollView = nodePlayer.getChildByName('Scroll_View');
    var officalInfo = G_UserData.getBase().getOfficialInfo();
    labelName.string = (battleUser.user.name);
    (nodePlayer.getChildByName("Image_power").getChildByName("Text_power") as cc.Node) .getComponent(cc.Label).string = TextHelper.getAmountText(battleUser.user.power);
}
_onButtonClick(sender) {
    cc.warn('PopupArenaPeekCell:_onButtonClick');
    this.dispatchCustomCallback(this._arenaBattle.report_id);
}


}