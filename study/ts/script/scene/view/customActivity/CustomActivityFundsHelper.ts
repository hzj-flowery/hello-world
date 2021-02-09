import { G_ConfigLoader } from "../../../init";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { ArraySort } from "../../../utils/handler";

export namespace CustomActivityFundsHelper {
    export function getFundsBaseInfo() {
        var funds = G_ConfigLoader.getConfig(ConfigNameConst.GM_FUND);
        var fundsList = [];
        for (var index = 0; index < funds.length(); index++) {
            var cellData = funds.indexOf(index);
            var group = cellData.group;
            fundsList[group] = fundsList[group] || [];
            fundsList[group].push(cellData);
            ArraySort(fundsList[group], function (item1, item2) {
                return item1.day < item2.day;
            });
        }
        return fundsList;
    };
    export function getVipPayConfigByIdOrderId(orderId) {
        var VipPay = G_ConfigLoader.getConfig(ConfigNameConst.VIP_PAY);
        var payCfg = VipPay.get(orderId);
        return payCfg;
    };
}