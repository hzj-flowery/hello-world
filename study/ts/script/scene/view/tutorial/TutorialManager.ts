import { config } from "../../../config";
import { MessageIDConst } from "../../../const/MessageIDConst";
import { MovieConst } from "../../../const/MovieConst";
import { SignalConst } from "../../../const/SignalConst";
import TutorialConst from "../../../const/TutorialConst";
import { G_NetworkManager, G_PreloadManager, G_ProgressBarManager, G_ResolutionManager, G_SceneManager, G_SignalManager, G_TopLevelNode, G_UserData } from "../../../init";
import PopupMovieText from "../../../ui/popup/PopupMovieText";
import PopupBase from "../../../ui/PopupBase";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import { TutorialHelper } from "./TutorialHelper";
import TutorialStageBase from "./TutorialStageBase";
import { TutorialStepHelper } from "./TutorialStepHelper";
import TutorialTipLayer from "./TutorialTipLayer";

export default class TutorialManager {

    private _tutorialEnabled;
    private _tutorialTipLayer: TutorialTipLayer;
    public _curStageId;
    private _stageMap: { [key: number]: TutorialStageBase };
    public _isPause;
    private _eventList: any[];
    private _notProcessStep;
    private _isPlayingOpening;
    private _stageCfgList: any[];
    private _openingSteps: { steps: Function[], nextStep: Function, index: number, onGuideCallback: Function };
    private _isGuideInvalid;
    private _curTutorials;
    private _nextTutorialStep;

    private static START_STAGE = 1;
    private static START_STEP = 100;

    constructor() {
        this._tutorialEnabled = true;
        if (config.CONFIG_TUTORIAL_ENABLE != null) {
            this._tutorialEnabled = config.CONFIG_TUTORIAL_ENABLE;
        }
        this._tutorialTipLayer = null;
        this._curStageId = null;
        this._stageMap = null;
        this._isPause = null;
        this._eventList = [];
        this._notProcessStep = false;
        this._isPlayingOpening = false;

        TutorialStepHelper.init();
    }

    public clear() {
        for (let i in this._eventList) {
            var value = this._eventList[i];
            value.remove();
        }
        this._eventList = [];
        this._curStageId = null;
        this._stageMap = null;
        this._isPause = null;
        this._isPlayingOpening = false;
        if (G_TopLevelNode.node.getChildByName('PopupStoryChat') != null) {
            var popupStoryChat = G_TopLevelNode.node.getChildByName('PopupStoryChat').getComponent(PopupBase);
            if (popupStoryChat) {
                popupStoryChat.close();
            }
        }

        this._resetTipLayer(true);
    }

    private _buildStageMap() {
        this._stageMap = {};
        var stageInfoList = TutorialHelper.getStageList();
        this._stageCfgList = stageInfoList;
        for (let i in stageInfoList) {
            var stagecfg = stageInfoList[i];
            var stage = new TutorialStageBase(stagecfg.stage);
            this._stageMap[stagecfg.stage] = stage;
        }
    }

    private _getCurrStageId() {
        var guideId = G_UserData.getBase().getGuide_id();
        var currStageId = 0;
        if (guideId == 0) {
            currStageId = TutorialManager.START_STAGE;
            return currStageId;
        }
        if (TutorialHelper.isEndStep(guideId) == true) {
            currStageId = TutorialHelper.STEP_PAUSE;
            return currStageId;
        }
        if (TutorialHelper.isStartStep(guideId) == false) {
            currStageId = TutorialHelper.STEP_PAUSE;
            return currStageId;
        }
        var stepInfo = TutorialHelper.getStageByStepId(guideId);
        currStageId = stepInfo.stage;
        if (!this._isTutorialReady(currStageId)) {
            var stageObj = this._stageMap[currStageId];
            if (stageObj.getNextStepId() && stageObj.getNextStepId() > 0) {
                this.sendUpdateGuideId(stageObj.getNextStepId());
            }
            currStageId = TutorialHelper.STEP_PAUSE;
        }
        return currStageId;
    }

