const { ccclass, property } = cc._decorator;
import { AudioConst } from '../../../const/AudioConst';
import { CampRaceConst } from '../../../const/CampRaceConst';
import { SignalConst } from '../../../const/SignalConst';
import { Colors, G_AudioManager, G_EffectGfxMgr, G_ServerTime, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonMiniChat from '../../../ui/component/CommonMiniChat';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import UIHelper from '../../../utils/UIHelper';
import ViewBase from '../../ViewBase';
import { CampRaceHelper } from './CampRaceHelper';
import CampRacePreDetailNode from './CampRacePreDetailNode';
import CampRaceRankNode from './CampRaceRankNode';
import CampSummaryNode from './CampSummaryNode';



@ccclass
export default class CampRacePreMatch extends ViewBase {
    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;
    @property({
        type: CampRaceRankNode,
        visible: true
    })
    _rankNode: CampRaceRankNode = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _player1: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _player2: cc.Node = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textRound: cc.Label = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeCountTitle: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeNoEnemyTitle: cc.Node = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textPreMatchFinish: cc.Label = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeFight: cc.Node = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageCountBG: cc.Sprite = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textCount: cc.Label = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBlackBg: cc.Sprite = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeNoEnemy: cc.Node = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textCountNext: cc.Label = null;
    @property({
        type: CommonMiniChat,
        visible: true
    })
    _commonChat: CommonMiniChat = null;
    @property(cc.Prefab)
    campSummaryNode: cc.Prefab = null;
    @property(cc.Prefab)
    campRacePreDetailNode: cc.Prefab = null;

    _curCamp: number;
    _targetTime: number;
    _playerData1: any;
    _playerData2: any;
    _isBye: any;
    _isFinish: boolean;
    _timeOfPerRound: any;
    _nodeRank: any;
    _playerNode1: any;
    _playerNode2: any;
    _signalGetCampRaceFormation: any;
    _signalGetCampRaceRank: any;
    _signalUpdateCampRaceFormation: any;
    _signalCampBattleResult: any;
    _scheduleHandler: any;

    onCreate() {
        this.setSceneSize();
        this._initData();
        this._initView();
    }
    _initData() {
        this._curCamp = 0;
        this._targetTime = 0;
        this._playerData1 = null;
        this._playerData2 = null;
        this._isBye = null;
        this._isFinish = false;
        this._timeOfPerRound = CampRaceHelper.getGameTime(CampRaceConst.STATE_PRE_MATCH);
    }
    _initView() {
        this._commonChat.setDanmuVisible(false);
        this._rankNode.init();
        for (var i = 1; i <= 2; i++) {
            this['_playerNode' + i] = cc.instantiate(this.campRacePreDetailNode).getComponent(CampRacePreDetailNode);
            this['_playerNode' + i].ctor(i);
            this['_player' + i].addChild(this['_playerNode' + i].node);
        }
        this._playerNode1.setEmbattleEnable(true);
        this._playerNode2.setEmbattleEnable(false);
    }
    onEnter() {
        this._signalGetCampRaceFormation = G_SignalManager.add(SignalConst.EVENT_GET_CAMP_RACE_FORMATION, handler(this, this._onEventGetFormation));
        this._signalGetCampRaceRank = G_SignalManager.add(SignalConst.EVENT_GET_CAMP_RACE_RANK, handler(this, this._onEventGetRank));
        this._signalUpdateCampRaceFormation = G_SignalManager.add(SignalConst.EVENT_UPDATE_CAMP_RACE_FORMATION, handler(this, this._onEventUpdateFormation));
        this._signalCampBattleResult = G_SignalManager.add(SignalConst.EVENT_CAMP_BATTLE_RESULT, handler(this, this._onEventCampBattleResult));
    }
    onExit() {
        this._stopCountDown();
        this._signalGetCampRaceFormation.remove();
        this._signalGetCampRaceFormation = null;
        this._signalGetCampRaceRank.remove();
        this._signalGetCampRaceRank = null;
        this._signalUpdateCampRaceFormation.remove();
        this._signalUpdateCampRaceFormation = null;
        this._signalCampBattleResult.remove();
        this._signalCampBattleResult = null;
    }
    onShow() {
        this._playerNode1.setEmbattleEnable(true);
        this._startCountDown();
    }
    onHide() {
        this._stopCountDown();
    }
    updateInfo() {
        this._curCamp = G_UserData.getCampRaceData().getMyCamp();
        var campList = [this._curCamp];
        G_UserData.getCampRaceData().c2sGetCampRaceRank(campList);
        G_UserData.getCampRaceData().c2sGetCampRaceFormation(this._curCamp, G_UserData.getBase().getId());
    }
    _updateData() {
        this._isFinish = false;
        [this._playerData1, this._playerData2] = G_UserData.getCampRaceData().getCurMatchPlayersWithCamp(this._curCamp);
        if (G_UserData.getCampRaceData().getFinalStatusByCamp(this._curCamp) == CampRaceConst.PLAY_OFF_ROUND1) {
            this._isFinish = true;
        }
        if (this._isFinish) {
        } else {
            if (this._playerData1 && this._playerData2) {
                this._isBye = false;
            } else {
                this._isBye = true;
            }
            var startTime = G_UserData.getCampRaceData().getCurMatchStartTimeWithCamp(this._curCamp);
            this._targetTime = startTime + this._timeOfPerRound;
        }
    }
    _startCountDown() {
        this._stopCountDown();
        this._scheduleHandler = handler(this, this._updateCountDown);
        this.schedule(this._scheduleHandler, 1);
        this._updateCountDown();
    }
    _stopCountDown() {
        if (this._scheduleHandler != null) {
            this.unschedule(this._scheduleHandler);
            this._scheduleHandler = null;
        }
    }
    _updateRankList() {
        var preRankData = G_UserData.getCampRaceData().getPreRankWithCamp(this._curCamp);
        var playerList = preRankData.getRankDatas();
        this._rankNode.setRankData(playerList);
        this._rankNode.refreshMyRank();
    }
    _updatePlayers() {
        this._playerNode1.updatePlayer(this._playerData1);
        this._playerNode2.updatePlayer(this._playerData2);
    }
    _refreshUI() {
        if (this._isFinish) {
            this._textPreMatchFinish.node.active = (true);
            this._nodeCountTitle.active = (false);
            this._nodeNoEnemyTitle.active = (false);
            this._nodeFight.active = (false);
            this._nodeNoEnemy.active = (false);
            this._textCount.node.active = (false);
        } else {
            this._textPreMatchFinish.node.active = (false);
            this._nodeCountTitle.active = (!this._isBye);
            this._nodeNoEnemyTitle.active = (this._isBye);
            this._nodeFight.active = (!this._isBye);
            this._nodeNoEnemy.active = (this._isBye);
            this._textCount.node.active = (true);
        }
    }
    _updateRound() {
        var round = G_UserData.getCampRaceData().getCurMatchRoundWithCamp(this._curCamp);
        this._textRound.string = (Lang.get('camp_race_pre_round', { count: round }));
        this._textRound.node.active = (!this._isFinish);
    }
    _updateCountDown() {
        var countDownTime = this._targetTime - G_ServerTime.getTime() - 1;
        if (countDownTime >= 0) {
            var timeString = G_ServerTime.secToString(countDownTime);
            if (countDownTime == 0) {
                timeString = '';
            }
            this._textCount.string = (timeString);
            this._textCount.node.active = (true);
            if (this._isBye == false) {
                if (countDownTime <= 3) {
                    this._playCountDownAnim(countDownTime);
                    this._textCount.node.active = (false);
                }
            } else {
                this._textCountNext.string = (timeString);
            }
        }
    }
    _playCountDownAnim(countDownTime) {
        var index = countDownTime;
        if (index >= 1 && index <= 3) {
            G_EffectGfxMgr.createPlayGfx(this._nodeFight, 'effect_jingjijishi_' + index, null, true);
        } else if (index == 0) {
            this._playerNode1.setEmbattleEnable(false);
            G_EffectGfxMgr.createPlayGfx(this._nodeFight, 'effect_jingjijishi_suoding', null, true);
        }
    }
    _playBattleAnim(isWin) {
        let eventFunc = function (event) {
            if (event == 'shengli') {
                this._playWinAnim(isWin);
            } else if (event == 'jiesuan') {
                this._playSummary();
            } else if (event == 'finish') {
                if (G_UserData.getCampRaceData().getStatus() == CampRaceConst.STATE_PRE_MATCH) {
                    G_UserData.getCampRaceData().c2sGetCampRaceFormation(this._curCamp, G_UserData.getBase().getId());
                }
            }
        }.bind(this);
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeFight, 'moving_zhenyingjingji_donghua', null, eventFunc);
    }
    _playWinAnim(isWin) {
        if (isWin) {
            G_EffectGfxMgr.createPlayGfx(this._nodeFight, 'effect_jingji_shengli');
            G_AudioManager.playSoundWithId(AudioConst.SOUND_CAMP_RACE_PRE_WIN);
        } else {
            G_EffectGfxMgr.createPlayGfx(this._nodeFight, 'effect_jingji_shibai');
            G_AudioManager.playSoundWithId(AudioConst.SOUND_CAMP_RACE_PRE_LOSE);
        }
    }
    _playSummary() {
        let effectFunc = function (effect) {
            if (effect == 'jifen_zi') {
                var text = Lang.get('camp_point_change');
                var fontColor = Colors.getSummaryLineColor();
                var label = UIHelper.createWithTTF(text, Path.getFontW8(), 24);
                label.node.color = (fontColor);
                return label.node;
            } else if (effect == 'paiming_zi') {
                var text = Lang.get('camp_rank_change');
                var fontColor = Colors.getSummaryLineColor();
                var label = UIHelper.createWithTTF(text, Path.getFontW8(), 24);
                label.node.color = (fontColor);
                return label.node;
            } else if (effect == 'paiming') {
                var node = cc.instantiate(this.campSummaryNode).getComponent(CampSummaryNode);
                var preRankData = G_UserData.getCampRaceData().getPreRankWithCamp(this._curCamp);
                var nowRank = preRankData.getSelf_rank();
                var rankChange = preRankData.getRankChange();
                node.showRank(nowRank - rankChange, nowRank);
                return node.node;
            } else if (effect == 'jifen') {
                var node = cc.instantiate(this.campSummaryNode).getComponent(CampSummaryNode);
                var preRankData = G_UserData.getCampRaceData().getPreRankWithCamp(this._curCamp);
                var nowScore = preRankData.getSelf_score();
                var scoreChange = preRankData.getScoreChange();
                node.showPoint(nowScore, scoreChange);
                return node.node;
            }
        }.bind(this);
        let eventFunc = function (event) {
            if (event == 'finish') {
                this._imageBlackBg.node.active = (false);
            }
        }.bind(this);
        this._imageBlackBg.node.active = (true);
        var effect = G_EffectGfxMgr.createPlayMovingGfx(this._nodeFight, 'moving_zhenyingjingji_jiesuan', effectFunc, eventFunc, true);
        effect.node.y = (-135);
    }
    _onEventGetFormation(eventName, camp) {
        this._curCamp = camp;
        this._updateData();
        this._updateRound();
        this._updatePlayers();
        this._refreshUI();
    }
    _onEventUpdateFormation(eventName, camp, index) {
        if (this._curCamp != camp) {
            return;
        }
        [this._playerData1, this._playerData2] = G_UserData.getCampRaceData().getCurMatchPlayersWithCamp(this._curCamp);
        this['_playerNode' + index].updatePlayer(this['_playerData' + index]);
    }
    _onEventCampBattleResult(eventName, camp, win) {
        if (this._curCamp != camp) {
            return;
        }
        this._playBattleAnim(win);
    }
    _onEventGetRank(eventName) {
        if (G_UserData.getCampRaceData().getStatus() != CampRaceConst.STATE_PRE_MATCH) {
            return;
        }
        this._updateRankList();
        this._playerNode1.setEmbattleEnable(true);
        if (this._isBye) {
            G_UserData.getCampRaceData().c2sGetCampRaceFormation(this._curCamp, G_UserData.getBase().getId());
            return;
        }
    }

}