import { TutorialHelper } from "./TutorialHelper";
import { TutorialStageScript } from "./TutorialStageScript";
import TutorialConst from "../../../const/TutorialConst";
import { G_UserData, G_SocketManager, G_NetworkManager } from "../../../init";
import { MessageIDConst } from "../../../const/MessageIDConst";
import { TutorialStepHelper } from "./TutorialStepHelper";
import ALDStatistics from "../../../utils/ALDStatistics";

export default class TutorialStageBase {

    private _stepCfgList: any[];
    private _stageCfg;
    private _stepDataList: any[];
    private _currStep;
    private _jumpStepId;
    private _doCheckFunc;
    private _doIgnoreEvent;
    private _params;
    private _tipLayer;
    private _oldNetwork;
    private _oldSendFunc;

    private _info;
    private _totalSteps;
    private _headSteps;
    private _bottomSteps;
    private _baseSteps;
    private _dialogueSteps;

    constructor(stageId) {
        var [stepList, stageInfo] = TutorialHelper.getStepList(stageId);
        this._stepCfgList = stepList;
        this._stageCfg = stageInfo;
        this._stepDataList = [];
        this._currStep = 0;
        this._jumpStepId = 0;
        this._doCheckFunc = TutorialStageScript['checkStage' + stageId];
        this._doIgnoreEvent = TutorialStageScript['ignoreEvent' + stageId];
        this._buildStepList(stageId);
    }

    private _buildStepList(stageId) {
        this._stepDataList = [];
        let defFunc = () => {
            for (let i in this._stepCfgList) {
                var value = this._stepCfgList[i];
                this._stepDataList.push(this._createStepData(value, i));
            }
        }
        var buildFunc = TutorialStageScript['buildStage' + stageId] || defFunc;
        buildFunc(this);
    }

    public getStepCfgList() {
        return this._stepCfgList;
    }

    private _init() {
    }

    public getId() {
        return this._stageCfg.stage;
    }

    public ignoreEvent(eventName) {
        if (this._doIgnoreEvent) {
            return this._doIgnoreEvent(this, eventName);
        }
        return true;
    }

    public isStartEvent(params) {
        if (params == null) {
            return false;
        }
        var eventType = this._stageCfg.event_type;
        if (eventType == TutorialConst.STAGE_ACTIVE_LEVEL) {
            if (params == 'PopupPlayerLevelUp') {
                return true;
            }
        }
        if (eventType == TutorialConst.STAGE_ACTIVE_STORY) {
            if (params == 'FightView') {
                return true;
            }
        }
        if (eventType == TutorialConst.STAGE_ACTIVE_BOX_AWARD) {
            if (params == 'PopupGetRewards') {
                return true;
            }
        }
        if (eventType == TutorialConst.STAGE_EXPLORE_FINISH_AWARD) {
            if (params == 'PopupGetRewards') {
                return true;
            }
        }
        if (eventType == TutorialConst.STAGE_REBEL_EVENT) {
            if (params == 'PopupSiegeCome') {
                return true;
            }
        }
        return false;
    }

    private _isEventMatch(params) {
        var eventType = this._stageCfg.event_type;
        var eventValue = this._stageCfg.event_param;
        var levelMin = this._stageCfg.level_min;
        var levelMax = this._stageCfg.level_max;
        if (eventType == 0) {
            return false;
        }
        var curLevel = G_UserData.getBase().getLevel();
        if (levelMin > 0 && levelMax > 0) {
            if (curLevel < levelMin || curLevel > levelMax) {
                return false;
            }
        }
        function levelTypeActive() {
            return true;
        }
        if (eventType == TutorialConst.STAGE_ACTIVE_LEVEL) {
            return levelTypeActive();
        }
        function storyTypeActive() {
            var stageId = params.battleId;
            if (eventValue == stageId) {
                return true;
            }
            return false;
        }
        if (eventType == TutorialConst.STAGE_ACTIVE_STORY) {
            return storyTypeActive();
        }
        function boxTypeActive() {
            var boxId = params;
            if (eventValue == boxId) {
                return true;
            }
            return false;
        }
        if (eventType == TutorialConst.STAGE_ACTIVE_BOX_AWARD) {
            return boxTypeActive();
        }
        function exploreTypeActive() {
            var exploreId = params.id;
            var passCount = G_UserData.getExplore().getPassCount(exploreId);
            if (eventValue == exploreId && passCount == 2) {
                return true;
            }
            return false;
        }
        if (eventType == TutorialConst.STAGE_EXPLORE_FINISH_AWARD) {
            return exploreTypeActive();
        }
        if (eventType == TutorialConst.STAGE_REBEL_EVENT) {
            var count = G_UserData.getBase().getOpCountSiege();
            var siegeCount = G_UserData.getSiegeData().getSiegeEnemys().length;
            var guideId = G_UserData.getBase().getGuide_id();
            if (count == 0 && guideId < 8000) {
                return true;
            }
            return false;
        }
    }