    public reset() {
        this._curStageId = null;
        this._isPause = null;
        this._buildStageMap();
        if (this._tutorialEnabled) {
            var stageId = this._getCurrStageId();
            console.log("TutorialManager: stageId:", stageId);
            this._curStageId = stageId;
            this.preLoadStageRes([this._curStageId, this._curStageId + 1]);
            this._isPause = this._curStageId == TutorialHelper.STEP_PAUSE;
            this._resetTipLayer();
            this._eventList = [];
            this._eventList.push(G_SignalManager.add(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_BEGIN, handler(this, this._onAuthTouchBegin)));
            this._eventList.push(G_SignalManager.add(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_END, handler(this, this._onAuthTouchEnd)));
            this._eventList.push(G_SignalManager.add(SignalConst.EVENT_TUTORIAL_STEP, handler(this, this._onEventTutorialStep)));
            this._eventList.push(G_SignalManager.add(SignalConst.EVENT_TUTORIAL_START, handler(this, this._onEventTutorialStart)));
            this._eventList.push(G_SignalManager.add(SignalConst.EVENT_USER_LEVELUP, handler(this, this._onEventTutorialLevelUp)));
            this._eventList.push(G_SignalManager.add(SignalConst.EVENT_TUTORIAL_BATTLE_START, handler(this, this._onEventTutorialBattle)));
            this._eventList.push(G_SignalManager.add(SignalConst.EVENT_CHAPTER_STAGE_BOX, handler(this, this._onEventTutorialBoxReward)));
            this._eventList.push(G_SignalManager.add(SignalConst.EVENT_EXPLORE_GET_REWARD, handler(this, this._onEventTutorialExplore)));
            this._eventList.push(G_SignalManager.add(SignalConst.EVENT_TRIGGER_REBEL_ARMY, handler(this, this._onEventTutorialRebel)));
        }
    }

    private preLoadStageRes(stageIds) {
        if (typeof (stageIds) == 'number') {
            stageIds = [stageIds];
        }
        var stepIds = [];
        for (var i = 0; i < stageIds.length; i++) {
            var stage: TutorialStageBase = this._stageMap[stageIds[i]];
            if (!stage) continue;
            stepIds.push(stage.getStepId())
            var stepCfgList = stage.getStepCfgList();
            for (let j in stepCfgList) {
                stepIds.push(stepCfgList[j].id);
            }
        }
        G_PreloadManager.preLoadResById(stepIds);
    }

    public isTutorialEnabled() {
        return this._tutorialEnabled;
    }

    public setTutorialEnabled(enable) {
        this._tutorialEnabled = enable;
    }

    public isDoingStep(currStageId?) {
        if (!this._tutorialEnabled) {
            return false;
        }
        if (this._isPause) {
            return false;
        }
        if (this._notProcessStep) {
            return false;
        }
        if (this._stageMap == null || this._curStageId == null) {
            return false;
        }
        if (currStageId) {
            var curStage = this._stageMap[this._curStageId];
            if (currStageId == this._curStageId && curStage) {
                return true;
            }
        } else {
            var curStage = this._stageMap[this._curStageId];
            if (curStage) {
                return true;
            }
        }
        return false;
    }

    public hasTutorial(callback) {
        let onTutorialCallback = () => {
            if (!this._tutorialEnabled || this._isPause) {
                if (!this._isPause) {
                    this._finish();
                } else {
                    this._pause();
                }
                if (callback) {
                    callback();
                }
                return;
            }
            var info = TutorialHelper.getStageById(this._curStageId);
            if (!info) {
                this._finish();
                if (callback) {
                    callback();
                }
                return;
            }
            this._resetTipLayer();
            this._onEventTutorialStep();
        }
        if (this._isPlayingOpening) {
            this._resetTipLayer(true);
            this._openingSteps.nextStep.apply(this, [onTutorialCallback]);
        } else {
            onTutorialCallback();
        }
    }

    private _onAuthTouchBegin(_, param) {
        if (!this._tutorialEnabled) {
            return;
        }
        if (this._isPause) {
            return;
        }
        if (this._tutorialTipLayer == null) {
            return;
        }
        // console.log("TutorialManager:_onAuthTouchBegin");
        var rect = typeof (param) == 'object' && param || cc.rect(0, 0, G_ResolutionManager.getDesignWidth(), G_ResolutionManager.getDesignHeight());
        this._tutorialTipLayer.pushAuthTouchRect(rect);
        if (typeof (param) == 'boolean') {
            this._notProcessStep = param;
        }
    }

