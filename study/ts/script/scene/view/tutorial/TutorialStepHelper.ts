import { MessageIDConst } from "../../../const/MessageIDConst";
import { SignalConst } from "../../../const/SignalConst";
import TutorialConst from "../../../const/TutorialConst";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import { Colors, G_AudioManager, G_EffectGfxMgr, G_ResolutionManager, G_SceneManager, G_SignalManager, G_TopLevelNode, G_TutorialManager, G_UserData } from "../../../init";
import PopupBoxReward from "../../../ui/popup/PopupBoxReward";
import PopupChooseCellBase from "../../../ui/popup/PopupChooseCellBase";
import PopupComboHeroGift from "../../../ui/popup/PopupComboHeroGift";
import PopupNewFunction from "../../../ui/popup/PopupNewFunction";
import PopupBase from "../../../ui/PopupBase";
import { PopupGetRewards } from "../../../ui/PopupGetRewards";
import PopupPlayerLevelUp from "../../../ui/PopupPlayerLevelUp";
import { WayFuncDataHelper } from "../../../utils/data/WayFuncDataHelper";
import { UserCheck } from "../../../utils/logic/UserCheck";
import { Path } from "../../../utils/Path";
import { TextHelper } from "../../../utils/TextHelper";
import { Util } from "../../../utils/Util";
import ChallengeCell from "../challenge/ChallengeCell";
import EquipTrainStrengthenLayer from "../equipTrain/EquipTrainStrengthenLayer";
import PopupHeroKarma from "../heroTrain/PopupHeroKarma";
import SummaryBase from "../settlement/SummaryBase";
import ShopFixView from "../shop/ShopFixView";
import PopupFamousDetail from "../stage/PopupFamousDetail";
import PopupSiegeCome from "../stage/PopupSiegeCome";
import PopupStageDetail from "../stage/PopupStageDetail";
import PopupStageReward from "../stage/PopupStageReward";
import StageNode from "../stage/StageNode";
import PopupStoryChat from "../storyChat/PopupStoryChat";
import TreasureTrainStrengthenLayer from "../treasureTrain/TreasureTrainStrengthenLayer";
import { TutorialHelper } from "./TutorialHelper";
import TutorialStepExtend from "./TutorialStepExtend";
import TutorialTipContentNode from "./TutorialTipContentNode";
import TutorialTipLayer from "./TutorialTipLayer";

export namespace TutorialStepHelper {

    let tutorialStepExtend: TutorialStepExtend;
    export let init = function () {
        tutorialStepExtend = new TutorialStepExtend;
    }

