import { AttrDataHelper } from "./AttrDataHelper";

import { G_UserData, G_ConfigLoader } from "../../init";

import { assert, clone } from "../GlobleFunc";

import ParameterIDConst from "../../const/ParameterIDConst";

import MasterConst from "../../const/MasterConst";

import { TeamDataHelper } from "./TeamDataHelper";

import { TypeConvertHelper } from "../TypeConvertHelper";

import { DataConst } from "../../const/DataConst";
;
import { ConfigNameConst } from "../../const/ConfigNameConst";
import AttributeConst from "../../const/AttributeConst";
import { stringUtil } from "../StringUtil";
import { EquipJadeHelper } from "../../scene/view/equipmentJade/EquipJadeHelper";
import EquipConst from "../../const/EquipConst";
import { HeroDataHelper } from "./HeroDataHelper";
import YokeConst from "../../const/YokeConst";
import { UserDataHelper } from "./UserDataHelper";
import { UserCheck } from "../logic/UserCheck";
import { RecoveryDataHelper } from "./RecoveryDataHelper";
import { BaseConfig } from "../../config/BaseConfig";

export namespace EquipDataHelper {
     
    let equipLevelUp:BaseConfig;
    let equipRefine:BaseConfig;
    let parameter:BaseConfig;
    let equipMaster:BaseConfig;
    let equipSuit:BaseConfig;
    let equipConfig:BaseConfig;
    let itemConfig:BaseConfig;
    let roleConfig:BaseConfig;
    export function initConfig():void{
        equipLevelUp = G_ConfigLoader.getConfig(ConfigNameConst.EQUIPMENT_LEVELUP);
        equipRefine = G_ConfigLoader.getConfig(ConfigNameConst.EQUIPMENT_REFINE);
        parameter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        equipMaster = G_ConfigLoader.getConfig(ConfigNameConst.EQUIPMENT_MASTER);
        equipSuit = G_ConfigLoader.getConfig(ConfigNameConst.EQUIPMENT_SUIT);
        equipConfig = G_ConfigLoader.getConfig(ConfigNameConst.EQUIPMENT);
        itemConfig = G_ConfigLoader.getConfig(ConfigNameConst.ITEM);
        roleConfig = G_ConfigLoader.getConfig(ConfigNameConst.ROLE);
        
    }

    export function getEquipStrengthenAttr(data, addLevel?) {
        let result = {};
        let tempLevel = addLevel || 0;
        let config = data.getConfig();
        let level = data.getLevel() + tempLevel;
        let initLevel = config.initial_level;
        let templetLevelup = config.levelup_templet;
        let typeLevelup = config.levelup_type;
        let levelupConfig = equipLevelUp.get(level, templetLevelup);
        if (levelupConfig == null) {
            return null;
        }
        for (let i = 1; i <= 4; i++) {
            let luType = levelupConfig['levelup_type_' + i];
            if (luType == typeLevelup) {
                let luValue = EquipDataHelper.getEquipLevelupAttrValue(initLevel, level, templetLevelup, i);
                AttrDataHelper.formatAttr(result, luType, luValue);
                break;
            }
        }
        return result;
    };

    export function getHeroDataWithEquipId(id) {
        var data = G_UserData.getBattleResource().getEquipDataWithId(id);
        if (data == null) {
            return null;
        }
        var heroId = G_UserData.getTeam().getHeroIdWithPos(data.getPos());
        var heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
        return heroUnitData;
    };
    
