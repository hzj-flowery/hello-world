import { G_ConfigLoader, G_UserData, G_ServerTime, G_Prompt } from "../../init";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import { Lang } from "../../lang/Lang";
import { TimeConst } from "../../const/TimeConst";

export namespace DailyDungeonCheck {
    export function isDailyDungeonCanFight (type, popHint) {
        let success = true;
        let popFunc = null;
        [success, popFunc] = DailyDungeonCheck.isDailyDungeonLevelEnough(type, popHint);
        if (success) {
            [success, popFunc] = DailyDungeonCheck.isDailyDungeonInOpenTime(type, popHint);
        }
        if (success) {
            [success, popFunc] = DailyDungeonCheck.isDailyDungeonCountEnough(type, popHint);
        }
        return [
            success,
            popFunc
        ];
    };
    export function isDailyDungeonLevelEnough (type, popHint) {
        let success = true;
        let popFunc = null;
        let DailyDungeonType = G_ConfigLoader.getConfig(ConfigNameConst.DAILY_DUNGEON_TYPE);
        let DailyDungeon = G_ConfigLoader.getConfig(ConfigNameConst.DAILY_DUNGEON);
        let dailyInfo = DailyDungeonType.get(type);
        console.assert(dailyInfo, 'daily_dungeon_type not find id ' + type);
        let dailyDungeonCount = DailyDungeon.length();
        let firstLevel = 0;
        for (let i = 0; i < dailyDungeonCount; i++) {
            let info = DailyDungeon.indexOf(i);
            if (info.type == dailyInfo.id && info.pre_id == 0) {
                firstLevel = info.level;
                break;
            }
        }
        let myLevel = G_UserData.getBase().getLevel();
        console.warn(' ------------- ' + firstLevel);
        if (myLevel < firstLevel) {
            success = false;
            popFunc = function () {
                G_Prompt.showTip(Lang.get('daily_open_tips', {
                    count: firstLevel,
                    name: dailyInfo.name
                }));
            };
        }
        if (popHint && popFunc) {
            popFunc();
        }
        return [
            success,
            popFunc
        ];
    };
    export function isDailyDungeonInOpenTime (type, popHint) {
        let DailyDungeon = G_ConfigLoader.getConfig(ConfigNameConst.DAILY_DUNGEON);
        let DailyDungeonType = G_ConfigLoader.getConfig(ConfigNameConst.DAILY_DUNGEON_TYPE);
        
        let getFirstOpenLevelFunc = function (type) {
            let DailyDungeonCount = DailyDungeon.length();
            for (let i = 0; i < DailyDungeonCount; i++) {
                let info = DailyDungeon.indexOf(i);
                if (info.type == type && info.pre_id == 0) {
                    return info.level;
                }
            }
        };
        let getOpenDateStr = function (openDayData) {
            let openDays = [];
            for (let i in openDayData) {
                let open = openDayData[i];
                if (open) {
                    openDays.push[i]
                }
            }
            let sortfunction = function (obj1, obj2) {
                if (obj1 == 1) {
                    return 1;
                }

                if (obj2 == 1) {
                    return  -1;
                }
                return obj2 - obj1;
            };
            openDays.sort(sortfunction);
            let days = openDays;
            let strDays = '';
            for (let i = 0; i < days.length - 1; i++) {
                strDays = strDays + (Lang.get('open_days')[days[i]] + ', ');
            }
            strDays = strDays + Lang.get('open_days')[days[days.length]];
            return strDays;
        };
        let success = true;
        let popFunc = null;
        let firstLevel = getFirstOpenLevelFunc(type);
        let todayLevel = G_UserData.getBase().getToday_init_level();
        let nowLevel = G_UserData.getBase().getLevel();
        if (todayLevel < firstLevel && nowLevel >= firstLevel) {
            return [true];
        }
        let dailyInfo = DailyDungeonType.get(type);
        console.assert(dailyInfo, 'daily_dungeon_type not find id ' + type);
        let openDays = [];
        for (let i = 0; i < dailyInfo.week_open_queue.length; i++) {
            openDays[i] = dailyInfo.week_open_queue.charCodeAt(i) == 49;
        }
        let data = G_ServerTime.getDateObject(null, TimeConst.RESET_TIME_SECOND);
        let day = data.getDay();
        day = day == 7 ? 0 : day;
        if (!openDays[day]) {
            success = false;
            let strDays = getOpenDateStr(openDays);
            let tipString = Lang.get('open_string', { str: strDays });
            console.warn(' ---------------- &&66 ' + tipString);
            popFunc = function () {
                G_Prompt.showTip(tipString);
            };
        }
        if (popHint && popFunc) {
            popFunc();
        }
        return [
            success,
            popFunc
        ];
    };
    export function isDailyDungeonCountEnough (type, popHint) {
        let success = true;
        let popFunc = null;
        let remainCount = G_UserData.getDailyDungeonData().getRemainCount(type);
        if (remainCount <= 0) {
            success = false;
            popFunc = function () {
                G_Prompt.showTip(Lang.get('challenge_no_count'));
            };
        }
        if (popHint && popFunc) {
            popFunc();
        }
        return [
            success,
            popFunc
        ];
    };

};