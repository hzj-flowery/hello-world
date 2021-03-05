import { ConfigNameConst } from "../../../const/ConfigNameConst";
import ParameterIDConst from "../../../const/ParameterIDConst";
import { SignalConst } from "../../../const/SignalConst";
import { Colors, G_ConfigLoader, G_EffectGfxMgr, G_SceneManager, G_SignalManager, G_UserData, G_Prompt } from "../../../init";
import { Lang } from "../../../lang/Lang";
import PopupBoxReward from "../../../ui/popup/PopupBoxReward";
import PopupChooseHeroHelper from "../../../ui/popup/PopupChooseHeroHelper";
import { PopupGetRewards } from "../../../ui/PopupGetRewards";
import { GuildDataHelper } from "../../../utils/data/GuildDataHelper";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import UIHelper from "../../../utils/UIHelper";
import { UIPopupHelper } from "../../../utils/UIPopupHelper";
import ViewBase from "../../ViewBase";
import GuildRequestHelpCell from "./GuildRequestHelpCell";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildRequestHelpNode extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeBgEffect: cc.Node = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonReceive: cc.Button = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textProgressTitle: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textProgress: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textMaxProgress: cc.Label = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listItemSource: cc.ScrollView = null;
    _curRequestPos: number;
    _signalGuildGetHelpListSuccess: any;
    _signalGuildAppHelp;
    _signalGuildReceiveHelp;
    _signalGuildReceiveHelpReward;
    _effect01: any;
    _effect02: any;
    _effect03: any;

    onCreate() {
        this._curRequestPos = 0;
        // this._buttonReceive.ignoreContentAdaptWithSize(true);
        // this._listItemSource.setTemplate(GuildRequestHelpCell);
        // this._listItemSource.setCallback(handler(this, this._onItemUpdate), handler(this, this._onItemSelected));
        // this._listItemSource.setCustomCallback(handler(this, this._onItemTouch));
        var handler = new cc.Component.EventHandler();
        handler.target = this.node;
        handler.component = "GuildRequestHelpNode";
        handler.handler = "_onButtonReceive";
        this._buttonReceive.clickEvents = [];
        this._buttonReceive.clickEvents.push(handler);
    }
    onEnter() {
        this._signalGuildGetHelpListSuccess = G_SignalManager.add(SignalConst.EVENT_GUILD_GET_HELP_LIST_SUCCESS, handler(this, this._onEventGuildGetHelpListSuccess));
        this._signalGuildAppHelp = G_SignalManager.add(SignalConst.EVENT_GUILD_APP_HELP_SUCCESS, handler(this, this._onApplySuccess));
        this._signalGuildReceiveHelp = G_SignalManager.add(SignalConst.EVENT_GUILD_RECEIVE_HELP_SUCCESS, handler(this, this._onReceiveSuccess));
        this._signalGuildReceiveHelpReward = G_SignalManager.add(SignalConst.EVENT_GUILD_RECEIVE_HELP_REWARD_SUCCESS, handler(this, this._onReceiveRewardSuccess));
    }
    onExit() {
        this._signalGuildGetHelpListSuccess.remove();
        this._signalGuildGetHelpListSuccess = null;
        this._signalGuildAppHelp.remove();
        this._signalGuildAppHelp = null;
        this._signalGuildReceiveHelp.remove();
        this._signalGuildReceiveHelp = null;
        this._signalGuildReceiveHelpReward.remove();
        this._signalGuildReceiveHelpReward = null;
    }
    updateView() {
        G_UserData.getGuild().c2sGetGuildHelp();
    }
    _updateInfo() {
        this._updateProgress();
        this._updateList();
    }
    _updateList() {
        this._listItemSource.content.removeAllChildren();
        this._listItemSource.content.height = 494;
        for (let i = 0; i < 3; i++) {
            var data = G_UserData.getGuild().getMyRequestHelpBaseDataWithPos(i + 1);
            var resource = cc.resources.get("prefab/guild/GuildRequestHelpCell");
            var node1 = cc.instantiate(resource) as cc.Node;
            let cell = node1.getComponent(GuildRequestHelpCell) as GuildRequestHelpCell;
            this._listItemSource.content.addChild(cell.node);
            cell._index = i;
            cell.setIdx(i);
            cell.setCustomCallback(handler(this, this._onItemTouch));
            cell.node.y = -170 * (i + 1);
            cell.updateData(i + 1, data);
        }
        // this._listItemSource.clearAll();
        // this._listItemSource.resize(3);
    }
    _onItemUpdate(item, index) {
        var pos = index + 1;
        var data = G_UserData.getGuild().getMyRequestHelpBaseDataWithPos(pos);
        item.update(pos, data);
    }
    _onItemSelected(item, index) {
    }
    _onItemTouch(index, key) {
        this._curRequestPos = index + 1;
        if (key == 'add') {
            // var resource = cc.resources.get("prefab/common/PopupChooseHero");
            // var node1 = cc.instantiate(resource) as cc.Node;
            // let popupChooseHero = node1.getComponent(PopupChooseHero);
            // var callBack = handler(this, this._onChooseHero);
            // popupChooseHero.updateUI(PopupChooseHeroHelper.FROM_TYPE6, callBack);
            // popupChooseHero.setTitle(Lang.get('guild_help_tab_title_1'));
            // popupChooseHero.openWithAction();
            UIPopupHelper.popupChooseHero(PopupChooseHeroHelper.FROM_TYPE6, handler(this, this._onChooseHero), null, Lang.get('guild_help_tab_title_1'))
        } else if (key == 'receive') {
            var helpNo = this._curRequestPos;
            G_UserData.getGuild().c2sUseGuildHelp(helpNo);
        }
    }
    _onButtonReceive() {
        var isReceived = G_UserData.getGuild().getUserGuildInfo().getGet_help_reward() != 0;
        var canReceived = G_UserData.getGuild().getUserGuildInfo().getFinish_help_cnt() >= G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.GUILD_RECOURSE_TIMES_ID);
        function callback() {
            G_UserData.getGuild().c2sGuildHelpReward();
        }
        var rewards = GuildDataHelper.getGuildRewardInfo();
        G_SceneManager.openPopup("prefab/common/PopupBoxReward", (popupBoxReward: PopupBoxReward) => {
            popupBoxReward.init(Lang.get('guild_help_box_title'), callback);
            popupBoxReward.updateUI(rewards);
            popupBoxReward.setDetailText('');
            popupBoxReward.openWithAction();
            if (isReceived) {
                popupBoxReward.setBtnText(Lang.get('common_btn_had_get_award'));
                popupBoxReward.setBtnEnable(false);
            } else if (canReceived) {
                popupBoxReward.setBtnText(Lang.get('common_btn_get_award'));
            } else {
                popupBoxReward.setBtnText(Lang.get('common_btn_get_award'));
                popupBoxReward.setBtnEnable(false);
            }
        });
    }
    _showBoxEffect() {
        if (this._effect01) {
            return;
        }
        this._effect01 = G_EffectGfxMgr.createPlayGfx(this._nodeBgEffect, 'effect_juntuanbaoxiang_b');
        this._effect02 = G_EffectGfxMgr.createPlayGfx(this._buttonReceive.node, 'effect_juntuanbaoxiang');
    }
    _hideBoxEffect() {
        if (this._effect01) {
            this._effect01.node.removeFromParent();
            this._effect01 = null;
        }
        if (this._effect02) {
            this._effect02.node.removeFromParent();
            this._effect02 = null;
        }
        if (this._effect03) {
            this._effect03.node.removeFromParent();
            this._effect03 = null;
        }
    }
    _updateProgress() {
        var isReceived = G_UserData.getGuild().getUserGuildInfo().getGet_help_reward() != 0;
        var count = G_UserData.getGuild().getUserGuildInfo().getFinish_help_cnt();
        var totalCount = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.GUILD_RECOURSE_TIMES_ID).content;
        this._textProgress.string = (count);
        this._textMaxProgress.string = (totalCount);
        this._textProgress.node.color = (count > 0 && Colors.DARK_BG_GREEN || Colors.DARK_BG_ONE);
        if (isReceived) {
            this._hideBoxEffect();
            UIHelper.loadBtnTexture(this._buttonReceive, Path.getGuildRes('img_baoxiang01c'));
        } else {
            if (count >= totalCount) {
                UIHelper.loadBtnTexture(this._buttonReceive, Path.getGuildRes('img_baoxiang01b'));
                this._showBoxEffect();
            } else {
                this._hideBoxEffect();
                UIHelper.loadBtnTexture(this._buttonReceive, Path.getGuildRes('img_baoxiang01'));
            }
        }
    }
    _onChooseHero(heroId, pos, heroData) {
        var unitData = heroData;
        var baseId = unitData.getBase_id();
        var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, baseId);
        G_UserData.getGuild().c2sAppGuildHelp(this._curRequestPos, param.cfg.fragment_id);
    }
    _onApplySuccess() {
        if (!G_UserData.getGuild().isInGuild()) {
            return;
        }
        this._updateList();
    }
    _onReceiveSuccess(eventName, award) {
        if (!G_UserData.getGuild().isInGuild()) {
            return;
        }
        this._updateList();
        this._updateProgress();
        G_Prompt.showAwards(award);
    }
    _onReceiveRewardSuccess(eventName, award) {
        if (!G_UserData.getGuild().isInGuild()) {
            return;
        }
        this._updateProgress();
        G_Prompt.showAwards(award);
    }
    _onEventGuildGetHelpListSuccess(event) {
        if (!G_UserData.getGuild().isInGuild()) {
            return;
        }
        this._updateInfo();
    }

}