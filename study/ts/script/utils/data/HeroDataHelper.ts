import { AttrDataHelper } from "./AttrDataHelper";
import { HeroConst } from "../../const/HeroConst";
import { G_UserData, G_ConfigLoader } from "../../init";
import AttributeConst from "../../const/AttributeConst";
import { AvatarDataHelper } from "./AvatarDataHelper";
import { DataConst } from "../../const/DataConst";
import TeamConst from "../../const/TeamConst";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import ParameterIDConst from "../../const/ParameterIDConst";
import { FunctionCheck } from "../logic/FunctionCheck";
import { TypeConvertHelper } from "../TypeConvertHelper";
import { FunctionConst } from "../../const/FunctionConst";
import GemstoneConst from "../../const/GemstoneConst";
import { BaseConfig } from "../../config/BaseConfig";
import { UserDataHelper } from "./UserDataHelper";
import { UserCheck } from "../logic/UserCheck";
import HeroTrainHelper from "../../scene/view/heroTrain/HeroTrainHelper";
import { PetDataHelper } from "./PetDataHelper";
import { RecoveryDataHelper } from "./RecoveryDataHelper";
import HeroGoldHelper from "../../scene/view/heroGoldTrain/HeroGoldHelper";
import { TreasureDataHelper } from "./TreasureDataHelper";
import { TeamDataHelper } from "./TeamDataHelper";
import { HorseDataHelper } from "./HorseDataHelper";
import { InstrumentDataHelper } from "./InstrumentDataHelper";
import { EquipDataHelper } from "./EquipDataHelper";
import { SilkbagDataHelper } from "./SilkbagDataHelper";
import { HomelandHelp } from "../../scene/view/homeland/HomelandHelp";
import { clone, clone2 } from "../GlobleFunc";
import { HistoryHeroDataHelper } from "./HistoryHeroDataHelper";
import { LogicCheckHelper } from "../LogicCheckHelper";
import { TacticsDataHelper } from "./TacticsDataHelper";

