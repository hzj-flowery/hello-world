import { assert, clone } from "../GlobleFunc";
import { AttrDataHelper } from "./AttrDataHelper";
import { G_UserData, G_ConfigLoader } from "../../init";
import { TeamDataHelper } from "./TeamDataHelper";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import TreasureConst from "../../const/TreasureConst";
import MasterConst from "../../const/MasterConst";
import YokeConst from "../../const/YokeConst";
import { RecoveryDataHelper } from "./RecoveryDataHelper";
import { FunctionConst } from "../../const/FunctionConst";
import { TypeConvertHelper } from "../TypeConvertHelper";
import { HeroConst } from "../../const/HeroConst";
import { HeroDataHelper } from "./HeroDataHelper";
import { DataConst } from "../../const/DataConst";
import { UserDataHelper } from "./UserDataHelper";
import { UserCheck } from "../logic/UserCheck";
import { FunctionCheck } from "../logic/FunctionCheck";
import { EquipJadeHelper } from "../../scene/view/equipmentJade/EquipJadeHelper";
import AttributeConst from "../../const/AttributeConst";


export namespace TreasureDataHelper {

    export function getTreasureConfig(id) {


        let info = G_ConfigLoader.getConfig(ConfigNameConst.TREASURE).get(id);
        console.assert(info, 'treasure config can not find id = %d', id);
        return info;
    };
    export function getLimitCostConfig(limitLevel) {
        let info = G_ConfigLoader.getConfig(ConfigNameConst.TREASURE_LIMIT_COST).get(limitLevel);
        console.assert(info, 'treasure_limit_cost config can not find limit_level = %d', limitLevel);
        return info;
    };
    export function getLimitOpenLv(limitLevel) {
        var info = TreasureDataHelper.getLimitCostConfig(limitLevel);
        var funcInfo = G_ConfigLoader.getConfig('function_level').get(info.function_id);
        if (funcInfo) {
            return funcInfo.level;
        } else {
            return 0;
        }
    };
    export function getLimitShowLv(limitLevel) {
        var info = TreasureDataHelper.getLimitCostConfig(limitLevel);
        var funcInfo = G_ConfigLoader.getConfig('function_level').get(info.function_id);
        if (funcInfo) {
            return funcInfo.show_level;
        } else {
            return 0;
        }
    };
    export function getTreasureStrengthenAttr(data, addLevel?) {
        let tempLevel = addLevel || 0;
        let config = data.getConfig();
        let level = data.getLevel() + tempLevel;
        return TreasureDataHelper.getTreasureStrAttrWithConfigAndLevel(config, level);
    };
    export function getTreasureStrAttrWithConfigAndLevel(config, level) {
        let result = {};
        let initLevel = config.initial_level;
        let templet = config.levelup_templet;
        let typeLevelup1 = config.levelup_type_1;
        let typeLevelup2 = config.levelup_type_2;
        let levelupConfig = G_ConfigLoader.getConfig(ConfigNameConst.TREASURE_LEVELUP).get(level, templet);
        if (levelupConfig == null) {
            return null;
        }
        for (let i = 1; i <= 2; i++) {
            let luType = levelupConfig['levelup_type_' + i];
            if (luType == typeLevelup1 || luType == typeLevelup2) {
                let luValue = TreasureDataHelper.getTreasureLevelupAttrValue(initLevel, level, templet, i);
                AttrDataHelper.formatAttr(result, luType, luValue);
            }
        }
        return result;
    };
    export function getTreasureRefineAttr(data, addLevel?) {
        let tempLevel = addLevel || 0;
        let config = data.getConfig();
        let rLevel = data.getRefine_level() + tempLevel;
        let result = TreasureDataHelper.getTreasureRefineAttrWithConfigAndRLevel(config, rLevel);
        return result;
    };
    export function getTreasureRefineAttrWithConfigAndRLevel(configInfo, rLevel) {
        let result = {};
        let initRlevel = configInfo.initial_refine;
        let templetRefine = configInfo.refine_templet;
        let typeRefine1 = configInfo.refine_type_1;
        let typeRefine2 = configInfo.refine_type_2;
        let typeRefine3 = configInfo.refine_type_3;
        let refineConfig = G_ConfigLoader.getConfig(ConfigNameConst.TREASURE_REFINE).get(rLevel, templetRefine);
        if (refineConfig == null) {
            return null;
        }
        for (let i = 1; i <= 6; i++) {
            let rType = refineConfig['refine_type_' + i];
            if (rType == typeRefine1 || rType == typeRefine2 || rType == typeRefine3) {
                let rValue = TreasureDataHelper.getTreasureRefineAttrValue(initRlevel, rLevel, templetRefine, i);
                AttrDataHelper.formatAttr(result, rType, rValue);
            }
        }
        return result;
    };
    export function getTreasureAttrInfo(data) {
        let result = {};
        let sAttr = TreasureDataHelper.getTreasureStrengthenAttr(data);
        let rAttr = TreasureDataHelper.getTreasureRefineAttr(data);
        AttrDataHelper.appendAttr(result, sAttr);
        AttrDataHelper.appendAttr(result, rAttr);
        return result;
    };
    export function getTreasureNeedExpWithLevel(templet, level) {
        let needExp = 0;
        for (let i = 1; i <= level - 1; i++) {
            let exp = TreasureDataHelper.getTreasureLevelUpExp(i, templet);
            needExp = needExp + exp;
        }
        return needExp;
    };
    export function getCanReachTreasureLevelWithExp(totalExp, templet) {
        let level = 1;
        let exp = 0;
        while (exp < totalExp) {
            let temp = TreasureDataHelper.getTreasureLevelUpExp(level, templet);
            exp = exp + temp;
            level = level + 1;
        }
        return level - 1;
    };
    export function getTreasureLevelUpExp(level, templet) {

        let config = G_ConfigLoader.getConfig(ConfigNameConst.TREASURE_LEVELUP).get(level, templet);
        //assert((config, 'treasure_levelup can not find level = %d, templet = %d', level, templet);
        return config.exp;
    };
    export function getTreasureLevelupAttrValue(initLevel, level, templet, index) {
        let totalValue = 0;
        for (let i = initLevel; i <= level; i++) {
            let config = G_ConfigLoader.getConfig(ConfigNameConst.TREASURE_LEVELUP).get(i, templet);
            //assert((config, 'treasure_levelup can\'t find level = %d, templet = %d', i, templet);
            let value = config['levelup_value_' + index];
            totalValue = totalValue + value;
        }
        return totalValue;
    };
    export function getTreasureRefineAttrValue(initLevel, level, templet, index) {
        let totalValue = 0;
        for (let i = initLevel; i <= level; i++) {
            let config = G_ConfigLoader.getConfig(ConfigNameConst.TREASURE_REFINE).get(i, templet);
            console.assert(config, 'treasure_refine can\'t find level = %d, templet = %d', i, templet);
            let value = config['refine_value_' + index];
            totalValue = totalValue + value;
        }
        return totalValue;
    };
    export function getHeroBaseIdWithTreasureId(id) {
        var heroUnitData = TreasureDataHelper.getHeroDataWithTreasureId(id);
        if (heroUnitData == null) {
            return [null, null];
        }
        var heroBaseId = heroUnitData.getBase_id();
        var convertHeroBaseId = heroUnitData.getAvatarToHeroBaseId();
        return [
            heroBaseId,
            convertHeroBaseId
        ];
    };
    export function getHeroDataWithTreasureId(id) {
        var data = G_UserData.getBattleResource().getTreasureDataWithId(id);
        if (data == null) {
            return null;
        }
        var heroId = G_UserData.getTeam().getHeroIdWithPos(data.getPos());
        var heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
        return heroUnitData;
    };
    export function getTreasureYokeInfo(baseId) {
        let result: any = [];

        let heroFataConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO_FATE);
        let len = heroFataConfig.length();
        for (let i = 0; i < len; i++) {
            let info = heroFataConfig.indexOf(i);
            let fateType = info.fate_type;
            if (fateType == 3) {
                for (let j = 1; j <= 4; j++) {
                    let treasureId = info['hero_id_' + j];
                    if (treasureId > 0 && treasureId == baseId) {
                        let temp = TreasureDataHelper._createYokeBasicInfo(info);
                        result.push(temp);
                        break;
                    }
                }
            }
        }
        return result;
    };
    export function _createYokeBasicInfo(info) {
        let result: any = {};
        result.id = info.fate_id;
        result.fateType = info.fate_type;
        result.name = info.fate_name;
        let attrInfo = [];
        for (let i = 1; i <= 2; i++) {
            let attrId = info['talent_attr_' + i];
            if (attrId > 0) {
                let attrValue = info['talent_value_' + i];
                let info1: any = {
                    attrId: attrId,
                    attrValue: attrValue
                };
                attrInfo.push(info1);
            }
        }
        result.attrInfo = attrInfo;
        let heroIds: any = [];
        let heroConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO);
        let len = heroConfig.length();
        let userId = null;
        for (let i = 0; i < len; i++) {
            let heroInfo = heroConfig.indexOf(i);
            for (let j = 0; j < HeroConst.HERO_YOKE_MAX; j++) {
                let fateId = heroInfo['fate_' + j];
                if (fateId > 0 && fateId == info.fate_id) {
                    if (heroInfo.type == 1) {
                        if (userId == null) {
                            userId = heroInfo.id;
                            heroIds.push(userId);
                        }
                    } else {
                        heroIds.push(heroInfo.id);
                    }
                    break;
                }
            }
        }
        result.heroIds = heroIds;
        return result;
    };
    export function isHaveYokeBetweenHeroAndTreasured(heroBaseId, treasureBaseId) {
        let fateIds = HeroDataHelper.getHeroYokeIdsByConfig(heroBaseId);
        for (let i in fateIds) {
            let fateId = fateIds[i];
            let info = HeroDataHelper.getHeroYokeConfig(fateId);
            let fateType = info.fate_type;
            if (fateType == YokeConst.TYPE_TREASURE) {
                for (let j = 1; j <= 4; j++) {
                    let treasureId = info['hero_id_' + j];
                    if (treasureId == treasureBaseId) {
                        return true;
                    }
                }
            }
        }
        return false;
    };
