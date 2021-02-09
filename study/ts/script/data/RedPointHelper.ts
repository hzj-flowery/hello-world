import { G_ConfigLoader, G_GameAgent, G_UserData } from "../init";
import { unpack } from "../utils/GlobleFunc";
import { LogicCheckHelper } from "../utils/LogicCheckHelper";
import { UserDataHelper } from "../utils/data/UserDataHelper";
import { FunctionConst } from "../const/FunctionConst";
import { FunctionCheck } from "../utils/logic/FunctionCheck";
import MainMenuLayer from "../scene/view/main/MainMenuLayer";
import { AvatarDataHelper } from "../utils/data/AvatarDataHelper";
import { TypeConvertHelper } from "../utils/TypeConvertHelper";
import { DataConst } from "../const/DataConst";
import { HorseDataHelper } from "../utils/data/HorseDataHelper";
import { PetTrainHelper } from "../scene/view/petTrain/PetTrainHelper";
import HeroGoldHelper from "../scene/view/heroGoldTrain/HeroGoldHelper";
import { EquipTrainHelper } from "../scene/view/equipTrain/EquipTrainHelper";
import HorseConst from "../const/HorseConst";
import { RedPointConst } from "../const/RedPointConst";
import { GuildConst } from "../const/GuildConst";
import { InstrumentDataHelper } from "../utils/data/InstrumentDataHelper";
import { HorseRaceHelper } from "../scene/view/horseRace/HorseRaceHelper";
import { Day7RechargeConst } from "../const/Day7RechargeConst";
import { ShopConst } from "../const/ShopConst";
import { ChatConst } from "../const/ChatConst";
import { ActivityConst } from "../const/ActivityConst";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { Util } from "../utils/Util";
import { GuildDungeonDataHelper } from "../utils/data/GuildDungeonDataHelper";

export namespace RedPointHelper {
    export function getMoudleTable(funcId) {
        let funcName = FunctionConst.getFuncName(funcId);
        let retFunc = RedPointHelper['_' + funcName];
        if (retFunc != null && typeof retFunc == 'object') {
            return retFunc;
        }
        return null;
    };
    export function isModuleReach(functionId, params?) {
        let osTime = Date.now();
        let tParams = null;
        if (params != null && typeof params == 'object') {
            tParams = unpack(params);
        }
        let value = functionId;
        let isFunctionOpen = FunctionCheck.funcIsShow(functionId);
        if (isFunctionOpen == false) {
            return false;
        }
        let retValue = false;
        let moudleTable = RedPointHelper.getMoudleTable(functionId);
        if (moudleTable && moudleTable.mainRP) {
            retValue = moudleTable.mainRP(params);
        }
        //let runningTime = Date.now() - osTime;
        return retValue;
    };
    export function isModuleSubReach(functionId, key, params?) {
        let tParams = null;
        if (params != null && typeof params == 'object') {
            tParams = unpack(params);
        }
        let value = functionId;
        let isFunctionOpen = FunctionCheck.funcIsShow(functionId);
        if (isFunctionOpen == false) {
            return false;
        }
        let moudleTable = RedPointHelper.getMoudleTable(functionId);
        if (moudleTable && moudleTable[key]) {
            return moudleTable[key](params);
        }
        return false;
    };
    
    //军团试炼
    export const _FUNC_GUILD_DUNGEON = {
        mainRP:function(){
            var count = GuildDungeonDataHelper.getGuildDungenoFightCount();
            var res = GuildDungeonDataHelper.isGuildDungenoInAttackTime();
            var inAttackTime = res[0];
            return count>0&&inAttackTime;
        }
    }