export namespace HeroDataHelper {
    let HeroConfig: BaseConfig;
    let HeroResConfig: BaseConfig;
    let HeroFateConfig: BaseConfig;
    let HeroFriendConfig: BaseConfig;
    let HeroAwakenConfig: BaseConfig;
    let HeroLevelUpConfig: BaseConfig;
    let HeroRankConfig: BaseConfig;
    let HeroRankConstConfig: BaseConfig;
    let HeroLimitConstConfig: BaseConfig;
    let HeroLimitSizeConfig: BaseConfig;
    let RoleConfig: BaseConfig;
    let AttributeConfig: BaseConfig;
    let GemstoneConfig: BaseConfig;
    let OfficialRankConfig: BaseConfig;
    let ParameterConfig: BaseConfig;
    let ItemConfig: BaseConfig;
    let HeroRedLimitSizeConfig: BaseConfig;
    export function init() {

        HeroConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO)
        HeroResConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO_RES)
        HeroFateConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO_FATE)
        HeroFriendConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO_FRIEND)
        HeroAwakenConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO_AWAKEN)
        HeroLevelUpConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO_LEVELUP)
        HeroRankConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO_RANK)
        HeroRankConstConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO_RANK_COST)
        HeroLimitConstConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO_LIMIT_COST)
        HeroLimitSizeConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO_LIMIT_SIZE)
        RoleConfig = G_ConfigLoader.getConfig(ConfigNameConst.ROLE)
        AttributeConfig = G_ConfigLoader.getConfig(ConfigNameConst.ATTRIBUTE)
        GemstoneConfig = G_ConfigLoader.getConfig(ConfigNameConst.GEMSTONE)
        OfficialRankConfig = G_ConfigLoader.getConfig(ConfigNameConst.OFFICIAL_RANK)
        ParameterConfig = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER)
        ItemConfig = G_ConfigLoader.getConfig(ConfigNameConst.ITEM);
        HeroRedLimitSizeConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO_RED_LIMIT_SIZE);
    }

    export function getHeroConfig(id) {
        let info = HeroConfig.get(id);
        return info;
    };
    export function getHeroResConfig(id) {
        let info = HeroResConfig.get(id);
        return info;
    };
    export function getHeroRedLimitSizeConfig(id, limitRedLevel) {
        var config = HeroRedLimitSizeConfig.get(id, limitRedLevel);
        return config;
    };
    export function getHeroYokeConfig(id) {

        let info = HeroFateConfig.get(id);
        return info;
    };
    export function getHeroFriendConfig(id) {
        let info = HeroFriendConfig.get(id);
        return info;
    };
    export function getHeroAwakenConfig(id, awakeCost) {
        let info = HeroAwakenConfig.get(id, awakeCost)
        return info;
    };
    export function getHeroLevelupConfig(level, templet) {
        let info = HeroLevelUpConfig.get(level, templet)
        return info;
    };
    export function getHeroRankConfig(id, rank, limit, limitRed?) {
        limitRed = limitRed || 0;
        var config = HeroRankConfig.get(id, rank, limit, limitRed);
        return config;
    };
    export function getHeroRankCostConfig(rank, templet) {
        let config = HeroRankConstConfig.get(rank, templet);
        return config;
    };
    export function getHeroLimitSizeConfig(id, limitLevel) {
        let config = HeroLimitSizeConfig.get(id, limitLevel);
        return config;
    };
    export function getHeroLimitCostConfig(limitLevel, limitLevelRed?) {
        limitLevelRed = limitLevelRed || 0;
        var config = HeroLimitConstConfig.get(limitLevel, limitLevelRed);
        // assert(config, string.format('hero_limit_cost config can not find limit_level = %d', limitLevel));
        return config;
    };
    export function getLimitDataType(unitData) {
        var config = unitData.getConfig();
        var limitLevel = unitData.getLimit_level();
        var limitRedLevel = unitData.getLimit_rtg();
        if (config.color == 6 && config.limit_red == 1) {
            return HeroConst.HERO_LIMIT_TYPE_GOLD_ORG;
        } else if (config.color == 5 && limitLevel == 3 && config.limit_red == 1) {
            return HeroConst.HERO_LIMIT_TYPE_GOLD_RED;
        } else {
            return HeroConst.HERO_LIMIT_TYPE_RED;
        }
    };
    export function getHeroYokeIdsByConfig(baseId) {
        let result: any = [];
        let info = HeroDataHelper.getHeroConfig(baseId);
        for (let i = 1; i <= HeroConst.HERO_YOKE_MAX; i++) {
            let fateId = info['fate_' + i];
            if (fateId > 0) {
                result.push(fateId);
            }
        }
        return result;
    };
    // 性能优化，增加新方法供外层使用
    export function getHeroYokeIdsByConfig1(heroCfg) {
        let result: any = [];
        let info = heroCfg;
        for (let i = 1; i <= HeroConst.HERO_YOKE_MAX; i++) {
            let fateId = info['fate_' + i];
            if (fateId > 0) {
                result.push(fateId);
            }
        }
        return result;
    };
    // 性能优化，增加新方法供外层使用
    export function getHeroYokeInfosByConfig(baseId) {
        var result = [];
        let fateIds: any = [];
        let info = HeroDataHelper.getHeroConfig(baseId);
        for (let i = 1; i <= HeroConst.HERO_YOKE_MAX; i++) {
            let fateId = info['fate_' + i];
            if (fateId > 0) {
                fateIds.push(fateId);
            }
        }
        for (let i in fateIds) {
            let fateId = fateIds[i];
            let info = HeroDataHelper.getHeroYokeConfig(fateId);
            result.push(info);
        }
        return result;
    };

    export function getHeroKarmaData(heroConfig) {
        let data: any = [];
        for (let i = 1; i <= HeroConst.HERO_KARMA_MAX; i++) {
            let friendId = heroConfig['friend_' + i];
            if (friendId > 0) {
                let friendConfig = HeroDataHelper.getHeroFriendConfig(friendId);
                let unitData = {};
                unitData['id'] = friendConfig.friend_id;
                unitData['karmaName'] = friendConfig.friend_name;
                let heroIds: any = [];
                for (let j = 1; j <= 3; j++) {
                    let heroId = friendConfig['hero_id_' + j];
                    if (heroId > 0) {
                        heroIds.push(heroId);
                    }
                }
                unitData['heroIds'] = heroIds;
                unitData['attrId'] = friendConfig.talent_attr;
                unitData['attrName'] = AttributeConfig.get(friendConfig.talent_attr).cn_name;
                unitData['attrValue'] = (parseInt(friendConfig.talent_value) / 10);
                unitData['cond1'] = friendConfig.friend_cond1;
                unitData['cond2'] = friendConfig.friend_cond2;
                data.push(unitData);
            }
        }
        return data;
    };

    export function getSameCountryHeroes(id, color) {
        var list = [];
        var country = HeroDataHelper.getHeroConfig(id).country;
        var config = HeroConfig;
        var len = config.length();
        for (var i = 0; i < len; i++) {
            var info = config.indexOf(i);
            if (info.country == country && (color == null || color == info.color) && info.is_show == 1) {
                list.push(info.id);
            }
        }
        return list;
    };

    export function getReachCond(heroData, cond1, cond2, level?, officialLevel?) {
        if (cond1 == '' && cond2 == '') {
            return true;
        }
        let condArray: any = [];
        if (cond1 != '' && cond1) {
            condArray.push(cond1.split('|'));
        }
        if (cond2 != '' && cond2) {
            condArray.push(cond2.split('|'));
        }
        let reach = true;
        for (let i = 0; i < condArray.length; i++) {
            let condType = parseInt(condArray[i][0]);
            let condValue = parseInt(condArray[i][1]);
            if (condType == 1) {
                reach = reach && heroData.getLimit_level() >= condValue;
            }
            else if (condType == 2) {
                if (!level) {
                    level = G_UserData.getBase().getLevel();
                }
                reach = reach && level >= condValue;
            } else if (condType == 3) {
                if (!officialLevel) {
                    officialLevel = G_UserData.getBase().getOfficer_level()
                }
                reach = reach && officialLevel >= condValue;
            }
        }
        return reach;
    };
    export function isShowYokeMark(baseId) {
        let isIn = G_UserData.getHero().isInListWithBaseId(baseId);
        if (isIn) {
            return false;
        }
        let ret = HeroDataHelper.isHaveYokeWithHeroBaseId(baseId);
        return ret;
    };
    export function isHaveYokeWithHeroBaseId(baseId) {
        let heroFateMap = G_UserData.getHero().getHeroFateMap();
        let fateIds = heroFateMap[baseId];
        if (fateIds) {
            for (let i in fateIds) {
                let fateId = fateIds[i];
                let fateConfig = HeroDataHelper.getHeroYokeConfig(fateId);
                let heroId = fateConfig.hero_id;
                if (G_UserData.getTeam().isInBattleWithBaseId(heroId)) {
                    return true;
                }
            }
        }
        return false;
    };
    export function isHaveKarmaWithHeroBaseId(baseId) {
        let isHaved = G_UserData.getKarma().isHaveHero(baseId);
        if (isHaved) {
            return false;
        }
        let heroBaseIds = G_UserData.getTeam().getHeroBaseIdsInBattle();
        for (let i in heroBaseIds) {
            let heroBaseId = heroBaseIds[i];
            let heroConfig = HeroDataHelper.getHeroConfig(heroBaseId);
            let data = HeroDataHelper.getHeroKarmaData(heroConfig);
            for (let j in data) {
                let one = data[j];
                for (let k in one.heroIds) {
                    let id = one.heroIds[k];
                    if (baseId == id) {
                        return true;
                    }
                }
            }
        }
        return false;
    };
    export function isHaveYokeToBattleWarriorByTreasureId(treasureId) {
        let bYoke = false;
        let heroBaseIds = G_UserData.getTeam().getHeroBaseIdsInBattle();
        for (const index in heroBaseIds) {
            let heroId = heroBaseIds[index];
            if (TreasureDataHelper.isHaveYokeBetweenHeroAndTreasured(heroId, treasureId)) {
                bYoke = true;
                break;
            }
        }
        return bYoke;
    };
    export function getActivateKarmaInfoWithHeroBaseId(baseId) {
        let returnData: any = [];
        let isHaved = G_UserData.getKarma().isHaveHero(baseId);
        if (isHaved) {
            return returnData;
        }
        let heroBaseIds = G_UserData.getTeam().getHeroBaseIdsInBattle();
        for (let i in heroBaseIds) {
            let heroBaseId = heroBaseIds[i];
            let heroConfig = HeroDataHelper.getHeroConfig(heroBaseId);
            let data = HeroDataHelper.getHeroKarmaData(heroConfig);
            for (let j in data) {
                let one = data[j];
                for (let k in one.heroIds) {
                    let id = one.heroIds[k];
                    if (baseId == id) {
                        returnData.push({
                            heroId: heroBaseId,
                            karmaData: one
                        });
                        break;
                    }
                }
            }
        }
        return returnData;
    };
    export function getKarmaInfoWithHeroBaseId(baseId) {
        let result: any = [];
        let heroConfig = HeroDataHelper.getHeroConfig(baseId);
        let data = HeroDataHelper.getHeroKarmaData(heroConfig);
        let heroBaseIds = G_UserData.getKarma().getHero_base_id();
        for (let i in data) {
            let one = data[i];
            for (let j in one.heroIds) {
                let id = one.heroIds[j];
                for (let k in heroBaseIds) {
                    let heroBaseId = heroBaseIds[k];
                    if (id == heroBaseId) {
                        result.push(one);
                    }
                }
            }
        }
        return result;
    };
    export function getUserLevelUpExp(lastLevel?) {
        let level = lastLevel || G_UserData.getBase().getLevel();

        let roleConfig = RoleConfig.get(level);
        let exp = roleConfig.exp;
        return exp;
    };
    export function getHeroNeedExpWithLevel(templet, level) {
        let needExp = 0;
        for (let i = 1; i <= level - 1; i++) {
            let exp = HeroDataHelper.getHeroLevelUpExp(i, templet);
            needExp = needExp + exp;
        }
        return needExp;
    };
    export function getCanReachLevelWithExp(totalExp, templet) {
        let level = 1;
        let exp = 0;
        while (exp <= totalExp) {
            let temp = HeroDataHelper.getHeroLevelUpExp(level, templet);
            exp = exp + temp;
            level = level + 1;
        }
        return level - 1;
    };
    export function getHeroLevelUpExp(level, templet) {
        let config = HeroDataHelper.getHeroLevelupConfig(level, templet);
        return config.exp;
    };
    //正确
    export function getBasicAttrWithLevel(heroConfig, level) {
        let templet = heroConfig.lvup_cost;
        let atk = heroConfig.atk_base;
        let pdef = heroConfig.pdef_base;
        let mdef = heroConfig.mdef_base;
        let hp = heroConfig.hp_base;
        let growAtk = heroConfig.atk_grow;
        let growPdef = heroConfig.pdef_grow;
        let growMdef = heroConfig.mdef_grow;
        let growHp = heroConfig.hp_grow;
        let hitBase = heroConfig.hit_base;
        let noHitBase = heroConfig.no_hit_base;
        let critBase = heroConfig.crit_base;
        let noCritBase = heroConfig.no_crit_base;
        for (let i = 1; i <= level - 1; i++) {
            let config = HeroDataHelper.getHeroLevelupConfig(i, templet);
            if (config && config.ratio != null) {
                let ratio = config.ratio;
                atk = atk + Math.floor(growAtk * ratio / 1000);
                pdef = pdef + Math.floor(growPdef * ratio / 1000);
                mdef = mdef + Math.floor(growMdef * ratio / 1000);
                hp = hp + Math.floor(growHp * ratio / 1000);
            }
        }
        let result = {};
        result[AttributeConst.ATK] = atk;
        result[AttributeConst.PD] = pdef;
        result[AttributeConst.MD] = mdef;
        result[AttributeConst.HP] = hp;
        result[AttributeConst.HIT] = hitBase;
        result[AttributeConst.NO_HIT] = noHitBase;
        result[AttributeConst.CRIT] = critBase;
        result[AttributeConst.NO_CRIT] = noCritBase;
        return result;
    };
    export function getHeroBreakMaterials(heroUnitData) {
        let rankLevel = heroUnitData.getRank_lv();
        let templet = heroUnitData.getConfig().rank_cost;
        let config = HeroDataHelper.getHeroRankCostConfig(rankLevel, templet);
        let result: any = [];
        let card = config.card;
        if (card > 0) {
            result.push({
                type: TypeConvertHelper.TYPE_HERO,
                value: heroUnitData.getBase_id(),
                size: card
            });
        }
        for (let i = 1; i <= 2; i++) {
            let type = config['type_' + i];
            let value = config['value_' + i];
            let size = config['size_' + i];
            if (size > 0) {
                result.push({
                    type: type,
                    value: value,
                    size: size
                });
            }
        }
        return result;
    };
    export function getHeroBreakLimitLevel(heroUnitData) {
        let rankLevel = heroUnitData.getRank_lv();
        let templet = heroUnitData.getConfig().rank_cost;
        let config = HeroDataHelper.getHeroRankCostConfig(rankLevel, templet);
        return config.level;
    };
    export function getBreakCostWithRank(rank, templet) {
        let rankCostConfig = HeroDataHelper.getHeroRankCostConfig(rank, templet);
        let needLevel = rankCostConfig.level;
        let card = rankCostConfig.card;
        let type1 = rankCostConfig.type_1;
        let value1 = rankCostConfig.value_1;
        let size1 = rankCostConfig.size_1;
        return {
            needLevel: needLevel,
            card: card,
            type1: type1,
            value1: value1,
            size1: size1
        };
    };
    export function getHeroBreakMaxLevel(heroUnitData) {
        let level = heroUnitData.getLevel();
        let templet = heroUnitData.getConfig().rank_cost;
        let rankMax = heroUnitData.getConfig().rank_max;
        for (let i = 1; i <= rankMax; i++) {
            let info = HeroDataHelper.getHeroRankCostConfig(i, templet);
            if (level < info.level) {
                return i;
            }
        }
        return rankMax;
    };
    //正确
    export function getBreakAttr(heroUnitData, addRank?) {
        addRank = addRank || 0;
        let baseId = heroUnitData.getBase_id();
        let rank = heroUnitData.getRank_lv() + addRank;
        let rankMax = heroUnitData.getConfig().rank_max;
        if (rank > rankMax) {
            return null;
        }
        let limitLevel = heroUnitData.getLimit_level();
        var limitRedLevel = heroUnitData.getLimit_rtg();
        let result = HeroDataHelper.getBreakAttrWithBaseIdAndRank(baseId, rank, limitLevel, limitRedLevel);
        return result;
    };

    export function getBreakAttrWithBaseIdAndRank(baseId, rank, limitLevel, limitRedLevel) {
        var atk = 0;
        var pdef = 0;
        var mdef = 0;
        var hp = 0;
        var atkper = 0;
        var pdper = 0;
        var mdper = 0;
        var hpper = 0;
        for (var i = 1; i <= rank; i++) {
            var heroRankConfig = HeroDataHelper.getHeroRankConfig(baseId, i, limitLevel, limitRedLevel);
            atk = atk + heroRankConfig.atk_break;
            pdef = pdef + heroRankConfig.pdef_break;
            mdef = mdef + heroRankConfig.mdef_break;
            hp = hp + heroRankConfig.hp_break;
            atkper = atkper + heroRankConfig.atkper_break;
            pdper = pdper + heroRankConfig.pdefper_break;
            mdper = mdper + heroRankConfig.mdefper_break;
            hpper = hpper + heroRankConfig.hpper_break;
        }
        var result = {};
        result[AttributeConst.ATK] = atk;
        result[AttributeConst.PD] = pdef;
        result[AttributeConst.MD] = mdef;
        result[AttributeConst.HP] = hp;
        result[AttributeConst.ATK_PER] = atkper;
        result[AttributeConst.PD_PER] = pdper;
        result[AttributeConst.MD_PER] = mdper;
        result[AttributeConst.HP_PER] = hpper;
        return result;
    };
    export function getLimitAttr(heroUnitData, tempLimitLevel?, tempLimitRedLevel?) {
        var result = {};
        var heroBaseId = heroUnitData.getBase_id();
        var limitLevel = tempLimitLevel || heroUnitData.getLimit_level();
        var limitRedLevel = tempLimitRedLevel || heroUnitData.getLimit_rtg();
        if (limitRedLevel > 0) {
            for (var i = 0; i <= limitRedLevel; i++) {
                var attrInfo = HeroDataHelper.getLimitSingleAttr(heroBaseId, i, HeroConst.HERO_LIMIT_TYPE_GOLD);
                AttrDataHelper.appendAttr(result, attrInfo);
            }
        }
        if (limitLevel > 0) {
            for (var i = 0; i <= limitLevel; i++) {
                var attrInfo = HeroDataHelper.getLimitSingleAttr(heroBaseId, i, HeroConst.HERO_LIMIT_TYPE_RED);
                AttrDataHelper.appendAttr(result, attrInfo);
            }
        }
        return result;
    };
    export function getLimitSingleAttr(heroBaseId, limitLevel, limitType) {
        var result = {};
        var config;
        if (limitType == HeroConst.HERO_LIMIT_TYPE_GOLD) {
            config = HeroDataHelper.getHeroRedLimitSizeConfig(heroBaseId, limitLevel);
        } else {
            config = HeroDataHelper.getHeroLimitSizeConfig(heroBaseId, limitLevel);
        }
        if (config == null) {
            return result;
        }
        for (var j = 1; j <= 4; j++) {
            var attrType = config['type_' + j];
            var attrValue = config['size_' + j];
            if (attrType > 0) {
                AttrDataHelper.formatAttr(result, attrType, attrValue);
            }
        }
        return result;
    };

    export function convertLimitRedCost(heroUnitData, type, value) {
        if (type == 99) {
            if (value == 1) {
                var id = heroUnitData.getBase_id();
                return [
                    TypeConvertHelper.TYPE_HERO,
                    id
                ];
            } else if (value == 2) {
                var id = heroUnitData.getBase_id();
                var list = HeroDataHelper.getSameCountryHeroes(id, 7);
                return [
                    TypeConvertHelper.TYPE_HERO,
                    list[1]
                ];
            }
        } else {
            return [
                type,
                value
            ];
        }
    };
    export function getLimitCostConfigKey(index) {
        var res: any = {};
        if (index == 5) {
            res.name = 'special_name';
            res.type = 'special_type';
            res.value = 'special_value';
            res.size = 'special_size';
            res.consume = 'special_consume';
        } else {
            res.name = 'name_' + index;
            res.type = 'type_' + index;
            res.value = 'value_' + index;
            res.size = 'size_' + index;
            res.consume = 'consume_' + index;
        }
        return res;
    };
    export function getAllLimitCost(heroUnitData) {
        var result = {};
        var exp = 0;
        var unionResult = function (result, tmp) {
            for (var k in tmp) {
                var v = tmp[k];
                result[k] = result[k] || {};
                for (var kk in v) {
                    var vv = v[kk];
                    result[k][kk] = result[k][kk] || 0;
                    result[k][kk] = result[k][kk] + vv;
                }
            }
            return result;
        };
        var config = heroUnitData.getConfig();
        var limitLevel = heroUnitData.getLimit_level();
        var limitRedLevel = heroUnitData.getLimit_rtg();
        if (config.color == 6) {
            var r = HeroDataHelper._getAllLimitCost(heroUnitData, 1), e;
            unionResult(result, r);
            exp = exp + e;
        } else {
            var r = HeroDataHelper._getAllLimitCost(heroUnitData, 0), e;
            unionResult(result, r);
            exp = exp + e;
            var r = HeroDataHelper._getAllLimitCost(heroUnitData, 2), e;
            unionResult(result, r);
            exp = exp + e;
        }
        var costHero = heroUnitData.getRtg_cost_hero();
        for (var k in costHero) {
            var v = costHero[k];
            var type = TypeConvertHelper.TYPE_HERO;
            var value = v.Key;
            var size = v.Value;
            if (HeroDataHelper.getHeroConfig(value).color == 7) {
                RecoveryDataHelper.formatRecoveryCost(result, type, value, size);
            }
        }
        return [
            result,
            exp
        ];
    };


    export function _getAllLimitCost(heroUnitData, limitRed) {
        var result = {};
        var exp = 0;
        for (var key = HeroConst.HERO_LIMIT_COST_KEY_1; key <= HeroConst.HERO_LIMIT_COST_KEY_6; key++) {
            if (key == HeroConst.HERO_LIMIT_COST_KEY_1) {
                exp = exp + heroUnitData.getLimitCostCountWithKey(key, limitRed);
            } else {
                var info = HeroDataHelper.getHeroLimitCostConfig(0, limitRed);
                var configKey = HeroDataHelper.getLimitCostConfigKey(key);
                var type = info[configKey.type];
                var value = info[configKey.value];
                if (type == 99 && value == 1) {
                    type = TypeConvertHelper.TYPE_HERO;
                    value = heroUnitData.getBase_id();
                }
                if (type != 99) {
                    var size = heroUnitData.getLimitCostCountWithKey(key, limitRed);
                    if (size > 0) {
                        RecoveryDataHelper.formatRecoveryCost(result, type, value, size);
                    }
                }
            }
        }
        var index;
        if (limitRed == 0) {
            index = heroUnitData.getLimit_level();
        } else {
            index = heroUnitData.getLimit_rtg();
        }
        for (var i = 1; i <= index; i++) {
            var config = HeroDataHelper.getHeroLimitCostConfig(i - 1, limitRed);
            exp = exp + config.size_1;
            for (var j = HeroConst.HERO_LIMIT_COST_KEY_2; j <= HeroConst.HERO_LIMIT_COST_KEY_6; j++) {
                var configKey = HeroDataHelper.getLimitCostConfigKey(j);
                var type = config[configKey.type];
                var value = config[configKey.value];
                if (type == 99 && value == 1) {
                    type = TypeConvertHelper.TYPE_HERO;
                    value = heroUnitData.getBase_id();
                }
                if (type != 99) {
                    var size = config[configKey.size];
                    if (size > 0) {
                        RecoveryDataHelper.formatRecoveryCost(result, type, value, size);
                    }
                }
            }
            RecoveryDataHelper.formatRecoveryCost(result, config.break_type, config.break_value, config.break_size);
        }
        return [
            result,
            exp
        ];
    };

    export function isReachLimitRank(heroUnitData) {
        var limitLevel = heroUnitData.getLimit_level();
        var limitRedLevel = heroUnitData.getLimit_rtg();
        var curRank = heroUnitData.getRank_lv();
        var config = heroUnitData.getConfig();
        var lv, type;
        if (config.limit_red == 0 || config.color == 5 && limitLevel < 3) {
            lv = limitLevel;
            type = HeroConst.HERO_LIMIT_TYPE_RED;
        } else {
            lv = limitRedLevel;
            if (config.color == 6) {
                type = HeroConst.HERO_LIMIT_TYPE_GOLD_ORG;
            } else {
                type = HeroConst.HERO_LIMIT_TYPE_GOLD_RED;
            }
        }
        var config2 = HeroDataHelper.getHeroLimitCostConfig(lv, type);
        var rank = config2.rank;
        if (curRank >= rank) {
            return [
                true,
                rank
            ];
        } else {
            return [
                false,
                rank
            ];
        }
    };
    export function getNeedLimitLevelWithRank(rank, limitLevelRed) {
        var rankList = [
            5,
            8,
            10,
            12
        ];
        limitLevelRed = limitLevelRed || 0;
        let Config = HeroLimitConstConfig;
        let len = Config.length();
        for (var i = 0; i < len; i++) {
            var info = Config.indexOf(i);
            if (info.limit_level_red == limitLevelRed) {
                if (limitLevelRed == 0) {
                    if (rank <= info.rank) {
                        return info.limit_level + 1;
                    }
                } else {
                    var index = 1;
                    for (var j = 1; j <= rankList.length; j++) {
                        if (rank <= rankList[j - 1]) {
                            return j;
                        }
                    }
                }
            }
        }
        return null;
    };

    export function getAwakeAttr(heroUnitData, addLevel?) {
        let tempLevel = addLevel || 0;
        let result = {};
        let awakeLevel = heroUnitData.getAwaken_level() + tempLevel;
        let awakeCost = heroUnitData.getConfig().awaken_cost || 0;
        let attrInfo1 = HeroDataHelper.getHeroAwakeLevelAttr(awakeLevel, awakeCost);
        let attrInfo2 = {};
        if (tempLevel == 0) {
            attrInfo2 = HeroDataHelper.getHeroAwakeCurGemstoneAttr(heroUnitData);
        }
        AttrDataHelper.appendAttr(result, attrInfo1);
        AttrDataHelper.appendAttr(result, attrInfo2);
        return result;
    };
    export function getAwakeTalentAttr(heroUnitData) {
        let result = {};
        let awakeLevel = heroUnitData.getAwaken_level();
        let awakeCost = heroUnitData.getConfig().awaken_cost || 0;
        for (let i = 0; i <= awakeLevel; i++) {
            let info = HeroDataHelper.getHeroAwakenConfig(i, awakeCost);
            for (let j = 1; j <= 4; j++) {
                let attrType = info['talent_attribute_type' + j];
                if (attrType > 0) {
                    let attrValue = info['talent_attribute_value' + j];
                    AttrDataHelper.formatAttr(result, attrType, attrValue);
                }
            }
        }
        return result;
    };
    export function getAvatarAttr(heroUnitData) {
        let result = {};
        if (!heroUnitData.isLeader()) {
            return result;
        }
        if (!G_UserData.getBase().isEquipAvatar()) {
            return result;
        }
        let avatarId = G_UserData.getBase().getAvatar_id();
        let unitData = G_UserData.getAvatar().getUnitDataWithId(avatarId);
        let baseId = unitData.getBase_id();
        let baseAttr = AvatarDataHelper.getAvatarBaseAttr(baseId);
        AttrDataHelper.appendAttr(result, baseAttr);
        return result;
    };
    export function getAvatarPower(heroUnitData) {
        let result = {};
        if (!heroUnitData.isLeader()) {
            return result;
        }
        if (!G_UserData.getBase().isEquipAvatar()) {
            return result;
        }
        let avatarId = G_UserData.getBase().getAvatar_id();
        let unitData = G_UserData.getAvatar().getUnitDataWithId(avatarId);
        let power = unitData.getConfig().fake;
        result[AttributeConst.AVATAR_EQUIP_POWER] = power;
        return result;
    };
    export function getAvatarShowAttr(heroUnitData) {
        let result = {};
        let allInfo = AvatarDataHelper.getAllOwnAvatarShowInfo();
        for (let i in allInfo) {
            let info = allInfo[i];
            let target = info.talent_target;
            if (target == 1 && heroUnitData.isLeader()) {
                for (let j = 1; j <= 4; j++) {
                    let attrId = info['talent_attr_' + j];
                    let attrValue = info['talent_value_' + j];
                    AttrDataHelper.formatAttr(result, attrId, attrValue);
                }
            } else if (target == 2) {
                for (let j = 1; j <= 4; j++) {
                    let attrId = info['talent_attr_' + j];
                    let attrValue = info['talent_value_' + j];
                    AttrDataHelper.formatAttr(result, attrId, attrValue);
                }
            }
        }
        return result;
    };
    export function getHistoryHeroAttr(pos) {
        var result = {};
        if (pos == null || pos == 0) {
            return result;
        }
        var historyHeroIds = G_UserData.getHistoryHero().getHistoryHeroIds();
        var historyHeroData = G_UserData.getHistoryHero().getHisoricalHeroValueById(historyHeroIds[pos -1]);
        if (!historyHeroData) {
            return result;
        }
        var attrInfo = HistoryHeroDataHelper.getAttrSingleInfo(historyHeroData);
        AttrDataHelper.appendAttr(result, attrInfo);
        return result;
    };

    export function getAvatarShowPower(heroUnitData) {
        let result = {};
        let power = 0;
        let allInfo = AvatarDataHelper.getAllOwnAvatarShowInfo();
        for (let i in allInfo) {
            let info = allInfo[i];
            let target = info.talent_target;
            if (target == 1 && heroUnitData.isLeader()) {
                power = power + info.fake;
            } else if (target == 2) {
                power = power + info.fake;
            }
        }
        result[AttributeConst.AVATAR_POWER] = power;
        return result;
    };
    export function getSilkbagAttr(heroUnitData) {
        var result = {};
        var userLevel = G_UserData.getBase().getLevel();
        var pos = heroUnitData.getPos();
        var heroBaseId = heroUnitData.getAvatarToHeroBaseId();
        var heroRank = heroUnitData.getRank_lv();
        var isInstrumentMaxLevel = G_UserData.getInstrument().isInstrumentLevelMaxWithPos(pos);
        var heroLimit = heroUnitData.getLeaderLimitLevel();
        var heroRedLimit = heroUnitData.getLeaderLimitRedLevel();
        var silkbagIds = G_UserData.getSilkbagOnTeam().getIdsOnTeamWithPos(pos);
        for (let i in silkbagIds) {
            var silkbagId = silkbagIds[i];
            var unitData = G_UserData.getSilkbag().getUnitDataWithId(silkbagId);
            var baseId = unitData.getBase_id();
            var isEffective = SilkbagDataHelper.isEffectiveSilkBagToHero(baseId, heroBaseId, heroRank, isInstrumentMaxLevel, heroLimit, heroRedLimit)[0];
            if (isEffective) {
                var attr = SilkbagDataHelper.getAttrWithId(baseId, userLevel);
                AttrDataHelper.appendAttr(result, attr);
            }
        }
        return result;
    };
    export function getSilkbagPower(heroUnitData) {
        var result = {};
        var power = 0;
        var pos = heroUnitData.getPos();
        var heroBaseId = heroUnitData.getAvatarToHeroBaseId();
        var heroRank = heroUnitData.getRank_lv();
        var isInstrumentMaxLevel = G_UserData.getInstrument().isInstrumentLevelMaxWithPos(pos);
        var heroLimit = heroUnitData.getLeaderLimitLevel();
        var heroRedLimit = heroUnitData.getLeaderLimitRedLevel();
        var silkbagIds = G_UserData.getSilkbagOnTeam().getIdsOnTeamWithPos(pos);
        for (let i in silkbagIds) {
            var silkbagId = silkbagIds[i];
            var unitData = G_UserData.getSilkbag().getUnitDataWithId(silkbagId);
            var baseId = unitData.getBase_id();
            var isEffective = SilkbagDataHelper.isEffectiveSilkBagToHero(baseId, heroBaseId, heroRank, isInstrumentMaxLevel, heroLimit, heroRedLimit)[0];
            if (isEffective) {
                var info = SilkbagDataHelper.getSilkbagConfig(baseId);
                power = power + info.fake;
            }
        }
        result[AttributeConst.SILKBAG_POWER] = power;
        return result;
    };

    export function getEquipAttr(pos, isPower?) {
        let result = {};
        if (pos == null || pos == 0) {
            return result;
        }
        let equipIds = G_UserData.getBattleResource().getEquipIdsWithPos(pos);
        for (let i in equipIds) {
            let equipId = equipIds[i];
            let equipData = G_UserData.getEquipment().getEquipmentDataWithId(equipId);
            let attrInfo = EquipDataHelper.getEquipAttrInfo(equipData);
            AttrDataHelper.appendAttr(result, attrInfo);
            let jadeAttr = EquipDataHelper.getEquipJadeAttrInfo(equipData, G_UserData.getBase().getLevel(), isPower);
            AttrDataHelper.appendAttr(result, jadeAttr);
        }
        let suitAttr = EquipDataHelper.getEquipSuitAttr(equipIds, pos);
        AttrDataHelper.appendAttr(result, suitAttr);
        return result;
    };
    export function getTreasureAttr(pos, isPower) {
        let result = {};
        if (pos == null || pos == 0) {
            return result;
        }
        let treasureIds = G_UserData.getBattleResource().getTreasureIdsWithPos(pos);
        for (let i in treasureIds) {
            let treasureId = treasureIds[i];
            let treasureData = G_UserData.getTreasure().getTreasureDataWithId(treasureId);
            let attrInfo = TreasureDataHelper.getTreasureAttrInfo(treasureData);
            AttrDataHelper.appendAttr(result, attrInfo);
            let jadeAttr = TreasureDataHelper.getTreasureJadeAttrInfo(treasureData, G_UserData.getBase().getLevel(), isPower);
            AttrDataHelper.appendAttr(result, jadeAttr)
        }
        return result;
    };
    export function getInstrumentAttr(pos) {
        let result = {};
        if (pos == null || pos == 0) {
            return result;
        }
        let instrumentIds = G_UserData.getBattleResource().getInstrumentIdsWithPos(pos);
        for (let i in instrumentIds) {
            let instrumentId = instrumentIds[i];
            let instrumentData = G_UserData.getInstrument().getInstrumentDataWithId(instrumentId);
            let attrInfo = InstrumentDataHelper.getInstrumentAttrInfo(instrumentData);
            AttrDataHelper.appendAttr(result, attrInfo);
        }
        return result;
    };
    export function getMasterAttr(pos) {
        let result = {};
        if (pos == null || pos == 0) {
            return result;
        }
        let strengthenEquipInfo = EquipDataHelper.getMasterEquipStrengthenInfo(pos);
        let strengthenEquipAttr = strengthenEquipInfo.curAttr;
        let refineEquipInfo = EquipDataHelper.getMasterEquipRefineInfo(pos);
        let refineEquipAttr = refineEquipInfo.curAttr;
        let strengthenTreasureInfo = TreasureDataHelper.getMasterTreasureUpgradeInfo(pos);
        let strengthenTreasureAttr = strengthenTreasureInfo.curAttr;
        let refineTreasureInfo = TreasureDataHelper.getMasterTreasureRefineInfo(pos);
        let refineTreasureAttr = refineTreasureInfo.curAttr;
        AttrDataHelper.appendAttr(result, strengthenEquipAttr);
        AttrDataHelper.appendAttr(result, refineEquipAttr);
        AttrDataHelper.appendAttr(result, strengthenTreasureAttr);
        AttrDataHelper.appendAttr(result, refineTreasureAttr);
        return result;
    };
    export function getOfficialAttr(level) {
        let result = {};

        let OfficialRank = OfficialRankConfig;
        for (let i = 0; i <= level; i++) {
            let info = OfficialRank.get(i);
            if (!info)
                cc.error('official_rank config can not find id = %d' + i);
            for (let j = 1; j <= 4; j++) {
                let attrType = info['attribute_type' + j];
                let attrValue = info['attribute_value' + j];
                AttrDataHelper.formatAttr(result, attrType, attrValue);
            }
        }
        return result;
    };
    export function getHomelandPower() {
        let result = {};
        let power = HomelandHelp.getAllPower();
        result[AttributeConst.HOMELAND_POWER] = power;
        return result;
    };
    export function getOfficialPower(level) {
        let result = {};
        let OfficialRank = OfficialRankConfig;
        let power = 0;
        for (let i = 1; i <= level; i++) {
            let info = OfficialRank.get(i);
            if (!info)
                cc.error('official_rank config can not find id = %d' + i);
            power = power + info.all_combat;
        }
        result[AttributeConst.OFFICAL_POWER] = power;
        return result;
    };
    export function getTalentPower(heroUnitData, tempRank) {
        var result = {};
        var heroBaseId = heroUnitData.getBase_id();
        var rank = heroUnitData.getRank_lv() + tempRank;
        var limitLevel = heroUnitData.getLimit_level();
        var limitRedLevel = heroUnitData.getLimit_rtg();
        var power = 0;
        for (var i = 0; i <= rank; i++) {
            var info = HeroDataHelper.getHeroRankConfig(heroBaseId, i, limitLevel, limitRedLevel);
            power = power + info.fake_power;
        }
        result[AttributeConst.TALENT_POWER] = power;
        return result;
    };

    export function getKarmaAttrRatio(heroConfig) {
        let result = {};
        for (let i = 1; i <= HeroConst.HERO_KARMA_MAX; i++) {
            let friendId = heroConfig['friend_' + i];
            if (friendId > 0) {
                if (G_UserData.getKarma().isActivated(friendId)) {
                    let friendConfig = HeroDataHelper.getHeroFriendConfig(friendId);
                    let attrId = friendConfig.talent_attr;
                    let attrValue = friendConfig.talent_value;
                    AttrDataHelper.formatAttr(result, attrId, attrValue);
                }
            }
        }
        return result;
    };
    export function getYokeAttrRatio(heroUnitData) {
        let heroConfig = heroUnitData.getConfig();
        let result = {};
        for (let i = 1; i <= HeroConst.HERO_YOKE_MAX; i++) {
            let fateId = heroConfig['fate_' + i];
            if (fateId > 0) {
                if (heroUnitData.isActivatedYoke(fateId)) {
                    let fateConfig = HeroDataHelper.getHeroYokeConfig(fateId);
                    for (let i = 1; i <= 2; i++) {
                        let attrId = fateConfig['talent_attr_' + i];
                        let attrValue = fateConfig['talent_value_' + i];
                        AttrDataHelper.formatAttr(result, attrId, attrValue);
                    }
                }
            }
        }
        return result;
    };
    export function getTalentAttr(heroUnitData, rank, notTalent) {
        var result = {};
        if (notTalent == true) {
            return result;
        }
        var heroBaseId = heroUnitData.getAvatarToHeroBaseId();
        var limitLevel = heroUnitData.getLimit_level();
        var limitRedLevel = heroUnitData.getLimit_rtg();
        if (heroUnitData.isLeader()) {
            limitLevel = heroUnitData.getLeaderLimitLevel();
            limitRedLevel = heroUnitData.getLeaderLimitRedLevel();
        }
        for (var i = 1; i <= rank; i++) {
            var info = HeroDataHelper.getHeroRankConfig(heroBaseId, i, limitLevel, limitRedLevel);
            if (info) {
                var target = info.talent_target;
                if (target == 1) {
                    for (var j = 1; j <= 2; j++) {
                        var attrId = info['talent_attr_' + j];
                        var attrValue = info['talent_value_' + j];
                        AttrDataHelper.formatAttr(result, attrId, attrValue);
                    }
                }
            }
        }
        if (heroUnitData.isInBattle()) {
            var heroIds = G_UserData.getTeam().getHeroIdsInBattle();
            for (let i in heroIds) {
                var id = heroIds[i];
                var unit = G_UserData.getHero().getUnitDataWithId(id);
                var baseId = unit.getAvatarToHeroBaseId();
                let limitLevel = unit.getLimit_level();
                var limitRedLevel = unit.getLimit_rtg();
                if (unit.isLeader()) {
                    limitLevel = unit.getLeaderLimitLevel();
                    limitRedLevel = unit.getLeaderLimitRedLevel();
                }
                var rLv = unit.getRank_lv();
                for (var j = 1; j <= rLv; j++) {
                    var info = HeroDataHelper.getHeroRankConfig(baseId, j, limitLevel, limitRedLevel);
                    if (info) {
                        var tar = info.talent_target;
                        if (tar == 2) {
                            for (var k = 1; k <= 2; k++) {
                                var attrId = info['talent_attr_' + k];
                                var attrValue = info['talent_value_' + k];
                                AttrDataHelper.formatAttr(result, attrId, attrValue);
                            }
                        }
                    }
                }
            }
        }
        return result;
    };

    export function getTacticsAttr(pos) {
        //debug
        var result = {};
        if (pos == null || pos == 0) {
            return result;
        }
        var unitList = G_UserData.getTactics().getUnitDataListWithPos(pos);
        for (let i in unitList) {
            var unitData = unitList[i];
            var attrInfo = TacticsDataHelper.getAttrSingleInfo(unitData);
            AttrDataHelper.appendAttr(result, attrInfo);
        }
        return result;
    };
    export function getTacticsPower(pos) {
        var result = {};
        if (pos == null || pos == 0) {
            return result;
        }
        var unitList = G_UserData.getTactics().getUnitDataListWithPos(pos);
        for (var _ in unitList) {
            var unitData = unitList[_];
            var attrInfo = TacticsDataHelper.getPowerSingleInfo(unitData);
            AttrDataHelper.appendAttr(result, attrInfo);
        }
        return result;
    };

    export function getHaloAttr(heroUnitData, rank) {
        var result = {};
        var heroBaseId = heroUnitData.getAvatarToHeroBaseId();
        var limitLevel = heroUnitData.getLeaderLimitLevel();
        var limitRedLevel = heroUnitData.getLeaderLimitRedLevel();
        for (var i = 1; i <= rank; i++) {
            var info = HeroDataHelper.getHeroRankConfig(heroBaseId, i, limitLevel, limitRedLevel);
            if (info) {
                for (var k = 1; k <= 2; k++) {
                    var haloTarget = info['halo_target_' + k];
                    if (haloTarget == 1) {
                        var attrId = info['halo_attr_' + k];
                        var attrValue = info['halo_value_' + k];
                        AttrDataHelper.formatAttr(result, attrId, attrValue);
                    }
                }
            }
        }
        if (heroUnitData.isInBattle()) {
            var heroIds = G_UserData.getTeam().getHeroIdsInBattle();
            for (let i in heroIds) {
                var id = heroIds[i];
                var unit = G_UserData.getHero().getUnitDataWithId(id);
                var baseId = unit.getAvatarToHeroBaseId();
                let limitLevel = unit.getLimit_level();
                var limitRedLevel = unit.getLimit_rtg();
                if (unit.isLeader()) {
                    limitLevel = unit.getLeaderLimitLevel();
                    limitRedLevel = unit.getLeaderLimitRedLevel();
                }
                var rLv = unit.getRank_lv();
                for (var j = 1; j <= rLv; j++) {
                    var info = HeroDataHelper.getHeroRankConfig(baseId, j, limitLevel, limitRedLevel);
                    if (info) {
                        for (var k = 1; k <= 2; k++) {
                            var haloTarget = info['halo_target_' + k];
                            if (haloTarget == 2) {
                                var attrId = info['halo_attr_' + k];
                                var attrValue = info['halo_value_' + k];
                                AttrDataHelper.formatAttr(result, attrId, attrValue);
                            }
                        }
                    }
                }
            }
        }
        return result;
    };

    export function getInstrumentTalentAttr(pos) {
        let result = {};
        if (pos == null || pos == 0) {
            return result;
        }
        let instrumentIds = G_UserData.getBattleResource().getInstrumentIdsWithPos(pos);
        for (let i in instrumentIds) {
            let instrumentId = instrumentIds[i];
            let instrumentData = G_UserData.getInstrument().getInstrumentDataWithId(instrumentId);
            let templet = instrumentData.getAdvacneTemplateId();
            let level = instrumentData.getLevel();
            for (let j = 1; j <= level; j++) {

                let info = G_ConfigLoader.getConfig(ConfigNameConst.INSTRUMENT_LEVEL).get(j, templet);
                if (!info)
                    cc.error('instrument_level config can not find level = %d, templet = %d');
                let target = info.talent_target;
                if (target == 1) {
                    for (let k = 1; k <= 2; k++) {
                        let attrId = info['talent_attr_' + k];
                        let attrValue = info['talent_value_' + k];
                        AttrDataHelper.formatAttr(result, attrId, attrValue);
                    }
                }
            }
            let heroId = G_UserData.getTeam().getHeroIdWithPos(pos);
            let heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
            let heroBaseId = heroUnitData.getAvatarToHeroBaseId();
            let heroConfig = HeroDataHelper.getHeroConfig(heroBaseId);
            let instrumentBaseId = heroConfig.instrument_id;
            let instrumentConfig = G_ConfigLoader.getConfig(ConfigNameConst.INSTRUMENT).get(instrumentBaseId);
            if (level >= instrumentConfig.unlock) {
                let haloTarget = instrumentConfig.halo_target;
                if (haloTarget == 1) {
                    let attrId = instrumentConfig.halo_attr;
                    let attrValue = instrumentConfig.halo_value;
                    AttrDataHelper.formatAttr(result, attrId, attrValue);
                }
            }
        }
        let heroIds = G_UserData.getTeam().getHeroIds();
        for (let i in heroIds) {
            let id = heroIds[i];
            if (id > 0) {
                let instrumentIds = G_UserData.getBattleResource().getInstrumentIdsWithPos(Number(i) + 1);
                for (let t in instrumentIds) {
                    let instrumentId = instrumentIds[t];
                    let instrumentData = G_UserData.getInstrument().getInstrumentDataWithId(instrumentId);
                    let templet = instrumentData.getAdvacneTemplateId();
                    let level = instrumentData.getLevel();
                    for (let k = 1; k <= level; k++) {
                        let info = G_ConfigLoader.getConfig(ConfigNameConst.INSTRUMENT_LEVEL).get(k, templet);
                        if (!info)
                            cc.error('instrument_level config can not find level = %d, templet = %d');
                        let target = info.talent_target;
                        if (target == 2) {
                            for (let m = 1; m <= 2; m++) {
                                let attrId = info['talent_attr_' + m];
                                let attrValue = info['talent_value_' + m];
                                AttrDataHelper.formatAttr(result, attrId, attrValue);
                            }
                        }
                    }
                    let heroUnitData = G_UserData.getHero().getUnitDataWithId(id);
                    let heroBaseId = heroUnitData.getAvatarToHeroBaseId();
                    let heroConfig = HeroDataHelper.getHeroConfig(heroBaseId);
                    let instrumentBaseId = heroConfig.instrument_id;
                    let instrumentConfig = G_ConfigLoader.getConfig(ConfigNameConst.INSTRUMENT).get(instrumentBaseId);
                    if (level >= instrumentConfig.unlock) {
                        let haloTarget = instrumentConfig.halo_target;
                        if (haloTarget == 2) {
                            let attrId = instrumentConfig.halo_attr;
                            let attrValue = instrumentConfig.halo_value;
                            AttrDataHelper.formatAttr(result, attrId, attrValue);
                        }
                    }
                }
            }
        }
        return result;
    };
    export function getTotalAttr(param) {
        let result = HeroDataHelper.getTotalBaseAttr(param);
        AttrDataHelper.processDefAndAddition(result);
        return result;
    };
    export function getBoutAttr(pos) {
        var result = {};
        if (pos == null || pos == 0) {
            return result;
        }
        AttrDataHelper.appendAttr(result, G_UserData.getBout().getAttrSingleInfo());
        return result;
    };
    export function getTotalBaseAttr(param) {
        let result = {};
        let heroUnitData = param.heroUnitData;
        let tempLevel = param.addLevel || 0;
        let tempRank = param.addRank || 0;
        let level = heroUnitData.getLevel() + tempLevel;
        let rank = heroUnitData.getRank_lv() + tempRank;
        let attr1 = HeroDataHelper.getBasicAttrWithLevel(heroUnitData.getConfig(), level);//
        let attr2 = HeroDataHelper.getBreakAttr(heroUnitData, tempRank);//
        let attr3 = HeroDataHelper.getLimitAttr(heroUnitData);
        let attr4 = HeroDataHelper.getAwakeAttr(heroUnitData);//
        let attr5 = HeroDataHelper.getEquipAttr(heroUnitData.getPos());//
        let attr6 = HeroDataHelper.getTreasureAttr(heroUnitData.getPos(), false);//
        let attr7 = HeroDataHelper.getInstrumentAttr(heroUnitData.getPos());//
        let attr8 = HeroDataHelper.getMasterAttr(heroUnitData.getPos());//
        let attr9 = HeroDataHelper.getOfficialAttr(G_UserData.getBase().getOfficialLevel());
        let attr10 = HeroDataHelper.getKarmaAttrRatio(heroUnitData.getConfig());
        let attr11 = HeroDataHelper.getYokeAttrRatio(heroUnitData);
        let attr12 = HeroDataHelper.getTalentAttr(heroUnitData, rank, param.notTalent);//
        let attr13 = HeroDataHelper.getInstrumentTalentAttr(heroUnitData.getPos());//
        let attr14 = HeroDataHelper.getAwakeTalentAttr(heroUnitData);
        let attr15 = HeroDataHelper.getAvatarAttr(heroUnitData);
        let attr16 = HeroDataHelper.getAvatarShowAttr(heroUnitData);//
        let attr17 = PetDataHelper.getPetHelpAttr(true)[0];
        let attr18 = PetDataHelper.getPetMapAttr()[0];//
        let attr19 = HeroDataHelper.getSilkbagAttr(heroUnitData);
        let attr20 = HomelandHelp.getHomelandAttr();//
        let attr21 = HeroDataHelper.getHaloAttr(heroUnitData, rank);
        let attr22 = HeroDataHelper.getHorseAttr(heroUnitData.getPos());//
        let attr23 = HeroDataHelper.getHorsePhotoAttr();

        var attr24 = HeroDataHelper.getHistoryHeroAttr(heroUnitData.getPos());
        var attr25 = HeroDataHelper.getTacticsAttr(heroUnitData.getPos());
        var attr26 = HeroDataHelper.getBoutAttr(heroUnitData.getPos());

        var s = {};
        s[1] = attr1[1];
        s[2] = attr2[1];
        s[3] = attr3[1];
        s[4] = attr4[1];
        s[5] = attr5[1];
        s[6] = attr6[1];
        s[7] = attr7[1];
        s[8] = attr8[1];
        s[9] = attr9[1];
        s[10] = attr10[1];
        s[11] = attr11[1];
        s[12] = attr12[1];
        s[13] = attr13[1];
        s[14] = attr14[1];
        s[15] = attr15[1];
        s[16] = attr16[1];
        s[17] = attr17[1];
        s[18] = attr18[1];
        s[19] = attr19[1];
        s[20] = attr20[1];
        s[21] = attr21[1];
        s[22] = attr22[1];
        s[23] = attr23[1];
        s[24] = attr24[1];
        s[25] = attr25[1];
        s[26] = attr26[1];
        var t = 0;
        for (var j = 1; j <= 26; j++) {
            if (s[j])
                t = t + s[j]
        }


        AttrDataHelper.appendAttr(result, attr1);
        AttrDataHelper.appendAttr(result, attr2);
        AttrDataHelper.appendAttr(result, attr3);
        AttrDataHelper.appendAttr(result, attr4);
        AttrDataHelper.appendAttr(result, attr5);
        AttrDataHelper.appendAttr(result, attr6);
        AttrDataHelper.appendAttr(result, attr7);
        AttrDataHelper.appendAttr(result, attr8);
        AttrDataHelper.appendAttr(result, attr9);
        AttrDataHelper.appendAttr(result, attr10);
        AttrDataHelper.appendAttr(result, attr11);
        AttrDataHelper.appendAttr(result, attr12);
        AttrDataHelper.appendAttr(result, attr13);
        AttrDataHelper.appendAttr(result, attr14);
        AttrDataHelper.appendAttr(result, attr15);
        AttrDataHelper.appendAttr(result, attr16);
        AttrDataHelper.appendAttr(result, attr17);
        AttrDataHelper.appendAttr(result, attr18);
        AttrDataHelper.appendAttr(result, attr19);
        AttrDataHelper.appendAttr(result, attr20);
        AttrDataHelper.appendAttr(result, attr21);
        AttrDataHelper.appendAttr(result, attr22);
        AttrDataHelper.appendAttr(result, attr23);
        AttrDataHelper.appendAttr(result, attr24);
        AttrDataHelper.appendAttr(result, attr25);
        AttrDataHelper.appendAttr(result, attr26);
        return result;
    };
    export function getPartnersInfo(secondHeroDatas) {
        let info: any = {};
        for (let i = 1; i <= 8; i++) {
            let args: any[] = FunctionCheck.funcIsOpened(FunctionConst['FUNC_REINFORCEMENTS_SLOT' + i]) as [];
            let isOpen = args[0];
            let des = args[1];
            let levelInfo = args[2];
            let level = levelInfo.level;
            let lock = !isOpen;
            let heroData = secondHeroDatas[i];
            let comment = des;
            info[i] = {
                lock: lock,
                heroData: heroData,
                level: level,
                comment: comment
            };

        }
        return info;
    };
    export function getPartnersInfoByUserDetail(secondHeroDatas) {
        // let LogicCheckHelper = require('LogicCheckHelper');
        let info: any = [];
        for (let i = 1; i <= 8; i++) {
            let lock = false;
            let heroData = secondHeroDatas[i];
            info.push({
                lock: lock,
                heroData: heroData
            });
        }
        return info;
    };
    export function getActivatedYokeTotalCount(heroDatas) {
        let totalCount = 0;
        for (let i in heroDatas) {
            let data = heroDatas[i];
            let count = data.getActivedYokeCount();
            totalCount = totalCount + count;
        }
        return totalCount;
    };
    export function getYokeOverviewInfo(heroDatas) {
        let info: any = [];
        for (let i in heroDatas) {
            let data = heroDatas[i];
            if (parseInt(i) != 0) {
                let baseId = data.getBase_id();
                let activatedCount = data.getActivedYokeCount();
                let totalCount = data.getYokeTotalCount();
                let limitLevel = data.getLimit_level();
                info.push({
                    baseId: baseId,
                    activatedCount: activatedCount,
                    totalCount: totalCount,
                    limitLevel: limitLevel
                });
            }
        }
        return info;
    };
    export function getYokeDetailInfo(heroDatas) {
        let info: any = [];
        for (let i in heroDatas) {
            let data = heroDatas[i];
            let heroYoke = HeroDataHelper.getHeroYokeInfo(data);
            if (heroYoke) {
                info.push(heroYoke);
            }
        }
        return info;
    };
    export function getHeroYokeInfo(heroUnitData) {
        function sortFun(a, b) {
            let activeA = a.isActivated && 1 || 0;
            let activeB = b.isActivated && 1 || 0;
            if (activeA != activeB) {
                return activeB - activeA;
            } else {
                return a.id - b.id;
            }
        }
        let heroConfig = heroUnitData.getConfig();
        let heroBaseId = heroUnitData.getBase_id();
        let yokeInfo: any = [];
        for (let i = 1; i <= HeroConst.HERO_YOKE_MAX; i++) {
            let fateId = heroConfig['fate_' + i];
            if (fateId > 0) {
                let yokeUnit = HeroDataHelper.getYokeUnitInfoWithId(fateId, heroUnitData);
                yokeInfo.push(yokeUnit);
            }
        }
        yokeInfo.sort(sortFun);
        let heroYoke = null;
        if (yokeInfo.length > 0) {
            heroYoke = {
                heroBaseId: heroBaseId,
                yokeInfo: yokeInfo
            };
        }
        return heroYoke;
    };
    export function getYokeUnitInfoWithId(fateId, heroUnitData) {
        let fateConfig = HeroDataHelper.getHeroYokeConfig(fateId);
        let isActivated = heroUnitData.isUserHero() && heroUnitData.isActivatedYoke(fateId);
        let name = fateConfig.fate_name;
        let heroIds: any = [];
        let majorHeroId = fateConfig.hero_id;
        if (majorHeroId > 0) {
            heroIds.push(majorHeroId);
        }
        for (let i = 1; i <= 4; i++) {
            let heroId = fateConfig['hero_id_' + i];
            if (heroId > 0) {
                heroIds.push(heroId);
            }
        }
        let attrInfo: any = [];
        for (let i = 1; i <= 2; i++) {
            let attrId = fateConfig['talent_attr_' + i];
            if (attrId > 0) {
                let attrValue = fateConfig['talent_value_' + i];
                let info = {
                    attrId: attrId,
                    attrValue: attrValue
                };
                attrInfo.push(info);
            }
        }
        let result = {
            id: fateId,
            isActivated: isActivated,
            isShowColor: heroUnitData.isUserHero(),
            name: name,
            fateType: fateConfig.fate_type,
            heroIds: heroIds,
            attrInfo: attrInfo
        };
        return result;
    };
    //根据武将BaseId获取该武将上阵后可激活羁绊的数量
    //beReplacedId，被替换的武将baseId，
    //willInReinforcement, 将要进入援军位
    //notCheckReinforcement，不检查援军位
    export function getWillActivateYokeCount(baseId, beReplacedId?, willInReinforcement?, notCheckReinforcement?) {
        let count = 0;
        let info: any = [];
        if (G_UserData.getTeam().isInBattleWithBaseId(baseId)) {
            return [
                count,
                info
            ];
        }
        if (!notCheckReinforcement) {
            let isIn = G_UserData.getTeam().isInReinforcementsWithBaseId(baseId);
            if (isIn) {
                return [
                    count,
                    info
                ];
            }
        }
        let heroFateMap = G_UserData.getHero().getHeroFateMap();
        let fateIds = heroFateMap[baseId];
        if (fateIds) {
            for (var i in fateIds) {
                var fateId = fateIds[i];
                var fateConfig = HeroDataHelper.getHeroYokeConfig(fateId);
                var heroId = fateConfig.hero_id;
                var isCal = false;
                var isInBattle = G_UserData.getTeam().isInBattleWithBaseId(heroId)
                if (willInReinforcement == true) {
                    isCal = isInBattle;
                } else {
                    isCal = isInBattle || baseId == heroId;
                }
                if (isCal) {
                    let ids: any = [];
                    if (heroId > 0) {
                        ids.push(heroId);
                    }
                    for (let j = 1; j <= 4; j++) {
                        let id = fateConfig['hero_id_' + j];
                        if (id > 0) {
                            ids.push(id);
                        }
                    }
                    let isOk = true;
                    for (let t in ids) {
                        let id = ids[t];
                        let isIn = id != beReplacedId && (isInBattle || G_UserData.getTeam().isInReinforcementsWithBaseId(id) || id == baseId);
                        isOk = isOk && isIn;
                    }
                    if (isOk) {
                        count = count + 1;
                        let heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroId);
                        info.push({
                            heroParam: heroParam,
                            yokeName: fateConfig.fate_name,
                            fateId: fateId
                        });
                    }
                }
            }
        }
        return [
            count,
            info
        ];
    };
    export function convertHeroExp(expCount) {
        let itemExp1 = ItemConfig.get(DataConst.ITEM_HERO_LEVELUP_MATERIAL_1).item_value;
        let itemExp2 = ItemConfig.get(DataConst.ITEM_HERO_LEVELUP_MATERIAL_2).item_value;
        let itemExp3 = ItemConfig.get(DataConst.ITEM_HERO_LEVELUP_MATERIAL_3).item_value;
        let itemExp4 = ItemConfig.get(DataConst.ITEM_HERO_LEVELUP_MATERIAL_4).item_value;
        let expItem = {
            count1: 0,
            count2: 0,
            count3: 0,
            count4: 0
        };
        while (expCount >= itemExp1) {
            if (expCount >= itemExp4) {
                expCount = expCount - itemExp4;
                expItem.count4 = expItem.count4 + 1;
            } else if (expCount >= itemExp1) {
                expCount = expCount - itemExp1;
                expItem.count1 = expItem.count1 + 1;
            }
        }
        let result = {};
        for (let i = 1; i <= 4; i++) {
            if (expItem['count' + i] > 0) {
                RecoveryDataHelper.formatRecoveryCost(result, TypeConvertHelper.TYPE_ITEM, DataConst['ITEM_HERO_LEVELUP_MATERIAL_' + i], expItem['count' + i]);
            }
        }
        return result;
    };
    export function getAllLevelUpCost(unitData) {
        let expCount = unitData.getExp();
        let result = HeroDataHelper.convertHeroExp(expCount);
        return result;
    };
    export function getAllBreakCost(unitData) {
        if (HeroGoldHelper.isPureHeroGold(unitData)) {
            return HeroDataHelper.getGoldBreakCost(unitData);
        } else {
            return HeroDataHelper.getNormalBreakCost(unitData);
        }
    };
    export function getGoldBreakCost(unitData) {
        let result = {};
        let rank = unitData.getRank_lv();
        for (let i = 0; i <= rank - 1; i++) {
            let costConfig = HeroGoldHelper.getCostConfig(i);
            let cardNum = costConfig.cost_hero;
            if (cardNum > 0) {
                let heroBaseId = unitData.getBase_id();
                RecoveryDataHelper.formatRecoveryCost(result, TypeConvertHelper.TYPE_HERO, heroBaseId, cardNum);
            }
            let breakSize = costConfig.break_size;
            if (breakSize > 0) {
                RecoveryDataHelper.formatRecoveryCost(result, costConfig.break_type, costConfig.break_value, breakSize);
            }
            let exp = costConfig.size_2;
            let expRes = HeroDataHelper.convertHeroExp(exp);
            RecoveryDataHelper.mergeRecoveryCost(result, expRes);
            for (let j = 3; j <= 4; j++) {
                let size = costConfig['size_' + j];
                if (size > 0) {
                    let type = costConfig['type_' + j];
                    let value = costConfig['value_' + j];
                    RecoveryDataHelper.formatRecoveryCost(result, type, value, size);
                }
            }
        }
        let gold_res = unitData.getGold_res();
        for (let _ in gold_res) {
            let res = gold_res[_];
            if (res.Key == 1) {
                if (res.Value > 0) {
                    let heroBaseId = unitData.getBase_id();
                    RecoveryDataHelper.formatRecoveryCost(result, TypeConvertHelper.TYPE_HERO, heroBaseId, res.Value);
                }
            } else if (res.Key == 2) {
                if (res.Value > 0) {
                    let expRes = HeroDataHelper.convertHeroExp(res.Value);
                    RecoveryDataHelper.mergeRecoveryCost(result, expRes);
                }
            } else {
                if (res.Value > 0) {
                    let costConfig = HeroGoldHelper.getCostConfig(rank);
                    RecoveryDataHelper.formatRecoveryCost(result, costConfig['type_' + res.Key], costConfig['value_' + res.Key], res.Value);
                }
            }
        }
        return result;
    };

    export function getAllLimitCostWithoutGold(heroUnitData) {
        var res = HeroDataHelper.getAllLimitCost(heroUnitData), exp;
        var result = {};
        for (let k = 0; k < res.length; k++) {
            var v = res[k];
            if (k == TypeConvertHelper.TYPE_HERO) {
                result[k] = {};
                for (var kk in v) {
                    var vv = v[kk];
                    if (HeroDataHelper.getHeroConfig(kk).color != 7) {
                        result[k][kk] = vv;
                    }
                }
            } else {
                result[k] = v;
            }
        }
        return [
            result,
            exp
        ];
    };

    export function getNormalBreakCost(unitData) {
        let result = {};
        let rank = unitData.getRank_lv();
        let rTemplet = unitData.getConfig().rank_cost;
        for (let i = 0; i <= rank - 1; i++) {
            let rankInfo = HeroDataHelper.getHeroRankCostConfig(i, rTemplet);
            let cardNum = rankInfo.card;
            if (cardNum > 0) {
                let heroBaseId = unitData.getBase_id();
                RecoveryDataHelper.formatRecoveryCost(result, TypeConvertHelper.TYPE_HERO, heroBaseId, cardNum);
            }
            for (let j = 1; j <= 2; j++) {
                let size = rankInfo['size_' + j];
                if (size > 0) {
                    let type = rankInfo['type_' + j];
                    let value = rankInfo['value_' + j];
                    RecoveryDataHelper.formatRecoveryCost(result, type, value, size);
                }
            }
        }
        return result;
    };
    export function getAllAwakeCost(unitData) {
        let result = {};
        let info = unitData.getAwaken_slots();
        for (let t in info) {
            let itemId = info[t];
            if (itemId > 0) {
                RecoveryDataHelper.formatRecoveryCost(result, TypeConvertHelper.TYPE_GEMSTONE, itemId, 1);
            }
        }
        let awakeLevel = unitData.getAwaken_level();
        let awakeCost = unitData.getConfig().awaken_cost;
        for (let i = 0; i <= awakeLevel - 1; i++) {
            let awakeInfo = HeroDataHelper.getHeroAwakenConfig(i, awakeCost);
            let cardNum = awakeInfo.card;
            if (cardNum > 0) {
                let heroBaseId = unitData.getBase_id();
                RecoveryDataHelper.formatRecoveryCost(result, TypeConvertHelper.TYPE_HERO, heroBaseId, cardNum);
            }
            if (awakeInfo.stuff_size > 0) {
                RecoveryDataHelper.formatRecoveryCost(result, awakeInfo.stuff_type, awakeInfo.stuff_value, awakeInfo.stuff_size);
            }
            if (awakeInfo.cost_size > 0) {
                RecoveryDataHelper.formatRecoveryCost(result, awakeInfo.cost_type, awakeInfo.cost_value, awakeInfo.cost_size);
            }
            for (let j = 1; i <= 4; i++) {
                let stoneValue = awakeInfo['gemstone_value' + j];
                if (stoneValue > 0) {
                    RecoveryDataHelper.formatRecoveryCost(result, TypeConvertHelper.TYPE_GEMSTONE, stoneValue, 1);
                }
            }
        }
        return result;
    };
    export function getHeroRecoveryPreviewInfo(heroDatas) {
        let result: any = [];
        let info = {};
        let expCount = 0;
        for (let k in heroDatas) {
            let unitData = heroDatas[k];
            let exp1 = unitData.getExp();
            let cost2 = HeroDataHelper.getAllBreakCost(unitData);
            let cost3 = HeroDataHelper.getAllAwakeCost(unitData);
            let [cost4, exp2] = HeroDataHelper.getAllLimitCost(unitData);
            expCount = expCount + exp1 + exp2;
            let heroBaseId = unitData.getBase_id();
            RecoveryDataHelper.formatRecoveryCost(info, TypeConvertHelper.TYPE_HERO, heroBaseId, 1);
            RecoveryDataHelper.mergeRecoveryCost(info, cost2);
            RecoveryDataHelper.mergeRecoveryCost(info, cost3);
            RecoveryDataHelper.mergeRecoveryCost(info, cost4);
        }
        let costExp = HeroDataHelper.convertHeroExp(expCount);
        RecoveryDataHelper.mergeRecoveryCost(info, costExp);
        let currency = {};
        for (let type in info) {
            let unit = info[type];
            if (parseInt(type) == TypeConvertHelper.TYPE_HERO) {
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
    export function getHeroRebornPreviewInfo(data) {
        let result: any = [];
        let info = {};
        let exp1 = data.getExp();
        let cost2 = HeroDataHelper.getAllBreakCost(data);
        let cost3 = HeroDataHelper.getAllAwakeCost(data);
        let [cost4, exp2] = HeroDataHelper.getAllLimitCost(data);
        let heroBaseId = data.getBase_id();
        RecoveryDataHelper.formatRecoveryCost(info, TypeConvertHelper.TYPE_HERO, heroBaseId, 1);
        RecoveryDataHelper.mergeRecoveryCost(info, cost2);
        RecoveryDataHelper.mergeRecoveryCost(info, cost3);
        RecoveryDataHelper.mergeRecoveryCost(info, cost4);
        let expCount = exp1 + exp2;
        let costExp = HeroDataHelper.convertHeroExp(expCount);
        RecoveryDataHelper.mergeRecoveryCost(info, costExp);
        let fragments = {};
        for (let type in info) {
            let unit = info[type];
            if (parseInt(type) == TypeConvertHelper.TYPE_HERO) {
                for (let value in unit) {
                    let size = unit[value];
                    let temp = RecoveryDataHelper.convertSameCard(type, value, size, 2);
                    RecoveryDataHelper.mergeRecoveryCost(fragments, temp);
                }
                info[type] = null;
            }
        }
        RecoveryDataHelper.mergeRecoveryCost(info, fragments);
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
    export function getHeroPowerAttr(param) {
        let result = HeroDataHelper.getHeroPowerBaseAttr(param);
        AttrDataHelper.processDefAndAddition(result);
        return result;
    };
    export function getHeroPowerBaseAttr(param) {
        var result = {};
        var heroUnitData = param.heroUnitData;
        var tempLevel = param.addLevel || 0;
        var tempRank = param.addRank || 0;
        var level = heroUnitData.getLevel() + tempLevel;
        var rank = heroUnitData.getRank_lv() + tempRank;
        var attr1 = HeroDataHelper.getBasicAttrWithLevel(heroUnitData.getConfig(), level);
        var attr2 = HeroDataHelper.getBreakAttr(heroUnitData, tempRank);
        var attr3 = HeroDataHelper.getLimitAttr(heroUnitData);
        var attr4 = HeroDataHelper.getAwakeAttr(heroUnitData);
        var attr5 = HeroDataHelper.getEquipAttr(heroUnitData.getPos(), true);
        var attr6 = HeroDataHelper.getTreasureAttr(heroUnitData.getPos(), true);
        var attr7 = HeroDataHelper.getInstrumentAttr(heroUnitData.getPos());
        var attr8 = HeroDataHelper.getMasterAttr(heroUnitData.getPos());
        var attr9 = HeroDataHelper.getKarmaAttrRatio(heroUnitData.getConfig());
        var attr10 = HeroDataHelper.getYokeAttrRatio(heroUnitData);
        var attr11 = HeroDataHelper.getOfficialPower(G_UserData.getBase().getOfficialLevel());
        var attr12 = HeroDataHelper.getTalentPower(heroUnitData, tempRank);
        var attr13 = HeroDataHelper.getInstrumentTalentAttr(heroUnitData.getPos());
        var attr14 = HeroDataHelper.getAwakeTalentAttr(heroUnitData);
        var attr15 = HeroDataHelper.getAvatarPower(heroUnitData);
        var attr16 = HeroDataHelper.getAvatarShowPower(heroUnitData);
        var attr17 = PetDataHelper.getPetHelpAttr(true)[0];
        var attr18 = PetDataHelper.getPetMapPower();
        var attr19 = HeroDataHelper.getSilkbagPower(heroUnitData);
        var attr20 = HeroDataHelper.getHomelandPower();
        var attr21 = HeroDataHelper.getHaloAttr(heroUnitData, rank);
        var attr22 = HeroDataHelper.getHorsePower(heroUnitData.getPos());
        var attr23 = HeroDataHelper.getHorsePhotoPower();
        var attr24 = HeroDataHelper.getHistoryHeroPower(heroUnitData.getPos());
        var attr25 = HeroDataHelper.getTacticsPower(heroUnitData.getPos());
        var attr26 = HeroDataHelper.getBoutPower(heroUnitData.getPos());
        AttrDataHelper.appendAttr(result, attr1);
        AttrDataHelper.appendAttr(result, attr2);
        AttrDataHelper.appendAttr(result, attr3);
        AttrDataHelper.appendAttr(result, attr4);
        AttrDataHelper.appendAttr(result, attr5);
        AttrDataHelper.appendAttr(result, attr6);
        AttrDataHelper.appendAttr(result, attr7);
        AttrDataHelper.appendAttr(result, attr8);
        AttrDataHelper.appendAttr(result, attr9);
        AttrDataHelper.appendAttr(result, attr10);
        AttrDataHelper.appendAttr(result, attr11);
        AttrDataHelper.appendAttr(result, attr12);
        AttrDataHelper.appendAttr(result, attr13);
        AttrDataHelper.appendAttr(result, attr14);
        AttrDataHelper.appendAttr(result, attr15);
        AttrDataHelper.appendAttr(result, attr16);
        AttrDataHelper.appendAttr(result, attr17);
        AttrDataHelper.appendAttr(result, attr18);
        AttrDataHelper.appendAttr(result, attr19);
        AttrDataHelper.appendAttr(result, attr20);
        AttrDataHelper.appendAttr(result, attr21);
        AttrDataHelper.appendAttr(result, attr22);
        AttrDataHelper.appendAttr(result, attr23);
        AttrDataHelper.appendAttr(result, attr24);
        AttrDataHelper.appendAttr(result, attr25);
        AttrDataHelper.appendAttr(result, attr26);
        return result;

    };
    export function isHaveEmptyPos() {
        for (let i = 1; i <= 6; i++) {
            let state = G_UserData.getTeam().getStateWithPos(i);
            if (state == TeamConst.STATE_OPEN) {
                return true;
            }
        }
        return false;
    };
    export function isHaveEmptyReinforcementPos() {
        let secondHeroDatas = G_UserData.getTeam().getHeroDataInReinforcements();
        let info = HeroDataHelper.getPartnersInfo(secondHeroDatas);
        for (let i in info) {
            let one = info[i];
            if (!one.lock && one.heroData == null) {
                return true;
            }
        }
        return false;
    };
    export function isPromptHeroUpgrade(heroUnitData) {
        let userLevel = G_UserData.getBase().getLevel();
        let roleInfo = RoleConfig.get(userLevel);
        if (!roleInfo)
            cc.error('role config can not find level = %d' + userLevel);
        let recommendLevel = roleInfo.recommend_hero_lv;
        let level = heroUnitData.getLevel();
        if (level >= recommendLevel) {
            return false;
        }
        let itemExp = 0;
        for (let i = 1; i <= 4; i++) {
            let itemId = DataConst['ITEM_HERO_LEVELUP_MATERIAL_' + i];
            let count = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, itemId);
            let itemParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_ITEM, itemId);
            let exp = itemParam.cfg.item_value;
            itemExp = itemExp + exp * count;
        }
        let totalExp = heroUnitData.getExp() + itemExp;
        let heroConfig = heroUnitData.getConfig();
        let templet = heroConfig.lvup_cost;
        let needExp = HeroDataHelper.getHeroNeedExpWithLevel(templet, level + 1);
        if (totalExp < needExp) {
            return false;
        }
        return true;
    };
    export function isPromptHeroBreak(heroUnitData) {
        let rankLevel = heroUnitData.getRank_lv();
        let rankMax = heroUnitData.getConfig().rank_max;
        if (rankLevel >= rankMax) {
            return false;
        }
        let costInfo = HeroDataHelper.getHeroBreakMaterials(heroUnitData);
        for (let i in costInfo) {
            let info = costInfo[i];
            if (info.type == TypeConvertHelper.TYPE_HERO) {
                let sameCardNum = G_UserData.getHero().getSameCardCountWithBaseId(heroUnitData.getBase_id()).length;
                if (info.size > sameCardNum) {
                    return false;
                }
            } else if (info.type == TypeConvertHelper.TYPE_ITEM) {
                let itemNum = G_UserData.getItems().getItemNum(info.value);
                if (info.size > itemNum) {
                    return false;
                }
            }
            else if (info.type == TypeConvertHelper.TYPE_RESOURCE) {
                let enough = UserCheck.enoughMoney(info.size)[0];
                if (!enough) {
                    return false;
                }
            }
        }
        let needLevel = HeroDataHelper.getHeroBreakLimitLevel(heroUnitData);
        let myLevel = heroUnitData.getLevel();
        if (myLevel < needLevel) {
            return false;
        }
        return true;
    };
    export function isPromptHeroAwake(heroUnitData) {
        let isCanAwake = heroUnitData.isCanAwake();
        if (!isCanAwake) {
            return false;
        }
        let [enoughLevel] = HeroTrainHelper.checkAwakeIsEnoughLevel(heroUnitData);
        if (!enoughLevel) {
            return false;
        }
        let isCanEquip = HeroDataHelper.isCanHeroAwakeEquip(heroUnitData);
        isCanAwake = HeroDataHelper.isCanHeroAwake(heroUnitData);
        return isCanEquip || isCanAwake;
    };

    export function isPromptHeroLimit(heroUnitData) {
        var isAllFull = true;
        for (var key = HeroConst.HERO_LIMIT_COST_KEY_1; key <= HeroConst.HERO_LIMIT_COST_KEY_6; key++) {
            var [isOk, isFull] = HeroDataHelper.isPromptHeroLimitWithCostKey(heroUnitData, key);
            isAllFull = isAllFull && isFull;
            if (isOk) {
                return true;
            }
        }
        if (isAllFull) {
            var limitDataType = HeroDataHelper.getLimitDataType(heroUnitData);
            var lv;
            if (limitDataType == HeroConst.HERO_LIMIT_TYPE_RED) {
                lv = heroUnitData.getLimit_level();
            } else {
                lv = heroUnitData.getLimit_rtg();
            }
            var info = HeroDataHelper.getHeroLimitCostConfig(lv, limitDataType);
            let isOk = LogicCheckHelper.enoughMoney(info.break_size)[0];
            if (isOk) {
                return true;
            }
        }
        return false;
    };

    export function isPromptHeroLimitWithCostKey(heroUnitData, key) {
        var [isCanLimitBreak, limitType] = heroUnitData.isCanLimitBreak();
        if (!isCanLimitBreak) {
            return [false];
        }
        if (heroUnitData.isDidLimitToGold()) {
            return [false];
        }
        if (limitType == 0 && heroUnitData.isDidLimitToRed()) {
            return [false];
        }
        var [isReach]= HeroDataHelper.isReachLimitRank(heroUnitData);
        if (!isReach) {
            return [false];
        }
        var limitDataType = HeroDataHelper.getLimitDataType(heroUnitData);
        var lv;
        if (limitDataType == HeroConst.HERO_LIMIT_TYPE_RED) {
            lv = heroUnitData.getLimit_level();
        } else {
            lv = heroUnitData.getLimit_rtg();
        }
        var info = HeroDataHelper.getHeroLimitCostConfig(lv, limitDataType);
        var curCount = heroUnitData.getLimitCostCountWithKey(key, limitDataType);
        var configKey = HeroDataHelper.getLimitCostConfigKey(key);
        var maxSize = info[configKey.size];
        var isFull = curCount >= maxSize;
        if (!isFull) {
            if (key == HeroConst.HERO_LIMIT_COST_KEY_1) {
                var ownExp = curCount;
                for (var j = 1; j <= 4; j++) {
                    var count = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, DataConst['ITEM_HERO_LEVELUP_MATERIAL_' + j]);
                    var itemValue = ItemConfig.get(DataConst['ITEM_HERO_LEVELUP_MATERIAL_' + j]).item_value;
                    var itemExp = count * itemValue;
                    ownExp = ownExp + itemExp;
                    if (ownExp >= maxSize) {
                        return [
                            true,
                            isFull
                        ];
                    }
                }
            } else {
                var type = info[configKey.type], value = info[configKey.value];
                if (type == 99) {
                    var baseId = heroUnitData.getBase_id();
                    var count = curCount;
                    if (value == 1) {
                        count = count + UserDataHelper.getSameCardCount(TypeConvertHelper.TYPE_HERO, baseId);
                    } else {
                        var list = HeroDataHelper.getSameCountryHeroes(baseId, 7);
                        for (let i in list) {
                            var v = list[i];
                            count = count + UserDataHelper.getSameCardCount(TypeConvertHelper.TYPE_HERO, v);
                        }
                    }
                    if (count >= maxSize) {
                        return [
                            true,
                            isFull
                        ];
                    }
                } else {
                    var count = UserDataHelper.getSameCardCount(type, value) + curCount;
                    if (count >= maxSize) {
                        return [
                            true,
                            isFull
                        ];
                    }
                }
            }
        }
        return [
            false,
            isFull
        ];
    };

    export function isCanHeroAwakeEquip(heroUnitData) {
        let info = HeroDataHelper.getHeroAwakeEquipState(heroUnitData);
        for (let i = 1; i <= 4; i++) {
            let state = info[i].state;
            if (state == GemstoneConst.EQUIP_STATE_1 || state == GemstoneConst.EQUIP_STATE_3) {
                return true;
            }
        }
        return false;
    };
    export function isCanHeroAwake(heroUnitData) {

        let info = HeroDataHelper.getHeroAwakeEquipState(heroUnitData);
        for (let i = 1; i <= 4; i++) {
            let state = info[i].state;
            if (state != GemstoneConst.EQUIP_STATE_2) {
                return false;
            }
        }
        info = HeroDataHelper.getHeroAwakeMaterials(heroUnitData);
        for (let j in info) {
            let data = info[j];
            let myCount = UserDataHelper.getSameCardCount(data.type, data.value);
            let needCount = data.size;
            if (myCount < needCount) {
                return false;
            }
        }
        let costInfo = HeroDataHelper.getHeroAwakeCost(heroUnitData);
        let isOk = UserCheck.enoughMoney(costInfo.size)[0];
        if (!isOk) {
            return false;
        }
        return true;
    };
    export function getHeroListLimitCount() {
        let level = G_UserData.getBase().getLevel();
        let info = RoleConfig.get(level);
        if (!info)
            cc.error('role config can not find level = %d');
        return info.hero_limit;
    };
    export function getHeroAwakeConfigInfo(heroUnitData, addLevel?) {
        let tempLevel = addLevel || 0;
        let maxLevel = heroUnitData.getConfig().awaken_max;
        let awakeLevel = heroUnitData.getAwaken_level() + tempLevel;
        if (awakeLevel > maxLevel) {
            return null;
        }
        let awakeCost = heroUnitData.getConfig().awaken_cost;
        let info = HeroDataHelper.getHeroAwakenConfig(awakeLevel, awakeCost);
        return info;
    };
    export function convertAwakeLevel(awakeLevel) {
        let star = Math.floor(awakeLevel / 10);
        let level = awakeLevel % 10;
        return [
            star,
            level
        ];
    };
    export function findNextAwakeLevel(level, awakenCost, maxLevel) {
        let nextLevel = null;
        let attrInfo = {};
        let des = '';
        for (let i = level + 1; i <= maxLevel; i++) {
            let info = HeroDataHelper.getHeroAwakenConfig(i, awakenCost);
            let isHave = info['talent_attribute_type1'] > 0;
            if (isHave) {
                nextLevel = i;
                des = info['talent_description'];
                for (let j = 1; j <= 4; j++) {
                    let attrType = info['talent_attribute_type' + j];
                    if (attrType > 0) {
                        let attrValue = info['talent_attribute_value' + j];
                        attrInfo[attrType] = attrValue;
                    }
                }
                break;
            }
        }
        return [
            nextLevel,
            attrInfo,
            des
        ];
    };
    export function getHeroAwakeEquipState(heroUnitData) {
        let result = {};
        let gemstones = heroUnitData.getAwaken_slots();
        let info = HeroDataHelper.getHeroAwakeConfigInfo(heroUnitData);
        let [enoughLevel] = HeroTrainHelper.checkAwakeIsEnoughLevel(heroUnitData);
        let isCanAwake = heroUnitData.isCanAwake();
        for (let i = 1; i <= 4; i++) {
            result[i] = {};
            if (enoughLevel && isCanAwake) {
                let needId = info['gemstone_value' + i];
                if (needId > 0) {
                    result[i].needId = needId;
                    let stoneId = gemstones[i - 1];
                    if (stoneId > 0) {
                        result[i].state = GemstoneConst.EQUIP_STATE_2;
                    } else {
                        let unitData = G_UserData.getGemstone().getUnitDataWithId(needId);
                        if (unitData) {
                            result[i].state = GemstoneConst.EQUIP_STATE_1;
                        } else {

                            let gemstoneConfig = G_ConfigLoader.getConfig(ConfigNameConst.GEMSTONE).get(needId);
                            if (!gemstoneConfig)
                                cc.error('gemstone config can not find id = %d');
                            let fragmentId = gemstoneConfig.fragment_id;
                            if (fragmentId > 0 && UserDataHelper.isFragmentCanMerage(fragmentId)[0]) {
                                result[i].state = GemstoneConst.EQUIP_STATE_3;
                            } else {
                                result[i].state = GemstoneConst.EQUIP_STATE_4;
                            }
                        }
                    }
                } else {
                    result[i].state = GemstoneConst.EQUIP_STATE_5;
                }
            } else {
                result[i].state = GemstoneConst.EQUIP_STATE_5;
            }
        }
        return result;
    };
    export function getHeroAwakeLevelAttr(awakeLevel, awakeCost) {
        let result = {};
        for (let i = 0; i <= awakeLevel; i++) {
            let info = HeroDataHelper.getHeroAwakenConfig(i, awakeCost);
            for (let j = 1; j <= 4; j++) {
                let attrType = info['attribute_type' + j];
                let attrValue = info['attribute_value' + j];
                AttrDataHelper.formatAttr(result, attrType, attrValue);
            }
        }
        return result;
    };
    export function getHeroAwakeEquipAttr(awakeLevel, awakeCost) {
        let result = {};
        for (let i = 0; i <= awakeLevel; i++) {
            let info = HeroDataHelper.getHeroAwakenConfig(i, awakeCost);
            for (let j = 1; j <= 4; j++) {
                let itemId = info['gemstone_value' + j];
                if (itemId > 0) {
                    let attr = HeroDataHelper.getGemstoneAttr(itemId);
                    AttrDataHelper.appendAttr(result, attr);
                }
            }
        }
        return result;
    };
    export function getGemstoneAttr(itemId) {
        let result = {};

        let gemstoneInfo = GemstoneConfig.get(itemId);
        if (!gemstoneInfo)
            cc.error('gemstone config can not find id = %d');
        for (let k = 1; k <= 4; k++) {
            let attrType = gemstoneInfo['attribute_type' + k];
            let attrValue = gemstoneInfo['attribute_value' + k];
            AttrDataHelper.formatAttr(result, attrType, attrValue);
        }
        return result;
    };
    export function getHeroAwakeCurGemstoneAttr(heroUnitData) {
        let result = {};
        let info = heroUnitData.getAwaken_slots();
        for (let i in info) {
            let itemId = info[i];
            if (itemId > 0) {
                let attr = HeroDataHelper.getGemstoneAttr(itemId);
                AttrDataHelper.appendAttr(result, attr);
            }
        }
        return result;
    };
    export function getHeroAwakeMaterials(heroUnitData) {
        let result: any = [];
        let info = HeroDataHelper.getHeroAwakeConfigInfo(heroUnitData);
        let card = info['card'];
        if (card > 0) {
            let cardType = TypeConvertHelper.TYPE_HERO;
            let cardValue = heroUnitData.getBase_id();
            result.push({
                type: cardType,
                value: cardValue,
                size: card
            });
        }
        let stuffType = info['stuff_type'];
        if (stuffType > 0) {
            let stuffValue = info['stuff_value'];
            let stuffSize = info['stuff_size'];
            result.push({
                type: stuffType,
                value: stuffValue,
                size: stuffSize
            });
        }
        return result;
    };
    export function getHeroAwakeCost(heroUnitData) {
        let result = null;
        let info = HeroDataHelper.getHeroAwakeConfigInfo(heroUnitData);
        let costType = info['cost_type'];
        if (costType > 0) {
            let costValue = info['cost_value'];
            let costSize = info['cost_size'];
            result = {
                type: costType,
                value: costValue,
                size: costSize
            };
        }
        return result;
    };
    export function getHeroAwakeLimitLevel(heroUnitData) {
        let info = HeroDataHelper.getHeroAwakeConfigInfo(heroUnitData, 1) || {};
        let limitLevel = info.level;
        return limitLevel;
    };
    export function getHeroAwakeTalentDesInfo(heroUnitData) {
        let awakeLevel = heroUnitData.getAwaken_level();
        let awakeCost = heroUnitData.getConfig().awaken_cost;
        let awakeMax = heroUnitData.getConfig().awaken_max;
        let result: any = [];
        for (let i = 0; i <= awakeMax; i++) {
            let info = HeroDataHelper.getHeroAwakenConfig(i, awakeCost);
            let isHave = info['talent_attribute_type1'] > 0;
            if (isHave) {
                let des = info['detail_description'];
                let isActive = awakeLevel >= i;
                let temp = {
                    des: des,
                    isActive: isActive
                };
                result.push(temp);
            }
        }
        return result;
    };
    export function getHeroTransformTarList(filterIds, tempData) {
        let sortFun = function (a, b) {
            let yokeCountA = a.getWillActivateYokeCount();
            let yokeCountB = b.getWillActivateYokeCount();
            if (yokeCountA != yokeCountB) {
                return yokeCountA > yokeCountB;
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

        let HeroConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO);
        let len = HeroConfig.length();
        for (let i = 1; i <= len; i++) {
            let info = HeroConfig.indexOf(i - 1);
            let data = clone2(tempData);
            data.baseId = info.id;
            let unit = G_UserData.getHero().createTempHeroUnitData(data);
            let country = unit.getConfig().country;
            let color = unit.getConfig().color;
            let type = unit.getConfig().type;
            if (result[country] == null) {
                result[country] = [];
            }
            if (type == 2 && color == filterColor && !isInFilter(unit) && checkLimitCondition(isDidLimit, unit)) {
                let [yokeCount] = HeroDataHelper.getWillActivateYokeCount(unit.getBase_id());
                unit.setWillActivateYokeCount(yokeCount);
                result[country].push(unit);
            }
        }
        for (let k in result) {
            let temp = result[k];
            temp.sort(sortFun);
        }
        return result;
    };
    export function isHaveBetterColorHero(heroUnitData) {
        let heroBaseId = heroUnitData.getBase_id();
        let heroColor = heroUnitData.getConfig().color;
        let heroList = G_UserData.getHero().getReplaceDataBySort(heroBaseId);
        for (let i in heroList) {
            let unit = heroList[i];
            let color = unit.getConfig().color;
            if (color > heroColor) {
                return true;
            }
        }
        return false;
    };
    export function isReachCheckBetterColorHeroRP(heroUnitData) {

        let limitLevelStr = ParameterConfig.get(ParameterIDConst.CHANGE_LEVEL_MAX).content;
        let limitLevel = parseInt(limitLevelStr);
        if (heroUnitData.getConfig().type == 1) {
            return false;
        }
        if (UserCheck.enoughLevel(limitLevel)) {
            return false;
        }
        return true;
    };
    export function isPromptHeroBetterColor(heroUnitData) {
        if (HeroDataHelper.isReachCheckBetterColorHeroRP(heroUnitData) == false) {
            return false;
        }
        let isHave = HeroDataHelper.isHaveBetterColorHero(heroUnitData);
        return isHave;
    };
    export function getHeroInBattleAverageLevel() {
        let totalLevel = 0;
        let heroIds = G_UserData.getTeam().getHeroIds();
        for (let i in heroIds) {
            let heroId = heroIds[i];
            if (heroId > 0) {
                let unitData = G_UserData.getHero().getUnitDataWithId(heroId);
                let level = unitData.getLevel();
                totalLevel = totalLevel + level;
            }
        }
        let count = TeamDataHelper.getTeamOpenCount();
        let average = Math.floor(totalLevel / count);
        return average;
    };
    export function getHeroInBattleAverageRank() {
        let totalRank = 0;
        let heroIds = G_UserData.getTeam().getHeroIds();
        for (let i in heroIds) {
            let heroId = heroIds[i];
            if (heroId > 0) {
                let unitData = G_UserData.getHero().getUnitDataWithId(heroId);
                let rank = unitData.getRank_lv();
                totalRank = totalRank + rank;
            }
        }
        let count = TeamDataHelper.getTeamOpenCount();
        let average = Math.floor(totalRank / count);
        return average;
    };
    export function getHeroInBattleAverageAwakeLevel() {
        let totalLevel = 0;
        let heroIds = G_UserData.getTeam().getHeroIds();
        for (let i in heroIds) {
            let heroId = heroIds[i];
            if (heroId > 0) {
                let unitData = G_UserData.getHero().getUnitDataWithId(heroId);
                let level = unitData.getAwaken_level();
                totalLevel = totalLevel + level;
            }
        }
        let count = TeamDataHelper.getTeamOpenCount();
        let average = Math.floor(totalLevel / count);
        return average;
    };
    export function getSkillIdsWithHeroData(unitData) {
        var baseId = unitData.getBase_id();
        var rank = unitData.getConfig().type == 1 && unitData.getRank_lv() || 0;
        var limitLevel = unitData.getLimit_level();
        var limitRedLevel = unitData.getLimit_rtg();
        var skillIds = HeroDataHelper.getSkillIdsWithBaseIdAndRank(baseId, rank, limitLevel, limitRedLevel);
        return skillIds;
    };
    export function getSkillIdsWithBaseIdAndRank(baseId, rank, limitLevel, limitRedLevel) {
        var result = {};
        var heroRankConfig = HeroDataHelper.getHeroRankConfig(baseId, rank, limitLevel, limitRedLevel);
        for (var i = 1; i <= 3; i++) {
            var skillId = heroRankConfig['rank_skill_' + i];
            result[i] = skillId;
        }
        if (heroRankConfig['rank_skill_2'] == 0 && heroRankConfig['rank1_skill_2'] == 0) {
            result[2] = heroRankConfig['rank_passive_1'];
        }
        return result;
    };
    export function isLeaderWithHeroBaseId(baseId) {
        let info = HeroDataHelper.getHeroConfig(baseId);
        return info.type == 1;
    };
    export function getOfficialIdWithHeroId(baseId) {
        let color = HeroDataHelper.getHeroConfig(baseId).color;

        let OfficialRank = OfficialRankConfig;
        let len = OfficialRank.length();
        for (let i = 1; i <= len; i++) {
            let info = OfficialRank.indexOf(i - 1);
            if (info.color == color) {
                return info.id;
            }
        }
        cc.error('official_rank can not find color = %d' + color);
    };
    export function getOfficialNameWithHeroId(baseId) {
        let officialId = HeroDataHelper.getOfficialIdWithHeroId(baseId);
        let info = OfficialRankConfig.get(officialId);
        if (!info)
            cc.error('official_rank can not find id = %d' + officialId);
        return info.name;
    };
    export function getAwakeGemstonePreviewInfo(unitData) {
        let result: any = [];
        let previewLevel = 10;
        let startLevel = unitData.getAwaken_level() + 1;
        let awakeCost = unitData.getConfig().awaken_cost;
        let awakenMax = unitData.getConfig().awaken_max;
        let targetLevel = Math.min(startLevel + previewLevel - 1, awakenMax);
        for (let i = startLevel; i <= targetLevel; i++) {
            let id = i - 1;
            let awakeInfo = HeroDataHelper.getHeroAwakenConfig(id, awakeCost);
            let one: any = {
                level: i,
                items: []
            };
            for (let j = 1; j <= 4; j++) {
                let stoneValue = awakeInfo['gemstone_value' + j];
                if (stoneValue > 0) {
                    let item = {
                        type: TypeConvertHelper.TYPE_GEMSTONE,
                        value: stoneValue,
                        size: 1
                    };
                    one.items.push(item);
                }
            }
            result.push(one);
        }
        return result;
    };
    export function getOwnCountOfAwakeGemstone(type, value) {
        if (type != TypeConvertHelper.TYPE_GEMSTONE)
            cc.error('HeroDataHelper.getOwnCountOfAwakeGemstone, type must be TypeConvertHelper.TYPE_GEMSTONE!!');
        let gemstoneConfig = GemstoneConfig.get(value);
        if (!gemstoneConfig)
            cc.error('gemstone config can not find id = %d');
        let fragmentId = gemstoneConfig.fragment_id;
        let itemParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_FRAGMENT, fragmentId);
        let config = itemParam.cfg;
        let myNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_FRAGMENT, fragmentId);
        let needNum = config.fragment_num;
        let count1 = UserDataHelper.getNumByTypeAndValue(type, value);
        let count2 = Math.floor(myNum / needNum);
        let ownCount = count1 + count2;
        return ownCount;
    };
    export function getHorseAttr(pos) {
        let result = {};
        if (pos == null || pos == 0) {
            return result;
        }
        let horseIds = G_UserData.getBattleResource().getHorseIdsWithPos(pos);
        for (let i in horseIds) {
            let horseId = horseIds[i];
            let horseData = G_UserData.getHorse().getUnitDataWithId(horseId);
            let attrInfo = HorseDataHelper.getHorseAttrInfo(horseData);
            let skillAttrInfo = HorseDataHelper.getHorseSkillAttrInfo(horseData);
            AttrDataHelper.appendAttr(result, attrInfo);
            AttrDataHelper.appendAttr(result, skillAttrInfo);
        }
        return result;
    };
    export function getHorsePower(pos) {
        let result = {};
        let power = 0;
        if (pos == null || pos == 0) {
            return result;
        }
        let horseIds = G_UserData.getBattleResource().getHorseIdsWithPos(pos);
        for (let i in horseIds) {
            let horseId = horseIds[i];
            let horsePower = G_UserData.getHorse().getHorsePowerWithId(horseId);
            power = power + horsePower;
        }
        result[AttributeConst.HORSE_POWER] = power;
        return result;
    };
    export function getHorsePhotoAttr() {
        let horsePhotoList = G_UserData.getHorse().getAllHorsePhotoAttrList();
        return horsePhotoList;
    };

    // 获得战马图鉴战力
    export function getHorsePhotoPower() {
        let horsePower = G_UserData.getHorse().getAllHorsePhotoPowerList()
        return horsePower
    }

    export function getBoutPower(pos) {
        var result = {};
        if (pos == null || pos == 0) {
            return result;
        }
        AttrDataHelper.appendAttr(result, G_UserData.getBout().getPowerSingleInfo());
        return result;
    };

    export function getHistoryHeroPower(pos) {
        var result = {};
        if (pos == null || pos == 0) {
            return result;
        }
        var historyHeroIds = G_UserData.getHistoryHero().getHistoryHeroIds();
        var historyHeroData = G_UserData.getHistoryHero().getHisoricalHeroValueById(historyHeroIds[pos]);
        if (!historyHeroData) {
            return result;
        }
        var attrInfo = HistoryHeroDataHelper.getPowerSingleInfo(historyHeroData);
        AttrDataHelper.appendAttr(result, attrInfo);
        return result;
    };


}