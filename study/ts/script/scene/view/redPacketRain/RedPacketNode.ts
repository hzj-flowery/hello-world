import { AudioConst } from "../../../const/AudioConst";
import { RedPacketRainConst } from "../../../const/RedPacketRainConst";
import { SignalConst } from "../../../const/SignalConst";
import { Colors, G_AudioManager, G_EffectGfxMgr, G_SignalManager, G_UserData } from "../../../init";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import ViewBase from "../../ViewBase";

const { ccclass, property } = cc._decorator;

var INFO = {
    [RedPacketRainConst.TYPE_BIG]: {
        normal: 'img_bigbag',
        open: 'img_bigbag_open',
        effectFront: 'effect_hongbaofaguang_up',
        effectBack: 'effect_hongbaofaguang_down'
    },
    [RedPacketRainConst.TYPE_SMALL]: {
        normal: 'img_small',
        scale: 1,
        open: 'img_small_open',
        dropTime: 1.5
    }
};

@ccclass
export default class RedPacketNode extends ViewBase {
    @property({
        type: cc.Node,
        visible: true
    })
    _effectBack: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBg: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _effectFront: cc.Node = null;
    _data: any;
    _isOpened: boolean;
    _index: any;
    _onDisappear: Function;


    ctor(data, index, onDisappear) {
        this._data = data;
        this._index = index;
        this._onDisappear = onDisappear;
        UIHelper.addEventListenerToNode(this.node, this._imageBg.node, 'RedPacketNode', '_onClicked');
    }
    onCreate() {
        this._isOpened = false;
        this._updateUI();
    }
    onEnter() {
    }
    onExit() {
    }
    _updateUI() {
        var type = this._data.getRedpacket_type();
        var resName = INFO[type].normal;
        UIHelper.loadTexture(this._imageBg, Path.getRedBagImg(resName));
        var effectFront = INFO[type].effectFront;
        var effectBack = INFO[type].effectBack;
        if (effectFront) {
            G_EffectGfxMgr.createPlayGfx(this._effectFront, effectFront, null, false);
        }
        if (effectBack) {
            G_EffectGfxMgr.createPlayGfx(this._effectBack, effectBack, null, false);
        }
    }

    playDrop() {
        var type = this._data.getRedpacket_type();
        var dropTime = INFO[type].dropTime || 1;
        var moveBy = cc.moveBy(dropTime, cc.v2(0, -540));
        var easeSineIn = moveBy.easing(cc.easeSineIn());
        var fadeOut = cc.fadeOut(RedPacketRainConst.TIME_DISAPPEAR);
        var seq = cc.sequence(easeSineIn, fadeOut, cc.callFunc(() => {
            this._onDisappear(this._index);
        }, cc.removeSelf()));
        this.node.runAction(seq)
    }

    _onClicked() {
        if (this._isOpened) {
            return;
        }
        if (this._data.isReal()) {
            G_UserData.getRedPacketRain().c2sGetNewRedPacket(this._data.getId());
        } else {
            G_SignalManager.dispatch(SignalConst.EVENT_RED_PACKET_RAIN_GET_SUCCESS, this._data.getId());
        }
        G_AudioManager.playSoundWithId(AudioConst.SOUND_RED_PACKAGE_OPEN);
        this.node.stopAllActions();
        let effectFunction = function (effect) {
            if (effect == 'shuzi') {
                var money = this._data.getMoney();
                var num = UIHelper.createLabel({
                    text: '+' + money,
                    fontSize: 30,
                    color: Colors.getNumberColor(6),
                    outlineColor: cc.color(183, 34, 9, 255)
                });
                var node = new cc.Node();
                var gold = UIHelper.newSprite(Path.getCommonIcon('vip', '1'));
                gold.node.setPosition(cc.v2(0, 40));
                node.addChild(gold.node);
                node.addChild(num);
                return node;
            }
            return new cc.Node();
        }.bind(this);
        let eventFunction = function (event) {
            if (event == 'finish') {
                this._disappear();
            }
        }.bind(this);
        var type = this._data.getRedpacket_type();
        UIHelper.loadTexture(this._imageBg, Path.getRedBagImg(INFO[type].open));
        this._isOpened = true;
        if (this._data.isReal()) {
            G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_hongbao_open', effectFunction, eventFunction, true);
        } else {
            this._disappear();
        }
    }
    _disappear() {
        this.node.runAction(cc.sequence(cc.fadeOut(0.1), cc.callFunc(() => {
            this._onDisappear(this._index);
        }), cc.destroySelf()));
    }
}