const { ccclass, property } = cc._decorator;

import MineBarNode from './MineBarNode'

import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar'

import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'

import CommonButtonLevel0Normal from '../../../ui/component/CommonButtonLevel0Normal'

import CommonNormalSmallPop from '../../../ui/component/CommonNormalSmallPop'
import PopupBase from '../../../ui/PopupBase';
import { G_Prompt, Colors, G_UserData, G_SignalManager, G_ServerTime, G_ConfigLoader } from '../../../init';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import UIHelper from '../../../utils/UIHelper';
import { AvatarDataHelper } from '../../../utils/data/AvatarDataHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { SignalConst } from '../../../const/SignalConst';
import { MineCraftData } from '../../../data/MineCraftData';
import { UserCheck } from '../../../utils/logic/UserCheck';
import { DataConst } from '../../../const/DataConst';
import { TextHelper } from '../../../utils/TextHelper';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import ParameterIDConst from '../../../const/ParameterIDConst';
import { assert } from '../../../utils/GlobleFunc';
import { MineCraftHelper } from './MineCraftHelper';

@ccclass
export default class PopupMineUser extends PopupBase {

    @property({
        type: CommonNormalSmallPop,
        visible: true
    })
    _popBG: CommonNormalSmallPop = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textSameGuild: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPeace: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textTip: cc.Label = null;



    @property({
        type: CommonButtonLevel0Normal,
        visible: true
    })
    _btnCancel: CommonButtonLevel0Normal = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _btnFight: CommonButtonLevel0Highlight = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _iconInfame: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textUserName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textGuildName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textArmyValue: cc.Label = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _heroAvatar: CommonHeroAvatar = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _btnLook: cc.Button = null;

    @property({
        type: MineBarNode,
        visible: true
    })
    _armyBar: MineBarNode = null;

    private _mineData: any;
    private _userId: number;
    private _sweepCount: number;
    private _mineConfig: any;
    private _signalMineRespond: any;
    private _signalBattleMine: any;
    private _singalFastBattle: any;
    private _signalBuyItem: any;
    private _barArmy: MineBarNode;

    public static SWEEP_MAX = 5;
    public static SWEEP_INFINITE = 10000;

