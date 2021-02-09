import { G_ConfigLoader, G_UserData } from "../../init";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import { assert } from "../GlobleFunc";
import { stringUtil } from "../StringUtil";
import { table } from "../table";

export namespace ReturnServerDataHelper {
    export function getReturnAwardConfig(id) {
        var info = G_ConfigLoader.getConfig(ConfigNameConst.RETURN_AWARD).get(id);
        assert(info, stringUtil);
        return info;
    };
    export function getReturnAwardList() {
        var result = [];
        var [vipMax, goldMax] = G_UserData.getBase().getReturnAward();
        var vipLevel = G_UserData.getBase().getReturnVipLevel();
        var totalVip = 0;
        var Config = G_ConfigLoader.getConfig(ConfigNameConst.RETURN_AWARD)
        var vipKey = 'vip' + vipLevel;
        assert(Config.hasKey(vipKey), stringUtil);
        var returnSvr = G_UserData.getBase().getReturnSvr();
        var len = Config.length();
        for (var i = 1; i <= len; i++) {
            var info = Config.indexOf(i);
            var curValue = info[vipKey];
            var nextValue = null;
            if (i + 1 <= len) {
                var nextInfo = Config.indexOf(i + 1);
                nextValue = nextInfo[vipKey];
            }
            if (totalVip < vipMax) {
                totalVip = totalVip + curValue;
                var restVip = vipMax - totalVip;
                if (nextValue) {
                    if (restVip < nextValue) {
                        totalVip = totalVip + restVip;
                        curValue = curValue + restVip;
                    }
                } else {
                    curValue = curValue + restVip;
                }
                var isReceived = returnSvr && returnSvr.isReceivedWithId(info.id) || false;
                var isCanReceive = returnSvr && returnSvr.isCanReceive(info.id) || false;
                var unit = {
                    id: info.id,
                    level: info.level,
                    value: curValue,
                    isReceived: isReceived,
                    isCanReceive: isCanReceive
                };
                table.insert(result, unit);
            } else {
                break;
            }
        }
        result.sort(function (a, b) {
            if (a.isReceived != b.isReceived) {
                return a.isReceived == false ? -1 : 1;
            } else {
                return a.level - b.level;
            }
        });
        return result;
    }
}