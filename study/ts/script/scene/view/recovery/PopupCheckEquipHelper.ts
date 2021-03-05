import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { TextHelper } from "../../../utils/TextHelper";
import { G_UserData, Colors } from "../../../init";
import { RecoveryConst } from "../../../const/RecoveryConst";

export namespace PopupCheckEquipHelper {
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
        if (fromType == PopupCheckEquipHelper.FROM_TYPE1) {
            var info = UserDataHelper.getEquipAttrInfo(data);
            var desInfo = TextHelper.getAttrInfoBySort(info);
            for (let i = 0; i < 2; i++) {
                var one = desInfo[i];
                if (one) {
                    var [attrName, attrValue] = TextHelper.getAttrBasicText(one.id, one.value);
                    attrName = TextHelper.expandTextByLen(attrName, 4);
                    var info: any = {
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
        if (fromType == PopupCheckEquipHelper.FROM_TYPE1) {
        }
        return result;
    };
    export let _FROM_TYPE1 = function () {
        var data = G_UserData.getEquipment().getRecoveryList();
        return data;
    };
    export let getMaxCount = function (fromType) {
        if (fromType == PopupCheckEquipHelper.FROM_TYPE1) {
            return RecoveryConst.RECOVERY_EQUIP_MAX;
        }
    };
}