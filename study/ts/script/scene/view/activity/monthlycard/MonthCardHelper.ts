import { G_ConfigLoader } from "../../../../init";
import { ConfigNameConst } from "../../../../const/ConfigNameConst";
import { LogicCheckHelper } from "../../../../utils/LogicCheckHelper";
import { TypeConvertHelper } from "../../../../utils/TypeConvertHelper";

export class MonthCardHelper{
    static getDropAwards() {
        var ParamConfig = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        var config:string = ParamConfig.get(604).content;
        var awardsList = [];
        var data = config.split(',');
        for (let index in data) {
            var value = data[index];
            var award = value.split('|');
            if (award && award.length == 2) {
                var awardData = {
                    openDay: parseInt(award[0]),
                    value: parseInt(award[1])
                };
                awardsList.push(awardData);
            }
        }
        return awardsList;
    }
    static getCurCanDropAwrads() {
        var awardsList = MonthCardHelper.getDropAwards();
        var canDropList = [];
        for (let k in awardsList) {
            var v = awardsList[k];
            if (LogicCheckHelper.enoughOpenDay(v.openDay)) {
                var data = {
                    type: TypeConvertHelper.TYPE_ITEM,
                    value: parseInt(v.value),
                    size: 1
                };
                canDropList.push(data);
            }
        }
        return canDropList;
    }
}