    public isFilterType(filterType, params) {
        filterType = filterType || TutorialConst.STAGE_ACTIVE_LEVEL;
        var eventType = this._stageCfg.event_type;
        if (eventType == filterType) {
            if (this._isEventMatch(params) == true) {
                return false;
            }
        }
        return true;
    }

    public isActivie() {
        var curLevel = G_UserData.getBase().getLevel();
        var eventType = this._stageCfg.event_type;
        var eventValue = this._stageCfg.event_param;
        var levelMin = this._stageCfg.level_min;
        var levelMax = this._stageCfg.level_max;
        if (eventType == 0) {
            return true;
        }
        if (levelMin > 0 && levelMax > 0) {
            if (curLevel < levelMin || curLevel > levelMax) {
                return false;
            }
        }
        let levelTypeActive = () => {
            if (this._doCheckFunc) {
                return this._doCheckFunc(this);
            }
            return true;
        }
        if (eventType == TutorialConst.STAGE_ACTIVE_LEVEL) {
            return levelTypeActive();
        }
        let storyTypeActive = () => {
            if (this._doCheckFunc) {
                return this._doCheckFunc(this);
            }
            return true;
        }
        if (eventType == TutorialConst.STAGE_ACTIVE_STORY) {
            return storyTypeActive();
        }
        let boxTypeActive = () => {
            if (this._doCheckFunc) {
                return this._doCheckFunc(this);
            }
            return true;
        }
        if (eventType == TutorialConst.STAGE_ACTIVE_BOX_AWARD) {
            return boxTypeActive();
        }
        let exploreTypeActive = () => {
            if (this._doCheckFunc) {
                return this._doCheckFunc(this);
            }
            return true;
        }
        if (eventType == TutorialConst.STAGE_EXPLORE_FINISH_AWARD) {
            return exploreTypeActive();
        }
        let rebelTypeActive = () => {
            if (this._doCheckFunc) {
                return this._doCheckFunc(this);
            }
            return true;
        }
        if (eventType == TutorialConst.STAGE_REBEL_EVENT) {
            return rebelTypeActive();
        }
        let scriptTypeActive = () => {
            if (this._doCheckFunc) {
                return this._doCheckFunc(this);
            }
            return true;
        }
        if (eventType == TutorialConst.STAGE_SCRIPT_CHECK) {
            return scriptTypeActive();
        }
        return true;
    }

    public doActivie() {
    }

    private _doNextStep(nextStepFuc) {
        var currStepData = this._stepDataList[this._currStep - 1];
        this._currStep = this._currStep + 1;
        var nextStepData = this._stepDataList[this._currStep - 1];
        if (nextStepData == null) {
            return false;
        }
        if (nextStepData.doFunction && typeof (nextStepData.doFunction) == 'function') {
            var cfgId = 0;
            if (nextStepData.cfg) {
                cfgId = nextStepData.cfg.id;
            }
            var paramsMsg = this._params;
            if (paramsMsg == null || typeof (paramsMsg) == 'object') {
                paramsMsg = '';
            }
            //策划说关闭新手引导ald
            ALDStatistics.instance.aldSendGuideEvent(cfgId);
            console.log("[TutorialStageBase] _doNextStep:", "currstep", this._currStep, "cfgId", cfgId, paramsMsg);
            nextStepData.doNextStep = nextStepFuc;
            var retFunc = nextStepData.doFunction(nextStepData, this._tipLayer, this._params);
            if (retFunc == null) {
                retFunc = true;
            }
            return retFunc;
        }
        return true;
    }

    public doNextStep(tipLayer, params, nextStepFuc) {
        // console.log("doNextStep", nextStepFuc);
        this._tipLayer = tipLayer;
        this._params = params;
        if (this._doNextStep(nextStepFuc) == false) {
            return false;
        }
        return true;
    }