// 性能优化，增加新方法供外层使用
    export function isHaveYokeBetweenHeroAndTreasured1(heroCfg, treasureBaseId) {
        let fateIds = HeroDataHelper.getHeroYokeIdsByConfig1(heroCfg);
        for (let i in fateIds) {
            let fateId = fateIds[i];
            let info = HeroDataHelper.getHeroYokeConfig(fateId);
            let fateType = info.fate_type;
            if (fateType == YokeConst.TYPE_TREASURE) {
                for (let j = 1; j <= 4; j++) {
                    let treasureId = info['hero_id_' + j];
                    if (treasureId == treasureBaseId) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
// 性能优化，增加新方法供外层使用
    export function isHaveYokeBetweenHeroAndTreasured2(fateIdInfos, treasureBaseId) {
        for (let i in fateIdInfos) {
            let info = fateIdInfos[i];
            let fateType = info.fate_type;
            if (fateType == YokeConst.TYPE_TREASURE) {
                for (let j = 1; j <= 4; j++) {
                    let treasureId = info['hero_id_' + j];
                    if (treasureId == treasureBaseId) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    export function checkIsEquipInHero(treasureId, heroBaseId) {
        let data = G_UserData.getBattleResource().getTreasureDataWithId(treasureId);
        if (data == null) {
            return false;
        }
        let pos = data.getPos();
        let heroIds = G_UserData.getTeam().getHeroIds();
        let heroId = heroIds[pos - 1];
        if (heroId && heroId > 0) {
            let heroData = G_UserData.getHero().getUnitDataWithId(heroId);
            let baseId = heroData.getBase_id();
            if (pos == 1) {
                if (baseId >= heroBaseId) {
                    return true;
                }
            } else {
                if (baseId == heroBaseId) {
                    return true;
                }
            }
        }
        return false;
    };
    export function getTreasureRefineMaterial(data) {
        let result: any = [];
        let rLevel = data.getRefine_level();
        let templet = data.getConfig().refine_templet;
        let config = G_ConfigLoader.getConfig(ConfigNameConst.TREASURE_REFINE).get(rLevel, templet);
        console.assert(config, 'treasure_refine can\'t find level = %d, templet = %d', rLevel, templet);
        let treasureCount = config.treasure;
        if (treasureCount > 0) {
            let material1 = {
                type: TypeConvertHelper.TYPE_TREASURE,
                value: data.getSameCardId(),
                size: treasureCount
            };
            result.push(material1);
        }
        let material2 = {
            type: config.cost_type_1,
            value: config.cost_value_1,
            size: config.cost_size_1
        };
        result.push(material2);
        return result;
    };
    export function getTreasureRefineMoney(data) {
        let result = {};
        let rLevel = data.getRefine_level();
        let templet = data.getConfig().refine_templet;

        let config = G_ConfigLoader.getConfig(ConfigNameConst.TREASURE_REFINE).get(rLevel, templet);
        console.assert(config, 'treasure_refine can\'t find level = %d, templet = %d', rLevel, templet);
        result = {
            type: config.cost_type_2,
            value: config.cost_value_2,
            size: config.cost_size_2
        };
        return result;
    };
    export function getMasterTreasureUpgradeInfo(pos) {
        let result: any = {};
        let curMasterLevel = 0;
        let nextMasterLevel = 0;
        let needLevel = 0;
        let curAttr = {};
        let nextAttr = {};
        let treasureIds = G_UserData.getBattleResource().getTreasureInfoWithPos(pos);
        let minLevel = null;
        for (let i = 1; i <= 2; i++) {
            let treasureId = treasureIds[i - 1];
            let level = null;
            if (treasureId) {
                let treasureData = G_UserData.getTreasure().getTreasureDataWithId(treasureId);
                level = treasureData.getLevel();
            } else {
                level = 0;
            }
            if (minLevel == null) {
                minLevel = level;
            }
            if (level < minLevel) {
                minLevel = level;
            }
        }
        let masterConfig = G_ConfigLoader.getConfig(ConfigNameConst.EQUIPMENT_MASTER);
        for (let i = 0; i < masterConfig.length(); i++) {
            let info = masterConfig.indexOf(i);
            if (info.equip_type == MasterConst.MASTER_TYPE_3) {
                if (minLevel >= info.equip_value) {
                    for (let j = 1; j <= 4; j++) {
                        let attrType = info['master_type' + j];
                        let attrValue = info['master_value' + j];
                        AttrDataHelper.formatAttr(curAttr, attrType, attrValue);
                        AttrDataHelper.formatAttr(nextAttr, attrType, attrValue);
                    }
                    curMasterLevel = info.level;
                } else {
                    for (let j = 1; j <= 4; j++) {
                        let attrType = info['master_type' + j];
                        let attrValue = info['master_value' + j];
                        AttrDataHelper.formatAttr(nextAttr, attrType, attrValue);
                    }
                    nextMasterLevel = info.level;
                    needLevel = info.equip_value;
                    break;
                }
            }
        }
        result.curMasterLevel = curMasterLevel;
        result.nextMasterLevel = nextMasterLevel;
        result.needLevel = needLevel;
        result.curAttr = curAttr;
        result.nextAttr = nextAttr;
        return result;
    };
    export function getMasterTreasureRefineInfo(pos): any {
        let result: any = {};
        let curMasterLevel = 0;
        let nextMasterLevel = 0;
        let needLevel = 0;
        let curAttr = {};
        let nextAttr = {};
        let treasureIds = G_UserData.getBattleResource().getTreasureInfoWithPos(pos);
        let minLevel = null;
        for (let i = 1; i <= 2; i++) {
            let treasureId = treasureIds[i - 1];
            let level = null;
            if (treasureId) {
                let treasureData = G_UserData.getTreasure().getTreasureDataWithId(treasureId);
                level = treasureData.getRefine_level();
            } else {
                level = 0;
            }
            if (minLevel == null) {
                minLevel = level;
            }
            if (level < minLevel) {
                minLevel = level;
            }
        }

        let masterConfig = G_ConfigLoader.getConfig(ConfigNameConst.EQUIPMENT_MASTER);
        for (let i = 0; i < masterConfig.length(); i++) {
            let info = masterConfig.indexOf(i);
            if (info.equip_type == MasterConst.MASTER_TYPE_4) {
                if (minLevel >= info.equip_value) {
                    for (let j = 1; j <= 4; j++) {
                        let attrType = info['master_type' + j];
                        let attrValue = info['master_value' + j];
                        AttrDataHelper.formatAttr(curAttr, attrType, attrValue);
                        AttrDataHelper.formatAttr(nextAttr, attrType, attrValue);
                    }
                    curMasterLevel = info.level;
                } else {
                    for (let j = 1; j <= 4; j++) {
                        let attrType = info['master_type' + j];
                        let attrValue = info['master_value' + j];
                        AttrDataHelper.formatAttr(nextAttr, attrType, attrValue);
                    }
                    nextMasterLevel = info.level;
                    needLevel = info.equip_value;
                    break;
                }
            }
        }
        result.curMasterLevel = curMasterLevel;
        result.nextMasterLevel = nextMasterLevel;
        result.needLevel = needLevel;
        result.curAttr = curAttr;
        result.nextAttr = nextAttr;
        return result;
    };
    export function getTreasureStrengAllCost(unitData) {
        let result = {};
        let itemExp1 = G_ConfigLoader.getConfig(ConfigNameConst.ITEM).get(DataConst.ITEM_TREASURE_LEVELUP_MATERIAL_1).item_value;
        let itemExp2 = G_ConfigLoader.getConfig(ConfigNameConst.ITEM).get(DataConst.ITEM_TREASURE_LEVELUP_MATERIAL_2).item_value;
        let itemExp3 = G_ConfigLoader.getConfig(ConfigNameConst.ITEM).get(DataConst.ITEM_TREASURE_LEVELUP_MATERIAL_3).item_value;
        let itemExp4 = G_ConfigLoader.getConfig(ConfigNameConst.ITEM).get(DataConst.ITEM_TREASURE_LEVELUP_MATERIAL_4).item_value;
        let expItem = {
            count1: 0,
            count2: 0,
            count3: 0,
            count4: 0
        };
        let expCount = unitData.getExp();
        while (expCount >= itemExp1) {
            if (expCount >= itemExp4) {
                expCount = expCount - itemExp4;
                expItem.count4 = expItem.count4 + 1;
            } else if (expCount >= itemExp1) {
                expCount = expCount - itemExp1;
                expItem.count1 = expItem.count1 + 1;
            }
        }
        for (let i = 1; i <= 4; i++) {
            let count = expItem['count' + i];
            if (count > 0) {
                RecoveryDataHelper.formatRecoveryCost(result, TypeConvertHelper.TYPE_ITEM, DataConst['ITEM_TREASURE_LEVELUP_MATERIAL_' + i], count);
            }
        }
        return result;
    };
    export function getTreasureRefineAllCost(unitData) {
        let result = {};
        let rank = unitData.getRefine_level();
        let rTemplet = unitData.getConfig().refine_templet;
        for (let i = 0; i <= rank - 1; i++) {
            let info = G_ConfigLoader.getConfig(ConfigNameConst.TREASURE_REFINE).get(i, rTemplet);
            console.assert(info, 'treasure_refine can not find rank = %d, templet = %d', i, rTemplet);
            let cardCount = info.treasure;
            if (cardCount > 0) {
                let baseId = unitData.getSameCardId();
                RecoveryDataHelper.formatRecoveryCost(result, TypeConvertHelper.TYPE_TREASURE, baseId, cardCount);
            }
            for (let j = 1; j <= 2; j++) {
                let size = info['cost_size_' + j];
                if (size > 0) {
                    let type = info['cost_type_' + j];
                    let value = info['cost_value_' + j];
                    RecoveryDataHelper.formatRecoveryCost(result, type, value, size);
                }
            }
        }
        return result;
    };
    export function getTreasureLimitCost(unitData) {
        let result = {};
        let materials = unitData.getRecycle_materials();
        for (let i in materials) {
            let material = materials[i];
            RecoveryDataHelper.formatRecoveryCost(result, material.type, material.value, material.size);
        }
        return result;
    };
    export function getTreasureRecoveryPreviewInfo(datas) {
        let result: any = [];
        let info: any = [];
        for (let k in datas) {
            let unitData = datas[k];
            let cost1 = TreasureDataHelper.getTreasureStrengAllCost(unitData);
            let cost2 = TreasureDataHelper.getTreasureRefineAllCost(unitData);
            let cost3 = TreasureDataHelper.getTreasureLimitCost(unitData);
            let baseId = unitData.getBase_id();
            RecoveryDataHelper.formatRecoveryCost(info, TypeConvertHelper.TYPE_TREASURE, baseId, 1);
            RecoveryDataHelper.mergeRecoveryCost(info, cost1);
            RecoveryDataHelper.mergeRecoveryCost(info, cost2);
            RecoveryDataHelper.mergeRecoveryCost(info, cost3);
        }
        let currency = {};
        for (let type in info) {
            let unit = info[type];
            if (parseInt(type) == TypeConvertHelper.TYPE_TREASURE) {
                for (let value in unit) {
                    let size = unit[value];
                    let temp = RecoveryDataHelper.convertSameCard(type, value, size, 1);
                    RecoveryDataHelper.mergeRecoveryCost(currency, temp);
                }
                info[type] = null;
            }
        }
        RecoveryDataHelper.mergeRecoveryCost(info, currency);
        for (let type in info) {
            let unit = info[type];
            for (let value in unit) {
                let size = unit[value];
                result.push({
                    type: type,
                    value: value,
                    size: size
                });
            }
        }
        RecoveryDataHelper.sortAward(result);
        return result;
    };
    export function getTreasureRebornPreviewInfo(data) {
        let result: any = [];
        let info = [];
        let cost1 = TreasureDataHelper.getTreasureStrengAllCost(data);
        let cost2 = TreasureDataHelper.getTreasureRefineAllCost(data);
        let cost3 = TreasureDataHelper.getTreasureLimitCost(data);
        let baseId = data.getBase_id();
        RecoveryDataHelper.formatRecoveryCost(info, TypeConvertHelper.TYPE_TREASURE, baseId, 1);
        RecoveryDataHelper.mergeRecoveryCost(info, cost1);
        RecoveryDataHelper.mergeRecoveryCost(info, cost2);
        RecoveryDataHelper.mergeRecoveryCost(info, cost3);
        let currency = {};
        for (let type in info) {
            let unit = info[type];
            if (parseInt(type) == TypeConvertHelper.TYPE_TREASURE) {
                for (let value in unit) {
                    let size = unit[value];
                    let temp = RecoveryDataHelper.convertSameCard(type, value, size, 2);
                    RecoveryDataHelper.mergeRecoveryCost(currency, temp);
                }
                info[type] = null;
            }
        }
        RecoveryDataHelper.mergeRecoveryCost(info, currency);
        for (let type in info) {
            let unit = info[type];
            for (let value in unit) {
                let size = unit[value];
                result.push({
                    type: type,
                    value: value,
                    size: size
                });
            }
        }
        RecoveryDataHelper.sortAward(result);
        return result;
    };
    export function isPromptTreasureUpgrade(treasureData) {
        let userLevel = G_UserData.getBase().getLevel();
        let roleInfo = G_ConfigLoader.getConfig(ConfigNameConst.ROLE).get(userLevel);
        console.assert(roleInfo, 'role config can not find level = %d', userLevel);
        let recommendLevel = roleInfo.recommend_treasure_lv;
        let level = treasureData.getLevel();
        if (level >= recommendLevel) {
            return false;
        }
        if (level >= treasureData.getMaxStrLevel()) {
            return false;
        }
        let ownExp = 0;
        for (let i = 1; i <= 4; i++) {
            let itemId = DataConst['ITEM_TREASURE_LEVELUP_MATERIAL_' + i];
            let count = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, itemId);
            if (count > 0) {
                let itemExp = G_ConfigLoader.getConfig(ConfigNameConst.ITEM).get(itemId).item_value;
                ownExp = ownExp + itemExp * count;
            }
        }
        let templet = treasureData.getConfig().levelup_templet;
        let nowExp = treasureData.getExp() - TreasureDataHelper.getTreasureNeedExpWithLevel(templet, level);
        let curLevelExp = TreasureDataHelper.getTreasureLevelUpExp(level, templet);
        let needExp = curLevelExp - nowExp;
        if (ownExp >= needExp) {
            return true;
        }
        return false;
    };
    export function isPromptTreasureRefine(treasureData) {
        let userLevel = G_UserData.getBase().getLevel();
        let roleInfo = G_ConfigLoader.getConfig(ConfigNameConst.ROLE).get(userLevel);
        console.assert(roleInfo, 'role config can not find level = %d', userLevel);
        let recommendLevel = roleInfo.recommend_treasure_refine_lv;
        let level = treasureData.getRefine_level();
        if (level >= recommendLevel) {
            return false;
        }
        if (level >= treasureData.getMaxRefineLevel()) {
            return false;
        }
        let canRefine = true;
        let materialInfo = TreasureDataHelper.getTreasureRefineMaterial(treasureData);
        for (let i in materialInfo) {
            let info = materialInfo[i];
            let myCount = 0;
            if (info.type == TypeConvertHelper.TYPE_TREASURE) {
                myCount = G_UserData.getTreasure().getSameCardsWithBaseId(info.value).length;
            } else if (info.type == TypeConvertHelper.TYPE_ITEM) {

                myCount = G_UserData.getItems().getItemNum(info.value);
            }
            let needCount = info.size;
            let isReachCondition = myCount >= needCount;
            canRefine = canRefine && isReachCondition;
        }
        let moneyInfo: any = TreasureDataHelper.getTreasureRefineMoney(treasureData);
        let [isOk] = UserCheck.enoughMoney(moneyInfo.size) as boolean[];
        canRefine = canRefine && isOk;
        return canRefine;
    };
    export function isPromptTreasureLimit(treasureData) {
        let isAllFull = true;
        for (let key = TreasureConst.TREASURE_LIMIT_COST_KEY_1; key <= TreasureConst.TREASURE_LIMIT_COST_KEY_4; key++) {
            let [isOk, isFull] = TreasureDataHelper.isPromptTreasureLimitWithCostKey(treasureData, key);
            isAllFull = isAllFull && isFull;
            if (isOk) {
                return true;
            }
        }
        if (isAllFull) {
            let limitLevel = treasureData.getLimit_cost();
            let info = TreasureDataHelper.getLimitCostConfig(limitLevel);
            let [isOk] = UserCheck.enoughMoney(info.break_size);
            if (isOk) {
                return true;
            }
        }
        return false;
    };
    export function isPromptTreasureLimitWithCostKey(treasureData, key) {
        if (FunctionCheck.funcIsOpened(FunctionConst.FUNC_TREASURE_TRAIN_TYPE3)[0] == false) {
            return [false];
        }
        let isCanLimitBreak = treasureData.isCanLimitBreak();
        if (!isCanLimitBreak) {
            return [false];
        }
        let limitLevel = treasureData.getLimit_cost();
        if (limitLevel >= TreasureConst.TREASURE_LIMIT_RED_LEVEL) {
            return [false];
        }
        let rLevel = treasureData.getRefine_level();
        let isReach = TreasureDataHelper.isReachTreasureLimitRank(limitLevel, rLevel)[0];
        if (!isReach) {
            return [false];
        }
        let info = TreasureDataHelper.getLimitCostConfig(limitLevel);
        let curCount = treasureData.getLimitCostCountWithKey(key);
        let maxSize = 0;
        if (key == TreasureConst.TREASURE_LIMIT_COST_KEY_1) {
            maxSize = info.exp;
        } else {
            maxSize = info['size_' + key];
        }
        let isFull = curCount >= maxSize;
        if (!isFull) {
            if (key == TreasureConst.TREASURE_LIMIT_COST_KEY_1) {
                let ownExp = curCount;
                for (let j = 1; j <= 4; j++) {
                    let count = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, DataConst['ITEM_TREASURE_LEVELUP_MATERIAL_' + j]);
                    let itemValue = G_ConfigLoader.getConfig(ConfigNameConst.ITEM).get(DataConst['ITEM_TREASURE_LEVELUP_MATERIAL_' + j]).item_value;
                    let itemExp = count * itemValue;
                    ownExp = ownExp + itemExp;
                    if (ownExp >= maxSize) {
                        return [
                            true,
                            isFull
                        ];
                    }
                }
            } else {
                let count = UserDataHelper.getNumByTypeAndValue(info['type_' + key], info['value_' + key]) + curCount;
                if (count >= maxSize) {
                    return [
                        true,
                        isFull
                    ];
                }
            }
        }
        return [
            false,
            isFull
        ];
    };
    export function getTreasureListLimitCount() {
        let level = G_UserData.getBase().getLevel();

        let info = G_ConfigLoader.getConfig(ConfigNameConst.ROLE).get(level);
        console.assert(info, 'role config can not find level = %d', level);
        return info.treasure_limit;
    };
    export function getTreasureInBattleAverageStr() {
        let average = 0;
        let totalLevel = 0;
        let datas = G_UserData.getBattleResource().getAllTreasureData();
        for (let k in datas) {
            let data = datas[k];
            if (!data)  continue;
            let unitData = G_UserData.getTreasure().getTreasureDataWithId(data.getId());
            let level = unitData.getLevel();
            totalLevel = totalLevel + level;
        }
        let heroCount = TeamDataHelper.getTeamOpenCount();
        let count = heroCount * 2;
        if (count > 0) {
            average = Math.floor(totalLevel / count);
        }
        return average;
    };
    export function getTreasureInBattleAverageRefine() {
        let average = 0;
        let totalLevel = 0;
        let datas = G_UserData.getBattleResource().getAllTreasureData();
        for (let k in datas) {
            let data = datas[k];
            if (!data)  continue;
            let unitData = G_UserData.getTreasure().getTreasureDataWithId(data.getId());
            let level = unitData.getRefine_level();
            totalLevel = totalLevel + level;
        }
        let heroCount = TeamDataHelper.getTeamOpenCount();
        let count = heroCount * 2;
        if (count > 0) {
            average = Math.floor(totalLevel / count);
        }
        return average;
    };
    export function getTreasureTransformTarList(filterIds, tempData) {
        function sortFun(a, b) {
            let configA = a.getConfig();
            let configB = b.getConfig();
            if (configA.color != configB.color) {
                return configB.color - configA.color;
            } else {
                return configA.id - configB.id;
            }
        }
        let isInFilter = function (unit) {
            for (let i in filterIds) {
                let filterId = filterIds[i];
                if (filterId == unit.getBase_id()) {
                    return true;
                }
            }
            return false;
        };
        let result: any = [];
        let filterColor = tempData.color;
        let wear: any = [];
        let noWear: any = [];
        let TreasureConfig = G_ConfigLoader.getConfig(ConfigNameConst.TREASURE);
        let len = TreasureConfig.length();
        for (let i = 1; i <= len; i++) {
            let info = TreasureConfig.indexOf(i - 1);
            let data = clone(tempData);
            data.baseId = info.id;
            let unit = G_UserData.getTreasure().createTempTreasureUnitData(data);
            let color = unit.getConfig().color;
            if (color == filterColor && !isInFilter(unit)) {
                let isInBattle = unit.isInBattle();
                if (isInBattle) {
                    wear.push(unit);
                } else {
                    noWear.push(unit);
                }
            }
        }
        wear.sort(sortFun);
        noWear.sort(sortFun);
        for (let j in wear) {
            let unit1 = wear[j];
            result.push(unit1);
        }
        for (let t in noWear) {
            let unit2 = noWear[t];
            result.push(unit2);
        }
        return result;
    };
    export function isReachTreasureLimitRank(limitLevel, curLevel) {
        let info = TreasureDataHelper.getLimitCostConfig(limitLevel);
        let needLevel = info.refine;
        if (curLevel >= needLevel) {
            return [
                true,
                needLevel
            ];
        } else {
            return [
                false,
                needLevel
            ];
        }
    };
    export function getTreasureJadeAttrInfo(data, level, isPower) {
        if (!data.getJades) return null;
        var jades = data.getJades();
        var result = {};
        var power = 0;
        for (var i = 1; i != jades.length; i++) {
            if (jades[i] > 0) {
                var jadeUnitData = G_UserData.getJade().getJadeDataById(jades[i]);
                var _ = UserDataHelper.getHeroBaseIdWithTreasureId(data.getId()), heroBaseId;
                if (jadeUnitData && jadeUnitData.isSuitableHero(heroBaseId)) {
                    var cfg = jadeUnitData.getConfig();
                    if (!isPower) {
                        var size = EquipJadeHelper.getRealAttrValue(cfg, level);
                        if (cfg.type != 0) {
                            AttrDataHelper.formatAttr(result, cfg.type, size);
                        }
                    } else {
                        AttrDataHelper.formatAttr(result, AttributeConst.JADE_POWER, cfg.fake);
                    }
                }
            }
        }
        return result;
    };
}