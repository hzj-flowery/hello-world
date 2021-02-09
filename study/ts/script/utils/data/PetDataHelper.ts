import { G_AudioManager, G_UserData, Colors, G_ConfigLoader } from "../../init";
import { RecoveryDataHelper } from "./RecoveryDataHelper";

import { ConfigNameConst } from "../../const/ConfigNameConst";
import { AttrDataHelper } from "./AttrDataHelper";
import AttributeConst from "../../const/AttributeConst";

import TeamConst from "../../const/TeamConst";
import ParameterIDConst from "../../const/ParameterIDConst";
import { Lang } from "../../lang/Lang";
import { TypeConvertHelper } from "../TypeConvertHelper";
import { UserDataHelper } from "./UserDataHelper";
import { UserCheck } from "../logic/UserCheck";
import { DataConst } from "../../const/DataConst";
import { Path } from "../Path";
import { TextHelper } from "../TextHelper";
import { ArraySort } from "../handler";
import { RedPointHelper } from "../../data/RedPointHelper";
import { FunctionConst } from "../../const/FunctionConst";
import { formula } from "../../config/formula";
import { BaseConfig } from "../../config/BaseConfig";


export namespace PetDataHelper {
    let petStarConfig:BaseConfig;
    let petMapConfig:BaseConfig;
    let petStarCostConfig:BaseConfig;
    let petExpConfig:BaseConfig;
    let petLimitConfig:BaseConfig;
    let roleConfig:BaseConfig;
    let petConfig:BaseConfig;
    export function initConfig() {
        petStarConfig = G_ConfigLoader.getConfig(ConfigNameConst.PET_STAR);
        petMapConfig = G_ConfigLoader.getConfig(ConfigNameConst.PET_MAP);
        petStarCostConfig = G_ConfigLoader.getConfig(ConfigNameConst.PET_STAR_COST);
        petExpConfig =  G_ConfigLoader.getConfig(ConfigNameConst.PET_EXP);
        petLimitConfig =  G_ConfigLoader.getConfig(ConfigNameConst.PET_LIMIT);
        roleConfig = G_ConfigLoader.getConfig(ConfigNameConst.ROLE);
        petConfig = G_ConfigLoader.getConfig(ConfigNameConst.PET);
    }

