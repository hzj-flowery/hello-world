import { G_UserData, G_SceneManager } from "../../../init";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { FunctionConst } from "../../../const/FunctionConst";
import ChapterView from "../chapter/ChapterView";
import StageView from "../stage/StageView";
import PopupDailyChoose from "../dailyChallenge/PopupDailyChoose";
import PopupHomelandUpResult from "../homeland/PopupHomelandUpResult";
import { TutorialStepHelper } from "./TutorialStepHelper";

export namespace TutorialStageScript {
    var DEFAULT_WAIT_TIME = 0.5;
    export let checkStage13 = function (stageObj) {
        var karmaId1 = 90101;
        var karmaId2 = 90102;
        var karmaId3 = 90103;
        if (G_UserData.getBase().isMale() == false) {
            karmaId1 = 91101;
            karmaId2 = 91102;
            karmaId3 = 91103;
        }
        var isActive1 = G_UserData.getKarma().isActivated(karmaId1);
        var isActive2 = G_UserData.getKarma().isActivated(karmaId2);
        var isActive3 = G_UserData.getKarma().isActivated(karmaId3);
        var result = true;
        if (isActive1 && isActive2 && isActive3) {
            result = false;
        }
        return result;
    };
    export let checkStage14 = function (stageObj) {
        var retValue1 = G_UserData.getBattleResource().getResourceId(1, 1, 1);
        var stageData = G_UserData.getStage().getStageById(100205);
        if (stageData) {
            var isGetBox = stageData.isReceive_box();
            if (!isGetBox && retValue1 == null) {
                return true;
            }
        }
        return false;
    };
    export let checkStage15 = function (stageObj) {
        var retValue1 = G_UserData.getBattleResource().getResourceId(1, 1, 1);
        if (retValue1) {
            return true;
        }
        return false;
    };
    export let checkStage17 = function (stageObj) {
        var itemNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, 200);
        if (itemNum > 0) {
            return true;
        }
        return false;
    };
    export let checkStage19 = function () {
        var retValue1 = G_UserData.getExplore().isCanRunFirstExploreTutorial();
        return retValue1;
    };
    export let checkStage20 = function (stageObj) {
        var retValue1 = G_UserData.getBattleResource().getResourceId(1, 2, 1);
        var retValue2 = G_UserData.getTreasure().getTreasureIdWithBaseId(101);
        if (retValue1 == null && retValue2 != null) {
            return true;
        }
        return false;
    };
    export let checkStage21 = function (stageObj) {
        var retValue1 = G_UserData.getBattleResource().getResourceId(1, 2, 1);
        if (retValue1) {
            return true;
        }
        return false;
    };
    export let checkStage30 = function (stageObj) {
        var officialLevel = G_UserData.getBase().getOfficialLevel();
        if (officialLevel == 0) {
            return true;
        }
        return false;
    };
    export let checkStage32 = function (stageObj) {
        var isInGuild = G_UserData.getGuild().isInGuild();
        if (isInGuild == false) {
            return true;
        }
        return false;
    };
    export let checkStage40 = function (stageObj) {
        var maxStar = G_UserData.getChapter().getFamousPassCount();
        if (maxStar == 0) {
            return true;
        }
        return false;
    };
    export let checkStage55 = function (stageObj) {
        var maxStar = G_UserData.getTowerData().getMax_star();
        if (maxStar == 0) {
            return true;
        }
        return false;
    };
    export let checkStage75 = function (stageObj) {
        var opHeroCount = G_UserData.getBase().getOpCountReHero();
        if (opHeroCount == 0) {
            return true;
        }
        return false;
    };
    export let checkStage80 = function (stageObj) {
        var count = G_UserData.getBase().getOpCountSiege();
        var siegeCount = G_UserData.getSiegeData().getSiegeEnemys().length;
        var guideId = G_UserData.getBase().getGuide_id();
        if (count == 0 && guideId < 8000) {
            return true;
        }
        return false;
    };
    export let checkStage90 = function (stageObj) {
        var silkId = G_UserData.getSilkbagOnTeam().getIdWithPosAndIndex(1, 1);
        var list = G_UserData.getSilkbag().getListNoWeared();
        if (silkId == 0 && list.length > 0) {
            return true;
        }
        return false;
    };
    export let checkStage120 = function (stageObj) {
        var petId = G_UserData.getBase().getOn_team_pet_id();
        var list = G_UserData.getPet().getListDataBySort();
        if (petId == 0 && list.length > 0) {
            return true;
        }
        return false;
    };
    export let checkStage140 = function (stageObj) {
        var mainTreeLevel = G_UserData.getHomeland().getMainTreeLevel();
        if (mainTreeLevel == 1) {
            return true;
        }
        return false;
    };
    export let ignoreEvent40 = function (stageObj, eventName) {
        if (eventName == 'ChapterView:onRunMapAnimComplete') {
            return false;
        }
        return true;
    };
    export let createWaitStep = function () {
    };
    export let buildStage1 = function (stageObj) {
        stageObj.addStepData(TutorialStepHelper.createStepDataById(101));
        stageObj.addStepData(TutorialStepHelper.createWaitStep(DEFAULT_WAIT_TIME));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(102));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(103));
        stageObj.addStepDataList(TutorialStepHelper.createFightSummnyStep(true));
    };
    export let buildStage2 = function (stageObj) {
        stageObj.addStepData(TutorialStepHelper.createStepDataById(201));
        stageObj.addStepData(TutorialStepHelper.createWaitStep(DEFAULT_WAIT_TIME));
        stageObj.addStepDataList(TutorialStepHelper.createNewFunctionOpenStepList(FunctionConst.FUNC_DRAW_HERO));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(205));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(206));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(207));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(208));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(209));
    };
    export let buildStage3 = function (stageObj) {
        stageObj.addStepData(TutorialStepHelper.createStepDataById(301));
        stageObj.addStepData(TutorialStepHelper.createWaitStep(DEFAULT_WAIT_TIME));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(302));
        stageObj.addStepData(TutorialStepHelper.createEmptyStep());
        stageObj.addStepData(TutorialStepHelper.createStepDataById(303));
        stageObj.addStepData(TutorialStepHelper.createEmptyStep());
        stageObj.addStepData(TutorialStepHelper.createStepDataById(304));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(305));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(306));
    };
    export let buildStage4 = function (stageObj) {
        stageObj.addStepData(TutorialStepHelper.createStepDataById(401));
        stageObj.addStepData(TutorialStepHelper.createWaitStep(DEFAULT_WAIT_TIME));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(402));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(403));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(404));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(405));
        stageObj.addStepDataList(TutorialStepHelper.createFightSummnyStep(true));
    };
    export let buildStage6 = function (stageObj) {
        stageObj.addStepData(TutorialStepHelper.createStepDataById(601));
        stageObj.addStepData(TutorialStepHelper.createWaitStep(DEFAULT_WAIT_TIME));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(602));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(603));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(604));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(605));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(606));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(607));
    };
    export let buildStage7 = function (stageObj) {
        stageObj.addStepData(TutorialStepHelper.createStepDataById(701));
        stageObj.addStepData(TutorialStepHelper.createWaitStep(DEFAULT_WAIT_TIME));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(702));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(704));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(705));
        stageObj.addStepDataList(TutorialStepHelper.createFightSummnyStep(true));
    };
    export let buildStage10 = function (stageObj) {
        stageObj.addStepData(TutorialStepHelper.createStepDataById(1001));
        stageObj.addStepData(TutorialStepHelper.createWaitStep(DEFAULT_WAIT_TIME));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(1002));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(1004));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(1005));
        stageObj.addStepDataList(TutorialStepHelper.createFightSummnyStep(true));
    };
    export let buildStage11 = function (stageObj) {
        stageObj.addStepData(TutorialStepHelper.createStepDataById(1101));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(1102));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(1103));
        stageObj.addStepDataList(TutorialStepHelper.createFightSummnyStep(true));
    };
    export let buildStage12 = function (stageObj) {
        // console.log("buildStage12");
        stageObj.addStepData(TutorialStepHelper.createStepDataById(1201));
        stageObj.addStepDataList(TutorialStepHelper.createChapterEndStep());
        stageObj.addStepData(TutorialStepHelper.createFuncStep(function (stepData) {
            // G_SceneManager.showScene('chapter');
            G_SceneManager.popToRootScene();
            G_SceneManager.replaceScene('chapter');
        }));
        stageObj.addStepData(TutorialStepHelper.createFuncStep(function (stepData) {
            var chapterView: ChapterView = G_SceneManager.getRunningScene().getSceneView();
            if (chapterView != null && chapterView.node.name == "ChapterView") {
                if (chapterView.isPlayingPassLevelAnim() == false) {
                    stepData.doNextStep();
                }
            }
        }));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(1204));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(1205));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(1206));
    };
    export let buildStage13 = function (stageObj) {
        stageObj.addStepDataList(TutorialStepHelper.createFightTriggerStep());
        stageObj.addStepData(TutorialStepHelper.createStepDataById(1302));
        stageObj.addStepDataList(TutorialStepHelper.createNewFunctionOpenStepList(FunctionConst.FUNC_HERO_KARMA));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(1306));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(1307));
        stageObj.addStepDataList(TutorialStepHelper.createKarmaActiveStep());
        stageObj.addStepData(TutorialStepHelper.createStepDataById(1309));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(1310));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(1311));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(1312));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(1313));
    };
    export let buildStage14 = function (stageObj) {
        stageObj.addStepDataList(TutorialStepHelper.createFightTriggerStep());
        stageObj.addStepData(TutorialStepHelper.createStepDataById(1401));
        stageObj.addStepData(TutorialStepHelper.createFuncStep(function (stepData) {
            var stageView: StageView = G_SceneManager.getRunningScene().getSceneView();
            if (stageView != null && stageView.node.name == "StageView") {
                stageView.jumpToStagePos(100205);
            }
            stepData.doNextStep();
        }));
        for (var i = 1402; i <= 1406; i++) {
            stageObj.addStepData(TutorialStepHelper.createStepDataById(i));
        }
    };
    export let buildStage15 = function (stageObj) {
        for (var i = 1501; i <= 1504; i++) {
            stageObj.addStepData(TutorialStepHelper.createStepDataById(i));
        }
    };
    export let buildStage16 = function (stageObj) {
        for (var i = 1601; i <= 1610; i++) {
            stageObj.addStepData(TutorialStepHelper.createStepDataById(i));
        }
    };
    export let buildStage17 = function (stageObj) {
        stageObj.addStepDataList(TutorialStepHelper.createStageTriggerStep());
        stageObj.addStepData(TutorialStepHelper.createStepDataById(1701));
        stageObj.addStepDataList(TutorialStepHelper.createComboHeroStepList());
        for (var i = 1704; i <= 1710; i++) {
            stageObj.addStepData(TutorialStepHelper.createStepDataById(i));
        }
    };
    export let buildStage18 = function (stageObj) {
        stageObj.addStepDataList(TutorialStepHelper.createStageTriggerStep());
        stageObj.addStepData(TutorialStepHelper.createStepDataById(1801));
        stageObj.addStepDataList(TutorialStepHelper.createNewFunctionOpenStepList(FunctionConst.FUNC_TRAVEL));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(1805));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(1806));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(1807));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(1808));
    };
    export let buildStage19 = function (stageObj) {
        stageObj.addStepData(TutorialStepHelper.createStepDataById(1901));
        stageObj.addStepData(TutorialStepHelper.createEmptyStep());
        stageObj.addStepData(TutorialStepHelper.createStepDataById(1902));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(1903));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(1904));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(1906));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(1907));
    };
    export let buildStage20 = function (stageObj) {
        stageObj.addStepData(TutorialStepHelper.createStepDataById(2001));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(2002));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(2003));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(2004));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(2005));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(2006));
    };
    export let buildStage21 = function (stageObj) {
        for (var i = 2101; i <= 2109; i++) {
            stageObj.addStepData(TutorialStepHelper.createStepDataById(i));
        }
    };
    export let buildStage22 = function (stageObj) {
        stageObj.addStepDataList(TutorialStepHelper.createStageTriggerStep());
        stageObj.addStepData(TutorialStepHelper.createStepDataById(2201));
        stageObj.addStepDataList(TutorialStepHelper.createNewFunctionOpenStepList(FunctionConst.FUNC_ARENA));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(2205));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(2206));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(2207));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(2208));
        stageObj.addStepDataList(TutorialStepHelper.createFightSummnyStep(false));
    };
    export let buildStage23 = function (stageObj) {
        stageObj.addStepData(TutorialStepHelper.createStepDataById(2301));
        function func(stepData) {
            var PopupRankUpReward = G_SceneManager.getRunningScene().getPopupByName("PopupRankUpReward");
            if (PopupRankUpReward == null) {
                stepData.doNextStep();
            }
        }
        stageObj.addStepData(TutorialStepHelper.createFuncStep(func));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(2302));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(2303));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(2304));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(2305));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(2306));
        stageObj.addStepData(TutorialStepHelper.createWaitStep(1.5));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(2307));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(2308));
    };
    export let buildStage30 = function (stageObj) {
        stageObj.addStepDataList(TutorialStepHelper.createStageTriggerStep());
        stageObj.addStepData(TutorialStepHelper.createStepDataById(3001));
        stageObj.addStepDataList(TutorialStepHelper.createNewFunctionOpenStepList(FunctionConst.FUNC_OFFICIAL));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(3004));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(3005));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(3006));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(3007));
        stageObj.addStepData(TutorialStepHelper.createEmptyStep());
        stageObj.addStepData(TutorialStepHelper.createStepDataById(3008));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(3009));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(3010));
    };
    export let buildStage32 = function (stageObj) {
        stageObj.addStepDataList(TutorialStepHelper.createStageTriggerStep());
        stageObj.addStepData(TutorialStepHelper.createStepDataById(3201));
        stageObj.addStepDataList(TutorialStepHelper.createNewFunctionOpenStepList(FunctionConst.FUNC_ARMY_GROUP));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(3204));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(3205));
    };
    export let buildStage40 = function (stageObj) {
        stageObj.addStepDataList(TutorialStepHelper.createStageTriggerStep());
        stageObj.addStepData(TutorialStepHelper.createStepDataById(4001));
        stageObj.addStepDataList(TutorialStepHelper.createNewFunctionOpenStepList(FunctionConst.FUNC_FAMOUS_CHAPTER));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(4004));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(4005));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(4006));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(4007));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(4008));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(4009));
        stageObj.addStepDataList(TutorialStepHelper.createFightSummnyStep(false));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(4010));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(4011));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(4012));
    };
    export let buildStage45 = function (stageObj) {
        stageObj.addStepDataList(TutorialStepHelper.createStageTriggerStep());
        stageObj.addStepData(TutorialStepHelper.createStepDataById(4501));
        stageObj.addStepDataList(TutorialStepHelper.createNewFunctionOpenStepList(FunctionConst.FUNC_DAILY_STAGE));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(4504));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(4505));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(4506));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(4507));
        function func(stepData) {
            var root = G_SceneManager.getRunningScene().getPopupByName("PopupDailyChoose").getComponent(PopupDailyChoose);
            var chooseCell = root.getCell1();
            if (chooseCell.isEntered() == true) {
                stepData.doNextStep();
                return;
            }
        }
        stageObj.addStepData(TutorialStepHelper.createFuncStep(func));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(4508));
    };
    export let buildStage55 = function (stageObj) {
        stageObj.addStepDataList(TutorialStepHelper.createStageTriggerStep());
        stageObj.addStepData(TutorialStepHelper.createStepDataById(5501));
        stageObj.addStepDataList(TutorialStepHelper.createNewFunctionOpenStepList(FunctionConst.FUNC_PVE_TOWER));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(5504));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(5505));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(5506));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(5507));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(5508));
        stageObj.addStepDataList(TutorialStepHelper.createFightSummnyStep(false));
    };
    export let buildStage56 = function (stageObj) {
        stageObj.addStepData(TutorialStepHelper.createStepDataById(5601));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(5602));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(5603));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(5604));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(5605));
        stageObj.addStepData(TutorialStepHelper.createWaitStep(1.5));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(5606));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(5607));
    };
    export let buildStage75 = function (stageObj) {
        stageObj.addStepDataList(TutorialStepHelper.createStageTriggerStep());
        stageObj.addStepData(TutorialStepHelper.createStepDataById(7501));
        stageObj.addStepDataList(TutorialStepHelper.createNewFunctionOpenStepList(FunctionConst.FUNC_RECYCLE));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(7502));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(7503));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(7504));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(7505));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(7506));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(7507));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(7508));
    };
    export let buildStage76 = function (stageObj) {
        stageObj.addStepData(TutorialStepHelper.createStepDataById(7601));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(7602));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(7603));
    };
    export let buildStage80 = function (stageObj) {
        stageObj.addStepData(TutorialStepHelper.createStepDataById(8001));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(8002));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(8003));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(8004));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(8005));
    };
    export let buildStage90 = function (stageObj) {
        stageObj.addStepDataList(TutorialStepHelper.createStageTriggerStep());
        stageObj.addStepData(TutorialStepHelper.createStepDataById(9001));
        stageObj.addStepDataList(TutorialStepHelper.createNewFunctionOpenStepList(FunctionConst.FUNC_SILKBAG));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(9004));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(9005));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(9006));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(9007));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(9008));
    };
    export let buildStage120 = function (stageObj) {
        stageObj.addStepDataList(TutorialStepHelper.createStageTriggerStep());
        stageObj.addStepData(TutorialStepHelper.createStepDataById(12001));
        stageObj.addStepDataList(TutorialStepHelper.createNewFunctionOpenStepList(FunctionConst.FUNC_PET_HOME));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(12004));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(12005));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(12006));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(12007));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(12008));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(12009));
    };
    export let buildStage140 = function (stageObj) {
        stageObj.addStepData(TutorialStepHelper.createStepDataById(14001));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(14002));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(14003));
        stageObj.addStepData(TutorialStepHelper.createStepDataById(14004));
        function closePopupResult(stepData, tipLayer, param) {
            function clickFunc(sender, stepData) {
                var upResult = G_SceneManager.getRunningScene().getPopupByName("PopupHomelandUpResult").getComponent(PopupHomelandUpResult);
                if (upResult && upResult.isAnimEnd() == true) {
                    upResult.close();
                    stepData.doNextStep();
                }
            }
            TutorialStepHelper.simulateGuide(tipLayer, null, clickFunc, stepData);
        }
        stageObj.addStepData(TutorialStepHelper.createFuncStep(closePopupResult));
        stageObj.addStepData(TutorialStepHelper.createEmptyStep());
        stageObj.addStepData(TutorialStepHelper.createStepDataById(14005));
    };
}