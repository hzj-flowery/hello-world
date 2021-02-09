import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { TextHelper } from "../../../utils/TextHelper";
import { Colors, G_UserData } from "../../../init";
import { RecoveryConst } from "../../../const/RecoveryConst";

export namespace PopupCheckInstrumentHelper {
    export let FROM_TYPE1 = 1;
    export let FROM_TYPE2 = 2;
    export let addInstrumentDataDesc = function (data, fromType) {
        if (data == null) {
            return null;
        }
        var cellData: any = {};
        for (const key in data) {
            cellData[key] = data[key];
        }
        var desValue = [];
        if (fromType == PopupCheckInstrumentHelper.FROM_TYPE1 || fromType == PopupCheckInstrumentHelper.FROM_TYPE2) {
            var info = UserDataHelper.getInstrumentAttrInfo(data);
            var desInfo = TextHelper.getAttrInfoBySort(info);
            for (let i = 0; i < 2; i++) {
                var one = desInfo[i];
                if (one) {
                    var [attrName, attrValue] = TextHelper.getAttrBasicText(one.id, one.value);
                    attrName = TextHelper.expandTextByLen(attrName, 4);
                    var info:any = {
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
        if (fromType == PopupCheckInstrumentHelper.FROM_TYPE1) {
        }
        return result;
    };
    export let _FROM_TYPE1 = function () {
        var data = G_UserData.getInstrument().getRecoveryList();
        return data;
    };
    export let _FROM_TYPE2 = function () {
        var data = G_UserData.getInstrument().getTransformSrcList();
        return data;
    };
    export let getMaxCount = function (fromType) {
        if (fromType == PopupCheckInstrumentHelper.FROM_TYPE1) {
            return RecoveryConst.RECOVERY_INSTRUMENT_MAX;
        }
    };
}