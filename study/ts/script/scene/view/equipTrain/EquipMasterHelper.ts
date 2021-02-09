import { Lang } from "../../../lang/Lang";
import MasterConst from "../../../const/MasterConst";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { G_UserData, G_Prompt } from "../../../init";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { FunctionCheck } from "../../../utils/logic/FunctionCheck";
import { EquipDataHelper } from "../../../utils/data/EquipDataHelper";
import { TreasureDataHelper } from "../../../utils/data/TreasureDataHelper";

export namespace EquipMasterHelper{


export  var curMasterType = 0;
export  var getMasterTabNameList = function () {
    var result = [];
    result.push(Lang.get('equipment_master_tab_title_' + MasterConst.MASTER_TYPE_1));
    result.push(Lang.get('equipment_master_tab_title_' + MasterConst.MASTER_TYPE_2));
    result.push(Lang.get('equipment_master_tab_title_' + MasterConst.MASTER_TYPE_3));
    result.push(Lang.get('equipment_master_tab_title_' + MasterConst.MASTER_TYPE_4));
    return result;
};
export  var getCurMasterInfo = function (pos, curMasterType) {
    if (curMasterType == MasterConst.MASTER_TYPE_1 || curMasterType == MasterConst.MASTER_TYPE_2) {
        return EquipMasterHelper._getEquipMasterInfo(pos, curMasterType);
    } else if (curMasterType == MasterConst.MASTER_TYPE_3 || curMasterType == MasterConst.MASTER_TYPE_4) {
        return EquipMasterHelper._getTreasureMasterInfo(pos, curMasterType);
    }
};
export  var _getEquipMasterInfo = function (pos, curMasterType) {
    var result: any = {};
    result.type = TypeConvertHelper.TYPE_EQUIPMENT;
    result.info = {};
    var equipInfo = G_UserData.getBattleResource().getEquipInfoWithPos(pos);
    for (var i = 1; i <= 4; i++) {
        var info: any = {};
        var equipId = equipInfo[i];
        if (equipId) {
            var equipData = G_UserData.getEquipment().getEquipmentDataWithId(equipId);
            var equipBaseId = equipData.getBase_id();
            var equipParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_EQUIPMENT, equipBaseId);
            var curLevel = 0;
            if (curMasterType == MasterConst.MASTER_TYPE_1) {
                curLevel = equipData.getLevel();
            } else if (curMasterType == MasterConst.MASTER_TYPE_2) {
                curLevel = equipData.getR_level();
            }
            info.equipId = equipId;
            info.equipParam = equipParam;
            info.curLevel = curLevel;
        }
        result.info[i] = info;
    }
    var masterInfo = {};
    if (curMasterType == MasterConst.MASTER_TYPE_1) {
        masterInfo = EquipDataHelper.getMasterEquipStrengthenInfo(pos);
    } else if (curMasterType == MasterConst.MASTER_TYPE_2) {
        masterInfo = EquipDataHelper.getMasterEquipRefineInfo(pos);
    }
    result.masterInfo = masterInfo;
    return result;
};
export  var  _getTreasureMasterInfo = function (pos, curMasterType) {
    var result: any = {};
    result.type = TypeConvertHelper.TYPE_TREASURE;
    result.info = {};
    var treasureInfo = G_UserData.getBattleResource().getTreasureInfoWithPos(pos);
    for (var i = 1; i <= 2; i++) {
        var info:any = {};
        var treasureId = treasureInfo[i-1];
        if (treasureId) {
            var treasureData = G_UserData.getTreasure().getTreasureDataWithId(treasureId);
            var treasureBaseId = treasureData.getBase_id();
            var treasureParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_TREASURE, treasureBaseId);
            var curLevel = 0;
            if (curMasterType == MasterConst.MASTER_TYPE_3) {
                curLevel = treasureData.getLevel();
            } else if (curMasterType == MasterConst.MASTER_TYPE_4) {
                curLevel = treasureData.getRefine_level();
            }
            info.equipId = treasureId;
            info.equipParam = treasureParam;
            info.curLevel = curLevel;
        }
        result.info[i] = info;
    }
    var masterInfo = 0;
    if (curMasterType == MasterConst.MASTER_TYPE_3) {
        masterInfo = TreasureDataHelper.getMasterTreasureUpgradeInfo(pos);
    } else if (curMasterType == MasterConst.MASTER_TYPE_4) {
        masterInfo = TreasureDataHelper.getMasterTreasureRefineInfo(pos);
    }
    result.masterInfo = masterInfo;
    return result;
};
export  var isOpen = function (funcId) {
    var arr = FunctionCheck.funcIsOpened(funcId)
    var isOpen = arr[0];
    var des = arr.length > 1 ?  arr[1] : null;
    if (!isOpen) {
        G_Prompt.showTip(des);
        return false;
    }
    return true;
};
export  var isFull = function (pos) {
    var isFullEquip = G_UserData.getBattleResource().isFullEquip(pos);
    var isFullTreasure = G_UserData.getBattleResource().isFullTreasure(pos);
    if (isFullEquip || isFullTreasure) {
        return true;
    } else {
        if (!isFullEquip) {
            G_Prompt.showTip(Lang.get('master_equip_not_full_tip'));
            return false;
        }
        if (!isFullTreasure) {
            G_Prompt.showTip(Lang.get('master_treasure_not_full_tip'));
            return false;
        }
    }
};
}
