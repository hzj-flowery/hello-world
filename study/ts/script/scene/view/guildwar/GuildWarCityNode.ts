const { ccclass, property } = cc._decorator;

import { GuildWarConst } from '../../../const/GuildWarConst';
import { G_EffectGfxMgr, G_Prompt, G_SceneManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonGuildFlag from '../../../ui/component/CommonGuildFlag';
import { GuildWarDataHelper } from '../../../utils/data/GuildWarDataHelper';
import { Path } from '../../../utils/Path';
import UIHelper from '../../../utils/UIHelper';
import ViewBase from '../../ViewBase';
import PopupGuildWarCityInfo from './PopupGuildWarCityInfo';

@ccclass
export default class GuildWarCityNode extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageName: cc.Sprite = null;

    @property({
        type: CommonGuildFlag,
        visible: true
    })
    _nodeFlag: CommonGuildFlag = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageProclaim: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageMyPos: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeSword: cc.Node = null;

    _cfg: any;
    _swordEffect: any;

    initData(cfg) {
        this._cfg = cfg;
    }
    onCreate() {
        UIHelper.loadTexture(this._imageName, Path.getCountryBossText(this._cfg.name_pic));
        // this._imageName.ignoreContentAdaptWithSize(true);
        this._panelTouch.setContentSize(cc.size(this._cfg.range * 2, this._cfg.range * 2));
        this._imageProclaim.node.active = (false);
        this.node.setPosition(this._cfg.x, this._cfg.y);
    }
    updateUI() {
        var cityData = G_UserData.getGuildWar().getCityById(this._cfg.id);
        if (!cityData) {
            return;
        }
        var hasOwnGuild = cityData.getOwn_guild_id() != 0;
        this._nodeFlag.node.active = (hasOwnGuild);
        if (hasOwnGuild) {
            this._nodeFlag.updateUI(cityData.getOwn_guild_icon(), cityData.getOwn_guild_name());
        }
        var status = GuildWarDataHelper.getGuildWarStatus();
        if (status == GuildWarConst.STATUS_CLOSE) {
            this._imageProclaim.node.active = (cityData.isIs_declare());
        } else {
            this._imageProclaim.node.active = (false);
        }
        // logWarn(Path.getGuildWar('img_war_com02c'));
        var ownCityId = GuildWarDataHelper.getOwnCityId();
        var guildId = G_UserData.getGuild().getMyGuildId();
        var occupy = cityData.getOwn_guild_id() == guildId && guildId != 0;
        var inCityId = G_UserData.getGuildWar().getIn_city_id();
        if (status == GuildWarConst.STATUS_CLOSE) {
            this._visibleMyPos(false);
        } else if (inCityId != 0 && inCityId == this._cfg.id) {
            this._visibleMyPos(true);
        } else if (inCityId == 0 && occupy) {
            this._visibleMyPos(true);
        } else if (inCityId == 0 && ownCityId == null && cityData.isIs_declare()) {
            this._visibleMyPos(true);
        } else {
            this._visibleMyPos(false);
        }
    }
    onEnter() {
    }
    onExit() {
    }

    _visibleMyPos(show) {
        this.showSword(show);
    }
    onBtnGo() {
        var cityData = G_UserData.getGuildWar().getCityById(this._cfg.id);
        if (!cityData) {
            return;
        }
        var status = GuildWarDataHelper.getGuildWarStatus();
        if (status == GuildWarConst.STATUS_CLOSE) {
            let res = cc.resources.get("prefab/guildwar/PopupGuildWarCityInfo");
            let node1 = cc.instantiate(res) as cc.Node;
            let popup = node1.getComponent(PopupGuildWarCityInfo) as PopupGuildWarCityInfo;
            popup.initData(cityData.getCity_id());
            popup.openWithAction();
        } else {
            var ownCityId = GuildWarDataHelper.getOwnCityId();
            var currBattleCityId = GuildWarDataHelper.getCurrBattleCityId();
            var inCityId = G_UserData.getGuildWar().getIn_city_id();
            var guildId = G_UserData.getGuild().getMyGuildId();
            var occupy = cityData.getOwn_guild_id() == guildId && guildId != 0;
            var bool1 = inCityId != 0 && inCityId == this._cfg.id;
            var bool2 = inCityId == 0 && occupy;
            var bool3 = inCityId == 0 && ownCityId == null && cityData.isIs_declare();
            if (!cityData.isIs_declare() && ownCityId != cityData.getCity_id()) {
                G_Prompt.showTip(Lang.get('guildwar_enter_city_forbid_tip'));
            } else if (!bool1 && !bool2 && !bool3) {
                G_Prompt.showTip(Lang.get('guildwar_tips_not_in_city'));
            } else if (!currBattleCityId) {
                G_UserData.getGuildWar().c2sEnterGuildWar(this._cfg.id);
            } else if (currBattleCityId == this._cfg.id) {
                G_SceneManager.showScene('guildwarbattle', this._cfg.id);
            } else {
                G_UserData.getGuildWar().c2sEnterGuildWar(this._cfg.id);
            }
        }
    }
    _createSwordEft() {
        var effectFunction = function (effect) {

        }
        this._swordEffect = G_EffectGfxMgr.createPlayMovingGfx(this._nodeSword, 'moving_shuangjian', effectFunction.bind(this), null, false);
        this._swordEffect.node.setPosition(0, 0);
        this._swordEffect.node.setAnchorPoint(cc.v2(0.5, 0.5));
    }
    showSword(s) {
        if (!this._swordEffect) {
            this._createSwordEft();
        }
        // this.scheduleOnce(() => {
            this._swordEffect.node.active = (s);
        // }, 0.1);
    }

}