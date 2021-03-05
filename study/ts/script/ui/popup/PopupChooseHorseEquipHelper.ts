import { Lang } from "../../lang/Lang";

export namespace PopupChooseHorseEquipHelper {
    export let FROM_TYPE1 = 1;
    export let FROM_TYPE2 = 2;
    export let addEquipDataDesc = function (equipData, fromType, curEquipUnitData?, pos?) {
        if (equipData == null) {
            return null;
        }
        var cellData: any = {};
        for (const key in equipData) {
            cellData[key] = equipData[key];
        }
        cellData.horseId = equipData.getHorse_id();
        var BTN_DES = {
            1: 'equipment_btn_wear',
            2: 'equipment_btn_replace'
        };
        cellData.btnDesc = Lang.get(BTN_DES[fromType]);
        cellData.btnIsHightLight = false;
        if (cellData.horseId != 0) {
            cellData.btnDesc = Lang.get('equipment_btn_grab');
            cellData.btnIsHightLight = true;
        }
        return cellData;
    };
    export let _checkIsShowRP = function (equipData, curData) {
        var curColor = curData.getConfig().color;
        var curPotential = curData.getConfig().potential;
        var curLevel = curData.getLevel();
        var curRLevel = curData.getR_level();
        var color = equipData.getConfig().color;
        var potential = equipData.getConfig().potential;
        var level = equipData.getLevel();
        var rLevel = equipData.getR_level();
        if (color != curColor) {
            return color > curColor;
        } else if (potential != curPotential) {
            return potential > curPotential;
        } else if (level != curLevel) {
            return level > curLevel;
        } else if (rLevel != curRLevel) {
            return rLevel > curRLevel;
        }
        return false;
    };
    export let _FROM_TYPE1 = function (data) {
        return data;
    };
    export let _FROM_TYPE2 = function (data) {
        return data;
    };
}