     //成长基金
     export const  _FUNC_GROWTH_FUND = {
        mainRP: function (params) {
            let curLevel = G_UserData.getBase().getLevel();
            let showLevel = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL).get(FunctionConst.FUNC_GROWTH_FUND).show_level;
            var redPointShow = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_WELFARE, 'subActivity', ActivityConst.ACT_ID_OPEN_SERVER_FUND);
            return redPointShow||(curLevel>=showLevel&&Util.remberActivityViewOpen==false);
        }
    }
    //每日礼包
    export const _FUNC_DAILY_GIFT_PACK = {
        mainRP: function (params) {
            var redPointShow = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_WELFARE, 'subActivity', ActivityConst.ACT_ID_LUXURY_GIFT_PKG);
            return redPointShow;
        }
    }
    //限时任务
    export const _FUNC_TASK_LIMIT =  {
        mainRP:function(){
            var limitTimePoint = RedPointHelper.isModuleReach(FunctionConst.FUNC_CAMP_RACE);
            var canDonate = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_GRAIN_CAR, 'canDonate');
            var canVote = G_UserData.getWorldBoss().isCanVote();
            //有军团试炼也要显示小红点
            var count = GuildDungeonDataHelper.getGuildDungenoFightCount();
            var res = GuildDungeonDataHelper.isGuildDungenoInAttackTime();
            var inAttackTime = res[0];

            return limitTimePoint||canDonate||(count>0&&inAttackTime)||canVote;
        }
    }

    export const _FUNC_MAIL = {
        mainRP: function (params) {
            let redValue = G_UserData.getMails().hasRedPoint();
            return redValue;
        }
    };
    export const _FUNC_GRAIN_CAR = {
        mainRP: function (data) {
            var canDonate = G_UserData.getRedPoint().isGrainCar();
            var canLaunch = G_UserData.getRedPoint().isGrainCarCanLaunch();
            return canDonate || canLaunch;
        },
        canDonate: function (data) {
            return G_UserData.getRedPoint().isGrainCar();
        },
        canLaunch: function (data) {
            return G_UserData.getRedPoint().isGrainCarCanLaunch();
        }
    };
    export const _FUNC_MINE_CRAFT = {
        reportRP: function (params) {
            let value = G_UserData.getRedPoint().isMineNewReport();
            let count = G_UserData.getRedPoint().getCount(18);
            return [
                value,
                count
            ];
        },
        mainRP: function (params) {
            let value = G_UserData.getRedPoint().isMineBeHit();
            let value2 = G_UserData.getMineCraftData().isReachTimeLimit();
            let value3 = G_UserData.getMineCraftData().isPrivilegeRedPoint();
            return value || value2 || value3;
        }
    };
    export const _FUNC_ITEM_BAG2 = {
        mainRP: function (params) {
            var [isOpen] = FunctionCheck.funcIsOpened(FunctionConst.FUNC_HERO_TRAIN_TYPE3);
            var hasRed = false;
            if (isOpen) {
                var hasRedItem = G_UserData.getItems().hasRedPoint();
                var hasRedFragment = G_UserData.getFragments().hasRedPoint({ fragType: 8 });
                var hasRedFragment2 = G_UserData.getFragments().hasRedPoint({ fragType: 6 });
                hasRed = hasRedItem || hasRedFragment || hasRedFragment2;
            } else {
                hasRed = hasRedItem;
            }
            if (hasRed == true) {
                return true;
            }
            var [isHistoryOpen] = FunctionCheck.funcIsOpened(FunctionConst.FUNC_HISTORY_HERO);
            if (isHistoryOpen) {
                var hasRedHistoryHero = G_UserData.getFragments().hasRedPoint({ fragType: 13 });
                var hasRedHistoryHeroEquip = G_UserData.getFragments().hasRedPoint({ fragType: 14 });
                hasRed = hasRed || hasRedHistoryHero || hasRedHistoryHeroEquip;
            }
            return hasRed;
        }
    };
    export const _FUNC_ARENA = {
        mainRP: function (params) {
            let redValue1 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARENA, 'defRP');
            let redValue2 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARENA, 'peekRP');
            let redValue3 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARENA, 'atkTime');
            return redValue1 || redValue2 || redValue3;
        },
        atkTime: function (params) {
            let arenaData = G_UserData.getArenaData().getMyArenaData() as any;
            if (arenaData && arenaData.arenaCount) {
                return arenaData.arenaCount > 0;
            }
            return false;
        },
        atkRP: function (params) {
            return false;
        },
        defRP: function (params) {
            let redValue = G_UserData.getRedPoint().isArenaDefReport();
            return redValue;
        },
        peekRP: function (params) {
            let redValue = G_UserData.getRedPoint().isArenaPeekReport();
            return redValue;
        },
        awardRP: function (params) {
            return false;
        }
    };
    export const _FUNC_DAILY_MISSION = {
        mainRP: function (params) {
            let redValue1 = G_UserData.getDailyMission().getNewAward();
            let redValue2 = G_UserData.getAchievement().getNewAward();
            let redValue3 = RedPointHelper.isModuleReach(FunctionConst.FUNC_CAMP_RACE);
            return redValue1 || redValue2 || redValue3;
        },
        dailyRP: function (params) {
            let redValue1 = G_UserData.getDailyMission().getNewAward();
            return redValue1;
        }
    };
    export const _FUNC_ACHIEVEMENT = {
        mainRP: function () {
            let redValue = G_UserData.getAchievement().getNewAward();
            cc.warn('AchievementData:getNewAward ' + String(redValue));
            return redValue;
        },
        targetRP: function () {
            let redValue = G_UserData.getAchievement().hasAnyAwardCanGet(1) > 0;
            return redValue;
        },
        gameRP: function () {
            let redValue = G_UserData.getAchievement().hasAnyAwardCanGet(2) > 0;
            return redValue;
        },
        firstMeetRP: function () {
            let redValue = G_UserData.getAchievement().hasAnyAwardCanGet(3) > 0;
            return redValue;
        }
    };
    export const _FUNC_MORE = {
        mainRP: function () {
            let funcList = MainMenuLayer.MORE_ICON;
            for (let i in funcList) {
                let value = funcList[i];
                let redPoint = RedPointHelper.isModuleReach(value.funcId);
                if (redPoint == true) {
                    return true;
                }
            }
            return false;
        }
    };
    export const _FUNC_OFFICIAL = {
        mainRP: function () {
            let [redValue] = LogicCheckHelper.checkOfficialLevelUp();
            return redValue;
        }
    };
    export const _FUNC_VIP_GIFT = {
        mainRP: function () {
            let redValue = G_UserData.getVip().hasVipGiftCanBuy();
            return redValue;
        }
    };
    export const _FUNC_RECHARGE = {
        mainRP: function () {
            let redValue = G_UserData.getVip().hasVipGiftCanBuy();
            return redValue;
        }
    };
    export const _FUNC_DRAW_HERO = {
        mainRP: function () {
            let hasFreeTimeGold = G_UserData.getRecruitData().hasFreeGoldCount();
            let hasFreeTime = G_UserData.getRecruitData().hasFreeNormalCount();
            let valueBox = G_UserData.getRecruitData().hasBoxToGet();
            let hasToken1 = G_UserData.getItems().getItemNum(DataConst.ITEM_RECRUIT_TOKEN) > 0;
            let hasToken2 = G_UserData.getItems().getItemNum(DataConst.ITEM_RECRUIT_GOLD_TOKEN) > 0;
            return hasFreeTime || hasFreeTimeGold || valueBox || hasToken1 || hasToken2;
        }
    };
    export const _FUNC_TEAM = {
        mainRP: function () {
            let redValue1 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TEAM, 'posRP');
            let redValue2 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TEAM, 'reinforcementPosRP');
            let redValue3 = AvatarDataHelper.isCanActiveBook();
            let redValue = redValue1 || redValue2 || redValue3;
            return redValue;
        },
        posRP: function () {
            let isHaveEmptyPos = UserDataHelper.isHaveEmptyPos();
            let isHaveHeroNotInBattle = G_UserData.getHero().isHaveHeroNotInBattle();
            return isHaveEmptyPos && isHaveHeroNotInBattle;
        },
        reinforcementEmptyRP: function () {
            let isHaveEmptyReinforcementPos = UserDataHelper.isHaveEmptyReinforcementPos();
            return isHaveEmptyReinforcementPos;
        },
        reinforcementPosRP: function () {
            let isHaveEmptyReinforcementPos = UserDataHelper.isHaveEmptyReinforcementPos();
            let isHaveActiveYokeHeroNotInBattle = G_UserData.getHero().isHaveActiveYokeHeroNotInBattle();
            return isHaveEmptyReinforcementPos && isHaveActiveYokeHeroNotInBattle;
        }
    };
    export const _FUNC_PET_HOME = {
        mainRP: function () {
            let redValue1 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_PET_HOME, 'posRP');
            let redValue2 = G_UserData.getFragments().hasRedPoint({ fragType: TypeConvertHelper.TYPE_PET });
            let redValue3 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, 'petShop');
            let redValue4 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_PET_HOME, 'petMapRP');
            let redValue5 = UserDataHelper.getPetTeamRedPoint();
            // cc.log(redValue5);
            let redValue = redValue1 || redValue2 || redValue3 || redValue4 || redValue5;
            return redValue;
        },
        posRP: function () {
            let isHaveEmptyPos = UserDataHelper.isHaveEmptyPetPos();
            let isHavePetNotInBattle = G_UserData.getPet().isHavePetNotInBattle();
            return isHaveEmptyPos && isHavePetNotInBattle;
        },
        petMapRP: function () {
            let redValue4 = G_UserData.getPet().isPetMapRedPoint();
            return redValue4;
        }
    };
    export const _FUNC_PET_CHANGE = {
        mainRP: function (petUnitData) {
            let redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_PET_CHANGE, 'betterColorRP', petUnitData);
            return redValue;
        },
        betterColorRP: function (petUnitData) {
            let isPrompt = UserDataHelper.isPromptPetBetterColor(petUnitData);
            return isPrompt;
        }
    };
    export const _FUNC_HERO_CHANGE = {
        mainRP: function (heroUnitData) {
            let redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HERO_CHANGE, 'betterColorRP', heroUnitData);
            return redValue;
        },
        betterColorRP: function (heroUnitData) {
            let isPrompt = UserDataHelper.isPromptHeroBetterColor(heroUnitData);
            return isPrompt;
        }
    };
    export const _FUNC_EQUIP = {
        mainRP: function () {
            let heroIds = G_UserData.getTeam().getHeroIds();
            for (let i in heroIds) {
                let heroId = heroIds[i];
                if (heroId > 0) {
                    let redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_EQUIP, 'posRP', i);
                    if (redValue) {
                        return true;
                    }
                }
            }
            return false;
        },
        slotRP: function (param) {
            let r = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_EQUIP)[0]
            if (!r) {
                return false;
            }
            let pos = param.pos;
            let slot = param.slot;
            let isEmtpy = G_UserData.getBattleResource().isHaveEmptyEquipPos(pos, slot);
            if (isEmtpy) {
                let isHave = G_UserData.getEquipment().isHaveEquipmentNotInPos(slot);
                return isHave;
            } else {
                let isBetter = G_UserData.getEquipment().isHaveBetterEquip(pos, slot);
                return isBetter;
            }
        },
        posRP: function (pos) {
            for (let i = 1; i <= 4; i++) {
                let param = {
                    pos: pos,
                    slot: i
                };
                let redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_EQUIP, 'slotRP', param);
                if (redValue) {
                    return true;
                }
            }
            return false;
        }
    };
    export const _FUNC_TREASURE = {
        mainRP: function () {
            let heroIds = G_UserData.getTeam().getHeroIds();
            for (let i in heroIds) {
                let heroId = heroIds[i];
                if (heroId > 0) {
                    let redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TREASURE, 'posRP', i);
                    if (redValue) {
                        return true;
                    }
                }
            }
            return false;
        },
        slotRP: function (param) {
            let pos = param.pos;
            let slot = param.slot;
            let isEmtpy = G_UserData.getBattleResource().isHaveEmptyTreasurePos(pos, slot);
            if (isEmtpy) {
                let isHave = G_UserData.getTreasure().isHaveTreasureNotInPos(slot);
                return isHave;
            } else {
                let isBetter = G_UserData.getTreasure().isHaveBetterTreasure(pos, slot);
                return isBetter;
            }
        },
        posRP: function (pos) {
            for (let i = 1; i <= 2; i++) {
                let param = {
                    pos: pos,
                    slot: i
                };
                let redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TREASURE, 'slotRP', param);
                if (redValue) {
                    return true;
                }
            }
            return false;
        }
    };
    export const _FUNC_INSTRUMENT = {
        mainRP: function () {
            let heroIds = G_UserData.getTeam().getHeroIds();
            for (let i in heroIds) {
                let heroId = heroIds[i];
                if (heroId > 0) {
                    let unitData = G_UserData.getHero().getUnitDataWithId(heroId);
                    let heroBaseId = unitData.getBase_id();
                    let param = {
                        pos: i,
                        heroBaseId: heroBaseId
                    };
                    let redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_INSTRUMENT, 'posRP', param);
                    if (redValue) {
                        return true;
                    }
                }
            }
            return false;
        },
        slotRP: function (param) {
            let pos = param.pos;
            let slot = param.slot;
            let heroBaseId = param.heroBaseId;
            let isEmtpy = G_UserData.getBattleResource().isHaveEmptyInstrumentPos(pos, slot);
            if (isEmtpy) {
                let isHave = G_UserData.getInstrument().isHaveInstrumentNotInPos(heroBaseId);
                return isHave;
            } else {
                let isBetter = G_UserData.getInstrument().isHaveBetterInstrument(pos, heroBaseId);
                return isBetter;
            }
        },
        posRP: function (param) {
            let pos = param.pos;
            let heroBaseId = param.heroBaseId;
            let temp = {
                pos: pos,
                slot: 1,
                heroBaseId: heroBaseId
            };
            let redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_INSTRUMENT, 'slotRP', temp);
            if (redValue) {
                return true;
            }
            return false;
        }
    };
    export const _FUNC_HORSE = {
        mainRP: function () {
            let reach1 = RedPointHelper.isModuleReach(FunctionConst.FUNC_HORSE_LIST);
            let reach2 = RedPointHelper.isModuleReach(FunctionConst.FUNC_HORSE_JUDGE);
            let reach3 = !HorseRaceHelper.isRewardFull();
            let reach4 = RedPointHelper.isModuleReach(FunctionConst.FUNC_HORSE_BOOK);
            return reach1 || reach2 || reach3 || reach4;
        },
        slotRP: function (param) {
            let pos = param.pos;
            let slot = param.slot;
            let heroBaseId = param.heroBaseId;
            let isEmtpy = G_UserData.getBattleResource().isHaveEmptyHorsePos(pos, slot);
            if (isEmtpy) {
                let isHave = G_UserData.getHorse().isHaveHorseNotInPos(heroBaseId);
                return isHave;
            } else {
                let isBetter = G_UserData.getHorse().isHaveBetterHorse(pos, heroBaseId);
                if (param.notCheckEquip) {
                    return isBetter;
                } else {
                    let horseId = G_UserData.getBattleResource().getResourceId(pos, HorseConst.FLAG, 1);
                    let hasEquip = G_UserData.getHorseEquipment().isHaveHorseEquipRP(horseId);
                    return isBetter || hasEquip;
                }
            }
        },
        posRP: function (param) {
            let pos = param.pos;
            let heroBaseId = param.heroBaseId;
            let temp = {
                pos: pos,
                slot: 1,
                heroBaseId: heroBaseId
            };
            let redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HORSE, 'slotRP', temp);
            if (redValue) {
                return true;
            }
            return false;
        }
    };
    export const _FUNC_HORSE_EQUIP = {
        slotRP: function (param) {
            let result = G_UserData.getHorseEquipment().isHorseEquipRP(param);
            return result;
        }
    };
    export const _FUNC_PET_TRAIN_TYPE1 = {
        mainRP: function (petUnit) {
            let redValue = UserDataHelper.isPromptPetUpgrade(petUnit);
            return redValue;
        }
    };
    export const _FUNC_PET_TRAIN_TYPE2 = {
        mainRP: function (petUnit) {
            let redValue = UserDataHelper.isPromptPetBreak(petUnit);
            return redValue;
        }
    };
    export const _FUNC_PET_TRAIN_TYPE3 = {
        mainRP: function (petUnit) {
            let redValue = PetTrainHelper.isPromptPetLimit(petUnit);
            return redValue;
        }
    };
    export const _FUNC_HERO_TRAIN_TYPE1 = {
        mainRP: function (heroUnitData) {
            if (heroUnitData.isPureGoldHero()) {
                return false;
            }
            let redValue = UserDataHelper.isPromptHeroUpgrade(heroUnitData);
            return redValue;
        }
    };
    export const _FUNC_HERO_TRAIN_TYPE2 = {
        mainRP: function (heroUnitData) {
            if (heroUnitData.isPureGoldHero()) {
                let redValue = HeroGoldHelper.heroGoldNeedRedPoint(heroUnitData);
                return redValue;
            }
            let redValue = UserDataHelper.isPromptHeroBreak(heroUnitData);
            return redValue;
        }
    };
    export const _FUNC_HERO_TRAIN_TYPE3 = {
        mainRP: function (heroUnitData) {
            if (heroUnitData.isPureGoldHero()) {
                return false;
            }
            let redValue = UserDataHelper.isPromptHeroAwake(heroUnitData);
            return redValue;
        }
    };
    export const _FUNC_HERO_TRAIN_TYPE4 = {
        mainRP: function (heroUnitData) {
            let r = FunctionCheck.funcIsOpened(FunctionConst.FUNC_HERO_TRAIN_TYPE4)[0]
            if (r == false) {
                return false;
            }
            let redValue = UserDataHelper.isPromptHeroLimit(heroUnitData);
            return redValue;
        }
    };
    export const _FUNC_EQUIP_TRAIN_TYPE1 = {
        mainRP: function (pos) {
            for (let i = 1; i <= 4; i++) {
                let equipId = G_UserData.getBattleResource().getResourceId(pos, 1, i);
                if (equipId) {
                    let equipUnitData = G_UserData.getEquipment().getEquipmentDataWithId(equipId);
                    let redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_EQUIP_TRAIN_TYPE1, 'slotRP', equipUnitData);
                    if (redValue) {
                        return true;
                    }
                }
            }
            return false;
        },
        slotRP: function (equipUnitData) {
            let redValue = UserDataHelper.isPromptEquipStrengthen(equipUnitData);
            return redValue;
        }
    };
    export const _FUNC_EQUIP_TRAIN_TYPE3 = {
        mainRP: function (pos) {
            for (let i = 1; i <= 4; i++) {
                let equipId = G_UserData.getBattleResource().getResourceId(pos, 1, i);
                if (equipId) {
                    let redValue = EquipTrainHelper.needJadeRedPoint(equipId);
                    if (redValue) {
                        return true;
                    }
                }
            }
            return false;
        }
    };
    export const _FUNC_EQUIP_TRAIN_TYPE2 = {
        mainRP: function (pos) {
            for (let i = 1; i <= 4; i++) {
                let equipId = G_UserData.getBattleResource().getResourceId(pos, 1, i);
                if (equipId) {
                    let equipUnitData = G_UserData.getEquipment().getEquipmentDataWithId(equipId);
                    let redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_EQUIP_TRAIN_TYPE2, 'slotRP', equipUnitData);
                    if (redValue) {
                        return true;
                    }
                }
            }
        },
        slotRP: function (equipUnitData) {
            let redValue = UserDataHelper.isPromptEquipRefine(equipUnitData);
            return redValue;
        }
    };
    export const _FUNC_TREASURE_TRAIN_TYPE1 = {
        mainRP: function (pos) {
            for (let i = 1; i <= 2; i++) {
                let treasureId = G_UserData.getBattleResource().getResourceId(pos, 2, i);
                if (treasureId) {
                    let treasureUnitData = G_UserData.getTreasure().getTreasureDataWithId(treasureId);
                    let redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TREASURE_TRAIN_TYPE1, 'slotRP', treasureUnitData);
                    if (redValue) {
                        return true;
                    }
                }
            }
            return false;
        },
        slotRP: function (treasureUnitData) {
            let redValue = UserDataHelper.isPromptTreasureUpgrade(treasureUnitData);
            return redValue;
        }
    };
    export const _FUNC_TREASURE_TRAIN_TYPE2 = {
        mainRP: function (pos) {
            for (let i = 1; i <= 2; i++) {
                let treasureId = G_UserData.getBattleResource().getResourceId(pos, 2, i);
                if (treasureId) {
                    let treasureUnitData = G_UserData.getTreasure().getTreasureDataWithId(treasureId);
                    let redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TREASURE_TRAIN_TYPE2, 'slotRP', treasureUnitData);
                    if (redValue) {
                        return true;
                    }
                }
            }
        },
        slotRP: function (treasureUnitData) {
            let redValue = UserDataHelper.isPromptTreasureRefine(treasureUnitData);
            return redValue;
        }
    };
    export const _FUNC_TREASURE_TRAIN_TYPE3 = {
        mainRP: function (pos) {
            for (let i = 1; i <= 2; i++) {
                let treasureId = G_UserData.getBattleResource().getResourceId(pos, 2, i);
                if (treasureId) {
                    let treasureUnitData = G_UserData.getTreasure().getTreasureDataWithId(treasureId);
                    let redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TREASURE_TRAIN_TYPE3, 'slotRP', treasureUnitData);
                    if (redValue) {
                        return true;
                    }
                }
            }
        },
        slotRP: function (treasureUnitData) {
            let redValue = UserDataHelper.isPromptTreasureLimit(treasureUnitData);
            return redValue;
        }
    };
    export const _FUNC_TREASURE_TRAIN_TYPE4 = {
        mainRP: function (pos) {
            for (var i = 1; i <= 2; i++) {
                var treasureId = G_UserData.getBattleResource().getResourceId(pos, 2, i);
                if (treasureId) {
                    var treasureUnitData = G_UserData.getTreasure().getTreasureDataWithId(treasureId);
                    var redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TREASURE_TRAIN_TYPE4, 'slotRP', treasureUnitData);
                    if (redValue) {
                        return true;
                    }
                }
            }
        },
        slotRP: function (treasureUnitData) {
            var redValue = UserDataHelper.isPromptTreasureLimit(treasureUnitData);
            return redValue;
        }
    };

    export const _FUNC_INSTRUMENT_TRAIN_TYPE1 = {
        mainRP: function (pos) {
            for (let i = 1; i <= 1; i++) {
                let instrumentId = G_UserData.getBattleResource().getResourceId(pos, 3, i);
                if (instrumentId) {
                    let instrumentUnitData = G_UserData.getInstrument().getInstrumentDataWithId(instrumentId);
                    let redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE1, 'slotRP', instrumentUnitData);
                    if (redValue) {
                        return true;
                    }
                }
            }
            return false;
        },
        slotRP: function (instrumentUnitData) {
            let redValue = InstrumentDataHelper.isPromptInstrumentAdvance(instrumentUnitData);
            return redValue;
        }
    };
    export const _FUNC_INSTRUMENT_TRAIN_TYPE2 = {
        mainRP: function (pos) {
            for (let i = 1; i <= 1; i++) {
                let instrumentId = G_UserData.getBattleResource().getResourceId(pos, 3, i);
                if (instrumentId) {
                    let instrumentUnitData = G_UserData.getInstrument().getInstrumentDataWithId(instrumentId);
                    let redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE2, 'slotRP', instrumentUnitData);
                    if (redValue) {
                        return true;
                    }
                }
            }
            return false;
        },
        slotRP: function (instrumentUnitData) {
            let redValue = InstrumentDataHelper.isPromptInstrumentLimit(instrumentUnitData);
            return redValue;
        }
    };
    export const _FUNC_HORSE_TRAIN = {
        mainRP: function (pos) {
            for (let i = 1; i <= 1; i++) {
                let horseId = G_UserData.getBattleResource().getResourceId(pos, HorseConst.FLAG, i);
                if (horseId) {
                    let horseUnitData = G_UserData.getHorse().getUnitDataWithId(horseId);
                    let redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HORSE_TRAIN, 'slotRP', horseUnitData);
                    if (redValue) {
                        return true;
                    }
                }
            }
            return false;
        },
        slotRP: function (horseUnitData) {
            let redValue = HorseDataHelper.isPromptHorseUpStar(horseUnitData);
            return redValue;
        }
    };
    export const _FUNC_HERO_KARMA = {
        mainRP: function (heroUnitData) {
            let config = heroUnitData.getConfig();
            let karmaData = UserDataHelper.getHeroKarmaData(config);
            for (let i in karmaData) {
                let data = karmaData[i];
                let reach = UserDataHelper.getReachCond(heroUnitData, data['cond1'], data['cond2']);
                let isActivated = G_UserData.getKarma().isActivated(data.id);
                let isCanActivate = true;
                let heroIds = data.heroIds;
                for (let j = 1; j <= 3; j++) {
                    let heroId = heroIds[j - 1];
                    if (heroId) {
                        let isHaveHero = G_UserData.getKarma().isHaveHero(heroId);
                        isCanActivate = isCanActivate && isHaveHero;
                    }
                }
                if (isCanActivate && !isActivated && reach) {
                    return true;
                }
            }
            return false;
        }
    };
    let FuncRecycleList = [FunctionConst.FUNC_RECOVERY_TYPE1];
    export const _FUNC_RECYCLE = {
        mainRP: function () {
            let funcList = FuncRecycleList;
            for (let i in funcList) {
                let funcId = funcList[i];
                let redPoint = RedPointHelper.isModuleReach(funcId);
                if (redPoint == true) {
                    return true;
                }
            }
            return false;
        }
    };
    export const _FUNC_RECOVERY_TYPE1 = {
        mainRP: function () {
            let redValue = G_UserData.getHero().isShowRedPointOfHeroRecovery();
            return redValue;
        }
    };
    let FuncAdventureList = [
        FunctionConst.FUNC_PVE_TERRITORY,
        FunctionConst.FUNC_ARENA,
        FunctionConst.FUNC_DAILY_STAGE,
        FunctionConst.FUNC_PVE_SIEGE,
        FunctionConst.FUNC_PVE_TOWER
    ];
    export const _FUNC_ADVENTURE = {
        mainRP: function () {
            let funcList = FuncAdventureList;
            for (let i in funcList) {
                let funcId = funcList[i];
                let redPoint = RedPointHelper.isModuleReach(funcId);
                if (redPoint == true) {
                    return true;
                }
            }
            return false;
        }
    };
    export const _FUNC_PVE_TERRITORY = {
        mainRP: function () {
            let redValue1 = G_UserData.getTerritory().isShowRedPoint();
            let redValue2 = G_UserData.getTerritory().isRiotRedPoint();
            let redValue3 = false;
            let redValue4 = false;
            return redValue1 || redValue2 || redValue3 || redValue4;
        },
        riotRP: function () {
            let redValue2 = G_UserData.getTerritory().isRiotRedPoint();
            return redValue2;
        },
        friendRP: function () {
            let redValue2 = G_UserData.getTerritory().isRiotHelpRedPoint();
            return redValue2;
        }
    };
    export const _FUNC_SHOP_SCENE = {
        mainRP: function () {
            let redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, 'heroShop');
            if (redValue == true) {
                return true;
            }
            redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, 'equipShop');
            if (redValue == true) {
                return true;
            }
            redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, 'arenaShop');
            if (redValue == true) {
                return true;
            }
            redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, 'guildShop');
            if (redValue == true) {
                return true;
            }
            redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, 'petShop');
            if (redValue == true) {
                return true;
            }
            redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, 'instrumentShop');
            if (redValue == true) {
                return true;
            }
            redValue = false;
            return redValue;
        },
        heroShop: function () {
            let [recoverTime, isRecoverFull, intervalTime] = UserDataHelper.getShopRecoverMaxRefreshCountTime(ShopConst.HERO_SHOP);
            let redValue = isRecoverFull;
            return redValue;
        },
        instrumentShop: function () {
            let [recoverTime, isRecoverFull, intervalTime] = UserDataHelper.getShopRecoverMaxRefreshCountTime(ShopConst.INSTRUMENT_SHOP);
            let redValue = isRecoverFull;
            return redValue;
        },
        equipShop: function () {
            let redValue = G_UserData.getShops().isFixShopGoodsCanBuy(ShopConst.EQUIP_SHOP, ShopConst.EQUIP_SHOP_SUB_AWARD);
            return redValue;
        },
        arenaShop: function () {
            let redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, 'arenaShop1');
            if (redValue == true) {
                return true;
            }
            redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, 'arenaShop2');
            if (redValue == true) {
                return true;
            }
            return false;
        },
        arenaShop1: function () {
            let redValue1 = G_UserData.getShops().isFixShopTypeItemCanBuy(ShopConst.ARENA_SHOP, ShopConst.ARENA_SHOP_SUB_ITEM);
            return redValue1;
        },
        arenaShop2: function () {
            let redValue2 = G_UserData.getShops().isFixShopGoodsCanBuy(ShopConst.ARENA_SHOP, ShopConst.ARENA_SHOP_SUB_AWARD);
            return redValue2;
        },
        guildShop: function () {
            let redValue = G_UserData.getShops().isFixShopTypeItemCanBuy(ShopConst.GUILD_SHOP, ShopConst.GUILD_SHOP_SUB_ITEM1);
            return redValue;
        },
        petShop: function () {
            let recoverTime = UserDataHelper.getShopRecoverMaxRefreshCountTime(ShopConst.PET_SHOP), isRecoverFull, intervalTime;
            let redValue = isRecoverFull;
            return redValue;
        }
    };
    export const _FUNC_WELFARE = {
        mainRP: function () {
            return G_UserData.getActivity().hasRedPoint();
        },
        subActivity: function (actId) {
            return G_UserData.getActivity().hasRedPointForSubAct(actId);
        },
        openServerFund: function (param) {
            let fundType = param[0], group = param[1];
            return G_UserData.getActivityOpenServerFund().hasRewardCanReceiveByFundType(fundType, group);
        }
    };
    export const _FUNC_FIRST_RECHARGE = {
        mainRP: function (params) {
            return G_UserData.getActivityFirstPay().hasRedPoint();
        }
    };
    export const _FUNC_ACTIVITY = {
        mainRP: function (params) {
            return G_UserData.getTimeLimitActivity().hasRedPoint();
        },
        subActivityRP: function (params: Array<any>) {
            return G_UserData.getTimeLimitActivity().hasRedPointForSubAct(params[0], params[1]);
        }
    };
    export const _FUNC_WEEK_ACTIVITY = {
        mainRP: function (params) {
            return G_UserData.getDay7Activity().hasRedPoint(params);
        }
    };
    export const _FUNC_CHAT = {
        mainRP: function (params) {
            return G_UserData.getChat().hasRedPoint(params);
        },
        personalChatRP: function (params) {
            return G_UserData.getChat().hasRedPointWithPlayer(params);
        },
        privateChatRp: function (params) {
            return G_UserData.getChat().isChannelHasRedPoint(ChatConst.CHANNEL_PRIVATE);
        }
    };
    export const _FUNC_HERO_LIST = {
        mainRP: function (params) {
            return G_UserData.getFragments().hasRedPoint({ fragType: 1 });
        }
    };
    export const _FUNC_EQUIP_LIST = {
        mainRP: function (params) {
            return G_UserData.getFragments().hasRedPoint({ fragType: 2 });
        }
    };
    export const _FUNC_TREASURE_LIST = {
        mainRP: function (params) {
            return G_UserData.getFragments().hasRedPoint({ fragType: 3 });
        }
    };
    export const _FUNC_INSTRUMENT_LIST = {
        mainRP: function (params) {
            return G_UserData.getFragments().hasRedPoint({ fragType: 4 });
        }
    };
    export const _FUNC_HORSE_LIST = {
        mainRP: function (params) {
            let reach2 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HORSE_LIST, 'fraglist');
            let reach4 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HORSE_LIST, 'equipFraglist');
            return reach2 || reach4;
        },
        list: function () {
            let reach = false;
            let horseDatas = G_UserData.getHorse().getHorseListData();
            for (let id in horseDatas) {
                let unitData = horseDatas[id];
                if (RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HORSE_TRAIN, 'slotRP', unitData)) {
                    reach = true;
                    break;
                }
            }
            return reach;
        },
        fraglist: function () {
            return G_UserData.getFragments().hasRedPoint({ fragType: 12 });
        },
        equipFraglist: function () {
            return G_UserData.getFragments().hasRedPoint({ fragType: 15 });
        }
    };
    export const _FUNC_HORSE_BOOK = {
        mainRP: function (params) {
            let reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HORSE_BOOK, 'horseBook');
            return reach;
        },
        horseBook: function () {
            return G_UserData.getHorse().isHorsePhotoValid();
        }
    };
    export const _FUNC_HORSE_JUDGE = {
        mainRP: function (params) {
            let reach1 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HORSE_JUDGE, 'type1');
            let reach2 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HORSE_JUDGE, 'type2');
            return reach1 || reach2;
        },
        type1: function () {
            let myCount = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_HORSE_CLASSICS);
            return myCount >= HorseConst.JUDGE_COST_COUNT_1;
        },
        type2: function () {
            let myCount = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_HORSE_CLASSICS);
            return myCount >= HorseConst.JUDGE_COST_COUNT_2;
        }
    };
    export const _FUNC_DAILY_STAGE = {
        mainRP: function (params) {
            return G_UserData.getDailyDungeonData().hasRedPoint();
        }
    };
    export const _FUNC_DAILY_STAGE_SWEEP = {
        mainRP: function (params) {
            return G_UserData.getDailyDungeonData().hasRedPoint();
        }
    };
    export const _FUNC_DAILY_STAGE_CHALLENGE = {
        mainRP: function (params) {
            return false//G_UserData.getDailyDungeonData().hasRedPoint();
        }
    };
    export const _FUNC_NEW_STAGE = {
        mainRP: function (params) {
            return G_UserData.getChapter().hasRedPoint();
        }
    };
    export const _FUNC_ELITE_CHAPTER = {
        mainRP: function (params) {
            return G_UserData.getChapter().hasRedPointForExplore(2);
        }
    };
    export const _FUNC_FAMOUS_CHAPTER = {
        mainRP: function (params) {
            return G_UserData.getChapter().hasRedPointForExplore(3);
        }
    };
    export const _FUNC_PVE_SIEGE = {
        mainRP: function (params) {
            return G_UserData.getSiegeData().hasRedPoint();
        }
    };
    export const _FUNC_PVE_TOWER = {
        mainRP: function (params) {
            let r = FunctionCheck.funcIsOpened(FunctionConst.FUNC_PVE_TOWER)[0]
            if (r == false) {
                return false;
            }
            let redValue01 = G_UserData.getTowerData().hasRedPoint();
            let redValue02 = RedPointHelper.isModuleReach(FunctionConst.FUNC_TOWER_SUPER);
            let redValue03 = RedPointHelper.isModuleReach(FunctionConst.FUNC_TOWER_SWEEP);
            let redValue04 = false//RedPointHelper.isModuleReach(FunctionConst.FUNC_TOWER_CHALLENGE);
            return redValue01 || redValue02 || redValue03 || redValue04;
        }
    };
    export const _FUNC_TOWER_SWEEP = {
        mainRP: function (params) {
            let r = FunctionCheck.funcIsOpened(FunctionConst.FUNC_TOWER_SWEEP)[0]
            if (r == false) {
                return false;
            }
            return G_UserData.getTowerData().hasTowerSweepRedPoint();
        }
    };
    export const _FUNC_TOWER_CHALLENGE = {
        mainRP: function (params) {
            let r = FunctionCheck.funcIsOpened(FunctionConst.FUNC_TOWER_CHALLENGE)[0]
            if (r == false) {
                return false;
            }
            return G_UserData.getTowerData().hasTowerChallengeRedPoint();
        }
    };
    export const _FUNC_TOWER_SUPER = {
        mainRP: function (params) {
            let r = FunctionCheck.funcIsOpened(FunctionConst.FUNC_TOWER_SUPER)[0]
            if (r == false) {
                return false;
            }
            return G_UserData.getTowerData().hasSuperStageChallengeCountRedPoint();
        }
    };
    export const _FUNC_QUESTION = {
        mainRP: function (params) {
            return true;
        }
    };
    export const _FUNC_WORLD_BOSS = {
        mainRP: function (params) {
            return false;
        }
    };


    export const _FUNC_ITEM_BAG = {
        mainRP: function (params) {
            var [isOpen] = FunctionCheck.funcIsOpened(FunctionConst.FUNC_HERO_TRAIN_TYPE3);
            var isMerge = UserDataHelper.isEnoughBagMergeLevel();
            var hasRed = false;
            if (isOpen) {
                var hasRedItem = G_UserData.getItems().hasRedPoint();
                var hasRedFragment = G_UserData.getFragments().hasRedPoint({ fragType: 8 });
                var hasRedFragment2 = G_UserData.getFragments().hasRedPoint({ fragType: 6 });
                hasRed = hasRedItem || hasRedFragment || hasRedFragment2;
            } else {
                hasRed = hasRedItem;
            }
            if (hasRed == true) {
                return true;
            }
            if (isMerge) {
                var hasRedEquip = G_UserData.getFragments().hasRedPoint({ fragType: 2 });
                var hasRedTreasure = G_UserData.getFragments().hasRedPoint({ fragType: 3 });
                var hasRedInstrument = G_UserData.getFragments().hasRedPoint({ fragType: 4 });
                hasRed = hasRed || hasRedEquip || hasRedInstrument || hasRedInstrument;
            }
            var [isHistoryOpen] = FunctionCheck.funcIsOpened(FunctionConst.FUNC_HISTORY_HERO);
            if (isHistoryOpen) {
                var hasRedHistoryHero = G_UserData.getFragments().hasRedPoint({ fragType: 13 });
                var hasRedHistoryHeroEquip = G_UserData.getFragments().hasRedPoint({ fragType: 14 });
                hasRed = hasRed || hasRedHistoryHero || hasRedHistoryHeroEquip;
            }
            return hasRed;
        }
    };

    export const _FUNC_ARMY_GROUP = {
        mainRP: function (params) {
            let redValue1 = G_UserData.getGuild().hasAddGuildRedPoint();
            let redValue2 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARMY_GROUP, 'helpRP');
            let redValue3 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARMY_GROUP, 'hallRP');
            let redValue4 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARMY_GROUP, 'contributionRP');
            let redValue5 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARMY_GROUP, 'dungeonRP');
            // cc.warn('  ' + (String(redValue1) + (' ' + (String(redValue2) + (' ' + (String(redValue3) + (' ' + (String(redValue4) + (' ' + String(redValue5))))))))));
            return redValue1 || redValue2 || redValue3 || redValue4;
        },
        myHelpRP: function (params) {
            let redValue1 = G_UserData.getGuild().hasHelpRewardRedPoint();
            let redValue2 = G_UserData.getRedPoint().isHasGuildHelpReceive();
            let redValue3 = G_UserData.getRedPoint().isGuildCanAddHeroHelp();
            // cc.warn('myHelpRP  ' + (String(redValue1) + (' ' + (String(redValue2) + (' ' + String(redValue3))))));
            return redValue1 || redValue2 || redValue3;
        },
        giveHelpRP: function (params) {
            let redValue1 = G_UserData.getRedPoint().isHasRedPointByMaskIndex(RedPointConst.MASK_INDEX_GUILD_HELP);
            return redValue1;
        },
        helpRP: function (params) {
            if (!LogicCheckHelper.checkGuildModuleIsOpen(GuildConst.CITY_HELP_ID, false)) {
                return false;
            }
            let redValue1 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARMY_GROUP, 'myHelpRP');
            let redValue2 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARMY_GROUP, 'giveHelpRP');
            return redValue1 || redValue2;
        },
        hallRP: function (params) {
            if (!LogicCheckHelper.checkGuildModuleIsOpen(GuildConst.CITY_HALL_ID, false)) {
                return false;
            }
            let redValue1 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARMY_GROUP, 'checkApplicationRP');
            let redValue2 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARMY_GROUP, 'redPacketRP');
            let redValue3 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARMY_GROUP, 'guildTaskRP');
            return redValue1 || redValue2 || redValue3;
        },
        checkApplicationRP: function (params) {
            let redValue1 = G_UserData.getRedPoint().isHasGuildCheckApplication();
            return redValue1;
        },
        redPacketRP: function (params) {
            let redValue1 = G_UserData.getRedPoint().isGuildHasRedPacketRedPoint();
            return redValue1;
        },
        contributionRP: function (params) {
            let [r] = LogicCheckHelper.checkGuildModuleIsOpen(GuildConst.CITY_CONTRIBUTION_ID, false);
            if (!r) {
                return false;
            }
            let redValue1 = G_UserData.getRedPoint().isGuildHasContributionRedPoint();
            let redValue2 = G_UserData.getGuild().hasCanContributionRedPoint();
            return redValue1 || redValue2;
        },
        guildTaskRP: function (params) {
            let redValue1 = G_UserData.getRedPoint().isGuildHasTaskRedPoint();
            return redValue1;
        },
        dungeonRP: function (params) {
            if (!LogicCheckHelper.checkGuildModuleIsOpen(GuildConst.CITY_DUNGEON_ID, false)) {
                return false;
            }
            if (!LogicCheckHelper.checkGuildDungeonInOpenTime(false)) {
                return false;
            }
            return G_UserData.getRedPoint().isHasRedPointByMaskIndex(RedPointConst.MASK_INDEX_GUILD_DUNGEON);
        }
    };
    export const _FUNC_FRIEND = {
        mainRP: function (params) {
            let isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_FRIEND)[0];
            if (!isOpen) {
                return false;
            }
            let redValue1 = G_UserData.getFriend().hasApplyRedPoint();
            let redValue2 = G_UserData.getFriend().hasGetEnergyRedPoint();
            return redValue1 || redValue2;
        }
    };
    export const _FUNC_SYNTHESIS = {
        mainRP: function (params) {
            return G_UserData.getSynthesis().checkCanSynthesis();
        }
    };
    export const _FUNC_CRYSTAL_SHOP = {
        mainRP: function (params) {
            let isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_CRYSTAL_SHOP)[0];
            if (!isOpen) {
                return false;
            }
            return G_UserData.getCrystalShop().hasRedPoint();
        }
    };
    export const _FUNC_AVATAR = {
        mainRP: function () {
            let isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_AVATAR)[0];
            if (!isOpen) {
                return false;
            }
            let redValue1 = AvatarDataHelper.isPromptChange();
            let redValue2 = AvatarDataHelper.isCanActiveBook();
            return redValue1 || redValue2;
        }
    };
    export const _FUNC_CARNIVAL_ACTIVITY = {
        mainRP: function (params) {
            let isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_CARNIVAL_ACTIVITY)[0];
            if (!isOpen) {
                return false;
            }
            return G_UserData.getCarnivalActivity().isHasRedPoint();
        }
    };
    export const _FUNC_SILKBAG = {
        mainRP: function (pos) {
            for (let i = 1; i <= 6; i++) {
                let param = {
                    pos: pos,
                    slot: i
                };
                let redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SILKBAG, 'slotRP', param);
                if (redValue) {
                    return true;
                }
            }
            return false;
        },
        slotRP: function (param) {
            let pos = param.pos;
            let slot = param.slot;
            return G_UserData.getSilkbag().isHaveRedPoint(pos, slot);
        }
    };
    export const _FUNC_AUCTION = {
        mainRP: function (pos) {
            let isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_AUCTION)[0];
            if (!isOpen) {
                return false;
            }
            return G_UserData.getAuction().isHaveRedPoint();
        }
    };
    export const _FUNC_LINKAGE_ACTIVITY = {
        mainRP: function (params) {
            let isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_LINKAGE_ACTIVITY)[0];
            if (!isOpen) {
                return false;
            }
            return G_UserData.getLinkageActivity().hasRedPoint();
        }
    };
    export const _FUNC_LINKAGE_ACTIVITY2 = {
        mainRP: function (params) {
            let isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_LINKAGE_ACTIVITY)[0];
            if (!isOpen) {
                return false;
            }
            return G_UserData.getLinkageActivity().hasRedPoint();
        }
    };
    export const _FUNC_HOMELAND = {
        mainRP: function () {
            return G_UserData.getHomeland().hasRedPoint();
        }
    };
    export const _FUNC_CAMP_RACE = {
        mainRP: function () {
            return G_UserData.getCampRaceData().hasRedPoint();
        }
    };
    export const _FUNC_RUNNING_MAN = {
        mainRP: function () {
            return G_UserData.getRunningMan().hasRedPoint();
        }
    };
    export const _FUNC_RICH_MAN_INFO_COLLECT = {
        mainRP: function () {
            return false;
        }
    };
    export const _FUNC_SEASONSOPRT = {
        mainRP: function () {
            return G_UserData.getRedPoint().isSeasonDailyReward();
        }
    };
    export const _FUNC_GUILD_CROSS_WAR = {
        mainRP: function () {
            return G_UserData.getRedPoint().isGuildCrossWarGuess() || G_UserData.getRedPoint().isGuildCrossWarCamp();
        },
        inspireSupport: function (data) {
            return G_UserData.getRedPoint().isGuildCrossWarGuess();
        }
    };
    export const _FUNC_GROUPS = {
        mainRP: function () {
            return G_UserData.getGroups().hasRedPoint();
        }
    };
    export const _FUNC_TITLE = {
        mainRP: function () {
            return G_UserData.getTitles().isHasRedPoint();
        }
    };
    export const _FUNC_HEAD_FRAME = {
        mainRP: function () {
            return G_UserData.getHeadFrame().hasRedPoint();
        }
    };
    export const _FUNC_SINGLE_RACE = {
        mainRP: function () {
            return G_UserData.getRedPoint().isSingleRaceGuess();
        }
    };
    export const _FUNC_CAKE_ACTIVITY_SHOP = {
        mainRP: function () {
            return G_UserData.getCakeActivity().isShowShopRedPoint();
        }
    };
    export const _FUNC_CAKE_ACTIVITY = {
        mainRP: function () {
            let redValue1 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_CAKE_ACTIVITY, 'getMaterial');
            let redValue2 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_CAKE_ACTIVITY, 'giveMaterial');
            let redValue3 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_CAKE_ACTIVITY, 'getLevelUpAward');
            let redValue4 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_CAKE_ACTIVITY, 'getDailyAward');
            return redValue1 || redValue2 || redValue3 || redValue4;
        },
        getMaterial: function (params) {
            let redValue1 = G_UserData.getCakeActivity().isHaveCanGetMaterial();
            let redValue2 = G_UserData.getCakeActivity().isPromptRecharge();
            return redValue1 || redValue2;
        },
        giveMaterial: function (params) {
            return G_UserData.getCakeActivity().isHaveCanGiveMaterial();
        },
        getLevelUpAward: function (params) {
            return G_UserData.getCakeActivity().isHaveCanGetLevelUpAward();
        },
        getDailyAward: function (params) {
            return G_UserData.getCakeActivity().isHaveCanGetDailyAward();
        }
    };
    export const _FUNC_GACHA_GOLDENHERO = {
        mainRP: function () {
            return G_UserData.getRedPoint().isGachaGoldenHero();
        }
    };
    export const _FUNC_WX_SERVICE = {
        mainRP: function () {
            return !cc.sys.localStorage.getItem('hasOpenWxService');
        }
    };
    export const _FUNC_WX_COLLECT = {
        mainRP: function () {
            return !cc.sys.localStorage.getItem('hasOpenWxCollect');
        }
    };
    export const _FUNC_SEVEN_DAY_RECHARGE = {
        mainRP: function () {
            return G_UserData.getDay7Recharge().isShowRedPointWithType(Day7RechargeConst.TASK_TYPE_1)
        }
    }


    export const _FUNC_HISTORY_HERO = {
        mainRP: function () {
            var redValue1 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HISTORY_HERO, 'getMaterial');
            return redValue1;
        },
        getMaterial: function () {
            var redValue = G_UserData.getHistoryHero().existCanBreakHistoryHero();
            return redValue;
        }
    };
    export const _FUNC_HISTORY_HERO_WAKEN = {
        mainRP: function (data) {
            return data.enoughMaterial();
        }
    };
    export const _FUNC_HISTORY_HERO_BREAK = {
        mainRP: function (data) {
            return data.materialAllReady();
        }
    };
    export const _FUNC_HISTORY_FORMATION = {
        mainRP: function () {
            var redValue1 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HISTORY_FORMATION, 'space');
            var redValue2 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HISTORY_FORMATION, 'stronger');
            return redValue1 || redValue2;
        },
        space: function () {
            var redValue = G_UserData.getHistoryHero().existSpaceOnFormation();
            return redValue;
        },
        stronger: function () {
            var redValue = G_UserData.getHistoryHero().existStrongerHero();
            return redValue;
        },
        strongerThanMe: function (data) {
            var redValue = data.existStronger();
            return redValue;
        }
    };
    export const _FUNC_RED_PET = {
        mainRP: function (data) {
            var hasFreeTimes = G_UserData.getRedPoint().isRedPetShow();
            return hasFreeTimes;
        }
    };
    export const _FUNC_ICON_MERGE = {
        mainRP: function () {
            var funcList = MainMenuLayer.BAG_MERGE;
            for (let i in funcList) {
                var value = funcList[i];
                var redPoint = RedPointHelper.isModuleReach(value.funcId);
                if (redPoint == true) {
                    return true;
                }
            }
            return false;
        }
    };
    export const _FUNC_TACTICS = {
        mainRP: function (color) {
            var unitList = G_UserData.getTactics().getCanUnlockList(color);
            return unitList.length > 0;
        },
        teamRP: function () {
            var heroIds = G_UserData.getTeam().getHeroIds();
            for (var i in heroIds) {
                var heroId = heroIds[i];
                if (heroId > 0) {
                    var redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TACTICS, 'posRP', i);
                    if (redValue) {
                        return true;
                    }
                }
            }
            return false;
        },
        slotRP: function (param) {
            if (LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_TACTICS)[0] == false) {
                return false;
            }
            var pos = param.pos;
            var slot = param.slot;
            var isEmtpy = G_UserData.getBattleResource().isHaveEmptyTacticsPos(pos, slot);
            if (isEmtpy) {
                var isHave = G_UserData.getTactics().isHaveTacticsNotInPos(pos, slot);
                return isHave;
            } else {
                var isBetter = G_UserData.getTactics().isHaveBetterTactics(pos, slot);
                return isBetter;
            }
        },
        posRP: function (pos) {
            for (var i = 1; i != 3; i++) {
                var param = {
                    pos: pos,
                    slot: i
                };
                var redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TACTICS, 'slotRP', param);
                if (redValue) {
                    return true;
                }
            }
            return false;
        }
    };
    // export const _FUNC_RETURN_CONFIRM = {
    //     mainRP: function (params) {
    //         if (G_GameAgent.isLoginReturnServer() == false) {
    //             return false;
    //         }
    //         var [isOpen] = FunctionCheck.funcIsOpened(FunctionConst.FUNC_RETURN_CONFIRM);
    //         if (isOpen == false) {
    //             return false;
    //         }
    //         var info = G_GameAgent.getReturnServerInfo();
    //         if (info.alreadyBackSid && info.alreadyBackSid != '') {
    //             return false;
    //         }
    //         return true;
    //     }
    // };
    // export const  _FUNC_RETURN_AWARD = {
    //     mainRP: function (params) {
    //         if (G_GameAgent.isLoginReturnServer() == false) {
    //             return false;
    //         }
    //         var [isOpen] = FunctionCheck.funcIsOpened(FunctionConst.FUNC_RETURN_AWARD);
    //         if (isOpen == false) {
    //             return false;
    //         }
    //         var returnSvr = G_UserData.getBase().getReturnSvr();
    //         if (returnSvr == null) {
    //             return false;
    //         }
    //         var list = ReturnServerDataHelper.getReturnAwardList();
    //         for (let i in list) {
    //             var unit = list[i];
    //             if (returnSvr.isCanReceive(unit.id)) {
    //                 return true;
    //             }
    //         }
    //         return false;
    //     }
    // };
    export const  _FUNC_BOUT = {
        mainRP: function () {
            return G_UserData.getBout().isMainRed();
        }
    };

}