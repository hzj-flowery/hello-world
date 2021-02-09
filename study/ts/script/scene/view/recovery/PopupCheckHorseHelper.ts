import { G_UserData } from "../../../init";
import { RecoveryConst } from "../../../const/RecoveryConst";

export namespace PopupCheckHorseHelper {
    export let FROM_TYPE1 = 1;
    export let addHorseDataDesc = function (data, fromType) {
        if (data == null) {
            return null;
        }
        var cellData: any = {};
        for (const key in data) {
            cellData[key] = data[key];
        }
        if (fromType == PopupCheckHorseHelper.FROM_TYPE1) {
        }
        return cellData;
    };
    export let getTotalDesInfo = function (fromType, foodData) {
        var result = {};
        if (fromType == PopupCheckHorseHelper.FROM_TYPE1) {
        }
        return result;
    };
    export let _FROM_TYPE1 = function () {
        var data = G_UserData.getHorse().getRecoveryList();
        return data;
    };
    export let getMaxCount = function (fromType) {
        if (fromType == PopupCheckHorseHelper.FROM_TYPE1) {
            return RecoveryConst.RECOVERY_HORSE_MAX;
        }
    };
}