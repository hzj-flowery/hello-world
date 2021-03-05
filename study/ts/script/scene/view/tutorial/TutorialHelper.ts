import { G_ConfigLoader } from "../../../init";
import { ConfigNameConst } from "../../../const/ConfigNameConst";

export namespace TutorialHelper {
    export let STEP_PAUSE = 30000;
    export let getStageList = function (): any[] {
        function condition(info) {
            if (info.id % 100 == 0) {
                return true;
            }
            return false;
        }
        var values = [];
        let TutorialInfo = G_ConfigLoader.getConfig(ConfigNameConst.GUIDE);
        for (var i = 0; i < TutorialInfo.length(); i++) {
            var info = TutorialInfo.indexOf(i);
            if (condition(info)) {
                values.push(info);
            }
        }
        return values;
    };
    export let getStageIdById = function (stepId) {
        let TutorialInfo = G_ConfigLoader.getConfig(ConfigNameConst.GUIDE);
        var stepInfo = TutorialInfo.get(stepId);
        return stepInfo.stage;
    };
    export let getStageByStepId = function (stepId) {
        var stepInfo = TutorialHelper.getStepInfo(stepId);
        return TutorialHelper.getStageById(stepInfo.stage);
    };
    export let getStageById = function (stageId) {
        function condition(info) {
            if (info.id % 100 == 0 && info.stage == stageId) {
                return true;
            }
            return false;
        }
        let TutorialInfo = G_ConfigLoader.getConfig(ConfigNameConst.GUIDE);
        for (var i = 0; i < TutorialInfo.length(); i++) {
            var info = TutorialInfo.indexOf(i);
            if (condition(info)) {
                return info;
            }
        }
        return null;
    };
    //------性能优化   避免构造每个stage都来取indexOf
    var TutorialInfos = [];
    export let getStepList = function (stageId): any[] {
        function condition(info) {
            if (info.stage == stageId && info.id % 100 != 0) {
                return true;
            }
            return false;
        }
        function conditionStage(info) {
            if (info.stage == stageId && info.id % 100 == 0) {
                return true;
            }
            return false;
        }
        var currStage = null;
        var values = [];
        let TutorialInfo = G_ConfigLoader.getConfig(ConfigNameConst.GUIDE);
        for (var i = 0; i < TutorialInfo.length(); i++) {
            var info = TutorialInfos[i];
            if (!info) {
                info =  TutorialInfo.indexOf(i);
                TutorialInfos[i] = info;
            }
            if (conditionStage(info)) {
                currStage = info;
            }
            if (condition(info)) {
                values.push(info);
            }
        }
        return [
            values,
            currStage
        ];
    };
    // export let createStage = function (stageId) {
    //     var stepBase = new TutorialStepBase(stageId);
    //     return stepBase;
    // };
    export let getStepInfo = function (stepId) {
        let TutorialInfo = G_ConfigLoader.getConfig(ConfigNameConst.GUIDE);
        var stepInfo = TutorialInfo.get(stepId);
        return stepInfo;
    };
    export let isStartStep = function (stepId) {
        var stepInfo = TutorialHelper.getStepInfo(stepId);
        if (stepId % 100 == 0) {
            return [
                true,
                stepInfo
            ];
        }
        return false;
    };
    export let isEndStep = function (stepId) {
        var stepInfo = TutorialHelper.getStepInfo(stepId);
        var stageList = TutorialHelper.getStageById(stepInfo.stage);
        if (stepInfo.next_stage == TutorialHelper.STEP_PAUSE) {
            if (stageList && stageList.length > 0) {
                var stepInfoEnd = stageList[stageList.length - 1];
                if (stepInfoEnd.id == stepInfo.id) {
                    return true;
                }
            }
        }
        return false;
    };
}