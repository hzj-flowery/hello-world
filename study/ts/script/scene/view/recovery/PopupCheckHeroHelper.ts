import { Lang } from "../../../lang/Lang";
import { Colors, G_UserData } from "../../../init";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { RecoveryConst } from "../../../const/RecoveryConst";

export namespace PopupCheckHeroHelper {

    export let FROM_TYPE1 = 1;
    export let FROM_TYPE2 = 2;
    export let FROM_TYPE3 = 3;

    export let addHeroDataDesc = function (heroData, fromType): any {
        if (heroData == null) {
            return null;
        }
        var cellData: any = {};
        for (const key in heroData) {
            cellData[key] = heroData[key];
        }
        cellData.isYoke = false;
        var desValue: any[] = [];
        if (fromType == PopupCheckHeroHelper.FROM_TYPE1) {
            let info1 = {
                des: Lang.get('hero_check_cell_des_1'),
                value: Lang.get('hero_check_cell_value_1', { level: heroData.getLevel() })
            };
            let info2 = {
                des: Lang.get('hero_check_cell_des_2'),
                value: heroData.getConfig().exp,
                colorValue: Colors.BRIGHT_BG_GREEN
            };
            desValue.push(info1);
            desValue.push(info2);
        } else if (fromType == PopupCheckHeroHelper.FROM_TYPE2) {
            let info1 = {
                des: Lang.get('hero_list_cell_level_des'),
                value: Lang.get('hero_txt_level', { level: heroData.getLevel() })
            };
            let [awakeStar, awakeLevel] = UserDataHelper.convertAwakeLevel(heroData.getAwaken_level());
            let info2 = {
                des: Lang.get('hero_list_cell_awake_des'),
                value: Lang.get('hero_awake_star_level', {
                    star: awakeStar,
                    level: awakeLevel
                })
            };
            desValue.push(info1);
            desValue.push(info2);
            cellData.isYoke = UserDataHelper.isHaveYokeWithHeroBaseId(heroData.getBase_id());
        } else if (fromType == PopupCheckHeroHelper.FROM_TYPE3) {
            var info1 = {
                des: Lang.get('hero_list_cell_level_des'),
                value: Lang.get('hero_txt_level', { level: heroData.getLevel() })
            };
            var [awakeStar, awakeLevel] = UserDataHelper.convertAwakeLevel(heroData.getAwaken_level());
            var info2 = {
                des: Lang.get('hero_list_cell_awake_des'),
                value: Lang.get('hero_awake_star_level', {
                    star: awakeStar,
                    level: awakeLevel
                })
            };
            desValue.push(info1);
            desValue.push(info2);
            var yokeCount = UserDataHelper.getWillActivateYokeCount(heroData.getBase_id());
            cellData.isYoke = yokeCount > 0;
        }
        cellData.desValue = desValue;
        return cellData;
    };
    export let getTotalDesInfo = function (fromType, foodData) {
        var result = {};
        if (fromType == PopupCheckHeroHelper.FROM_TYPE1) {
        } else if (fromType == PopupCheckHeroHelper.FROM_TYPE2) {
        }
        return result;
    };
    export let _FROM_TYPE2 = function () {
        var data = G_UserData.getHero().getRecoveryList();
        return data;
    };
    export let _FROM_TYPE3 = function () {
        var data = G_UserData.getHero().getTransformSrcList();
        return data;
    };
    export let getMaxCount = function (fromType) {
        if (fromType == PopupCheckHeroHelper.FROM_TYPE1) {
            var userLevel = G_UserData.getBase().getLevel();
            var maxCount = userLevel < 50 && 6 || 10;
            return maxCount;
        } else if (fromType == PopupCheckHeroHelper.FROM_TYPE2) {
            return RecoveryConst.RECOVERY_HERO_MAX;
        }
    };
}