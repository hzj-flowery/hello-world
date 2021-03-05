const { ccclass, property } = cc._decorator;

import { ArenaConst } from '../../../const/ArenaConst';
import { AudioConst } from '../../../const/AudioConst';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { DataConst } from '../../../const/DataConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { SignalConst } from '../../../const/SignalConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import VipFunctionIDConst from '../../../const/VipFunctionIDConst';
import { RedPointHelper } from '../../../data/RedPointHelper';
import { ReportParser } from '../../../fight/report/ReportParser';
import { G_AudioManager, G_ConfigLoader, G_Prompt, G_SceneManager, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonMainMenu from '../../../ui/component/CommonMainMenu';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import PopupSystemAlert from '../../../ui/PopupSystemAlert';
import { BattleDataHelper } from '../../../utils/data/BattleDataHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { WayFuncDataHelper } from '../../../utils/data/WayFuncDataHelper';
import { clone2 } from '../../../utils/GlobleFunc';
import { handler } from '../../../utils/handler';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { Path } from '../../../utils/Path';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import ViewBase from '../../ViewBase';
import ArenaHeroAvatar from './ArenaHeroAvatar';
import ArenaScrollNode from './ArenaScrollNode';


@ccclass
export default class ArenaView extends ViewBase {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBG: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _myHeroAvatarNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeScrollView: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _btnTeam: CommonMainMenu = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _btnShop: CommonMainMenu = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _btnPeek: CommonMainMenu = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _btnReport: CommonMainMenu = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _btnRank: CommonMainMenu = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelRtMid: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textMyTopRank: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTimes: cc.Label = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _btnAddTimes: cc.Button = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;

    preloadResList = [
        { path: Path.getPrefab("ArenaHeroAvatar", "arena"), type: cc.Prefab },
        { path: Path.getPrefab("ArenaScrollNode", "arena"), type: cc.Prefab },
        { path: Path.getPrefab("ArenaFightStartName", "arena"), type: cc.Prefab }
    ];

    public static waitEnterMsg(callBack) {
        G_UserData.getArenaData().c2sGetArenaInfo();
        var signal = G_SignalManager.addOnce(SignalConst.EVENT_ARENA_GET_ARENA_INFO, callBack);
        return signal;
    }

    private _needRequest: boolean;
    private _battleData: any;
    private _targetUserId: number;
    private _popRankUpInfo: any;
    private _arenaFuncConst: any;
    private _signalChallengeArena: any;
    private _signalBuyArenaCount: any;
    private _signalGetArenaInfo: any;
    private _signalRedPointUpdate: any;
    private _signalPopupWinAward: any;
    private _arenaHeroAvatar: any;
    private _arenaScrollNode: any;
    private _areaScrollNode: ArenaScrollNode;
    private _myHeroAvatar: ArenaHeroAvatar;

    ctor() {

    }
    onCreate() {
        this.setSceneSize();
        this._arenaHeroAvatar = cc.resources.get(Path.getPrefab("ArenaHeroAvatar", "arena"));
        this._arenaScrollNode = cc.resources.get(Path.getPrefab("ArenaScrollNode", "arena"));
        this._needRequest = false;
        this._popRankUpInfo = null;

        this._topbarBase.setImageTitle('txt_sys_com_jingjichang');
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_ARENA);
        this._panelRtMid.on(cc.Node.EventType.TOUCH_END, handler(this, this.onAddTimes));
        this._btnPeek.updateUI(FunctionConst.FUNC_ARENA_PEEK);
        this._btnShop.updateUI(FunctionConst.FUNC_ARENA_SHOP);
        this._btnReport.updateUI(FunctionConst.FUNC_ARENA_REPORT);
        this._btnRank.updateUI(FunctionConst.FUNC_ARENA_RANK);
        this._btnTeam.updateUI(FunctionConst.FUNC_TEAM);
        this._areaScrollNode = (cc.instantiate(this._arenaScrollNode) as cc.Node).getComponent(ArenaScrollNode);
        var posX = this._nodeScrollView.x;
        this._nodeScrollView.addChild(this._areaScrollNode.node);

        this._arenaFuncConst = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_COST).get(DataConst.VIP_FUNC_TYPE_ARENA_TIMES);
        //assert((this._arenaFuncConst, 'can not find funcion_cost cfg by id ' + DataConst.VIP_FUNC_TYPE_ARENA_TIMES);
        this._panelTouch.active = (false);
        this._imageBG.node.active = (false);
        this.updateSceneId(120);
    }
    _updateTopPanel() {
        var myArenaData: any = G_UserData.getArenaData().getMyArenaData();
        var rank = myArenaData.rank;
        var rankDesc = (myArenaData.rank);
        var isFirst = G_UserData.getArenaData().getArenaFirstBattle();
        if (isFirst == 1) {
            rank = 0;
        }
        if (rank == 0) {
            rankDesc = Lang.get('arena_rank_zero');
        }
        this._textMyTopRank.string = (rankDesc);
        this._textTimes.string = (myArenaData.arenaCount + ('/' + this._arenaFuncConst.free_count));
    }
    onEnter() {

        this._updateAreaUI(true, false, true);
        var runningScene = G_SceneManager.getRunningScene();
        runningScene.addGetUserBaseInfoEvent();
        G_AudioManager.playMusicWithId(AudioConst.MUSIC_PVP);
        this._signalChallengeArena = G_SignalManager.add(SignalConst.EVENT_ARENA_FIGHT_COUNT, handler(this, this._onEventGetChallengeArena));
        this._signalBuyArenaCount = G_SignalManager.add(SignalConst.EVENT_ARENA_BUY_COUNT, handler(this, this._onEventGetBuyArenaCount));
        this._signalGetArenaInfo = G_SignalManager.add(SignalConst.EVENT_ARENA_GET_ARENA_INFO, handler(this, this._onGetArenaInfo));
        this._signalRedPointUpdate = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
        this._signalPopupWinAward = G_SignalManager.add(SignalConst.EVENT_ARENA_WIN_POPUP_AWARD, handler(this, this._onEventPopupWinAward));
        if (this._needRequest) {
            G_UserData.getArenaData().c2sGetArenaInfo();
            this._needRequest = false;
        } else {
            // this.scheduleOnce(() => {
            //     G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, 'ArenaView player enter');
            // });
        }
        this._onEventRedPointUpdate();

        this._btnPeek.addClickEventListenerEx(handler(this, this.onBtnPeek));
        this._btnRank.addClickEventListenerEx(handler(this, this.onBtnRank));
        this._btnReport.addClickEventListenerEx(handler(this, this.onBtnReport));
        this._btnShop.addClickEventListenerEx(handler(this, this.onBtnShop));
        this._btnTeam.addClickEventListenerEx(handler(this, this.onBtnEmbattle));
    }
    onExit() {
        this._signalChallengeArena.remove();
        this._signalChallengeArena = null;
        this._signalBuyArenaCount.remove();
        this._signalBuyArenaCount = null;
        this._signalGetArenaInfo.remove();
        this._signalGetArenaInfo = null;
        this._signalRedPointUpdate.remove();
        this._signalRedPointUpdate = null;
        this._signalPopupWinAward.remove();
        this._signalPopupWinAward = null;
        this._battleData = null;
    }
    private onBtnShop() {
        WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_ARENA_SHOP);
    }
    private onBtnEmbattle() {
        WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_TEAM_SLOT1);
    }
    private onBtnRank() {
        G_SceneManager.showDialog('prefab/arena/PopupArenaRank');
    }
    private onBtnReport() {
        // UIPopupHelper.popupArenaReport()
        G_SceneManager.showDialog('prefab/arena/PopupArenaReport');
    }
    private onBtnPeek() {
        G_SceneManager.showDialog('prefab/arena/PopupArenaPeek');
    }
    _onClickHeroAvatar(playerInfo, isClickBtn) {
        if (this._panelTouch.active == true) {
            return;
        }
        isClickBtn = isClickBtn || false;
        cc.warn('ArenaView:_onClickHeroAvatar(playerInfo)');
        //assert((playerInfo, 'playerInfo is null');
        var myArenaData: any = G_UserData.getArenaData().getMyArenaData();
        var myRank = myArenaData.rank;
        if (myRank == playerInfo.rank) {
            G_Prompt.showTip(Lang.get('arena_challeng_rank_no_self'));
            return;
        }
        if (playerInfo.rank <= 3) {
            if (myRank > 20) {
                G_Prompt.showTip(Lang.get('arena_challeng_rank_no_enough', { rank: 20 }));
                return;
            }
        }
        var message = {
            rank: playerInfo.rank,
            num: 1
        };
        if (isClickBtn) {
            message = {
                rank: playerInfo.rank,
                num: 5
            };
        }
        if (myArenaData.arenaCount == 0) {
            this.onAddTimes();
            return;
        }
        this._targetUserId = playerInfo.uid;
        G_UserData.getArenaData().c2sChallengeArena(message);
    }
    _updateAreaUI(needJump, needAnimation, isEnterUpdate) {
        var playerList = G_UserData.getArenaData().getArenaChallengeList();
        cc.log(playerList);
        var myArenaData = G_UserData.getArenaData().getMyArenaData();
        if (this._myHeroAvatar) {
            this._myHeroAvatar.updateAvatar(myArenaData, handler(this, this._onClickMyAvatar));
            this._myHeroAvatar.checkFristBattle();
        } else {

            this._myHeroAvatarNode.removeAllChildren();
            var myHeroAvatar = (cc.instantiate(this._arenaHeroAvatar) as cc.Node).getComponent(ArenaHeroAvatar);
            this._myHeroAvatarNode.addChild(myHeroAvatar.node);
            myHeroAvatar.updateAvatar(myArenaData, handler(this, this._onClickMyAvatar));
            myHeroAvatar.checkFristBattle();
            this._myHeroAvatar = myHeroAvatar;
        }

        let endCallback: Function = null;
        if (isEnterUpdate && !this._needRequest) {
            endCallback = function () {
                G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, 'ArenaView player enter');
            }.bind(this);
        }
        this._areaScrollNode.updateHeroList(playerList, handler(this, this._onClickHeroAvatar), needJump, needAnimation, endCallback);
        this._updateTopPanel();
    }
    _onClickMyAvatar() {
    }
    private onAddTimes(sender?) {
        var vipInfo = G_UserData.getVip().getVipFunctionDataByType(this._arenaFuncConst.vip_function_id);
        var buyLimit = vipInfo.value;
        var myArenaData: any = G_UserData.getArenaData().getMyArenaData();
        var buyCount = myArenaData.buyCount;
        var needGold = UserDataHelper.getPriceAdd(this._arenaFuncConst.price_id, buyCount + 1);
        var callBackFunction = function () {
            var [success, popFunc] = LogicCheckHelper.enoughCash(needGold);
            if (success) {
                var message = { id: this._arenaFuncConst.id };
                G_UserData.getArenaData().c2sBuyCommonCount(this._arenaFuncConst.id);
            } else {
                popFunc();
            }
        }.bind(this)
        var isModuleShow = G_UserData.getPopModuleShow('arenaBuyBattleTimes');
        if (isModuleShow && isModuleShow == true) {
            return;
        }
        var timesOut = LogicCheckHelper.vipTimesOutCheck(VipFunctionIDConst.VIP_FUNC_ID_ARENA, buyCount, Lang.get('arena_no_reset_count'));
        if (!timesOut) {
            var resultTimes = buyLimit - buyCount;
            var buyTimesAlert = Lang.get('arena_buytimes_alert', {
                count: needGold,
                leftcount: resultTimes
            });
            UIPopupHelper.popupSystemAlert(Lang.get('arena_buytimes_notice'), buyTimesAlert, callBackFunction, null, function (pop: PopupSystemAlert) {
                pop.setCheckBoxVisible(false);
                pop.setModuleName('arenaBuyBattleTimes');
            })
        }
    }
    _onEventGetBuyArenaCount(id, message) {
        if (message.ret != 1) {
            return;
        }
        G_Prompt.showTip(Lang.get('arena_buy_times_succ'));
        var funcId = message.id;
        if (funcId == DataConst.VIP_FUNC_TYPE_ARENA_TIMES) {
            this._updateTopPanel();
        }
    }
    _onEventRedPointUpdate(id?, message?) {
        var redValue2 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARENA, 'defRP');
        var redValue3 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARENA, 'peekRP');
        var redValue4 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, 'arenaShop');
        var updateRedPoint = function (node, value) {
            var redPoint = node.getChildByName("Node_root").getChildByName('RedPoint');
            redPoint.active = (value);
        }.bind(this)
        updateRedPoint(this._btnReport.node, redValue2);
        updateRedPoint(this._btnPeek.node, redValue3);
        updateRedPoint(this._btnShop.node, redValue4);
    }
    _onEventPopupWinAward(...vars) {
        if (this._popRankUpInfo && this._popRankUpInfo.oldData) {
            cc.warn('show win PopupRankUpReward');
            var onCloseCall = function (...vars) {
                cc.warn(' self._panelTouch:node.active = (false) ');
                this._panelTouch.active = (false);
                this._popRankUpInfo = null;
                this._targetUserId = null;
            }.bind(this);
            UIPopupHelper.popupRankUpReward(this._popRankUpInfo, onCloseCall)
            this._updateAreaUI(true, true, false);
            // G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, 'ArenaView PopupRankUpReward');
        }
    }
    _onGetArenaInfo(id, message) {
        if (this._popRankUpInfo && this._popRankUpInfo.oldData) {
            this._myHeroAvatar.playWinEffect();
        } else {
            this._updateAreaUI(false, false, false);
        }
    }
    _enterFightView(message) {
        var arenaFight = clone2(message.arena_fight[0]);
        arenaFight.battle_report = G_UserData.getFightReport().getReport();
        var reportData = ReportParser.parse(arenaFight.battle_report);
        var battleData = BattleDataHelper.parseArenaData(arenaFight, 'img_mline_map01');
        G_SceneManager.showScene('fight', reportData, battleData);
        this._needRequest = true;
        var firstBattle = message['first_battle'];
        if (firstBattle == 1) {
            battleData.oldRank = 0;
        }
        var oldAvatar = this._areaScrollNode.getAvatarNodeById(this._targetUserId)[0];
        var maxRankReward = message['max_rank_reward'] || {};
        if (battleData.newRank > 0 && maxRankReward.length > 0) {
            this._popRankUpInfo = {
                award: maxRankReward[0],
                oldRank: battleData.oldRank,
                newRank: battleData.newRank,
                oldData: oldAvatar.getArenaPlayer()
            };
            this._panelTouch.active = (true);
        }
    }
    _onEventGetChallengeArena(id, message) {
        if (message.ret != 1) {
            return;
        }
        var fightNum = message.num;
        if (fightNum == 1) {
            var reportId = message.arena_fight[0].battle_report;
            G_SceneManager.registerGetReport(reportId, function () {
                this._enterFightView(message);
            }.bind(this));
        } else {
            var getBattleAwardList = function (arenaFight) {
                var fightResult = true;
                var retList = [];
                for (var i in arenaFight) {
                    var fightData = arenaFight[i];
                    var rewardsItem: any = {};
                    rewardsItem.rewards = fightData['rewards'] || {};
                    rewardsItem.addRewards = fightData['add_rewards'] || null;
                    fightResult = fightData['result'];
                    rewardsItem.result = fightResult;
                    retList.push(rewardsItem);
                }
                return [
                    retList,
                    fightResult
                ];
            }.bind(this)
            var [rewardList, fightResult] = getBattleAwardList(message.arena_fight);
            UIPopupHelper.popupArenaSweep(rewardList, fightResult)
        }
        this._updateTopPanel();
    }
    _convertToWorldSpace(node, pos) {
        var pos = pos || new cc.Vec2(0, 0);
        var worldPos = node.convertToWorldSpaceAR(pos);
        return this.node.getChildByName('Panel_root').convertToNodeSpace(worldPos);
    }
    onPlayerAttack(targetId, callback) {
        var aniAvatar = (cc.instantiate(this._arenaHeroAvatar) as cc.Node).getComponent(ArenaHeroAvatar);
        aniAvatar.updateAnimation(this._myHeroAvatar.getBaseId());
        aniAvatar.node.name = ('attackAvatar');
        var bezierBeginAction = function () {
            var onFinish = function () {
                this._myHeroAvatarNode.node.active = (false);
                aniAvatar.playAnimation('moveahead');
            }.bind(this);
            var action = cc.callFunc(onFinish);
            return action;
        }.bind(this);
        var makeBezierAction = function () {
            var avatar = this._areaScrollNode.getAvatarNodeById(targetId);
            var endPos = this._convertToWorldSpace(avatar);
            var startPos = this._convertToWorldSpace(this._myHeroAvatarNode);
            if (startPos) {
                aniAvatar.node.setPosition(startPos);
            }
            var midPos = new cc.Vec2(endPos.x + (startPos.x - endPos.x) * 0.5, Math.abs(startPos.y - endPos.y) * 0.5 + ArenaConst.BezierYOffset);
            var bezier = [
                startPos,
                midPos,
                endPos
            ];
            var action1 = cc.bezierTo(ArenaConst.BezierTime, bezier);
            return action1;
        }.bind(this);
        var bezierFinishAction = function () {
            var onFinish = function () {
                var avatar = this.getChildByName('Panel_root').getChildByName('attackAvatar');
                avatar.playJumpEffect();
                avatar.playAnimation('attack');
                this._playDropAction(targetId, callback);
            }.bind(this);
            var action = cc.callFunc(onFinish);
            return action;
        }.bind(this)
        var dealyFunctionAction = function () {
            var delayFunc = function () {
                var avatar = this.getChildByName('Panel_root').getChildByName('attackAvatar');
                avatar.destroy();
            }.bind(this)
            var action = cc.callFunc(delayFunc);
            return action;
        }.bind(this)
        var seqAction = cc.sequence(bezierBeginAction(), makeBezierAction(), bezierFinishAction(), cc.delayTime(ArenaConst.AttackDelay), dealyFunctionAction());
        aniAvatar.node.runAction(seqAction);
        this.node.getChildByName('Panel_root').addChild(aniAvatar.node);
    }
    _playDropAction(targetId, callBack) {
        var [avatar, id] = this._areaScrollNode.getAvatarNodeById(targetId);
        var aniAvatar = (cc.instantiate(this._arenaHeroAvatar) as cc.Node).getComponent(ArenaHeroAvatar);
        aniAvatar.updateAnimation(avatar.getBaseId());
        aniAvatar.playAnimation('hitfall3');
        var makeBezierAction = function () {
            var startPos = this._convertToWorldSpace(avatar);
            aniAvatar.node.setPosition(startPos.x, startPos.y);
            var endPos = new cc.Vec2(startPos.x - 50, -100);
            var midPos = new cc.Vec2(startPos.x - 50, startPos.y - 200);
            var bezier = [
                startPos,
                midPos,
                endPos
            ];
            var action1 = cc.bezierTo(ArenaConst.BezierTime, bezier);
            return action1;
        }.bind(this);
        var bezierBeginAction = function () {
            var onFinish = function () {
                var targetAvatar = this._areaScrollNode.getAvatarNodeById(targetId);
                targetAvatar.updateAvatar(G_UserData.getArenaData().getMyArenaData());
                targetAvatar.node.active = (true);
            }.bind(this)
            var action = cc.callFunc(onFinish);
            return action;
        }.bind(this)
        function bezierFinishAction() {
            var onFinish = function () {
                cc.warn('bezierFinishAction');
                if (callBack && typeof (callBack) == 'function') {
                    callBack();
                }
            }
            var action = cc.callFunc(onFinish);
            return action;
        }
        var seqAction = cc.sequence(bezierBeginAction(), makeBezierAction(), bezierFinishAction());
        aniAvatar.node.runAction(seqAction);
        this.node.getChildByName('Panel_root').addChild(aniAvatar.node);
    }
    onPlayerEnter(callback) {
        var aniAvatar = (cc.instantiate(this._arenaHeroAvatar) as cc.Node).getComponent(ArenaHeroAvatar);
        aniAvatar.updateAnimation(this._myHeroAvatar.getBaseId());
        aniAvatar.node.name = ('enterAvatar');
        var bezierBeginAction = function () {
            var onFinish = function () {
                var avatar = this._areaScrollNode.getSelfNode();
                avatar.node.active = (false);
                aniAvatar.playJumpEffect();
                this._myHeroAvatarNode.node.active = (false);
            }.bind(this);
            var action = cc.callFunc(onFinish);
            return action;
        }.bind(this)
        var makeBezierAction = function () {
            var avatar = this._areaScrollNode.getSelfNode();
            var starPos = this._convertToWorldSpace(avatar);
            var endPos = this._convertToWorldSpace(this._myHeroAvatarNode);
            aniAvatar.node.setPosition(starPos);
            var midPos = new cc.Vec2(endPos.x + (starPos.x - endPos.x) * 0.5, Math.abs(starPos.y - endPos.y) * 0.5 + ArenaConst.BezierYOffset);
            var bezier = [
                starPos,
                midPos,
                endPos
            ];
            var action1 = cc.bezierTo(ArenaConst.BezierTime, bezier);
            return action1;
        }.bind(this)
        var bezierFinishAction = function () {
            var onFinish = function () {
                var avatar = this.getChildByName('Panel_root').getChildByName('enterAvatar');
                aniAvatar.playJumpEffect();
            }.bind(this)
            var action = cc.callFunc(onFinish);
            return action;
        }
        var dealyFunctionAction = function () {
            var delayFunc = function () {
                this._myHeroAvatarNode.node.active = (true);
                var avatar = this.getChildByName('Panel_root').getChildByName('enterAvatar');
                avatar.destroy();
                if (callback && typeof (callback) == 'function') {
                    callback();
                }
            }.bind(this);
            var action = cc.callFunc(delayFunc);
            return action;
        }.bind(this)
        var seqAction = cc.sequence(bezierBeginAction(), cc.delayTime(ArenaConst.BezierDelay), makeBezierAction(), bezierFinishAction(), cc.delayTime(ArenaConst.BezierDelay), dealyFunctionAction());
        aniAvatar.node.runAction(seqAction);
        this.node.getChildByName('Panel_root').addChild(aniAvatar.node);
        aniAvatar.playAnimation('moveahead');
        aniAvatar.turnBack();
    }

}