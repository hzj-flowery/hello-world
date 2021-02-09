const { ccclass, property } = cc._decorator;

import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar'
import { handler } from '../../../utils/handler';
import StateMachine from '../countryboss/StateMachine';
import { QinTombHelper } from './QinTombHelper';
import { G_UserData, Colors, G_ServerTime, G_EffectGfxMgr } from '../../../init';
import QinTombAvatar from './QinTombAvatar';
import UIHelper from '../../../utils/UIHelper';
import { QinTombConst } from '../../../const/QinTombConst';
import { Lang } from '../../../lang/Lang';
import { Path } from '../../../utils/Path';

@ccclass
export default class QinTombMonsterAvatar extends cc.Component {

    @property({ type: cc.Node, visible: true })
    _pkAvatar: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _hookAvatar: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _monumentAvatar: cc.Node = null;

    @property({ type: cc.Label, visible: true })
    _avatarState: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _avatarReborn: cc.Label = null;

    @property({ type: cc.Node, visible: true })
    _nodeRole: cc.Node = null;

    @property({ type: CommonHeroAvatar, visible: true })
    _commonHeroAvatar: CommonHeroAvatar = null;

    @property({ type: cc.Node, visible: true })
    _nodeAvatarInfo: cc.Node = null;

    @property({ type: cc.Label, visible: true })
    _avatarName: cc.Label = null;

    @property({ type: cc.Node, visible: true })
    _nodeEffect: cc.Node = null;

    @property({ type: cc.ProgressBar, visible: true })
    _monsterBlood: cc.ProgressBar = null;

    @property({ type: cc.Label, visible: true })
    _percentText: cc.Label = null;

    @property({ type: cc.Node, visible: true })
    _touchPanel: cc.Node = null;
    @property({ type: cc.Prefab, visible: true })
    _qinTombAvatarPrefab: cc.Prefab = null;

    private static MAX_AVATAR_SIZE = 3
    private static CREATE_STATE = "Create"
    private static INIT_STATE = "Init"
    private static STAND_STATE = "Stand" //等待状态
    private static HOOK_STATE = "Hook" //打boss，与掠夺
    private static PK_STATE = "PK" //打boss，与掠夺
    private static REBORN_STATE = "ReBorn" //死亡状态

    private _currState;
    private _monsterId;
    private _mapNode;
    private _stateMachine;

    private _commonHookAvatars: QinTombAvatar[];
    private _commonPkAvatars: QinTombAvatar[];

    public init(pointId, mapNode) {
        this._currState = 0;
        this._monsterId = pointId;
        this._mapNode = mapNode;
        this._commonHookAvatars = [];
        this._commonPkAvatars = [];
        this._commonHeroAvatar.init();

        this._initStateMachine();
        this._nodeEffect.active = (false);
        this._touchPanel.on(cc.Node.EventType.TOUCH_END, handler(this, this.onClickMonster));
        this.clearMonsterState();
        this.switchState(QinTombMonsterAvatar.INIT_STATE);
    }

