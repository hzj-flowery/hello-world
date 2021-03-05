import { Lang } from "../../../lang/Lang";
import { Colors, G_UserData } from "../../../init";
import { RecoveryConst } from "../../../const/RecoveryConst";

export namespace PopupCheckPetHelper {
    export let FROM_TYPE1 = 1;
    export let FROM_TYPE2 = 2;
    export let addPetDataDesc = function (petData, fromType) {
        if (petData == null) {
            return null;
        }
        var cellData: any = {};
        for (const key in petData) {
            cellData[key] = petData[key];
        }
        cellData.isYoke = false;
        var desValue = [];
        if (fromType == PopupCheckPetHelper.FROM_TYPE1) {
            let info1 = {
                des: Lang.get('hero_check_cell_des_1'),
                value: Lang.get('hero_check_cell_value_1', { level: petData.getLevel() })
            };
            let info2 = {
                des: Lang.get('hero_check_cell_des_2'),
                value: petData.getConfig().exp,
                colorValue: Colors.BRIGHT_BG_GREEN
            };
            desValue.push(info1);
            desValue.push(info2);
        } else if (fromType == PopupCheckPetHelper.FROM_TYPE2) {
            let info1 = {
                des: Lang.get('pet_list_cell_level_des'),
                value: Lang.get('pet_txt_level', { level: petData.getLevel() })
            };
            let info2 = {
                des: Lang.get('pet_list_cell_star_des'),
                value: Lang.get('pet_txt_star_level', { level: petData.getStar() })
            };
            desValue.push(info1);
            desValue.push(info2);
        }
        cellData.desValue = desValue;
        return cellData;
    };
    export let getTotalDesInfo = function (fromType, foodData) {
        var result = {};
        if (fromType == PopupCheckPetHelper.FROM_TYPE1) {
        } else if (fromType == PopupCheckPetHelper.FROM_TYPE2) {
        }
        return result;
    };
    export let _FROM_TYPE2 = function () {
        var data = G_UserData.getPet().getRecoveryList();
        return data;
    };
    export let getMaxCount = function (fromType) {
        if (fromType == PopupCheckPetHelper.FROM_TYPE1) {
            var userLevel = G_UserData.getBase().getLevel();
            var maxCount = userLevel < 50 && 6 || 10;
            return maxCount;
        } else if (fromType == PopupCheckPetHelper.FROM_TYPE2) {
            return RecoveryConst.RECOVERY_PET_MAX;
        }
    };
}