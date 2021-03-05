import { G_ServerTime } from "../../../init";
import { Lang } from "../../../lang/Lang";

export namespace PopUpGuildFlagSettingHelper {
    var currentTouchIndexId = 0;
    export const getCurrentTouchIndex = function () {
        return currentTouchIndexId;
    };
    export const setCurrentTouchIndex = function (indexId) {
        currentTouchIndexId = indexId;
    };
    export const getExpireTimeString = function (expireTime) {
        var leftTime = expireTime - G_ServerTime.getTime();
        var [day, hour, min, second] = G_ServerTime.convertSecondToDayHourMinSecond(leftTime);
        var dateStr = (Lang.get('honor_expire_time').format(day));
        if (day < 1) {
            dateStr = ('%02d:%02d:%02d').format(hour, min, second);
        }
        return [
            dateStr,
            day < 1
        ];
    };
};