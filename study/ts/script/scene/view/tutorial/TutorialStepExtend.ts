import { G_SceneManager, G_UserData, G_TutorialManager, G_SignalManager, G_RoleListManager, G_ServerListManager, G_ConfigLoader, G_GameAgent, G_NativeAgent, G_ServerTime } from "../../../init";
import { MessageIDConst } from "../../../const/MessageIDConst";
import { FunctionConst } from "../../../const/FunctionConst";
import { Util } from "../../../utils/Util";
import DrawCardView from "../drawCard/DrawCardView";
import CommonMainHeroNode from "../../../ui/component/CommonMainHeroNode";
import PopupChooseHeroCell from "../../../ui/popup/PopupChooseHeroCell";
import ChapterCity from "../chapter/ChapterCity";
import StageView from "../stage/StageView";
import TeamView from "../team/TeamView";
import HeroDetailAttrModule from "../heroDetail/HeroDetailAttrModule";
import HeroTrainUpgradeLayer from "../heroTrain/HeroTrainUpgradeLayer";
import { SignalConst } from "../../../const/SignalConst";
import HeroTrainBreakLayer from "../heroTrain/HeroTrainBreakLayer";
import EquipDetailStrengthenNode from "../equipmentDetail/EquipDetailStrengthenNode";
import PackageItemCell from "../package/PackageItemCell";
import ArenaScrollNode from "../arena/ArenaScrollNode";
import ShopFixView from "../shop/ShopFixView";
import ExploreMainView from "../exploreMain/ExploreMainView";
import ExploreMapView from "../exploreMap/ExploreMapView";
import { ExploreConst } from "../../../const/ExploreConst";
import ExploreMapViewEventIcon from "../exploreMap/ExploreMapViewEventIcon";
import EventAnswerNode from "../exploreMap/EventAnswerNode";
import TreasureDetailStrengthenNode from "../treasureDetail/TreasureDetailStrengthenNode";
import PopupOfficialRankUp from "../official/PopupOfficialRankUp";
import DailyCity from "../dailyChallenge/DailyCity";
import PopupDailyChooseCell from "../dailyChallenge/PopupDailyChooseCell";
import TowerAvatarNode from "../tower/TowerAvatarNode";
import PopupTowerChoose from "../tower/PopupTowerChoose";
import ChapterView from "../chapter/ChapterView";
import RecoveryHeroLayer from "../recovery/RecoveryHeroLayer";
import PopupRecoveryPreview from "../recovery/PopupRecoveryPreview";
import { RecoveryConst } from "../../../const/RecoveryConst";
import PopupSiegeCome from "../stage/PopupSiegeCome";
import SilkbagListCell from "../silkbag/SilkbagListCell";
import PopupChoosePetCell from "../../../ui/popup/PopupChoosePetCell";
import PopupHomelandMainUp from "../homeland/PopupHomelandMainUp";
import HomelandMainNode from "../homeland/HomelandMainNode";
import { TutorialStepHelper } from "./TutorialStepHelper";
import RecoveryView from "../recovery/RecoveryView";
import SiegeView from "../siege/SiegeView";
import SiegeChallengeBtns from "../siege/SiegeChallengeBtns";
import TeamHeroNode from "../team/TeamHeroNode";
import CommonPetMainAvatar from "../../../ui/component/CommonPetMainAvatar";
import { ShopConst } from "../../../const/ShopConst";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { config } from "../../../config";