    export let STEP_PAUSE = 30000;
    export let STEP_TYEP_CLICK = function (stepData, tipLayer: TutorialTipLayer, params) {
        var stepTable = tutorialStepExtend['step' + stepData.cfg.id];
        if (stepTable == null) {
        }
        TutorialStepHelper.commonClickFunc(stepTable, stepData, tipLayer);
    };
    export let STEP_TYEP_TALK = function (stepData, tipLayer: TutorialTipLayer, params) {
        var stepTable = tutorialStepExtend['step' + stepData.cfg.id];
        var eventName = params;
        function onChatFinish() {
            G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, 'OnChatFinish');
        }
        if (stepData.cfg.text_id > 0) {
            G_SceneManager.openPopup(Path.getPrefab("PopupStoryChat", "storyChat"), (chatView: PopupStoryChat) => {
                chatView.updateUI(stepData.cfg.text_id, onChatFinish);
                chatView.node.setPosition(0, 0);
                G_TopLevelNode.addTutorialLayer(chatView.node);
            });
        }
    };
    export let STEP_TYEP_WAIT = function (stepData, tipLayer: TutorialTipLayer, params) {
        var stepTable = tutorialStepExtend['step' + stepData.id];
    };
    export let STEP_TYEP_JUMP = function (stepData, tipLayer, params) {
        var stepTable = tutorialStepExtend['step' + stepData.cfg.id];
        var funcId = stepData.cfg.type_param1;
        WayFuncDataHelper.gotoModuleByFuncId(funcId);
        function jumpFuncCallback() {
        }
        jumpFuncCallback();
        if (stepTable && stepTable.func) {
            return stepTable.func(stepData, tipLayer);
        }
    };
    export let STEP_TYEP_SCRIPT = function (stepData, tipLayer: TutorialTipLayer, params) {
        var stepTable = tutorialStepExtend['step' + stepData.cfg.id];
        if (stepTable.func) {
            return stepTable.func(stepData, tipLayer);
        }
    };
    export let createStepDataById = function (stepId) {
        var stepInfo = TutorialHelper.getStepInfo(stepId);
        var stepData = TutorialStepHelper._createStepData(stepInfo);
        return stepData;
    };
    export let _createStepData = function (stepInfo, index?) {
        var stepData = {
            cfg: null,
            doFunction: null,
            owner: null,
            index: index
        };
        function getStepDoFunc(stepInfo) {
            var funcName = TutorialConst.getStepTypeName(stepInfo.type);
            var funcValue = TutorialStepHelper[funcName];
            if (funcValue && typeof (funcValue) == 'function') {
                return funcValue;
            }
            return null;
        }
        stepData.cfg = stepInfo;
        stepData.owner = this;
        stepData.doFunction = getStepDoFunc(stepInfo);
        return stepData;
    };
    export let createReplaceBattlePopStep = function (needReplaceScene?) {
        var stepData: any = {
            cfg: null,
            doFunction: null,
            owner: null
        };
        // stepData.cfg = stepInfo;
        // stepData.owner = owner;
        function checkInTheFight(stepData) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'FightView');
            if (root == null) {
                return false;
            }
            return true;
        }
        if (needReplaceScene == true) {
            let replaceFunc = (stepData) => {
                if (G_SceneManager.fightScenePop && checkInTheFight(stepData) == true) {
                    var oldFunc = G_SceneManager.fightScenePop;
                    let replacFunc = () => {
                        G_SceneManager.fightScenePop = function () {
                            G_SceneManager.popScene();
                        };
                    }
                    G_SceneManager.fightScenePop = replacFunc;
                }
                stepData.doNextStep();
            }
            // console.log("createReplaceBattlePopStep");
            stepData.doFunction = replaceFunc;
        } else {
            stepData.doFunction = function (stepData) {
                stepData.doNextStep();
            };
        }
        return stepData;
    };
    export let createEmptyStep = function () {
        var stepData = {
            cfg: null,
            doFunction: null,
            owner: null
        };
        // stepData.cfg = stepInfo;
        // stepData.owner = owner;
        function empty() {
        }
        stepData.doFunction = empty;
        return stepData;
    };
    export let createWaitStep = function (duration) {
        var retData = TutorialStepHelper.createStepAsync(function (stepData) {
            if (stepData && stepData.doNextStep) {
                stepData.doNextStep();
            }
        }, duration);
        return retData;
    };
    export let createStepAsync = function (stepFunc, duration) {
        var retData = TutorialStepHelper.createFuncStep(function (params) {
            setTimeout(function () {
                stepFunc(params);
            }, duration || 0)
        });
        return retData;
    };
    export let createFuncStep = function (func) {
        var stepData = {
            cfg: null,
            doFunction: null,
            owner: null
        };
        stepData.cfg = null;
        // stepData.owner = owner;
        stepData.doFunction = func;
        return stepData;
    };
    export let showSimulateGuide = function (stepData, rect, tipLayer: TutorialTipLayer, callBackFunc?, offset?) {
        if (rect != null) {
            var nodePos = tipLayer.node.convertToNodeSpaceAR(cc.v2(rect.x, rect.y));
            var effectNode = G_EffectGfxMgr.createPlayGfx(tipLayer.node, 'effect_finger').node;
            var posX = nodePos.x + rect.width / 2;
            let posY = nodePos.y + rect.height / 2;
            console.log("showSimulateGuide1:", rect.toString(), nodePos.toString(), posX, posY);
            if (offset) {
                // console.log("showSimulateGuide2:", offset.x, offset.y);
                posX = posX + offset.x;
                posY = posY + offset.y;
            }
            effectNode.setPosition(posX, posY);
            TutorialStepHelper.simulateGuide(tipLayer, rect, callBackFunc, stepData);
        } else {
            TutorialStepHelper.simulateGuide(tipLayer, null, callBackFunc, stepData);
        }

    };
    export let createClickStep = function (rect, callBackFunc) {
        var stepData = {
            cfg: null,
            doFunction: null,
            owner: null
        };
        function simulateClick(stepData, tipLayer: TutorialTipLayer, params) {
            function onCallBack() {
                G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, 'TutorialStepHelper.createClickStep');
            }
            if (callBackFunc == null) {
                callBackFunc = onCallBack;
            }
            TutorialStepHelper.showSimulateGuide(stepData, rect, tipLayer, callBackFunc);
        }
        stepData.cfg = null;
        // stepData.owner = owner;
        stepData.doFunction = simulateClick;
        return stepData;
    };
    export let createKarmaActiveStep = function () {
        var retList = [];
        var karmaId1 = 90101;
        var karmaId2 = 90102;
        var karmaId3 = 90103;
        if (G_UserData.getBase().isMale() == false) {
            karmaId1 = 91101;
            karmaId2 = 91102;
            karmaId3 = 91103;
        }
        function findCellBtn(karmaId) {
            if (G_UserData.getKarma().isActivated(karmaId) == true) {
                return null;
            }
            var PopupHeroKarma = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'PopupHeroKarma');
            var listView = Util.getSubNodeByName(PopupHeroKarma, '_listView');
            var karamWidget = Util.getSubNodeByName(listView, 'HeroKarmaCellTitle' + karmaId);
            var clickWidget = Util.getSubNodeByName(karamWidget, 'ButtonActive');
            return clickWidget.getBoundingBoxToWorld();
        }
        function clickFunc(karmaId, stepData) {
            var stageObj = stepData.owner;
            if (stageObj) {
                stepData.cfg = {};
                stepData.cfg.disconnect_id = 1313;
                stepData.bindfunc = function (stepData) {
                    var stageObj = stepData.owner;
                    if (stageObj) {
                        stageObj.bindProtoMsg(MessageIDConst.ID_C2S_HeroActiveDestiny);
                    }
                };
            }
            var popupHeroKarma = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'PopupHeroKarma').getComponent(PopupHeroKarma);
            popupHeroKarma.doActive(karmaId);
            G_TutorialManager.clearTipLayer();
        }
        function onClick1(sender, stepData) {
            clickFunc(karmaId1, stepData);
        }
        function onClick2(sender, stepData) {
            clickFunc(karmaId2, stepData);
        }
        function onClick3(sender, stepData) {
            clickFunc(karmaId3, stepData);
        }
        var stepData3 = TutorialStepHelper.createFuncStep(function (stepData, tipLayer: TutorialTipLayer) {
            var btnBox3 = findCellBtn(karmaId3);
            if (btnBox3 != null) {
                TutorialStepHelper.showSimulateGuide(stepData, btnBox3, tipLayer, onClick3, cc.v2(5, -10));
            } else {
                stepData.doNextStep();
            }
        });
        var stepData2 = TutorialStepHelper.createFuncStep(function (stepData, tipLayer: TutorialTipLayer) {
            var btnBox2 = findCellBtn(karmaId2);
            if (btnBox2 != null) {
                TutorialStepHelper.showSimulateGuide(stepData, btnBox2, tipLayer, onClick2, cc.v2(5, -10));
            } else {
                stepData.doNextStep();
            }
        });
        var stepData1 = TutorialStepHelper.createFuncStep(function (stepData, tipLayer: TutorialTipLayer) {
            var btnBox1 = findCellBtn(karmaId1);
            if (btnBox1 != null) {
                TutorialStepHelper.showSimulateGuide(stepData, btnBox1, tipLayer, onClick1, cc.v2(5, -10));
            } else {
                stepData.doNextStep();
            }
        });
        retList.push(stepData1);
        retList.push(stepData2);
        retList.push(stepData3);
        return retList;
    };
    export let createComboHeroStepList = function () {
        var tableList = [];
        var stepData1 = TutorialStepHelper.createFuncStep(function (stepData, tipLayer: TutorialTipLayer) {
            G_SceneManager.openPopup(Path.getCommonPrefab("PopupComboHeroGift"), (popupComboHeroGift: PopupComboHeroGift) => {
                popupComboHeroGift.init(null);
                popupComboHeroGift.open();
            });
            stepData.doNextStep();
        });
        var stepData2 = TutorialStepHelper.createFuncStep(function (stepData, tipLayer: TutorialTipLayer) {
            TutorialStepHelper.showSimulateGuide(stepData, null, tipLayer);
        });
        var stepData3 = TutorialStepHelper.createFuncStep(function (stepData, tipLayer: TutorialTipLayer) {
            function getBtnBox() {
                var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_commonBtn');
                return root.getBoundingBoxToWorld();
            }
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_commonBtn');
            function onClickFunc(sender, stepData) {
                var popupComboHeroGift = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'PopupComboHeroGift').getComponent(PopupComboHeroGift);
                popupComboHeroGift.close();
                G_TutorialManager.clearTipLayer();
                G_SceneManager.popToRootAndReplaceScene('main');
            }
            TutorialStepHelper.showSimulateGuide(stepData, getBtnBox(), tipLayer, onClickFunc, cc.v2(5, -10));
        });
        tableList.push(stepData1);
        tableList.push(stepData2);
        tableList.push(stepData3);
        return tableList;
    };
    export let createNewFunctionOpenStepList = function (funcId) {
        var tableList = [];
        var stepData1 = TutorialStepHelper.createFuncStep(function (stepData, tipLayer: TutorialTipLayer) {
            G_SceneManager.openPopup(Path.getCommonPrefab("PopupNewFunction"), (popupNewFunction: PopupNewFunction) => {
                popupNewFunction.init(funcId);
                popupNewFunction.open();
            });
            stepData.doNextStep();
        });
        var stepData2 = TutorialStepHelper.createFuncStep(function (stepData, tipLayer: TutorialTipLayer) {
            TutorialStepHelper.showSimulateGuide(stepData, null, tipLayer);
        });
        var stepData3 = TutorialStepHelper.createFuncStep(function (stepData, tipLayer: TutorialTipLayer) {
            function getBtnBox() {
                var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_commonBtn');
                return root.getBoundingBoxToWorld();
            }
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_commonBtn');
            function onClickFunc(sender, stepData) {
                var popupNewFunction = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'PopupNewFunction').getComponent(PopupNewFunction);
                popupNewFunction.close();
                G_TutorialManager.clearTipLayer();
                var runningScene = G_SceneManager.getRunningScene();
                if (runningScene.getName() == 'main') {
                    stepData.doNextStep();
                } else {
                    G_SceneManager.popToRootAndReplaceScene('main');
                }
            }
            TutorialStepHelper.showSimulateGuide(stepData, getBtnBox(), tipLayer, onClickFunc, cc.v2(5, -10));
        });
        tableList.push(stepData1);
        tableList.push(stepData2);
        tableList.push(stepData3);
        return tableList;
    };
    export let createChapterEndStep = function () {
        let retList = [];
        let stepData1 = TutorialStepHelper.createFuncStep(function (stepData) {
            let isChapterFinish = G_UserData.getStage().needShowEnd();
            if (isChapterFinish == false) {
                stepData.doNextStep();
                return;
            }
        });
        let stepData2 = TutorialStepHelper.createFuncStep(function (stepData, tipLayer: TutorialTipLayer) {
            let popupStageRewardNode = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'PopupStageReward');
            if (popupStageRewardNode == null) {
                stepData.doNextStep();
                return;
            }
            let popupStageReward = popupStageRewardNode.getComponent(PopupStageReward);
            function findTakeBtn() {
                let confirmBtn = Util.getSubNodeByName(popupStageReward.node, 'confirmBtn');
                return confirmBtn.getBoundingBoxToWorld();
            }
            let takeBtn = findTakeBtn();
            function clickFunc(sender, stepData) {
                let popupStageReward = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'PopupStageReward').getComponent(PopupStageReward);
                popupStageReward._getReward();
                G_TutorialManager.clearTipLayer();
            }
            TutorialStepHelper.showSimulateGuide(stepData, takeBtn, tipLayer, clickFunc);
            let stageObj = stepData.owner;
            stepData.cfg = {};
            stepData.cfg.disconnect_id = 1206;
            if (stageObj) {
                stageObj.bindProtoMsg(MessageIDConst.ID_C2S_GetAllAwardBox);
            }
        });
        let stepData3 = TutorialStepHelper.createFuncStep(function (stepData, tipLayer: TutorialTipLayer) {
            let popupGetRewardsNode = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'PopupGetRewards');
            if (popupGetRewardsNode == null) {
                stepData.doNextStep();
                return;
            }
            function clickFunc(sender, stepData) {
                let popupGetRewards = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'PopupGetRewards').getComponent(PopupGetRewards);
                if (popupGetRewards && popupGetRewards.isAnimEnd()) {
                    popupGetRewards.close();
                    stepData.doNextStep();
                }
            }
            TutorialStepHelper.simulateGuide(tipLayer, null, clickFunc, stepData);
        });
        let stepData4 = TutorialStepHelper.createFuncStep(function (stepData, tipLayer: TutorialTipLayer) {
            let popupMovieText = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'PopupMovieText');
            if (popupMovieText == null) {
                stepData.doNextStep();
                return;
            }
        });
        retList.push(stepData1);
        retList.push(stepData2);
        retList.push(stepData3);
        retList.push(stepData4);
        return retList;
    };
    export let createSiegeTriggerStep = function (needReplaceScene) {
        var stepList = [];
        function waitSiegeShow(stepData, tipLayer, param) {
            var popupSiegeCome = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'PopupSiegeCome');
            if (popupSiegeCome) {
            } else {
                stepData.doNextStep();
            }
        }
        function doSiegeClick(stepData, tipLayer: TutorialTipLayer, param) {
            var popupSiegeCome = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'PopupSiegeCome');
            if (popupSiegeCome) {
                var target = Util.getSubNodeByName(popupSiegeCome, 'buttonFight');
                let clickFunc = function (sender, stepData) {
                    var siegeCome = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'PopupSiegeCome').getComponent(PopupSiegeCome);
                    siegeCome.close();
                    stepData.doNextStep();
                }
                TutorialStepHelper.showSimulateGuide(stepData, target.getBoundingBoxToWorld(), tipLayer, clickFunc, cc.v2(5, -10));
            } else {
                stepData.doNextStep();
            }
        }
        var stepData1 = TutorialStepHelper.createFuncStep(waitSiegeShow);
        var stepData2 = TutorialStepHelper.createFuncStep(doSiegeClick);
        stepList.push(stepData1);
        stepList.push(stepData2);
        return stepList;
    };
    export let createStageTriggerStep = function (needReplaceScene?) {
        var stepList = [];
        if (needReplaceScene == null) {
            needReplaceScene = true;
        }
        function isInFightScene() {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'FightView');
            if (root == null) {
                return false;
            }
            return true;
        }
        function doLevelUp(stepData, tipLayer: TutorialTipLayer, param) {
            var playerLevelUp = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'PopupPlayerLevelUp');
            if (playerLevelUp) {
                let clickFunc = function (sender, stepData) {
                    var playerLevelUp = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'PopupPlayerLevelUp').getComponent(PopupPlayerLevelUp);
                    if (playerLevelUp && playerLevelUp.isAnimEnd() == true) {
                        playerLevelUp.close();
                        stepData.doNextStep();
                    }
                }
                TutorialStepHelper.simulateGuide(tipLayer, null, clickFunc, stepData);
            } else {
                stepData.doNextStep();
            }
        }
        function stepFunc(stepData) {
            var playerLevelUp = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'PopupPlayerLevelUp');
            if (playerLevelUp == null) {
                stepData.doNextStep();
            }
            if (isInFightScene() == true) {
                stepData.doNextStep();
            }
        }
        var stepData1 = TutorialStepHelper.createReplaceBattlePopStep(needReplaceScene);
        var stepData3 = TutorialStepHelper.createFuncStep(doLevelUp);
        stepList.push(stepData1);
        stepList.push(stepData3);
        return stepList;
    };
    export let createFightTriggerStep = function (needReplaceScene?) {
        var stepList = TutorialStepHelper.createFightSummnyStep(needReplaceScene);
        stepList.shift();
        return stepList;
    };
    export let createFightSummnyStep = function (needReplaceScene) {
        if (needReplaceScene == null) {
            needReplaceScene = true;
        }
        var stepList = [];
        function checkInTheFight(stepData) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'FightView');
            if (root == null) {
                stepData.doNextStep();
                return false;
            }
            return true;
        }
        var stepData1 = TutorialStepHelper.createFuncStep(function (stepData, tipLayer: TutorialTipLayer) {
            checkInTheFight(stepData);
        });
        var stepData2 = TutorialStepHelper.createReplaceBattlePopStep(needReplaceScene);
        function doBattleOver(stepData, tipLayer: TutorialTipLayer, param) {
            if (checkInTheFight(stepData)) {
                let clickFunc = function (sender, stepData) {
                    var summaryBaseNode = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'SummaryBase');
                    if (summaryBaseNode != null) {
                        let summaryBase = summaryBaseNode.getComponent(SummaryBase);
                        if (summaryBase && summaryBase.isAnimEnd() == true) {
                            stepData.doNextStep();
                        }
                    }

                }
                TutorialStepHelper.simulateGuide(tipLayer, null, clickFunc, stepData);
            }
        }
        function doLevelUp(stepData, tipLayer: TutorialTipLayer, param) {
            if (checkInTheFight(stepData)) {
                var levelUp = UserCheck.isLevelUp(function () {
                    var summaryBase = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'SummaryBase').getComponent(SummaryBase);
                    summaryBase.doCallBack();
                    summaryBase.close();
                    stepData.doNextStep();
                })[0];
                if (levelUp) {
                    let clickFunc = function (sender, stepData) {
                        var playerLevelUpNode = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'PopupPlayerLevelUp');
                        if (playerLevelUpNode != null) {
                            let playerLevelUp = playerLevelUpNode.getComponent(PopupPlayerLevelUp)
                            if (playerLevelUp && playerLevelUp.isAnimEnd() == true) {
                                playerLevelUp.close();
                            }
                        }
                    }
                    TutorialStepHelper.simulateGuide(tipLayer, null, clickFunc, stepData);
                }
            }
        }
        var stepData3 = TutorialStepHelper.createFuncStep(doBattleOver);
        var stepData4 = TutorialStepHelper.createFuncStep(doLevelUp);
        stepList.push(stepData1);
        if (needReplaceScene == true) {
            stepList.push(stepData2);
        }
        stepList.push(stepData3);
        stepList.push(stepData4);
        return stepList;
    };
    export let addFightSummnyStep = function (stepData, tipLayer) {
        var stageObj = stepData.owner;
        var isLevelUp = G_UserData.getBase().isLevelUp()[0];
        var stepData1 = TutorialStepHelper.createReplaceBattlePopStep();
        stageObj.addStepToBottom(stepData1);
        if (isLevelUp == true) {
            // var stepData3 = TutorialStepHelper.createEmptyStep(stageObj);
            var stepData3 = TutorialStepHelper.createEmptyStep();
            stageObj.addStepToBottom(stepData3);
        }
    };
    export let simulateEmptyClick = function (stepTable, stepData, tipLayer) {
        var simulate = false;
        if (stepTable.simulate) {
            simulate = stepTable.simulate;
        }
        var callBack = stepTable.clickfunc;
        if (simulate) {
            TutorialStepHelper.simulateGuide(tipLayer, null, callBack);
            return;
        }
    };
    export let commonClickFunc = function (stepTable, stepData, tipLayer: TutorialTipLayer) {
        var simulate = false;
        if (stepTable.simulate) {
            simulate = stepTable.simulate;
        }
        var nodeName = stepTable.btnName || '';
        if ((nodeName == '' || nodeName == null) && stepTable.findfunc == null) {
            TutorialStepHelper.simulateEmptyClick(stepTable, stepData, tipLayer);
            return;
        }
        function commonFindFunc(nodeName) {
            var target = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, nodeName);
            return target.getBoundingBoxToWorld();
        }
        var boxRect = null;
        if (stepTable.findfunc) {
            boxRect = stepTable.findfunc();
        } else {
            boxRect = commonFindFunc(nodeName);
        }
        if (boxRect) {
            var callBack = stepTable.clickfunc;
            // var nodePos = tipLayer.node.convertToNodeSpaceAR(cc.v2(boxRect.x, boxRect.y));
            // boxRect.x = nodePos.x;
            // boxRect.y = nodePos.y;
            TutorialStepHelper.showGuideFinger(stepData, tipLayer, boxRect, null, simulate, callBack);
        }
        TutorialStepHelper.showGuideTip(stepData.cfg, tipLayer);
        var bindfunc = stepTable.bindfunc;
        if (bindfunc) {
            bindfunc(stepData);
        }
    };
    export let simulateGuide = function (tipLayer: TutorialTipLayer, rect: cc.Rect, callback, stepData?) {
        var designSize = G_ResolutionManager.getDesignCCSize();
        rect = rect || cc.rect(0, 0, designSize.width, designSize.height
        );
        console.log("TutorialStepHelper.simulateGuide", rect.toString());
        function onTouchEvent(sender: cc.Event.EventTouch) {
            var endPosition = sender.getLocation();
            // var nodePos = tipLayer.node.convertToNodeSpaceAR(endPosition);
            var nodePos = endPosition;
            if (rect.contains(cc.v2(nodePos.x, nodePos.y))) {
                if (callback != null && typeof (callback) == 'function') {
                    callback(sender, stepData);
                }
            }
        }
        var layer = new cc.Node("simulateGuideLayer");
        layer.setAnchorPoint(cc.v2(0.5, 0.5));
        layer.setContentSize(cc.size(designSize.width, designSize.height));
        layer.setPosition(0, 0);
        layer.on(cc.Node.EventType.TOUCH_END, onTouchEvent);
        tipLayer.node.addChild(layer);
    };
    export let showGuideTip = function (info, tipLayer: TutorialTipLayer) {
        var info = info;
        if (info.comment.length > 0) {
            cc.resources.load(Path.getPrefab('TutorialTipContentNode', 'tutorial'), cc.Prefab, (err, res: cc.Prefab) => {
                if (err != null || res == null || !tipLayer.node || !tipLayer.node.isValid) {
                    return;
                }
                var dialogue = cc.instantiate(res).getComponent(TutorialTipContentNode);
                var nodeRight = Util.getSubNodeByName(dialogue.node, 'Node_root_fight');
                var nodeLeft = Util.getSubNodeByName(dialogue.node, 'Node_root_left');
                var nodeRoot = nodeLeft;
                nodeRight.active = (false);
                nodeLeft.active = (false);
                var midPoint = G_ResolutionManager.getDesignCCPoint();
                if (info.image == 1) {
                    nodeRoot = nodeRight;
                }
                nodeRoot.active = (true);
                tipLayer.node.addChild(dialogue.node);
                var position = cc.v2(0, 0);
                // dialogue.node.setPosition(info.positionX + midPoint.x, info.positionY);
                dialogue.node.setPosition(info.positionX, info.positionY - midPoint.y);
                var wordLabel = nodeRoot.getChildByName("Text_words").getComponent(cc.Label);
                wordLabel.node.active = false;
                var richText = TutorialStepHelper._parseTutorialTip(info.comment, wordLabel.fontSize,
                    wordLabel.node.color, wordLabel.node.getContentSize());
                wordLabel.node.parent.addChild(richText);
                richText.setAnchorPoint(cc.v2(0, 0.5));
                richText.setPosition(wordLabel.node.getPosition());
            });
        }
    };
    export let showGuideFinger = function (stepData, tipLayer: TutorialTipLayer, boxRect, offset, simulate, callback) {
        var rect = boxRect || cc.rect(0, 0, 0, 0);
        var info = stepData.cfg;
        if (offset) {
            rect.x = rect.x + offset.x / 2 + (offset.cx || 0);
            rect.y = rect.y + offset.y / 2 + (offset.cy || 0);
            rect.width = rect.width - offset.x;
            rect.height = rect.height - offset.y;
        }
        if (!simulate) {
            tipLayer.setTouchRect(cc.rect(rect.x, rect.y, rect.width, rect.height));
        }
        var nodePos = tipLayer.node.convertToNodeSpaceAR(cc.v2(rect.x, rect.y));
        var posX = nodePos.x + rect.width / 2;
        let posY = nodePos.y + rect.height / 2;
        var fingerOffsetX = info.x;
        let fingerOffsetY = info.y;
        console.log("showGuideFinger:", posX, posY, fingerOffsetX, fingerOffsetY);
        var targetPosition = cc.v2(posX + fingerOffsetX, posY + fingerOffsetY);
        tipLayer.showHighLightClick(targetPosition, info);
        var effectNode = G_EffectGfxMgr.createPlayGfx(tipLayer.node, 'effect_finger').node;
        effectNode.setPosition(targetPosition);
        if (info.finger > 0) {
            effectNode.angle = -(info.finger);
        }
        if (info.voice != '') {
            G_AudioManager.playSound(Path.getTutorialVoice(info.voice));
        }
        if (simulate) {
            TutorialStepHelper.simulateGuide(tipLayer, rect, callback, stepData);
        }
    };
    export let _parseTutorialTip = function (tip, fontSize, fontColor, contentSize) {
        var contents = TextHelper.parseConfigText(tip);
        var richTextContents = [];
        for (var i = 0; i < contents.length; i++) {
            var content = contents[i];
            richTextContents.push({
                type: 'text',
                msg: content.content,
                color: Colors.colorToNumber(content.isKeyWord && cc.color(255, 255, 0) || fontColor),
                fontSize: fontSize,
                opacity: 255
            });
        }
        var richText = RichTextExtend.createWithContent(richTextContents);
        richText.node.setAnchorPoint(cc.v2(0, 0.5));
        richText.node.name = "richText";
        if (contentSize) {
            richText.maxWidth = contentSize.width;
        }
        // richText.formatText();
        var virtualContentSize = richText.node.getContentSize();
        var node = new cc.Node();
        node.setAnchorPoint(cc.v2(0.5, 0.5));
        // node.setCascadeOpacityEnabled(true);
        node.addChild(richText.node);
        node.setContentSize(virtualContentSize);
        // richText.node.setPosition(virtualContentSize.width / 2, virtualContentSize.height / 2);
        richText.node.setPosition(0, 0);
        return node;
    };
    export let findBackButton = function () {
        var sceneNode = G_SceneManager.getRunningScene();
        var target = Util.getSubNodeByName(sceneNode.node, '_topNode');
        if (target == null) {
            target = Util.getSubNodeByName(sceneNode.node, '_topbarBase');
        }
        if (target == null) {
            target = Util.getSubNodeByName(sceneNode.node, '_topBar');
        }
        var btnWidget1 = Util.getSubNodeByName(target, 'btnBack');
        var btnWidget2 = Util.getSubNodeByName(btnWidget1, 'Button');
        return btnWidget2.getBoundingBoxToWorld();
    };
    export let buildStageTable = function (stageName) {
        function findStageNode(nodeName) {
            var targetNode = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, nodeName);
            if (targetNode != null) {
                let target = targetNode.getComponent(StageNode);
                if (target && target.getPanelTouch()) {
                    var touchWidget = target.getPanelTouch();
                    return touchWidget.getBoundingBoxToWorld();
                }
            }
            return null;
        }
        function clickStageNode(nodeName) {
            var target = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'StageView');
            var stageNode = Util.getSubNodeByName(target, nodeName).getComponent(StageNode);
            stageNode.showStageDetail();
            G_TutorialManager.clearTipLayer();
        }
        var stageTable = {
            btnName: stageName,
            simulate: true,
            findfunc: function (nodeName) {
                return findStageNode(stageName);
            },
            clickfunc: function () {
                clickStageNode(stageName);
            }
        };
        return stageTable;
    };
    export let buildFightSummnyTable = function () {
        var scritpTable = {
            func: function (stepData, tipLayer) {
                var stageObj = stepData.owner;
                var isLevelUp = G_UserData.getBase().isLevelUp()[0];
                var stepData1 = TutorialStepHelper.createReplaceBattlePopStep();
                stageObj.addStepToBottom(stepData1);
                if (isLevelUp == true) {
                    // var stepData3 = TutorialStepHelper.createEmptyStep(stageObj);
                    var stepData3 = TutorialStepHelper.createEmptyStep();
                    stageObj.addStepToBottom(stepData3);
                }
                TutorialStepHelper.addFightSummnyStep(stepData, tipLayer);
            }
        };
        return scritpTable;
    };
    export let buildPopupGetRewardsTable = function () {
        var tempTable = {
            func: function (stepData, tipLayer) {
                function onClickPanel(sender, stepData) {
                    let popupGetRewardsNode = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'PopupGetRewards');
                    if (popupGetRewardsNode != null) {
                        let popupGetRewards = popupGetRewardsNode.getComponent(PopupGetRewards);
                        if (popupGetRewards && popupGetRewards.isAnimEnd()) {
                            popupGetRewards.close();
                            stepData.doNextStep();
                        }
                    }

                }
                TutorialStepHelper.simulateGuide(tipLayer, null, onClickPanel, stepData);
            }
        };
        return tempTable;
    };
    export let buildPopupComboGiftTable = function () {
        var tempTable = {
            func: function (stepData, tipLayer) {
                function goToMainScene() {
                    G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, 'PopupComboHeroGift');
                }
                var showFuncId = stepData.cfg.type_param1;
                G_SceneManager.openPopup(Path.getCommonPrefab("PopupComboHeroGift"), (popupComboHeroGift: PopupComboHeroGift) => {
                    popupComboHeroGift.init(goToMainScene);
                    popupComboHeroGift.open();
                });
            }
        };
        return tempTable;
    };
    export let buildPopupBoxRewardTable = function (msgId) {
        var tempTable = {
            simulate: true,
            findfunc: function (nodeName) {
                var target = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_btnOk');
                var btnWidget2 = Util.getSubNodeByName(target, 'Button');
                return btnWidget2.getBoundingBoxToWorld();
            },
            clickfunc: function (sender, stepData) {
                var popupBoxReward = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'PopupBoxReward').getComponent(PopupBoxReward);
                popupBoxReward.onBtnOk();
                G_TutorialManager.clearTipLayer();
                G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, 'PopupBoxReward close');
            },
            bindfunc: function (stepData) {
                var stageObj = stepData.owner;
                if (stageObj) {
                    msgId = msgId || MessageIDConst.ID_C2S_ReceiveStageBox;
                    stageObj.bindProtoMsg(msgId);
                }
            }
        };
        return tempTable;
    };
    export let buildFamousFightTable = function () {
        var stageFightTable = {
            simulate: true,
            bindfunc: function (stepData) {
                var stageObj = stepData.owner;
                if (stageObj) {
                    stageObj.bindProtoMsg(MessageIDConst.ID_C2S_ExecuteStage);
                }
            },
            findfunc: function (nodeName) {
                var target = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_btnFight');
                return target.getBoundingBoxToWorld();
            },
            clickfunc: function (sender, stepData) {
                var popupFamousDetail = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'PopupFamousDetail').getComponent(PopupFamousDetail);
                popupFamousDetail._onFightClick();
            }
        };
        return stageFightTable;
    };
    export let buildStageFightTable = function () {
        var stageFightTable = {
            simulate: true,
            bindfunc: function (stepData) {
                var stageObj = stepData.owner;
                if (stageObj) {
                    stageObj.bindProtoMsg(MessageIDConst.ID_C2S_ExecuteStage);
                }
            },
            findfunc: function (nodeName) {
                var target = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_btnFight');
                return target.getBoundingBoxToWorld();
            },
            clickfunc: function (sender, stepData) {
                var popupStageDetail = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'PopupStageDetail').getComponent(PopupStageDetail);
                popupStageDetail.onFightClick();
                G_TutorialManager.clearTipLayer();
            }
        };
        return stageFightTable;
    };
    export let buildNewFunctionSceneTable = function () {
        var table = {
            func: function (stepData) {
                var runningScene = G_SceneManager.getRunningScene();
                if (runningScene.getName() == 'login') {
                    G_SceneManager.popToRootAndReplaceScene('main');
                } else {
                    stepData.doNextStep();
                }
            }
        };
        return table;
    };
    export let buildNewFunctionBtnTable = function () {
        var table = {
            simulate: true,
            findfunc: function (nodeName) {
                var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_commonBtn');
                return root.getBoundingBoxToWorld();
            },
            clickfunc: function (sender, stepData) {
                var popupNewFunction = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'PopupNewFunction').getComponent(PopupNewFunction);
                popupNewFunction.close();
                G_TutorialManager.clearTipLayer();
                var runningScene = G_SceneManager.getRunningScene();
                if (runningScene.getName() == 'main') {
                    stepData.doNextStep();
                } else {
                    G_SceneManager.popToRootAndReplaceScene('main');
                }
            }
        };
        return table;
    };
    export let buildNewFunctionDlgTable = function (funcId) {
        var tempTable1 = {
            func: function (stepData, tipLayer) {
                var showFuncId = stepData.cfg.type_param1;
                G_SceneManager.openPopup(Path.getCommonPrefab("PopupNewFunction"), (popupNewFunction: PopupNewFunction) => {
                    popupNewFunction.init(funcId);
                    popupNewFunction.open();
                });
                stepData.doNextStep();
            }
        };
        return tempTable1;
    };
    export let buildEquipUpTable = function (useBindFinc) {
        var tempTable: any = {
            simulate: true,
            findfunc: function () {
                var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'EquipTrainStrengthenLayer');
                var clickWidget = Util.getSubNodeByName(root, '_buttonStrengFive');
                return clickWidget.getBoundingBoxToWorld();
            },
            clickfunc: function () {
                var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'EquipTrainStrengthenLayer').getComponent(EquipTrainStrengthenLayer);
                root._onButtonStrengFiveClicked();
                G_TutorialManager.clearTipLayer();
            }
        };
        if (useBindFinc == true) {
            tempTable.bindfunc = function (stepData) {
                var stageObj = stepData.owner;
                if (stageObj) {
                    stageObj.bindProtoMsg(MessageIDConst.ID_C2S_UpgradeEquipment);
                }
            };
        }
        return tempTable;
    };
    export let buildTreasureUpTable = function (useBindFinc) {
        var tempTable: any = {
            simulate: true,
            findfunc: function () {
                var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'TreasureTrainStrengthenLayer');
                var clickWidget = Util.getSubNodeByName(root, '_buttonStrengthenFive');
                return clickWidget.getBoundingBoxToWorld();
            },
            clickfunc: function () {
                var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'TreasureTrainStrengthenLayer').getComponent(TreasureTrainStrengthenLayer);
                root._onButtonStrengthenFiveClicked();
                G_TutorialManager.clearTipLayer();
            }
        };
        if (useBindFinc == true) {
            tempTable.bindfunc = function (stepData) {
                var stageObj = stepData.owner;
                if (stageObj) {
                    stageObj.bindProtoMsg(MessageIDConst.ID_C2S_UpgradeTreasure);
                }
            };
        }
        return tempTable;
    };
    export let buildChallengeCellTable = function (funcId) {
        var tempTable = {
            simulate: true,
            findfunc: function () {
                var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'ChallengeCell_' + funcId);
                var clickWidget = Util.getSubNodeByName(root, '_panelBase');
                return clickWidget.getBoundingBoxToWorld();
            },
            clickfunc: function () {
                var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'ChallengeCell_' + funcId).getComponent(ChallengeCell);
                G_TutorialManager.clearTipLayer();
                return root.goToScene();
            }
        };
        return tempTable;
    };
    export let buildShopItemBuyTable = function () {
        var tempTable = {
            simulate: true,
            findfunc: function () {
                var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'ShopFixView').getComponent(ShopFixView);
                var shopItemCell = root.findCellItem(1, 1);
                var btnOk = Util.getSubNodeByName(shopItemCell, 'Button_ok');
                return btnOk.getBoundingBoxToWorld();
            },
            clickfunc: function (sender, stepData) {
                var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'ShopFixView').getComponent(ShopFixView);
                root._onItemTouch(0, 1);
            },
            bindfunc: function (stepData) {
                var stageObj = stepData.owner;
                if (stageObj) {
                    stageObj.bindProtoMsg(MessageIDConst.ID_C2S_BuyShopGoods);
                }
            }
        };
        return tempTable;
    };
    export let buildMainIconGoTable = function (btnName, wayFuncId) {
        var tempTable = {
            simulate: true,
            findfunc: function (nodeName) {
                var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, btnName);
                let uiGuideNode = root.getChildByName("UIGuideNode");
                if (uiGuideNode != null) {
                    uiGuideNode.active = false;
                }
                let rect = root.getBoundingBoxToWorld();
                if (uiGuideNode != null) {
                    uiGuideNode.active = true;
                }
                return rect;
            },
            clickfunc: function (sender, stepData) {
                WayFuncDataHelper.gotoModuleByFuncId(wayFuncId);
                G_TutorialManager.clearTipLayer();
            }
        };
        return tempTable;
    };
    export let buildPopupChooseTable = function (popupName, bindMsgId) {
        var tempTable = {
            simulate: true,
            findfunc: function (nodeName) {
                var chooseHero = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, popupName);
                var listView = Util.getSubNodeByName(chooseHero, '_listView').getComponent(cc.ScrollView);
                var itemList = listView.content.children;
                var cellWidget = itemList[0];
                var clickWidget = Util.getSubNodeByName(cellWidget, '_buttonChoose1');
                return clickWidget.getBoundingBoxToWorld();
            },
            clickfunc: function (sender, stepData) {
                var chooseHero = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, popupName);
                var listView = Util.getSubNodeByName(chooseHero, '_listView').getComponent(cc.ScrollView);
                var itemList = listView.content.children;
                var cellWidget = itemList[0].getComponent(PopupChooseCellBase);
                cellWidget.onButtonClicked();
                stepData.doNextStep();
            },
            bindfunc: function (stepData) {
                var stageObj = stepData.owner;
                if (stageObj) {
                    stageObj.bindProtoMsg(bindMsgId);
                }
            }
        };
        return tempTable;
    };
    export let buildCloseDlgTable = function (dlgName) {
        var tempTable = {
            simulate: true,
            findfunc: function () {
                var dlgObj = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, dlgName);
                var clickWidget = Util.getSubNodeByName(dlgObj, 'Button_close');
                return clickWidget.getBoundingBoxToWorld();
            },
            clickfunc: function (sender, stepData) {
                var dlgObj = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, dlgName).getComponent(PopupBase);
                dlgObj.close();
                stepData.doNextStep();
            }
        };
        return tempTable;
    };
}