import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { CrossWorldBossConst } from "../../../const/CrossWorldBossConst";
import FlashPlayer from "../../../flash/FlashPlayer";
import { Colors, G_AudioManager, G_ConfigLoader, G_EffectGfxMgr, G_ServerTime, G_UserData } from "../../../init";
import CommonHeroAvatar from "../../../ui/component/CommonHeroAvatar";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import ViewBase from "../../ViewBase";
import { CrossWorldBossHelperT } from "./CrossWorldBossHelperT";

var FLY_SPEED = 800;
var FLY_HEIGHT = 500;
const { ccclass, property } = cc._decorator;

@ccclass
export default class CrossWorldBossPlayerAvatarNode extends ViewBase {
    name: 'CrossWorldBossPlayerAvatarNode';
    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _commonHeroAvatar: CommonHeroAvatar = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodePlatform: cc.Node = null;
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


    private _bezierFlyTimer: Function;
    private _pozhenPos: cc.Vec2;
    private _baseId: number = 0;
    private _inMoving: boolean;
    private _inAttacking: boolean = false;
    private _isRandomMoving: boolean = false;
    private _isPozhaoCamp: boolean = false;
    private _hitdownIndex: number = 0;
    private _moveEndCallback: Function;
    private _moveTimer: Function;
    private _idlePos: cc.Vec2;
    private _loweryBoundaryX: number;
    private _upperyBoundaryX: number;
    private _randomMoveParam: any;
    private _moveYDistance: number;
    private _moveXDistance: number;
    private _targetPosX: number;
    private _targetPosY: number;
    private _moveTime: number;
    private _pauseTime: number;
    private _positionDeltaX: number;
    private _positionDeltaY: number;
    private _startPositionX: number;
    private _startPositionY: number;
    private _elapsed: number;
    private _duration: number;
    private _liedownAndBackAction: cc.Action;
    private _userId: number;
    private _flashObj: FlashPlayer;
    private _startPlayFly: boolean;
    private _avatarData: any;
    private _targetRotate: number;
    private _stopRandomMove: any;
    private _bezierPos1: cc.Vec2;
    private _bezierPos2: cc.Vec2;
    private _bezierPos3: cc.Vec2;
    private _bezierTime: number;
    private _curBezierTime: number;
    private _flyActionMoveEndCallBack: Function;
    onCreate() {
       
        this._commonHeroAvatar.init();
        this._commonHeroAvatar.setScale(0.7);
        this.node.name = "CrossWorldBossPlayerAvatarNode";
    }
    onEnter() {
    }
    onExit() {
        this._endMoveTimer();
        if (this._bezierFlyTimer) {
            this.unschedule(this._bezierFlyTimer);
            this._bezierFlyTimer = null;
        }
        this.node.stopAllActions();
    }
    moveToSuperAttackPos(pos) {
        cc.log('moveToSuperAttackPos');
        this._pozhenPos = pos;
        if (this._inAttacking || this._inMoving) {
            return;
        }
        this._moveEndCallback = null;
        this.node.stopAllActions();
        this.moveToPos(this._pozhenPos.x, this._pozhenPos.y, 0.8,()=> {
            this.turnBack(this._pozhenPos&&this._pozhenPos.x > 568);
            this._commonHeroAvatar.setAction('idle', true);
        });
    }
    backToStandPos(t?) {
        cc.log('backToStandPos, id = ' + this._baseId);
        var pos = this._pozhenPos || this._idlePos;
        if (this._inAttacking) {
            return;
        }
        this._moveEndCallback = null;
        var time = t || 1.2;
        this.node.stopAllActions();
        this.moveToPos(pos.x, pos.y, time, () => {
            cc.log('finish backToStandPos, id = ' + this._baseId);
            this.turnBack(pos.x > 568);
            this._isRandomMoving = false;
            if (this._pozhenPos && this._pozhenPos.x != pos.x && this._pozhenPos.y != pos.y) {
                this.backToStandPos();
            } else {
                this._commonHeroAvatar.setAction('idle', true);
            }
        });
    }
    backToIdlePos(t?) {
        cc.log('backToIdlePos, id = ' + this._baseId);
        this._pozhenPos = null;
        if (this._inAttacking) {
            return;
        }
        this._moveEndCallback = null;
        var time = t || 0.8;
        this.node.stopAllActions();
        this.moveToPos(this._idlePos.x, this._idlePos.y, time,()=> {
            cc.log('finish backToIdlePos, id = ' + this._baseId);
            this.turnBack(this._idlePos.x > 568);
            this._isRandomMoving = false;
            this._commonHeroAvatar.setAction('idle', true);
        });
    }
    beginRandowMove(param) {
        this._randomMoveParam = param;
        this._doOneRandomMove();
    }
    _handleRandomMoveParam(param) {
        let pos = this.node.getPosition();
        var posX = pos.x;
        let posY = pos.y;
        this._loweryBoundaryX = param.loweryBoundaryX;
        this._upperyBoundaryX = param.upperyBoundaryX;
        var random1 = Math.random();
        this._moveXDistance = param.lowerMoveDisX + random1 * (param.upperMoveDisX - param.lowerMoveDisX);
        if (posX - this._loweryBoundaryX < 5) {
            this._moveXDistance = Math.abs(this._moveXDistance);
        } else if (this._upperyBoundaryX - posX < 5) {
            this._moveXDistance = -Math.abs(this._moveXDistance);
        }
        var random2 = Math.random();
        this._moveYDistance = param.lowerMoveDisY + random2 * (param.upperMoveDisY - param.lowerMoveDisY);
        var curMaxY = G_UserData.getCrossWorldBoss().getMaxYByX(Math.ceil(posX));
        if (curMaxY - posY < 10) {
            this._moveYDistance = -Math.abs(this._moveYDistance);
        }
        this._targetPosY = posY + this._moveYDistance;
        this._targetPosX = posX + this._moveXDistance;
        var targetMaxY = G_UserData.getCrossWorldBoss().getMaxYByX(Math.ceil(this._targetPosX));
        this._targetPosY = Math.min(targetMaxY, Math.max(0, this._targetPosY));
        this._targetPosX = Math.min(this._upperyBoundaryX, Math.max(this._loweryBoundaryX, this._targetPosX));
        var random3 = Math.random();
        this._moveTime = param.lowerTime + random3 * (param.upperTime - param.lowerTime);
        var random4 = Math.random();
        this._pauseTime = param.lowerPauseTime + random4 * (param.upperPauseTime - param.lowerPauseTime);
    }
    _doOneRandomMove() {
        if (this._isRandomMoving) {
            return;
        }
        this._handleRandomMoveParam(this._randomMoveParam);
        this._isRandomMoving = true;
        this.moveToPos(this._targetPosX, this._targetPosY, this._moveTime, () => {
            var idleAction = cc.callFunc(() => {
                this._commonHeroAvatar.setAction('idle', true);
            });
            var delayAction2 = cc.delayTime(this._pauseTime);
            var finishAction = cc.callFunc(() => {
                this._isRandomMoving = false;
                if (this._stopRandomMove) {
                } else {
                    this._doOneRandomMove();
                }
            });
            var action = cc.sequence(idleAction, delayAction2, finishAction);
            this.node.runAction(action);
        });
    }
    moveToPos(x, y, t, callback) {
        let pos = this.node.getPosition();;
        var curPosX = pos.x;
        let curPosY = pos.y;
        this._endMoveTimer();
        this._inMoving = true;
        if (t <= 0 || x == curPosX && y == curPosY) {
            this.node.setPosition(x, y);
            this._inMoving = false;
            return;
        }
        this._moveEndCallback = callback;
        this._positionDeltaX = x - curPosX;
        this._positionDeltaY = y - curPosY;
        this._startPositionX = curPosX;
        this._startPositionY = curPosY;
        this._elapsed = 0;
        this._duration = t;
        this._moveTimer = handler(this, this._moveUpdate);
        this.schedule(this._moveTimer, 1 / 30);
        this.turnBack(x < curPosX);
        this._commonHeroAvatar.setAction('run', true);
        this.node.cascadeOpacity = (true);
    }
    _endMoveTimer() {
        if (this._moveTimer) {
            this.unschedule(this._moveTimer);
            this._moveTimer = null;
        }
    }
    _moveUpdate(f) {
        var newPosX, newPosY;
        var percent = Math.max(0, Math.min(1, (this._elapsed + f) / this._duration));
        newPosX = this._startPositionX + this._positionDeltaX * percent;
        newPosY = this._startPositionY + this._positionDeltaY * percent;
        this._elapsed = this._elapsed + f;
        if (this._elapsed >= this._duration) {
            if (this._moveEndCallback) {
                this._moveEndCallback();
                this._moveEndCallback = null;
            }
            this._endMoveTimer();
            this._inMoving = false;
        }
        var scale = 1 - 0.36 * Math.min(1, newPosY / 400);
        this.node.setScale(scale);
        this.node.zIndex = (10000 - newPosY);
        this.node.setPosition(newPosX, newPosY);
    }
    isAttacking() {
        return this._inAttacking;
    }
    doAttack(callback, bossAvatar, bulletId?, isForceAttack?) {
        cc.log('doAttack, id = ' + this._baseId);
        let _tempThis = this;
        if (this._inAttacking) {
            return;
        }
        if (this._inMoving) {
            if (isForceAttack) {
                this._endMoveTimer();
                this._inMoving = false;
            } else {
                return;
            }
        }
        if (this._liedownAndBackAction) {
            this.node.stopAction(this._liedownAndBackAction);
            this._liedownAndBackAction = null;
        }
        this._inAttacking = true;
        let pos = this.node.getPosition();
        var posX = pos.x;
        let posY = pos.y;
        var attackPos = null;
        if (posX > 0) {
            attackPos = G_UserData.getCrossWorldBoss().getRightAttackPos();
        } else {
            attackPos = G_UserData.getCrossWorldBoss().getLeftAttackPos();
        }
        if (this._isPozhaoCamp == true && this._pozhenPos) {
            var attackAction = cc.callFunc(()=>{
                this._playAniAndSound();
            });
            var delayAction1 = cc.delayTime(2);
            var stopAttackAction = cc.callFunc(
                ()=>{
                    this._stopAniAndSound();
                });
            var bossAttackedAction = cc.callFunc(() => {
                if (bossAvatar) {
                    bossAvatar.bossAttackedCallback(this._isPozhaoCamp, posX);
                }
            });
            var delayAction2 = cc.delayTime(0.5);
            var rebornAction = cc.callFunc(() => {
                this._inAttacking = false;
                if (callback) {
                    callback();
                }
                this._reborn();
            });
            var action = cc.sequence(attackAction, delayAction1, stopAttackAction, bossAttackedAction, delayAction2, rebornAction);
            this.node.runAction(action);
        } else {
            this.moveToPos(attackPos.x, attackPos.y, 0.5, () => {
                if (callback) {
                    callback();
                    this._reborn();
                } else {
                    if (this._isPozhaoCamp == false) {
                        var actionsArray = [];
                        var attackAction = cc.callFunc(()=>{
                            this._playAniAndSound();
                        });
                        var delayAction1 = cc.delayTime(0.8);
                        var stopAttackAction = cc.callFunc(()=>{
                            this._stopAniAndSound();
                        });
                        var disappearAction = cc.callFunc(() => {
                            var dieAction = cc.callFunc(()=>{
                                this._playFantanAnimation();
                            });
                            var bossAttackedAction = cc.callFunc(() => {
                                if (bossAvatar) {
                                    bossAvatar.bossAttackedCallback(this._isPozhaoCamp, posX);
                                }
                            });
                            var rebornAction = cc.callFunc(()=>{
                                this._playDisappearAndRebornEffect();
                            });
                            var disappearActionArray = [];
                            var bossState = G_UserData.getCrossWorldBoss().getState();
                            if (this._userId == G_UserData.getBase().getId() && bossState == CrossWorldBossConst.BOSS_CHARGE_STATE || bulletId == 601) {
                                disappearActionArray = [
                                    dieAction,
                                    bossAttackedAction
                                ];
                            } else {
                                disappearActionArray = [
                                    bossAttackedAction,
                                    rebornAction
                                ];
                            }
                            var action1 = cc.sequence(disappearActionArray);
                            this.node.runAction(action1);
                        });
                        actionsArray = [
                            attackAction,
                            delayAction1,
                            stopAttackAction,
                            disappearAction
                        ];
                        var action = cc.sequence(actionsArray);
                        this.node.runAction(action);
                    } else {
                        var attackAction = cc.callFunc(()=>{
                            this._playAniAndSound()
                        });
                        var delayAction1 = cc.delayTime(1.5);
                        var stopAttackAction = cc.callFunc(()=>{
                            this._stopAniAndSound();
                        });
                        var bossAttackedAction = cc.callFunc(() => {
                            if (bossAvatar) {
                                bossAvatar.bossAttackedCallback(this._isPozhaoCamp, posX);
                            }
                        });
                        var rebornAction = cc.callFunc(()=>{
                            this._playDisappearAndRebornEffect()
                        });
                        var action = cc.sequence(attackAction, delayAction1, stopAttackAction, bossAttackedAction, rebornAction);
                        this.node.runAction(action);
                    }
                }
            });
        }
    }
    _playDisappearAndRebornEffect() {
        let eventFunction = function (event) {
            if (event == 'finish') {
                var posX = this.node.x
                var posY = this.node.y;
                if (posX > 0) {
                    this.node.setPosition(1336-cc.winSize.width/2, 280-cc.winSize.height/2);
                } else {
                    this.node.setPosition(-200-cc.winSize.width/2, 280-cc.winSize.height/2);
                }
                this._nodePlatform.active = (true);
                this._nodePlatform.opacity = (255);
                this._nodePlatform.scale = (1);
                this._inAttacking = false;
                this.backToStandPos(1);
            }
        }.bind(this);
        var gfxEffect = G_EffectGfxMgr.createPlayGfx(this.node, 'effect_juntuan_xiaoshi', eventFunction);
        G_EffectGfxMgr.applySingleGfx(this._nodePlatform, 'smoving_juntuan_xiaoshi');
    }
    updatePlayerInfo(avatarData) {
        this._avatarData = avatarData;
        this.updateAvatar(avatarData);
        this.setPlayerName(avatarData.name, avatarData.officialLevel);
        this.setUserId(avatarData.userId);
        this._commonHeroAvatar.showTitle(avatarData.titleId, this.node.name);
    }
    setUserId(userId) {
        this._userId = userId;
    }
    setHitdownIndex(index) {
        this._hitdownIndex = index;
    }
    getHitdownIndex() {
        return this._hitdownIndex;
    }
    setIsPozhaoCamp(flag) {
        this._isPozhaoCamp = flag;
    }
    getIsPozhaoCamp() {
        return this._isPozhaoCamp;
    }
    updateAvatar(avatarData) {
        this._baseId = avatarData.baseId;
        this._commonHeroAvatar.init();
        this._commonHeroAvatar.setScale(0.7);
        this._commonHeroAvatar.updateAvatar(avatarData.playerInfo);
    }
    playAnimationOnce(animName) {
        this._commonHeroAvatar.playAnimationOnce(animName);
    }
    _playAttackAnimation() {
        this._commonHeroAvatar.setAction('skill1', false);
    }
    _stopAniAndSound() {
        if (this._flashObj) {
            this._flashObj.finish();
            this._flashObj = null;
        }
        var [hero, shadow] = this._commonHeroAvatar.getFlashEntity();
        shadow.setPosition(cc.v2(0, 0));
        var bossState = G_UserData.getCrossWorldBoss().getState();
        if (bossState == CrossWorldBossConst.BOSS_WEAK_STATE) {
            var stateStartTime = G_UserData.getCrossWorldBoss().getState_startTime();
            var curTime = G_ServerTime.getTime();
            var stateContinueTime = CrossWorldBossHelperT.getParameterValue('weak_last_time');
            var weekTime = stateStartTime + stateContinueTime - curTime;
            weekTime = Math.min(weekTime, stateContinueTime);
            if (weekTime <= stateContinueTime - 5) {
                G_AudioManager.stopAllSound();
            }
        } else {
            G_AudioManager.stopAllSound();
        }
    }
    _playAniAndSound() {
        let getAttackAction = function () {
            var playerInfo = this._avatarData.playerInfo;
            if (playerInfo.limit == 1) {
                var retId = '91' + (playerInfo.covertId + '001');
                return parseInt(retId);
            } else {
                if (playerInfo.covertId < 100) {
                    if (playerInfo.covertId < 10) {
                        return 1001;
                    }
                    if (playerInfo.covertId > 10) {
                        return 11001;
                    }
                }
                var retId = playerInfo.covertId + '001';
                return parseInt(retId);
            }
        }.bind(this);
        var [hero, shadow] = this._commonHeroAvatar.getFlashEntity();
        var attackId = getAttackAction();
        var hero_skill_play = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_PLAY);
        var skillData = hero_skill_play.get(attackId);
        if (skillData) {
            if (this._flashObj) {
                this._flashObj.finish();
                this._flashObj = null;
            }
            var ani = Path.getAttackerAction(skillData.atk_action);
            var posX = this.node.x;
            let posY = this.node.y;
            cc.resources.load(ani, cc.JsonAsset, (err, res: cc.JsonAsset) => {
                if (res == null || !hero.node || !hero.node.isValid) {
                    return;
                }
                this._flashObj = new FlashPlayer(hero, shadow, ani, posX > 568, this._commonHeroAvatar, true);
                this._flashObj.start();
            })

        }
    }
    _playDieAnimation() {
        this._commonHeroAvatar.setAction('hitlie', false);
    }
    liedownAndGotoIdlepos(index?) {
        cc.log('self._hitdownIndex ' + this._hitdownIndex);
        if (this._inAttacking || this._inMoving) {
            this._pozhenPos = null;
            return;
        }
        var delayAction1 = cc.delayTime(0.5 + this._hitdownIndex * 0.2);
        var hitlieAction = cc.callFunc(() => {
            this._commonHeroAvatar.setAction('hitlie', false);
        });
        var delayAction2 = cc.delayTime((6 - this._hitdownIndex) * 0.2);
        var backAction = cc.callFunc(() => {
            if (this._pozhenPos) {
                this.backToIdlePos();
            } else {
                this._commonHeroAvatar.setAction('idle', true);
            }
            this._liedownAndBackAction = null;
        });
        this._liedownAndBackAction = cc.sequence(delayAction1, hitlieAction, delayAction2, backAction);
        this.node.runAction(this._liedownAndBackAction);
    }
    _playFantanAnimation() {
        this._commonHeroAvatar.setAction('hitfly', true);
        this._startFlyAction(()=> {
            this._inAttacking = false;
            this.backToIdlePos();
        });
    }
    _startFlyAction(callback) {
        if (this._startPlayFly) {
            return;
        }
        var p1x = this.node.x;
        let p1y = this.node.y;
        var distance = Math.random() * 70 + 680;
        var p1 = cc.v2(p1x, p1y);
        var p2 = cc.v2(0, 0);
        var p3 = cc.v2(0, p1.y);
        if (p1x > 0) {
            p3.x = p1.x + distance;
            p2.x = p1.x + distance / 2.5;
        } else {
            p3.x = p1.x - distance;
            p2.x = p1.x - distance / 2.5;
        }
        p2.y = p1.y + FLY_HEIGHT;
        this._targetRotate = -30;
        this._bezierPos1 = p1;
        this._bezierPos2 = p2;
        this._bezierPos3 = p3;
        this._bezierTime = distance / FLY_SPEED;
        this._curBezierTime = 0;
        this._startPlayFly = true;
        this._flyActionMoveEndCallBack = callback;
        if (this._bezierFlyTimer) {
            this.unschedule(this._bezierFlyTimer);
            this._bezierFlyTimer = null;
        }
        this._bezierFlyTimer = handler(this, this._flyUpdate)
        this.schedule(this._bezierFlyTimer, 1 / 30);
        this.node.angle = (0);
    }
    _flyCurveFunc(t) {
        return 1 - (t * 0.5 - 0.5) * (t * 0.5 + 3 * t * 0.5 - 2);
    }
    _getBezierPos(t: number) {
        var k1 = (1 - t) * (1 - t);
        var k2 = 2 * t * (1 - t);
        var k3 = t * t;
        var x = k1 * this._bezierPos1.x + k2 * this._bezierPos2.x + k3 * this._bezierPos3.x;
        var y = k1 * this._bezierPos1.y + k2 * this._bezierPos2.y + k3 * this._bezierPos3.y;
        return cc.v2(x, y);
    }
    _flyUpdate(t) {
        if (this._startPlayFly) {
            this._curBezierTime = this._curBezierTime + t;
            var percent = this._curBezierTime / this._bezierTime;
            if (percent >= 1) {
                percent = 1;
            }
            t = this._flyCurveFunc(percent);
            var pos = this._getBezierPos(t);
            this.node.setPosition(pos);
            if (Math.abs(pos.x) < Math.abs(this._bezierPos2.x)) {
                var rPercent = Math.abs((pos.x - this._bezierPos1.x) / (this._bezierPos2.x - this._bezierPos1.x));
                this.node.angle = (this._targetRotate * rPercent);
            }
            if (percent == 1) {
                this._startPlayFly = false;
                this.node.angle = (0);
                if (this._flyActionMoveEndCallBack) {
                    this._flyActionMoveEndCallBack();
                }
                if (this._bezierFlyTimer) {
                    this.unschedule(this._bezierFlyTimer);
                    this._bezierFlyTimer = null;
                }
            }
        }
    }
    setIdleAction() {
        this._commonHeroAvatar.setAction('idle', true);
    }
    _reborn() {
        var pos = this._pozhenPos || this._idlePos;
        this.setPos(pos);
        this.node.opacity = (255);
        this._inAttacking = false;
        this._endMoveTimer();
        this.setIdleAction();
        this._inMoving = false;
    }
    _changeScaleAndZorderByPos(_, newPos) {
        var newPosX, newPosY, oldPosX, oldPosY;
        oldPosX = this.node.x;
        oldPosY = this.node.y;
        if (newPos) {
            newPosX = newPos.x;
            newPosY = newPos.y;
        } else {
            newPosX = this.node.x;
            newPosY = this.node.y;
        }
        var scale = 1 - 0.36 * Math.min(1, newPosY / 400);
        this.node.setScale(scale);
        this.node.zIndex = (10000 - newPosY);
    }
    turnBack(needBack) {
        this._commonHeroAvatar.turnBack(needBack);
    }
    setIdlePos(pos) {
        this._idlePos = pos;
    }
    setPozhenPos(pos) {
        this._pozhenPos = pos;
    }
    getPozhenPos() {
        return this._pozhenPos;
    }
    setPos(pos) {
        this._changeScaleAndZorderByPos(null, pos);
        this.turnBack(pos.x >0);
        this.node.setPosition(pos.x, pos.y);
    }
    updateBaseId(baseId) {
        this._baseId = baseId;
        this._commonHeroAvatar.updateUI(baseId);
    }
    showTitle(id) {
        this._commonHeroAvatar.showTitle(id, this.node.name);
    }
    setPlayerName(name, officialLevel) {
        this._textUserName.string = (name);
        this._textOfficialName.node.active = (true);
        if (officialLevel>=0) {
            var [officialInfo] = G_UserData.getBase().getOfficialInfo(officialLevel);
            if (officialInfo == null) {
                return;
            }
            UIHelper.updateLabel(this._textUserName, {
                color: Colors.getOfficialColor(officialLevel),
                outlineColor: Colors.getOfficialColorOutline(officialLevel)
            });
            UIHelper.updateLabel(this._textOfficialName, {
                text: '[' + (officialInfo.name + ']'),
                color: Colors.getOfficialColor(officialLevel),
                outlineColor: Colors.getOfficialColorOutline(officialLevel)
            });
        } else {
            this._textOfficialName.node.active = (false);
        }
    }
}