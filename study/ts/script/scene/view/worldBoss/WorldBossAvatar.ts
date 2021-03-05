const { ccclass, property } = cc._decorator;

import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar'
import ViewBase from '../../ViewBase';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { G_UserData, Colors, G_EffectGfxMgr, G_SignalManager } from '../../../init';
import { WorldBossHelper } from './WorldBossHelper';
import { BullectScreenConst } from '../../../const/BullectScreenConst';
import { SignalConst } from '../../../const/SignalConst';
import { Util } from '../../../utils/Util';

@ccclass
export default class WorldBossAvatar extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeRole: cc.Node = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _commonHeroAvatar: CommonHeroAvatar = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _topNodeInfo: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textUserName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textOfficialName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textBossName: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffect: cc.Node = null;
    _playingMoving: boolean;
    _baseId: number;

    public static MOVE_TO_BOSS_OFFSET = 120;
    public static MOVE_TIME = 0.5;
    _userId: any;

    initData() {
        this._playingMoving = false;
        this._baseId = 0;
        this._commonHeroAvatar.init();
    }
    updatePlayerInfo(avatarData) {
        this.updateAvatar(avatarData);
        this.setPlayerName(avatarData.name, avatarData.officialLevel);
        this.setUserId(avatarData.userId);
        this.node.setScale(0.8);
        this._commonHeroAvatar.showTitle(avatarData.titleId, "WorldBossAvatar");
    }
    onCreate() {
        this.initData();
    }
    turnBack() {
        this._commonHeroAvatar.turnBack();
    }
    updateBaseId(baseId) {
        this._baseId = baseId;
        this._commonHeroAvatar.updateUI(baseId);
    }
    updateAvatar(avatarData) {
        this._baseId = avatarData.baseId;
        this._commonHeroAvatar.updateAvatar(avatarData.playerInfo);
    }
    setBossName(name) {
        var params = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, this._baseId);
        this._textBossName.string = (name);
        this._textOfficialName.node.active = (false);
        this._textUserName.node.active = (false);
        if (params) {
            this._textBossName.node.color = params.icon_color;
            if (this._textBossName.node.getComponent(cc.LabelOutline)) {
                this._textBossName.node.getComponent(cc.LabelOutline).color = params.icon_color_outline;
                this._textBossName.node.getComponent(cc.LabelOutline).width = 2;
            }
        }
    }
    setAction(ani, loop) {
        this._commonHeroAvatar.setAction(ani, loop);
    }
    setPlayerName(name, officialLevel) {
        this._textUserName.string = (name);
        this._textOfficialName.node.active = (true);
        this._textBossName.node.active = (false);
        if (officialLevel != null) {
            var officialInfo = G_UserData.getBase().getOfficialInfo(officialLevel)[0];
            if (officialInfo == null) {
                return;
            }
            this._textUserName.node.color = Colors.getOfficialColor(officialLevel);
            if (this._textUserName.node.getComponent(cc.LabelOutline)) {
                this._textUserName.node.getComponent(cc.LabelOutline).color = Colors.getOfficialColorOutline(officialLevel);
                this._textUserName.node.getComponent(cc.LabelOutline).width = 2;
            }

            this._textOfficialName.string = '[' + (officialInfo.name + ']');
            this._textOfficialName.node.color = Colors.getOfficialColor(officialLevel);
            if (this._textOfficialName.node.getComponent(cc.LabelOutline)) {
                this._textOfficialName.node.getComponent(cc.LabelOutline).color = Colors.getOfficialColorOutline(officialLevel);
                this._textOfficialName.node.getComponent(cc.LabelOutline).width = 2;
            }

        } else {
            this._textOfficialName.node.active = (false);
        }
    }
    setCallBack(callBack) {
        this._commonHeroAvatar.setTouchEnabled(true);
        this._commonHeroAvatar.setCallBack(callBack);
    }
    isPlaying() {
        return this._playingMoving;
    }
    _playShowEffect(onFinishCall) {
        var eventFunction = function (event) {
            if (event == 'finish') {
                if (onFinishCall) {
                    onFinishCall();
                }
                this._topNodeInfo.setVisible(true);
            }
        }.bind(this);
        this.node.active = (true);
        this._topNodeInfo.active = (false);
        this.resetAvatar();
        G_EffectGfxMgr.createPlayGfx(this.node, 'effect_juntuan_chuxian', eventFunction);
        G_EffectGfxMgr.applySingleGfx(this.node, 'smoving_juntuan_chuxian');
    }
    resetAvatar() {
        this._commonHeroAvatar.node.opacity = (255);
        this._commonHeroAvatar.node.setPosition(0, 0);
        this._commonHeroAvatar.node.setScale(1, 1)
    }
    playHitAction() {
        if (this._playingMoving == true) {
            return;
        }
        var seq = cc.sequence(cc.delayTime(0.2), cc.callFunc(function () {
            this._playingMoving = true;
            this._commonHeroAvatar.setAction('hit', false);
        }), cc.delayTime(BullectScreenConst.AVATAR_BOSS_HIT), cc.callFunc(function () {
            this._commonHeroAvatar.setAction('idle', true);
        }), cc.delayTime(BullectScreenConst.AVATAR_BOSS_HIT_FINISH), cc.callFunc(function () {
            this._playingMoving = false;
        }));
        this.node.runAction(seq);
    }
    _playDispearEffect(onFinishCall) {
        function eventFunction(event) {
            if (event == 'finish') {
                if (onFinishCall) {
                    onFinishCall();
                }
                this.resetAvatar();
            }
        }
        this.resetAvatar();
        this._topNodeInfo.active = (false);
        var gfxEffect = G_EffectGfxMgr.createPlayGfx(this._nodeEffect, 'effect_juntuan_xiaoshi', eventFunction);
        G_EffectGfxMgr.applySingleGfx(this._commonHeroAvatar.node, 'smoving_juntuan_xiaoshi');
    }
    _getBossTargetPos() {
        var worldBossPos = WorldBossHelper.getBossPosition();
        var offset = cc.v2(WorldBossAvatar.MOVE_TO_BOSS_OFFSET + Util.getRandomInt(BullectScreenConst.MOVE_TO_BOSS_OFFSETX.x, BullectScreenConst.MOVE_TO_BOSS_OFFSETX.y), Util.getRandomInt(BullectScreenConst.MOVE_TO_BOSS_OFFSETY.x, BullectScreenConst.MOVE_TO_BOSS_OFFSETY.y));
        var targetPos = cc.v2(worldBossPos.x - offset.x, offset.y + worldBossPos.y);
        return targetPos;
    }
    playImmAttack() {
        if (this._playingMoving == true) {
            return false;
        }
        this._playingMoving = true;
        var x = this.node.getPosition().x;
        var y = this.node.getPosition().y;
        this.setAction('idle', true);
        var worldBossPos = WorldBossHelper.getBossPosition();
        var targetPos = this._getBossTargetPos();
        var seq = cc.sequence(cc.callFunc(function () {
            this._playShowEffect();
        }), cc.delayTime(BullectScreenConst.AVATAR_IM_DELAY), cc.callFunc(function () {
            this.setAction('run', true);
        }), cc.moveTo(BullectScreenConst.AVATAR_IM_MOVE_TIME, targetPos), cc.callFunc(function () {
            if (this.isAnimExit(BullectScreenConst.ATTACK_NAME)) {
                this.setAction(BullectScreenConst.ATTACK_NAME, false);
            }
            G_SignalManager.dispatch(SignalConst.EVENT_BULLET_BOSS_HIT);
        }), cc.delayTime(BullectScreenConst.AVATAR_ATTACK_ACITON), cc.callFunc(function () {
            this.setAction('idle', false);
            this._playDispearEffect(function () {
                this.setVisible(false);
                this.setPosition(x, y);
                this._playingMoving = false;
            });
        }));
        this.node.runAction(seq);
        return true;
    }
    isAnimExit(name) {
        return this._commonHeroAvatar.isAnimExit(name);
    }
    playGoAttack(attackPos) {
        if (this._playingMoving == true) {
            return;
        }
        this._playingMoving = true;
        var x = this.node.getPosition().x;
        var y = this.node.getPosition().y;
        this.setAction('run', true);
        var worldBossPos = WorldBossHelper.getBossPosition();
        var targetPos = this._getBossTargetPos();
        var seq = cc.sequence(cc.moveTo(BullectScreenConst.AVATAR_GA_MOVE_TIME, targetPos), cc.callFunc(function () {
            if (this.isAnimExit(BullectScreenConst.ATTACK_NAME)) {
                this.setAction(BullectScreenConst.ATTACK_NAME, false);
            } else {
                this.setAction(BullectScreenConst.ATTACK_NAME_NO_ATTACK, true);
            }
            G_SignalManager.dispatch(SignalConst.EVENT_BULLET_BOSS_HIT);
        }), cc.delayTime(BullectScreenConst.AVATAR_ATTACK_ACITON), cc.callFunc(function () {
            this._playDispearEffect();
        }), cc.delayTime(BullectScreenConst.AVATAR_IM_DELAY), cc.callFunc(function () {
            this.setVisible(true);
            this.setPosition(cc.v2(-568, y));
            this.setAction('run', true);
        }), cc.delayTime(0.2), cc.moveTo(BullectScreenConst.AVATAR_GA_MOVE_BACK_TIME, cc.v2(x, y)), cc.callFunc(function () {
            this.setAction('idle', true);
            this._playingMoving = false;
            this._topNodeInfo.setVisible(true);
        }));
        this.node.runAction(seq);
    }
    playMovingEffect(callBack) {
        // logWarn('WorldBossView:_playMovingEffect');
        this._playingMoving = true;
        var x = this.node.getPosition().x;
        var y = this.node.getPosition().y;
        this.setAction('run', true);
        var worldBossPos = WorldBossHelper.getBossPosition();
        // dump(worldBossPos);
        var action1 = cc.moveTo(WorldBossAvatar.MOVE_TIME, cc.v2(worldBossPos.x - WorldBossAvatar.MOVE_TO_BOSS_OFFSET, worldBossPos.y));
        var action2 = cc.callFunc(function () {
            this._playingMoving = false;
            if (callBack) {
                callBack();
            }
        }.bind(this));
        var seq = cc.sequence(action1, action2);
        this.node.runAction(seq);
    }
    onEnter() {
        this._playingMoving = false;
        // this._commonHeroAvatar.setTouchEnabled(false);
    }
    onExit() {
    }
    setUserId(userId) {
        this._userId = userId;
    }
    getUserId() {
        return this._userId;
    }

}