    public getCurrStep() {
        return this._stepDataList[this._currStep - 1];
    }

    public getNextStageId() {
        return this._stageCfg.next_stage || 0;
    }

    public getStepId() {
        return this._stageCfg.id || 0;
    }

    public getNextStepId() {
        if (this._stageCfg.next_stage == TutorialHelper.STEP_PAUSE) {
            var endStepInfo = this._stepCfgList[this._stepCfgList.length - 1];
            return endStepInfo.id;
        }
        var [stepList, nextStepStart] = TutorialHelper.getStepList(this._stageCfg.next_stage);
        return nextStepStart.id || 0;
    }

    public updateJumpStepId() {
        var disconnectId = this._stageCfg.disconnect_id;
        if (disconnectId && disconnectId > 0) {
            this._jumpStepId = disconnectId;
            let moveToJumpId = (disconnectId) => {
                for (let i in this._stepDataList) {
                    var value = this._stepDataList[i];
                    if (value == disconnectId) {
                        return i;
                    }
                }
            }
            this._currStep = moveToJumpId(disconnectId);
        }
    }

    private _createStepData(stepInfo, index) {
        var stepData = {
            cfg: null,
            doFunction: null,
            owner: null,
            index: index
        };
        stepData.cfg = stepInfo;
        stepData.owner = this;
        stepData.doFunction = this._getStepDoFunc(stepInfo);
        return stepData;
    }

    private _getStepDoFunc(stepCfg) {
        var funcName = TutorialConst.getStepTypeName(stepCfg.type);
        var funcValue = TutorialStepHelper[funcName];
        if (funcValue && typeof (funcValue) == 'function') {
            return funcValue;
        }
        return null;
    }

    public destroy() {
        this._clear();
    }

    private _clear() {
        if (this._oldNetwork && this._oldSendFunc && this._oldNetwork == G_SocketManager) {
            G_SocketManager.send = this._oldSendFunc;
        }
        this._oldNetwork = null;
        this._oldSendFunc = null;
    }

    public bindProtoMsg(msgId) {
        // console.log("bindProtoMsg");
        if (!msgId || typeof (msgId) != 'number') {
        }
        let oldSend = G_NetworkManager.send;
        if (this._oldSendFunc && this._oldSendFunc != oldSend) {
            this._oldSendFunc = null;
            this._oldNetwork = null;
        }
        this._oldSendFunc = oldSend;
        this._oldNetwork = G_NetworkManager;
        G_NetworkManager.send = (id, buff) => {
            // console.log("bindProtoMsg G_NetworkManager.send");
            if (!id || typeof (id) != 'number') {
            }
            if (msgId == id) {
                var currStepData = this.getCurrStep();
                if (currStepData && currStepData.cfg && currStepData.cfg.disconnect_id > 0) {
                    var nextStepId = currStepData.cfg.disconnect_id;
                    var encodeBuff = G_NetworkManager.encodeProtoBuff(id, buff);
                    var msgBuffer = {
                        guideid: nextStepId,
                        sub_msgid: id,
                        sub_msg: encodeBuff
                    };
                    oldSend.apply(G_NetworkManager, [MessageIDConst.ID_C2S_GeneralGuide, msgBuffer]);
                }
                G_NetworkManager.send = oldSend;
            } else {
                oldSend.apply(G_NetworkManager, [id, buff]);
            }
        };
    }

    public stop() {
        this._info.next_step = 30000;
        this._totalSteps = {};
        this._headSteps = {};
        this._bottomSteps = {};
        this._baseSteps = {};
        this._dialogueSteps = {};
    }

    public addStepData(stepData) {
        stepData.owner = this;
        this._stepDataList.push(stepData);
    }

    public addStepDataList(stepDataList) {
        for (let i in stepDataList) {
            var stepData = stepDataList[i];
            this.addStepData(stepData);
        }
    }

    public addStepToBottom(stepData) {
        stepData.owner = this;
        this._stepDataList.push(stepData);
    }

    public addStepToTop(func) {
        var stepData: any = {};
        stepData.owner = this;
        stepData.cfg = null;
        stepData.doFunction = func;
        stepData.doNextStep = null;
        this._stepDataList.unshift(stepData);
    }
}