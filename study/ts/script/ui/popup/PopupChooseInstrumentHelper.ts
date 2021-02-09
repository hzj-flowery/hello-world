import { InstrumentDataHelper } from "../../utils/data/InstrumentDataHelper";
import { Lang } from "../../lang/Lang";
import { G_UserData } from "../../init";
import { unpack, clone } from "../../utils/GlobleFunc";
import { UserDataHelper } from "../../utils/data/UserDataHelper";

export default class PopupChooseInstrumentHelper{
    public static readonly FROM_TYPE1 = 1;
    static readonly FROM_TYPE2 = 2;
    static readonly FROM_TYPE3 = 3;
    static readonly FROM_TYPE4 = 4;

    static BTN_DES = {
        [1]: 'instrument_btn_wear',
        [2]: 'instrument_btn_replace',
        [3]: 'reborn_list_btn',
        [4]: 'reborn_list_btn'
    };

    static addInstrumentDataDesc(instrumentData, fromType, showRP, curInstrumentData) {
        if (instrumentData == null) {
            return null;
        }
        var heroUnitData = UserDataHelper.getHeroDataWithInstrumentId(instrumentData.getId());
        var baseId, limitLevel, limitRedLevel;
        if (heroUnitData) {
            baseId = heroUnitData.getBase_id();
            limitLevel = heroUnitData.getLimit_level();
            limitRedLevel = heroUnitData.getLimit_rtg();
        }
        var cellData = (instrumentData);
        cellData.heroBaseId = baseId;
        cellData.limitLevel = limitLevel;
        cellData.limitRedLevel = limitRedLevel;
        cellData.btnDesc = Lang.get(PopupChooseInstrumentHelper.BTN_DES[fromType]);
        if (fromType == PopupChooseInstrumentHelper.FROM_TYPE2 && showRP == true) {
            cellData.showRP = PopupChooseInstrumentHelper._checkIsShowRP(instrumentData, curInstrumentData);
        }
        return cellData;
    }
    static _FROM_TYPE1(data) {
        return data;
    }
    static _FROM_TYPE2(data) {
        return data;
    }
    static _FROM_TYPE3(data) {
        return G_UserData.getInstrument().getRebornList();
    }
    static _FROM_TYPE4(param) {
        var result = unpack(param);
        var filterIds = result[0], tempData = result[1];
        var heroData = InstrumentDataHelper.getInstrumentTransformTarList(filterIds, tempData);
        return heroData;
    }

     static _checkIsShowRP(instrumentData, curInstrumentData) {
        var curLevel = curInstrumentData.getLevel();
        var level = instrumentData.getLevel();
        if (level != curLevel) {
            return level > curLevel;
        }
        return false;
    }

}
