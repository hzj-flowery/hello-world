const {ccclass, property} = cc._decorator;

import CommonHeadFrame from '../../../ui/component/CommonHeadFrame'

import CommonHeroIcon from '../../../ui/component/CommonHeroIcon'
import CommonListItem from '../../../ui/component/CommonListItem';
import { Lang } from '../../../lang/Lang';
import { G_UserData, Colors } from '../../../init';
import { TextHelper } from '../../../utils/TextHelper';
import { TimeConst } from '../../../const/TimeConst';
import UIHelper from '../../../utils/UIHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import CommonUI from '../../../ui/component/CommonUI';
import { Path } from '../../../utils/Path';

@ccclass
export default class PopupArenaReportCell extends CommonListItem {

   @property({
       type: cc.Node,
       visible: true
   })
   _resourceNode: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _bgImage: cc.Sprite = null;

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

   @property({
       type: cc.Node,
       visible: true
   })
   _rankNode: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textRank: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textRankDesc: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textBattleDesc: cc.Label = null;

   @property({
       type: CommonHeroIcon,
       visible: true
   })
   _commonPlayerIcon: CommonHeroIcon = null;

   @property({
       type: CommonHeadFrame,
       visible: true
   })
   _commonHeadFrame: CommonHeadFrame = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeWinLose: cc.Node = null;
   
//    private _index:number;
   private _reportData:any;
onCreate () {
    var size = this._resourceNode.getContentSize();
    this.node.setContentSize(size.width, size.height);
 }
updateUI (index, cellValue) {
    this._index = index;
    this._reportData = cellValue[0];
    this._updateReportInfo(cellValue[0]);
 }
_updateReportInfo (reportInfo) {
    var srcRank = 0;
    var dstRank = 0;
    if (reportInfo == null) {
        return;
    }
    var showBg = this._index % 2 == 0;
    if (showBg) {
        this._bgImage.node.addComponent(CommonUI).loadTexture(Path.getUICommon('img_com_board_list01a'));
        // this._bgImage.setScale9Enabled(true);
        this._bgImage.type = cc.Sprite.Type.SLICED;
        // this._bgImage.setCapInsets(cc.rect(1, 1, 1, 1));
    } else {
        this._bgImage.node.addComponent(CommonUI).loadTexture(Path.getUICommon('img_com_board_list01b'));
        // this._bgImage.setScale9Enabled(true);
        this._bgImage.type = cc.Sprite.Type.SLICED;
        // this._bgImage.setCapInsets(cc.rect(1, 1, 1, 1));
    }
    this._textPlayerName.string = reportInfo.name;
    this._textPlayerName.node.color = Colors.getOfficialColor(reportInfo.officer_level);
    UIHelper.enableOutline(this._textPlayerName,Colors.getOfficialColorOutlineEx(reportInfo.officer_level))
    this._textPower.string = (TextHelper.getAmountText(reportInfo.power));
    var [avatarBaseId, table] = UserDataHelper.convertAvatarId(reportInfo);
    this._commonPlayerIcon.updateIcon(table);
    var scale = new cc.Vec2();
    this._commonPlayerIcon.node.getScale(scale);
    this._commonHeadFrame.updateUI(reportInfo.head_frame_id, scale.x);
    this._commonHeadFrame.setLevel(reportInfo.level);
    var reqBatNum =  reportInfo['num']|| 0;
    var totalNum =  reportInfo['battle_num']|| 0;
    var winNum =  reportInfo['win_cnt']|| 0;
    var isWin = false;
    if (reqBatNum == 1) {
        isWin = winNum > 0;
        if (isWin) {
            this._nodeWinLose.getChildByName('Image_win').active = (true);
            this._nodeWinLose.getChildByName('Image_lose').active = (false);
            this._nodeWinLose.getChildByName('Label_win').active = (false);
        } else {
            this._nodeWinLose.getChildByName('Image_win').active = (false);
            this._nodeWinLose.getChildByName('Image_lose').active = (true);
            this._nodeWinLose.getChildByName('Label_win').active = (false);
        }
        this._textBattleDesc.string = (' ');
        this._rankNode.y = (58);
    } else {
        var loseNum = totalNum - winNum;
        this._textBattleDesc.string = (Lang.get('arena_report_battle_num', { num: reqBatNum }));
        this._rankNode.y = (64);
        this._nodeWinLose.getChildByName('Image_win').active = (false);
        this._nodeWinLose.getChildByName('Image_lose').active = (false);
        this._nodeWinLose.getChildByName('Label_win').active = (true);
        // this._nodeWinLose.updateLabel('', { text: winNum });
        var p = this._nodeWinLose.getChildByName("Label_win").getComponent(cc.Label).string = winNum;
        this._nodeWinLose.getChildByName("Label_win").getChildByName("Image_winEx").getChildByName("Label_lose").getComponent(cc.Label).string = loseNum+"";
        if (loseNum < winNum) {
            isWin = true;
        }
    }
    this._rankNode.getChildByName('Image_arrow_up').active = (false);
    this._rankNode.getChildByName('Image_arrow_down').active = (false);
    this._textRankDesc.string = (Lang.get('arena_pklog_nochange'));
    this._textRank.node.active = (false);
    var change_rank = reportInfo.change_rank || 0;
    if (change_rank > 0) {
        this._textRankDesc.string = (Lang.get('arena_pklog_desc'));
        this._textRank.string = (change_rank);
        this._textRank.node.active = (true);
        if (isWin) {
            this._rankNode.getChildByName('Image_arrow_up').active = (true);
        } else {
            this._rankNode.getChildByName('Image_arrow_down').active = (true);
        }
    }
 }
_isSelf () {
    if (this._reportData.uid == G_UserData.getBase().getId()) {
        return true;
    }
    return false;
 }
_onButtonClick (sender) {
    cc.warn('PopupArenaReportCell:_onButtonClick');
    var curSelectedPos = sender.getTag();
    this.dispatchCustomCallback(curSelectedPos);
}


}