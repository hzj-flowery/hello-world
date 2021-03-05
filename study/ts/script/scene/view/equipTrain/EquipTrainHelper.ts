import { G_ConfigLoader, G_Prompt, G_UserData } from "../../../init";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { assert } from "../../../utils/GlobleFunc";
import { Path } from "../../../utils/Path";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { FunctionConst } from "../../../const/FunctionConst";
import { LimitCostConst } from "../../../const/LimitCostConst";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { EquipDataHelper } from "../../../utils/data/EquipDataHelper";
import { stringUtil } from "../../../utils/StringUtil";
import { FunctionCheck } from "../../../utils/logic/FunctionCheck";
import { EquipJadeHelper } from "../equipmentJade/EquipJadeHelper";
import EquipConst from "../../../const/EquipConst";

export namespace EquipTrainHelper {
    export var JADE_ATTR_ORDER = {
        1: 4,
        2: 2,
        3: 1,
        4: 3
    };
    export var isOpen = function (funcId) {
        var arr = FunctionCheck.funcIsOpened(funcId)
        var isOpen = arr[0];
        var des = arr.length > 1 ? arr[1] : null;
        if (!isOpen) {
            G_Prompt.showTip(des);
            return false;
        }
        return true;
    };
    export var getLimitUpEquipName = function (equipId) {
        var afterId = G_ConfigLoader.getConfig(ConfigNameConst.EQUIPMENT).get(equipId).potential_after;
        var name = '';
        if (afterId) {
            name = G_ConfigLoader.getConfig(ConfigNameConst.EQUIPMENT).get(afterId).name;
        }
        return name;
    };
    export var getLimitUpTitleRes = function (baseId) {
        var config = G_ConfigLoader.getConfig(ConfigNameConst.EQUIPMENT).get(baseId);
      //assert((config, 'not found equipment config in equipment by ' + baseId);
        var afterId = config.potential_after;
        if (afterId == 0) {
            return '';
        }
        var afterSuitId = G_ConfigLoader.getConfig(ConfigNameConst.EQUIPMENT).get(afterId).suit_id;
        if (afterSuitId == 2001) {
            return Path.getTextLimit('txt_limit_06d');
        } else if (afterSuitId == 3001) {
            return Path.getTextLimit('txt_limit_06e');
        } else {
            return '';
        }
    };
    export var getCurEquipUnitData = function () {
        var equipOnlyId = G_UserData.getEquipment().getCurEquipId();
        if (!equipOnlyId) {
            return;
        }
        return G_UserData.getEquipment().getEquipmentDataWithId(equipOnlyId);
    };
    export var getLimitUpCostInfo = function () {
        var unitData = EquipTrainHelper.getCurEquipUnitData();
        return EquipTrainHelper.getLimitUpCostInfoByUnitData(unitData);
    };
    export var getLimitUpCostInfoByUnitData = function (unitData) {
        if (!unitData) {
            return {};
        }
        var equipId = unitData.getBase_id();
        var refineLevel = unitData.getR_level();
        var equipConfig = unitData.getConfig();
        var curTemplateId = equipConfig.levelup_templet;
        var afterId = equipConfig.potential_after;
        var afterConfig = G_ConfigLoader.getConfig(ConfigNameConst.EQUIPMENT).get(afterId);
        if (!afterConfig) {
            return {};
        }
        var afterTemplateId = afterConfig.levelup_templet;
        var refineCost = 0;
        var limitupTempleteId = equipConfig.limitup_templet_id;
        var limitUpConfig = G_ConfigLoader.getConfig(ConfigNameConst.EQUIPMENT_LIMITUP).get(limitupTempleteId);
        var costInfo = {};
        costInfo['size_' + LimitCostConst.LIMIT_COST_KEY_2] = limitUpConfig.cost_equipment;
        costInfo['size_' + LimitCostConst.LIMIT_COST_KEY_3] = limitUpConfig.resource_size_1;
        costInfo['size_' + LimitCostConst.LIMIT_COST_KEY_4] = limitUpConfig.resource_size_2;
        costInfo['type_' + LimitCostConst.LIMIT_COST_KEY_2] = TypeConvertHelper.TYPE_EQUIPMENT;
        costInfo['type_' + LimitCostConst.LIMIT_COST_KEY_3] = TypeConvertHelper.TYPE_ITEM;
        costInfo['type_' + LimitCostConst.LIMIT_COST_KEY_4] = TypeConvertHelper.TYPE_ITEM;
        costInfo['value_' + LimitCostConst.LIMIT_COST_KEY_2] = equipId;
        costInfo['value_' + LimitCostConst.LIMIT_COST_KEY_3] = limitUpConfig.resource_id_1;
        costInfo['value_' + LimitCostConst.LIMIT_COST_KEY_4] = limitUpConfig.resource_id_2;
        costInfo['consume_' + LimitCostConst.LIMIT_COST_KEY_2] = limitUpConfig.consume_equipment;
        costInfo['consume_' + LimitCostConst.LIMIT_COST_KEY_3] = limitUpConfig.resource_consume_1;
        costInfo['consume_' + LimitCostConst.LIMIT_COST_KEY_4] = limitUpConfig.resource_consume_2;
        return costInfo;
    };
    export var getLimitUpCostNameResIds = function () {
        var unitData = EquipTrainHelper.getCurEquipUnitData();
        if (!unitData) {
            return {};
        }
        var equipId = unitData.getBase_id();
        var limitupTempleteId = G_ConfigLoader.getConfig(ConfigNameConst.EQUIPMENT).get(equipId).limitup_templet_id;
        var costNames = {};
        costNames[LimitCostConst.LIMIT_COST_KEY_1] = 'txt_limit_01c';
        costNames[LimitCostConst.LIMIT_COST_KEY_2] = 'txt_limit_02c';
        costNames[LimitCostConst.LIMIT_COST_KEY_3] = limitupTempleteId == 1 && 'txt_limit_03' || 'txt_limit_01d';
        costNames[LimitCostConst.LIMIT_COST_KEY_4] = limitupTempleteId == 1 && 'txt_limit_04' || 'txt_limit_02d';
        return costNames;
    };
    export var getCostEquipId = function (value) {
        var ids = G_UserData.getEquipment().getEquipmentIdsWithBaseId(value);
        var count = ids.length;
        for (var i = 0; i < count; i++) {
            var data = G_UserData.getEquipment().getEquipmentDataWithId(ids[i]);
            if (!data.isInBattle() && data.isBlackPlat()) {
                return ids[i];
            }
        }
    };
    export var equipLimitUpIsAllFull = function () {
        var unitData = EquipTrainHelper.getCurEquipUnitData();
        return EquipTrainHelper.equipLimitUpIsAllFullByUnitData(unitData);
    };
    export var equipLimitUpIsAllFullByUnitData = function (unitData) {
        if (!unitData) {
            return false;
        }
        var materials = unitData.getMaterials();
        var info = EquipTrainHelper.getLimitUpCostInfoByUnitData(unitData);
        for (var i = LimitCostConst.LIMIT_COST_KEY_2; i <= LimitCostConst.LIMIT_COST_KEY_4; i++) {
            var size = info['size_' + LimitCostConst['LIMIT_COST_KEY_' + i]];
            if (size == null) {
                return false;
            }
            if (materials[LimitCostConst['LIMIT_COST_KEY_' + (i-1)]] < info['size_' + LimitCostConst['LIMIT_COST_KEY_' + i]]) {
                return false;
            }
        }
        return true;
    };
    export var getConfigByBaseId = function (baseId) {
        var config = G_ConfigLoader.getConfig(ConfigNameConst.EQUIPMENT).get(baseId);
      //assert((config, 'not found config by base_id ' + baseId);
        return config;
    };
    export var getLimitUpCoinCost = function () {
        var unitData = EquipTrainHelper.getCurEquipUnitData();
        return EquipTrainHelper.getLimitUpCoinCostByUnitData(unitData);
    };
    export var getLimitUpCoinCostByUnitData = function (unitData) {
        if (!unitData) {
            return 0;
        }
        var config = unitData.getConfig();
        var curTemplateId = config.levelup_templet;
        var curlevel = unitData.getLevel();
        if (config.potential_after == 0) {
            return 0;
        }
        var configAfter = EquipTrainHelper.getConfigByBaseId(config.potential_after);
        var afterTemplateId = configAfter.levelup_templet;
        var coinCost = 0;
        for (var lv = 1; lv <= curlevel - 1; lv++) {
            var levelupConfig = G_ConfigLoader.getConfig(ConfigNameConst.EQUIPMENT_LEVELUP).get(lv, curTemplateId);
            var levelupConfigAfter = G_ConfigLoader.getConfig(ConfigNameConst.EQUIPMENT_LEVELUP).get(lv, afterTemplateId);
            coinCost = coinCost + (levelupConfigAfter.silver - levelupConfig.silver);
        }
        return Math.floor(coinCost * 0.689);
    };
    export var isHaveLimitUpCostMaterials = function (key) {
        var unitData = EquipTrainHelper.getCurEquipUnitData();
        return EquipTrainHelper.isHaveLimitUpCostMaterialsByUnitData(key, unitData);
    };
    export var isHaveLimitUpCostMaterialsByUnitData = function (key, unitData):Array<any> {
        if (!unitData) {
            return [
                false,
                false
            ];
        }
        var info = EquipTrainHelper.getLimitUpCostInfoByUnitData(unitData);
        var curCount = unitData.getMaterials()[key-1];
        var maxSize = info['size_' + key];
        if (!maxSize) {
            return [
                false,
                false
            ];
        }
        var isFull = curCount >= maxSize;
        if (!isFull) {
            var count = UserDataHelper.getNumByTypeAndValue(info['type_' + key], info['value_' + key]) + curCount;
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
    export var canLimitUp = function (baseId) {
        var config = EquipTrainHelper.getConfigByBaseId(baseId);
        if (config.suit_id > 0) {
            return true;
        }
        return false;
    };
    export var isNeedRedPoint = function () {
        var unitData = EquipTrainHelper.getCurEquipUnitData();
        return EquipTrainHelper.isNeedRedPointByUnitData(unitData);
    };
    export var isNeedRedPointByUnitData = function (unitData) {
        var isRed = false;
        var isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_EQUIP_TRAIN_TYPE4)[0];
        if (!isOpen) {
            return isRed;
        }
        for (var key = LimitCostConst.LIMIT_COST_KEY_2; key <= LimitCostConst.LIMIT_COST_KEY_4; key++) {
            var isHave = EquipTrainHelper.isHaveLimitUpCostMaterialsByUnitData(key, unitData)[0];
            isRed = isRed || isHave;
        }
        var isAllFull = EquipTrainHelper.equipLimitUpIsAllFullByUnitData(unitData);
        var strSilver = EquipTrainHelper.getLimitUpCoinCostByUnitData(unitData);
        var haveCoin = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, 2);
        var isEnough = haveCoin >= strSilver;
        isRed = isRed || isAllFull && isEnough;
        return isRed;
    };
    export var getShowEquipTrainTab = function () {
        var data = [];
        var curUnitData = EquipTrainHelper.getCurEquipUnitData();
        for (var index = 1; index <= EquipConst.EQUIP_TRAIN_MAX_TAB; index++) {
            if (FunctionCheck.funcIsShow(FunctionConst['FUNC_EQUIP_TRAIN_TYPE' + index])) {
                if (index == EquipConst.EQUIP_TRAIN_LIMIT) {
                    if (EquipTrainHelper.canLimitUp(curUnitData.getBase_id())) {
                        data.push(index);
                    }
                } else {
                    data.push(index);
                }
            }
        }
        return data;
    };
    // EquipTrainHelper.copyEquipData = function (object) {
    //     var lookup_table = {};
    //     function _copy(object) {
    //         if (typeof(object) != 'object') {
    //             return object;
    //         } else if (lookup_table[object]) {
    //             return lookup_table[object];
    //         }
    //         var new_table = {};
    //         lookup_table[object] = new_table;
    //         for (var index in object) {
    //             var value = object[index];
    //             new_table[_copy(index)] = _copy(value);
    //         }
    //         return setmetatable(new_table, getmetatable(object));
    //     }
    //     return _copy(object);
    // };
    export var haveBetterAndCanEquipJade = function (equipId, jadeId, slot) {
        var params: any = {};
        if (jadeId && jadeId > 0) {
            params.jadeId = jadeId;
        }
        if (slot > 1) {
            params.property = 2;
        } else {
            params.property = 1;
        }
        var equipUnitData = G_UserData.getEquipment().getEquipmentDataWithId(equipId);
        if (!equipUnitData.isInBattle()) {
            return [
                false,
                false
            ];
        }
        params.equipBaseId = equipUnitData.getBase_id();
        params.equipId = equipId;
        params.hideWear = true;
        var jade = G_UserData.getJade();
        var jadeUnitData = jade.getJadeDataById(jadeId);
        var better = false;
        var list = jade.getJadeListByEquip(params, FunctionConst.FUNC_EQUIP_TRAIN_TYPE3);
        var arr = EquipDataHelper.getHeroBaseIdWithEquipId(equipId);
        var heroBaseId = arr[1];
        var isHave = EquipTrainHelper._isHaveSuitable(heroBaseId, list, equipUnitData);
        if (jadeUnitData) {
            if (!jadeUnitData.isSuitableHero(heroBaseId)) {
                better = list.length > 0 && isHave;
            }
            for (var i = 0; i < list.length; i++) {
                if (better) {
                    break;
                }
                if (list[i].getConfig().color > jadeUnitData.getConfig().color && !equipUnitData.isHaveTwoSameJade(list[i].getId())[0] && list[i].isSuitableHero(heroBaseId)) {
                    better = true;
                }
            }
        }
        return [
            list.length > 0 && isHave,
            better
        ];
    };
    export var _isHaveSuitable = function (heroBaseId, list, equipUnitData) {
        var isHave = false;
        for (var i = 0; i < list.length; i++) {
            if (list[i].isSuitableHero(heroBaseId) && !equipUnitData.isHaveTwoSameJade(list[i].getId())[0]) {
                isHave = true;
                break;
            }
        }
        return isHave;
    };
    export var needJadeRedPoint = function (equipId) {
        var needRed = false;
        var isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_EQUIP_TRAIN_TYPE3)[0];
        if (!isOpen) {
            return needRed;
        }
        var equipUnitData = G_UserData.getEquipment().getEquipmentDataWithId(equipId);
        if (!equipUnitData.isInBattle()) {
            return needRed;
        }
        var jades = equipUnitData.getJades();
        var slotList = stringUtil.split(equipUnitData.getConfig().inlay_type, '|');
        for (var i = 0; i < jades.length; i++) {
            if (parseFloat(slotList[i]) > 0) {
                var ret = EquipTrainHelper.haveBetterAndCanEquipJade(equipId, jades[i], i);
                var isHave = ret[0];
                var haveBetter = ret[1];
                if (jades[i] == 0) {
                    needRed = needRed || isHave;
                }
                needRed = needRed || haveBetter;
                if (needRed) {
                    return needRed;
                }
            }
        }
        return needRed;
    };
    export var getEquipJadeAttr = function (unitData) {
        var jades = unitData.getJades();
        var attrInfo = [];
        for (var i = 0; i < jades.length; i++) {
            if (jades[i] > 0) {
                var jadeUnitData = G_UserData.getJade().getJadeDataById(jades[i]);
                var cfg = jadeUnitData.getConfig();
                var [_, heroBaseId] = jadeUnitData.getEquipHeroBaseId();
                var isSuitable = jadeUnitData.isSuitableHero(heroBaseId);
                attrInfo.push({
                    order: i,
                    type: cfg.type,
                    value: EquipJadeHelper.getRealAttrValue(cfg, G_UserData.getBase().getLevel()),
                    property: cfg.property,
                    description: cfg.description,
                    isSuitable: isSuitable
                });
            }
        }
        attrInfo.sort((t1, t2) => {
            return t2.order - t1.order;
        });
        return attrInfo;
    };

    export var  copyEquipData = function(object) {
        function _copy(object) {
            if (typeof (object) != 'object') {
                return object;
            }
            var new_table = {};
            for (var index in object) {
                var value = object[index];
                new_table[index] = _copy(value);
            }
            return new_table;
        }
        return _copy(object);
    }
}