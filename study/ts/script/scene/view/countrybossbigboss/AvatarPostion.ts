import { handler } from "../../../utils/handler";
import CountryBossUserAvatar from "./CountryBossUserAvatar";
import CountryBossBigBossAvatar from "./CountryBossBigBossAvatar";
import UIActionHelper from "../../../utils/UIActionHelper";
import { G_ResolutionManager } from "../../../init";

const { ccclass, property } = cc._decorator;
@ccclass
export default class AvatarPostion extends cc.Component {
    @property({ type: cc.Prefab, visible: true })
    countryBossBigBossAvatar: cc.Prefab = null;
    @property({ type: cc.Prefab, visible: true })
    countryBossUserAvatar: cc.Prefab = null;

    _leftPos: cc.Vec2[];
    _leftPosState: boolean[];
    _rightPos: cc.Vec2[];
    _rightPosState: boolean[];
    _leftAttackSlotPos: cc.Vec2[];
    _leftAttackSlotState: boolean[];
    _rightAttackSlotPos: cc.Vec2[];
    _rightAttackSlotState: boolean[];
    _bossPos: cc.Vec2;
    _constAvatars: {};
    _avatarCount: number;
    _leftAttackQueue: any[];
    _rightAttackQueue: any[];
    _constAttackDict: {};
    _nextConstAttack: {};
    _cacheAvatars: any[];
    _useAvatars: {};
    _totalCreateAvatar: number;
    _position: any;
    _bossAvatar: any;
    _isBossDie: any;
    _leftAttackBoss: boolean;
    _rightAttackBoss: boolean;
    _constAttackTable: any[];

