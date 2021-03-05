import { HorseEquipDataHelper } from "../../../utils/data/HorseEquipDataHelper";
import { TextHelper } from "../../../utils/TextHelper";
import { G_UserData, Colors } from "../../../init";
import { RecoveryConst } from "../../../const/RecoveryConst";

export namespace PopupCheckHorseEquipHelper {
    export let FROM_TYPE1 = 1;
    export let addEquipDataDesc = function (data, fromType) {
        if (data == null) {
            return null;
        }
        var cellData: any = {};
        for (const key in data) {
            cellData[key] = data[key];
        }
        var desValue = [];
        if (fromType == PopupCheckHorseEquipHelper.FROM_TYPE1) {
            let info = HorseEquipDataHelper.getHorseEquipAttrInfo(data);
            var desInfo = TextHelper.getAttrInfoBySort(info);
            for (let i = 0; i < 2; i++) {
                var one = desInfo[i];
                if (one) {
                    var [attrName, attrValue] = TextHelper.getAttrBasicText(one.id, one.value);
                    attrName = TextHelper.expandTextByLen(attrName, 4);
                    let info:any = {
                        des: attrName,
                        value: '+' + attrValue,
                        colorValue: Colors.BRIGHT_BG_GREEN
                    };
                    desValue.push(info);
                }
            }
        }
        cellData.desValue = desValue;
        return cellData;
    };
    export let getTotalDesInfo = function (fromType, foodData) {
        var result = {};
        if (fromType == PopupCheckHorseEquipHelper.FROM_TYPE1) {
        }
        return result;
    };
    export let _FROM_TYPE1 = function () {
        var data = G_UserData.getHorseEquipment().getAllRecoveryHorseEquipments();
        return data;
    };
    export let getMaxCount = function (fromType) {
        if (fromType == PopupCheckHorseEquipHelper.FROM_TYPE1) {
            return RecoveryConst.RECOVERY_HORSE_EQUIP_MAX;
        }
    };
}