    private _initStateMachine(defaultState?) {
        if (this._stateMachine) {
            return;
        }
        var cfg = {
            'defaultState': QinTombMonsterAvatar.CREATE_STATE,
            'stateChangeCallback': handler(this, this._stateChangeCallback),
            'state': {
                [QinTombMonsterAvatar.CREATE_STATE]: {
                    'nextState': {
                        [QinTombMonsterAvatar.INIT_STATE]: {}
                    }
                },

                [QinTombMonsterAvatar.INIT_STATE]: {
                    'nextState': {
                        [QinTombMonsterAvatar.STAND_STATE]: {},
                        [QinTombMonsterAvatar.REBORN_STATE]: {},
                        [QinTombMonsterAvatar.HOOK_STATE]: {},
                        [QinTombMonsterAvatar.PK_STATE]: {}
                    },
                    'didEnter': handler(this, this._didEnterInit)
                },

                [QinTombMonsterAvatar.STAND_STATE]: {
                    'nextState': {
                        [QinTombMonsterAvatar.HOOK_STATE]: {},
                        [QinTombMonsterAvatar.PK_STATE]: {}
                    },
                    'didEnter': handler(this, this._didEnterStand),
                    'didExit': handler(this, this._didWillExitStand)
                },

                [QinTombMonsterAvatar.HOOK_STATE]: {
                    'nextState': {
                        [QinTombMonsterAvatar.STAND_STATE]: {},
                        [QinTombMonsterAvatar.PK_STATE]: {},
                        [QinTombMonsterAvatar.REBORN_STATE]: {}
                    },
                    'didEnter': handler(this, this._didEnterHook),
                    'willExit': handler(this, this._didWillExitHook)
                },

                [QinTombMonsterAvatar.PK_STATE]: {
                    'nextState': {
                        [QinTombMonsterAvatar.HOOK_STATE]: {},
                        [QinTombMonsterAvatar.STAND_STATE]: {}
                    },
                    'didEnter': handler(this, this._didEnterPK),
                    'willExit': handler(this, this._didWillExitPK)
                },

                [QinTombMonsterAvatar.REBORN_STATE]: {
                    'nextState': {
                        [QinTombMonsterAvatar.STAND_STATE]: {
                            'transition': handler(this, this._transitionRebornToStand),
                            'stopTransition': handler(this, this._stopTransitionRebornToStand)
                        },
                        [QinTombMonsterAvatar.HOOK_STATE]: {
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

    public onCreate() {
        // this._initStateMachine();
        // this._nodeEffect.active = (false);
        // this._touchPanel.on(cc.Node.EventType.TOUCH_END, handler(this, this.onClickMonster));
        // this.clearMonsterState();
        // this.switchState(QinTombMonsterAvatar.INIT_STATE);
    }

    public switchState(state, params?, isForceStop?) {
        this._stateMachine.switchState(state, params, isForceStop);
    }

    public onClickMonster(sender) {
        var [result, errorFunc] = QinTombHelper.checkAttackMonster(this._monsterId);
        if (result == false) {
            errorFunc();
            return;
        }
        G_UserData.getQinTomb().c2sGraveBattlePoint();
    }

    public getQinMonster() {
        var monster = G_UserData.getQinTomb().getMonster(this._monsterId);
        return monster;
    }

    public clearMonsterState() {
        for (let i = 0; i < QinTombMonsterAvatar.MAX_AVATAR_SIZE; i++) {
            var node = this._commonHookAvatars[i];
            if (node) {
                node.node.removeFromParent();
            }
        }
        for (let i = 0; i < QinTombMonsterAvatar.MAX_AVATAR_SIZE; i++) {
            var node = this._commonPkAvatars[i];
            if (node) {
                node.node.removeFromParent();
            }
        }
        this._commonHookAvatars = [];
        this._commonPkAvatars = [];

        for (let i = 0; i < QinTombMonsterAvatar.MAX_AVATAR_SIZE; i++) {
            var avatar = cc.instantiate(this._qinTombAvatarPrefab).getComponent(QinTombAvatar);
            avatar.init(this.node);
            avatar.node.name = ('_commonHookAvatar' + (i + 1));
            this.node.addChild(avatar.node);
            avatar.syncVisible(false);
            this._commonHookAvatars.push(avatar);
        }
        for (let i = 0; i < QinTombMonsterAvatar.MAX_AVATAR_SIZE; i++) {
            var avatar = cc.instantiate(this._qinTombAvatarPrefab).getComponent(QinTombAvatar);
            avatar.init(this.node);
            avatar.node.name = ('_commonPkAvatar' + (i + 1));
            this.node.addChild(avatar.node);
            avatar.syncVisible(false);
            this._commonPkAvatars.push(avatar);
        }
    }

    public updateUI() {
        var monster = G_UserData.getQinTomb().getMonster(this._monsterId);
        this._commonHeroAvatar.setBaseId(monster.getBaseId());
        this._commonHeroAvatar.setAsset(monster.getBaseId());
        this._avatarName.string = ('' + monster.getName());
        this._avatarName.node.color = (Colors.getColor(monster.getColor()));
        UIHelper.enableOutline(this._avatarName, Colors.getColorOutline(monster.getColor()), 2);
        this._commonHeroAvatar.setAction('idle', true);
        // this._commonHeroAvatar.node.zIndex = (0);
        this.node.setPosition(monster.getPosition());
        this.updateHookAvatar();
        this.updatePkAvatar();
        this.updateHp();
        this.updateMonument();
        this._nodeAvatarInfo.setPosition(QinTombConst.MONSTER_AVATAR_INFO_POS);
        if (this.getCurState() == QinTombMonsterAvatar.HOOK_STATE) {
            this._enterHookAction();
        }
    }

    public setMonsterVisible(show) {
        // console.log("setMonsterVisible");
        for (let i = 0; i < QinTombMonsterAvatar.MAX_AVATAR_SIZE; i++) {
            var avatar = this._commonHookAvatars[i];
            if (avatar) {
                avatar.setSoundEnable(show);
            }
        }
        this.node.active = (show);
    }

    public updateHp() {
        var monster = G_UserData.getQinTomb().getMonster(this._monsterId);
        var [currHp, hpMax] = monster.getDieTime();
        var percent = Math.floor(currHp / hpMax * 100);
        if (percent > 0) {
            this._percentText.string = (percent + '%');
        } else {
            this._percentText.string = (' ');
        }
        this._monsterBlood.progress = (percent / 100);
        this.updateLabelState();
        this.playAttackEffect();
    }

    public updateLabelState() {
        var monster = G_UserData.getQinTomb().getMonster(this._monsterId);
        if (monster == null) {
            return;
        }
        var monsterState = monster.getCurrState();
        this._avatarState.node.active = (false);
        this._avatarReborn.node.active = (false);
        if (monsterState == QinTombConst.MONSTER_STATE_PK) {
            var pkTime = QinTombHelper.getQinInfo('pk_time');
            var leftTime = G_ServerTime.getLeftSeconds(monster.getStop_time() + pkTime);
            if (leftTime) {
                this._avatarState.string = (Lang.get('qin_tomb_monster_state1', { num: leftTime }));
                this._avatarState.node.active = (true);
            }
        }
        if (monsterState == QinTombConst.MONSTER_STATE_HOOK) {
        }
        if (monsterState == QinTombConst.MONSTER_STATE_DEATH) {
            var rebornTime = monster.getRebornTime();
            var curTime = G_ServerTime.getTime();
            if (rebornTime > 0 && curTime <= rebornTime) {
                var leftTime = rebornTime - curTime;
                this._avatarReborn.string = (Lang.get('qin_tomb_monster_state2', { num: leftTime }));
                this._avatarReborn.node.active = (true);
            }
        }
    }

    public updateHookAvatar() {
        // console.log("updateHookAvatar");
        var monster = G_UserData.getQinTomb().getMonster(this._monsterId);
        var teamId = monster.getOwn_team_id();
        for (let i = 0; i < QinTombMonsterAvatar.MAX_AVATAR_SIZE; i++) {
            var avatarNode = this._commonHookAvatars[i];
            if (avatarNode) {
                avatarNode.syncVisible(false);
            }
        }
        if (teamId && teamId > 0) {
            var teamUnit = G_UserData.getQinTomb().getTeamById(teamId);
            if (teamUnit) {
                var teamList = teamUnit.getTeamUsers();
                for (let i in teamList) {
                    var value = teamList[i];
                    var [hookWorldPos, dir] = monster.getHookPosition(parseInt(i) - 1);
                    var avatarNode = this._commonHookAvatars[parseInt(i) - 1];
                    if (avatarNode) {
                        avatarNode.syncVisible(true);
                        avatarNode.updateUI(value, teamUnit.getTeamId(), teamUnit.getTeamLeaderId());
                        avatarNode.node.setPosition(hookWorldPos);
                        if (dir) {
                            avatarNode.setAvatarScaleX(dir);
                        }
                        avatarNode.node.zIndex = (-hookWorldPos.y);
                    }
                }
            }
        }
    }

    public updatePkAvatar() {
        var monster = G_UserData.getQinTomb().getMonster(this._monsterId);
        var teamId = monster.getBattle_team_id();
        for (let i = 0; i < QinTombMonsterAvatar.MAX_AVATAR_SIZE; i++) {
            var avatarNode = this._commonPkAvatars[i];
            if (avatarNode) {
                avatarNode.syncVisible(false);
            }
        }
        if (teamId == 0) {
            return;
        }
        var teamUnit = G_UserData.getQinTomb().getTeamById(teamId);
        if (teamUnit == null) {
            return;
        }
        var teamList = teamUnit.getTeamUsers();
        for (let i in teamList) {
            var value = teamList[i];
            var pkPos = monster.getPkPosition(i);
            var [hookPos, dir] = monster.getHookPosition(parseInt(i) - 1);
            var avatarNode = this._commonPkAvatars[parseInt(i) - 1];
            if (avatarNode) {
                avatarNode.syncVisible(true);
                avatarNode.updateUI(value, teamUnit.getTeamId(), teamUnit.getTeamLeaderId());
                avatarNode.node.setPosition(pkPos);
                avatarNode.setAvatarScaleX(dir);
                avatarNode.node.zIndex = (-pkPos.y);
                avatarNode.showPkEffect(hookPos, pkPos);
            }
        }
    }

    public updateMonument() {
        this._monumentAvatar.removeAllChildren();
        var monster = G_UserData.getQinTomb().getMonster(this._monsterId);
        var monumentList = monster.getMonumentList();
        let createDeadImg = function (pos) {
            var tempNode = UIHelper.createImage({ texture: Path.getQinTomb('qin_dead_state') });
            tempNode.setPosition(pos);
            tempNode.zIndex = (-pos.y);
            this._monumentAvatar.addChild(tempNode);
        }.bind(this);
        for (let i in monumentList) {
            var value = monumentList[i];
            for (let k in value.member) {
                var j = value.member[k];
                if (value.position == 1) {
                    var pos = value.pkPos[k];
                    if (pos && typeof (pos) == 'object') {
                        createDeadImg(pos);
                    }
                } else {
                    var pos = value.hookPos[k];
                    if (pos && typeof (pos) == 'object') {
                        createDeadImg(pos);
                    }
                }
            }
        }
    }

    public setAction(name, loop?) {
        this._commonHeroAvatar.setAction(name, loop);
    }

    public showShadow(visible) {
        this._commonHeroAvatar.showShadow(visible);
    }

    public setAniTimeScale(timeScale) {
        this._commonHeroAvatar.setAniTimeScale(timeScale);
    }

    public turnBack(needBack) {
        this._commonHeroAvatar.turnBack(needBack);
    }

    public playAttackEffect() {
        if (QinTombHelper.checkMyTeamInBossPoint(this._monsterId)) {
            if (this._nodeEffect.active == false) {
                this._nodeEffect.active = (true);
                this._nodeEffect.removeAllChildren();
                G_EffectGfxMgr.createPlayGfx(this._nodeEffect, 'effect_xianqinhuangling_shuangjian', null, true);
            }
        } else {
            this._nodeEffect.active = (false);
        }
    }

    public playAttackAction() {
        var monster = G_UserData.getQinTomb().getMonster(this._monsterId);
        if (monster == null) {
            return;
        }
        var seq = cc.sequence(cc.delayTime(0.8), cc.callFunc(function () {
            var dirIndex = Math.floor(Math.random() * (3 - 1) + 1);
            var dir = 1;
            if (dirIndex == 2) {
                dir = -1;
            }
            this._commonHeroAvatar.setAction('skill1', false);
            this._commonHeroAvatar.node.scaleX = (dir);
        }.bind(this)), cc.delayTime(monster.getAttackActionTime()), cc.callFunc(function () {
            this._commonHeroAvatar.setAction('idle', true);
        }.bind(this)), cc.delayTime(1), cc.callFunc(function () {
        }));
        var rep = cc.repeatForever(seq);
        this.node.stopAllActions();
        this.node.runAction(rep);
    }

    private _didEnterInit() {
    }

    private _stateChangeCallback(newState, oldState) {
    }

    private _didEnterStand() {
        this.node.stopAllActions();
        this._nodeRole.active = (true);
        this.setAction('idle', true);
    }

    private _didWillExitStand(nextState) {
    }

    private _enterHookAction() {
        this._nodeRole.active = (true);
        for (let i = 0; i < QinTombMonsterAvatar.MAX_AVATAR_SIZE; i++) {
            var avatar = this._commonHookAvatars[i];
            if (avatar && avatar.node.active) {
                avatar.playLoopAttackAction();
            }
        }
        this.playAttackAction();
    }

    private _didEnterHook() {
        var monster = G_UserData.getQinTomb().getMonster(this._monsterId);
        var serverState = monster.getCurrState();
        this._enterHookAction();
    }

    private _didWillExitHook() {
        var monster = G_UserData.getQinTomb().getMonster(this._monsterId);
        var serverState = monster.getCurrState();
        for (let i = 0; i < QinTombMonsterAvatar.MAX_AVATAR_SIZE; i++) {
            var avatar = this._commonHookAvatars[i];
            if (avatar && avatar.node.active) {
                avatar.stopLoopAttackAction();
            }
        }
    }

    private _didEnterPK() {
        this._commonHeroAvatar.setAction('idle', true);
    }

    private _didWillExitPK() {
    }

    private _didEnterReborn() {
        // console.log("_didEnterReborn");
        for (let i = 0; i < QinTombMonsterAvatar.MAX_AVATAR_SIZE; i++) {
            var avatar = this._commonHookAvatars[i];
            if (avatar) {
                avatar.stopLoopAttackAction();
            }
        }
        this.node.stopAllActions();
        var callback = function () {
            var monster = G_UserData.getQinTomb().getMonster(this._monsterId);
            var serverState = monster.getCurrState();
            if (serverState == QinTombConst.MONSTER_STATE_HOOK || serverState == QinTombConst.MONSTER_STATE_PK) {
                this.switchState(QinTombMonsterAvatar.HOOK_STATE);
            } else {
                this.switchState(QinTombMonsterAvatar.STAND_STATE);
            }
        }.bind(this);
        var playDieAction = function () {
            this._commonHeroAvatar.setAction('die', false);
        }.bind(this);
        var playDieActionFinish = function () {
            this._nodeRole.active = (false);
        }.bind(this);
        var curTime = G_ServerTime.getTime();
        var monster = G_UserData.getQinTomb().getMonster(this._monsterId);
        var time = monster.getRebornTime();
        var leftTime = Math.max(0.01, time - curTime);
        // console.log(leftTime);
        var dieAction = monster.getDieActionTime();
        // var seq = cc.spawn(
        //     cc.sequence(
        //         cc.callFunc(playDieAction),
        //         cc.fadeOut(dieAction),
        //         cc.callFunc(playDieActionFinish)
        //     ),
        //     cc.sequence(
        //         cc.delayTime(leftTime),
        //         cc.callFunc(callback)
        //     )//this._nodeRole.active= false 不会执行此action
        // );
        let seq = cc.sequence(
            cc.callFunc(playDieAction),
            cc.fadeOut(dieAction),
            cc.callFunc(playDieActionFinish)
        )
        let seq2 = cc.sequence(
            cc.delayTime(leftTime),
            cc.callFunc(callback)
        )
        this._nodeRole.stopAllActions();
        this._nodeRole.runAction(seq);
        this.node.runAction(seq2);
    }

    private _stopTransitionRebornToStand() {
    }

    private _didWillExitReborn() {
    }

    private _transitionRebornToStand(finishFunc) {
        this._nodeRole.active = (true);
        function eventFunction(event) {
            if (event == 'finish') {
                finishFunc();
            }
        }
        var gfxEffect1 = G_EffectGfxMgr.createPlayGfx(this._nodeRole, 'effect_juntuan_chuxian', eventFunction);
        var gfxEffect2 = G_EffectGfxMgr.applySingleGfx(this._nodeRole, 'smoving_juntuan_chuxian');

    }

    public getCurState() {
        return this._stateMachine.getCurState();
    }

    public canSwitchToState(nextState, isForceStop) {
        return this._stateMachine.canSwitchToState(nextState, isForceStop);
    }

    private _saveSwitchState(state, params) {
        if (this.canSwitchToState(state, null)) {
            this._stateMachine.switchState(state, params, true);
        }
    }

    public synServerInfo() {
        var curstate = this.getCurState();
        var monster = G_UserData.getQinTomb().getMonster(this._monsterId);
        var serverState = monster.getCurrState();
        // console.log("synServerInfo:", curstate, serverState);
        let switchHookState = function (serverState) {
            if (serverState == QinTombConst.MONSTER_STATE_HOOK) {
                this._saveSwitchState(QinTombMonsterAvatar.HOOK_STATE);
                return true;
            }
            return false;
        }.bind(this);
        let switchPKState = function (serverState) {
            if (serverState == QinTombConst.MONSTER_STATE_PK) {
                this._saveSwitchState(QinTombMonsterAvatar.PK_STATE);
                return true;
            }
            return false;
        }.bind(this);
        let switchRebornState = function (serverState) {
            if (serverState == QinTombConst.MONSTER_STATE_DEATH) {
                this._saveSwitchState(QinTombMonsterAvatar.REBORN_STATE);
                return true;
            }
            return false;
        }.bind(this);
        let switchIdleState = function (serverState) {
            if (serverState == QinTombConst.MONSTER_STATE_IDLE) {
                this._saveSwitchState(QinTombMonsterAvatar.STAND_STATE);
                return true;
            }
            return false;
        }.bind(this);
        if (curstate == QinTombMonsterAvatar.STAND_STATE || curstate == QinTombMonsterAvatar.INIT_STATE) {
            if (switchHookState(serverState)) {
                return;
            }
            if (switchPKState(serverState)) {
                return;
            }
        }
        if (curstate == QinTombMonsterAvatar.HOOK_STATE || curstate == QinTombMonsterAvatar.INIT_STATE) {
            if (switchPKState(serverState)) {
                return;
            }
            if (switchRebornState(serverState)) {
                return;
            }
            if (switchIdleState(serverState)) {
                return;
            }
        }
        if (curstate == QinTombMonsterAvatar.PK_STATE || curstate == QinTombMonsterAvatar.INIT_STATE) {
            if (switchHookState(serverState)) {
                return;
            }
            if (switchIdleState(serverState)) {
                return;
            }
        }
    }
}