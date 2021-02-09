import { stringUtil } from "../../../utils/StringUtil";
import { Lang } from "../../../lang/Lang";
import { G_UserData, G_ConfigLoader } from "../../../init";
import { FunctionConst } from "../../../const/FunctionConst";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import PopupChooseJadeStone from "../../../ui/popup/PopupChooseJadeStone";

export var EquipJadeHelper: any = {};
EquipJadeHelper.getMinSuitableJade = function (equipBaseId, property, type?) {
    for (var i = 0; i < G_ConfigLoader.getConfig(ConfigNameConst.JADE).length(); i++) {
        var config = G_ConfigLoader.getConfig(ConfigNameConst.JADE).indexOf(i);
        if (property == config.property) {
            var suitableInfo = null;
            if (type == FunctionConst.FUNC_EQUIP_TRAIN_TYPE3) {
                suitableInfo = stringUtil.split(config.equipment, '|');
            } else if (type == FunctionConst.FUNC_TREASURE_TRAIN_TYPE3) {
                suitableInfo = stringUtil.split(config.treasure, '|');
            }
            for (var j = 0; j < suitableInfo.length; j++) {
                if (parseFloat(suitableInfo[j]) == equipBaseId) {
                    return config;
                }
            }
        }
    }
};
EquipJadeHelper.popupChooseJadeStone = function (slot, jadeData, equipUnitData, callback, isChange, type?) {
    PopupChooseJadeStone.getIns(PopupChooseJadeStone, (p: PopupChooseJadeStone) => {
        p.ctor(isChange, type);
        p.openWithAction();
        var title = Lang.get('equipment_choose_jade_title1');
        if (!jadeData) {
            title = Lang.get('equipment_choose_jade_title3');
        }
        p.setTitle(title);
        p.updateUI(slot, jadeData, equipUnitData, callback);
    })

};
EquipJadeHelper.getEquipJadeListByWear = function (slot, jadeData, equipUnitData, isWaer, type?) {
    var params: any = {};
    if (jadeData) {
        params.jadeId = jadeData.getId();
    }
    if (slot > 1) {
        params.property = 2;
    } else {
        params.property = 1;
    }
    if (equipUnitData) {
        params.equipBaseId = equipUnitData.getBase_id();
        params.equipId = equipUnitData.getId();
    }
    params.hideWear = isWaer;
    var jade = G_UserData.getJade();
    var dataList = jade.getJadeListByEquip(params, type);
    return dataList;
};
EquipJadeHelper.getRealAttrValue = function (cfg, level) {
    var size = cfg.size;
    if (cfg.growth > 0) {
        var funcLevelInfo = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL).get(FunctionConst.FUNC_EQUIP_TRAIN_TYPE3);
        var offsetLevel = level - funcLevelInfo.level;
        if (offsetLevel > 0) {
            size = size + cfg.growth * offsetLevel;
        }
    }
    return size;
};
EquipJadeHelper.isSuitableHero = function (cfg, heroBaseId) {
    var suitableInfo = stringUtil.split(cfg.hero, '|');
    if (parseFloat(suitableInfo[0]) == 999) {
        return true;
    }
    for (var i = 0; i < suitableInfo.length; i++) {
        if (parseFloat(suitableInfo[i]) == heroBaseId) {
            return true;
        }
    }
    return false;
};
EquipJadeHelper.getJadeConfig = function (id) {
    var config = G_ConfigLoader.getConfig(ConfigNameConst.JADE).get(id);
    return config;
};
