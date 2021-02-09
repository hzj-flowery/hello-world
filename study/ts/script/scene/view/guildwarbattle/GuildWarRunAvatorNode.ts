import { GuildWarConst } from "../../../const/GuildWarConst";
import { HeroConst } from "../../../const/HeroConst";
import { SignalConst } from "../../../const/SignalConst";
import { GuildWarUser } from "../../../data/GuildWarUser";
import { Colors, G_ConfigLoader, G_EffectGfxMgr, G_ServerTime, G_SignalManager, G_UserData } from "../../../init";
import CommonSimpleHeroAvatar from "../../../ui/component/CommonSimpleHeroAvatar";
import { CurveHelper } from "../../../utils/CurveHelper";
import { GuildWarDataHelper } from "../../../utils/data/GuildWarDataHelper";
import { handler } from "../../../utils/handler";
import UIHelper from "../../../utils/UIHelper";
import { Util } from "../../../utils/Util";
import ViewBase from "../../ViewBase";
import StateMachine from "../countryboss/StateMachine";
import GuildWarUserHpNode from "./GuildWarUserHpNode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildWarRunAvatorNode extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeAlpha: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textGuildName: cc.Label = null;

    public static readonly CREATE_STATE = 'Create';
    public static readonly INIT_STATE = 'Init';
    public static readonly STAND_STATE = 'Stand';
    public static readonly RUN_STATE = 'Run';
    public static readonly ATTACK_STATE = 'Attack';
    public static readonly RELEASE_STATE = 'Release';
    public static readonly GOHOME_STATE = 'GoHome';
    public static readonly FINISH_STATE = 'Finish';
    public static readonly REBORN_STATE = 'ReBorn';
    public static readonly SCALE_AVATAR = 0.5;
    public static readonly AVATAR_RUN_TIME_SCALE = 1.5;
    public static readonly HIDE_POS = cc.v2(-4000, -4000);
    _slotDistributor: any;
    _zorderHelepr: any;
    _avatarDistributor: any;
    _commonHeroAvatar: CommonSimpleHeroAvatar;
    _slotIndex: any;
    _slotData: { pointId: number; faceIndex: number; slotIndex: any; };
    _hpNode: any;
    _isTest: any;
    _finishFunc: any;
    _userData: GuildWarUser;
    _stateMachine: any;
    _gfxEffect1: any;
    _gfxEffect2: any;
    _spineCallback: () => void;


    ctor(slotDistributor, zorderHelepr, avatarDistributor, userData, isTest) {
        this._slotDistributor = slotDistributor;
        this._zorderHelepr = zorderHelepr;
        this._avatarDistributor = avatarDistributor;
        this._userData = new GuildWarUser(userData);
        this._commonHeroAvatar = null;
        this._slotIndex = null;
        this._slotData = {
            pointId: 0,
            faceIndex: 0,
            slotIndex: null
        };
        this._hpNode = null;
        this._isTest = isTest;
        this._finishFunc = null;
    }
    onCreate() {
        this._initStateMachine(null);
        this.switchState(GuildWarRunAvatorNode.INIT_STATE);
    }
    onEnter() {
    }
    onExit() {
    }
    _initStateMachine(defaultState) {
        if (this._stateMachine) {
            return;
        }
        var cfg = {
            ['defaultState']: GuildWarRunAvatorNode.CREATE_STATE,
            ['stateChangeCallback']: handler(this, this._stateChangeCallback),
            ['state']: {
                [GuildWarRunAvatorNode.CREATE_STATE]: { ['nextState']: { [GuildWarRunAvatorNode.INIT_STATE]: {} } },
                [GuildWarRunAvatorNode.INIT_STATE]: {
                    ['nextState']: {
                        [GuildWarRunAvatorNode.STAND_STATE]: {},
                        [GuildWarRunAvatorNode.RUN_STATE]: {},
                        [GuildWarRunAvatorNode.REBORN_STATE]: {}
                    },
                    ['didEnter']: handler(this, this._didEnterInit)
                },
                [GuildWarRunAvatorNode.STAND_STATE]: {
                    ['nextState']: {
                        [GuildWarRunAvatorNode.RUN_STATE]: {},
                        [GuildWarRunAvatorNode.ATTACK_STATE]: {},
                        [GuildWarRunAvatorNode.RELEASE_STATE]: {},
                        [GuildWarRunAvatorNode.GOHOME_STATE]: {},
                        [GuildWarRunAvatorNode.FINISH_STATE]: {},
                        [GuildWarRunAvatorNode.REBORN_STATE]: {}
                    },
                    ['didEnter']: handler(this, this._didEnterStand),
                    ['didExit']: handler(this, this._didWillExitStand)
                },
                [GuildWarRunAvatorNode.RUN_STATE]: {
                    ['nextState']: {
                        [GuildWarRunAvatorNode.STAND_STATE]: {
                            ['transition']: handler(this, this._transitionRunToStand),
                            ['stopTransition']: handler(this, this._stopTransitionRunToStand)
                        },
                        [GuildWarRunAvatorNode.RELEASE_STATE]: {},
                        [GuildWarRunAvatorNode.FINISH_STATE]: {},
                        [GuildWarRunAvatorNode.REBORN_STATE]: {}
                    },
                    ['didEnter']: handler(this, this._didEnterRun),
                    ['willExit']: handler(this, this._didWillExitRun),
                    ['didExit']: handler(this, this._didExitRun),
                    ['stopExit']: handler(this, this._didStopExitRun)
                },
                [GuildWarRunAvatorNode.ATTACK_STATE]: {
                    ['nextState']: {
                        [GuildWarRunAvatorNode.STAND_STATE]: {},
                        [GuildWarRunAvatorNode.RUN_STATE]: {},
                        [GuildWarRunAvatorNode.RELEASE_STATE]: {},
                        [GuildWarRunAvatorNode.FINISH_STATE]: {},
                        [GuildWarRunAvatorNode.REBORN_STATE]: {}
                    },
                    ['didEnter']: handler(this, this._didEnterAttack),
                    ['willExit']: handler(this, this._didWillExitAttack)
                },
                [GuildWarRunAvatorNode.RELEASE_STATE]: {
                    ['nextState']: {
                        [GuildWarRunAvatorNode.INIT_STATE]: {
                            ['transition']: handler(this, this._transitionReleaseToInit)
                        }
                    },
                    ['didEnter']: handler(this, this._didEnterRelease)
                },
                [GuildWarRunAvatorNode.GOHOME_STATE]: {
                    ['nextState']: {
                        [GuildWarRunAvatorNode.RELEASE_STATE]: {},
                        [GuildWarRunAvatorNode.FINISH_STATE]: {}
                    },
                    ['didEnter']: handler(this, this._didEnterGoHome),
                    ['willExit']: handler(this, this._didWillExitGoHome)
                },
                [GuildWarRunAvatorNode.FINISH_STATE]: {
                    ['nextState']: {},
                    ['didEnter']: handler(this, this._didEnterFinish)
                },
                [GuildWarRunAvatorNode.REBORN_STATE]: {
                    ['nextState']: {
                        [GuildWarRunAvatorNode.STAND_STATE]: {
                            ['transition']: handler(this, this._transitionRebornToStand),
                            ['stopTransition']: handler(this, this._stopTransitionRebornToStand)
                        }
                    },
                    ['didEnter']: handler(this, this._didEnterReborn),
                    ['willExit']: handler(this, this._didWillExitReborn)
                }
            }
        };
        this._stateMachine = new StateMachine(cfg);
    }
    _stateChangeCallback(param) {
        var newState = param[0];
        var oldState = param[1];
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_WAR_BATTLE_AVATAR_STATE_CHANGE, this._userData, newState, oldState, this);
        if (oldState == GuildWarRunAvatorNode.RUN_STATE && this._userData) {
            var oldPointId = this._userData.getOld_point();
            var nowPointId = this._userData.getNow_point();
            var userId = this._userData.getUser_id();
            var changedPointMap = {};
            var changedUserMap = {};
            changedPointMap[oldPointId] = true;
            changedPointMap[nowPointId] = true;
            changedUserMap[userId] = true;
            G_SignalManager.dispatch(SignalConst.EVENT_GUILD_WAR_POINT_CHANGE, this._userData.getCity_id(), changedPointMap, changedUserMap);
        }
        if (newState == GuildWarRunAvatorNode.INIT_STATE) {
            var isBorn = this._userData.isInBorn() && this._userData.isSelf();
            if (isBorn) {
                this.switchState(GuildWarRunAvatorNode.REBORN_STATE);
            } else {
                var isRun = this._userData.getCurrPoint() == 0;
                this.switchState(isRun ? GuildWarRunAvatorNode.RUN_STATE : GuildWarRunAvatorNode.STAND_STATE);
            }
        }
        if ((oldState == GuildWarRunAvatorNode.RUN_STATE || oldState == GuildWarRunAvatorNode.REBORN_STATE) && newState == GuildWarRunAvatorNode.STAND_STATE && this._isTest == true) {
            var oldPoint = this._userData.getNow_point();
            var movePointList = GuildWarDataHelper.findShowMoveSignPointList(this._userData.getCity_id(), oldPoint);
            var index = Util.getRandomInt(0, movePointList.length);
            var destPointId = movePointList[index].pointId;
            var cityId = this._userData.getCity_id();
            var nowPoint = destPointId;
            var moveTime = G_ServerTime.getTime() + 3;
            this._userData.setOld_point(oldPoint);
            this._userData.setNow_point(nowPoint);
            this._userData.setMove_time(moveTime);
            this.switchState(GuildWarRunAvatorNode.RUN_STATE);
        }
    }
    _didEnterInit() {
        function getAvatarLimit(avatarBaseId) {
            var limit = 0;
            if (avatarBaseId > 0) {
                limit = parseInt(G_ConfigLoader.getConfig('avatar').get(avatarBaseId).limit) > 0 && HeroConst.HERO_LIMIT_MAX_LEVEL || 0;
            }
            return limit;
        }
        if (!this._commonHeroAvatar) {
            var cityId = this._userData.getCity_id();
            var guildId = GuildWarDataHelper.getMyGuildWarGuildId(cityId);
            var isSameGuild = this._userData.getGuild_id() == guildId;
            var showAvatar = true;
            if (showAvatar) {
                showAvatar = this._avatarDistributor.retainAvatar();
            }
            if (showAvatar || this._userData.isSelf()) {
                let res = cc.resources.get("prefab/common/CommonSimpleHeroAvatar");
                let node1 = cc.instantiate(res) as cc.Node;
                this._commonHeroAvatar = node1.getComponent(CommonSimpleHeroAvatar) as CommonSimpleHeroAvatar;
                this.node.addChild(this._commonHeroAvatar.node);
                this._commonHeroAvatar._init(this.node);
            }
        }
        if (this._commonHeroAvatar) {
            var avatarId = G_UserData.getBase().getAvatar_base_id();
            if (this._userData.isSelf() && avatarId != this._userData._playerInfo.avatarBaseId) {
                var limit = getAvatarLimit(avatarId);
                var myHeroId = G_UserData.getHero().getRoleBaseId();
                var playerBaseId = G_UserData.getBase().getPlayerBaseId();
                myHeroId = playerBaseId > 0 ? playerBaseId : myHeroId;
                this._commonHeroAvatar.updateUI(myHeroId, '', false, limit);
            } else {
                this._commonHeroAvatar.updateUI(this._userData._playerInfo.covertId, '', false, getAvatarLimit(this._userData._playerInfo.avatarBaseId));
            }
            this._commonHeroAvatar.setScale(GuildWarRunAvatorNode.SCALE_AVATAR);
        }
        this._textGuildName.string = (this._userData.getGuild_name());
        this._textName.string = (this._userData.getUser_name());
        this._refreshColor();
        if (this._hpNode) {
            this._hpNode.setVisible(false);
        }
        if (this._userData.isSelf()) {
            if (!this._hpNode) {
                this._hpNode = Util.getNode("prefab/guildwarbattle/GuildWarUserHpNode", GuildWarUserHpNode) as GuildWarUserHpNode;
                this._hpNode.node.setPosition(0, 100);
                this.node.addChild(this._hpNode.node);
            }
            this._hpNode.node.active = (true);
        }
        this._refreshUserHp();
    }
    _didEnterStand() {
        this._retainSlotIndex();
        if (this._commonHeroAvatar) {
            var pointId = this._userData.getNow_point();
            var faceIndex = this._getFaceId(pointId);
            this._commonHeroAvatar.setAction('idle', true);
            this._commonHeroAvatar.showShadow(true);
            this._commonHeroAvatar.turnBack(faceIndex == 2);
            this._commonHeroAvatar.setAniTimeScale(1);
        }
        this._refreshUserHp();
    }
    _didWillExitStand(nextState) {
        if (nextState != GuildWarRunAvatorNode.ATTACK_STATE) {
            this._releaseSlotIndex();
        }
    }
    _didEnterRun() {
        if (this._commonHeroAvatar) {
            this._commonHeroAvatar.setAction('run', true);
            this._commonHeroAvatar.showShadow(true);
            this._commonHeroAvatar.setAniTimeScale(GuildWarRunAvatorNode.AVATAR_RUN_TIME_SCALE);
        }
        var finishCallback = function () {
            var currPoint = this._userData.getCurrPoint();
            this.switchState(GuildWarRunAvatorNode.STAND_STATE, null, true);
        }.bind(this);
        this._doCurveMove(finishCallback);
    }
    _transitionRunToStand(finishFunc) {
        var isSelf = this._userData.isSelf();
        if (!isSelf) {
            if (this._commonHeroAvatar) {
                this._commonHeroAvatar.setAniTimeScale(1);
                this._commonHeroAvatar.setAction('idle', true);
            }
            this._nodeAlpha.stopAllActions();
            this._nodeAlpha.opacity = (255);
            var fadeOut = cc.fadeTo(0.75, 0);
            var seq = cc.sequence(fadeOut, cc.delayTime(0.2), cc.callFunc(function (actionNode) {
                this._nodeAlpha.opacity = (255);
                finishFunc();
            }.bind(this)));
            this._nodeAlpha.runAction(seq);
        } else {
            finishFunc();
        }
    }
    _stopTransitionRunToStand() {
        var isSelf = this._userData.isSelf();
        if (!isSelf) {
            this._nodeAlpha.stopAllActions();
            this._nodeAlpha.opacity = (255);
        }
    }
    _didWillExitRun() {
        CurveHelper.stopCurveMove(this);
    }
    _didExitRun() {
    }
    _didStopExitRun() {
    }
    _didEnterGoHome() {
        if (this._commonHeroAvatar) {
            this._commonHeroAvatar.setAction('run', true);
            this._commonHeroAvatar.showShadow(true);
            this._commonHeroAvatar.setAniTimeScale(GuildWarRunAvatorNode.AVATAR_RUN_TIME_SCALE);
        }
        var finishCallback = function () {
            var cityId = this._userData.getCity_id();
            var exitCityId = GuildWarDataHelper.getGuildWarExitCityId(cityId);
            G_UserData.getGuildWar().c2sEnterGuildWar(exitCityId);
            this.switchState(GuildWarRunAvatorNode.RELEASE_STATE);
        }.bind(this);
        this._doCurveMove(finishCallback);
    }
    _didWillExitGoHome() {
        CurveHelper.stopCurveMove(this);
    }
    _didEnterAttack() {
        if (this._commonHeroAvatar) {
            this._spineCallback = function () {
                this._spineCallback = null;
                this.switchState(GuildWarRunAvatorNode.STAND_STATE);
            }.bind(this);
            this._commonHeroAvatar.setAction('skill1', false);
            this._commonHeroAvatar.addSpineLoadHandler(this._spineCallback);
            this._commonHeroAvatar.showShadow(true);
            this._commonHeroAvatar.setAniTimeScale(1);
        }
        this._refreshUserHp();
    }
    _didWillExitAttack(nextState) {
        if (nextState != GuildWarRunAvatorNode.STAND_STATE) {
            this._releaseSlotIndex();
        }
        if (this._commonHeroAvatar) {
            if (this._spineCallback) {
                this._commonHeroAvatar.removeSpineLoadHandler(this._spineCallback);
                this._spineCallback = null;
            }
        }
    }
    _didEnterRelease() {
        this.node.active = (false);
        this._isTest = false;
    }
    _didEnterFinish(isWinner) {
        if (this._commonHeroAvatar) {
            this._commonHeroAvatar.setAction(isWinner && 'win' || 'dizzy', true);
            this._commonHeroAvatar.showShadow(true);
            this._commonHeroAvatar.setAniTimeScale(1);
        }
    }
    _transitionReleaseToInit(finishFunc) {
        this.node.active = (true);
        finishFunc();
    }
    _didEnterReborn() {
        this._goCamp();
        this.node.active = (false);
        this._retainSlotIndex();
        var callback = function () {
            this.switchState(GuildWarRunAvatorNode.STAND_STATE);
        }.bind(this);
        var curTime = G_ServerTime.getTime();
        var time = this._userData.getRelive_time();
        var leftTime = Math.max(0.01, time - curTime);
        var seq = cc.sequence(cc.delayTime(leftTime), cc.callFunc(callback));
        this._nodeAlpha.stopAllActions();
        this._nodeAlpha.runAction(seq);
    }
    _transitionRebornToStand(finishFunc) {
        this.node.active = (true);
        function eventFunction(event) {
            if (event == 'finish') {
                this._gfxEffect1 = null;
                this._gfxEffect2 = null;
                finishFunc();
            }
        }
        var gfxEffect1 = G_EffectGfxMgr.createPlayGfx(this.node, 'effect_juntuan_chuxian', eventFunction.bind(this));
        var gfxEffect2 = G_EffectGfxMgr.applySingleGfx(this.node, 'smoving_juntuan_chuxian');
        this._gfxEffect1 = gfxEffect1;
        this._gfxEffect2 = gfxEffect2;
        //logWarn('GuildWarRunAvatorNode ----------------  _transitionRebornToStand');
    }
    _stopTransitionRebornToStand() {
        if (this._gfxEffect1) {
            this._gfxEffect1.removeFromParent();
        }
        if (this._gfxEffect2) {
            this._gfxEffect2.removeFromParent();
        }
        this._gfxEffect1 = null;
        this._gfxEffect2 = null;
    }
    _didWillExitReborn(nextState) {
        if (nextState != GuildWarRunAvatorNode.STAND_STATE) {
            this._releaseSlotIndex();
        }
        this._nodeAlpha.stopAllActions();
        this.node.active = (true);
    }
    getCurState() {
        return this._stateMachine.getCurState();
    }
    canSwitchToState(nextState, isForceStop?) {
        return this._stateMachine.canSwitchToState(nextState, isForceStop);
    }
    switchState(state, params?, isForceStop?) {
        this._stateMachine.switchState(state, params, isForceStop);
    }
    _saveSwitchState(userData, state, params?) {
        if (this.canSwitchToState(state)) {
            if (state != GuildWarRunAvatorNode.RELEASE_STATE) {
                this._userData.updateUser(userData);
            }
            this._stateMachine.switchState(state, params, true);
        }
    }
    getGuildWarUser() {
        return this._userData;
    }
    isInRelease() {
        return this.getCurState() == GuildWarRunAvatorNode.RELEASE_STATE;
    }
    _getFaceId(pointId) {
        var faceId = 1;
        if (this._userData.getPk_type() == GuildWarConst.CAMP_TYPE_DEFENDER) {
            faceId = 2;
        }
        var oldPoint = this._userData.getOld_point();
        var nowPoint = this._userData.getNow_point();
        var cityId = this._userData.getCity_id();
        if (oldPoint != nowPoint && oldPoint != 0) {
            var oldPointConfig = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId, oldPoint);
            var nowPointConfig = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId, nowPoint);
            if (oldPointConfig.clickPos.x < nowPointConfig.clickPos.x) {
                faceId = 1;
            } else {
                faceId = 2;
            }
        }
        return faceId;
    }
    _setSlotPosition(pointId, faceIndex, newSlot) {
        this._slotIndex = newSlot;
        this._slotData.pointId = pointId;
        this._slotData.faceIndex = faceIndex;
        this._slotData.slotIndex = newSlot;
        var cityId = this._userData.getCity_id();
        var [x, y] = GuildWarDataHelper.getSlotPosition(cityId, pointId, faceIndex, newSlot);
        this.node.setPosition(x, y);
        this._adjustZOrder();
    }
    _retainSlotIndex() {
        if (!this._slotIndex) {
            var isSelf = this._userData.isSelf();
            var pointId = this._userData.getNow_point();
            var faceIndex = this._getFaceId(pointId);
            var newSlot = null;
            if (isSelf) {
                newSlot = GuildWarConst.SELF_SLOT_INDEX;
            } else {
                var show = true;
                var config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(this._userData.getCity_id(), pointId);
                if (config.point_type == GuildWarConst.POINT_TYPE_CAMP_ATTACK) {
                    var user = G_UserData.getGuildWar().getMyWarUser(this._userData.getCity_id());
                    if (this._userData.getGuild_id() != user.getGuild_id() && user.getBorn_point_id() == pointId) {
                        show = false;
                    }
                }
                if (show) {
                    newSlot = this._slotDistributor.retainPointSlot(pointId, faceIndex);
                }
            }
            if (newSlot) {
                this._setSlotPosition(pointId, faceIndex, newSlot);
            } else {
                this.node.setPosition(GuildWarRunAvatorNode.HIDE_POS);
            }
        }
    }
    _releaseSlotIndex() {
        if (this._slotIndex) {
            if (this._slotIndex > GuildWarConst.SELF_SLOT_INDEX) {
                var pointId = this._slotData.pointId;
                var faceIndex = this._slotData.faceIndex;
                this._slotDistributor.releasePointSlot(pointId, faceIndex, this._slotIndex);
            }
            this._slotIndex = null;
        }
    }
    _changePoint(nowUserData) {
        //logWarn('GuildWarRunAvatorNode changePoint');
        var oldPointId = this._userData.getNow_point();
        var nowPointId = nowUserData.getNow_point();
        var userId = this._userData.getUser_id();
        this._releaseSlotIndex();
        this._userData.updateUser(nowUserData);
        this._retainSlotIndex();
        if (this._commonHeroAvatar) {
            var pointId = this._userData.getNow_point();
            var faceIndex = this._getFaceId(pointId);
            this._commonHeroAvatar.setAction('idle', true);
            this._commonHeroAvatar.showShadow(true);
            this._commonHeroAvatar.turnBack(faceIndex == 2);
            this._commonHeroAvatar.setAniTimeScale(1);
        }
        this._refreshUserHp();
        var changedPointMap = {};
        var changedUserMap = {};
        changedPointMap[oldPointId] = true;
        changedPointMap[nowPointId] = true;
        changedUserMap[userId] = true;
        // dump(changedPointMap);
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_WAR_POINT_CHANGE, this._userData.getCity_id(), changedPointMap, changedUserMap);
    }
    _changeRunPath(nowUserData) {
        CurveHelper.stopCurveMove(this);
        this._stopTransitionRunToStand();
        this._userData.updateUser(nowUserData);
        this._didEnterRun();
    }
    _doCurveMove(finishCallback) {
        var isSelf = this._userData.isSelf();
        var slotIndex = this._slotIndex;
        var cityId = this._userData.getCity_id();
        var startPointId = this._userData.getOld_point();
        var endPointId = this._userData.getNow_point();
        var faceIndex = this._getFaceId(startPointId);
        if (!slotIndex) {
            if (isSelf) {
                slotIndex = GuildWarConst.SELF_SLOT_INDEX;
            } else {
                slotIndex = Util.getRandomInt(GuildWarConst.SELF_SLOT_INDEX + 1, GuildWarDataHelper.getStandPointNum(cityId, startPointId, faceIndex));
            }
        }
        var time = G_ServerTime.getTime();
        var curveConfigList = GuildWarDataHelper.getCurveConfigList(cityId, startPointId, endPointId, faceIndex, slotIndex);
        var totalTime = GuildWarDataHelper.getPathRunTime(cityId, startPointId, endPointId);
        var startPointPos = curveConfigList[0][1];
        var endPointPos = curveConfigList[curveConfigList.length - 1][4];
        let newConfig = new Array<Array<any>>();
        for (let i = 0; i < curveConfigList.length; i++) {
            let temp = new Array<any>();
            for (let j in curveConfigList[i]) {
                temp.push(curveConfigList[i][j]);
            }
            newConfig.push(temp);
        }
        CurveHelper.doCurveMove(this, finishCallback, function (angle, oldPos, newPos) {
            if (this._commonHeroAvatar) {
                if (Math.floor(Math.abs(newPos.x - oldPos.x)) <= 1) {
                    this._commonHeroAvatar.turnBack(endPointPos.x < startPointPos.x);
                } else {
                    this._commonHeroAvatar.turnBack(newPos.x < oldPos.x);
                }
            }
        }.bind(this), handler(this, this._adjustZOrder), newConfig, totalTime * 1000, this._userData.getMove_time() * 1000);
    }
    use(userData) {
        var curstate = this.getCurState();
        if (curstate == GuildWarRunAvatorNode.RELEASE_STATE) {
            this._userData.updateUser(userData);
            this.switchState(GuildWarRunAvatorNode.INIT_STATE);
        }
    }
    goHome(pointId) {
        var curstate = this.getCurState();
        if (curstate == GuildWarRunAvatorNode.STAND_STATE) {
            var oldPoint = this._userData.getNow_point();
            var cityId = this._userData.getCity_id();
            var nowPoint = pointId;
            var moveTime = G_ServerTime.getTime() + 14;
            this._userData.setOld_point(oldPoint);
            this._userData.setNow_point(nowPoint);
            this._userData.setMove_time(moveTime);
            this.switchState(GuildWarRunAvatorNode.GOHOME_STATE);
        }
    }
    doFinish(guildId) {
        var isWinner = this._userData.getGuild_id() == guildId;
        this.switchState(GuildWarRunAvatorNode.FINISH_STATE, isWinner);
    }
    doAttack() {
        this.switchState(GuildWarRunAvatorNode.ATTACK_STATE);
    }
    _goCamp() {
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_WAR_BATTLE_GO_CAMP_NOTICE, this._userData);
    }
    _adjustZOrder() {
        var x = this.node.getPosition().x;
        var y = this.node.getPosition().y;
        this.node.zIndex = (this._zorderHelepr.getZOrder(x, y));
    }
    isSelf() {
        var curstate = this.getCurState();
        if (curstate == GuildWarRunAvatorNode.RELEASE_STATE) {
            return false;
        }
        return this._userData.isSelf();
    }
    _refreshUserHp() {
        if (this._hpNode && this._userData.isSelf()) {
            var maxHp = GuildWarDataHelper.getGuildWarHp();
            var hp = this._userData.getWar_value();
            this._hpNode.updateInfo(hp, maxHp);
        }
    }
    _refreshColor() {
        var isSelf = this._userData.isSelf();
        var cityId = this._userData.getCity_id();
        var guildId = GuildWarDataHelper.getMyGuildWarGuildId(cityId);
        var isSameGuild = this._userData.getGuild_id() == guildId;
        if (isSelf) {
            this._textGuildName.node.color = (Colors.GUILD_WAR_MY_COLOR);
            UIHelper.enableOutline(this._textGuildName, Colors.GUILD_WAR_MY_COLOR_OUTLINE, 2);
            UIHelper.enableOutline(this._textName, Colors.GUILD_WAR_MY_COLOR_OUTLINE, 2);
            this._textName.node.color = (Colors.GUILD_WAR_MY_COLOR);
        } else if (isSameGuild) {
            this._textGuildName.node.color = (Colors.GUILD_WAR_SAME_GUILD_COLOR);
            this._textName.node.color = (Colors.GUILD_WAR_SAME_GUILD_COLOR);
            UIHelper.enableOutline(this._textGuildName, Colors.GUILD_WAR_SAME_GUILD_COLOR_OUTLINE, 2);
            UIHelper.enableOutline(this._textName, Colors.GUILD_WAR_SAME_GUILD_COLOR_OUTLINE, 2);
        } else {
            this._textGuildName.node.color = (Colors.GUILD_WAR_ENEMY_COLOR);
            this._textName.node.color = (Colors.GUILD_WAR_ENEMY_COLOR);
            UIHelper.enableOutline(this._textGuildName, Colors.GUILD_WAR_ENEMY_COLOR_OUTLINE, 2);
            UIHelper.enableOutline(this._textName, Colors.GUILD_WAR_ENEMY_COLOR_OUTLINE, 2);
        }
        if (this._commonHeroAvatar) {
            if (isSameGuild) {
            } else {
            }
        }
    }
    isShowAvatar() {
        if (this._commonHeroAvatar && this._commonHeroAvatar.node.active) {
            return true;
        }
        return false;
    }
    syn(nowUserData) {
        var curstate = this._stateMachine.getCurState();
        if (curstate == GuildWarRunAvatorNode.RELEASE_STATE) {
            return;
        }
        if (curstate == GuildWarRunAvatorNode.STAND_STATE || curstate == GuildWarRunAvatorNode.ATTACK_STATE) {
            var isChangeCity = !nowUserData || this._userData.getCity_id() != nowUserData.city_id_;
            if (isChangeCity) {
                this._saveSwitchState(nowUserData, GuildWarRunAvatorNode.RELEASE_STATE);
            } else if (nowUserData.isInBorn() && nowUserData.isSelf()) {
                //logWarn('GuildWarRunAvatorNode REBORN_STATE');
                this._saveSwitchState(nowUserData, GuildWarRunAvatorNode.REBORN_STATE);
            } else {
                var a = this._userData.getCurrPoint();
                var aStartPoint = this._userData.getOld_point();
                var aEndPoint = this._userData.getNow_point();
                var b = nowUserData.getCurrPoint();
                var bStartPoint = nowUserData.old_point_;
                var bEndPoint = nowUserData.now_point_;
                var bornPointId = nowUserData.born_point_id_;
                if (b != 0) {
                    if (bEndPoint != aEndPoint) {
                        this._changePoint(nowUserData);
                    }
                } else {
                    this._saveSwitchState(nowUserData, GuildWarRunAvatorNode.RUN_STATE);
                }
            }
        } else if (curstate == GuildWarRunAvatorNode.RUN_STATE) {
            var isChangeCity = !nowUserData || this._userData.getCity_id() != nowUserData.city_id_;
            if (isChangeCity) {
                this._saveSwitchState(nowUserData, GuildWarRunAvatorNode.RELEASE_STATE);
            } else if (nowUserData.isInBorn() && nowUserData.isSelf()) {
                this._saveSwitchState(nowUserData, GuildWarRunAvatorNode.REBORN_STATE);
            } else {
                var a = this._userData.getCurrPoint();
                var aStartPoint = this._userData.getOld_point();
                var aEndPoint = this._userData.getNow_point();
                var b = nowUserData.getCurrPoint();
                var bStartPoint = nowUserData.old_point_;
                var bEndPoint = nowUserData.now_point_;
                var bornPointId = nowUserData.born_point_id_;
                if (b == 0) {
                    if (bStartPoint != aStartPoint || bEndPoint != aEndPoint) {
                        this._changeRunPath(nowUserData);
                    } else {
                    }
                } else {
                    if (bEndPoint != aEndPoint) {
                        this._saveSwitchState(nowUserData, GuildWarRunAvatorNode.STAND_STATE);
                    } else {
                    }
                }
            }
        }
        var newstate = this._stateMachine.getCurState();
        if (newstate == GuildWarRunAvatorNode.STAND_STATE || newstate == GuildWarRunAvatorNode.ATTACK_STATE) {
            if (nowUserData) {
                var hp = this._userData.getWar_value();
                var newHp = nowUserData.war_value_;
                if (hp != newHp) {
                    this._userData.setWar_value(newHp);
                    this._refreshUserHp();
                }
            }
        }
    }

}