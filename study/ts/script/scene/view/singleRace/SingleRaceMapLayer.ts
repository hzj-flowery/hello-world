import UIHelper from "../../../utils/UIHelper";
import { SingleRaceConst } from "../../../const/SingleRaceConst";
import SingleRaceMapNode from "./SingleRaceMapNode";
import { G_EffectGfxMgr, G_SignalManager, G_UserData, G_ServerTime } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import { handler } from "../../../utils/handler";
import { SingleRaceDataHelper } from "../../../utils/data/SingleRaceDataHelper";
import EffectGfxNode from "../../../effect/EffectGfxNode";
import { Lang } from "../../../lang/Lang";
import { Path } from "../../../utils/Path";
import PopupSingleRaceGuess from "./PopupSingleRaceGuess";
import ViewBase from "../../ViewBase";

const { ccclass, property } = cc._decorator;
var LIGHT_COLOR = cc.color(255, 227, 203);
var LIGHT_COLOR_OUTLINE = cc.color(200, 130, 25, 255);
var DARK_COLOR = cc.color(165, 113, 86);
@ccclass
export default class SingleRaceMapLayer extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeBg: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeFire: cc.Node = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _scrollView: cc.ScrollView = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCountDownTitle: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCountDown: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textProcess: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageCountDownMatchTitle: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCountDownMatchTitle: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCountDownMatch: cc.Label = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonBig: cc.Button = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonSmall: cc.Button = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCount: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeCount: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageCountBG: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCount1: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeRoundEffect: cc.Node = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonGuess: cc.Button = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRP: cc.Sprite = null;
    @property(cc.Prefab)
    singleRaceMapNode: cc.Prefab = null;

    _curState: any;
    _mapNode: any;
    _signalSingleRaceGuessSuccess: any;
    _targetTime: any;
    _scheduleHandler: any;
    _scheduleHandlerMatch: any;

    ctor() {
        UIHelper.addEventListener(this.node, this._buttonBig, 'SingleRaceMapLayer', '_onClickBig');
        UIHelper.addEventListener(this.node, this._buttonSmall, 'SingleRaceMapLayer', '_onClickSmall');
        UIHelper.addEventListener(this.node, this._buttonGuess, 'SingleRaceMapLayer', '_onClickGuess');
    }
    onCreate() {
        this.ctor();
        this.setSceneSize();
        this._curState = SingleRaceConst.MAP_STATE_SMALL;
        this._mapNode = cc.instantiate(this.singleRaceMapNode).getComponent(SingleRaceMapNode);
        this._mapNode.ctor(this);
        this._scrollView.content.addChild(this._mapNode.node);
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeBg, 'moving_kuafujingji', null, null, false);
    }
    onEnter() {
        this._signalSingleRaceGuessSuccess = G_SignalManager.add(SignalConst.EVENT_SINGLE_RACE_GUESS_SUCCESS, handler(this, this._onEventGuessSuccess));
        this._targetTime = SingleRaceDataHelper.getStartTime();
        this._startCountDown();
        this._startMatchCountDown();
        this.updateProcessTitle();
    }
    onExit() {
        this._stopCountDown();
        this._stopMatchCountDown();
        this._signalSingleRaceGuessSuccess.remove();
        this._signalSingleRaceGuessSuccess = null;
    }
    onShow() {
        this._mapNode.onShow();
        this._nodeCount.active = (false);
        this.playFire();
        this.updateGuessRedPoint();
    }
    onHide() {
        this._mapNode.onHide();
    }
    updateInfo(state) {
        if (state) {
            this._curState = state;
        }
        this._updateChangeButton();
    }
    playFire() {
        this._nodeFire.removeAllChildren();
        if (G_UserData.getSingleRace().getStatus() == SingleRaceConst.RACE_STATE_ING) {
        //    G_EffectGfxMgr.createPlayGfx(this._nodeFire, 'effect_tujietiaozi_2');
        }
    }
    updateGuessRedPoint() {
        var has = G_UserData.getSingleRace().hasRedPoint();
        this._imageRP.node.active = (has);
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
    _updateCountDown() {
        var status = G_UserData.getSingleRace().getStatus();
        if (status != SingleRaceConst.RACE_STATE_PRE) {
            this._textCountDown.node.active = (false);
            this._textCountDownTitle.node.active = (false);
            this._nodeCount.active = (false);
            this._stopCountDown();
            return;
        }
        var countDown = this._targetTime - G_ServerTime.getTime();
        this._playCountDownEffect(countDown);
        if (countDown > 0) {
            this._textCountDown.node.active = (true);
            this._textCountDownTitle.node.active = (true);
            var timeString = G_ServerTime.getLeftDHMSFormatEx(this._targetTime);
            this._textCountDown.string = (timeString);
        } else {
            this._textCountDown.node.active = (false);
            this._textCountDownTitle.node.active = (false);
        }
    }
    _playCountDownEffect(countDown) {
        if (countDown < 1 || countDown > 10) {
            this._nodeCount.active = (false);
            return;
        }
        this._nodeCount.active = (true);
        if (countDown >= 1 && countDown <= 3) {
            this._textCount.string = ('');
            G_EffectGfxMgr.createPlayGfx(this._nodeCount, 'effect_jingjijishi_' + countDown, null, true);
        } else {
            this._textCount.string = (countDown);
        }
    }
    _startMatchCountDown() {
        this._stopMatchCountDown();
        this._scheduleHandlerMatch = handler(this, this._updateMatchCountDown);
        this.schedule(this._scheduleHandlerMatch, 1);
        this._updateMatchCountDown();
    }
    _stopMatchCountDown() {
        if (this._scheduleHandlerMatch != null) {
            this.unschedule(this._scheduleHandlerMatch);
            this._scheduleHandlerMatch = null;
        }
    }
    _updateMatchCountDown() {
        var status = G_UserData.getSingleRace().getStatus();
        if (status != SingleRaceConst.RACE_STATE_ING) {
            this._textCountDownMatchTitle.node.active = (false);
            this._textCountDownMatch.node.active = (false);
            this._imageCountDownMatchTitle.node.active = (false);
            return;
        }
        var beginTime = G_UserData.getSingleRace().getRound_begin_time();
        var intervalPerRound = SingleRaceConst.getIntervalPerRound();
        var nowTime = G_ServerTime.getTime();
        var matchCount = 0;
        while (beginTime <= nowTime) {
            matchCount = matchCount + 1;
            beginTime = beginTime + intervalPerRound;
        }
        var countDown = beginTime - nowTime - 1;
        if (matchCount >= 1 && matchCount <= 5 && countDown > 0) {
            this._textCountDownMatchTitle.node.active = (true);
            this._textCountDownMatch.node.active = (true);
            this._imageCountDownMatchTitle.node.active = (true);
            this._textCountDownMatchTitle.string = (Lang.get('single_race_countdown_match_title', { num: matchCount }));
            var timeString = G_ServerTime._secondToString(countDown);
            this._textCountDownMatch.string = (timeString);
        } else {
            this._textCountDownMatchTitle.node.active = (false);
            this._textCountDownMatch.node.active = (false);
            this._imageCountDownMatchTitle.node.active = (false);
        }
    }
    updateProcessTitle() {
        var nowRound = G_UserData.getSingleRace().getNow_round();
        this._textProcess.string = (Lang.get('single_race_round_title')[nowRound -1] || '');
    }
    playRoundEffect() {
        var textNames = [
            'txt_camp_01_shiliuqiang',
            'txt_camp_02_baqiang',
            'txt_camp_03_siqiang',
            'txt_camp_04_banjuesai',
            'txt_camp_05_juesai'
        ];
        var nowRound = G_UserData.getSingleRace().getNow_round();
        var textName = textNames[nowRound -1];
        if (textName) {
            let effectFunction = function (effect) {
                if (effect == 'gongke_txt') {
                    var node = UIHelper.newSprite(Path.getTextCampRace(textName));
                    return node.node;
                }
            }
            let eventFunction = function (event) {
                if (event == 'finish') {
                }
            }
            G_EffectGfxMgr.createPlayMovingGfx(this._nodeRoundEffect, 'moving_gongkexiaocheng', effectFunction, eventFunction, true);
        }
    }
    _onClickBig() {
        this._curState = SingleRaceConst.MAP_STATE_LARGE;
        this._updateChangeButton();
        this._mapNode.changeScale(this._curState);
    }
    _onClickSmall() {
        this._curState = SingleRaceConst.MAP_STATE_SMALL;
        this._updateChangeButton();
        this._mapNode.changeScale(this._curState);
    }
    _updateChangeButton() {
        if (this._curState == SingleRaceConst.MAP_STATE_LARGE) {
            this._buttonBig.interactable = (false);
            this._buttonSmall.interactable = (true);
        } else if (this._curState == SingleRaceConst.MAP_STATE_SMALL) {
            this._buttonBig.interactable = (true);
            this._buttonSmall.interactable = (false);
        }
    }
    _onClickGuess() {
        PopupSingleRaceGuess.getIns(PopupSingleRaceGuess, (p) => {
            p.open();
        })
    }
    _onEventGuessSuccess(eventName) {
        this.updateGuessRedPoint();
    }

}