import CommonListItem from "../../../ui/component/CommonListItem";
import CommonHeroIcon from "../../../ui/component/CommonHeroIcon";
import MineReportBarNode from "./MineReportBarNode";
import { G_UserData, Colors, G_ServerTime } from "../../../init";
import { AvatarDataHelper } from "../../../utils/data/AvatarDataHelper";
import { HeroConst } from "../../../const/HeroConst";
import { Path } from "../../../utils/Path";
import { Lang } from "../../../lang/Lang";
import CommonUI from "../../../ui/component/CommonUI";
import UIHelper from "../../../utils/UIHelper";


const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupMineSweepCell extends CommonListItem{

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
    _imageNormalBG: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRepType: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTotal: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageStateBG: cc.Sprite = null;

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
        type: cc.Label,
        visible: true
    })
    _textTime: cc.Label = null;

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
        type: CommonHeroIcon,
        visible: true
    })
    _playerIcon1: CommonHeroIcon = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageState: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageState2: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imagePrivilegeLeft: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imagePrivilegeRight: cc.Sprite = null;

    private _leftNamePosX: number;
    private _rightNamePosX: number;
    private _reportData: any;

    public static REPORT_TYPE_ATTACK = 1;
    public static REPORT_TYPE_DEF = 2;

    onLoad() {
        this._leftNamePosX = 0;
        this._rightNamePosX = 0;
    }

    setInitData(reportData) {
        this._reportData = reportData;
    }
    onEnable() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        // this._imageState.ignoreContentAdaptWithSize(true);
        // this._imageState2.ignoreContentAdaptWithSize(true);
        this._textTotal.node.active = (false);
        this._imageTotalBG.node.active = (false);
        this._updateReportInfo();
    }
    _updateReportInfo() {
        var reportData = this._reportData;
        var isMyAttack = true;
        if (reportData.getReport_type() == PopupMineSweepCell.REPORT_TYPE_DEF) {
            isMyAttack = false;
        }
        this._updateBG(isMyAttack);
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
        this._updateWin(myWin, reportData.isSelf_is_die(), reportData.isTar_is_die());
        this._updateTime(reportData.getFight_time());
        var myArmy = reportData.getSelf_army();
        if (reportData.isSelf_is_die()) {
            myArmy = 0;
        }
        var tarArmy = reportData.getTar_army();
        if (reportData.isTar_is_die()) {
            tarArmy = 0;
        }
        this._bar1.updateUI(myArmy, reportData.getSelf_dec_army(), false, G_UserData.getMineCraftData().isSelfPrivilege(), reportData.getSelf_infamy_add());
        this._bar2.updateUI(tarArmy, reportData.getTar_dec_army(), true, reportData.isTar_is_privilege(), reportData.getTar_infamy_add());
        this._textTime.node.active = (false);
        this._imagePrivilegeLeft.node.active = (G_UserData.getMineCraftData().isSelfPrivilege());
        this._imagePrivilegeRight.node.active = (reportData.isTar_is_privilege());
        if (this._imagePrivilegeLeft.node.active) {
            var x = this['_textName1'].node.x;
            this._leftNamePosX = this._leftNamePosX == 0 && x || this._leftNamePosX;
            this['_textName1'].node.x = (this._leftNamePosX + 30);
        } else {
            var x = this['_textName1'].node.x;
            this._leftNamePosX = this._leftNamePosX == 0 && x || this._leftNamePosX;
            this['_textName1'].node.x = (this._leftNamePosX);
        }
        if (this._imagePrivilegeRight.node.active) {
            var x = this['_textName2'].node.x;
            this._rightNamePosX = this._rightNamePosX == 0 && x || this._rightNamePosX;
            this['_textName2'].node.x = (this._rightNamePosX - 30);
        } else {
            var x = this['_textName2'].node.x;
            this._rightNamePosX = this._rightNamePosX == 0 && x || this._rightNamePosX;
            this['_textName2'].node.x = (this._rightNamePosX);
        }
    }
    _updateBG(isMyAttack) {
        if (isMyAttack) {
            var bgPath = Path.getMineImage('img_mine_arena02');
            this._imageStateBG.node.addComponent(CommonUI).loadTexture(bgPath);
            this._textRepType.string = (Lang.get('mine_rep_type_attack'));
        } else {
            var bgPath = Path.getMineImage('img_mine_arena01');
            this._imageStateBG.node.addComponent(CommonUI).loadTexture(bgPath);
            this._textRepType.string = (Lang.get('mine_rep_type_def'));
        }
    }
    _updateWin(myWin, myDie, tarDie) {
        var pathWin = Path.getTextSignet('txt_shengli01');
        var pathLose = Path.getTextSignet('txt_lose01');
        var pathDie = Path.getTextSignet('img_zhenwang01');
        if (myWin) {
            this._imageState.node.addComponent(CommonUI).loadTexture(pathWin);
            this._imageState2.node.addComponent(CommonUI).loadTexture(pathLose);
        } else {
            this._imageState2.node.addComponent(CommonUI).loadTexture(pathWin);
            this._imageState.node.addComponent(CommonUI).loadTexture(pathLose);
        }
        if (myDie) {
            this._imageState.node.addComponent(CommonUI).loadTexture(pathDie);
        }
        if (tarDie) {
            this._imageState2.node.addComponent(CommonUI).loadTexture(pathDie);
        }

    }
    _updatePlayerDetail(index, name, officerLevel, avatarId, limit) {
        this['_playerIcon' + index].updateUI(avatarId, null, limit);
        (this['_textName' + index] as cc.Label).string = name;
        (this['_textName' + index] as cc.Label).node.color = Colors.getOfficialColor(officerLevel);
        UIHelper.enableOutline(this['_textName' + index], Colors.getOfficialColorOutlineEx(officerLevel))

    }
    _updateTime(fightTime) {
        var timeDiff = G_ServerTime.getPassTime(fightTime);
        this._textTime.string = (timeDiff);
    }
    updateTotal(win, lose, selfDie, tarDie, selfArmy, tarArmy, selfRedArmy, tarRedArmy) {
        var bgPath = Path.getMineImage('img_mine_arena03');
        this._imageStateBG.node.addComponent(CommonUI).loadTexture(bgPath);
        this._imageNormalBG.node.active = (false);
        this._imageTotalBG.node.active = (true);
        this._textRepType.node.active = (false);
        this._textTotal.node.active = (true);
        this._textTotal.string = (Lang.get('mine_sweep_total', {
            count1: win,
            count2: lose
        }));
        var pathDie = Path.getTextSignet('img_zhenwang01');
        if (selfDie) {
            this._imageState.node.addComponent(CommonUI).loadTexture(pathDie);
            this._imageState.node.active = (true);
            selfArmy = 0;
        } else {
            this._imageState.node.active = (false);
        }
        if (tarDie) {
            this._imageState2.node.addComponent(CommonUI).loadTexture(pathDie);
            this._imageState2.node.active = (true);
            tarArmy = 0;
        } else {
            this._imageState2.node.active = (false);
        }
        this._bar1.updateUI(selfArmy, selfRedArmy, false);
        this._bar2.updateUI(tarArmy, tarRedArmy, true);
    }
}