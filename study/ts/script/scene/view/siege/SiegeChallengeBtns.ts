const { ccclass, property } = cc._decorator;

import CommonButtonLevel0Normal from '../../../ui/component/CommonButtonLevel0Normal'

import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'

import CommonResourceInfo from '../../../ui/component/CommonResourceInfo'
import { Lang } from '../../../lang/Lang';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { DataConst } from '../../../const/DataConst';
import { G_Prompt, G_SignalManager, G_UserData } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';

@ccclass
export default class SiegeChallengeBtns extends cc.Component {

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _powerCost: CommonResourceInfo = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _btnPowerAttack: CommonButtonLevel0Highlight = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _normalCost: CommonResourceInfo = null;

    @property({
        type: CommonButtonLevel0Normal,
        visible: true
    })
    _btnNormalAttack: CommonButtonLevel0Normal = null;

    @property({
        type: CommonButtonLevel0Normal,
        visible: true
    })
    _btnShare: CommonButtonLevel0Normal = null;

    private static NORMAL_COST = 1
    private static POWER_COST = 2
    
    private static FIGHT_TYPE_NORMAL = 1
    private static FIGHT_TYPE_POWER = 2

    private _isHalfPrice;
    private _uId;
    private _bossId;
    private _powerTokenCnt;
    private _normalTokenCnt;
    private _isLeave;
    private _shareFunc;

    public init(isHalfPrice, uId, bossId, isLeave) {
        this._isHalfPrice = isHalfPrice;
        this._uId = uId;
        this._bossId = bossId;
        this._powerTokenCnt = SiegeChallengeBtns.POWER_COST;
        this._normalTokenCnt = SiegeChallengeBtns.NORMAL_COST;
        this._isLeave = isLeave;
        this.node.name = "SiegeChallengeBtns";
        this._refreshPrice();
    }

    public onLoad() {
        this._btnNormalAttack.setString(Lang.get('siege_normal_attack'));
        this._btnPowerAttack.setString(Lang.get('siege_power_attack'));
        this._btnShare.setString(Lang.get('siege_share'));
        this._refreshPrice();
    }

    private _refreshPrice() {
        this._normalCost.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_TOKEN, SiegeChallengeBtns.NORMAL_COST);
        this._normalCost.setTextColorToDTypeColor();
        this._powerTokenCnt = SiegeChallengeBtns.POWER_COST;
        if (this._isHalfPrice) {
            this._powerTokenCnt = SiegeChallengeBtns.POWER_COST / 2;
        }
        this._powerCost.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_TOKEN, this._powerTokenCnt);
        this._powerCost.setTextColorToDTypeColor();
    }

    public onNormalClick() {
        this._challengeBoss(SiegeChallengeBtns.FIGHT_TYPE_NORMAL);
    }

    public onPowerClick() {
        this._challengeBoss(SiegeChallengeBtns.FIGHT_TYPE_POWER);
    }

    private _challengeBoss(type) {
        if (this._isLeave) {
            G_Prompt.showTip(Lang.get('siege_has_left'));
            return;
        }
        var needToken = this._normalTokenCnt;
        if (type == SiegeChallengeBtns.FIGHT_TYPE_POWER) {
            needToken = this._powerTokenCnt;
        }
        var success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_TOKEN, needToken);
        if (success) {
            G_SignalManager.dispatch(SignalConst.EVENT_CLEAR_GUILD_INVITE_NOTICE);
            G_UserData.getSiegeData().c2sRebelArmyBattle(this._uId, this._bossId, type);
            G_UserData.getSiegeData().refreshRebelArmy();
        }
    }

    public setShareVisible(v) {
        this._btnShare.setVisible(v);
    }

    public setShareFunc(func) {
        this._shareFunc = func;
    }

    public onShareClick() {
        if (this._isLeave) {
            G_Prompt.showTip(Lang.get('siege_has_left'));
            return;
        }
        if (!G_UserData.getGuild().isInGuild()) {
            G_Prompt.showTip(Lang.get('siege_no_guild'));
            return;
        }
        this._shareFunc();
    }
}