    export function getEquipRefineAttr(data, addLevel?) {
        let tempLevel = addLevel || 0;
        let config = data.getConfig();
        let rLevel = data.getR_level() + tempLevel;
        let result = EquipDataHelper.getEquipRefineAttrWithConfig(config, rLevel);
        return result;
    };
    export function getEquipRefineAttrWithConfig(config, rLevel) {
        let result = {};
        let initRlevel = config.initial_refine;
        let templetRefine = config.refine_templet;
        let typeRefine1 = config.refine_type_1;
        let typeRefine2 = config.refine_type_2;
        let refineConfig = equipRefine.get(rLevel, templetRefine);
        if (refineConfig == null) {
            return null;
        }
        for (let i = 1; i <= 8; i++) {
            let rType = refineConfig['refine_type_' + i];
            if (rType == typeRefine1 || rType == typeRefine2) {
                let rValue = EquipDataHelper.getEquipRefineAttrValue(initRlevel, rLevel, templetRefine, i);
                AttrDataHelper.formatAttr(result, rType, rValue);
            }
        }
        return result;
    };
    export function getEquipAttrInfo(data) {
        let result = {};
        let sAttr = EquipDataHelper.getEquipStrengthenAttr(data);
        let rAttr = EquipDataHelper.getEquipRefineAttr(data);
        AttrDataHelper.appendAttr(result, sAttr);
        AttrDataHelper.appendAttr(result, rAttr);
        return result;
    };
    export function getEquipJadeAttrInfo(data, level, isPower?) {
        let jades = data.getJades();
        let result = {};
        let power = 0;
        for (let i = 0; i < jades.length; i++) {
            if (jades[i] > 0) {
                let jadeUnitData = G_UserData.getJade().getJadeDataById(jades[i]);
                let heroBaseId = EquipDataHelper.getHeroBaseIdWithEquipId(data.getId())[0];
                if (jadeUnitData && jadeUnitData.isSuitableHero(heroBaseId)) {
                    let cfg = jadeUnitData.getConfig();
                    if (!isPower) {
                        let size = EquipJadeHelper.getRealAttrValue(cfg, level);
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
    export function getLevelupCostValue(data) {
        let config = data.getConfig();
        let level = data.getLevel();
        let templet = config.levelup_templet;
        return EquipDataHelper.getLevelupCostWithLevelAndTemplet(level, templet);
    };
    export function getLevelupCostWithLevelAndTemplet(level, templet) {
        let levelupConfig = equipLevelUp.get(level, templet);
      //assert((levelupConfig, 'equipment_levelup can\'t find level = %d, templet = %d'.format(level, templet));
        return levelupConfig.silver;
    };
    export function getOneKeyStrengCost(pos) {
        let equipIds = G_UserData.getBattleResource().getEquipIdsWithPos(pos);
        if (equipIds.length == 0) {
            return [-1, null];
        }
        let equipsInfo = [];
        for (let i in equipIds) {
            let equipId = equipIds[i];
            let equipData = G_UserData.getEquipment().getEquipmentDataWithId(equipId);
            let equipLevel = clone(equipData.getLevel());
            let templet = equipData.getConfig().levelup_templet;
            equipsInfo.push({
                level: equipLevel,
                templet: templet,
                slot: equipData.getSlot()
            });
        }
        let ratio =parameter.get(ParameterIDConst.MAX_EQUIPMENT_LEVEL).content / 1000;
        let limitLevel = Math.ceil(G_UserData.getBase().getLevel() * ratio);
        let cost = 0;
        let indexs = {};
        let needMoney = 0;
        let masterInfo = EquipDataHelper.getMasterEquipStrengthenInfo(pos);
        let masterLevel = masterInfo.curMasterLevel + 1;
        let targetLevel = EquipDataHelper.getNeedLevelWithMasterTypeAndLevel(MasterConst.MASTER_TYPE_1, masterLevel);
        let formatInfo = function (equipsInfo) {
            let isAllLimit = true;
            for (let i in equipsInfo) {
                let info = equipsInfo[i];
                isAllLimit = isAllLimit && info.level >= limitLevel;
                while (info.level < targetLevel && info.level < limitLevel) {
                    needMoney = needMoney + EquipDataHelper.getLevelupCostWithLevelAndTemplet(info.level, info.templet);
                    let isOk = UserCheck.enoughMoney(needMoney)[0];
                    if (isOk) {
                        info.level = info.level + 1;
                        cost = needMoney;
                        if (indexs[info.slot] == null) {
                            indexs[info.slot] = true;
                        }
                    } else {
                        return -1;
                    }
                }
            }
            if (isAllLimit) {
                return -2;
            }
            return 0;
        }
        let ret = formatInfo(equipsInfo);
        if (ret == -2) {
            return [-2, null];
        }
        while (ret == 0) {
            masterLevel = masterLevel + 1;
            targetLevel = EquipDataHelper.getNeedLevelWithMasterTypeAndLevel(MasterConst.MASTER_TYPE_1, masterLevel);
            ret = formatInfo(equipsInfo);
        }
        return [
            cost,
            indexs
        ];
    };
    export function getNeedLevelWithMasterTypeAndLevel(type, level) {
        let Config = equipMaster;
        for (let i = 0; i < Config.length(); i++) {
            let info = Config.indexOf(i);
            if (info.equip_type == type && info.level == level) {
                return info.equip_value;
            }
        }
      //assert((false, cc.js.formatStr('equipment_master config can not find type = %d, level = %d', type, level));
    };
    export function getEquipLevelupAttrValue(initLevel, level, templet, index) {
        let totalValue = 0;
        for (let i = initLevel; i <= level; i++) {
            let config = equipLevelUp.get(i, templet);
          //assert((config, 'equipment_levelup can\'t find level = %d, templet = %d'.format(i, templet));
            let value = config['levelup_value_' + index];
            totalValue = totalValue + value;
        }
        return totalValue;
    };
    export function getEquipRefineAttrValue(initLevel, level, templet, index) {
        let totalValue = 0;
        for (let i = initLevel; i <= level; i++) {
            let config = equipRefine.get(i, templet);
          //assert((config, 'equipment_refine can\'t find level = %d, templet = %d'.format(i, templet));
            let value = config['refine_value_' + index];
            totalValue = totalValue + value;
        }
        return totalValue;
    };
    export function getHeroBaseIdWithEquipId(id) {
        var heroUnitData = EquipDataHelper.getHeroDataWithEquipId(id);
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

    export function getSuitName(suitId) {

        let config =equipSuit.get(suitId);
      //assert((config, 'equipment_suit config can not find id = ' + suitId);
        let name = config.name;
        return name;
    };
    export function getSuitComponentIds(suitId) {
        let result = [];
        let config = equipConfig;
        let length = config.length();
        for (let i = 0; i < length; i++) {
            let info = config.indexOf(i);
            if (info.suit_id == suitId) {
                result.push(info.id);
            }
        }
        return result;
    };
    export function getSuitAttrShowInfo(suitId) {
        let config =equipSuit.get(suitId);
      //assert((config, 'equipment_suit config can not find id = ' + suitId);
        let result = [];
        for (let i = 1; i <= 2; i++) {
            let count = config['quantity_' + i];
            let info = [];
            for (let j = 1; j <= 2; j++) {
                let sType = config['suit_' + (i + ('_type_' + j))];
                let sValue = config['suit_' + (i + ('_value_' + j))];
                if (sType > 0 && sValue > 0) {
                    info.push({
                        type: sType,
                        value: sValue
                    });
                }
            }
            result.push({
                count: count,
                info: info
            });
        }
        let count = config['quantity_3'];
        let info3 = [];
        for (let j = 1; j <= 4; j++) {
            let sType = config['suit_3_type_' + j];
            let sValue = config['suit_3_value_' + j];
            if (sType > 0 && sValue > 0) {
                info3.push({
                    type: sType,
                    value: sValue
                });
            }
        }
        result.push({
            count: count,
            info: info3
        });
        return result;
    };
    export function getEquipSuitAttr(equipIds, pos) {
        let temp = {};
        for (let i in equipIds) {
            let equipId = equipIds[i];
            let equipData = G_UserData.getEquipment().getEquipmentDataWithId(equipId);
            let equipConfig = equipData.getConfig();
            let suitId = equipConfig.suit_id;
            if (suitId > 0 && temp[suitId] == null) {
                let componentCount = 0;
                let componentIds = EquipDataHelper.getSuitComponentIds(suitId);
                for (let j in componentIds) {
                    let id = componentIds[j];
                    let isHave = TeamDataHelper.isHaveEquipInPos(id, pos);
                    if (isHave) {
                        componentCount = componentCount + 1;
                    }
                }
                let attrInfo = EquipDataHelper.getSuitAttrShowInfo(suitId);
                for (let j in attrInfo) {
                    let one = attrInfo[j];
                    let count = one.count;
                    if (componentCount >= count) {
                        if (temp[suitId] == null) {
                            temp[suitId] = {};
                        }
                        let info = one.info;
                        for (j in info) {
                            let data = info[j];
                            if (temp[suitId][data.type] == null) {
                                temp[suitId][data.type] = 0;
                            }
                            temp[suitId][data.type] = temp[suitId][data.type] + data.value;
                        }
                    }
                }
            }
        }
        let result = {};
        for (let k in temp) {
            let one = temp[k];
            for (let type in one) {
                let value = one[type];
                if (result[type] == null) {
                    result[type] = 0;
                }
                result[type] = result[type] + value;
            }
        }
        return result;
    };
    export function getAllEquipInfoInBattle() {
        let result = [];
        let heroIds = G_UserData.getTeam().getHeroIds();
        for (let i in heroIds) {
            let heroId = heroIds[i];
            if (heroId > 0) {
                let heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
                let heroBaseId = heroUnitData.getBase_id();
                let equipInfo = G_UserData.getBattleResource().getEquipInfoWithPos(i);
                let one = {
                    heroBaseId: heroBaseId,
                    equipInfo: equipInfo
                };
                result.push(one);
            }
        }
        return result;
    };
    export function getEquipStrengthenAttrDiff(data, level1, level2) {
        let result = {};
        let level = data.getLevel();
        let config = data.getConfig();
        let templetLevelup = config.levelup_templet;
        let typeLevelup = config.levelup_type;
        let levelupConfig = equipLevelUp.get(level, templetLevelup);
      //assert((levelupConfig, 'equipment_levelup can\'t find level = %d, templet = %d'.format(level, templetLevelup));
        for (let i = 1; i <= 4; i++) {
            let luType = levelupConfig['levelup_type_' + i];
            if (luType == typeLevelup) {
                let luValue = EquipDataHelper.getEquipLevelupAttrValue(level1 + 1, level2, templetLevelup, i);
                AttrDataHelper.formatAttr(result, luType, luValue);
                break;
            }
        }
        return result;
    };
    export function getCurRefineLevelExp(templet, level) {
        let refineConfig = equipRefine.get(level, templet);
      //assert((refineConfig, 'equipment_refine config can\'t find level = %d, templet = %d'.format(level, templet));
        return refineConfig.exp;
    };
    export function getEquipNeedExpWithLevel(templet, level) {
        let needExp = 0;
        for (let i = 0; i < level; i++) {
            let exp = EquipDataHelper.getCurRefineLevelExp(templet, i);
            needExp = needExp + exp;
        }
        return needExp;
    };
    export function getCanReachRefineLevelWithExp(totalExp, templet) {
        let level = 0;
        let exp = 0;
        while (exp < totalExp) {
            let temp = EquipDataHelper.getCurRefineLevelExp(templet, level);
            exp = exp + temp;
            level = level + 1;
        }
        return level - 1;
    };
    export function getEquipTotalExp(templet, curExp, level) {
        let tempExp = EquipDataHelper.getEquipNeedExpWithLevel(templet, level);
        let totalExp = tempExp + curExp;
        return totalExp;
    };
    export function getEquipCurExp(templet, totalExp, level) {
        let tempExp = EquipDataHelper.getEquipNeedExpWithLevel(templet, level);
        let curExp = totalExp - tempExp;
        return curExp;
    };
    export function getEquipRefineAttrDiff(data, level1, level2) {
        let result = {};
        let config = data.getConfig();
        let rLevel = data.getR_level();
        let templetRefine = config.refine_templet;
        let typeRefine1 = config.refine_type_1;
        let typeRefine2 = config.refine_type_2;

        let refineConfig = equipRefine.get(rLevel, templetRefine);
      //assert((refineConfig, cc.js.formatStr('equipment_refine can\'t find level = %d, templet = %d', rLevel, templetRefine));
        for (let i = 1; i <= 8; i++) {
            let rType = refineConfig['refine_type_' + i];
            if (rType == typeRefine1 || rType == typeRefine2) {
                let rValue = EquipDataHelper.getEquipRefineAttrValue(level1 + 1, level2, templetRefine, i);
                AttrDataHelper.formatAttr(result, rType, rValue);
            }
        }
        return result;
    };
    export function getMasterEquipStrengthenInfo(pos) {
        let result: any = {};
        let curMasterLevel = 0;
        let nextMasterLevel = 0;
        let needLevel = 0;
        let curAttr = {};
        let nextAttr = {};
        let equipIds = G_UserData.getBattleResource().getEquipInfoWithPos(pos);
        let minLevel = null;
        for (let i = 1; i <= 4; i++) {
            let equipId = equipIds[i];
            let level = null;
            if (equipId) {
                let equipData = G_UserData.getEquipment().getEquipmentDataWithId(equipId);
                level = equipData.getLevel();
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
        let masterConfig = equipMaster;
        for (let i = 0; i < masterConfig.length(); i++) {
            let info = masterConfig.indexOf(i);
            if (info.equip_type == MasterConst.MASTER_TYPE_1) {
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
    export function getMasterEquipRefineInfo(pos) {
        let result: any = {};
        let curMasterLevel = 0;
        let nextMasterLevel = 0;
        let needLevel = 0;
        let curAttr = {};
        let nextAttr = {};
        let equipIds = G_UserData.getBattleResource().getEquipInfoWithPos(pos);
        let minLevel = null;
        for (let i = 1; i <= 4; i++) {
            let equipId = equipIds[i];
            let level = null;
            if (equipId) {
                let equipData = G_UserData.getEquipment().getEquipmentDataWithId(equipId);
                level = equipData.getR_level();
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
        let masterConfig = equipMaster;
        for (let i = 0; i < masterConfig.length(); i++) {
            let info = masterConfig.indexOf(i);
            if (info.equip_type == MasterConst.MASTER_TYPE_2) {
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
    export function getEquipStrengAllCost(unitData) {
        let result = {};
        let moneyCount = unitData.getMoney();
        if (moneyCount > 0) {
            RecoveryDataHelper.formatRecoveryCost(result, TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_GOLD, moneyCount);
        }
        return result;
    };
    export function getEquipRefineAllCost(unitData) {
        let result = {};
        let itemExp1 = itemConfig.get(DataConst.ITEM_REFINE_STONE_1).item_value;
        let itemExp2 = itemConfig.get(DataConst.ITEM_REFINE_STONE_2).item_value;
        let itemExp3 = itemConfig.get(DataConst.ITEM_REFINE_STONE_3).item_value;
        let itemExp4 = itemConfig.get(DataConst.ITEM_REFINE_STONE_4).item_value;
        let expItem = {
            count1: 0,
            count2: 0,
            count3: 0,
            count4: 0
        };
        let allExp = unitData.getAll_exp();
        while (allExp >= itemExp1) {
            if (allExp >= itemExp4) {
                allExp = allExp - itemExp4;
                expItem.count4 = expItem.count4 + 1;
            } else if (allExp >= itemExp3) {
                allExp = allExp - itemExp3;
                expItem.count3 = expItem.count3 + 1;
            } else if (allExp >= itemExp2) {
                allExp = allExp - itemExp2;
                expItem.count2 = expItem.count2 + 1;
            } else if (allExp >= itemExp1) {
                allExp = allExp - itemExp1;
                expItem.count1 = expItem.count1 + 1;
            }
        }
        for (let i = 1; i <= 4; i++) {
            let count = expItem['count' + i];
            if (count > 0) {
                RecoveryDataHelper.formatRecoveryCost(result, TypeConvertHelper.TYPE_ITEM, DataConst['ITEM_REFINE_STONE_' + i], count);
            }
        }
        return result;
    };
    export function getEquipRecoveryPreviewInfo(datas) {
        let result = [];
        let info = {};
        for (let k in datas) {
            let unitData = datas[k];
            let cost1 = EquipDataHelper.getEquipStrengAllCost(unitData);
            let cost2 = EquipDataHelper.getEquipRefineAllCost(unitData);
            let limitUpDatas = unitData.getRecycle_materials();
            for (let j in limitUpDatas) {
                let v = limitUpDatas[j];
                if (v.type != TypeConvertHelper.TYPE_EQUIPMENT) {
                    RecoveryDataHelper.formatRecoveryCost(info, v.type, v.value, v.size);
                }
            }
            let baseId = unitData.getBase_id();
            let materials = unitData.getMaterials();
            if (materials[2-1] > 0) {
                RecoveryDataHelper.formatRecoveryCost(info, TypeConvertHelper.TYPE_EQUIPMENT, baseId, materials[2-1]);
            }
            RecoveryDataHelper.formatRecoveryCost(info, TypeConvertHelper.TYPE_EQUIPMENT, baseId, 1);
            RecoveryDataHelper.mergeRecoveryCost(info, cost1);
            RecoveryDataHelper.mergeRecoveryCost(info, cost2);
        }
        let currency = {};
        for (let type in info) {
            let unit = info[type];
            if (parseInt(type) == TypeConvertHelper.TYPE_EQUIPMENT) {
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
    export function getEquipRebornPreviewInfo(data) {
        let result = [];
        let info = {};
        let cost1 = EquipDataHelper.getEquipStrengAllCost(data);
        let cost2 = EquipDataHelper.getEquipRefineAllCost(data);
        let limitUpDatas = data.getRecycle_materials();
        for (let k in limitUpDatas) {
            let v = limitUpDatas[k];
            if (v.type != TypeConvertHelper.TYPE_EQUIPMENT) {
                RecoveryDataHelper.formatRecoveryCost(info, v.type, v.value, v.size);
            }
        }
        let baseId = data.getBase_id();
        let materials = data.getMaterials();
        if (materials[2-1] > 0) {
            RecoveryDataHelper.formatRecoveryCost(info, TypeConvertHelper.TYPE_EQUIPMENT, baseId, materials[2-1]);
        }
        RecoveryDataHelper.formatRecoveryCost(info, TypeConvertHelper.TYPE_EQUIPMENT, baseId, 1);
        RecoveryDataHelper.mergeRecoveryCost(info, cost1);
        RecoveryDataHelper.mergeRecoveryCost(info, cost2);
        let currency = {};
        for (let type in info) {
            let unit = info[type];
            if (parseInt(type) == TypeConvertHelper.TYPE_EQUIPMENT) {
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
    export function isPromptEquipStrengthen(equipUnitData) {
        let userLevel = G_UserData.getBase().getLevel();
        let roleInfo = roleConfig.get(userLevel);
      //assert((roleInfo, cc.js.formatStr('role config can not find level = %d', userLevel));
        let recommendLevel = roleInfo.recommend_equipment_lv;
        let level = equipUnitData.getLevel();
        if (level >= recommendLevel) {
            return false;
        }
        let ratio =parameter.get(ParameterIDConst.MAX_EQUIPMENT_LEVEL).content / 1000;
        let maxLevel = Math.ceil(G_UserData.getBase().getLevel() * ratio);
        if (level >= maxLevel) {
            return false;
        }
        let costValue = EquipDataHelper.getLevelupCostValue(equipUnitData);
        let isOk = UserCheck.enoughMoney(costValue)[0];
        if (!isOk) {
            return false;
        }
        return true;
    };
    export function isPromptEquipRefine(equipUnitData) {
        let userLevel = G_UserData.getBase().getLevel();
        let roleInfo = roleConfig.get(userLevel);
      //assert((roleInfo, cc.js.formatStr('role config can not find level = %d', userLevel));
        let recommendLevel = roleInfo.recommend_equipment_refine_lv;
        let level = equipUnitData.getR_level();
        if (level >= recommendLevel) {
            return false;
        }
        let ratio =parameter.get(ParameterIDConst.MAX_EQUIPMENT_REFINE_LEVEL).content / 1000;
        let maxLevel = Math.ceil(G_UserData.getBase().getLevel() * ratio);
        if (level >= maxLevel) {
            return false;
        }
        let ownExp = 0;
        for (let i = 1; i <= 4; i++) {
            let itemId = DataConst['ITEM_REFINE_STONE_' + i];
            let count = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, itemId);
            if (count > 0) {
                let itemExp = itemConfig.get(itemId).item_value;
                ownExp = ownExp + itemExp * count;
            }
        }
        let templet = equipUnitData.getConfig().refine_templet;
        let curLevelExp = EquipDataHelper.getCurRefineLevelExp(templet, level);
        let needExp = curLevelExp - equipUnitData.getR_exp();
        if (ownExp >= needExp) {
            return true;
        }
        return false;
    };
    export function getEquipListLimitCount() {
        let level = G_UserData.getBase().getLevel();
        let info = roleConfig.get(level);
      //assert((info, 'role config can not find level = %d'.format(level));
        return info.equipment_limit;
    };
    export function getEquipEffectWithBaseId(baseId) {
        let result = null;
        let info = equipConfig.get(baseId);
      //assert((info, 'equipment config can not find id = %d'.format(baseId));
        let moving = info.moving;
        if (moving != '0') {
            result = stringUtil.split(moving, '|');
        }
        return result;
    };
    export function isHaveYokeBetweenHeroAndEquip(heroBaseId, equipBaseId) {
        let fateIds = HeroDataHelper.getHeroYokeIdsByConfig(heroBaseId);
        for (let i in fateIds) {
            let fateId = fateIds[i];
            let info = HeroDataHelper.getHeroYokeConfig(fateId);
            let fateType = info.fate_type;
            if (fateType == YokeConst.TYPE_EQUIP) {
                for (let j = 1; j <= 4; j++) {
                    let equipId = info['hero_id_' + j];
                    if (equipId == equipBaseId) {
                        return true;
                    }
                }
            }
        }
        return false;
    };
    export function isHaveYokeBetweenHeroAndTreasured1(fateIdInfos, equipBaseId) {
        for (let i in fateIdInfos) {
            let info = fateIdInfos[i];
            let fateType = info.fate_type;
            if (fateType == YokeConst.TYPE_EQUIP) {
                for (let j = 1; j <= 4; j++) {
                    let equipId = info['hero_id_' + j];
                    if (equipId == equipBaseId) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    export function isNeedEquipWithBaseId(baseId) {

        let info = equipConfig.get(baseId);
      //assert((info, cc.js.formatStr('equipment config can not find id = %d', baseId));
        let slot = info.type;
        let color = info.color;
        let heroIds = G_UserData.getTeam().getHeroIds();
        for (let pos in heroIds) {
            let heroId = heroIds[pos];
            if (heroId > 0) {
                let equipId = G_UserData.getBattleResource().getResourceId(pos, EquipConst.FLAG, slot);
                if (equipId && equipId > 0) {
                    let unitData = G_UserData.getEquipment().getEquipmentDataWithId(equipId);
                    let equipColor = unitData.getConfig().color;
                    if (color > equipColor) {
                        return true;
                    }
                } else {
                    return true;
                }
            }
        }
        return false;
    };
    export function getEquipInBattleAverageStr() {
        let average = 0;
        let totalLevel = 0;
        let datas = G_UserData.getBattleResource().getAllEquipData();
        for (let k in datas) {
            let data = datas[k];
            if(data){
                let unitData = G_UserData.getEquipment().getEquipmentDataWithId(data.getId());
                let level = unitData.getLevel();
                totalLevel = totalLevel + level;
            }
        }
        let heroCount = TeamDataHelper.getTeamOpenCount();
        let count = heroCount * 4;
        if (count > 0) {
            average = Math.floor(totalLevel / count);
        }
        return average;
    };
    export function getEquipInBattleAverageRefine() {
        let average = 0;
        let totalLevel = 0;
        let datas = G_UserData.getBattleResource().getAllEquipData();
        for (let k in datas) {
            let data = datas[k];
            if(data){
                let unitData = G_UserData.getEquipment().getEquipmentDataWithId(data.getId());
                let level = unitData.getR_level();
                totalLevel = totalLevel + level;
            }
        }
        let heroCount = TeamDataHelper.getTeamOpenCount();
        let count = heroCount * 4;
        if (count > 0) {
            average = Math.floor(totalLevel / count);
        }
        return average;
    }
}