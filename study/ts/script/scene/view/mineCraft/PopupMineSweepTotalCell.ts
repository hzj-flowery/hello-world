const {ccclass, property} = cc._decorator;

import CommonHeroIcon from '../../../ui/component/CommonHeroIcon'

import MineReportBarNode from './MineReportBarNode'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { G_UserData, Colors } from '../../../init';
import { UserBaseData } from '../../../data/UserBaseData';
import { AvatarDataHelper } from '../../../utils/data/AvatarDataHelper';
import { HeroConst } from '../../../const/HeroConst';
import { Lang } from '../../../lang/Lang';
import { MineCraftData } from '../../../data/MineCraftData';
import UIHelper from '../../../utils/UIHelper';

@ccclass
export default class PopupMineSweepTotalCell extends ListViewCellBase {

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
       type: cc.Sprite,
       visible: true
   })
   _imageTotalBG: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageStateBG: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textTotal: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textName1: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textName2: cc.Label = null;

   @property({
       type: MineReportBarNode,
       visible: true
   })
   _bar1: MineReportBarNode = null;

   @property({
       type: MineReportBarNode,
       visible: true
   })
   _bar2: MineReportBarNode = null;

   @property({
       type: CommonHeroIcon,
       visible: true
   })
   _playerIcon2: CommonHeroIcon = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textDie2: cc.Label = null;

   @property({
       type: CommonHeroIcon,
       visible: true
   })
   _playerIcon1: CommonHeroIcon = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textDie1: cc.Label = null;

   private _reportData:any;
   private _leftNamePosX:number;
   private _rightNamePosX:number;
public setInitData(reportData, isTotalNode?):void{
    this._reportData = reportData;
    this._leftNamePosX = 0;
    this._rightNamePosX = 0;
}
onCreate() {
    var size = this._resourceNode.getContentSize();
    this.node.setContentSize(size.width, size.height);
    this._updateReportInfo();
}
_updateReportInfo() {
    var reportData = this._reportData;
    var myBaseData = G_UserData.getBase();
    var heroId = myBaseData.getPlayerBaseId();
    var avatarId = myBaseData.getAvatar_base_id();
    var limit = 0;
    if (avatarId != 0) {
        var avatarConfig = AvatarDataHelper.getAvatarConfig(avatarId);
        if (avatarConfig.limit == 1) {
            limit = HeroConst.HERO_LIMIT_RED_MAX_LEVEL;
        }
        heroId = avatarConfig.hero_id;
    }
    this._updatePlayerDetail(1, myBaseData.getName(), myBaseData.getOfficer_level(), heroId, limit);
    heroId = reportData.getBase_id();
    limit = 0;
    if (reportData.getAvatar_base_id() && reportData.getAvatar_base_id() > 0) {
        var avatarConfig = AvatarDataHelper.getAvatarConfig(reportData.getAvatar_base_id());
        if (avatarConfig.limit == 1) {
            limit = HeroConst.HERO_LIMIT_RED_MAX_LEVEL;
        }
        heroId = avatarConfig.hero_id;
    }
    this._updatePlayerDetail(2, reportData.getName(), reportData.getOfficer_level(), heroId, limit);
    var star = reportData.getWin_type();
    var myWin = true;
    if (star <= 0) {
        myWin = false;
    }
    var myArmy = reportData.getSelf_army();
    if (reportData.isSelf_is_die()) {
        myArmy = 0;
    }
    var tarArmy = reportData.getTar_army();
    if (reportData.isTar_is_die()) {
        tarArmy = 0;
    }
    this._bar1.updateUI(myArmy, reportData.getSelf_dec_army(), false, G_UserData.getMineCraftData().isSelfPrivilege());
    this._bar2.updateUI(tarArmy, reportData.getTar_dec_army(), true, reportData.isTar_is_privilege());
}
_updatePlayerDetail(index, name, officerLevel, avatarId, limit) {
    this['_playerIcon' + index].updateUI(avatarId, null, limit);
    (this['_textName' + index] as cc.Label).string = name;
    (this['_textName' + index] as cc.Label).node.color = Colors.getOfficialColor(officerLevel);
    UIHelper.enableOutline((this['_textName' + index] as cc.Label),Colors.getOfficialColorOutlineEx(officerLevel))
}
updateTotal(win, lose, selfDie, tarDie, selfArmy, tarArmy, selfRedArmy, tarRedArmy, selfInfame, tarInfame) {
    this._textTotal.node.active = (true);
    this._textTotal.string = (Lang.get('mine_sweep_total', {
        count1: win,
        count2: lose
    }));
    if (selfDie) {
        this._playerIcon1.setIconMask(true);
        this._textDie1.node.active = (true);
        selfArmy = 0;
    } else {
        this._playerIcon1.setIconMask(false);
        this._textDie1.node.active = (false);
    }
    if (tarDie) {
        this._playerIcon2.setIconMask(true);
        this._textDie2.node.active = (true);
        tarArmy = 0;
    } else {
        this._playerIcon2.setIconMask(false);
        this._textDie2.node.active = (false);
    }
    this._bar1.updateUI(selfArmy, selfRedArmy, false, G_UserData.getMineCraftData().isSelfPrivilege(), selfInfame);
    this._bar2.updateUI(tarArmy, tarRedArmy, true, this._reportData.isTar_is_privilege(), tarInfame);
}


}