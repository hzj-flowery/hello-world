
import { RecoveryDataHelper } from "./RecoveryDataHelper";
import { G_UserData, G_ConfigLoader } from "../../init";
import { AttrDataHelper } from "./AttrDataHelper";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import { TypeConvertHelper } from "../TypeConvertHelper";

let sortHorseEquip = function (a, b) {
    let configA = a.getConfig();
    let configB = b.getConfig();
    if (configA.color != configB.color) {
        return configB.color - configA.color;
    } else {
        return configA.id - configB.id;
    }
}

export namespace HorseEquipDataHelper {
    export function getHorseEquipConfig(id) {

        let info = G_ConfigLoader.getConfig(ConfigNameConst.HORSE_EQUIPMENT).get(id);
        console.assert(info, ('horse config can not find id = %d' + id));
        return info;
    };
    export function getAllHorseEquipList(horseEquipList) {
        let result: any[] = [];
        let wear: any[] = [];
        let noWear: any[] = [];
        for (let k in horseEquipList) {
            let unit = horseEquipList[k];
            let horseId = unit.getHorse_id();
            if (horseId == 0) {
                noWear.push(unit)
            } else {
                let horseUnitData = G_UserData.getHorse().getUnitDataWithId(horseId);
                if (horseUnitData.isInBattle()) {
                    wear.push(unit)
                } else {
                    noWear.push(unit)
                }
            }
        }
        wear.sort(sortHorseEquip);
        noWear.sort(sortHorseEquip);
        result = result.concat(wear).concat(noWear);
        return result;
    };
    export function getReplaceHorseEquipListWithSlot(horseEquipList, slot, horseId) {
        let result: any[] = [];
        let noWear: any[] = [];
        let wear: any[] = [];
        for (let k in horseEquipList) {
            let unit = horseEquipList[k];
            if (unit.getConfig().type == slot) {
                let curHorseId = unit.getHorse_id();
                if (curHorseId == 0) {
                    noWear.push(unit)
                } else {
                    if (!horseId) {
                        wear.push(unit);
                    } else if (horseId != curHorseId) {
                        wear.push(unit)
                    }
                }
            }
        }
        wear.sort(sortHorseEquip);
        noWear.sort(sortHorseEquip);
        for (let i in noWear) {
            let data = noWear[i];
            result.push(data);
        }
        for (let i in wear) {
            let data = wear[i];
            result.push(data);
        }
        return [
            result,
            noWear,
            wear
        ];
    };
    export function getAllRecoveryHorseEquipList(horseEquipList, lowLevel) {
        let result: any[] = [];
        for (let k in horseEquipList) {
            let equipUnitData = horseEquipList[k];
            if (equipUnitData.getHorse_id() == 0) {
                if (lowLevel) {
                    if (equipUnitData.getConfig().color <= 4) {
                        result.push(equipUnitData);
                    }
                } else {
                    result.push(equipUnitData);
                }
            }
        }
        result.sort(sortHorseEquip);
        return result;
    };
    export function getEquipedEquipListWithHorseId(horseId, horseEquipList) {
        let result: any[] = [];
        for (let k in horseEquipList) {
            let equipUnitData = horseEquipList[k];
            if (equipUnitData.getHorse_id() == horseId) {
                result.push(equipUnitData);
            }
        }
        result.sort(sortHorseEquip);
        return result;
    };
    export function getEquipedEquipinfoWithHorseIdAndSlot(horseId, slot, horseEquipList) {
        for (let k in horseEquipList) {
            let equipUnitData = horseEquipList[k];
            if (equipUnitData.getHorse_id() == horseId) {
                if (equipUnitData.getConfig().type == slot) {
                    return equipUnitData;
                }
            }
        }
        return null;
    };
    export function getHorseEquipRecoveryPreviewInfo(datas) {
        let result = [];
        let info = {};
        for (let k in datas) {
            let unitData = datas[k];
            let baseId = unitData.getBase_id();
            RecoveryDataHelper.formatRecoveryCost(info, TypeConvertHelper.TYPE_HORSE_EQUIP, baseId, 1);
        }
        let currency = {};
        for (let type in info) {
            let unit = info[type];
            if (parseInt(type) == TypeConvertHelper.TYPE_HORSE_EQUIP) {
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
                })
            }
        }
        RecoveryDataHelper.sortAward(result);
        return result;
    };
    export function getHorseEquipAttrInfo(equipData) {
        let result = {};
        let id = equipData.getBase_id();
        result = this.getAttrSingleInfo(equipData.getConfig());
        return result;
    };
    export function getAttrSingleInfo(configData) {
        let result = {};
        let attrNum = 4;
        for (let i = 1; i <= attrNum; i++) {
            let attrType = configData['attribute_type_' + i];
            if (attrType != 0) {
                let attrValue = configData['attribute_value_' + i];
                AttrDataHelper.formatAttr(result, attrType, attrValue);
            }
        }
        return result;
    };
    export function isHaveBetterHorseEquip(equipBaseId, horseEquipmentList) {
        let configData = this.getHorseEquipConfig(equipBaseId);
        for (let k in horseEquipmentList) {
            let equipData = horseEquipmentList[k];
            if (equipData.getHorse_id() == 0) {
                let config = equipData.getConfig();
                if (config.type == configData.type && config.color > configData.color) {
                    return true;
                }
            }
        }
        return false;
    };
    export function isHaveFreeHorseEquip(slot, horseEquipmentList) {
        for (let k in horseEquipmentList) {
            let equipData = horseEquipmentList[k];
            if (equipData.getHorse_id() == 0 && equipData.getConfig().type == slot) {
                return true;
            }
        }
        return false;
    };
}