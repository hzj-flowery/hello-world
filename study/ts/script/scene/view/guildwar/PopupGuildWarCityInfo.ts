const { ccclass, property } = cc._decorator;

import CommonNormalMiniPop from '../../../ui/component/CommonNormalMiniPop'
import PopupBase from '../../../ui/PopupBase';
import { handler } from '../../../utils/handler';
import { Lang } from '../../../lang/Lang';
import { G_SignalManager, G_UserData, G_Prompt } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { GuildWarDataHelper } from '../../../utils/data/GuildWarDataHelper';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import CommonButtonSwitchLevel0 from '../../../ui/component/CommonButtonSwitchLevel0';
import { GuildConst } from '../../../const/GuildConst';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';

@ccclass
export default class PopupGuildWarCityInfo extends PopupBase {

    @property({
        type: CommonNormalMiniPop,
        visible: true
    })
    _panelBg: CommonNormalMiniPop = null;

    @property({
        type: CommonButtonSwitchLevel0,
        visible: true
    })
    _buttonProclaim: CommonButtonSwitchLevel0 = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textProclaimNum: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textGuildName: cc.Label = null;

    _cityId: any;
    _signalGuildWarDeclareSuccess: any;
    _signalGuildWarDeclareSyn: any;

    initData(cityId) {
        this._cityId = cityId;
    }
    onCreate() {
        this._panelBg.setTitle(Lang.get('popupTitle'));
        this._panelBg.addCloseEventListener(handler(this, this._onCloseClick));
        this._buttonProclaim.setString(Lang.get('guildwar_button_proclaim'));
        this._refreshCityName();
    }
    onEnter() {
        this._signalGuildWarDeclareSuccess = G_SignalManager.add(SignalConst.EVENT_GUILD_WAR_DECLARE_SUCCESS, handler(this, this._onEventGuildWarDeclareSuccess));
        this._signalGuildWarDeclareSyn = G_SignalManager.add(SignalConst.EVENT_GUILD_WAR_DECLARE_SYN, handler(this, this._onEventGuildWarDeclareSyn));
        var guildWarCity = G_UserData.getGuildWar().getCityById(this._cityId);
        if (!guildWarCity) {
            return;
        }
        this._refreshGuildName(guildWarCity);
        this._refreshProclaimNum(guildWarCity);
        this._updateBtnState(guildWarCity);
    }
    onExit() {
        this._signalGuildWarDeclareSuccess.remove();
        this._signalGuildWarDeclareSuccess = null;
        this._signalGuildWarDeclareSyn.remove();
        this._signalGuildWarDeclareSyn = null;
    }
    _onEventGuildWarDeclareSuccess(event) {
        G_Prompt.showTip(Lang.get('guildwar_tips_proclaim_success'));
    }
    _onEventGuildWarDeclareSyn(event) {
        var guildWarCity = G_UserData.getGuildWar().getCityById(this._cityId);
        if (!guildWarCity) {
            return;
        }
        this._refreshGuildName(guildWarCity);
        this._refreshProclaimNum(guildWarCity);
        this._updateBtnState(guildWarCity);
    }
    _onCloseClick() {
        this.closeWithAction();
    }
    onButtonProclaim() {
        var declareCallback = function () {
            var success = LogicCheckHelper.guildWarCanProclaim(this._cityId, null);
            if (success) {
                G_UserData.getGuildWar().c2sGuildWarDeclareCity(this._cityId);
            }
        }.bind(this);
        var guild = G_UserData.getGuild().getMyGuild();
        var lastDeclareTime = guild && guild.getWar_declare_time() || 0;
        if (lastDeclareTime > 0) {
            var money = GuildWarDataHelper.getGuildWarProclaimCD();
            UIPopupHelper.popupConfirm(Lang.get('guildwar_declare_alert_content', { value: money }), function () {
                declareCallback();
            }.bind(this));
            return;
        } else {
            declareCallback();
        }
    }
    _refreshCityName() {
        var config = GuildWarDataHelper.getGuildWarCityConfig(this._cityId);
        this._panelBg.setTitle(config.name);
    }
    _refreshGuildName(guildWarCity) {
        if (guildWarCity.getOwn_guild_id() != 0) {
            this._textGuildName.string = (guildWarCity.getOwn_guild_name());
        } else {
            this._textGuildName.string = (Lang.get('guildwar_no_owner'));
        }
    }
    _refreshProclaimNum(guildWarCity) {
        this._textProclaimNum.string = (parseInt(guildWarCity.getDeclare_guild_num()) + "");
    }
    _updateBtnState(guildWarCity) {
        var haveDeclarePermission = false;
        if (G_UserData.getGuild().isInGuild()) {
            haveDeclarePermission = UserDataHelper.isHaveGuildPermission(GuildConst.GUILD_JURISDICTION_15);
        }
        var isDeclare = guildWarCity.isIs_declare() && G_UserData.getGuild().isInGuild();
        var canDeclare = GuildWarDataHelper.isCityCanBeAttack(guildWarCity.getCity_id(), GuildWarDataHelper.getOwnCityId());
        this._buttonProclaim.setEnabled(haveDeclarePermission && !isDeclare && canDeclare);
        var guildHasDeclare = GuildWarDataHelper.guildHasDeclare();
        if (isDeclare) {
            this._buttonProclaim.setString(Lang.get('guildwar_button_already_proclaim'));
        } else if (guildHasDeclare) {
            this._buttonProclaim.setString(Lang.get('guildwar_button_change_proclaim'));
        } else {
            this._buttonProclaim.setString(Lang.get('guildwar_button_proclaim'));
        }
    }

}