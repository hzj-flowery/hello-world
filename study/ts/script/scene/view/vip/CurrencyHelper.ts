import { DataConst } from "../../../const/DataConst";
import { G_ParameterIDConst } from "../../../const/ParameterIDConst";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";

export namespace CurrencyHelper {
    export function getCurJadeNum() {
        var num = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2);
        return num;
    }
    export function getDiamondExchangeRadio() {
        var radio = UserDataHelper.getParameter(G_ParameterIDConst.DIAMOND_EXCHANGE_RADIO);
        return radio;
    }
}