    export function getPetStarConfig(id, star) {
        let config = petStarConfig.get(id, star);
        console.assert(config, 'pet_star config can not find id = %d, rank = %d', id, star);
        return config;
    };
    export function getPetMapConfig(petMapId) {
        let config = petMapConfig.get(petMapId);
        console.assert(config, 'pet_map config can not find id = %d', petMapId);
        return config;
    };
    export function getPetStarCostConfig(star, templet,isRed) {
        let config = petStarCostConfig.get(star, templet,(isRed==false||isRed==null)?0:1);
        console.assert(config, 'pet_star_cost config can not find star = %d, templet = %d', star, templet);
        return config;
    };
    export function getPetLevelupConfig(level, templet) {
        let info = petExpConfig.get(level, templet);
        console.assert(info, 'pet_exp can not find level = %d, templet = %d', level, templet);
        return info;
    };
    export function getPetLimitConfig(id) {

        let config = petLimitConfig.get(id);
        console.assert(config, 'pet_limit config can not find id = %d', id);
        return config;
    };
    export function getPetListLimitCount() {
        let level = G_UserData.getBase().getLevel();
        let info = roleConfig.get(level);
        console.assert(info, 'role config can not find level = %d', level);
        return info.pet_limit;
    };
    export function getPetHelpAttr(isOnlyBase?) {
        let result = [];
        let attrList = [];
        let petList = G_UserData.getTeam().getPetIdsInHelp();
        let pet_help_percent = UserDataHelper.getParameterValue('pet_huyou_percent') / 1000;
        for (let i in petList) {
            let petId = petList[i];
            let petUnit = G_UserData.getPet().getUnitDataWithId(petId);
            let param = { unitData: petUnit };
            let attrAll = {};
            if (isOnlyBase) {
                attrAll = PetDataHelper.getPetTotalBaseAttr(param);
            } else {
                attrAll = PetDataHelper.getPetTotalAttr(param);
            }
            for (let key in attrAll) {
                let value = attrAll[key];
                if (parseInt(key) != AttributeConst.PET_BLESS_RATE) {
                    let blessRate = attrAll[AttributeConst.PET_BLESS_RATE];
                    let valueAdd = Math.floor(value * pet_help_percent / 6);
                    attrAll[key] = valueAdd;
                }
            }
            AttrDataHelper.appendAttr(result, attrAll);
        }
        let filterAttr = function (key) {
            if (key == AttributeConst.PET_BLESS_RATE || key == AttributeConst.PET_ALL_ATTR || key == AttributeConst.HIT) {
                return true;
            }
            return false;
        }
        for (let key in result) {
            let value = result[key];
            if (filterAttr(key) == false) {
                attrList.push({
                    type: key,
                    value: value
                });
            }
        }
        attrList.sort(function (item1, item2) {
            return item1.type - item2.type;
        });
        return [
            result,
            attrList
        ];
    };
    export function getPetMapAttr(...vars) {
        let pet_map = petMapConfig;
        let result = [];
        let attrList = [];
        var len = pet_map.getLength();
        for (let loop = 0; loop < len; loop++) {
            let petMapData = pet_map.indexOf(loop);
            if (PetDataHelper.isPetMapAct(petMapData)) {
                let attrAll = {};
                for (let i = 1; i <= 4; i++) {
                    let attrType = petMapData['attribute_type_' + i];
                    let attrValue = petMapData['attribute_value_' + i];
                    if (attrType > 0) {
                        attrAll[attrType] = attrAll[attrType] || 0;
                        attrAll[attrType] = attrAll[attrType] + attrValue;
                    }
                }
                AttrDataHelper.appendAttr(result, attrAll);
            }
        }
        for (let key in result) {
            let value = result[key];
            attrList.push({
                type: key,
                value: value
            });
        }
        ArraySort(attrList, function (item1, item2) {
            return item1.type < item2.type;
        });
        return [
            result,
            attrList
        ];
    };
    export function getPetMapPower() {
        let pet_map = petMapConfig;
        let result = {};
        let power = 0;
        for (let loop = 0; loop < pet_map.length(); loop++) {
            let petMapData = pet_map.indexOf(loop);
            if (PetDataHelper.isPetMapAct(petMapData)) {
                power = power + petMapData.all_combat;
            }
        }
        result[AttributeConst.PET_POWER] = power;
        return result;
    };
    export function getPetBasicAttrWithLevelFilter(petCfg, level) {
        let templet = petCfg.color;
        let atk = petCfg.atk_base;
        let pdef = petCfg.pdef_base;
        let mdef = petCfg.mdef_base;
        let hp = petCfg.hp_base;
        let growAtk = petCfg.atk_grow;
        let growPdef = petCfg.pdef_grow;
        let growMdef = petCfg.mdef_grow;
        let growHp = petCfg.hp_grow;
        let hitBase = petCfg.hit_base;
        let blessingRate = petCfg.blessing_rate;
        for (let i = 1; i <= level - 1; i++) {
            let config = PetDataHelper.getPetLevelupConfig(i, templet);
            let ratio = config.ratio;
            atk = atk + Math.floor(growAtk * ratio / 1000);
            pdef = pdef + Math.floor(growPdef * ratio / 1000);
            mdef = mdef + Math.floor(growMdef * ratio / 1000);
            hp = hp + Math.floor(growHp * ratio / 1000);
        }
        let result = {};
        result[AttributeConst.ATK_FINAL] = atk;
        result[AttributeConst.PD_FINAL] = pdef;
        result[AttributeConst.MD_FINAL] = mdef;
        result[AttributeConst.HP_FINAL] = hp;
        result[AttributeConst.PET_BLESS_RATE] = blessingRate;
        return result;
    };
    export function getPetBasicAttrWithLevel(petCfg, level) {
        let templet = petCfg.color;
        let atk = petCfg.atk_base;
        let pdef = petCfg.pdef_base;
        let mdef = petCfg.mdef_base;
        let hp = petCfg.hp_base;
        let growAtk = petCfg.atk_grow;
        let growPdef = petCfg.pdef_grow;
        let growMdef = petCfg.mdef_grow;
        let growHp = petCfg.hp_grow;
        let hitBase = petCfg.hit_base;
        let blessingRate = petCfg.blessing_rate;
        for (let i = 1; i <= level - 1; i++) {
            let config = PetDataHelper.getPetLevelupConfig(i, templet);
            let ratio = config.ratio;
            atk = atk + Math.floor(growAtk * ratio / 1000);
            pdef = pdef + Math.floor(growPdef * ratio / 1000);
            mdef = mdef + Math.floor(growMdef * ratio / 1000);
            hp = hp + Math.floor(growHp * ratio / 1000);
        }
        let result = {};
        result[AttributeConst.ATK_FINAL] = atk;
        result[AttributeConst.PD_FINAL] = pdef;
        result[AttributeConst.MD_FINAL] = mdef;
        result[AttributeConst.HP_FINAL] = hp;
        result[AttributeConst.PET_BLESS_RATE] = blessingRate;
        return result;
    };
    export function getPetUpgradeQuality(unitData) {
        let config = unitData.getConfig();
        var initial_star = unitData.getInitial_star();
        if (config.potential_before > 0 && initial_star == 0) {
            let oldConfig = petConfig.get(config.potential_before);
            return oldConfig.color;
        }
        return config.color;
    };
    export function getPetNeedExpWithLevel(level, templet) {
        let needExp = 0;
        for (let i = 1; i <= level - 1; i++) {
            let exp = PetDataHelper.getPetLevelUpExp(i, templet);
            needExp = needExp + exp;
        }
        return needExp;
    };
    export function getPetCanReachLevelWithExp(totalExp, templet) {
        let level = 1;
        let exp = 0;
        while (exp < totalExp) {
            let temp = PetDataHelper.getPetLevelUpExp(level, templet);
            exp = exp + temp;
            level = level + 1;
        }
        return level - 1;
    };
    export function getPetLevelUpExp(level, templet) {
        let config = PetDataHelper.getPetLevelupConfig(level, templet);
        return config.exp;
    };
    export function getPetBreakMaterials(petUnitData) {
        let starLevel = petUnitData.getStar();
        let templet = petUnitData.getLvUpCost();
        let isRed = petUnitData.getIsRed();
        let config = PetDataHelper.getPetStarCostConfig(starLevel, templet,isRed);
        let result = [];
        let card = config.card;
        let after_card = config.potential_card;
        var initial_star = petUnitData.getInitial_star();

        if (initial_star > 0) {
            if (card > 0) {
                result.push({
                    type: TypeConvertHelper.TYPE_PET,
                    value: petUnitData.getBase_id(),
                    size: card
                });
            }
        } else {
            if (after_card > 0) {
                result.push({
                    type: TypeConvertHelper.TYPE_PET,
                    value: petUnitData.getConfig().potential_before,
                    size: after_card
                });
            } else if (card > 0) {
                result.push({
                    type: TypeConvertHelper.TYPE_PET,
                    value: petUnitData.getBase_id(),
                    size: card
                });
            }
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
        let petConfig = petUnitData.getConfig();
        if (petConfig.potential_before > 0) {
            let itemArray = petConfig.potential_value.split('|');
            let type = parseInt(itemArray[0]);
            let value = parseInt(itemArray[1]);
            if (type && value && config.special_size > 0) {
                result.push({
                    type: type,
                    value: value,
                    size: config.special_size
                });
            }
        }
        return result;
    };
    export function getPetBreakLimitLevel(petUnitData) {
        let rankLevel = petUnitData.getStar();
        let templet = petUnitData.getLvUpCost();
        let isRed = petUnitData.getIsRed();
        let config = PetDataHelper.getPetStarCostConfig(rankLevel, templet,isRed);
        return config.lv;
    };
    export function getPetBreakCostWithStar(rank, templet) {
        let rankCostConfig = PetDataHelper.getPetStarCostConfig(rank, templet,false);
        let needLevel = rankCostConfig.lv;
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
    export function getPetBreakMaxLevel(petUnitData) {
        let level = petUnitData.getLevel();
        let quality = petUnitData.getQuality();
        let rankMax = petUnitData.getConfig().star_max;
        var initial_star = petUnitData.getInitial_star();
        var isRed = petUnitData.getIsRed();
        for (let i = initial_star; i <= rankMax; i++) {
            let info = PetDataHelper.getPetStarCostConfig(i, quality, isRed);
            if (level < info.lv) {
                return i;
            }
        }
        return rankMax;
    };
    export function getPetBreakShowAttr(petUnitData, addStar?) {
        addStar = addStar || 0;
        let baseId = petUnitData.getBase_id();
        let starLevel = petUnitData.getStar() + addStar;
        let allUp = 0;
        var initial_star = petUnitData.getInitial_star();
        for (let i = initial_star; i <= starLevel; i++) {
            let petStarConfig = PetDataHelper.getPetStarConfig(baseId, i);
            let ratio = petStarConfig.up_show;
            console.log(ratio);
            allUp = allUp + ratio;
        }
        let result = {};
        result[AttributeConst.PET_ALL_ATTR] = allUp;
        return result;
    };
    export function getPetBreakAttr(petUnitData, addStar?) {
        addStar = addStar || 0;
        let baseId = petUnitData.getBase_id();
        let star = petUnitData.getStar() + addStar;
        let starMax = petUnitData.getConfig().star_max;
        if (star > starMax) {
            return null;
        }
        let baseAttr = PetDataHelper.getPetBasicAttrWithLevel(petUnitData.getConfig(), petUnitData.getLevel());
        console.log(baseAttr);
        let result = PetDataHelper.getPetBreakAttrWithBaseIdAndStar(baseId, baseAttr, star);
        console.log(result);
        return result;
    };
    export function getPetBreakAttrWithBaseIdAndStar(baseId, baseAttr, starLevel) {
        let allUp = 0;
        let pdef = 0;
        let mdef = 0;
        let hp = 0;
        let atk = 0;
        var petConfigInfo = petConfig.get(baseId);
        var initial_star = petConfigInfo.initial_star;
        starLevel = Math.max(starLevel, initial_star);
        for (let i = initial_star; i <= starLevel; i++) {
            let petStarConfig = PetDataHelper.getPetStarConfig(baseId, i);
            let ratio = petStarConfig.up;
           // console.log(ratio);
            allUp = allUp + ratio;
            atk = atk + Math.floor(baseAttr[AttributeConst.ATK_FINAL] * ratio / 1000);
            pdef = pdef + Math.floor(baseAttr[AttributeConst.PD_FINAL] * ratio / 1000);
            mdef = mdef + Math.floor(baseAttr[AttributeConst.MD_FINAL] * ratio / 1000);
            hp = hp + Math.floor(baseAttr[AttributeConst.HP_FINAL] * ratio / 1000);
        }
        let result = {};
      //  console.log(allUp);
        result[AttributeConst.PET_ALL_ATTR] = allUp;
        result[AttributeConst.ATK_FINAL] = atk;
        result[AttributeConst.PD_FINAL] = pdef;
        result[AttributeConst.MD_FINAL] = mdef;
        result[AttributeConst.HP_FINAL] = hp;
        console.log(result);
        return result;
    };
    export function getPetTotalBaseAttr(param) {
        let result = [];
        let unitData = param.unitData;
        let tempLevel = param.addLevel || 0;
        let tempRank = param.addRank || 0;
        let level = unitData.getLevel() + tempLevel;
        let rank = unitData.getStar() + tempRank;
        let petConfig = unitData.getConfig();
        let attr1 = PetDataHelper.getPetBasicAttrWithLevel(unitData.getConfig(), level);
        let attr2 = PetDataHelper.getPetBreakAttr(unitData, tempRank);
        AttrDataHelper.appendAttr(result, attr1);
        AttrDataHelper.replaceAttr(result, attr2);
        return result;
    };
    export function getPetTotalAttr(param) {
        let result = PetDataHelper.getPetTotalBaseAttr(param);
        AttrDataHelper.processDef(result);
        AttrDataHelper.processAddition(result);
        return result;
    };
    export function getPetFragment(petId) {
        let petUnit = G_UserData.getPet().getUnitDataWithId(petId);
        if (petUnit == null) {
            return [
                0,
                0
            ];
        }
        let fragmentId = petUnit.getFragmentId();
        let curr = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_FRAGMENT, fragmentId);
        let itemParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_FRAGMENT, fragmentId);
        let max = itemParam.cfg.fragment_num;
        return [
            curr,
            max
        ];
    };
    export function getPetSkillIds(baseId, star) {
        let result = [];
        let petStarConfig = PetDataHelper.getPetStarConfig(baseId, star);
        for (let i = 1; i <= 2; i++) {
            let skillId = petStarConfig['skill' + i];
            if (skillId > 0) {
                result.push(skillId);
            }
        }
        return result;
    };
    export function isReachStarLimit(petUnitData) {
        let starMax = petUnitData.getConfig().star_max;
        let starLevel = petUnitData.getStar();
        let isReachLimit = starLevel >= starMax;
        return isReachLimit;
    };
    export function isPetMapAct(petMapData) {
        let state = G_UserData.getPet().getPetMapState(petMapData.id);
        if (state == 2) {
            return true;
        }
        return false;
    };
    export function convertAttrAppendDesc(desc, percent) {
        let contents = TextHelper.parseConfigText(desc);
        let fontColor = Colors.BRIGHT_BG_TWO;
        let richContents: any = [];
        for (let i in contents) {
            let content = contents[i];
            let text = content.content;
            let color = fontColor;
            let message = text;
            if (text == 'percent') {
                color = Colors.BRIGHT_BG_GREEN;
                message = '' + (percent + '%');
            }
            richContents.push({
                type: 'text',
                msg: message,
                color: color,
                fontSize: 18,
                opacity: 255
            });
        }
        return richContents;
    };
    export function isReachCheckBetterColorPetRP(petUnitData) {
        let limitLevelStr = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.CHANGE_LEVEL_MAX).content;
        let limitLevel = parseInt(limitLevelStr);
        if (UserCheck.enoughLevel(limitLevel)) {
            return false;
        }
        return true;
    };
    export function isHaveBetterColorPet(petUnitData) {
        let petBaseId = petUnitData.getBase_id();
        let petColor = petUnitData.getConfig().color;
        let petList = G_UserData.getPet().getReplaceDataBySort(petBaseId);
        for (let i in petList) {
            let unit = petList[i];
            let color = unit.getConfig().color;
            if (color > petColor) {
                return true;
            }
        }
        return false;
    };
    export function isPromptPetBetterColor(petUnitData) {
        let isHave = PetDataHelper.isHaveBetterColorPet(petUnitData);
        return isHave;
    };
    export function isPromptPetUpgrade(petUnitData) {
        let userLevel = G_UserData.getBase().getLevel();
        let roleInfo = G_ConfigLoader.getConfig(ConfigNameConst.ROLE).get(userLevel);
        console.assert(roleInfo, 'role config can not find level = %d', userLevel);
        let recommendLevel = roleInfo.recommend_pet_lv;
        let level = petUnitData.getLevel();
        if (level >= recommendLevel) {
            return false;
        }
        let totalCount = 0;
        for (let i = 1; i <= 4; i++) {
            let itemId = DataConst['ITEM_PET_LEVELUP_MATERIAL_' + i];
            let count = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, itemId);
            totalCount = totalCount + count;
        }
        if (totalCount == 0) {
            return false;
        }
        return true;
    };
    export function getPetStateStr(petUnitData) {
        let isBattle = G_UserData.getPet().isPetInBattle(petUnitData.getId());
        if (isBattle) {
            return Lang.get('pet_in_battle');
        }
        let isBless = G_UserData.getPet().isPetBless(petUnitData.getId());
        if (isBless) {
            return Lang.get('pet_break_bless');
        }
        return null;
    };
    export function isPromptPetBreak(petUnitData) {
        let starLevel = petUnitData.getStar();
        let starMax = petUnitData.getStarMax();
        if (starLevel >= starMax) {
            return false;
        }
        let costInfo = PetDataHelper.getPetBreakMaterials(petUnitData);
        for (let i in costInfo) {
            let info = costInfo[i];
            if (info.type == TypeConvertHelper.TYPE_PET) {
                let petConfig = petUnitData.getConfig();
                let baseId = petUnitData.getBase_id();
                var initial_star = petUnitData.getInitial_star();
                if (petConfig.potential_before > 0 && initial_star == 0) {
                    baseId = petConfig.potential_before;
                }
                let sameCardNum = G_UserData.getPet().getSameCardCountWithBaseId(baseId).length;
                if (info.size > sameCardNum) {
                    return false;
                }
            } else if (info.type == TypeConvertHelper.TYPE_ITEM) {
                let itemNum = G_UserData.getItems().getItemNum(info.value);
                if (info.size > itemNum) {
                    return false;
                }
            } else if (info.type == TypeConvertHelper.TYPE_RESOURCE) {
                let enough = UserCheck.enoughMoney(info.size)[0];
                if (!enough) {
                    return false;
                }
            }
        }
        let needLevel = PetDataHelper.getPetBreakLimitLevel(petUnitData);
        let myLevel = petUnitData.getLevel();
        if (myLevel < needLevel) {
            return false;
        }
        return true;
    };
    export function isHaveEmptyPetPos() {
        for (let i = 1; i <= 6; i++) {
            let state = G_UserData.getTeam().getPetStateWithPos(i);
            if (state == TeamConst.STATE_OPEN) {
                return true;
            }
        }
        return false;
    };
    export function getPetPowerFormulaResult(attrInfo): number {
        let map = {};

        let AttrCfg = G_ConfigLoader.getConfig(ConfigNameConst.ATTRIBUTE);
        let length = AttrCfg.length();
        for (let i = 0; i < length; i++) {
            let info = AttrCfg.indexOf(i);
            let enName: string = info.en_name;
            let upperEnName = enName.toUpperCase();
            // let key = '#' + (upperEnName + '#');
            let value = attrInfo[info.id] || 0;
            if (info.type == 2) {
                value = value / 1000;
            }
            map[upperEnName] = value;
        }

        // let formula: string = G_ConfigLoader.getConfig(ConfigNameConst.FORMULA).get(4).formula;
        // for (let k in map) {
        //     let v = map[k];
        //     formula = formula.replace(k, v);
        // }
        return formula.getFunc(3)(map);
    };
    export function getPetPower(petUnitData) {
        let param = { unitData: petUnitData };
        let attrInfo = PetDataHelper.getPetTotalAttr(param);
        console.log(attrInfo);

        let petConfig = petUnitData.getConfig();
        attrInfo[AttributeConst.ATK_FINAL] = attrInfo[AttributeConst.ATK_FINAL] - petConfig.atk_base;
        attrInfo[AttributeConst.PD_FINAL] = attrInfo[AttributeConst.PD_FINAL] - petConfig.pdef_base;
        attrInfo[AttributeConst.MD_FINAL] = attrInfo[AttributeConst.MD_FINAL] - petConfig.mdef_base;
        attrInfo[AttributeConst.HP_FINAL] = attrInfo[AttributeConst.HP_FINAL] - petConfig.hp_base;
        attrInfo[AttributeConst.PET_EXTEND_POWER] = petConfig.combat_base;
        AttrDataHelper.processSpecial(attrInfo);
        return PetDataHelper.getPetPowerFormulaResult(attrInfo);
    };
    export function getPetPowerAttr(param) {
        let result = {};
        let unitData = param.unitData;
        let tempLevel = param.addLevel || 0;
        let tempRank = param.addRank || 0;
        let level = unitData.getLevel() + tempLevel;
        let rank = unitData.getStar() + tempRank;
        let attr1 = PetDataHelper.getPetBasicAttrWithLevel(unitData.getConfig(), level);
        let attr2 = PetDataHelper.getPetBreakAttr(unitData, tempRank);
        AttrDataHelper.appendAttr(result, attr1);
        AttrDataHelper.appendAttr(result, attr2);
        AttrDataHelper.processDef(result);
        AttrDataHelper.processAddition(result);
        return result;
    };
    export function getPetLimitAttr(petUnitData, tempLimitLevel) {
        // let result = {};
        // let heroBaseId = petUnitData.getBase_id();
        // let limitLevel = tempLimitLevel || petUnitData.getLimit_level();
        // for (let i = 0;i<limitLevel;i++) {
        //     let attrInfo = PetDataHelper.getLimitSingleAttr(heroBaseId, i);
        //     AttrDataHelper.appendAttr(result, attrInfo);
        // }
        // return result;
    };
    export function getAllPetLevelUpCost(unitData) {
        let itemData = G_ConfigLoader.getConfig(ConfigNameConst.ITEM)
        let itemExp1 = itemData.get(DataConst.ITEM_PET_LEVELUP_MATERIAL_1).item_value;
        let itemExp2 = itemData.get(DataConst.ITEM_PET_LEVELUP_MATERIAL_2).item_value;
        let itemExp3 = itemData.get(DataConst.ITEM_PET_LEVELUP_MATERIAL_3).item_value;
        let itemExp4 = itemData.get(DataConst.ITEM_PET_LEVELUP_MATERIAL_4).item_value;
        let expItem = {
            count1: 0,
            count2: 0,
            count3: 0,
            count4: 0
        };
        let expCount = unitData.getExp()  - unitData.getInital_exp();
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
                RecoveryDataHelper.formatRecoveryCost(result, TypeConvertHelper.TYPE_ITEM, DataConst['ITEM_PET_LEVELUP_MATERIAL_' + i], expItem['count' + i]);
            }
        }
        return result;
    };
    export function getAllPetBreakCost(unitData) {
        let result = {};
        let config = unitData.getConfig();
        let rank = unitData.getStar();
        let rTemplet = unitData.getLvUpCost();
        let isRed = unitData.getIsRed();
        let heroBaseId = unitData.getBase_id();
        var initial_star = unitData.getInitial_star();
        if (config.color == 6 && initial_star == 0) {
            heroBaseId = config.potential_before;
        }
        
        for (let i = initial_star; i <= rank - 1; i++) {
            let rankInfo = PetDataHelper.getPetStarCostConfig(i, rTemplet,isRed);
            let cardNum = rankInfo.card;
            if (config.color == 6 && initial_star == 0) {
                cardNum = rankInfo.potential_card;
            }
            if (cardNum > 0) {
                RecoveryDataHelper.formatRecoveryCost(result, TypeConvertHelper.TYPE_PET, heroBaseId, cardNum);
            }
            for (let j = 1; j <= 2; j++) {
                let size = rankInfo['size_' + j];
                if (size > 0) {
                    let type = rankInfo['type_' + j];
                    let value = rankInfo['value_' + j];
                    RecoveryDataHelper.formatRecoveryCost(result, type, value, size);
                }
            }
            if (config.potential_before > 0) {
                let itemArray = config.potential_value.split('|');
                let type = parseInt(itemArray[0]);
                let value = parseInt(itemArray[1]);
                if (type && value && rankInfo['special_size'] > 0) {
                    RecoveryDataHelper.formatRecoveryCost(result, type, value, rankInfo['special_size']);
                }
            }
        }
        return result;
    };
    export function getAllPetLimitUpCost(unitData) {
        let config = unitData.getConfig();
        let result = {};
        let exp = 0;
        if (config.color == 6) {
            let materials = unitData.getRecycle_materials();
            for (let i in materials) {
                let material = materials[i];
                RecoveryDataHelper.formatRecoveryCost(result, material.type, material.value, material.size);
            }
        } else {
            let recyMats = unitData.getRecycle_materials();
            for (let _ in recyMats) {
                let mat = recyMats[_];
                RecoveryDataHelper.formatRecoveryCost(result, mat.type, mat.value, mat.size);
            }
        }
        return [
            result,
            exp
        ];
    };
    export function getPetRecoveryPreviewInfo(heroDatas) {
        let result = [];
        let info = {};
        for (let k in heroDatas) {
            let unitData = heroDatas[k];
            let cost1 = PetDataHelper.getAllPetLevelUpCost(unitData);
            let cost2 = PetDataHelper.getAllPetBreakCost(unitData);
            let cost3 = PetDataHelper.getAllPetLimitUpCost(unitData);
            let petBaseId = unitData.getBase_id();
            let config = unitData.getConfig();
            var initial_star = unitData.getInitial_star();
            if (config.color == 6 && initial_star == 0) {
                petBaseId = config.potential_before;
            }
            RecoveryDataHelper.formatRecoveryCost(info, TypeConvertHelper.TYPE_PET, petBaseId, 1);
            RecoveryDataHelper.mergeRecoveryCost(info, cost1);
            RecoveryDataHelper.mergeRecoveryCost(info, cost2);
            RecoveryDataHelper.mergeRecoveryCost(info, cost3);
        }
        let currency = {};
        for (let type in info) {
            let unit = info[type];
            if (parseInt(type) == TypeConvertHelper.TYPE_PET) {
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
    export function getPetRebornPreviewInfo(data) {
        let result = [];
        let info = {};
        let cost1 = PetDataHelper.getAllPetLevelUpCost(data);
        let cost2 = PetDataHelper.getAllPetBreakCost(data);
        let cost3 = PetDataHelper.getAllPetLimitUpCost(data);
        let petBaseId = data.getBase_id();
        let config = data.getConfig();
        var initial_star = data.getInitial_star();
        if (config.color == 6 && initial_star == 0) {
            petBaseId = config.potential_before;
        }
        RecoveryDataHelper.formatRecoveryCost(info, TypeConvertHelper.TYPE_PET, petBaseId, 1);
        RecoveryDataHelper.mergeRecoveryCost(info, cost1);
        RecoveryDataHelper.mergeRecoveryCost(info, cost2);
        RecoveryDataHelper.mergeRecoveryCost(info, cost3);
        let fragments = {};
        for (let type in info) {
            let unit = info[type];
            if (parseInt(type) == TypeConvertHelper.TYPE_PET) {
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
    export function getPetTeamRedPoint() {
        function checkPetUpgrade(petId) {
            let petUnitData = G_UserData.getPet().getUnitDataWithId(petId);
            let reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_PET_TRAIN_TYPE1, petUnitData);
            return reach;
        }
        function checkPetBreak(petId) {
            let petUnitData = G_UserData.getPet().getUnitDataWithId(petId);
            let reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_PET_TRAIN_TYPE2, petUnitData);
            return reach;
        }
        function checkPetLimit(petId) {
            let petUnitData = G_UserData.getPet().getUnitDataWithId(petId);
            let reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_PET_TRAIN_TYPE3, petUnitData);
            return reach;
        }
        let checkFuncs = {
            [FunctionConst.FUNC_PET_TRAIN_TYPE1]: checkPetUpgrade,
            [FunctionConst.FUNC_PET_TRAIN_TYPE2]: checkPetBreak,
            [FunctionConst.FUNC_PET_TRAIN_TYPE3]: checkPetLimit
        };
        let redPointFuncId = [
            FunctionConst.FUNC_PET_TRAIN_TYPE1,
            FunctionConst.FUNC_PET_TRAIN_TYPE2,
            FunctionConst.FUNC_PET_TRAIN_TYPE3
        ];
        let petIdList = G_UserData.getTeam().getPetIdsInHelp();
        for (var i in petIdList) {
            let value = petIdList[i];
            for (var j in redPointFuncId) {
                let funcId = redPointFuncId[j];
                let func = checkFuncs[funcId];
                if (value > 0) {
                    let reach = func(value);
                    if (reach) {
                        return true;
                    }
                }
            }
        }
        let petBattleIdList = G_UserData.getTeam().getPetIdsInBattle();
        for (let i in petBattleIdList) {
            let value = petBattleIdList[i];
            for (let j in redPointFuncId) {
                let funcId = redPointFuncId[j];
                let func = checkFuncs[funcId];
                if (value > 0) {
                    let reach = func(value);
                    if (reach) {
                        return true;
                    }
                }
            }
        }
        return false;
    };
    export function getPetEffectWithBaseId(baseId) {
        let result = null;
        let info = petConfig.get(baseId);
        console.assert(info, 'pet config can not find id = %d', baseId);
        let moving: string = info.moving;
        if (moving != '0') {
            result = moving.split('|');
        }
        return result;
    };
    export function playVoiceWithId(id) {
        let info = petConfig.get(id);
        console.assert(info, 'pet config can not find id = %d', id);
        let voiceName = info.voice;
        if (voiceName != '' && voiceName != '0') {
            let res = Path.getHeroVoice(voiceName);
            G_AudioManager.playSound(res);
        }
    };
}