    public setInitData(userId, mineData) {
        this._mineData = mineData;
        this._userId = userId;
        this._mineConfig = mineData.getConfigData();
        this._signalMineRespond = null;
        this._signalBattleMine = null;
        this._singalFastBattle = null;
        this._signalBuyItem = null;
        // var resource = {
        //     file: Path.getCSB('PopupMineUser', 'mineCraft'),
        //     binding: {
        //         _btnCancel: {
        //             events: [{
        //                     event: 'touch',
        //                     method: '_onFastBattleClick'
        //                 }]
        //         }
        //         _btnFight: {
        //             events: [{
        //                     event: 'touch',
        //                     method: '_onFightClick'
        //                 }]
        //         }
        //         _btnLook: {
        //             events: [{
        //                     event: 'touch',
        //                     method: '_onBtnLookClick'
        //                 }]
        //         }
        //     }
        // };
        this.node.name = 'PopupMineUser';
    }
    onCreate() {
        this._heroAvatar.init();
        this._barArmy = this._armyBar;
        this._barArmy.showIcon(true);
        var userData = this._mineData.getUserById(this._userId);
        if (!userData) {
            this.closeWithAction();
            G_Prompt.showTip(Lang.get('mine_already_leave'));
            return;
        }
        this._popBG.addCloseEventListener(handler(this, this.closeWithAction));
        this._popBG.setTitle(Lang.get('mine_target_info'));
        this._textUserName.string = (userData.getUser_name());
        var officerLevel = userData.getOfficer_level();
        this._textUserName.node.color = (Colors.getOfficialColor(officerLevel));
        UIHelper.updateTextOfficialOutline(this._textUserName.node, officerLevel);
        if (userData.getGuild_id() == 0) {
            this._textGuildName.string = (Lang.get('mine_user_no_guild'));
        } else {
            this._textGuildName.string = (userData.getGuild_name());
        }
        this._textGuildName.node.color = (Colors.getMineGuildColor(2));
        var sameGuild = false;
        var myGuildId = G_UserData.getGuild().getMyGuildId();
        if (userData.getGuild_id() != 0 && myGuildId == userData.getGuild_id()) {
            sameGuild = true;
            this._textGuildName.node.color = (Colors.getMineGuildColor(1));
        }
        this._textPeace.node.active = (false);
        this._textTip.node.active = (false);
        this._btnCancel.setVisible(!sameGuild);
        this._btnFight.setVisible(!sameGuild);
        this._textSameGuild.node.active = sameGuild;
        var id = userData.getAvatar_base_id();
        var limit = AvatarDataHelper.getAvatarConfig(id).limit == 1 && 3;
        var avatarId = UserDataHelper.convertToBaseIdByAvatarBaseId(userData.getAvatar_base_id(), userData.getBase_id())[0];
        this._heroAvatar.updateUI(avatarId, null, null, limit);
        this._textArmyValue.string = (TextHelper.getAmountText3(userData.getPower()));
        this._btnFight.setString(Lang.get('mine_fight'));
        this._btnFight.addClickEventListenerEx(handler(this, this.onFightClick));
        this._btnCancel.addClickEventListenerEx(handler(this, this.onFastBattleClick));
        this._refreshBtnFastBattle();
    }
    onEnter() {
        this._refreshInfo();
        this._signalBattleMine = G_SignalManager.add(SignalConst.EVENT_BATTLE_MINE, handler(this, this._onEventBattleMine));
        this._signalMineRespond = G_SignalManager.add(SignalConst.EVENT_GET_MINE_RESPOND, handler(this, this._onEventMineRespond));
        this._singalFastBattle = G_SignalManager.add(SignalConst.EVENT_FAST_BATTLE, handler(this, this._onFastBattle));
        this._signalBuyItem = G_SignalManager.add(SignalConst.EVENT_BUY_ITEM, handler(this, this._refreshBtnFastBattle));
    }
    onExit() {
        if (this._signalBattleMine) {
            this._signalBattleMine.remove();
            this._signalBattleMine = null;
        }
        if (this._signalMineRespond) {
            this._signalMineRespond.remove();
            this._signalMineRespond = null;
        }
        if (this._singalFastBattle) {
            this._singalFastBattle.remove();
            this._singalFastBattle = null;
        }
        if (this._signalBuyItem) {
            this._signalBuyItem.remove();
            this._signalBuyItem = null;
        }
    }
    private onFastBattleClick() {
        if (this._mineConfig.is_battle == 0) {
            G_Prompt.showTip(Lang.get('mine_cannont_fight'));
            return;
        }
        var userData = this._mineData.getUserById(this._userId);
        if (this._mineData.getId() != G_UserData.getMineCraftData().getSelfMineId()) {
            G_Prompt.showTip(Lang.get('mine_diff_mine'));
            return;
        } else if (!this._mineData.isUserInList(userData.getUser_id())) {
            G_Prompt.showTip(Lang.get('mine_not_in_same_mine'));
            this.closeWithAction();
            return;
        }
        if (this._sweepCount != PopupMineUser.SWEEP_INFINITE) {
            var success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_MINE_TOKEN, this._sweepCount);
            if (!success) {
                return;
            }
        } else {
            this._sweepCount = PopupMineUser.SWEEP_MAX;
        }
        G_UserData.getMineCraftData().c2sBattleMineFast(this._userId, this._sweepCount);
    }
    _refreshBtnFastBattle() {
        var targetInfameValue = 0;
        var userData = this._mineData.getUserById(this._userId);
        if (userData) {
            targetInfameValue = userData.getInfam_value();
        }
        this._updateIconInfame(targetInfameValue);
        var strBtn = '';
        var tokenNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_MINE_TOKEN);
        if (this._isHighPower()) {
            strBtn = Lang.get('mine_fast_battle', { count: PopupMineUser.SWEEP_MAX });
            this._sweepCount = PopupMineUser.SWEEP_INFINITE;
        } else {
            if (tokenNum >= PopupMineUser.SWEEP_MAX || tokenNum == 0) {
                var isPeace = this._mineData.isPeace();
                if (isPeace) {
                    var remainInfame = this._getRemainInfameValue();
                    if (remainInfame < PopupMineUser.SWEEP_MAX && targetInfameValue == 0) {
                        strBtn = Lang.get('mine_fast_battle', { count: remainInfame });
                        this._sweepCount = remainInfame;
                    } else {
                        strBtn = Lang.get('mine_fast_battle', { count: PopupMineUser.SWEEP_MAX });
                        this._sweepCount = PopupMineUser.SWEEP_MAX;
                    }
                } else {
                    strBtn = Lang.get('mine_fast_battle', { count: PopupMineUser.SWEEP_MAX });
                    this._sweepCount = PopupMineUser.SWEEP_MAX;
                }
            } else {
                var isPeace = this._mineData.isPeace();
                if (isPeace) {
                    var remainInfame = this._getRemainInfameValue();
                    if (remainInfame < tokenNum && targetInfameValue == 0) {
                        strBtn = Lang.get('mine_fast_battle', { count: remainInfame });
                        this._sweepCount = remainInfame;
                    } else {
                        strBtn = Lang.get('mine_fast_battle', { count: tokenNum });
                        this._sweepCount = tokenNum;
                    }
                } else {
                    strBtn = Lang.get('mine_fast_battle', { count: tokenNum });
                    this._sweepCount = tokenNum;
                }
            }
        }
        this._btnCancel.setString(strBtn);
        var userData = this._mineData.getUserById(this._userId);
        if (!userData) {
            this._textPeace.string = (Lang.get('mine_in_city'));
            this._textPeace.node.active = (true);
            this._textTip.node.active = (false);
            this._btnCancel.setVisible(false);
            this._btnFight.setVisible(false);
            return;
        }
        var sameGuild = false;
        var myGuildId = G_UserData.getGuild().getMyGuildId();
        if (userData.getGuild_id() != 0 && myGuildId == userData.getGuild_id()) {
            sameGuild = true;
            this._textGuildName.node.color = (Colors.getMineGuildColor(1));
        }
        var isPeace = this._mineData.isPeace();
        this.updatePowerTip();
        if (isPeace && this._isSelfInfameValueMax() && targetInfameValue == 0) {
            this._textPeace.string = (Lang.get('mine_peace_max_infame'));
            this._textPeace.node.active = (true);
            this._btnCancel.setVisible(false);
            this._btnFight.setVisible(false);
            this._textSameGuild.node.active =(false);
        } else {
            this._textPeace.node.active = (false);
            if (sameGuild) {
                this._textTip.node.active = (false);
            }
            this._btnCancel.setVisible(!sameGuild);
            this._btnFight.setVisible(!sameGuild);
            this._textSameGuild.node.active = (sameGuild);
        }
    }
    updateOfficialTip() {
        var userData = this._mineData.getUserById(this._userId);
        var officerLevel = userData.getOfficer_level();
        var mineOfficeLevel = G_UserData.getBase().getOfficer_level();
        var config =G_ConfigLoader.getConfig(ConfigNameConst.OFFICIAL_RANK);
        
        var baseLevel = Math.max(officerLevel, mineOfficeLevel);
        var info = config.get(baseLevel);
        assert(info, 'official_rank wrong level=' + baseLevel);
        var delta = info.mine_parameter;
        if (mineOfficeLevel - officerLevel >= delta) {
            this._textTip.node.active = (true);
            this._textTip.string = (Lang.get('mine_fight_tip_official_high'));
        } else if (officerLevel - mineOfficeLevel >= delta) {
            this._textTip.node.active = (true);
            this._textTip.string = (Lang.get('mine_fight_tip_official_low'));
        } else {
            this._textTip.node.active = (false);
        }
    }
    updatePowerTip() {
        var userData = this._mineData.getUserById(this._userId);
        var enemyPower = userData.getPower();
        var myPower = G_UserData.getBase().getPower();
        var Parameter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        var powerGap = parseInt(Parameter.get(ParameterIDConst.POWER_GAP).content);
        if (myPower / enemyPower < powerGap / 1000) {
            this._textTip.node.active = (true);
            this._textTip.string = (Lang.get('mine_power_low'));
            this._textTip.node.color = (Colors.SYSTEM_TARGET_RED);
        } else if (myPower / enemyPower > 1000 / powerGap) {
            this._textTip.node.active = (true);
            this._textTip.string = (Lang.get('mine_power_high'));
            this._textTip.node.color = (Colors.BRIGHT_BG_GREEN);
        } else {
            this.updateOfficialTip();
            this._textTip.node.color = (Colors.SYSTEM_TARGET_RED);
        }
    }
    _isHighPower() {
        var userData = this._mineData.getUserById(this._userId);
        if (!userData) {
            return false;
        }
        var enemyPower = userData.getPower();
        var myPower = G_UserData.getBase().getPower();
        var Parameter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        var powerGap = parseInt(Parameter.get(ParameterIDConst.POWER_GAP).content);
        if (myPower / enemyPower < powerGap / 1000) {
            return false;
        } else if (myPower / enemyPower > 1000 / powerGap) {
            return true;
        }
        return false;
    }

    private onCancelClick() {
        this.closeWithAction();
    }
    private onFightClick() {
        if (this._mineConfig.is_battle == 0) {
            G_Prompt.showTip(Lang.get('mine_cannont_fight'));
            return;
        }
        var myGuildId = G_UserData.getGuild().getMyGuildId();
        var userData = this._mineData.getUserById(this._userId);
        if (this._mineData.getId() != G_UserData.getMineCraftData().getSelfMineId()) {
            G_Prompt.showTip(Lang.get('mine_diff_mine'));
            return;
        } else if (!this._mineData.isUserInList(userData.getUser_id())) {
            G_Prompt.showTip(Lang.get('mine_not_in_same_mine'));
            this.closeWithAction();
            return;
        }
        var success = UserCheck.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_MINE_TOKEN, 1);
        if (!success) {
            return;
        }
        G_UserData.getMineCraftData().c2sBattleMine(this._userId);
    }
    _onEventMineRespond() {
        this._refreshInfo();
    }
    //收到扫荡结果
    _onFastBattle() {
        this._refreshBtnFastBattle();
        this._refreshInfo();
        if (G_UserData.getMineCraftData().getSelfMineId() != this._mineData.getId()) {
            this.closeWithAction();
        }
    }
    _refreshInfo() {
        var userData = this._mineData.getUserById(this._userId);
        if (userData) {
            this._barArmy.setPercent(userData.getArmy_value(), true, G_ServerTime.getLeftSeconds(userData.getPrivilege_time()) > 0);
        } else {
            this.closeWithAction();
        }
        this._refreshBtnFastBattle();
    }
    _updateIconInfame(targetInfameValue) {
        this._iconInfame.node.active = (targetInfameValue > 0);
    }
    _getRemainInfameValue() {
        var ivAddPerAttack = MineCraftHelper.getInfameValueAddPerAttack();
        var infameValue = G_UserData.getMineCraftData().getSelfInfamValue();
        var infameRefreshTime = G_UserData.getMineCraftData().getSelfRefreshTime();
        var privilegeTime = G_UserData.getMineCraftData().getPrivilegeTime();
        var bIsVip = G_ServerTime.getLeftSeconds(privilegeTime) > 0;
        var maxInfameValue = MineCraftHelper.getMaxInfameValue(bIsVip);
        var [REFRESH_TIME,NUM_PERCHANGE] = MineCraftHelper.getInfameCfg(bIsVip);
        var countChange = Math.floor((G_ServerTime.getTime() - infameRefreshTime) / REFRESH_TIME);
        var curInfameValue = infameValue - NUM_PERCHANGE * countChange;
        curInfameValue = Math.max(curInfameValue, 0);
        return maxInfameValue - curInfameValue;
    }
    _isSelfInfameValueMax() {
        var isPeace = this._mineData.isPeace();
        var infameValue = G_UserData.getMineCraftData().getSelfInfamValue();
        var infameRefreshTime = G_UserData.getMineCraftData().getSelfRefreshTime();
        var privilegeTime = G_UserData.getMineCraftData().getPrivilegeTime();
        var bIsVip = G_ServerTime.getLeftSeconds(privilegeTime) > 0;
        var maxInfameValue = MineCraftHelper.getMaxInfameValue(bIsVip);
        return infameValue >= maxInfameValue;
    }

    _onEventBattleMine(eventName, message) {
        var myEndArmy = message.self_begin_army - message.self_red_army;
        if (myEndArmy <= 0) {
            this.close();
            return;
        }
        var enemyEndArmy = message.tar_begin_army - message.tar_red_army;
        if (enemyEndArmy <= 0) {
            this.close();
            return;
        }
    }
    private onBtnLookClick() {
        G_UserData.getBase().c2sGetUserDetailInfo(this._userId);
    }

}