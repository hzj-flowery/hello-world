import { ActivityConst } from "../../const/ActivityConst";
import { CakeActivityConst } from "../../const/CakeActivityConst";
import ChapterConst from "../../const/ChapterConst";
import { FriendConst } from "../../const/FriendConst";
import { FunctionConst } from "../../const/FunctionConst";
import { GuildConst } from "../../const/GuildConst";
import { PackageViewConst } from "../../const/PackageViewConst";
import PetConst from "../../const/PetConst";
import { RecoveryConst } from "../../const/RecoveryConst";
import { G_Prompt, G_ResolutionManager, G_SceneManager, G_ServerTime, G_UserData, G_ConfigManager, G_SignalManager, G_StorageManager, G_RoleListManager, G_ServerListManager, G_ConfigLoader, G_GameAgent } from "../../init";
import { Lang } from "../../lang/Lang";
import { CampRaceHelper } from "../../scene/view/campRace/CampRaceHelper";
import ChatMainView from "../../scene/view/chat/ChatMainView";
import { CountryBossHelper } from "../../scene/view/countryboss/CountryBossHelper";
import { EquipTrainHelper } from "../../scene/view/equipTrain/EquipTrainHelper";
import PopupMailReward from "../../scene/view/mail/PopupMailReward";
import MainMenuLayer from "../../scene/view/main/MainMenuLayer";
import { PackageHelper } from "../../scene/view/package/PackageHelper";
import PopupChoosePet from "../../ui/popup/PopupChoosePet";
import PopupChoosePetHelper from "../../ui/popup/PopupChoosePetHelper";
import PopupBase from "../../ui/PopupBase";
import { LogicCheckHelper } from "../LogicCheckHelper";
import { UIPopupHelper } from "../UIPopupHelper";
import { Util } from "../Util";
import { CakeActivityDataHelper } from "./CakeActivityDataHelper";
import { ShopConst } from "../../const/ShopConst";
import { SignalConst } from "../../const/SignalConst";
import { Path } from "../Path";
import { CrossWorldBossHelperT } from "../../scene/view/crossWorldBoss/CrossWorldBossHelperT";
import { ConfigNameConst } from "../../const/ConfigNameConst";

export namespace WayFuncConvert {
    export function getReturnFunc(funcId) {
        let funcName = FunctionConst.getFuncName(funcId);
        let retFunc = WayFuncConvert['_' + funcName];
        if (retFunc != null && typeof retFunc == 'function') {
            return retFunc.apply(this);
        }
        return null;
    };
    
    //游戏圈
    export function _FUNC_GAME_FRIENDS(){
        let returnFunc = function (actId) {
            // G_SceneManager.showScene('activity', ActivityConst.ACT_ID_OPEN_SERVER_FUND);
        };
        return returnFunc;
    }

    //成长基金
    export function _FUNC_GROWTH_FUND() {
        let returnFunc = function (actId) {
            G_SceneManager.showScene('activity', ActivityConst.ACT_ID_OPEN_SERVER_FUND);
        };
        return returnFunc;
    }
    //每日礼包
    export function _FUNC_DAILY_GIFT_PACK() {
        let returnFunc = function (actId) {
            G_SceneManager.showScene('activity', ActivityConst.ACT_ID_LUXURY_GIFT_PKG);
        };
        return returnFunc;
    }
    export function _FUNC_JUN_SHI_MIAO_JI(){
        let returnFunc = function (actId) {
            G_SceneManager.showDialog("prefab/militaryMasterPlan/MilitaryMasterPlanView");
        };
        return returnFunc;
    }


    export function _FUNC_RED_PET_SHOP() {
        var returnFunc = function () {
            if (G_UserData.getRedPetData().isActivityOpen()) {
                G_SceneManager.showScene('redPetShop');
            } else {
                G_Prompt.showTip(Lang.get('customactivity_pet_act_not_open'));
            }
        };
        return returnFunc;
    };

    export function _FUNC_BOUT() {
        var returnFunc = function () {
            G_SceneManager.showScene('bout');
        };
        return returnFunc;
    };

    export function _FUNC_RED_PET() {
        var returnFunc = function () {
            G_SceneManager.showScene('redPet');
        };
        return returnFunc;
    };


    export function _FUNC_MINE_CRAFT() {
        let returnFunc = function () {
            G_SceneManager.showScene('mineCraft');
        };
        return returnFunc;
    };
    export function _FUNC_WX_SERVICE() {
        let returnFunc = function () {
            G_SceneManager.openPopup('prefab/wxService/PopupWxService', (popup) => {
                popup.openWithAction();
            })
        };
        return returnFunc;
    };

    export function _FUNC_TASK_LIMIT() {
        G_SceneManager.showScene("achievement", 2)
    }

    export function _FUNC_WX_COLLECT() {
        let returnFunc = function () {
            G_SceneManager.openPopup('prefab/wxService/PopupWxCollect', (popup) => {
                popup.openWithAction();
            })
        };
        return returnFunc;
    };

    export function _FUNC_OFFICIAL() {
        let returnFunc = function () {
            G_SceneManager.openPopup('prefab/official/PopupOfficialRankUp', (popup) => {
                popup.openWithAction();
            })
        };
        return returnFunc;
    };
    export function _FUNC_SYSTEM_SET() {
        let returnFunc = function () {
            G_SceneManager.openPopup('prefab/playerDetail/PopupPlayerDetail', (popup) => {
                popup.openWithAction();
            })
        };
        return returnFunc;
    };
    export function _FUNC_CONVERT() {
        let returnFunc = function () {
            G_SceneManager.showScene('transform');
        };
        return returnFunc;
    };
    export function _FUNC_MAIN_STRONGER() {
        let returnFunc = function () {
            G_SceneManager.showScene('stronger');
        };
        return returnFunc;
    };
    export function _FUNC_ITEM_BAG2() {
        var returnFunc = function () {
            G_SceneManager.showScene('package');
        };
        return returnFunc;
    }
    export function _FUNC_BECOME_STRONGER() {
        let returnFunc = function () {
            G_SceneManager.showScene('stronger');
        };
        return returnFunc;
    };
    export function _FUNC_MAIL() {
        let returnFunc = function () {
            G_SceneManager.openPopup('prefab/mail/PopupMailReward', (popup: PopupMailReward) => {
                popup.initData(null, null);
                popup.openWithAction();
            }
            );
            // new PopupMailReward();
        };
        return returnFunc;
    };
    export function _FUNC_MAIL_RED(/*#...#*/) {
        return WayFuncConvert._FUNC_MAIL(/*#...#*/);
    };
    export function _FUNC_RECHARGE() {
        if (!G_ConfigManager.checkCanRecharge()) return;
        let returnFunc = function () {
            G_SceneManager.showDialog('prefab/vip/PopupVip', null, null, 1);
        };
        return returnFunc;
    };
    export function _FUNC_RECHARGE2() {
        return WayFuncConvert._FUNC_JADE2();
    };
    export function _FUNC_JADE2() {
        var returnFunc = function () {
            G_ConfigManager.checkCanRecharge() && G_SceneManager.showDialog('prefab/vip/PopupVip', null, null, 1);
        };
        return returnFunc;
    };

