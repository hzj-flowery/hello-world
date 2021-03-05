import { G_UserData } from "../../init";
import { EquipDataHelper } from "../../utils/data/EquipDataHelper";
import { TeamDataHelper } from "../../utils/data/TeamDataHelper";
import { Lang } from "../../lang/Lang";

export namespace PopupChooseEquipHelper {
    export const FROM_TYPE1 = 1;
    export const FROM_TYPE2 = 2;
    export const FROM_TYPE3 = 3;
    var BTN_DES = {
        1: 'equipment_btn_wear',
        2: 'equipment_btn_replace',
        3: 'reborn_list_btn'
    };
    export const addEquipDataDesc = function (equipData, fromType, showRP?, curEquipUnitData?, pos?) {
        if (equipData == null) {
            return null;
        }
        var heroBaseId = EquipDataHelper.getHeroBaseIdWithEquipId(equipData.getId())[0];
        var rData = G_UserData.getBattleResource().getEquipDataWithId(equipData.getId());
        // var cellData = clone(equipData);
        var cellData:any = {};
        for (const key in equipData) {
            cellData[key] = equipData[key];
        }
        cellData.heroBaseId = heroBaseId;
        cellData.btnDesc = Lang.get(BTN_DES[fromType]);
        cellData.btnIsHightLight = false;
        cellData.isYoke = false;
        if (rData) {
            cellData.btnDesc = Lang.get('equipment_btn_grab');
            cellData.btnIsHightLight = true;
        }
        if (fromType == PopupChooseEquipHelper.FROM_TYPE2 && showRP == true && !rData) {
            cellData.showRP = PopupChooseEquipHelper._checkIsShowRP(equipData, curEquipUnitData);
        }
        if (fromType == PopupChooseEquipHelper.FROM_TYPE1 || fromType == PopupChooseEquipHelper.FROM_TYPE2 && pos) {
            var baseId = TeamDataHelper.getHeroBaseIdWithPos(pos);
            cellData.isYoke = EquipDataHelper.isHaveYokeBetweenHeroAndEquip(baseId, equipData.getBase_id());
        }
        return cellData;
    };
    export const _checkIsShowRP = function (equipData, curData) {
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
    export const _FROM_TYPE1 = function (data) {
        return data;
    };
    export const _FROM_TYPE2 = function (data) {
        return data;
    };
    export const _FROM_TYPE3 = function (data) {
        return G_UserData.getEquipment().getRebornList();
    };
}