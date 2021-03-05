
import { ConfigNameConst } from "../../const/ConfigNameConst";
import { AttrDataHelper } from "./AttrDataHelper";
import { G_UserData, G_ConfigLoader } from "../../init";

import { RecoveryDataHelper } from "./RecoveryDataHelper";
import InstrumentConst from "../../const/InstrumentConst";

import { TeamDataHelper } from "./TeamDataHelper";
import { AvatarDataHelper } from "./AvatarDataHelper";

import { FunctionConst } from "../../const/FunctionConst";
import { HeroConst } from "../../const/HeroConst";
import { DataConst } from "../../const/DataConst";
import { UserDataHelper } from "./UserDataHelper";
import { UserCheck } from "../logic/UserCheck";
import { HeroDataHelper } from "./HeroDataHelper";
import { FunctionCheck } from "../logic/FunctionCheck";
import { TypeConvertHelper } from "../TypeConvertHelper";
import { clone } from "../GlobleFunc";
import { BaseConfig } from "../../config/BaseConfig";


export namespace InstrumentDataHelper {
    let instrumentConfig:BaseConfig;
    let instrumentRankConfig:BaseConfig;
    let instrumentLevelConfig:BaseConfig;
    let heroConfig:BaseConfig;
    let heroFateConfig:BaseConfig;
    let roleConfig:BaseConfig;
    export function initConfig():void{
        instrumentConfig = G_ConfigLoader.getConfig(ConfigNameConst.INSTRUMENT);
        instrumentRankConfig = G_ConfigLoader.getConfig(ConfigNameConst.INSTRUMENT_RANK);
        instrumentLevelConfig = G_ConfigLoader.getConfig(ConfigNameConst.INSTRUMENT_LEVEL);
        heroConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO);
        heroFateConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO_FATE);
        roleConfig = G_ConfigLoader.getConfig(ConfigNameConst.ROLE);
    }
    export function getInstrumentConfig(baseId) {

        let info = instrumentConfig.get(baseId);
        console.assert(info, 'instrument config can not find id = %d', baseId);
        return info;
    };
    export function getInstrumentRankConfig(rankId, limitLevel) {

        let info = instrumentRankConfig.get(rankId, limitLevel);
        console.assert(info, 'instrument_rank config can not find rank_id = %d, instrument_id = %d', rankId, limitLevel);
        return info;
    };
    export function getInstrumentAttrInfo(data, addLevel?) {
        let result = {};
        let tempLevel = addLevel || 0;
        let config = data.getConfig();
        let level = data.getLevel() + tempLevel;
        let templet = data.getAdvacneTemplateId();
        let maxLevel = config.level_max;
        if (level > config.level_max) {
            return null;
        }
        result = InstrumentDataHelper.getInstrumentLevelAttr(level, templet);
        if (data.isUnlockSecond()) {
            let attrType = config.talent_attr_1;
            let attrValue = config.talent_value_1;
            AttrDataHelper.formatAttr(result, attrType, attrValue);
        }
        return result;
    };
    export function getInstrumentLevelAttr(level, templet) {
        let result = {};
        for (let i = 0; i <= level; i++) {

            let info =instrumentLevelConfig.get(i, templet);
            console.assert(info, 'instrument_level can\'t find level = %d, rank_type = %d', i, templet);
            for (let j = 1; j <= 4; j++) {
                let attrType = info['rank' + (j + '_type')];
                let attrValue = info['rank' + (j + '_size')];
                AttrDataHelper.formatAttr(result, attrType, attrValue);
            }
        }
        return result;
    };
    export function getHeroBaseIdWithInstrumentId(id) {
        var heroUnitData = InstrumentDataHelper.getHeroDataWithInstrumentId(id);
        if (heroUnitData == null) {
            return null;
        }
        var heroBaseId = heroUnitData.getBase_id();
        return heroBaseId;
    };
    export function  getHeroDataWithInstrumentId(id) {
        var data = G_UserData.getBattleResource().getInstrumentDataWithId(id);
        if (data == null) {
            return null;
        }
        var heroId = G_UserData.getTeam().getHeroIdWithPos(data.getPos());
        var heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
        return heroUnitData;
    };
    export function getYokeIdWithInstrumentId(id) {
        let heroId = G_UserData.getInstrument().getHeroBaseId(id);

        let info = heroConfig.get(heroId);
        console.assert(info, 'hero config can not find id = %d', heroId);
        for (let i = 1; i <= HeroConst.HERO_YOKE_MAX; i++) {
            let fateId = info['fate_' + i];
            if (fateId > 0) {

                let fateInfo = heroFateConfig.get(fateId);
                console.assert(fateInfo, 'hero_fate config can not find id = %d', fateId);
                let fateType = fateInfo.fate_type;
                if (fateType == 4) {
                    return fateId;
                }
            }
        }
        console.assert(false, 'can not find fateId with instrumentId = %d', id);
    };
    export function getYokeAttrWithInstrumentId(id) {
        let fateId = InstrumentDataHelper.getYokeIdWithInstrumentId(id);
        let info = heroFateConfig.get(fateId);
        console.assert(info, 'hero_fate config can not find id = %d', fateId);
        let attrInfo = [];
        for (let i = 1; i <= 2; i++) {
            let attrId = info['talent_attr_' + i];
            if (attrId > 0) {
                let attrValue = info['talent_value_' + i];
                let one = {
                    attrId: attrId,
                    attrValue: attrValue
                };
                attrInfo.push(one);
            }
        }
        return attrInfo;
    };
    export function getInstrumentTalentInfo(templet) {
        let result = [];

        let Config =instrumentLevelConfig;
        let len = Config.length();
        for (let i = 0; i < len; i++) {
            let info = Config.indexOf(i);
            let rankType = info.rank_type;
            let unlock = info.unlock;
            let name = info.name;
            if (rankType == templet && unlock > 0) {
                let temp = {
                    level: info.level,
                    des: info.description,
                    name: name
                };
                result.push(temp);
            }
        }
        return result;
    };
    export function getInstrumentAdvanceMaterial(data) {
        let result = [];
        let level = data.getLevel();
        let templet = data.getAdvacneTemplateId();
        let config =instrumentLevelConfig.get(level, templet);
        console.assert(config, 'instrument_level can\'t find level = %d, templet = %d', level, templet);
        let instrumentCount = config.cost_instrument;
        if (instrumentCount > 0) {
            let material1 = {
                type: TypeConvertHelper.TYPE_INSTRUMENT,
                value: data.getBase_id(),
                size: instrumentCount
            };
            result.push(material1);
        }
        let material2 = {
            type: config.cost_type,
            value: config.cost_id,
            size: config.cost_size
        };
        result.push(material2);
        return result;
    };
    export function getInstrumentAdvanceMoney(data): any {
        let result = {};
        let level = data.getLevel();
        let templet = data.getAdvacneTemplateId();

        let config =instrumentLevelConfig.get(level, templet);
        console.assert(config, 'instrument_level can\'t find level = %d, templet = %d', level, templet);
        result = {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_GOLD,
            size: config.cost_silver
        };
        return result;
    };
    export function getInstrumentAdvanceAllCost(unitData) {
        let result = {};
        let level = unitData.getLevel();
        let templet = unitData.getAdvacneTemplateId();
        for (let i = 0; i <= level - 1; i++) {
            let info =instrumentLevelConfig.get(i, templet);
            console.assert(info, 'instrument_level can\'t find level = %d, templet = %d', i, templet);
            if (info.cost_size > 0) {
                RecoveryDataHelper.formatRecoveryCost(result, info.cost_type, info.cost_id, info.cost_size);
            }
            if (info.cost_silver > 0) {
                RecoveryDataHelper.formatRecoveryCost(result, TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_GOLD, info.cost_silver);
            }
            if (info.cost_instrument > 0) {
                RecoveryDataHelper.formatRecoveryCost(result, TypeConvertHelper.TYPE_INSTRUMENT, unitData.getBase_id(), info.cost_instrument);
            }
        }
        return result;
    };
    export function getInstrumentAllLimitCost(unitData) {
        let result = {};
        if (unitData.isCanLimitBreak() == false) {
            return result;
        }
        let templateId = unitData.getLimitTemplateId();
        let limitLevel = unitData.getLimit_level();
        for (let key = InstrumentConst.INSTRUMENT_LIMIT_COST_KEY_1; key <= InstrumentConst.INSTRUMENT_LIMIT_COST_KEY_2; key++) {
            let info = InstrumentDataHelper.getInstrumentRankConfig(templateId, limitLevel);
            let type = info['type_' + key];
            let value = info['value_' + key];
            let size = unitData.getLimitCostCountWithKey(key);
            if (size > 0 && type != 0 && value != 0) {
                RecoveryDataHelper.formatRecoveryCost(result, type, value, size);
            }
        }
        for (let i = 0; i <= limitLevel - 1; i++) {
            let config = InstrumentDataHelper.getInstrumentRankConfig(templateId, i);
            for (let j = InstrumentConst.INSTRUMENT_LIMIT_COST_KEY_1; j <= InstrumentConst.INSTRUMENT_LIMIT_COST_KEY_2; j++) {
                let type = config['type_' + j];
                let value = config['value_' + j];
                let size = config['size_' + j];
                if (size > 0) {
                    RecoveryDataHelper.formatRecoveryCost(result, type, value, size);
                }
            }
            RecoveryDataHelper.formatRecoveryCost(result, TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_GOLD, config.cost_silver);
        }
        return result;
    };
    export function getInstrumentRecoveryPreviewInfo(datas) {
        let result = [];
        let info = {};
        for (let k in datas) {
            let unitData = datas[k];
            let cost1 = InstrumentDataHelper.getInstrumentAdvanceAllCost(unitData);
            let cost2 = InstrumentDataHelper.getInstrumentAllLimitCost(unitData);
            let baseId = unitData.getBase_id();
            RecoveryDataHelper.formatRecoveryCost(info, TypeConvertHelper.TYPE_INSTRUMENT, baseId, 1);
            RecoveryDataHelper.mergeRecoveryCost(info, cost1);
            RecoveryDataHelper.mergeRecoveryCost(info, cost2);
        }
        let currency = {};
        for (let type in info) {
            let unit = info[type];
            if (parseInt(type) == TypeConvertHelper.TYPE_INSTRUMENT) {
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
    export function getInstrumentRebornPreviewInfo(data) {
        let result = [];
        let info = {};
        let cost1 = InstrumentDataHelper.getInstrumentAdvanceAllCost(data);
        let cost2 = InstrumentDataHelper.getInstrumentAllLimitCost(data);
        let baseId = data.getBase_id();
        RecoveryDataHelper.formatRecoveryCost(info, TypeConvertHelper.TYPE_INSTRUMENT, baseId, 1);
        RecoveryDataHelper.mergeRecoveryCost(info, cost1);
        RecoveryDataHelper.mergeRecoveryCost(info, cost2);
        let currency = {};
        for (let type in info) {
            let unit = info[type];
            if (parseInt(type) == TypeConvertHelper.TYPE_INSTRUMENT) {
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
    export function getInstrumentListLimitCount() {
        let level = G_UserData.getBase().getLevel();

        let info = roleConfig.get(level);
        console.assert(info, 'role config can not find level = %d', level);
        return info.instrument_limit;
    };
    export function isPromptInstrumentAdvance(instrumentData) {
        let isLevelLimit = instrumentData.isLevelLimit();
        if (isLevelLimit) {
            return false;
        }
        let userLevel = G_UserData.getBase().getLevel();
        let roleInfo = roleConfig.get(userLevel);
        console.assert(roleInfo, 'role config can not find level = %d', userLevel);
        let recommendLevel = roleInfo.recommend_instrument_refine_lv;
        let level = instrumentData.getLevel();
        if (level >= recommendLevel) {
            return false;
        }
        let materialInfo = InstrumentDataHelper.getInstrumentAdvanceMaterial(instrumentData);
        if (materialInfo.length == 0) {
            return false;
        }
        if (instrumentData.isCanLimitBreak()) {
            let curLevel = instrumentData.getLevel();
            let templateId = instrumentData.getLimitTemplateId();
            let limitLevel = instrumentData.getLimit_level();
            let markLevel = InstrumentDataHelper.getInstrumentRankConfig(templateId, limitLevel).level;
            if (limitLevel >= instrumentData.getMaxLimitLevel()) {
                markLevel = instrumentData.getConfig().level_max;
            }
            if (curLevel >= markLevel) {
                return false;
            }
        }
        let canAdvance = true;
        for (let i in materialInfo) {
            let info = materialInfo[i];
            let myCount = UserDataHelper.getSameCardCount(info.type, info.value);
            if (info.type == TypeConvertHelper.TYPE_INSTRUMENT) {
                let [commonId, commonCount] = InstrumentDataHelper.getCommonInstrumentIdAndCount(info.value);
                let myCommonCount = G_UserData.getItems().getItemNum(commonId);
                myCount = myCount + Math.floor(myCommonCount / commonCount);
            }
            let needCount = info.size;
            let isReachCondition = myCount >= needCount;
            canAdvance = canAdvance && isReachCondition;
        }
        let moneyInfo = InstrumentDataHelper.getInstrumentAdvanceMoney(instrumentData);
        let [ isOk ] = UserCheck.enoughMoney(moneyInfo.size) as boolean[];
        canAdvance = canAdvance && isOk;
        return canAdvance;
    };
    export function isInBattleHeroWithBaseId(baseId) {
        let heroIds = G_UserData.getTeam().getHeroIdsInBattle();
        for (let i in heroIds) {
            let heroId = heroIds[i];
            let data = G_UserData.getHero().getUnitDataWithId(heroId);
            let instrumentId = data.getConfig().instrument_id;
            if (instrumentId == baseId) {
                let pos = data.getPos();
                let id = G_UserData.getBattleResource().getInstrumentIdsWithPos(pos)[1];
                if (id) {
                    let unitData = G_UserData.getInstrument().getInstrumentDataWithId(id);
                    let level = unitData.getLevel();
                    let maxLevel = unitData.getConfig().level_max;
                    if (level < maxLevel) {
                        return true;
                    }
                } else {
                    return true;
                }
            }
        }
        return false;
    };
    export function getCommonInstrumentIdAndCount(baseId) {
        let info = instrumentConfig.get(baseId);
        console.assert(info, 'instrument config can not find id = %d', baseId);
        return [
            info.item_id,
            info.universal
        ];
    };
    export function findNextInstrumentTalent(level, templet, maxLevel) {
        for (let i = level + 1; i <= maxLevel; i++) {
            let info =instrumentLevelConfig.get(i, templet);
            console.assert(info, 'instrument_level config can not find i = %d, rank_type = %d', i, templet);
            if (info.unlock > 0) {
                return [
                    i,
                    info.name,
                    info.description
                ];
            }
        }
        return [null];
    };
    export function getInstrumentCountWithHeroIds(heroIds) {
        let heroBaseIds = [];
        for (let i in heroIds) {
            let heroId = heroIds[i];
            let unitData = G_UserData.getHero().getUnitDataWithId(heroId);
            let heroBaseId = unitData.getBase_id();
            heroBaseIds.push(heroBaseId);
        }
        let count = 0;
        let uniqueBaseIds = [];
        for (let j = 0; j < heroBaseIds.length; j++) {
            if (uniqueBaseIds.indexOf(heroBaseIds[j]) < 0)
                uniqueBaseIds.push(heroBaseIds[j]);
        }
        for (let i in uniqueBaseIds) {
            let baseId = uniqueBaseIds[i];
            let info = HeroDataHelper.getHeroConfig(baseId);
            let instrumentId = info.instrument_id;
            let instrumentCount = G_UserData.getInstrument().getInstrumentCountWithBaseId(instrumentId);
            count = count + instrumentCount;
        }
        return count;
    };
    export function getInstrumentInBattleAverageAdvance() {
        let average = 0;
        let totalLevel = 0;
        let datas = G_UserData.getBattleResource().getAllInstrumentData();
        for (let k in datas) {
            let data = datas[k];
            if (!data)  continue;
            let unitData = G_UserData.getInstrument().getInstrumentDataWithId(data.getId());
            let level = unitData.getLevel();
            totalLevel = totalLevel + level;
        }
        let heroCount = TeamDataHelper.getTeamOpenCount();
        let count = heroCount * 1;
        if (count > 0) {
            average = Math.floor(totalLevel / count);
        }
        return average;
    };
    export function getInstrumentBaseIdByCheckAvatar(unitData) {
        let baseId = unitData.getBase_id();
        if (!unitData.isInBattle()) {
            return baseId;
        }
        let pos = unitData.getPos();
        if (pos != 1) {
            return baseId;
        }
        if (!G_UserData.getBase().isEquipAvatar()) {
            return baseId;
        }
        let avatarBaseId = G_UserData.getBase().getAvatar_base_id();
        let heroConfig = AvatarDataHelper.getAvatarHeroConfig(avatarBaseId);
        return heroConfig.instrument_id;
    };
    export function isReachInstrumentLimitRank(templateId, limitLevel, curLevel) {
        let info = InstrumentDataHelper.getInstrumentRankConfig(templateId, limitLevel);
        let needLevel = info.level;
        if (curLevel == needLevel) {
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
    export function isPromptInstrumentLimit(instrumentData) {
        let isAllFull = true;
        for (let key = InstrumentConst.INSTRUMENT_LIMIT_COST_KEY_1; key <= InstrumentConst.INSTRUMENT_LIMIT_COST_KEY_2; key++) {
            let [isOk, isFull] = InstrumentDataHelper.isPromptInstrumentLimitWithCostKey(instrumentData, key);
            isAllFull = isAllFull && isFull;
            if (isOk) {
                return true;
            }
        }
        if (isAllFull) {
            let limitLevel = instrumentData.getLimit_level();
            let templateId = instrumentData.getLimitTemplateId();
            let info = InstrumentDataHelper.getInstrumentRankConfig(templateId, limitLevel);
            let [isOk] = UserCheck.enoughMoney(info.cost_silver);
            if (isOk) {
                return true;
            }
        }
        return false;
    };
    export function isPromptInstrumentLimitWithCostKey(instrumentData, key):any[] {
        var open = instrumentData.getLimitFuncRealOpened();
        if (!open) {
            return false;
        }
        if (FunctionCheck.funcIsOpened(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE2)[0] == false) {
            return [false];
        }
        let isCanLimitBreak = instrumentData.isCanLimitBreak();
        if (!isCanLimitBreak) {
            return [false];
        }
        let limitLevel = instrumentData.getLimit_level();
        if (limitLevel >= instrumentData.getMaxLimitLevel()) {
            return [false];
        }
        let templateId = instrumentData.getLimitTemplateId();
        let curLevel = instrumentData.getLevel();
        let [isReach] = InstrumentDataHelper.isReachInstrumentLimitRank(templateId, limitLevel, curLevel);
        if (!isReach) {
            return [false];
        }
        let info = InstrumentDataHelper.getInstrumentRankConfig(templateId, limitLevel);
        let curCount = instrumentData.getLimitCostCountWithKey(key);
        let maxSize = info['size_' + key];
        let isFull = curCount >= maxSize;
        if (!isFull) {
            let count = UserDataHelper.getNumByTypeAndValue(info['type_' + key], info['value_' + key]) + curCount;
            if (count >= maxSize) {
                return [
                    true,
                    isFull
                ];
            }
        }
        return [
            false,
            isFull
        ];
    };
    export function getInstrumentTransformTarList(filterIds, tempData) {
        let sortFun = function (a, b) {
            if (a.getLevel() != b.getLevel()) {
                return a.getLevel() > b.getLevel();
            } else {
                return a.getBase_id() < b.getBase_id();
            }
        };
        let isInFilter = function (unit) {
            for (let i in filterIds) {
                let filterId = filterIds[i];
                if (filterId == unit.getBase_id()) {
                    return true;
                }
            }
            return false;
        };
        let checkLimitCondition = function (isDidLimit, unit) {
            if (isDidLimit == false) {
                return true;
            } else {
                if (unit.isCanLimitBreak()) {
                    return true;
                } else {
                    return false;
                }
            }
        };
        let result = {};
        let filterColor = tempData.color;
        let isDidLimit = tempData.isDidLimit;
        let InstrumentConfig = instrumentConfig;
        let len = InstrumentConfig.length();
        for (let i = 0; i < len; i++) {
            let info = InstrumentConfig.indexOf(i);
            let data = clone(tempData);
            data.baseId = info.id;
            let unit = G_UserData.getInstrument().createTempInstrumentUnitData(data);
            let isTar = unit.isCanBeTranformTar(); // --是否能成为目标者
            let country = unit.getCountry();
            let color = unit.getConfig().color;
            if (result[country] == null) {
                result[country] = [];
            }
            if (isTar && color == filterColor && !isInFilter(unit) && checkLimitCondition(isDidLimit, unit)) {
                result[country].push(unit);
            }
        }
        for (let k in result) {
            let temp = result[k];
            temp.sort(sortFun);
        }
        return result;
    };
}
