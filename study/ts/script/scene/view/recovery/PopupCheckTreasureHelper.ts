import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { TextHelper } from "../../../utils/TextHelper";
import { Colors, G_UserData } from "../../../init";
import { RecoveryConst } from "../../../const/RecoveryConst";

export namespace PopupCheckTreasureHelper {
    export let FROM_TYPE1 = 1;
    export let FROM_TYPE2 = 2;
    export let addTreasureDataDesc = function (data, fromType) {
        if (data == null) {
            return null;
        }
        var cellData: any = {};
        for (const key in data) {
            cellData[key] = data[key];
        }
        var desValue = [];
        if (fromType == PopupCheckTreasureHelper.FROM_TYPE1 || PopupCheckTreasureHelper.FROM_TYPE2) {
            var info = UserDataHelper.getTreasureAttrInfo(data);
            var desInfo = TextHelper.getAttrInfoBySort(info);
            for (const i in desInfo) {
                var one = desInfo[i];
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
        cellData.desValue = desValue;
        return cellData;
    };
    export let getTotalDesInfo = function (fromType, foodData) {
        var result = {};
        return result;
    };
    export let _FROM_TYPE1 = function () {
        var data = G_UserData.getTreasure().getRecoveryList();
        return data;
    };
    export let _FROM_TYPE2 = function () {
        var data = G_UserData.getTreasure().getTransformList();
        return data;
    };
    export let getMaxCount = function (fromType) {
        if (fromType == PopupCheckTreasureHelper.FROM_TYPE1) {
            return RecoveryConst.RECOVERY_TREASURE_MAX;
        }
    };
}