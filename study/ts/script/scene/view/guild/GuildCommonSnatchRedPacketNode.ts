import { G_SignalManager, G_AudioManager, G_EffectGfxMgr, G_UserData } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import { handler } from "../../../utils/handler";
import { AudioConst } from "../../../const/AudioConst";
import UIHelper from "../../../utils/UIHelper";
import { Path } from "../../../utils/Path";
import { LogicCheckHelper } from "../../../utils/LogicCheckHelper";
import { GuildCheck } from "../../../utils/logic/GuildCheck";
import ViewBase from "../../ViewBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildCommonSnatchRedPacketNode extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRedPacket: cc.Sprite = null;

    public static readonly LIGHT_EFFECT_NAMES = {
        1: 'effect_hongbao_white',
        2: 'effect_hongbao_blue',
        3: 'effect_hongbao_orange',
        6: 'effect_hongbao_purple'
    };
    _currRedPacketData: any;
    _signalGuildRedPacketOpenNotice: any;

    initData(redPacketData) {
        this._currRedPacketData = redPacketData;
    }
    onCreate() {
    }
    onEnter() {
        this._signalGuildRedPacketOpenNotice = G_SignalManager.add(SignalConst.EVENT_GUILD_RED_PACKET_OPEN_NOTICE, handler(this, this._onEventGuildRedPacketOpenNotice));
        this._updateffect();
    }
    onExit() {
        this._signalGuildRedPacketOpenNotice.remove();
        this._signalGuildRedPacketOpenNotice = null;
    }
    onButton(sender) {
        this._onClick();
    }
    _onClick() {
        var redPacketData = G_UserData.getGuild().getCurrSnatchRedPacket();
        // assert(redPacketData, 'cannot find redPacketData');  
        var res = GuildCheck.checkGuildCanSnatchRedPacket(null);
        let success = res[0];
        if (success) {
            G_UserData.getGuild().c2sOpenGuildRedBag(redPacketData.getId());
        }
    }
    _onEventGuildRedPacketOpenNotice(event, redPacketData, openRedBagUserList) {
    }
    updateRedPacketData(redPacketData) {
        var different = this._currRedPacketData.getId() != redPacketData.getId();
        this._currRedPacketData = redPacketData;
        if (different) {
            this._updateffect();
        }
    }
    _updateffect() {
        G_AudioManager.playSoundWithId(AudioConst.SOUND_RED_PACKAGE_OPEN);
        var multiple = this._currRedPacketData.getMultiple();
        var lightEffect = GuildCommonSnatchRedPacketNode.LIGHT_EFFECT_NAMES[multiple];
        this._panelTouch.removeAllChildren();
        var config = this._currRedPacketData.getConfig();
        var eventFunction = function (event) {
            if (event == 'finish') {
                G_EffectGfxMgr.createPlayGfx(this._panelTouch, lightEffect, null, true);
                var effect_res = config.show == 1 ? 'effect_hongbao_fangda' : 'effect_hongbao_fangdanew';
                G_EffectGfxMgr.createPlayGfx(this._panelTouch, effect_res, null, true);
            }
        }.bind(this);
        var effect_res = config.show == 1 ? 'effect_hongbao_chuxian' : 'effect_hongbao_chuxiannew';
        G_EffectGfxMgr.createPlayGfx(this._panelTouch, effect_res, handler(this, eventFunction), true);
        var bgRes = config.show == 1 ? 'img_lit_hongbao_03' : 'img_lit_hongbao_03_2';
        // UIHelper.loadTexture(this._imageRedPacket, Path.getGuildRes(bgRes))
    }

}