    ctor(node) {
        node.addChild(this.node);

        this._leftPos = [
            undefined,
            cc.v2(-300, 0),
            cc.v2(-450, -75),
            cc.v2(-375, 120),
            cc.v2(-200, -150),
            cc.v2(-250, 150)
        ];
        this._leftPosState = [
            undefined,
            true,
            true,
            true,
            true,
            true
        ];
        this._rightPos = [
            undefined,
            cc.v2(300, 0),
            cc.v2(450, 75),
            cc.v2(375, -120),
            cc.v2(200, 150),
            cc.v2(250, -150)
        ];
        this._rightPosState = [
            undefined,
            true,
            true,
            true,
            true,
            true
        ];
        this._leftAttackSlotPos = [
            undefined,
            cc.v2(-180, 0),
            cc.v2(-110, -60),
            cc.v2(-110, 60)
        ];
        this._leftAttackSlotState = [
            undefined,
            true,
            true,
            true
        ];
        this._rightAttackSlotPos = [
            undefined,
            cc.v2(180, 0),
            cc.v2(110, -60),
            cc.v2(110, 60)
        ];
        this._rightAttackSlotState = [
            undefined,
            true,
            true,
            true
        ];
        this._bossPos = cc.v2(0, 0);
        this._constAvatars = {};
        this._avatarCount = 0;
        this._leftAttackQueue = [];
        this._rightAttackQueue = [];
        this._constAttackTable = [];
        this._constAttackDict = {};
        this._nextConstAttack = {};
        this._cacheAvatars = [];
        this._useAvatars = {};

        this._totalCreateAvatar = 0;
    }
    _getPositionByAvatar(isLeft, fixIndex) {
        if (isLeft) {
            return this._leftPos[fixIndex];
        } else {
            return this._rightPos[fixIndex];
        }
    }
    getPositionByIndex(index) {
        return this._position[index] || cc.v2(0, 0);
    }
    _createAvatar() {
        var userAvatar = cc.instantiate(this.countryBossUserAvatar).getComponent(CountryBossUserAvatar);
        userAvatar.ctor(handler(this, this._avatarStateChangeCallback))
        this.node.addChild(userAvatar.node);
        userAvatar.node.setScale(0.7);
        this._totalCreateAvatar = this._totalCreateAvatar + 1;
        return userAvatar;
    }
    _initConstPosAvatar(isLeft, fixIndex, userData) {
        if (!userData) {
            return;
        }
        if (this._useAvatars[userData.userId]) {
            return;
        }
        var pos = this._getPositionByAvatar(isLeft, fixIndex);
        var avatar = this._getAvatarFromCache();
        avatar.updateData(userData);
        avatar.setFixIndex(fixIndex);
        avatar.setIsLeft(isLeft);
        this._useAvatars[avatar.getUserId()] = avatar;
        avatar.switchState(CountryBossUserAvatar.RUNTOCONST_STATE, pos);
    }
    _constPosUpdate() {
        for (var i = 1; i <= 5; i++) {
            if (this._leftPosState[i]) {
                var userData = this._constAttackTable[i * 2 - 1 - 1];
                this._initConstPosAvatar(true, i, userData);
            }
            if (this._rightPosState[i]) {
                var userData = this._constAttackTable[i * 2 - 1];
                this._initConstPosAvatar(false, i, userData);
            }
        }
    }
    addUserAvatar(userData) {
        if (!userData) {
            return;
        }
        if (this._constAttackTable.length >= 10) {
            return;
        }
        if (this._constAttackDict[userData.userId]) {
            return;
        }
        this._constAttackDict[userData.userId] = true;
        this._constAttackTable.push(userData);
    }
    addBoss(bossId) {
        this._bossAvatar = cc.instantiate(this.countryBossBigBossAvatar).getComponent(CountryBossBigBossAvatar);
        this._bossAvatar.ctor(bossId)
        this._bossAvatar.node.setPosition(this._bossPos);
        this._bossAvatar.node.zIndex = (-1 * this._bossPos.y);
        this._isBossDie = this._bossAvatar.isBossDie();
        this._setWin();
        this._bossAvatar.setPlayBossDieCallback(handler(this, this._setWin));
        this.node.addChild(this._bossAvatar.node);
    }
    pushAttack(userData) {
        if (!userData) {
            return;
        }
        if (this._bossAvatar.isBossDie()) {
            return;
        }
        var avatar = this._useAvatars[userData.userId];
        if (avatar) {
            if (avatar.isLeft()) {
                this._leftAttackQueue.push(userData);
            } else {
                this._rightAttackQueue.push(userData);
            }
        } else {
            this._avatarCount = this._avatarCount + 1;
            if (this._avatarCount % 2 == 0) {
                this._leftAttackQueue.push(userData);
            } else {
                this._rightAttackQueue.push(userData);
            }
        }
        this.addUserAvatar(userData);
    }
    _getAvatarFromCache() {
        var avatar = this._cacheAvatars.length > 0 ? this._cacheAvatars.shift() : null;
        if (!avatar) {
            avatar = this._createAvatar();
        }
        avatar.node.active = (true);
        return avatar;
    }
    _recycleAvatar(avatar) {
        avatar.node.active = (false);
        avatar.setFixIndex(0);
        avatar.setSlotIndex(0);
        avatar.setIsLeft(false);
        avatar.node.angle = (0);
        avatar.switchState(CountryBossUserAvatar.IDLE_STATE);
        this._useAvatars[avatar.getUserId()] = null;
        this._cacheAvatars.push(avatar);
    }
    _avatarStateChangeCallback(avatar, newState, oldState) {
        if (oldState == CountryBossUserAvatar.RUNTOCONST_STATE && newState == CountryBossUserAvatar.IDLE_STATE) {
            this._runToConstPosCallback(avatar);
        } else if (newState == CountryBossUserAvatar.RUNTOCONST_STATE) {
            this._updatePosState(avatar.isLeft(), avatar.getFixIndex(), false);
        } else if (newState == CountryBossUserAvatar.RUNTOATTACK_STATE) {
            this._updatePosState(avatar.isLeft(), avatar.getFixIndex(), true);
        } else if (oldState == CountryBossUserAvatar.FLY_STATE && newState == CountryBossUserAvatar.IDLE_STATE) {
            this._flyEndCallback(avatar);
        } else if (newState == CountryBossUserAvatar.FLY_STATE) {
            this._flyBeginCallback(avatar);
        } else if (newState == CountryBossUserAvatar.ATTACK_STATE) {
            this._attackCallback(avatar);
        }
    }
    _runToConstPosCallback(avatar) {
        var userData = this._nextConstAttack[avatar.getUserId()];
        var isLeft = avatar.isLeft();
        if (userData) {
            if (isLeft) {
                this._leftAttackQueue.unshift(userData);
            } else {
                this._rightAttackQueue.unshift(userData);
            }
        }
        this._nextConstAttack[avatar.getUserId()] = null;
        this._setWin();
    }
    _attackCallback(avatar) {
        if (avatar.isLeft()) {
            this._leftAttackBoss = true;
        } else {
            this._rightAttackBoss = true;
        }
    }
    _flyEndCallback(avatar) {
        this._recycleAvatar(avatar);
    }
    _flyBeginCallback(avatar) {
        if (avatar.isLeft()) {
            this._leftAttackSlotState[avatar.getSlotIndex()] = true;
        } else {
            this._rightAttackSlotState[avatar.getSlotIndex()] = true;
        }
    }
    _hit() {
        var seqAction = UIActionHelper.createDelayAction(this._bossAvatar.getHitDelayTime(), function () {
            for (var k in this._useAvatars) {
                var v = this._useAvatars[k];
                if (this._bossAvatar.isAttackAll() || v.isLeft() == this._bossAvatar.isLeft()) {
                    v.switchState(CountryBossUserAvatar.HIT_STATE);
                }
            }
        }.bind(this));
        this.node.runAction(seqAction);
    }
    _fly() {
        var seqAction = UIActionHelper.createDelayAction(this._bossAvatar.getFlyDelayTime(), function () {
            if (this._bossAvatar.isAttackAll()) {
                this._leftAttackBoss = false;
                this._rightAttackBoss = false;
            } else {
                if (this._bossAvatar.isLeft()) {
                    this._leftAttackBoss = false;
                } else {
                    this._rightAttackBoss = false;
                }
            }
            for (var k in this._useAvatars) {
                var v = this._useAvatars[k];
                if (this._bossAvatar.isAttackAll() || v.isLeft() == this._bossAvatar.isLeft()) {
                    v.switchState(CountryBossUserAvatar.FLY_STATE);
                }
            }
        }.bind(this));
        this.node.runAction(seqAction);
    }
    _bossAttackUpdate() {
        if (this._bossAvatar.isIdle()) {
            if (this._isBossDie) {
                var seqAction = UIActionHelper.createDelayAction(0.8, function () {
                    this._bossAvatar.playBossDie();
                }.bind(this));
                this._bossAvatar.node.runAction(seqAction);
            } else if (this._leftAttackBoss) {
                if (!this._bossAvatar.isAttackAll()) {
                    this._bossAvatar.turnBack();
                }
                var seqAction = UIActionHelper.createDelayAction(0.3, function () {
                    this._bossAvatar.playerAttack();
                    this._hit();
                    this._fly();
                }.bind(this));
                this._bossAvatar.node.runAction(seqAction);
            } else if (this._rightAttackBoss) {
                if (!this._bossAvatar.isAttackAll()) {
                    this._bossAvatar.turnBack(false);
                }
                var seqAction = UIActionHelper.createDelayAction(0.3, function () {
                    this._bossAvatar.playerAttack();
                    this._hit();
                    this._fly();
                }.bind(this));
                this._bossAvatar.node.runAction(seqAction);
            }
        }
    }
    _playAttack(userData, slotIndex, isLeft) {
        var avatar = this._useAvatars[userData.userId];
        if (avatar && !avatar.canSwitchToState(CountryBossUserAvatar.RUNTOATTACK_STATE)) {
            return false;
        }
        if (!avatar) {
            avatar = this._getAvatarFromCache();
            avatar.updateData(userData);
            avatar.node.setPosition(cc.v2(G_ResolutionManager.getDesignWidth() / -2 - 200, -200));
            this._useAvatars[userData.userId] = avatar;
        }
        avatar.setSlotIndex(slotIndex);
        avatar.setIsLeft(isLeft);
        var targetPos;
        if (isLeft) {
            targetPos = this._leftAttackSlotPos[slotIndex];
        } else {
            targetPos = this._rightAttackSlotPos[slotIndex];
        }
        avatar.switchState(CountryBossUserAvatar.RUNTOATTACK_STATE, targetPos);
        return true;
    }
    _updatePosState(isLeft, fixIndex, trueOrFalse) {
        if (fixIndex == 0) {
            return;
        }
        if (isLeft) {
            this._leftPosState[fixIndex] = trueOrFalse;
            if (trueOrFalse) {
                var newUserData = this._leftAttackQueue.shift();
                if (newUserData && !this._constAttackDict[newUserData.userId]) {
                    var oldUserData = this._constAttackTable[fixIndex * 2 - 1 - 1];
                    if (oldUserData) {
                        this._constAttackDict[oldUserData.userId] = null;
                    }
                    this._constAttackTable[fixIndex * 2 - 1 - 1] = newUserData;
                    this._nextConstAttack[newUserData.userId] = newUserData;
                    this._constAttackDict[newUserData.userId] = true;
                }
            }
        } else {
            this._rightPosState[fixIndex] = trueOrFalse;
            if (trueOrFalse) {
                var newUserData = this._rightAttackQueue.shift();
                if (newUserData && !this._constAttackDict[newUserData.userId]) {
                    var oldUserData = this._constAttackTable[fixIndex * 2 - 1];
                    if (oldUserData) {
                        this._constAttackDict[oldUserData.userId] = null;
                    }
                    this._constAttackTable[fixIndex * 2 - 1] = newUserData;
                    this._nextConstAttack[newUserData.userId] = newUserData;
                    this._constAttackDict[newUserData.userId] = true;
                }
            }
        }
    }
    update(dt) {
        for (var k in this._leftAttackSlotState) {
            var v = this._leftAttackSlotState[k];
            if (v) {
                var leftAvatar = this._leftAttackQueue.shift();
                if (!leftAvatar) {
                    break;
                }
                if (this._bossAvatar.isBossDie()) {
                    break;
                }
                if (!this._playAttack(leftAvatar, k, true)) {
                    break;
                }
                this._leftAttackSlotState[k] = false;
            }
        }
        for (k in this._rightAttackSlotState) {
            var v = this._rightAttackSlotState[k];
            if (v) {
                var rightAvatar = this._rightAttackQueue.shift();
                if (!rightAvatar) {
                    break;
                }
                if (this._bossAvatar.isBossDie()) {
                    break;
                }
                if (!this._playAttack(rightAvatar, k, false)) {
                    break;
                }
                this._rightAttackSlotState[k] = false;
            }
        }
        this._bossAttackUpdate();
        this._constPosUpdate();
        for (k in this._useAvatars) {
            var avatar = this._useAvatars[k];
            avatar._update(dt);
        }
    }
    _setWin() {
        if (this._isBossDie) {
            for (var k in this._useAvatars) {
                var v = this._useAvatars[k];
                v.switchState(CountryBossUserAvatar.WIN_STATE, null, true);
                v.node.stopAllActions();
            }
            this._bossAvatar.updateState();
        }
    }
    updateBossState() {
        var oldBossState = this._isBossDie;
        this._isBossDie = this._bossAvatar.isBossDie();
        if (oldBossState == false && this._isBossDie == true) {
            this._bossAvatar.playBossDie();
        }
    }
}