    private _onAuthTouchEnd() {
        console.log("TutorialManager:_onAuthTouchEnd");
        if (!this._tutorialEnabled) {
            return;
        }
        if (this._isPause) {
            return;
        }
        if (this._tutorialTipLayer == null) {
            return;
        }
        this._tutorialTipLayer.popAuthTouchRect();
        this._notProcessStep = false;
    }

    public clearTipLayer() {
        this._tutorialTipLayer.clearTip();
        this._tutorialTipLayer.setTouchRect(cc.rect(0, 0, 0, 0));
    }

    private _onEventTutorialStep(_?, params?) {
        console.log("TutorialManager:_onEventTutorialStep:", params, this._curStageId);
        if (!this._tutorialEnabled) {
            return;
        }
        if (this._isPause) {
            return;
        }
        if (this._notProcessStep) {
            return;
        }
        let doNextStep = () => {
            var curStage = this._stageMap[this._curStageId];
            if (params) {
                if (curStage && curStage.ignoreEvent(params) == false) {
                    return;
                }
            }
            if (this._tutorialTipLayer) {
                this._tutorialTipLayer.clearTip();
                this._tutorialTipLayer.setTouchRect(cc.rect(0, 0, 0, 0));
            }
            if (curStage) {
                if (curStage.doNextStep(this._tutorialTipLayer, params, doNextStep) == false) {
                    var nextStageId = curStage.getNextStageId();
                    var nextStepId = curStage.getNextStepId();
                    if (nextStepId > 0) {
                        this.sendUpdateGuideId(nextStepId);
                    }
                    this._curStageId = nextStageId;
                    if (this._curStageId == TutorialHelper.STEP_PAUSE) {
                        this._pause();
                    } else if (!TutorialHelper.getStageById(this._curStageId)) {
                        this._finish();
                    } else {
                        this._onEventTutorialStep();
                        this.preLoadStageRes(this._curStageId + 1);
                    }
                    curStage.destroy();
                }
            }
        }
        doNextStep();
    }

    private _procEventActiveStage(filterType, params) {
        if (!this._tutorialEnabled) {
            return;
        }
        if (!this._isPause) {
            return;
        }
        var curStage = this._findActiveStage(filterType, params);
        if (!curStage) {
            return;
        }
        if (curStage.getId() != this._curStageId) {
            this.sendUpdateGuideId(curStage.getStepId());
            this._curStageId = curStage.getId();
            this._isGuideInvalid = true;
        }
    }

    private _onEventTutorialBattle(id, params) {
        // console.log("TutorialManager:_onEventTutorialBattle");
        this._procEventActiveStage(TutorialConst.STAGE_ACTIVE_STORY, params);
    }

    private _onEventTutorialLevelUp(id, params) {
        // console.log("TutorialManager:_onEventTutorialLevelUp");
        this._procEventActiveStage(TutorialConst.STAGE_ACTIVE_LEVEL, params);
    }

    private _onEventTutorialBoxReward(id, params) {
        // console.log("TutorialManager:_onEventTutorialBoxReward");
        this._procEventActiveStage(TutorialConst.STAGE_ACTIVE_BOX_AWARD, params);
    }

    private _onEventTutorialExplore(id, params) {
        // console.log("TutorialManager:_onEventTutorialExplore");
        this._procEventActiveStage(TutorialConst.STAGE_EXPLORE_FINISH_AWARD, params);
    }

    private _onEventTutorialRebel(id, params) {
        // console.log("TutorialManager:_onEventTutorialRebel");
        this._procEventActiveStage(TutorialConst.STAGE_REBEL_EVENT, params);
    }

    private _findActiveStage(filterType, params) {
        for (let i in this._stageCfgList) {
            var stageCfg = this._stageCfgList[i];
            var stage = this._stageMap[stageCfg.stage];
            if (stage && stage.isFilterType(filterType, params) == false) {
                if (stage.isActivie()) {
                    return stage;
                }
            }
        }
        return null;
    }

    private _isTutorialStartEvent(stageId, eventName) {
        var stage = this._stageMap[stageId];
        if (stage) {
            return stage.isStartEvent(eventName);
        }
        return false;
    }

    private _isTutorialReady(stageId) {
        var stage = this._stageMap[stageId];
        if (stage) {
            return stage.isActivie();
        }
        return true;
    }

