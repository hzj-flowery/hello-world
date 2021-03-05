import { handler } from "../../../utils/handler";
import StateMachine from "../countryboss/StateMachine";
import QinTombAvatar from "./QinTombAvatar";
import { QinTombConst } from "../../../const/QinTombConst";
import { G_SignalManager, G_ServerTime, G_EffectGfxMgr, G_UserData } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import { CurveHelper } from "../../../utils/CurveHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class QinTombTeamAvatar extends cc.Component {

    @property({ type: cc.Node, visible: true })
    _nodeRole: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _avatar2: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _avatar3: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _avatar1: cc.Node = null;

    @property({ type: cc.Prefab, visible: true })
    _qinTombAvatarPrefab: cc.Prefab = null;

    public static CREATE_STATE = "Create"
    public static INIT_STATE = "Init"
    public static STAND_STATE = "Stand"
    public static RUN_STATE = "Run"
    public static ATTACK_STATE = "Attack" //打boss，与掠夺
    public static REBORN_STATE = "ReBorn"//死亡状态
    private static AVATAR_RUN_TIME_SCALE = 1.5//跑步时，加速Avatar速度
    private static MAX_AVATAR_SIZE = 3

    private _avatarName;
    private _teamId;
    private _mapNode;
    private _stateMachine;
    private _userData;
    private _movePathList: any[];
    private _doingMoving: boolean;

    private _qinTombAvatars: QinTombAvatar[];
    private _avatarNodes: cc.Node[];

    public init(teamId, mapNode) {
        this._avatarName = null;
        this._teamId = teamId;
        this._mapNode = mapNode;
        this._qinTombAvatars = [];
        this._avatarNodes = [this._avatar1, this._avatar2, this._avatar3];

        this._initStateMachine();
        this.switchState(QinTombTeamAvatar.INIT_STATE);
    }

    private _initStateMachine(defaultState?) {
        if (this._stateMachine) {
            return;
        }
        var cfg = {
            'defaultState': QinTombTeamAvatar.CREATE_STATE,
            'stateChangeCallback': handler(this, this._stateChangeCallback),
            'state': {
                [QinTombTeamAvatar.CREATE_STATE]: { 'nextState': { [QinTombTeamAvatar.INIT_STATE]: {} } },
                [QinTombTeamAvatar.INIT_STATE]: {
                    'nextState': {
                        [QinTombTeamAvatar.STAND_STATE]: {},
                        [QinTombTeamAvatar.RUN_STATE]: {},
                        [QinTombTeamAvatar.REBORN_STATE]: {},
                        [QinTombTeamAvatar.ATTACK_STATE]: {}
                    },
                    'didEnter': handler(this, this._didEnterInit)
                },
                [QinTombTeamAvatar.STAND_STATE]: {
                    'nextState': {
                        [QinTombTeamAvatar.RUN_STATE]: {},
                        [QinTombTeamAvatar.ATTACK_STATE]: {}
                    },
                    'didEnter': handler(this, this._didEnterStand),
                    'didExit': handler(this, this._didWillExitStand)
                },
                [QinTombTeamAvatar.RUN_STATE]: {
                    'nextState': {
                        [QinTombTeamAvatar.STAND_STATE]: {
                            'transition': handler(this, this._transitionRunToStand),
                            'stopTransition': handler(this, this._stopTransitionRunToStand)
                        }
                    },
                    'didEnter': handler(this, this._didEnterRun),
                    'willExit': handler(this, this._didWillExitRun),
                    'didExit': handler(this, this._didExitRun),
                    'stopExit': handler(this, this._didStopExitRun)
                },
                [QinTombTeamAvatar.ATTACK_STATE]: {
                    'nextState': {
                        [QinTombTeamAvatar.STAND_STATE]: {},
                        [QinTombTeamAvatar.RUN_STATE]: {},
                        [QinTombTeamAvatar.REBORN_STATE]: {}
                    },
                    'didEnter': handler(this, this._didEnterAttack),
                    'willExit': handler(this, this._didWillExitAttack)
                },
                [QinTombTeamAvatar.REBORN_STATE]: {
                    'nextState': {
                        [QinTombTeamAvatar.STAND_STATE]: {
                            'transition': handler(this, this._transitionRebornToStand),
                            'stopTransition': handler(this, this._stopTransitionRebornToStand)
                        }
                    },
                    'didEnter': handler(this, this._didEnterReborn),
                    'willExit': handler(this, this._didWillExitReborn)
                }
            }
        };
        this._stateMachine = new StateMachine(cfg);
    }

    public clearAvatarState() {
        for (let i = 0; i < QinTombTeamAvatar.MAX_AVATAR_SIZE; i++) {
            var avatar = this._qinTombAvatars[i];
            if (avatar) {
                avatar.node.removeFromParent();
            }
        }
        this._qinTombAvatars = [];
        for (let i = 0; i < QinTombTeamAvatar.MAX_AVATAR_SIZE; i++) {
            var avatar = cc.instantiate(this._qinTombAvatarPrefab).getComponent(QinTombAvatar);
            this._nodeRole.addChild(avatar.node);
            this._qinTombAvatars.push(avatar);
            avatar.init(this._mapNode);
            avatar.syncVisible(false);
            avatar.node.setPosition(QinTombConst.TEAM_AVATAR_IDLE_POS[i + 1]);
            avatar.node.name = ('_commonHeroAvatar' + (i + 1));
        }
    }

    private _enterRunAction() {
        for (let i = 0; i < QinTombTeamAvatar.MAX_AVATAR_SIZE; i++) {
            var avatarNode = this._qinTombAvatars[i];
            avatarNode.setAction('run', true);
            avatarNode.showShadow(true);
            avatarNode.setAniTimeScale(QinTombTeamAvatar.AVATAR_RUN_TIME_SCALE);
            avatarNode.node.setPosition(QinTombConst.TEAM_AVATAR_RUN_POS[i + 1]);
        }
    }

    public updatePosition(pos) {
        this.node.setPosition(pos);
    }

    private _didEnterInit() {
        this.updateTeamData();
        var currPos = this._userData.getCurrPointKeyPos();
        if (currPos) {
            this.updatePosition(currPos);
        }
    }

    private _stateChangeCallback(newState, oldState) {
        G_SignalManager.dispatch(SignalConst.EVENT_GRAVE_TEAM_AVATAR_STATE_CHANGE, this._userData, newState, oldState, this);
    }

    public setAction(animation) {
        for (let i = 0; i < QinTombTeamAvatar.MAX_AVATAR_SIZE; i++) {
            var avatarNode = this._qinTombAvatars[i];
            avatarNode.setAction(animation, true);
        }
    }

    private _didEnterStand() {
        for (let i = 0; i < QinTombTeamAvatar.MAX_AVATAR_SIZE; i++) {
            var avatarNode = this._qinTombAvatars[i];
            avatarNode.setAction('idle', true);
            avatarNode.node.setPosition(QinTombConst.TEAM_AVATAR_IDLE_POS[i + 1]);
            avatarNode.showShadow(true);
            avatarNode.setAniTimeScale(1);
        }
    }

    private _didWillExitStand(nextState) {
    }

    private _transitionRunToStand(finishFunc) {
        finishFunc();
    }

    private _stopTransitionRunToStand() {
    }

    private _didEnterRun() {
        for (let i = 0; i < QinTombTeamAvatar.MAX_AVATAR_SIZE; i++) {
            var avatarNode = this._qinTombAvatars[i];
            avatarNode.setAction('run', true);
            avatarNode.showShadow(true);
            avatarNode.setAniTimeScale(QinTombTeamAvatar.AVATAR_RUN_TIME_SCALE);
            avatarNode.node.setPosition(QinTombConst.TEAM_AVATAR_RUN_POS[i + 1]);
        }
        this._doMoveAvatar();
    }

    private _didWillExitRun() {
        CurveHelper.stopCurveMove(this);
    }

    private _didExitRun() {
    }

    private _didStopExitRun() {
    }

    private _didEnterAttack() {
        this.syncVisible(false);
    }

    private _didWillExitAttack() {
        this.syncVisible(true);
    }

    private _didEnterRelease() {
    }

    private _didEnterFinish(isWinner) {
        for (let i = 0; i < QinTombTeamAvatar.MAX_AVATAR_SIZE; i++) {
            var avatarNode = this._qinTombAvatars[i];
            avatarNode.setAction(isWinner && 'win' || 'dizzy', true);
            avatarNode.showShadow(true);
            avatarNode.setAniTimeScale(1);
        }
    }

    private _transitionReleaseToInit(finishFunc) {
        finishFunc();
    }

    private _didEnterReborn() {
        this.syncVisible(false);
        for (let i = 0; i < QinTombTeamAvatar.MAX_AVATAR_SIZE; i++) {
            var avatarNode = this._qinTombAvatars[i];
        }
        var callback = function () {
            this.switchState(QinTombTeamAvatar.STAND_STATE);
        };
        var curTime = G_ServerTime.getTime();
        var time = this._userData.getReborn_time();
        var leftTime = Math.max(0.01, time - curTime);
        var seq = cc.sequence(cc.delayTime(leftTime), cc.callFunc(callback));
        this._nodeRole.stopAllActions();
        this._nodeRole.runAction(seq);
    }

    private _transitionRebornToStand(finishFunc) {
        var currPos = this._userData.getCurrPointKeyPos();
        if (currPos) {
            this.updatePosition(currPos);
        }
        function eventFunction(event) {
            if (event == 'finish') {
                finishFunc();
            }
        }
        var gfxEffect1 = G_EffectGfxMgr.createPlayGfx(this.node, 'effect_juntuan_chuxian', eventFunction);
        var gfxEffect2 = G_EffectGfxMgr.applySingleGfx(this.node, 'smoving_juntuan_chuxian');
    }

    private _stopTransitionRebornToStand() {
    }

    private _didWillExitReborn() {
        this.syncVisible(true);
    }

    public getCurState() {
        return this._stateMachine.getCurState();
    }

    public switchState(state, params?, isForceStop?) {
        this._stateMachine.switchState(state, params, isForceStop);
    }

    public onEnter() {
    }

    public onExit() {
    }

    public updateTeamData() {
        var teamId = this._teamId;
        if (teamId) {
            var teamUnit = G_UserData.getQinTomb().getTeamById(teamId);
            this._userData = teamUnit;
        }
        return null;
    }

    public updateUI() {
        this.clearAvatarState();
        this.updateAvatar();
        var currPos = this._userData.getCurrPointKeyPos();
        if (currPos) {
            this.updatePosition(currPos);
        }
        if (this.getCurState() == QinTombTeamAvatar.RUN_STATE) {
            this._enterRunAction();
        }
    }

    public updateAvatar() {
        for (let i = 0; i < QinTombTeamAvatar.MAX_AVATAR_SIZE; i++) {
            var avatarNode = this._qinTombAvatars[i];
            if (avatarNode) {
                avatarNode.syncVisible(false);
            }
        }
        this.updateTeamData();
        var teamList = this._userData.getTeamUsers();
        for (let i in teamList) {
            var value = teamList[i];
            var avatarNode = this._qinTombAvatars[parseInt(i) - 1];
            if (avatarNode) {
                avatarNode.syncVisible(true);
                if (value.user_id == G_UserData.getBase().getId()) {
                    avatarNode.node.zIndex = (100);
                } else {
                    avatarNode.node.zIndex = parseInt(i);
                }
                avatarNode.updateUI(value, this._userData.getTeamId(), this._userData.getTeamLeaderId());
            }
        }
    }

    private _doMoveAvatar() {
        this.updateTeamData();
        var selfPosX = this.node.x;
        let selfPosY = this.node.y;
        var finalPath = this._userData.getMovingPath(selfPosX, selfPosY);
        if (typeof (finalPath) == 'number') {
            return;
        }
        this._movePathList = finalPath;
        this._doingMoving = true;
        this._loopMoveAvatar();
    }

    private _loopMoveAvatar() {
        if (this._doingMoving == false) {
            return;
        }
        if (this._movePathList && this._movePathList.length > 0) {
            var path = this._movePathList[0];
            this._moveAvatar(path);
            this._movePathList.splice(0, 1);
        } else {
            if (this._userData.isSelfTeamLead()) {
                G_SignalManager.dispatch(SignalConst.EVENT_GRAVE_SELF_TEAM_MOVE_END);
            }
            this.switchState(QinTombTeamAvatar.STAND_STATE);
        }
    }

    private _moveAvatar(path) {
        var curveConfigList = path.curveLine;
        var totalTime = path.time;
        var endTime = path.totalTime;
        function movingEnd() {
            this._loopMoveAvatar();
        }
        function rotateCallback(angle, oldPos, newPos) {
            for (let i = 0; i < QinTombTeamAvatar.MAX_AVATAR_SIZE; i++) {
                var avatarNode = this._qinTombAvatars[i];
                if (avatarNode) {
                    if (Math.floor(Math.abs(newPos.x - oldPos.x)) <= 1) {
                        avatarNode.turnBack(false);
                    } else {
                        avatarNode.turnBack(newPos.x < oldPos.x);
                    }
                }
                var posY = this.node.y;
                this.node.zIndex = (QinTombConst.TEAM_ZORDER - Math.round(posY / 100));
            }
        }
        function moveCallback(newPos, oldPos) {
            this.updatePosition(newPos);
        }
        CurveHelper.doCurveMove(this, movingEnd.bind(this), rotateCallback.bind(this), moveCallback.bind(this), curveConfigList, totalTime, endTime);
    }

    public canSwitchToState(nextState, isForceStop) {
        return this._stateMachine.canSwitchToState(nextState, isForceStop);
    }

    private _saveSwitchState(state, params) {
        if (this.canSwitchToState(state, false)) {
            this._stateMachine.switchState(state, params, true);
        }
    }

    public isStateVisible() {
        var serverState = this._userData.getCurrState();
        if (serverState == QinTombConst.TEAM_STATE_MOVING) {
            return true;
        }
        if (serverState == QinTombConst.TEAM_STATE_IDLE) {
            return true;
        }
        return false;
    }

    public setAvatarModelVisible(needVisible) {
        // console.log("setAvatarModelVisible:",this.node.name, needVisible);
        if (needVisible == null) {
            needVisible = false;
        }
        for (let i = 0; i < QinTombTeamAvatar.MAX_AVATAR_SIZE; i++) {
            var avatarNode = this._qinTombAvatars[i];
            avatarNode.setAvatarModelVisible(needVisible);
        }
    }

    public synServerInfo() {
        var curstate = this.getCurState();
        this.updateTeamData();
        var serverState = this._userData.getCurrState();
        let switchRunningState = function switchRunningState(serverState) {
            var selfPosX = this.node.x;
            let selfPosY = this.node.y;
            var finalPath = this._userData.getMovingPath(selfPosX, selfPosY);
            if (typeof (finalPath) == 'number') {
                return false;
            }
            if (finalPath.length > 0 && serverState == QinTombConst.TEAM_STATE_MOVING) {
                this._saveSwitchState(QinTombTeamAvatar.RUN_STATE);
                return true;
            }
        }.bind(this);
        let switchAttackState = function (serverState) {
            if (serverState == QinTombConst.TEAM_STATE_HOOK || serverState == QinTombConst.TEAM_STATE_PK) {
                this._saveSwitchState(QinTombTeamAvatar.ATTACK_STATE);
                return true;
            }
            return false;
        }.bind(this);
        let switchRebornState = function (serverState) {
            if (serverState == QinTombConst.TEAM_STATE_DEATH) {
                this._saveSwitchState(QinTombTeamAvatar.REBORN_STATE);
                return true;
            }
            return false;
        }.bind(this);
        let switchIdleState = function (serverState) {
            if (serverState == QinTombConst.TEAM_STATE_IDLE) {
                this._saveSwitchState(QinTombTeamAvatar.STAND_STATE);
                return true;
            }
            return false;
        }.bind(this);
        if (curstate == QinTombTeamAvatar.STAND_STATE || curstate == QinTombTeamAvatar.INIT_STATE) {
            if (switchRunningState(serverState)) {
                return;
            }
            if (switchAttackState(serverState)) {
                return;
            }
        }
        if (curstate == QinTombTeamAvatar.ATTACK_STATE || curstate == QinTombTeamAvatar.INIT_STATE) {
            if (switchRebornState(serverState)) {
                return;
            }
            if (switchIdleState(serverState)) {
                return;
            }
            if (switchRunningState(serverState)) {
                return;
            }
        }
    }

    public releaseSelf() {
        for (let i = 0; i < QinTombTeamAvatar.MAX_AVATAR_SIZE; i++) {
            var node = this._qinTombAvatars[i];
            if (node) {
                node.releaseSelf();
            }
        }
        this.node.removeFromParent();
    }

    public syncVisible(visilbe) {
        this.node.active = (visilbe);
        for (let i = 0; i < QinTombTeamAvatar.MAX_AVATAR_SIZE; i++) {
            var avatarNode = this._qinTombAvatars[i];
            if (avatarNode) {
                avatarNode.syncVisible(false);
            }
        }
        var teamList = this._userData.getTeamUsers();
        for (let i in teamList) {
            var value = teamList[i];
            var node = this._qinTombAvatars[parseInt(i) - 1];
            if (node) {
                node.syncVisible(visilbe);
            }
        }
    }
}