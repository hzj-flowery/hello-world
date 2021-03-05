import { HorseDataHelper } from "../../utils/data/HorseDataHelper";
import { Lang } from "../../lang/Lang";
import { G_UserData } from "../../init";
import { clone2 } from "../../utils/GlobleFunc";

export namespace PopupChooseHorseHelper {
    export let FROM_TYPE1 = 1;
    export let FROM_TYPE2 = 2;
    export let FROM_TYPE3 = 3;
    export let addHorseDataDesc = function (horseData, fromType) {
        if (horseData == null) {
            return null;
        }
        var BTN_DES = {
            1: 'horse_btn_wear',
            2: 'horse_btn_replace',
            3: 'reborn_list_btn'
        };
        var heroUnitData = HorseDataHelper.getHeroDataWithHorseId(horseData.getId());
        var baseId, limitLevel, limitRedLevel;
        if (heroUnitData) {
            baseId = heroUnitData.getBase_id();
            limitLevel = heroUnitData.getLimit_level();
            limitRedLevel = heroUnitData.getLimit_rtg();
        }
        var cellData = clone2(horseData);
        cellData.heroBaseId = baseId;
        cellData.limitLevel = limitLevel;
        cellData.limitRedLevel = limitRedLevel;

        cellData.btnDesc = Lang.get(BTN_DES[fromType]);
        if (cellData.isEffective == false) {
            cellData.strSuit = HorseDataHelper.getHorseConfig(horseData.getBase_id()).type;
        }
        return cellData;
    };
    export let _FROM_TYPE1 = function (data) {
        return data;
    };
    export let _FROM_TYPE2 = function (data) {
        return data;
    };
    export let _FROM_TYPE3 = function (data) {
        return G_UserData.getHorse().getRebornList();
    };
    export let checkIsEmpty = function (fromType, param?) {
        var func = PopupChooseHorseHelper['_FROM_TYPE' + fromType];
        if (func && typeof (func) == 'function') {
            var herosData = func(param);
            return herosData.length == 0;
        }
        return true;
    };
}