    private _onEventTutorialStart(id, param) {
        if (!this._tutorialEnabled) {
            return;
        }
        if (!this._isPause) {
            return;
        }
        if (!this._curStageId) {
            return;
        }
        if (!this._isTutorialStartEvent(this._curStageId, param)) {
            return;
        }
        if (!this._isTutorialReady(this._curStageId)) {
            var curStage = this._stageMap[this._curStageId];
            var nextStepId = curStage.getNextStepId();
            if (nextStepId && nextStepId > 0) {
                this.sendUpdateGuideId(nextStepId);
            }
            this._curStageId = null;
            return;
        }
        this._isPause = false;
        this._resetTipLayer();
        this._onEventTutorialStep(id, param);
    }

    private _finish() {
        this.clear();
    }

    private _pause() {
        this._resetTipLayer(true);
        this._isPause = true;
        this._curStageId = null;
        this._curTutorials = null;
        this._nextTutorialStep = null;
    }

    private _resetTipLayer(cleanup?) {
        if (!this._tutorialTipLayer) {
            this._tutorialTipLayer = new cc.Node("TutorialTipLayer").addComponent(TutorialTipLayer);
            this._tutorialTipLayer.init();
            // this._tutorialTipLayer.retain();
            G_TopLevelNode.addTutorialLayer(this._tutorialTipLayer.node);
        }
        if (!cleanup) {
        } else {
            this._tutorialTipLayer.setDestroy();
            this._tutorialTipLayer.node.destroy();
            // this._tutorialTipLayer.release();
            this._tutorialTipLayer = null;
        }
    }

    public sendUpdateGuideId(guideId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_UpdateGuideId, { guide_id: guideId });
    }

    public dumpInfo() {
        var curStage = this._stageMap[this._curStageId];
        if (curStage) {
        }
    }

    public hasOpeningTutorial(onFinishCallback) {
        if (this._isPlayingOpening) {
            return;
        }
        this.preLoad_cg_mainScene_chaperOne();
        this._isPlayingOpening = true;
        var steps = [
            function (callback) {
                callback();
            }.bind(this),
            function (callback) {
                function playMovice() {
                    function finish() {
                        if (callback) {
                            callback();
                        }
                        G_SceneManager.popScene();
                    }
                    G_ProgressBarManager.hideProgress();
                    G_SceneManager.openPopup(Path.getCommonPrefab("PopupMovieText"), (popupMovieText: PopupMovieText) => {
                        popupMovieText.init(MovieConst.TYPE_CREATE_ROLE_START, callback);
                        popupMovieText.showUI(null, null);
                    });
                }
                G_SceneManager.showScene('firstfight', playMovice);
            }.bind(this),
            function (callback) {
                if (onFinishCallback) {
                    onFinishCallback();
                }
            }.bind(this),
            function (callback) {
                let finish = () => {
                    this._isPlayingOpening = false;
                    if (callback) {
                        callback();
                    }
                }
                finish();
            }.bind(this)
        ];

        function nextStep(callback) {
            this._openingSteps.onGuideCallback = this._openingSteps.onGuideCallback || callback;
            var lock = false;
            let nextHandler = () => {
                if (lock) {
                    return;
                }
                lock = true;
                if (this._openingSteps.index > this._openingSteps.steps.length) {
                    if (this._openingSteps.onGuideCallback) {
                        this._openingSteps.onGuideCallback();
                    }
                    return;
                }
                this._openingSteps.nextStep.apply(this);
            }
            var stepProc = this._openingSteps.steps[this._openingSteps.index - 1];
            this._openingSteps.index = this._openingSteps.index + 1;
            if (stepProc) {
                stepProc(nextHandler);
            }
        }
        this._openingSteps = { index: 1, onGuideCallback: null, nextStep: nextStep, steps: steps };
        this._openingSteps.nextStep.apply(this);
    }

    private pre_res_ids = [1, 2, 100];
    private preLoad_cg_mainScene_chaperOne() {
        if (this.pre_res_ids.length > 0) {
            var id = this.pre_res_ids.shift();
            G_SceneManager.scheduleOnce(() => {
                G_PreloadManager.preLoadResById(id, handler(this, this.preLoad_cg_mainScene_chaperOne));
            }, 8);
        }
    }
}