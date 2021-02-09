import { G_ServerTime, G_ConfigLoader } from "../../../init";
import { BaseConfig } from "../../../config/BaseConfig";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import ParameterIDConst from "../../../const/ParameterIDConst";

export namespace MainUIHelper {
    let CityTimeShowConfig: BaseConfig;

    export function init() {
        CityTimeShowConfig = G_ConfigLoader.getConfig(ConfigNameConst.CITY_TIMESHOW);
    }

    export function getCurrShowSceneId() {

        let currConfig = this.getCurrShowSceneConfig();

        var dayTimeStr: string = UserDataHelper.getParameter(ParameterIDConst.CITY_DAY_TIME);
        var hours: string[] = dayTimeStr.split('|');
        var minHour = parseInt(hours[0]);
        var maxHour = parseInt(hours[1]);
        var isInDaytime = false;
        var seconds = G_ServerTime.secondsFromToday();
        if (seconds >= minHour * 3600 && seconds <= maxHour * 3600) {
            isInDaytime = true;
        }
        return isInDaytime && currConfig.scene_day || currConfig.scene_night;
    }

    export function getCurrShowSceneConfig() {
        let dayOfYear = this._getDayOfYear();
        var currConfig = null;
        for (let i = 0; i < CityTimeShowConfig.length(); i++) {
            var config = CityTimeShowConfig.indexOf(i);
            if (dayOfYear >= config.start_day && dayOfYear <= config.end_day) {
                currConfig = config;
            }
        }
        return currConfig;
    }

    export function _getDayOfYear(): number {
        var now = G_ServerTime.getDateObject();
        var start = new Date(now.getFullYear(), 0, 0);
        var diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
        var oneDay = 1000 * 60 * 60 * 24;
        var dayOfYear = Math.floor(diff / oneDay);
        return dayOfYear;
    }
}