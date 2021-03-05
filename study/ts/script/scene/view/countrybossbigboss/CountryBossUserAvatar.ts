import CommonHeroAvatar from "../../../ui/component/CommonHeroAvatar";

import { G_UserData, Colors, G_ResolutionManager } from "../../../init";

import { handler } from "../../../utils/handler";

import { assert } from "../../../utils/GlobleFunc";

import UIActionHelper from "../../../utils/UIActionHelper";
import UIHelper from "../../../utils/UIHelper";
import StateMachine from "../countryboss/StateMachine";

const { ccclass, property } = cc._decorator;


var SPEED = 500;
@ccclass
export default class CountryBossUserAvatar extends cc.Component {
    public static IDLE_STATE = "Idle"
    public static RUNTOATTACK_STATE = "RunToAttack"
    public static RUNTOCONST_STATE = "RunToConst"
    public static ATTACK_STATE = "Attack"
    public static HIT_STATE = "Hit"
    public static FLY_STATE = "Fly"
    public static WIN_STATE = "Win"

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
    _stateChangeCallback: any;
    _data: any;
    _isLeft: boolean;
    _fixIndex: number;
    _slotIndex: number;
    _stateMachine: StateMachine;
    _targetPos: any;
    _kx: number;
    _ky: number;
    _startPlayFly: any;
    _targetRotate: number;
    _bezierPos1: cc.Vec2;
    _bezierPos2: cc.Vec2;
    _bezierPos3: cc.Vec2;
    _bezierTime: number;
    _curBezierTime: number;
    _flyActionMoveEndCallBack: any;


