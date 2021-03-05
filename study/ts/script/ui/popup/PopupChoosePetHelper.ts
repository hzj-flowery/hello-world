import { clone, unpack } from "../../utils/GlobleFunc";
import { Lang } from "../../lang/Lang";
import { G_UserData } from "../../init";

var BTN_DES = {
    1: 'pet_choose_btn_type1',
    2: 'pet_choose_btn_type2',
    3: 'pet_choose_btn_type3',
    4: 'pet_choose_btn_type4'
};

export default class PopupChoosePetHelper {

    public static FROM_TYPE1 = 1;
    public static FROM_TYPE2 = 2;
    public static FROM_TYPE3 = 3;
    public static FROM_TYPE4 = 4;
    public static _beReplacedPos: boolean = false;

    public static addPetDataDesc = function (petData, fromType, showRP, curEquipUnitData?, pos?) {
        if (petData == null) {
            return null;
        }
        var cellData: any = {};
        for (const key in petData) {
            cellData[key] = petData[key];
        }
        cellData.btnDesc = Lang.get(BTN_DES[fromType]);
        cellData.btnIsHightLight = false;
        cellData.btnEnable = true;
        cellData.btnShowRP = false;
        cellData.topImagePath = '';
        return cellData;
    };
    public static _FROM_TYPE1 = function (data) {
        var petData = G_UserData.getPet().getReplaceDataBySort();
        return petData;
    };
    public static _FROM_TYPE2 = function (param) {
        var petId = unpack(param)[0];
        if (petId && petId > 0) {
            var unitPetData = G_UserData.getPet().getUnitDataWithId(petId);
            var baseId = unitPetData.getBase_id();
            var petData = G_UserData.getPet().getReplaceDataBySort(baseId);
            return petData;
        } else {
            var petData = G_UserData.getPet().getReplaceDataBySort();
            return petData;
        }
    };
    public static _FROM_TYPE3 = function (param) {
        return PopupChoosePetHelper._FROM_TYPE2(param);
    };
    public static _FROM_TYPE4 = function (param) {
        PopupChoosePetHelper._beReplacedPos = null;
        var heroData = G_UserData.getPet().getRebornList();
        return heroData;
    };
    public static checkIsEmpty = function (fromType, param?) {
        var func = PopupChoosePetHelper['_FROM_TYPE' + fromType];
        if (func && typeof (func) == 'function') {
            var petData = func(param);
            return petData.length == 0;
        }
        return true;
    };
}