export default class TutorialStepExtend {
    public step101 = {
        func: function () {
            console.log('---step 01----')
            if (G_NativeAgent.invitorUserId != 0 && G_RoleListManager.isNewPlayer() && G_ServerTime.getTime() < G_UserData.getShareReward().getActivityEndTime() && !config.remoteCfg.hideWxShare) {
                console.log('---send invite----')
                G_UserData.getShareReward().c2sReportInviteInfo();
            }
            G_SceneManager.popToRootAndReplaceScene('stage', 1);
        }
    };
    public step102 = {};
    public step103 = {
        func: function (stepData) {
            var stageObj = stepData.owner;
            if (stageObj) {
                stageObj.bindProtoMsg(MessageIDConst.ID_C2S_ExecuteStage);
            }
            G_UserData.getStage().c2sExecuteStage(100101);
        }
    };
    public step104 = TutorialStepHelper.buildFightSummnyTable();
    public step201 = TutorialStepHelper.buildNewFunctionSceneTable();
    public step202 = TutorialStepHelper.buildNewFunctionDlgTable(FunctionConst.FUNC_DRAW_HERO);
    public step203 = TutorialStepHelper.buildNewFunctionBtnTable();
    public step204 = {};
    public step205 = {};
    public step206 = TutorialStepHelper.buildMainIconGoTable('commonMain' + FunctionConst.FUNC_DRAW_HERO, FunctionConst.FUNC_DRAW_HERO);
    public step207 = {
        enterName: 'DrawCardView',
        simulate: true,
        findfunc: function (nodeName) {
            var target = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_cashCell');
            var btnWidget = Util.getSubNodeByName(target, 'BtnDraw');
            return btnWidget.getBoundingBoxToWorld();
        },
        clickfunc: function () {
            var target = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'DrawCardView').getComponent(DrawCardView);
            target.onGoldClick();
            G_TutorialManager.clearTipLayer();
        },
        bindfunc: function (stepData) {
            var stageObj = stepData.owner;
            if (stageObj) {
                stageObj.bindProtoMsg(MessageIDConst.ID_C2S_RecruitGoldOne);
            }
        }
    };
    public step208 = {};
    public step209 = {
        simulate: true,
        findfunc: function (nodeName) {
            return TutorialStepHelper.findBackButton();
        },
        clickfunc: function (sender, stepData) {
            G_SceneManager.popScene();
        }
    };
    public step301 = {
        func: function () {
            G_SceneManager.popToRootAndReplaceScene('main');
        }
    };
    public step302 = {
        simulate: true,
        findfunc: function (nodeName) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_heroAvatar3');
            var clickWidget = Util.getSubNodeByName(root, 'Panel_click');
            return clickWidget.getBoundingBoxToWorld();
        },
        clickfunc: function () {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_heroAvatar3').getComponent(CommonMainHeroNode);
            root.onClickCallBack();
            G_TutorialManager.clearTipLayer();
        }
    };
    public step303 = {
        simulate: true,
        findfunc: function () {
            var chooseHero = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'PopupChooseHero');
            var listView = Util.getSubNodeByName(chooseHero, '_listView').getComponent(cc.ScrollView);
            var cellWidget = listView.content.children[0];
            var clickWidget = Util.getSubNodeByName(cellWidget, '_buttonChoose1');
            return clickWidget.getBoundingBoxToWorld();
        },
        clickfunc: function (sender, stepData) {
            var chooseHero = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'PopupChooseHero');
            var listView = Util.getSubNodeByName(chooseHero, '_listView').getComponent(cc.ScrollView);
            var itemList = listView.content.children;
            var cellWidget = itemList[0].getComponent(PopupChooseHeroCell);
            cellWidget.onButtonClicked();
            stepData.doNextStep();
        },
        bindfunc: function (stepData) {
            var stageObj = stepData.owner;
            if (stageObj) {
                stageObj.bindProtoMsg(MessageIDConst.ID_C2S_ChangeHeroFormation);
            }
        }
    };
    public step304 = { simulate: true };
    public step305 = {};
    public step306 = {
        simulate: true,
        findfunc: function (nodeName) {
            return TutorialStepHelper.findBackButton();
        },
        clickfunc: function (sender, stepData) {
            stepData.doNextStep();
        }
    };
    public step401 = {
        func: function () {
            G_SceneManager.popToRootAndReplaceScene('main');
        }
    };
    public step402 = TutorialStepHelper.buildMainIconGoTable('_btnMainFight', FunctionConst.FUNC_NEW_STAGE);
    public step403 = {
        simulate: true,
        findfunc: function (nodeName) {
            var target = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'ChapterCity1');
            var btnWidget1 = Util.getSubNodeByName(target, '_btnCity');
            return btnWidget1.getBoundingBoxToWorld();
        },
        clickfunc: function (sender, stepData) {
            var target = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'ChapterCity1').getComponent(ChapterCity);
            target.goToStage();
            G_TutorialManager.clearTipLayer();
        }
    };
    public step404 = TutorialStepHelper.buildStageTable('stageId_100102');
    public step405 = TutorialStepHelper.buildStageFightTable();
    public step406 = TutorialStepHelper.buildFightSummnyTable();
    public step501 = {
        func: function () {
            G_SceneManager.popToRootAndReplaceScene('stage', 1);
        }
    };
    public step502 = {};
    public step503 = {
        simulate: true,
        findfunc: function (nodeName) {
            var target = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'ImageBox_100102');
            return target.getBoundingBoxToWorld();
        },
        clickfunc: function (sender, stepData) {
            var target = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'ImageBox_100102');
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'StageView').getComponent(StageView);
            root.setBoxTouch(100102);
            G_TutorialManager.clearTipLayer();
        }
    };
    public step504 = TutorialStepHelper.buildPopupBoxRewardTable(MessageIDConst.ID_C2S_ReceiveStageBox);
    public step505 = TutorialStepHelper.buildPopupGetRewardsTable();
    public step506 = {};
    public step507 = {
        simulate: true,
        findfunc: function (nodeName) {
            return TutorialStepHelper.findBackButton();
        },
        clickfunc: function (sender, stepData) {
            stepData.doNextStep();
        }
    };
    public step601 = {
        func: function () {
            G_SceneManager.popToRootAndReplaceScene('main');
        }
    };
    public step602 = {
        simulate: true,
        findfunc: function (nodeName) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_heroAvatar3');
            var clickWidget = Util.getSubNodeByName(root, 'Panel_click');
            return clickWidget.getBoundingBoxToWorld();
        },
        clickfunc: function () {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_heroAvatar3').getComponent(CommonMainHeroNode);
            root.onClickCallBack();
            G_TutorialManager.clearTipLayer();
        }
    };
    public step603 = {
        simulate: true,
        findfunc: function (nodeName) {
            var [root, teamPageItem] = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'TeamView').getComponent(TeamView).getCurHeroSpine();
            var clickWidget = Util.getSubNodeByName(root.node, 'Panel_click');
            return clickWidget.getBoundingBoxToWorld();
        },
        clickfunc: function (sender, stepData) {
            var [root, teamPageItem] = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'TeamView').getComponent(TeamView).getCurHeroSpine();
            teamPageItem._onClickAvatar();
            G_TutorialManager.clearTipLayer();
        }
    };
    public step604 = {
        simulate: true,
        findfunc: function (nodeName) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'HeroDetailAttrModule');
            var clickWidget = Util.getSubNodeByName(root, '_buttonUpgrade');
            return clickWidget.getBoundingBoxToWorld();
        },
        clickfunc: function (sender, stepData) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'HeroDetailAttrModule').getComponent(HeroDetailAttrModule);
            root.onButtonUpgradeClicked();
            G_TutorialManager.clearTipLayer();
        }
    };
    public step605 = {
        simulate: true,
        findfunc: function (nodeName) {
            var clickWidget = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_buttonUpgradeFive');
            return clickWidget.getBoundingBoxToWorld();
        },
        clickfunc: function () {
            var upgradeLayer = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'HeroTrainUpgradeLayer').getComponent(HeroTrainUpgradeLayer);
            upgradeLayer.onButtonUpgradeFiveClicked();
            G_TutorialManager.clearTipLayer();
        },
        bindfunc: function (stepData) {
            var stageObj = stepData.owner;
            if (stageObj) {
                stageObj.bindProtoMsg(MessageIDConst.ID_C2S_HeroLevelUp);
            }
        }
    };
    public step606 = {};
    public step607 = {
        simulate: true,
        findfunc: function (nodeName) {
            return TutorialStepHelper.findBackButton();
        },
        clickfunc: function (sender, stepData) {
            G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP);
        }
    };
    public step701 = {
        func: function () {
            G_SceneManager.popToRootAndReplaceScene('main');
        }
    };
    public step702 = TutorialStepHelper.buildMainIconGoTable('_btnMainFight', FunctionConst.FUNC_TUTORIAL_JUMP_PVE);
    public step703 = {
        func: function () {
            G_SceneManager.popToRootAndReplaceScene('stage', 1);
        }
    };
    public step704 = TutorialStepHelper.buildStageTable('stageId_100103');
    public step705 = TutorialStepHelper.buildStageFightTable();
    public step706 = TutorialStepHelper.buildFightSummnyTable();
    public step801 = {
        func: function () {
            G_SceneManager.popToRootAndReplaceScene('stage', 1);
        }
    };
    public step802 = {};
    public step803 = {
        simulate: true,
        findfunc: function (nodeName) {
            var target = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_btnStarBox2');
            return target.getBoundingBoxToWorld();
        },
        clickfunc: function (sender, stepData) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'StageView').getComponent(StageView);
            root.onBox2Touch();
            G_TutorialManager.clearTipLayer();
        }
    };
    public step804 = TutorialStepHelper.buildPopupBoxRewardTable(MessageIDConst.ID_C2S_FinishChapterBoxRwd);
    public step805 = TutorialStepHelper.buildPopupGetRewardsTable();
    public step806 = {};
    public step807 = {
        simulate: true,
        findfunc: function (nodeName) {
            return TutorialStepHelper.findBackButton();
        },
        clickfunc: function (sender, stepData) {
            G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP);
        }
    };
    public step901 = {
        func: function () {
            G_SceneManager.popToRootAndReplaceScene('main');
        }
    };
    public step902 = {
        simulate: true,
        findfunc: function (nodeName) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_heroAvatar1');
            var clickWidget = Util.getSubNodeByName(root, 'Panel_click');
            return clickWidget.getBoundingBoxToWorld();
        },
        clickfunc: function () {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_heroAvatar1').getComponent(CommonMainHeroNode);
            root.onClickCallBack();
            G_TutorialManager.clearTipLayer();
        }
    };
    public step903 = {
        simulate: true,
        findfunc: function (nodeName) {
            var [root, teamPageItem] = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'TeamView').getComponent(TeamView).getCurHeroSpine();
            var clickWidget = Util.getSubNodeByName(root.node, 'Panel_click');
            return clickWidget.getBoundingBoxToWorld();
        },
        clickfunc: function (sender, stepData) {
            var [root, teamPageItem] = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'TeamView').getComponent(TeamView).getCurHeroSpine();
            teamPageItem._onClickAvatar();
            G_TutorialManager.clearTipLayer();
        }
    };
    public step904 = {
        simulate: true,
        findfunc: function (nodeName) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_buttonBreak');
            return root.getBoundingBoxToWorld();
        },
        clickfunc: function (sender, stepData) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'HeroDetailAttrModule').getComponent(HeroDetailAttrModule);
            root.onButtonBreakClicked();
            G_TutorialManager.clearTipLayer();
        }
    };
    public step905 = {
        simulate: true,
        findfunc: function (nodeName) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_buttonBreak');
            return root.getBoundingBoxToWorld();
        },
        clickfunc: function (sender, stepData) {
            var upgradeLayer = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'HeroTrainBreakLayer').getComponent(HeroTrainBreakLayer);
            upgradeLayer.onButtonBreakClicked();
            G_TutorialManager.clearTipLayer();
        },
        bindfunc: function (stepData) {
            var stageObj = stepData.owner;
            if (stageObj) {
                stageObj.bindProtoMsg(MessageIDConst.ID_C2S_HeroRankUp);
            }
        }
    };
    public step906 = {};
    public step907 = {
        simulate: true,
        findfunc: function (nodeName) {
            return TutorialStepHelper.findBackButton();
        },
        clickfunc: function (sender, stepData) {
            G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP);
        }
    };
    public step1001 = {
        func: function () {
            G_SceneManager.popToRootAndReplaceScene('main');
        }
    };
    public step1002 = TutorialStepHelper.buildMainIconGoTable('_btnMainFight', FunctionConst.FUNC_TUTORIAL_JUMP_PVE);
    public step1003 = {
        func: function () {
            G_SceneManager.popToRootAndReplaceScene('stage', 1);
        }
    };
    public step1004 = TutorialStepHelper.buildStageTable('stageId_100104');
    public step1005 = TutorialStepHelper.buildStageFightTable();
    public step1006 = TutorialStepHelper.buildFightSummnyTable();
    public step1101 = {
        func: function () {
            G_SceneManager.popToRootAndReplaceScene('stage', 1);
        }
    };
    public step1102 = TutorialStepHelper.buildStageTable('stageId_100105');
    public step1103 = TutorialStepHelper.buildStageFightTable();
    public step1104 = TutorialStepHelper.buildFightSummnyTable();
    public step1105 = {};
    public step1106 = {};
    public step1201 = {
        func: function () {
            G_SceneManager.popToRootAndReplaceScene('stage', 1);
        }
    };
    public step1203 = {
        simulate: true,
        findfunc: function (nodeName) {
            return TutorialStepHelper.findBackButton();
        },
        clickfunc: function () {
            // var scene = G_SceneManager.showScene('chapter');
            G_SceneManager.popToRootScene();
            G_SceneManager.replaceScene('chapter');
        }
    };
    public step1204 = {
        simulate: true,
        findfunc: function (nodeName) {
            var target = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'ChapterCity2');
            var btnWidget1 = Util.getSubNodeByName(target, '_btnCity');
            return btnWidget1.getBoundingBoxToWorld();
        },
        clickfunc: function () {
            var target = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'ChapterCity2').getComponent(ChapterCity);
            target.goToStage();
            G_TutorialManager.clearTipLayer();
        }
    };
    public step1205 = {};
    public step1206 = TutorialStepHelper.buildStageTable('stageId_100201');


    public step1302 = TutorialStepHelper.buildNewFunctionSceneTable();
    public step1303 = TutorialStepHelper.buildNewFunctionDlgTable(FunctionConst.FUNC_HERO_KARMA);
    public step1304 = TutorialStepHelper.buildNewFunctionBtnTable();
    public step1305 = {};
    public step1306 = {
        simulate: true,
        findfunc: function (nodeName) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_heroAvatar1');
            var clickWidget = Util.getSubNodeByName(root, 'Panel_click');
            return clickWidget.getBoundingBoxToWorld();
        },
        clickfunc: function () {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_heroAvatar1').getComponent(CommonMainHeroNode);
            root.onClickCallBack();
            G_TutorialManager.clearTipLayer();
        }
    };
    public step1307 = {
        simulate: true,
        findfunc: function (nodeName) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_panelKarma');
            return root.getBoundingBoxToWorld();
        },
        clickfunc: function () {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'TeamView').getComponent(TeamView);
            root.getHeroLayer().onKarmaClicked();
        }
    };
    public step1308 = {
        func: function (stepData, tipLayer) {
            G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, 'PopupHeroKarma.step1308');
        }
    };
    public step1309 = {};
    public step1310 = TutorialStepHelper.buildCloseDlgTable('PopupHeroKarma');
    public step1311 = {
        simulate: true,
        findfunc: function () {
            return TutorialStepHelper.findBackButton();
        },
        clickfunc: function () {
            G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP);
        }
    };
    public step1312 = {
        func: function () {
            G_SceneManager.popToRootAndReplaceScene('main');
        }
    };
    public step1313 = TutorialStepHelper.buildMainIconGoTable('_btnMainFight', FunctionConst.FUNC_NEW_STAGE);
    public step1401 = {
        func: function () {
            G_SceneManager.popToRootAndReplaceScene('stage');
        }
    };
    public step1402 = {
        simulate: true,
        findfunc: function (nodeName) {
            var target = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'ImageBox_100205');
            return target.getBoundingBoxToWorld();
        },
        clickfunc: function (sender, stepData) {
            var target = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'ImageBox_100205');
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'StageView').getComponent(StageView);
            root.setBoxTouch(100205);
            G_TutorialManager.clearTipLayer();
        }
    };
    public step1403 = TutorialStepHelper.buildPopupBoxRewardTable(MessageIDConst.ID_C2S_ReceiveStageBox);
    public step1404 = TutorialStepHelper.buildPopupGetRewardsTable();
    public step1405 = {};
    public step1406 = {
        simulate: true,
        findfunc: function () {
            return TutorialStepHelper.findBackButton();
        },
        clickfunc: function () {
            G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP);
        }
    };
    public step1501 = {
        func: function () {
            G_SceneManager.popToRootAndReplaceScene('main');
        }
    };
    public step1502 = {
        simulate: true,
        findfunc: function (nodeName) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_heroAvatar1');
            var clickWidget = Util.getSubNodeByName(root, 'Panel_click');
            return clickWidget.getBoundingBoxToWorld();
        },
        clickfunc: function () {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_heroAvatar1').getComponent(CommonMainHeroNode);
            root.onClickCallBack();
            G_TutorialManager.clearTipLayer();
        }
    };
    public step1503 = {
        simulate: true,
        findfunc: function () {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_fileNodeEquip1');
            var clickWidget = Util.getSubNodeByName(root, 'PanelTouch');
            return clickWidget.getBoundingBoxToWorld();
        },
        clickfunc: function () {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'TeamView').getComponent(TeamView);
            var equipIcon = root.getHeroLayer().getEquipmentIconByIndex(1);
            equipIcon._onPanelTouch();
            G_TutorialManager.clearTipLayer();
        }
    };
    public step1504 = TutorialStepHelper.buildPopupChooseTable('PopupChooseEquip2', MessageIDConst.ID_C2S_AddFightEquipment);
    public step1601 = {
        func: function () {
            var teamViewNode = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'TeamView')
            if (teamViewNode == null) {
                G_SceneManager.popToRootAndReplaceScene('team');
            } else {
            }
        }
    };
    public step1602 = {};
    public step1603 = {
        simulate: true,
        findfunc: function () {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_fileNodeEquip1');
            var clickWidget = Util.getSubNodeByName(root, 'PanelTouch');
            return clickWidget.getBoundingBoxToWorld();
        },
        clickfunc: function () {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'TeamView').getComponent(TeamView);
            var equipIcon = root.getHeroLayer().getEquipmentIconByIndex(1);
            equipIcon._onPanelTouch();
            G_TutorialManager.clearTipLayer();
        }
    };
    public step1604 = {
        simulate: true,
        findfunc: function () {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'EquipDetailStrengthenNode');
            var clickWidget = Util.getSubNodeByName(root, 'ButtonStrengthen');
            return clickWidget.getBoundingBoxToWorld();
        },
        clickfunc: function () {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'EquipDetailStrengthenNode').getComponent(EquipDetailStrengthenNode);
            root._onButtonStrengthenClicked();
            G_TutorialManager.clearTipLayer();
        }
    };
    public step1605 = TutorialStepHelper.buildEquipUpTable(true);
    public step1606 = TutorialStepHelper.buildEquipUpTable(false);
    public step1607 = {};
    public step1608 = {
        simulate: true,
        findfunc: function (nodeName) {
            return TutorialStepHelper.findBackButton();
        },
        clickfunc: function () {
            G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP);
        }
    };
    public step1609 = {
        func: function () {
            G_SceneManager.popToRootAndReplaceScene('main');
        }
    };
    public step1610 = TutorialStepHelper.buildMainIconGoTable('_btnMainFight', FunctionConst.FUNC_NEW_STAGE);
    public step1701 = TutorialStepHelper.buildNewFunctionSceneTable();
    public step1702 = TutorialStepHelper.buildPopupComboGiftTable();
    public step1703 = {
        simulate: true,
        findfunc: function (nodeName) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_commonBtn');
            return root.getBoundingBoxToWorld();
        },
        clickfunc: function () {
            G_SceneManager.popToRootAndReplaceScene('main');
        }
    };
    public step1704 = {};
    public step1705 = TutorialStepHelper.buildMainIconGoTable('commonMain' + FunctionConst.FUNC_ITEM_BAG, FunctionConst.FUNC_ITEM_BAG);
    public step1706 = {
        simulate: true,
        findfunc: function (nodeName) {
            var chooseHero = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'PackageMainView');
            var listView = Util.getSubNodeByName(chooseHero, '_listViewTab1').getComponent(cc.ScrollView);
            var itemList = listView.content.children;
            var cellWidget = itemList[0];
            var clickWidget = Util.getSubNodeByName(cellWidget, '_buttonReplace1');
            return clickWidget.getBoundingBoxToWorld();
        },
        clickfunc: function (sender, stepData) {
            var chooseHero = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'PackageMainView');
            var listView = Util.getSubNodeByName(chooseHero, '_listViewTab1').getComponent(cc.ScrollView);
            var itemList = listView.content.children;
            var cellWidget = itemList[0].getComponent(PackageItemCell);
            var clickWidget = Util.getSubNodeByName(cellWidget.node, '_buttonReplace1');
            var button = Util.getSubNodeByName(clickWidget, 'Button');
            // cellWidget._onBtnClick(button);
            cellWidget._onBtnClick(1);
            G_TutorialManager.clearTipLayer();
            stepData.doNextStep();
        },
        bindfunc: function (stepData) {
            var stageObj = stepData.owner;
            if (stageObj) {
                stageObj.bindProtoMsg(MessageIDConst.ID_C2S_UseItem);
            }
        }
    };
    public step1707 = TutorialStepHelper.buildPopupGetRewardsTable();
    public step1708 = {};
    public step1709 = {
        simulate: true,
        findfunc: function (nodeName) {
            return TutorialStepHelper.findBackButton();
        },
        clickfunc: function () {
            G_SceneManager.popToRootAndReplaceScene('main');
        }
    };
    public step1710 = TutorialStepHelper.buildMainIconGoTable('_btnMainFight', FunctionConst.FUNC_NEW_STAGE);
    public step2201 = TutorialStepHelper.buildNewFunctionSceneTable();
    public step2202 = TutorialStepHelper.buildNewFunctionDlgTable(FunctionConst.FUNC_ARENA);
    public step2203 = TutorialStepHelper.buildNewFunctionBtnTable();
    public step2204 = {};
    public step2205 = {};
    public step2206 = TutorialStepHelper.buildMainIconGoTable('commonMain' + FunctionConst.FUNC_ADVENTURE, FunctionConst.FUNC_ADVENTURE);
    public step2207 = TutorialStepHelper.buildChallengeCellTable(FunctionConst.FUNC_ARENA);
    public step2208 = {
        simulate: true,
        findfunc: function () {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'ArenaScrollNode').getComponent(ArenaScrollNode);
            var heroAvatar = root.getSelfTopNode();
            var clickWidget = Util.getSubNodeByName(heroAvatar.node, 'Panel_click');
            return clickWidget.getBoundingBoxToWorld();
        },
        clickfunc: function (sender, stepData) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'ArenaScrollNode').getComponent(ArenaScrollNode);
            var heroAvatar = root.getSelfTopNode();
            heroAvatar.doCallBackFunc();
        },
        bindfunc: function (stepData) {
            var stageObj = stepData.owner;
            if (stageObj) {
                stageObj.bindProtoMsg(MessageIDConst.ID_C2S_ChallengeArena);
            }
        }
    };
    public step2301 = {
        func: function (stepData) {
            var runningScene = G_SceneManager.getRunningScene();
            if (runningScene.getName() != 'fight' && runningScene.getName() != 'arena') {
                G_SceneManager.popToRootAndReplaceScene('arena');
            }
        }
    };
    public step2302 = {};
    public step2303 = {
        simulate: true,
        findfunc: function () {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'ArenaView');
            var btpShop = Util.getSubNodeByName(root, 'commonMain' + FunctionConst.FUNC_ARENA_SHOP);
            return btpShop.getBoundingBoxToWorld();
        },
        clickfunc: function (sender, stepData) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'ArenaView');
            stepData.doNextStep();
        }
    };
    public step2304 = {
        func: function () {
            G_SceneManager.showScene('shop', ShopConst.ARENA_SHOP);
            G_TutorialManager.clearTipLayer();
        }
    };
    public step2305 = {
        simulate: true,
        findfunc: function () {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'ShopFixView');
            var panelTab = Util.getSubNodeByName(root, 'Panel_tab' + ShopConst.ARENA_SHOP_SUB_AWARD);
            return panelTab.getBoundingBoxToWorld();
        },
        clickfunc: function (sender, stepData) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'ShopFixView').getComponent(ShopFixView);
            root.setTabIndex(ShopConst.ARENA_SHOP_SUB_AWARD);
            G_TutorialManager.clearTipLayer();
        }
    };
    public step2306 = TutorialStepHelper.buildShopItemBuyTable();
    public step2307 = {};
    public step2308 = {
        simulate: true,
        findfunc: function (nodeName) {
            return TutorialStepHelper.findBackButton();
        },
        clickfunc: function (sender, stepData) {
            G_SceneManager.popScene();
        }
    };
    public step1801 = TutorialStepHelper.buildNewFunctionSceneTable();
    public step1802 = TutorialStepHelper.buildNewFunctionDlgTable(FunctionConst.FUNC_TRAVEL);
    public step1803 = TutorialStepHelper.buildNewFunctionBtnTable();
    public step1804 = {};
    public step1805 = TutorialStepHelper.buildMainIconGoTable('commonMain' + FunctionConst.FUNC_TRAVEL, FunctionConst.FUNC_TRAVEL);
    public step1806 = {};
    public step1807 = {
        simulate: true,
        findfunc: function (nodeName) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'ExploreMainView').getComponent(ExploreMainView);
            var city1 = root.getCityById(1);
            return Util.getSubNodeByName(city1.node, '_btnCity').getBoundingBoxToWorld();
        },
        clickfunc: function (sender, stepData) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'ExploreMainView').getComponent(ExploreMainView);
            var city1 = root.getCityById(1);
            city1.goToCity();
            G_TutorialManager.clearTipLayer();
        }
    };
    public step1808 = {
        simulate: true,
        findfunc: function (nodeName) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'ExploreMapView');
            return Util.getSubNodeByName(root, '_btnRoll').getBoundingBoxToWorld();
        },
        clickfunc: function (sender, stepData) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'ExploreMapView').getComponent(ExploreMapView);
            root.onBtnRoll();
            G_TutorialManager.clearTipLayer();
        },
        bindfunc: function (stepData) {
            var stageObj = stepData.owner;
            if (stageObj) {
                stageObj.bindProtoMsg(MessageIDConst.ID_C2S_RollExplore);
            }
        }
    };
    public step1809 = {
        simulate: true,
        findfunc: function (nodeName) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'ExploreMapView');
            return Util.getSubNodeByName(root, '_btnRoll').getBoundingBoxToWorld();
        },
        clickfunc: function (sender, stepData) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'ExploreMapView').getComponent(ExploreMapView);
            root.onBtnRoll();
            G_TutorialManager.clearTipLayer();
        }
    };
    public step1901 = {
        func: function (stepData) {
            var exploreMap = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'ExploreMapView');
            if (exploreMap == null) {
                G_SceneManager.popToRootAndReplaceScene('exploreMap', 1);
            } else {
                stepData.doNextStep();
            }
        }
    };
    public step1902 = {
        simulate: true,
        findfunc: function (nodeName) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'ExploreMapView');
            var answer = Util.getSubNodeByName(root, 'ExploreMapViewEventIcon' + ExploreConst.EVENT_TYPE_ANSWER);
            return Util.getSubNodeByName(answer, '_iconImage').getBoundingBoxToWorld();
        },
        clickfunc: function (sender, stepData) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'ExploreMapView');
            var answer = Util.getSubNodeByName(root, 'ExploreMapViewEventIcon' + ExploreConst.EVENT_TYPE_ANSWER).getComponent(ExploreMapViewEventIcon);
            answer._onClickBtn();
        }
    };
    public step1903 = {};
    public step1904 = {
        simulate: true,
        findfunc: function (nodeName) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'EventAnswerNode');
            var answer = Util.getSubNodeByName(root, 'EventAnswerCell2');
            return Util.getSubNodeByName(answer, '_btnAnswer').getBoundingBoxToWorld();
        },
        clickfunc: function (sender, stepData) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'EventAnswerNode').getComponent(EventAnswerNode);
            root._onAnswerClick(2);
            G_TutorialManager.clearTipLayer();
        },
        bindfunc: function (stepData) {
            var stageObj = stepData.owner;
            if (stageObj) {
                stageObj.bindProtoMsg(MessageIDConst.ID_C2S_ExploreDoEvent);
            }
        }
    };
    public step1905 = TutorialStepHelper.buildPopupGetRewardsTable();
    public step1906 = TutorialStepHelper.buildCloseDlgTable('PopupEventBase');
    public step1907 = {
        simulate: true,
        findfunc: function (nodeName) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'ExploreMapView');
            return Util.getSubNodeByName(root, '_btnRoll').getBoundingBoxToWorld();
        },
        clickfunc: function (sender, stepData) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'ExploreMapView').getComponent(ExploreMapView);
            root.onBtnRoll();
            G_TutorialManager.clearTipLayer();
            stepData.doNextStep();
        }
    };
    public step2001 = {
        func: function (stepData) {
            var exploreMap = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'ExploreMainView')
            if (exploreMap == null) {
                G_SceneManager.popToRootAndReplaceScene('exploreMain');
            } else {
                // stepData.doNextStep();
            }
        }
    };
    public step2002 = {};
    public step2003 = {
        simulate: true,
        findfunc: function (nodeName) {
            return TutorialStepHelper.findBackButton();
        },
        clickfunc: function (sender, stepData) {
            G_SceneManager.popToRootAndReplaceScene('main');
        }
    };
    public step2004 = {
        simulate: true,
        findfunc: function (nodeName) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_heroAvatar1');
            var clickWidget = Util.getSubNodeByName(root, 'Panel_click');
            return clickWidget.getBoundingBoxToWorld();
        },
        clickfunc: function () {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_heroAvatar1').getComponent(CommonMainHeroNode);
            root.onClickCallBack();
            G_TutorialManager.clearTipLayer();
        }
    };
    public step2005 = {
        simulate: true,
        findfunc: function () {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_fileNodeTreasure1');
            var clickWidget = Util.getSubNodeByName(root, 'PanelTouch');
            return clickWidget.getBoundingBoxToWorld();
        },
        clickfunc: function () {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'TeamView').getComponent(TeamView);
            var icon = root.getHeroLayer().getTreasureIconByIndex(1);
            icon._onPanelTouch();
            G_TutorialManager.clearTipLayer();
        }
    };
    public step2006 = TutorialStepHelper.buildPopupChooseTable('PopupChooseTreasure2', MessageIDConst.ID_C2S_AddFightInstrument);
    public step2101 = {
        func: function () {
            var teamView = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'TeamView');
            if (teamView == null) {
                G_SceneManager.popToRootAndReplaceScene('team');
            } else {
            }
        }
    };
    public step2102 = {};
    public step2103 = {
        simulate: true,
        findfunc: function () {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_fileNodeTreasure1');
            var clickWidget = Util.getSubNodeByName(root, 'PanelTouch');
            return clickWidget.getBoundingBoxToWorld();
        },
        clickfunc: function () {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'TeamView').getComponent(TeamView);
            var equipIcon = root.getHeroLayer().getTreasureIconByIndex(1);
            equipIcon._onPanelTouch();
            G_TutorialManager.clearTipLayer();
        }
    };
    public step2104 = {
        simulate: true,
        findfunc: function () {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'TreasureDetailStrengthenNode');
            var clickWidget = Util.getSubNodeByName(root, 'ButtonStrengthen');
            return clickWidget.getBoundingBoxToWorld();
        },
        clickfunc: function () {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'TreasureDetailStrengthenNode').getComponent(TreasureDetailStrengthenNode);
            root._onButtonStrengthenClicked();
        }
    };
    public step2105 = TutorialStepHelper.buildTreasureUpTable(true);
    public step2106 = {};
    public step2107 = {
        simulate: true,
        findfunc: function (nodeName) {
            return TutorialStepHelper.findBackButton();
        },
        clickfunc: function (sender, stepData) {
            G_SceneManager.popToRootAndReplaceScene('main');
        }
    };
    public step2108 = TutorialStepHelper.buildMainIconGoTable('commonMain' + FunctionConst.FUNC_TRAVEL, FunctionConst.FUNC_TRAVEL);
    public step2109 = {
        simulate: true,
        findfunc: function (nodeName) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'ExploreMainView').getComponent(ExploreMainView);
            var city1 = root.getCityById(2);
            return Util.getSubNodeByName(city1.node, '_btnCity').getBoundingBoxToWorld();
        },
        clickfunc: function (sender, stepData) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'ExploreMainView').getComponent(ExploreMainView);
            var city1 = root.getCityById(2);
            city1.goToCity();
        }
    };
    public step3001 = TutorialStepHelper.buildNewFunctionSceneTable();
    public step3002 = TutorialStepHelper.buildNewFunctionDlgTable(FunctionConst.FUNC_OFFICIAL);
    public step3003 = TutorialStepHelper.buildNewFunctionBtnTable();
    public step3004 = {};
    public step3005 = TutorialStepHelper.buildMainIconGoTable('commonMain' + FunctionConst.FUNC_MORE, FunctionConst.FUNC_MORE);
    public step3006 = TutorialStepHelper.buildMainIconGoTable('commonMain' + FunctionConst.FUNC_OFFICIAL, FunctionConst.FUNC_OFFICIAL);
    public step3007 = {
        simulate: true,
        findfunc: function (nodeName) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'PopupOfficialRankUp');
            return Util.getSubNodeByName(root, '_btnUp').getBoundingBoxToWorld();
        },
        clickfunc: function (sender, stepData) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'PopupOfficialRankUp').getComponent(PopupOfficialRankUp);
            root.onBtnUp();
            stepData.doNextStep();
        },
        bindfunc: function (stepData) {
            var stageObj = stepData.owner;
            if (stageObj) {
                stageObj.bindProtoMsg(MessageIDConst.ID_C2S_UpOfficerLevel);
            }
        }
    };
    public step3008 = {};
    public step3009 = TutorialStepHelper.buildCloseDlgTable('PopupOfficialRankUp');
    public step3010 = TutorialStepHelper.buildMainIconGoTable('_btnMainFight', FunctionConst.FUNC_NEW_STAGE);
    public step3201 = TutorialStepHelper.buildNewFunctionSceneTable();
    public step3202 = TutorialStepHelper.buildNewFunctionDlgTable(FunctionConst.FUNC_ARMY_GROUP);
    public step3203 = TutorialStepHelper.buildNewFunctionBtnTable();
    public step3204 = {};
    public step3205 = TutorialStepHelper.buildMainIconGoTable('commonMain' + FunctionConst.FUNC_ARMY_GROUP, FunctionConst.FUNC_ARMY_GROUP);
    public step4501 = TutorialStepHelper.buildNewFunctionSceneTable();
    public step4502 = TutorialStepHelper.buildNewFunctionDlgTable(FunctionConst.FUNC_DAILY_STAGE);
    public step4503 = TutorialStepHelper.buildNewFunctionBtnTable();
    public step4504 = {};
    public step4505 = TutorialStepHelper.buildMainIconGoTable('commonMain' + FunctionConst.FUNC_ADVENTURE, FunctionConst.FUNC_ADVENTURE);
    public step4506 = TutorialStepHelper.buildChallengeCellTable(FunctionConst.FUNC_DAILY_STAGE);
    public step4507 = {
        simulate: true,
        findfunc: function () {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'DailyChallengeView');
            var dailyCity = Util.getSubNodeByName(root, 'DailyCity2');
            return Util.getSubNodeByName(dailyCity, '_btnCity').getBoundingBoxToWorld();
        },
        clickfunc: function () {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'DailyChallengeView');
            var dailyCity = Util.getSubNodeByName(root, 'DailyCity2').getComponent(DailyCity);
            dailyCity._onCityClick();
        }
    };
    public step4508 = {
        simulate: true,
        findfunc: function () {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'PopupDailyChoose');
            var chooseCell = Util.getSubNodeByName(root, 'PopupDailyChooseCell1');
            return Util.getSubNodeByName(chooseCell, '_btnFight').getBoundingBoxToWorld();
        },
        clickfunc: function (sender, stepData) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'PopupDailyChoose');
            var chooseCell = Util.getSubNodeByName(root, 'PopupDailyChooseCell1').getComponent(PopupDailyChooseCell);
            chooseCell._executeStage();
        },
        bindfunc: function (stepData) {
            var stageObj = stepData.owner;
            if (stageObj) {
                stageObj.bindProtoMsg(MessageIDConst.ID_C2S_ExecuteDailyDungeon);
            }
        }
    };
    public step5501 = TutorialStepHelper.buildNewFunctionSceneTable();
    public step5502 = TutorialStepHelper.buildNewFunctionDlgTable(FunctionConst.FUNC_PVE_TOWER);
    public step5503 = TutorialStepHelper.buildNewFunctionBtnTable();
    public step5504 = {};
    public step5505 = TutorialStepHelper.buildMainIconGoTable('commonMain' + FunctionConst.FUNC_ADVENTURE, FunctionConst.FUNC_ADVENTURE);
    public step5506 = TutorialStepHelper.buildChallengeCellTable(FunctionConst.FUNC_PVE_TOWER);
    public step5507 = {
        simulate: true,
        findfunc: function (nodeName) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'TowerAvatarNode1');
            return Util.getSubNodeByName(root, '_panelTouch').getBoundingBoxToWorld();
        },
        clickfunc: function (sender, stepData) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'TowerAvatarNode1').getComponent(TowerAvatarNode);
            root._onAvatarClick();
        }
    };
    public step5508 = {
        simulate: true,
        findfunc: function () {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'PopupTowerChoose');
            var chooseCell = Util.getSubNodeByName(root, '_chooseCell3');
            return Util.getSubNodeByName(chooseCell, '_btnFight').getBoundingBoxToWorld();
        },
        clickfunc: function (sender, stepData) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'PopupTowerChoose').getComponent(PopupTowerChoose);
            root._onChallengeClick(3);
        },
        bindfunc: function (stepData) {
            var stageObj = stepData.owner;
            if (stageObj) {
                stageObj.bindProtoMsg(MessageIDConst.ID_C2S_ExecuteTower);
            }
        }
    };
    public step5601 = {
        func: function (stepData) {
            var runningScene = G_SceneManager.getRunningScene();
            if (runningScene.getName() != 'fight' && runningScene.getName() != 'tower') {
                G_SceneManager.popToRootAndReplaceScene('tower');
            }
        }
    };
    public step5602 = {};
    public step5603 = {
        simulate: true,
        findfunc: function () {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'TowerView');
            var btpShop = Util.getSubNodeByName(root, 'commonMain' + FunctionConst.FUNC_EQUIP_SHOP);
            return btpShop.getBoundingBoxToWorld();
        },
        clickfunc: function (sender, stepData) {
            G_SceneManager.showScene('shop', ShopConst.EQUIP_SHOP);
            G_TutorialManager.clearTipLayer();
        }
    };
    public step5604 = {
        simulate: true,
        findfunc: function () {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'ShopFixView');
            var panelTab = Util.getSubNodeByName(root, 'Panel_tab' + ShopConst.EQUIP_SHOP_SUB_AWARD);
            return panelTab.getBoundingBoxToWorld();
        },
        clickfunc: function (sender, stepData) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'ShopFixView').getComponent(ShopFixView);
            root.setTabIndex(ShopConst.EQUIP_SHOP_SUB_AWARD);
            G_TutorialManager.clearTipLayer();
        }
    };
    public step5605 = TutorialStepHelper.buildShopItemBuyTable();
    public step5606 = {};
    public step5607 = {
        simulate: true,
        findfunc: function (nodeName) {
            return TutorialStepHelper.findBackButton();
        },
        clickfunc: function (sender, stepData) {
            G_SceneManager.popScene();
        }
    };
    public step5608 = {
        simulate: true,
        findfunc: function (nodeName) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'TowerAvatarNode2');
            return Util.getSubNodeByName(root, '_panelTouch').getBoundingBoxToWorld();
        },
        clickfunc: function (sender, stepData) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'TowerAvatarNode2').getComponent(TowerAvatarNode);
            root._onAvatarClick();
            G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, 'step5608');
        }
    };
    public step4001 = TutorialStepHelper.buildNewFunctionSceneTable();
    public step4002 = TutorialStepHelper.buildNewFunctionDlgTable(FunctionConst.FUNC_FAMOUS_CHAPTER);
    public step4003 = TutorialStepHelper.buildNewFunctionBtnTable();
    public step4004 = {};
    public step4005 = TutorialStepHelper.buildMainIconGoTable('_btnMainFight', FunctionConst.FUNC_NEW_STAGE);
    public step4006 = {
        simulate: true,
        findfunc: function (nodeName) {
            var target = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_checkType3');
            return target.getBoundingBoxToWorld();
        },
        clickfunc: function (sender, stepData) {
            var chapterView = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'ChapterView').getComponent(ChapterView);
            var target = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_checkType3');
            chapterView.onTypeClick({ target: target });
            stepData.doNextStep();
        }
    };
    public step4007 = {
        simulate: true,
        findfunc: function (nodeName) {
            var target = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'ChapterCity2001');
            var btnWidget1 = Util.getSubNodeByName(target, '_btnCity');
            return btnWidget1.getBoundingBoxToWorld();
        },
        clickfunc: function (sender, stepData) {
            var target = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'ChapterCity2001').getComponent(ChapterCity);
            target.goToStage();
            G_TutorialManager.clearTipLayer();
        }
    };
    public step4008 = TutorialStepHelper.buildStageTable('stageId_300101');
    public step4009 = TutorialStepHelper.buildFamousFightTable();
    public step4010 = {
        func: function (stepData, tipLayer) {
        }
    };
    public step4011 = TutorialStepHelper.buildPopupGetRewardsTable();
    public step4012 = {};
    public step7501 = TutorialStepHelper.buildNewFunctionSceneTable();
    public step7502 = {};
    public step7503 = TutorialStepHelper.buildMainIconGoTable('commonMain' + FunctionConst.FUNC_MORE, FunctionConst.FUNC_MORE);
    public step7504 = TutorialStepHelper.buildMainIconGoTable('commonMain' + FunctionConst.FUNC_RECYCLE, FunctionConst.FUNC_RECYCLE);
    public step7505 = {
        simulate: true,
        findfunc: function (nodeName) {
            var target = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_buttonAutoAdd');
            return target.getBoundingBoxToWorld();
        },
        clickfunc: function (sender, stepData) {
            var recoveryHeroLayer = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'RecoveryHeroLayer').getComponent(RecoveryHeroLayer);
            recoveryHeroLayer.onButtonAutoAddClicked();
            stepData.doNextStep();
        }
    };
    public step7506 = {
        simulate: true,
        findfunc: function (nodeName) {
            var target = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_buttonRecovery');
            return target.getBoundingBoxToWorld();
        },
        clickfunc: function (sender, stepData) {
            var recoveryHeroLayer = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'RecoveryHeroLayer').getComponent(RecoveryHeroLayer);
            recoveryHeroLayer.onButtonRecoveryClicked();
        }
    };
    public step7507 = {
        simulate: true,
        findfunc: function (nodeName) {
            var target = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_buttonOk');
            return target.getBoundingBoxToWorld();
        },
        clickfunc: function (sender, stepData) {
            var popupRecoveryPreview = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'PopupRecoveryPreview').getComponent(PopupRecoveryPreview);
            popupRecoveryPreview.onButtonOk();
            stepData.doNextStep();
        }
    };
    public step7508 = TutorialStepHelper.buildPopupGetRewardsTable();
    public step7509 = {};
    public step7601 = {
        func: function (stepData) {
            var recovery = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'RecoveryView');
            if (recovery == null) {
                G_SceneManager.popToRootAndReplaceScene('recovery', RecoveryConst.RECOVERY_TYPE_1);
            } else {
                stepData.doNextStep();
            }
        }
    };
    public step7602 = {
        simulate: true,
        findfunc: function (nodeName) {
            var target = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_buttonShop');
            return target.getBoundingBoxToWorld();
        },
        clickfunc: function (sender, stepData) {
            var recoveryView = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'RecoveryView').getComponent(RecoveryView);
            recoveryView.shopBtnClick();
            G_TutorialManager.clearTipLayer();
        }
    };
    public step7603 = {};
    public step8001 = {
        func: function (stepData) {
        }
    };
    public step8002 = {
        simulate: true,
        findfunc: function (nodeName) {
            var popupSiegeCome = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'PopupSiegeCome');
            var target = Util.getSubNodeByName(popupSiegeCome, 'buttonFight');
            return target.getBoundingBoxToWorld();
        },
        clickfunc: function (sender, stepData) {
            var popupSiegeCome = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'PopupSiegeCome').getComponent(PopupSiegeCome);
            popupSiegeCome._onChallengeClick();
            G_TutorialManager.clearTipLayer();
        }
    };
    public step8003 = {};
    public step8004 = {
        simulate: true,
        findfunc: function (nodeName) {
            var siegeView = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'SiegeView').getComponent(SiegeView);
            var target = siegeView.getSiegeNodeByIndex(1);
            var clickWidget = Util.getSubNodeByName(target.node, 'Panel_click');
            return clickWidget.getBoundingBoxToWorld();
        },
        clickfunc: function (sender, stepData) {
            var siegeView = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'SiegeView').getComponent(SiegeView);
            var target = siegeView.getSiegeNodeByIndex(1);
            target._onAvatarClick();
            G_TutorialManager.clearTipLayer();
        }
    };
    public step8005 = {
        simulate: true,
        findfunc: function (nodeName) {
            var target = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'SiegeChallengeBtns');
            var clickWidget = Util.getSubNodeByName(target, '_btnPowerAttack');
            return clickWidget.getBoundingBoxToWorld();
        },
        clickfunc: function (sender, stepData) {
            var siegeChallengeBtns = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'SiegeChallengeBtns').getComponent(SiegeChallengeBtns);
            siegeChallengeBtns.onPowerClick();
            G_TutorialManager.clearTipLayer();
            stepData.doNextStep();
        }
    };
    public step9001 = TutorialStepHelper.buildNewFunctionSceneTable();
    public step9002 = {};
    public step9003 = {};
    public step9004 = {};
    public step9005 = {
        simulate: true,
        findfunc: function (nodeName) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_heroAvatar1');
            var clickWidget = Util.getSubNodeByName(root, 'Panel_click');
            return clickWidget.getBoundingBoxToWorld();
        },
        clickfunc: function () {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_heroAvatar1').getComponent(CommonMainHeroNode);
            root.onClickCallBack();
            G_TutorialManager.clearTipLayer();
        }
    };
    public step9006 = {
        simulate: true,
        findfunc: function (nodeName) {
            var target = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_buttonSilkbag');
            return target.getBoundingBoxToWorld();
        },
        clickfunc: function (sender, stepData) {
            var teamHeroNode = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'TeamHeroNode').getComponent(TeamHeroNode);
            teamHeroNode.onButtonSilkbagClicked();
            G_TutorialManager.clearTipLayer();
        }
    };
    public step9007 = {
        simulate: true,
        findfunc: function (nodeName) {
            var SilkbagView = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'SilkbagView');
            var listView = Util.getSubNodeByName(SilkbagView, '_listView').getComponent(cc.ScrollView);
            var itemList = listView.content.children;
            var cellWidget = itemList[0];
            var clickWidget = Util.getSubNodeByName(cellWidget, '_button');
            return clickWidget.getBoundingBoxToWorld();
        },
        clickfunc: function (sender, stepData) {
            var SilkbagView = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'SilkbagView');
            var listView = Util.getSubNodeByName(SilkbagView, '_listView').getComponent(cc.ScrollView);
            var itemList = listView.content.children;
            var cellWidget = itemList[0].getComponent(SilkbagListCell);
            cellWidget._onButtonClicked();
            stepData.doNextStep();
        },
        bindfunc: function (stepData) {
            var stageObj = stepData.owner;
            if (stageObj) {
                stageObj.bindProtoMsg(MessageIDConst.ID_C2S_EquipSilkbag);
            }
        }
    };
    public step9008 = {};
    public step12001 = TutorialStepHelper.buildNewFunctionSceneTable();
    public step12002 = {};
    public step12003 = {};
    public step12004 = {};
    public step12005 = TutorialStepHelper.buildMainIconGoTable('commonMain' + FunctionConst.FUNC_PET_HOME, FunctionConst.FUNC_PET_HOME);
    public step12006 = {
        simulate: true,
        findfunc: function (nodeName) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_avatar1');
            var clickWidget = Util.getSubNodeByName(root, 'Panel_click');
            return clickWidget.getBoundingBoxToWorld();
        },
        clickfunc: function () {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, '_avatar1').getComponent(CommonPetMainAvatar);
            root.onClickCallBack();
            G_TutorialManager.clearTipLayer();
        }
    };
    public step12007 = {
        simulate: true,
        findfunc: function () {
            var chooseHero = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'PopupChoosePet');
            var listView = Util.getSubNodeByName(chooseHero, '_listView').getComponent(cc.ScrollView);
            var itemList = listView.content.children;
            var cellWidget = itemList[0];
            var clickWidget = Util.getSubNodeByName(cellWidget, '_buttonChoose1');
            return clickWidget.getBoundingBoxToWorld();
        },
        clickfunc: function (sender, stepData) {
            var chooseHero = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'PopupChoosePet');
            var listView = Util.getSubNodeByName(chooseHero, '_listView').getComponent(cc.ScrollView);
            var itemList = listView.content.children;
            var cellWidget = itemList[0].getComponent(PopupChoosePetCell);
            cellWidget.onButtonClicked();
            stepData.doNextStep();
        },
        bindfunc: function (stepData) {
            var stageObj = stepData.owner;
            if (stageObj) {
                stageObj.bindProtoMsg(MessageIDConst.ID_C2S_PetOnTeam);
            }
        }
    };
    public step12008 = {};
    public step12009 = {
        simulate: true,
        findfunc: function (nodeName) {
            return TutorialStepHelper.findBackButton();
        },
        clickfunc: function (sender, stepData) {
            stepData.doNextStep();
        }
    };
    public step14001 = {
        func: function () {
            G_SceneManager.popToRootAndReplaceScene('main');
        }
    };
    public step14002 = TutorialStepHelper.buildMainIconGoTable('commonMain' + FunctionConst.FUNC_HOMELAND, FunctionConst.FUNC_HOMELAND);
    public step14003 = {
        simulate: true,
        findfunc: function (nodeName) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'mainTree');
            var clickWidget = Util.getSubNodeByName(root, '_panelContainer');
            return clickWidget.getBoundingBoxToWorld();
        },
        clickfunc: function () {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'mainTree').getComponent(HomelandMainNode);
            root.onBtnAdd();
            G_TutorialManager.clearTipLayer();
        }
    };
    public step14004 = {
        simulate: true,
        findfunc: function () {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'PopupHomelandMainUp');
            var clickWidget = Util.getSubNodeByName(root, '_btnUp');
            return clickWidget.getBoundingBoxToWorld();
        },
        clickfunc: function (sender, stepData) {
            var root = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'PopupHomelandMainUp').getComponent(PopupHomelandMainUp);
            root._onBtnMainUp();
            stepData.doNextStep();
        },
        bindfunc: function (stepData) {
            var stageObj = stepData.owner;
            if (stageObj) {
                stageObj.bindProtoMsg(MessageIDConst.ID_C2S_HomeTreeUpLevel);
            }
        }
    };
}