    ctor(callback) {
        this._stateChangeCallback = callback;
    }
    onCreate() {
    }
    updateData(data) {
        if (!data) {
            return;
        }
        this._data = data;
        this._updateUI();
        this._initStateMachine();
    }
    _updateUI() {
        this._isLeft = false;
        this._fixIndex = 0;
        this._slotIndex = 0;
        this.setPlayerName(this._data.name, this._data.officialLevel);
        this._commonHeroAvatar.updateUI(this._data.baseId, null, null, this._data.limitLevel);
        this._commonHeroAvatar.scheduleOnce(function(){
            this._commonHeroAvatar._playAnim("idle",true);
        }.bind(this),2)
        this._commonHeroAvatar.showTitle(this._data.titleId, 'CountryBossUserAvatar');
    }
    setPlayerName(name, officialLevel) {
        this._textUserName.string = (name);
        this._textOfficialName.node.active = (true);
        if (officialLevel) {
            var [officialInfo] = G_UserData.getBase().getOfficialInfo(officialLevel);
            if (officialInfo == null) {
                return;
            }
            UIHelper.updateLabel(this._textUserName, {
                color: Colors.getOfficialColor(officialLevel),
                outlineColor: Colors.getOfficialColorOutline(officialLevel)
            });
            UIHelper.updateLabel(this._textOfficialName,
                {
                    text: '[' + (officialInfo.name + ']'),
                    color: Colors.getOfficialColor(officialLevel),
                    outlineColor: Colors.getOfficialColorOutline(officialLevel)
                });
        } else {
            this._textOfficialName.node.active = (false);
        }
    }
    _initStateMachine() {
        if (this._stateMachine) {
            return;
        }
        var cfg = {
            ['defaultState']: CountryBossUserAvatar.IDLE_STATE,
            ['stateChangeCallback']: handler(this, this._changeCallback),
            ['state']: {
                [CountryBossUserAvatar.IDLE_STATE]: {
                    ['nextState']: {
                        [CountryBossUserAvatar.RUNTOATTACK_STATE]: {
                            ['transition']: handler(this, this._transitionIdleToRunToAttack),
                            ['stopTransition']: handler(this, this._stopTransitionIdleToRunToAttack)
                        },
                        [CountryBossUserAvatar.RUNTOCONST_STATE]: {},
                        [CountryBossUserAvatar.WIN_STATE]: {}
                    },
                    ['didEnter']: handler(this, this._didEnterIdle)
                },
                [CountryBossUserAvatar.RUNTOATTACK_STATE]: {
                    ['nextState']: {
                        [CountryBossUserAvatar.ATTACK_STATE]: {},
                        [CountryBossUserAvatar.WIN_STATE]: {}
                    },
                    ['didEnter']: handler(this, this._didEnterRunToAttack)
                },
                [CountryBossUserAvatar.RUNTOCONST_STATE]: {
                    ['nextState']: {
                        [CountryBossUserAvatar.ATTACK_STATE]: {},
                        [CountryBossUserAvatar.IDLE_STATE]: {}
                    },
                    ['didEnter']: handler(this, this._didEnterRunToConst)
                },
                [CountryBossUserAvatar.ATTACK_STATE]: {
                    ['nextState']: {
                        [CountryBossUserAvatar.FLY_STATE]: {},
                        [CountryBossUserAvatar.HIT_STATE]: {},
                        [CountryBossUserAvatar.WIN_STATE]: {}
                    },
                    ['didEnter']: handler(this, this._didEnterAttack)
                },
                [CountryBossUserAvatar.HIT_STATE]: {
                    ['nextState']: {
                        [CountryBossUserAvatar.FLY_STATE]: {},
                        [CountryBossUserAvatar.HIT_STATE]: {}
                    },
                    ['didEnter']: handler(this, this._didEnterHit)
                },
                [CountryBossUserAvatar.FLY_STATE]: {
                    ['nextState']: { [CountryBossUserAvatar.IDLE_STATE]: {} },
                    ['didEnter']: handler(this, this._didEnterFly)
                },
                [CountryBossUserAvatar.WIN_STATE]: {
                    ['didEnter']: handler(this, this._didEnterWin)
                }
            }
        };
        this._stateMachine = new StateMachine(cfg);
    }
    _changeCallback(params) {
        var [newState, oldState] = params;
        if (this._stateChangeCallback) {
            this._stateChangeCallback(this, newState, oldState);
        }
    }
    _didEnterIdle() {
        this._commonHeroAvatar.setAction('idle', true);
        this._commonHeroAvatar.showShadow(true);
    }
    _didEnterRunToAttack(params) {
        var [targetPos] = params;
        this._commonHeroAvatar.setAction('run', true);
        this._commonHeroAvatar.showShadow(true);
        if (this.getFixIndex() == 0) {
            var curPos = this._getRandomPos();
            this.node.setPosition(curPos);
        }
        if (!targetPos) {
          //assert((false, 'please input curPos and targetPos');
            return;
        }
        this._setTargetPos(targetPos);
    }
    _didEnterRunToConst(params) {
        var [targetPos] = params;
        this._commonHeroAvatar.setAction('run', true);
        this._commonHeroAvatar.showShadow(true);
        if (!targetPos) {
          //assert((false, 'please input targetPos');
            return;
        }
        var curPos = this._getRandomPos();
        this.node.setPosition(curPos);
        this._setTargetPos(targetPos);
    }
    _didEnterAttack() {
        this._commonHeroAvatar.setAction('skill1', true);
        this._commonHeroAvatar.showShadow(false);
    }
    _didEnterHit() {
        this._commonHeroAvatar.setAction('hit', true);
        this._commonHeroAvatar.showShadow(true);
    }
    _didEnterFly() {
        this._commonHeroAvatar.setAction('hitfly', true);
        this._commonHeroAvatar.showShadow(false);
        this._startFlyAction();
    }
    _didEnterWin() {
        this._commonHeroAvatar.setAction('win', true);
        this._commonHeroAvatar.showShadow(true);
    }
    _stopTransitionIdleToRunToAttack() {
        this.node.stopAllActions();
    }
    _transitionIdleToRunToAttack(finishFunc) {
        var dt = 0;
        if (this.getSlotIndex() == 2) {
            dt = Math.randInt(0, 60);
        } else {
            dt = Math.randInt(40, 100);
        }
        dt = dt / 100;
        var seqAction = UIActionHelper.createDelayAction(dt, function () {
            finishFunc();
        });
        this.node.runAction(seqAction);
    }
    turnBack(trueOrFalse?) {
        this._commonHeroAvatar.turnBack(trueOrFalse);
    }
    setIsLeft(trueOrFalse) {
        this._isLeft = trueOrFalse;
        if (this._isLeft) {
            this.turnBack(false);
        } else {
            this.turnBack();
        }
    }
    isLeft() {
        return this._isLeft;
    }
    setFixIndex(fixIndex) {
        this._fixIndex = fixIndex;
    }
    getFixIndex() {
        return this._fixIndex;
    }
    getUserId() {
        return this._data.userId || 0;
    }
    setSlotIndex(index) {
        this._slotIndex = index;
    }
    getSlotIndex(index?) {
        return this._slotIndex;
    }
    switchState(state, params?, isForceStop?) {
        this._stateMachine.switchState(state, params, isForceStop);
    }
    getCurState() {
        return this._stateMachine.getCurState();
    }
    canSwitchToState(nextState) {
        return this._stateMachine.canSwitchToState(nextState);
    }
    _getRandomPos() {
        var maxY = 200;
        var posy = Math.randInt(0, 2 * maxY);
        posy = posy - maxY;
        if (this.isLeft()) {
            return cc.v2(G_ResolutionManager.getDesignWidth() / -2 - 100, posy);
        } else {
            return cc.v2(G_ResolutionManager.getDesignWidth() / 2 + 100, posy);
        }
    }
    _setTargetPos(pos) {
        this._targetPos = pos;
        var startX = this.node.x, startY = this.node.y;
        var dy = pos.y - startY;
        var dx = pos.x - startX;
        var k = Math.sqrt(dy * dy + dx * dx);
        this._kx = dx / k;
        this._ky = dy / k;
    }
    _stopMove() {
        this._targetPos = null;
        this._kx = 0;
        this._ky = 0;
        var curstate = this.getCurState();
        if (curstate == CountryBossUserAvatar.RUNTOATTACK_STATE) {
            this.switchState(CountryBossUserAvatar.ATTACK_STATE);
        } else if (curstate == CountryBossUserAvatar.RUNTOCONST_STATE) {
            this.switchState(CountryBossUserAvatar.IDLE_STATE);
        } else {
            this.switchState(CountryBossUserAvatar.IDLE_STATE);
        }
    }
    _startFlyAction() {
        if (this._startPlayFly) {
            return;
        }
        var p1x = this.node.x, p1y = this.node.y;
        var distance = G_ResolutionManager.getDesignWidth() / 2 - Math.abs(p1x) + Math.randInt(60, 150);
        var p1 = cc.v2(p1x, p1y);
        var p2 = cc.v2(0, 0);
        var p3 = cc.v2(0, p1.y);
        if (p1.x > 0) {
            p3.x = p1.x + distance;
            p2.x = p1.x + distance / 2;
            p2.y = p1.y + Math.randInt(300, 400);
            this._targetRotate = 50;
        } else {
            p3.x = p1.x - distance;
            p2.x = p1.x - distance / 2;
            p2.y = p1.y + Math.randInt(300, 400);
            this._targetRotate = -50;
        }
        this._bezierPos1 = p1;
        this._bezierPos2 = p2;
        this._bezierPos3 = p3;
        this._bezierTime = distance / 300;
        this._curBezierTime = 0;
        this._startPlayFly = true;
        this._flyActionMoveEndCallBack = null;   // callback;
        this.node.rotation = (0);
    }
    _flyCurveFunc(t) {
        return -1 * (t - 1) * (t - 1) + 1;
    }
    _getBezierPos(t) {
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
            percent = this._flyCurveFunc(percent);
            var pos = this._getBezierPos(percent);
            this.node.setPosition(pos);
            if (Math.abs(pos.x) < Math.abs(this._bezierPos2.x)) {
                var rPercent = Math.abs((pos.x - this._bezierPos1.x) / (this._bezierPos2.x - this._bezierPos1.x));
                this.node.setRotation(this._targetRotate * rPercent);
            }
            if (percent == 1) {
                this._startPlayFly = false;
                this.node.setRotation(0);
                this.switchState(CountryBossUserAvatar.IDLE_STATE);
                if (this._flyActionMoveEndCallBack) {
                    this._flyActionMoveEndCallBack(this);
                }
            }
        }
    }
    _runUpdate(dt) {
        if (this._targetPos) {
            var posx = this.node.x, posy = this.node.y;
            var d = SPEED * dt;
            var dx = d * this._kx;
            var dy = d * this._ky;
            var x:number, y:number;
            if (Math.abs(this._targetPos.x - posx) < Math.abs(dx)) {
                x = this._targetPos.x;
            } else {
                x = posx + dx;
            }
            if (Math.abs(this._targetPos.y - posy) < Math.abs(dy)) {
                y = this._targetPos.y;
            } else {
                y = posy + dy;
            }
            this.node.setPosition(cc.v2(x, y));
            this.node.zIndex = (-1 * y);
            if (x == this._targetPos.x && y == this._targetPos.y) {
                this._stopMove();
            }
        }
    }
    _update(dt) {
        this._flyUpdate(dt);
        this._runUpdate(dt);
    }
    onEnter() {
    }
    onExit() {
    }
    clean() {
        this._targetPos = null;
        this._startPlayFly = null;
    }
}