    export function _FUNC_RECYCLE() {
        let returnFunc = function () {
            G_SceneManager.showScene('recovery');
        };
        return returnFunc;
    };
    export function _FUNC_MORE() {
        let returnFunc = function () {
            let sceneName = G_SceneManager.getRunningSceneName();
            if (sceneName == 'main') {
                let mainMenuLayer = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'MainMenuLayer').getComponent(MainMenuLayer)
                if (mainMenuLayer) {
                    mainMenuLayer.onMoreBtn();
                }
            }
        };
        return returnFunc;
    };
    export function _FUNC_ADVENTURE() {
        let returnFunc = function () {
            G_SceneManager.showScene('challenge');
        };
        return returnFunc;
    };
    export function _FUNC_TEAM() {
        let returnFunc = function () {
            G_SceneManager.showScene('team');
        };
        return returnFunc;
    };
    export function _FUNC_WELFARE() {
        let returnFunc = function (actId) {
            G_SceneManager.showScene('activity', actId);
        };
        return returnFunc;
    };
    export function _FUNC_GRAIN_CAR() {
        var returnFunc = function () {
            if (!LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_GRAIN_CAR)[0]) {
                return;
            }
            var signal = null;
            var sceneName = G_SceneManager.getRunningSceneName();
            if (sceneName != 'mineCraft') {
                var onMsgCallBack = function () {
                    G_SceneManager.showScene('mineCraft', null, true);
                    signal.remove();
                    signal = null;
                }
                G_UserData.getGrainCar().c2sGetGrainCarInfo();
                signal = G_SignalManager.add(SignalConst.EVENT_GRAIN_CAR_GET_INFO, onMsgCallBack);
            } else {
                G_SceneManager.showDialog(Path.getPrefab("PopupGrainCarDonate", "grainCar"));
            }
        };
        return returnFunc;
    };
    export function _FUNC_HAND_BOOK() {
        let returnFunc = function () {
            G_SceneManager.showScene('handbook', null);
        };
        return returnFunc;
    };
    export function _FUNC_VIP_GIFT() {
        let returnFunc = function () {
            G_SceneManager.openPopup('prefab/vip/PopupVipGiftPkg', (popup) => {
                popup.openWithAction();
            })
        };
        return returnFunc;
    };
    export function _FUNC_AWAKE_BAG() {
        let returnFunc = function () {
            let index = PackageHelper.getPackageAwarkTabIndx();
            G_SceneManager.showScene('package', index);
        };
        return returnFunc;
    };
    export function _FUNC_ITEM_BAG() {
        let returnFunc = function () {
            G_SceneManager.showScene('package');
        };
        return returnFunc;
    };
    export function _FUNC_DAILY_MISSION() {
        let returnFunc = function () {
            G_SceneManager.showScene('achievement');
        };
        return returnFunc;
    };
    export function _FUNC_ACHIEVEMENT() {
        let returnFunc = function () {
            G_SceneManager.showScene('achievement', 2);
        };
        return returnFunc;
    };
    export function _FUNC_EQUIP_LIST() {
        let returnFunc = function () {
            G_SceneManager.showScene('equipment');
        };
        return returnFunc;
    };
    export function _FUNC_TREASURE_LIST() {
        let returnFunc = function () {
            G_SceneManager.showScene('treasure');
        };
        return returnFunc;
    };
    export function _FUNC_INSTRUMENT_LIST() {
        let returnFunc = function () {
            G_SceneManager.showScene('instrument');
        };
        return returnFunc;
    };
    export function _FUNC_HERO_LIST() {
        let returnFunc = function () {
            G_SceneManager.showScene('hero');
        };
        return returnFunc;
    };
    export function _FUNC_TEAM_SLOT1(pos) {
        pos = pos || 1;
        let returnFunc = function () {
            console.warn(' _FUNC_TEAM_SLOT1 G_SceneManager:showScene(team) ');
            G_SceneManager.showScene('team', pos);
        };
        return returnFunc;
    };
    export function _FUNC_TEAM_SLOT2() {
        return WayFuncConvert._FUNC_TEAM_SLOT1(2);
    };
    export function _FUNC_TEAM_SLOT3() {
        return WayFuncConvert._FUNC_TEAM_SLOT1(3);
    };
    export function _FUNC_TEAM_SLOT4() {
        return WayFuncConvert._FUNC_TEAM_SLOT1(4);
    };
    export function _FUNC_TEAM_SLOT5() {
        return WayFuncConvert._FUNC_TEAM_SLOT1(5);
    };
    export function _FUNC_TEAM_SLOT6() {
        return WayFuncConvert._FUNC_TEAM_SLOT1(6);
    };
    export function _FUNC_NEW_STAGE() {
        let returnFunc = function () {
            G_SceneManager.showScene('chapter');
        };
        return returnFunc;
    };
    export function _FUNC_ELITE_CHAPTER() {
        let returnFunc = function () {
            G_SceneManager.showScene('chapter', ChapterConst.CHAPTER_TYPE_ELITE);
        };
        return returnFunc;
    };
    export function _FUNC_FAMOUS_CHAPTER() {
        let returnFunc = function () {
            G_SceneManager.showScene('chapter', ChapterConst.CHAPTER_TYPE_FAMOUS);
        };
        return returnFunc;
    };
    export function _FUNC_FIGHT_SCENE() {
        return WayFuncConvert._FUNC_NEW_STAGE();
    };
    export function _FUNC_DAILY_STAGE() {
        let returnFunc = function () {
            G_SceneManager.showScene('dailyChallenge');
        };
        return returnFunc;
    };
    export function _FUNC_DRAW_HERO() {
        let returnFunc = function () {
            G_SceneManager.showScene('drawCard');
        };
        return returnFunc;
    };
    export function _FUNC_SHOP_SCENE() {
        let returnFunc = function () {
            console.warn('WayFuncConvert._FUNC_SHOP_SCENE');
            G_SceneManager.showScene('shop');
        };
        return returnFunc;
    };
    export function _FUNC_EQUIP_SHOP() {
        let returnFunc = function () {
            G_SceneManager.showScene('shop', ShopConst.EQUIP_SHOP);
        };
        return returnFunc;
    };
    export function _FUNC_PET_SHOP() {
        let returnFunc = function () {
            G_SceneManager.showScene('shop', ShopConst.PET_SHOP);
        }
        return returnFunc;
    };
    export function _FUNC_INSTRUMENT_SHOP() {
        let returnFunc = function () {
            G_SceneManager.showScene('shop', ShopConst.TREASURE_SHOP);
        };
        return returnFunc;
    };
    export function _FUNC_HORSE_SHOP() {
        let returnFunc = function () {
            G_SceneManager.showScene('shop', ShopConst.HORSE_SHOP);
        };
        return returnFunc;
    };
    export function _FUNC_SIEGE_SHOP() {
        let returnFunc = function () {
            G_SceneManager.showScene('shop', ShopConst.INSTRUMENT_SHOP);
        };
        return returnFunc;
    };
    export function _FUNC_HERO_SHOP() {
        let returnFunc = function () {
            G_SceneManager.showScene('shop', ShopConst.HERO_SHOP);
        };
        return returnFunc;
    };
    export function _FUNC_GUILD_SHOP() {
        let returnFunc = function () {
            let isInGuild = G_UserData.getGuild().isInGuild();
            if (isInGuild == false) {
                G_Prompt.showTip(Lang.get('lang_guild_shop_no_open'));
            } else {
                G_SceneManager.showScene('shop', ShopConst.GUILD_SHOP);
            }
        };
        return returnFunc;
    };
    export function _FUNC_ARENA_SHOP() {
        let returnFunc = function () {
            G_SceneManager.showScene('shop', ShopConst.ARENA_SHOP);
        };
        return returnFunc;
    };
    export function _FUNC_AWAKE_SHOP() {
        let returnFunc = function () {
            G_SceneManager.showScene('shop', ShopConst.AWAKE_SHOP);
        };
        return returnFunc;
    };
    export function _FUNC_AUCTION() {
        let returnFunc = function () {
            G_SceneManager.showScene('auction');
        };
        return returnFunc;
    };
    export function _FUNC_ARENA() {
        let returnFunc = function () {
            G_SceneManager.showScene('arena');
        };
        return returnFunc;
    };
    export function _FUNC_EQUIP_TRAIN_TYPE1() {
        let returnFunc = function () {
            let firstEquipId = G_UserData.getBattleResource().getFirstEquipId();
            if (!firstEquipId) {
                G_Prompt.showTip(Lang.get('equipment_strengthen_fetch_equip_hint'));
            } else {
                if (EquipTrainHelper.isOpen(FunctionConst.FUNC_EQUIP_TRAIN_TYPE1) == false) {
                    return;
                }
                G_SceneManager.showScene('equipTrain', firstEquipId);
            }
        };
        return returnFunc;
    };
    export function _FUNC_TRAVEL() {
        let returnFunc = function () {
            G_SceneManager.showScene('exploreMain');
        };
        return returnFunc;
    };
    export function _FUNC_EXPLORE_ROLL_TEN() {
        return WayFuncConvert._FUNC_TRAVEL();
    };
    export function _FUNC_PVE_SIEGE() {
        let returnFunc = function () {
            G_SceneManager.showScene('siege');
        };
        return returnFunc;
    };
    export function _FUNC_PVE_TOWER() {
        let returnFunc = function () {
            G_SceneManager.showScene('tower');
        };
        return returnFunc;
    };
    export function _FUNC_FIRST_RECHARGE() {
        let returnFunc = function () {
            console.log("_FUNC_FIRST_RECHARGE")
            const openTime = G_UserData.getBase().getServer_open_time()
            const end_time = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(2015).content;
            console.log(openTime, end_time);
            let prefabPath = "prefab/firstpay/PopupFirstPayView";
            if (openTime >= end_time) prefabPath += "New";
            G_SceneManager.openPopup(prefabPath, (popup) => {
                G_UserData.getActivityFirstPay().isFirst = false;
                popup.openWithAction();
            })
        };
        return returnFunc;
    };
    export function _FUNC_WEEK_ACTIVITY() {
        let returnFunc = function () {
            G_SceneManager.openPopup('prefab/day7activity/PopupDay7Activity', (popup) => {
                popup.openWithAction();
            })
        };
        return returnFunc;
    };
    export function _FUNC_ARMY_GROUP() {
        let returnFunc = function () {
            let isInGuild = G_UserData.getGuild().isInGuild();
            if (isInGuild) {
                G_SceneManager.showScene('guild');
            } else {
                G_SceneManager.showDialog('prefab/guild/PopupGuildListView');
            }
        };
        return returnFunc;
    };
    export function _FUNC_ACTIVITY() {
        let returnFunc = function () {
            G_SceneManager.showScene("customActivity");
        };
        return returnFunc;
    };
    export function _FUNC_PVE_TERRITORY() {
        let returnFunc = function () {
            G_SceneManager.showScene('territory');
        };
        return returnFunc;
    };
    export function _FUNC_TUTORIAL_JUMP_PVE() {
        let returnFunc = function () {
            G_SceneManager.popToRootAndReplaceScene('stage', 1);
        };
        return returnFunc;
    };
    export function _FUNC_TUTORIAL_JUMP_MAIN() {
        let returnFunc = function () {
            console.warn('FUNC_TUTORIAL_JUMP_MAIN');
            G_SceneManager.popToRootAndReplaceScene('main')
        };
        return returnFunc;
    };
    export function _FUNC_TUTORIAL_JUMP_PVE2() {
        let returnFunc = function () {
            G_SceneManager.popToRootAndReplaceScene('stage');
        };
        return returnFunc;
    };
    export function _FUNC_TUTORIAL_JUMP_PVE3() {
        let returnFunc = function () {
            G_SceneManager.popToRootAndReplaceScene('stage');
        };
        return returnFunc;
    };
    export function _FUNC_TUTORIAL_TEAM_VIEW_SOLT1() {
        let returnFunc = function () {
            console.warn('FUNC_TUTORIAL_TEAM_VIEW_SOLT1');
            G_SceneManager.popToRootAndReplaceScene('team', 1);
        };
        return returnFunc;
    };
    export function _FUNC_INDULGE() {
        let returnFunc = function () {
        };
        return returnFunc;
    };
    export function _FUNC_QUESTION() {
        let returnFunc = function (queUnitData) {
            UIPopupHelper.popupQuestionDialog(function () {
                // G_NativeAgent.openURL(queUnitData.getUrl());
                G_UserData.getQuestionnaire().c2sQuestionnaire(queUnitData.getId());
            });
        };
        return returnFunc;
    };
    export function _FUNC_RANK() {
        let returnFunc = function (selectIndex) {
            G_SceneManager.showScene('complexRank', selectIndex);
        };
        return returnFunc;
    };
    export function _FUNC_RECOVERY_TYPE1() {
        let returnFunc = function () {
            G_SceneManager.showScene('recovery', RecoveryConst.RECOVERY_TYPE_1);
        };
        return returnFunc;
    };
    export function _FUNC_RECOVERY_TYPE2() {
        let returnFunc = function () {
            G_SceneManager.showScene('recovery', RecoveryConst.RECOVERY_TYPE_2);
        };
        return returnFunc;
    };
    export function _FUNC_RECOVERY_TYPE3() {
        let returnFunc = function () {
            G_SceneManager.showScene('recovery', RecoveryConst.RECOVERY_TYPE_3);
        };
        return returnFunc;
    };
    export function _FUNC_RECOVERY_TYPE4() {
        let returnFunc = function () {
            G_SceneManager.showScene('recovery', RecoveryConst.RECOVERY_TYPE_4);
        };
        return returnFunc;
    };
    export function _FUNC_RECOVERY_TYPE5() {
        let returnFunc = function () {
            G_SceneManager.showScene('recovery', RecoveryConst.RECOVERY_TYPE_5);
        };
        return returnFunc;
    };
    export function _FUNC_RECOVERY_TYPE6() {
        let returnFunc = function () {
            G_SceneManager.showScene('recovery', RecoveryConst.RECOVERY_TYPE_6);
        };
        return returnFunc;
    };
    export function _FUNC_RECOVERY_TYPE7() {
        let returnFunc = function () {
            G_SceneManager.showScene('recovery', RecoveryConst.RECOVERY_TYPE_7);
        };
        return returnFunc;
    };
    export function _FUNC_RECOVERY_TYPE8() {
        let returnFunc = function () {
            G_SceneManager.showScene('recovery', RecoveryConst.RECOVERY_TYPE_8);
        };
        return returnFunc;
    };
    export function _FUNC_RECOVERY_TYPE9() {
        let returnFunc = function () {
            G_SceneManager.showScene('recovery', RecoveryConst.RECOVERY_TYPE_9);
        };
        return returnFunc;
    };
    export function _FUNC_RECOVERY_TYPE10() {
        let returnFunc = function () {
            G_SceneManager.showScene('recovery', RecoveryConst.RECOVERY_TYPE_10);
        };
        return returnFunc;
    };
    export function _FUNC_RECOVERY_TYPE11() {
        let returnFunc = function () {
            G_SceneManager.showScene('recovery', RecoveryConst.RECOVERY_TYPE_11);
        };
        return returnFunc;
    };
    export function _FUNC_RECOVERY_TYPE12() {
        let returnFunc = function () {
            G_SceneManager.showScene('recovery', RecoveryConst.RECOVERY_TYPE_12);
        };
        return returnFunc;
    };
    export function _FUNC_RECOVERY_TYPE13() {
        let returnFunc = function () {
            G_SceneManager.showScene('recovery', RecoveryConst.RECOVERY_TYPE_13);
        };
        return returnFunc;
    };
    export function _FUNC_RECOVERY_TYPE14() {
        let returnFunc = function () {
            G_SceneManager.showScene('recovery', RecoveryConst.RECOVERY_TYPE_14);
        };
        return returnFunc;
    };
    export function _FUNC_DINNER() {
        let returnFunc = function (params) {
            if (typeof params == 'string' && params == 'mission') {
                let currDinnerUnitData = G_UserData.getActivityDinner().getCurrDinnerUnitData();
                if (currDinnerUnitData == null) {
                    G_Prompt.showTip(Lang.get('lang_daily_mission_dinner_no_open'));
                    return null;
                }
            }
            G_SceneManager.showScene('activity', ActivityConst.ACT_ID_DINNER);
        };
        return returnFunc;
    };
    export function _FUNC_MONEY_TREE() {
        let currScene = G_SceneManager.getRunningScene();
        if (currScene.getName() == 'activity') {
            let sceneView = currScene.getSceneView();
            if (sceneView.getActivityId && sceneView.getActivityId() == ActivityConst.ACT_ID_MONEY_TREE) {
                return;
            }
        }
        let returnFunc = function () {
            G_SceneManager.showScene('activity', ActivityConst.ACT_ID_MONEY_TREE);
        };
        return returnFunc;
    };
    export function _FUNC_ACTIVITY_RESOURCE_BACK() {
        let returnFunc = function () {
            G_SceneManager.showScene('activity', ActivityConst.ACT_ID_RESROUCE_BACK);
        };
        return returnFunc;
    };
    export function _FUNC_DAILY_SIGN() {
        let returnFunc = function () {
            G_SceneManager.showScene('activity', ActivityConst.ACT_ID_SIGNIN);
        };
        return returnFunc;
    };
    export function _FUNC_TUTORIAL_JUMP_ARENA_AWARD() {
        let returnFunc = function () {
            G_SceneManager.showScene('shop', ShopConst.ARENA_SHOP, ShopConst.ARENA_SHOP_SUB_AWARD);
        };
        return returnFunc;
    };
    export function _FUNC_WORLD_BOSS() {
        let returnFunc = function () {
            G_SceneManager.showScene('worldBoss');
        };
        return returnFunc;
    };
    export function _FUNC_CHAT() {
        let returnFunc = function (channel, chatPlayerData) {
            //TODO:
            let chatMainView = G_SceneManager.getRunningScene().getPopupByName('ChatMainView');
            if (chatMainView) {
                (chatMainView.getComponent(ChatMainView) as ChatMainView).refreshUI(channel, chatPlayerData);
            } else {
                PopupBase.loadCommonPrefab('ChatMainView', (popup: ChatMainView) => {
                    popup.ctor(channel, chatPlayerData);
                    popup.setNotCreateShade(true);
                    popup.open();
                    popup.node.name = ('ChatMainView');
                });
            }
        };
        return returnFunc;
    };
    export function _FUNC_RIOT_HELP() {
        let returnFunc = function () {
            G_SceneManager.showDialog('prefab/territory/PopupTerritoryRiotHelp');
        };
        return returnFunc;
    };
    export function _FUNC_PATROL_AWARDS() {
        let returnFunc = function () {
            G_SceneManager.showScene('territory');
        };
        return returnFunc;
    };
    export function _FUNC_RIOT_AWARDS() {
        let returnFunc = function () {
            G_SceneManager.showScene('territory', true);
        };
        return returnFunc;
    };
    export function _FUNC_RIOT_HAPPEN() {
        let returnFunc = function () {
            G_SceneManager.showScene('territory', true);
        };
        return returnFunc;
    };
    export function _FUNC_WEEKLY_GIFTPKG() {
        let returnFunc = function () {
            G_SceneManager.showScene('activity', ActivityConst.ACT_ID_WEEKLY_GIFT_PKG);
        };
        return returnFunc;
    };
    export function _FUNC_LUXURY_GIFTPKG() {
        let returnFunc = function () {
            G_SceneManager.showScene('activity', ActivityConst.ACT_ID_LUXURY_GIFT_PKG);
        };
        return returnFunc;
    };
    export function _FUNC_FRIEND() {
        let returnFunc = function () {
            G_SceneManager.showScene('friend');
        };
        return returnFunc;
    };
    export function _FUNC_SYNTHESIS() {
        let returnFunc = function () {
            G_SceneManager.showScene('synthesis');
        };
        return returnFunc;
    };
    export function _FUNC_TEAM_SUGGEST() {
        let returnFunc = function () {
            G_SceneManager.showScene('teamSuggest');
        };
        return returnFunc;
    };
    export function _FUNC_GUILD_CONTRIBUTION() {
        let returnFunc = function () {
            let isInGuild = G_UserData.getGuild().isInGuild();
            if (isInGuild) {
                if (!LogicCheckHelper.checkGuildModuleIsOpen(GuildConst.CITY_CONTRIBUTION_ID)) {
                    return;
                }
                let sceneName = G_SceneManager.getRunningSceneName();
                if (sceneName != 'guild') {
                    G_SceneManager.showScene('guild', GuildConst.CITY_CONTRIBUTION_ID);
                } else {
                    let view = G_SceneManager.getRunningScene().getSceneView();
                    view.openBuild(GuildConst.CITY_CONTRIBUTION_ID);
                }
            } else {
                G_SceneManager.showDialog('prefab/guild/PopupGuildListView');
            }
        };
        return returnFunc;
    };
    export function _FUNC_GUILD_FIGHT() {
        let returnFunc = function () {
        };
        return returnFunc;
    };
    export function _FUNC_GUILD_DUNGEON() {
        let returnFunc = function () {
            let isInGuild = G_UserData.getGuild().isInGuild();
            if (isInGuild) {
                if (!LogicCheckHelper.checkGuildModuleIsOpen(GuildConst.CITY_DUNGEON_ID)) {
                    return;
                }
                let sceneName = G_SceneManager.getRunningSceneName();
                if (sceneName != 'guild') {
                    G_SceneManager.showScene('guild', GuildConst.CITY_DUNGEON_ID);
                } else {
                    let view = G_SceneManager.getRunningScene().getSceneView();
                    view.openBuild(GuildConst.CITY_DUNGEON_ID);
                }
            } else {
                G_SceneManager.showDialog('prefab/guild/PopupGuildListView');
            }
        };
        return returnFunc;
    };
    export function _FUNC_GUILD_HELP() {
        let returnFunc = function () {
            console.warn(' ----------------------xxx  ');
            let isInGuild = G_UserData.getGuild().isInGuild();
            if (isInGuild) {
                if (!LogicCheckHelper.checkGuildModuleIsOpen(GuildConst.CITY_HELP_ID)) {
                    return;
                }
                G_SceneManager.showScene('guildHelp');
            } else {
                G_SceneManager.showDialog('prefab/guild/PopupGuildListView');
            }
        };
        return returnFunc;
    };
    export function _FUNC_CARNIVAL_ACTIVITY() {
        let returnFunc = function () {
            G_SceneManager.openPopup('prefab/carnivalActivity/PopupCarnivalActivity', (popup) => {
                popup.openWithAction();
            })
        };
        return returnFunc;
    };
    export function _FUNC_GUILD_ANSWER() {
        let returnFunc = function () {
            let isInGuild = G_UserData.getGuild().isInGuild();
            if (isInGuild) {
                G_SceneManager.showScene('guildAnswer');
            } else {
                G_Prompt.showTip(Lang.get('lang_guild_answer_no_guild'));
            }
        };
        return returnFunc;
    };
    export function _FUNC_GUILD_SERVER_ANSWER() {
        let returnFunc = function () {
            let isInGuild = G_UserData.getGuild().isInGuild();
            if (isInGuild) {
                G_SceneManager.showScene('guildServerAnswer');
            } else {
                G_Prompt.showTip(Lang.get('lang_guild_answer_no_guild'));
            }
        };
        return returnFunc;
    };
    export function _FUNC_CRYSTAL_SHOP() {
        let returnFunc = function () {
            G_SceneManager.showScene('crystalShop');
        };
        return returnFunc;
    };
    export function _FUNC_CAMP_RACE() {
        let returnFunc = function () {
            let isReplaced = CampRaceHelper.isReplacedBySingleRace();
            if (isReplaced) {
                G_Prompt.showTip(Lang.get('camp_race_look_single_race_tip'));
            } else {
                G_SceneManager.showScene('campRace');
            }
        };
        return returnFunc;
    };
    export function _FUNC_CAMP_RACE_CHAMPION() {
        let returnFunc = function () {
            G_SceneManager.showScene('campRace');
        };
        return returnFunc;
    };
    export function _FUNC_AVOID_GAME() {
        let returnFunc = function () {
            //TODO:
            // G_RealNameService.openRealNameDlg();
        };
        return returnFunc;
    };
    export function _FUNC_CRYSTAL_SHOP_TAB_RECHARGE() {
        let returnFunc = function () {
            G_SceneManager.showScene('crystalShop', 3);
        };
        return returnFunc;
    };
    export function _FUNC_GROUPS() {
        let returnFunc = function () {
            G_SceneManager.showScene('groups', FunctionConst.FUNC_MAUSOLEUM);
        };
        return returnFunc;
    };
    export function _FUNC_CRYSTAL_SHOP_TAB_ACTIVE() {
        let returnFunc = function () {
            G_SceneManager.showScene('crystalShop', 1);
        };
        return returnFunc;
    };
    export function _FUNC_CRYSTAL_SHOP_TAB_CAHRGE() {
        let returnFunc = function () {
            G_SceneManager.showScene('crystalShop', 2);
        };
        return returnFunc;
    };
    export function _FUNC_PET_LIST() {
        let returnFunc = function () {
            G_SceneManager.showScene('pet');
        };
        return returnFunc;
    };
    export function _FUNC_PET_HOME() {
        let returnFunc = function () {
            G_SceneManager.showScene('petMain');
        };
        return returnFunc;
    };
    export function _FUNC_PET_TRAIN_TYPE2() {
        let returnFunc = function () {
            G_SceneManager.showScene('pet');
        };
        return returnFunc;
    };
    export function _FUNC_PET_TRAIN_TYPE3() {
        let returnFunc = function () {
            G_SceneManager.showScene('pet');
        };
        return returnFunc;
    };
    export function _FUNC_PET_HELP() {
        let returnFunc = function () {
            G_SceneManager.openPopup('prefab/pet/PopupPetAttrAdd', (popup) => {
                popup.init(PetConst.PET_DLG_HELP_ADD);
                popup.openWithAction();
            });
        };
        return returnFunc;
    };
    export function _FUNC_PET_HAND_BOOK_ADD() {
        let returnFunc = function () {
            G_SceneManager.openPopup('prefab/pet/PopupPetAttrAdd', (popup) => {
                popup.init(PetConst.PET_DLG_MAP_ADD);
                popup.openWithAction();
            });
        };
        return returnFunc;
    };
    export function _FUNC_PET_HAND_BOOK() {
        let returnFunc = function () {
            G_SceneManager.showScene('petHandBook');
        };
        return returnFunc;
    };
    export function _FUNC_PET_TEAM_SLOT() {
        let petTeamId = G_UserData.getBase().getOn_team_pet_id();
        return WayFuncConvert._FUNC_TEAM_SLOT1(7);
    };
    export function _FUNC_PET_HELP_SLOT1(pos) {
        function changePetCallBack(petId, param, petData) {
            G_UserData.getPet().c2sPetOnTeam(petId, 2, pos - 1);
        }
        pos = pos || 1;
        let petList = G_UserData.getTeam().getPetIdsInHelpWithZero();
        let petId = petList[pos - 1];
        console.log(petId);
        if (petId && petId > 0) {
            let returnFunc = function () {
                console.warn(' _FUNC_TEAM_SLOT  G_SceneManager:showScene(team) pos : ' + pos);
                G_SceneManager.showScene('petDetail', petId, PetConst.PET_RANGE_TYPE_3);
            };
            return returnFunc;
        } else {
            let returnFunc = function () {
                let isEmpty = PopupChoosePetHelper.checkIsEmpty(PopupChoosePetHelper.FROM_TYPE3, [petId]);
                if (isEmpty) {
                    G_Prompt.showTip(Lang.get('pet_popup_list_empty_tip' + PopupChoosePetHelper.FROM_TYPE3));
                } else {
                    G_SceneManager.openPopup('prefab/common/PopupChoosePet', (popupChoosePet: PopupChoosePet) => {
                        popupChoosePet.setTitle(Lang.get("pet_help_replace_title"));
                        popupChoosePet.updateUI(PopupChoosePetHelper.FROM_TYPE3, changePetCallBack, petId);
                        popupChoosePet.openWithAction();
                    });
                }
            };
            return returnFunc;
        }
    };
    export function _FUNC_PET_HELP_SLOT2() {
        return WayFuncConvert._FUNC_PET_HELP_SLOT1(2);
    };
    export function _FUNC_PET_HELP_SLOT3() {
        return WayFuncConvert._FUNC_PET_HELP_SLOT1(3);
    };
    export function _FUNC_PET_HELP_SLOT4() {
        return WayFuncConvert._FUNC_PET_HELP_SLOT1(4);
    };
    export function _FUNC_PET_HELP_SLOT5() {
        return WayFuncConvert._FUNC_PET_HELP_SLOT1(5);
    };
    export function _FUNC_PET_HELP_SLOT6() {
        return WayFuncConvert._FUNC_PET_HELP_SLOT1(6);
    };
    export function _FUNC_PET_HELP_SLOT7() {
        return WayFuncConvert._FUNC_PET_HELP_SLOT1(7);
    };
    export function _FUNC_RECHARGE_REBATE() {
        let returnFunc = function () {
            G_SceneManager.openPopup('prefab/common/PopupRechargeRebate', (popup) => {
                popup.openWithAction();
            });
        };
        return returnFunc;
    };
    export function _FUNC_SILKBAG() {
        let returnFunc = function () {
            G_SceneManager.showScene('silkbag');
        };
        return returnFunc;
    };
    export function _FUNC_AVATAR_MORE_BTN() {
        let returnFunc = function () {
            G_SceneManager.showScene('avatar');
        };
        return returnFunc;
    };
    export function _FUNC_AVATAR_ACTIVITY() {
        let returnFunc = function () {
            let actUnitData = G_UserData.getCustomActivity().getAvatarActivity();
            if (actUnitData && G_UserData.getCustomActivity().isAvatarActivityVisible()) {
                G_SceneManager.showScene("customActivity", actUnitData.getAct_id());
            } else {
                G_Prompt.showTip(Lang.get('customactivity_avatar_act_not_open'));
            }
        };
        return returnFunc;
    };
    export function _FUNC_AVATAR_ACTIVITY_SHOP() {
        let returnFunc = function () {
            G_SceneManager.showScene('avatarShop');
        };
        return returnFunc;
    };
    export function _FUNC_EQUIP_ACTIVITY() {
        let returnFunc = function () {
            let actUnitData = G_UserData.getCustomActivity().getEquipActivity();
            if (actUnitData && G_UserData.getCustomActivity().isEquipActivityVisible()) {
                G_SceneManager.showScene("customActivity", actUnitData.getAct_id());
            } else {
                G_Prompt.showTip(Lang.get('customactivity_equip_act_not_open'));
            }
        };
        return returnFunc;
    };
    export function _FUNC_EQUIP_ACTIVITY_SHOP() {
        let returnFunc = function () {
            let actUnitData = G_UserData.getCustomActivity().getEquipActivity();
            if (actUnitData && G_UserData.getCustomActivity().isEquipActivityVisible()) {
                G_SceneManager.showScene('equipActiveShop');
            } else {
                G_Prompt.showTip(Lang.get('customactivity_equip_act_not_open'));
            }
        };
        return returnFunc;
    };
    export function _FUNC_PET_ACTIVITY() {
        let returnFunc = function () {
            let actUnitData = G_UserData.getCustomActivity().getPetActivity();
            if (actUnitData && G_UserData.getCustomActivity().isPetActivityVisible()) {
                G_SceneManager.showScene("customActivity", actUnitData.getAct_id());
            } else {
                G_Prompt.showTip(Lang.get('customactivity_pet_act_not_open'));
            }
        };
        return returnFunc;
    };
    export function _FUNC_PET_ACTIVITY_SHOP() {
        let returnFunc = function () {
            let actUnitData = G_UserData.getCustomActivity().getPetActivity();
            if (actUnitData && G_UserData.getCustomActivity().isPetActivityVisible()) {
                G_SceneManager.showScene('petActiveShop');
            } else {
                G_Prompt.showTip(Lang.get('customactivity_pet_act_not_open'));
            }
        };
        return returnFunc;
    };
    export function _FUNC_HORSE_CONQUER_ACTIVITY() {
        let returnFunc = function () {
            let actUnitData = G_UserData.getCustomActivity().getHorseConquerActivity();
            if (actUnitData && G_UserData.getCustomActivity().isHorseConquerActivityVisible()) {
                G_SceneManager.showScene("customActivity", actUnitData.getAct_id());
            } else {
                G_Prompt.showTip(Lang.get('customactivity_horse_conquer_act_not_open'));
            }
        };
        return returnFunc;
    };
    export function _FUNC_HORSE_CONQUER_ACTIVITY_SHOP() {
        let returnFunc = function () {
            let actUnitData = G_UserData.getCustomActivity().getHorseConquerActivity();
            if (actUnitData && G_UserData.getCustomActivity().isHorseConquerActivityVisible()) {
                G_SceneManager.showScene('horseConquerActiveShop');
            } else {
                G_Prompt.showTip(Lang.get('customactivity_horse_conquer_act_not_open'));
            }
        };
        return returnFunc;
    };
    export function _FUNC_RUNNING_MAN() {
        // console.warn('WayFuncConvert._FUNC_RUNNING_MAN');
        let returnFunc = function () {
            G_SceneManager.showScene('runningMan');
        };
        return returnFunc;
    };
    export function _FUNC_SHARE_GO() {
        let returnFunc = function () {
            G_SceneManager.openPopup('prefab/share/PopupShare', (popup) => {
                popup.setPosition(G_ResolutionManager.getDesignCCPoint());
                popup.open();
            });
        };
        return returnFunc;
    };
    export function _FUNC_RUNNING_BET(/*#...#*/) {
        console.warn('WayFuncConvert.FUNC_RUNNING_BET');
        let returnFunc = function (/*#...#*/) {
            G_SceneManager.openPopup('prefab/runningMan/PopupRunningMan', (popup) => {
                popup.openWithAction();
            });
        };
        return returnFunc;
    };
    export function _FUNC_ENEMY_REVENGE_LOG(/*#...#*/) {
        let returnFunc = function (/*#...#*/) {
            G_SceneManager.showScene('friend', FriendConst.ENEMY_LIST, true);
        };
        return returnFunc;
    };
    export function _FUNC_HOMELAND(/*#...#*/) {
        console.warn('WayFuncConvert._FUNC_HOMELAND');
        let returnFunc = function (/*#...#*/) {
            G_SceneManager.showScene('homeland');
        };
        return returnFunc;
    };
    export function _FUNC_COUNTRY_BOSS() {
        let returnFunc = function () {
            let isInGuild = G_UserData.getGuild().isInGuild();
            if (!isInGuild) {
                G_Prompt.showTip(Lang.get('country_boss_no_guild_tip'));
                return;
            }
            CountryBossHelper.enterCountryBossView();
        };
        return returnFunc;
    };
    export function _FUNC_LINKAGE_ACTIVITY() {
        let returnFunc = function () {
            G_SceneManager.openPopup('prefab/common/PopupSgsActivity')
        };
        return returnFunc;
    };
    export function _FUNC_LINKAGE_ACTIVITY2() {
        let returnFunc = function () {
            G_SceneManager.openPopup('prefab/common/PopupLinkageActivity')
        };
        return returnFunc;
    };
    export function _FUNC_GUILD_WAR() {
        let returnFunc = function () {
            G_SceneManager.showScene('guildwar');
        };
        return returnFunc;
    };
    export function _FUNC_CHAPTER_BOSS() {
        let returnFunc = function () {
            let chapterData = G_UserData.getChapter();
            let bossChapters = chapterData.getBossChapters();
            if (bossChapters.length != 0) {
                G_SceneManager.openPopup('prefab/chapter/PopupBossCome', (popup) => {
                    popup.init(bossChapters);
                    popup.open();
                });
            }
        };
        return returnFunc;
    };
    export function _FUNC_HORSE() {
        let returnFunc = function () {
            G_SceneManager.showScene('horse');
        };
        return returnFunc;
    };
    export function _FUNC_HORSE_RACE() {
        let returnFunc = function () {
            G_SceneManager.showScene('horseRace');
        };
        return returnFunc;
    };
    export function _FUNC_MAUSOLEUM() {
        let returnFunc = function () {
            G_SceneManager.showScene('qinTomb');
        };
        return returnFunc;
    };
    export function _FUNC_HORSE_JUDGE() {
        let returnFunc = function () {
            G_SceneManager.showScene('horseJudge');
        };
        return returnFunc;
    };
    export function _FUNC_SEASONSOPRT(/*#...#*/) {
        let returnFunc = function (/*#...#*/) {
            G_SceneManager.showScene('seasonSport');
        };
        return returnFunc;
    };
    export function _FUNC_GACHA_GOLDENHERO(/*#...#*/) {
        let returnFunc = function (/*#...#*/) {
            G_SceneManager.showScene('gachaGoldenHeroChooseZhenyin');
        };
        return returnFunc;
    };
    export function _FUNC_SUPER_VIP(/*#...#*/) {
        let returnFunc = function (/*#...#*/) {
            G_SceneManager.showDialog('prefab/svip/PopupSvipContact');
        };
        return returnFunc;
    };
    export function _FUNC_SUPER_VIP_2(/*#...#*/) {
        let returnFunc = function (/*#...#*/) {
            G_SceneManager.showDialog('prefab/svip/PopupSvipContact2');
        };
        return returnFunc;
    };
    export function _FUNC_OPPO_FORUM(/*#...#*/) {
        let returnFunc = function (/*#...#*/) {
            //TODO:
            // if (G_NativeAgent.hasForum()) {
            //     G_NativeAgent.openForum();
            // }
        };
        return returnFunc;
    };
    export function _FUNC_HORSE_JUDGE_ACTIVITY() {
        let returnFunc = function () {
            let actUnitData = G_UserData.getCustomActivity().getHorseJudgeActivity();
            if (actUnitData && G_UserData.getCustomActivity().isHorseJudgeActivityVisible()) {
                G_SceneManager.showScene("customActivity", actUnitData.getAct_id());
            } else {
                G_Prompt.showTip(Lang.get('customactivity_horse_judge_act_not_open'));
            }
        };
        return returnFunc;
    };
    export function _FUNC_RICH_MAN_INFO_COLLECT(/*#...#*/) {
        let returnFunc = function (/*#...#*/) {
            G_SceneManager.showDialog('app.scene.view.svip.PopupSvipInfoRegiste');
        };
        return returnFunc;
    };
    export function _FUNC_HISTORY_HERO() {
        let returnFunc = function (pos) {
            G_SceneManager.showScene('historyheroTrain', pos);
        };
        return returnFunc;
    };
    export function _FUNC_HISTORY_HERO_LIST() {
        let returnFunc = function () {
            G_SceneManager.showScene('historyherolist');
        };
        return returnFunc;
    };
    export function _FUNC_SINGLE_RACE() {
        let returnFunc = function () {
            G_SceneManager.showScene('singleRace');
        };
        return returnFunc;
    };
    export function _FUNC_SINGLE_RACE_CHAMPION() {
        let returnFunc = function () {
            G_SceneManager.showScene('singleRace');
        };
        return returnFunc;
    };
    export function _FUNC_GUILD_CROSS_WAR(/*#...#*/) {
        let returnFunc = function (/*#...#*/) {
            G_SceneManager.showScene('guildCrossWar');
        };
        return returnFunc;
    };
    export function _FUNC_CROSS_WORLD_BOSS() {
        var returnFunc = function (fromLayer) {
            var availabelTime = G_UserData.getCrossWorldBoss().getShow_time();
            var endTime = G_UserData.getCrossWorldBoss().getEnd_time();
            var currTime = G_ServerTime.getTime();
            var userId = G_UserData.getBase().getId();
            var data = G_StorageManager.load('crossbossdata' + userId) || {};
            var currTime = G_ServerTime.getTime();
            var currDay = new Date(currTime).getDay();
            if (data.day == currDay || fromLayer == 'DailyActivityHint' && CrossWorldBossHelperT.checkIsTodayOver()) {
                G_SceneManager.showScene('crossWorldBoss');
            } else {
                var bossId = G_UserData.getCrossWorldBoss().getBoss_id();
                if (bossId == null || bossId == 0) {
                    G_SceneManager.showScene('crossWorldBoss');
                    return;
                }
                G_SceneManager.showDialog("prefab/crossWorldBoss/PopupCrossWorldBossSign");
            }
        };
        return returnFunc;
    };

    export function _FUNC_EQUIP_TRAIN_TYPE3() {
        let returnFunc = function () {
            if (!LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_EQUIP_TRAIN_TYPE3)[0]) {
                return;
            }
            let tabIndex = PackageHelper.getPackTabIndex(PackageViewConst.TAB_JADESTONE) || 1;
            G_SceneManager.showScene('package', tabIndex);
        };
        return returnFunc;
    };
    export function _FUNC_TRAIN_MEMBER_LIST() {
        let returnFunc = function () {
            let isInGuild = G_UserData.getGuild().isInGuild();
            if (isInGuild) {
                G_SceneManager.openPopup('prefab/guild/PopupGuildHall', (popup) => {
                    popup.openWithAction();
                    popup.onTabSelect(1);
                });
            } else {
                G_SceneManager.showDialog('prefab/guild/PopupGuildListView');
            }
        };
        return returnFunc;
    };
    export function _FUNC_RED_PACKET_RAIN() {
        let returnFunc = function () {
            let openTime = G_UserData.getRedPacketRain().getActOpenTime();
            let endTime = G_UserData.getRedPacketRain().getActEndTime();
            let curTime = G_ServerTime.getTime();
            if (curTime >= openTime && curTime < endTime) {
                if (G_UserData.getRedPacketRain().isPlayed()) {
                    G_Prompt.showTip(Lang.get('red_packet_rain_act_played_tip'));
                } else {
                    G_SceneManager.showScene('redPacketRain');
                }
            } else {
                let [hour, min] = G_ServerTime.getCurrentHHMMSS(openTime);
                G_Prompt.showTip(Lang.get('red_packet_rain_act_start_tip', {
                    hour: hour,
                    min: min
                }));
            }
        };
        return returnFunc;
    };
    export function _FUNC_CAKE_ACTIVITY() {
        let returnFunc = function () {
            let curTime = G_ServerTime.getTime();
            let startTime = CakeActivityDataHelper.getAllServerStageStartTime();
            if (curTime >= startTime - 2 && curTime <= startTime) {
                return;
            }
            G_SceneManager.showScene('cakeActivity');
        };
        return returnFunc;
    };
    export function _FUNC_CAKE_ACTIVITY_SHOP() {
        let returnFunc = function () {
            if (!LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_CAKE_ACTIVITY_SHOP)[0]) {
                return;
            }
            let [actStage] = CakeActivityDataHelper.getActStage();
            if (actStage == CakeActivityConst.ACT_STAGE_0) {
                G_Prompt.showTip(Lang.get('cake_activity_act_end_tip'));
            } else {
                G_SceneManager.showScene('cakeActivityShop');
            }
        };
        return returnFunc;
    };
    export function _FUNC_SEVEN_DAY_RECHARGE() {
        let returnFunc = function () {
            G_SceneManager.openPopup('prefab/day7Recharge/PopupDay7Recharge', (popup) => {
                popup.openWithAction();
            })
        };
        return returnFunc;
    };

    export function _FUNC_SUPER_CHARGE_GIFT() {
        let returnFunc = function () {
            G_SceneManager.openPopup('prefab/superCharge/PopupSuperChargeActivity', (popup) => {
                popup.openWithAction();
            })
        };
        return returnFunc;
    };

    export function _FUNC_WX_SHARE() {
        let returnFunc = function () {
            G_SceneManager.openPopup('prefab/wxService/PopupWxShare', (popup) => {
                popup.openWithAction();
            })
        };
        return returnFunc;
    };


    export function _FUNC_TACTICS() {
        var returnFunc = function () {
            G_SceneManager.showScene('tactics');
        };
        return returnFunc;
    };

    export function _FUNC_ICON_MERGE() {
        var returnFunc = function () {
            var sceneName = G_SceneManager.getRunningSceneName();
            if (sceneName == 'main') {
                let mainMenuLayer = Util.getSubNodeByName(G_SceneManager.getRunningScene().node, 'MainMenuLayer').getComponent(MainMenuLayer)
                if (mainMenuLayer) {
                    mainMenuLayer.onBagMergeBtn();
                }
            }
        };
        return returnFunc;
    };
    export function _FUNC_TEN_JADE_AUCTION() {
        var returnFunc = function () {
            if (!LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_TEN_JADE_AUCTION)[0]) {
                return;
            }
            G_SceneManager.showScene('tenJadeAuction');
        };
        return returnFunc;
    }
};
