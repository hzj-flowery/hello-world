import { LogicCheckHelper } from "../../../utils/LogicCheckHelper";
import { FunctionConst } from "../../../const/FunctionConst";
import { G_ServerTime, G_UserData, G_ConfigLoader, Colors } from "../../../init";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { GuildAnswerConst } from "../../../const/GuildAnswerConst";
import { FunctionCheck } from "../../../utils/logic/FunctionCheck";

export namespace GuildServerAnswerHelper {
    export const TOTAL_TIME = 350; 
    export function isTodayOpen() {
        var retb = false;
        var isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_GUILD_SERVER_ANSWER)[0];
        if (!isOpen) {
            return retb;
        }
        var date = G_ServerTime.getDateObject(null, 0);
        var days = getOpenDays();
        let day = date.getDay();
        day = day == 0 ? 7 : day;
        if (days[day]) {
            return !retb;
        }
        return retb;
    };
    export function getServerAnswerStartTime() {
        return G_UserData.getGuildServerAnswer().getNewStartTime();
    };
    export function getServerAnswerEndTime() {
        var startTime = getServerAnswerStartTime();
        var totalTime = TOTAL_TIME;
        return startTime + totalTime;
    };
    export function getOpenDays() {
        var ParamConfig = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        var config = ParamConfig.get(616);
        console.assert(config != null, 'can not find ParamConfig id = 616');
        var daysString = config.content.split('|');
        var days = {};
        for (let k in daysString) {
            var v = daysString[k];
            var curDay = Number(v);
            console.assert(curDay != null, 'ParamConfig  error id = 231');
            if (curDay > 0) {
                // curDay = curDay + 1;
                // if (curDay > 7) {
                //     curDay = 1;
                // }
                days[curDay] = true;
            }
        }
        return days;
    };
    export function getServerAnswerSelfIsReadSuccess() {
        var list = G_UserData.getGuildServerAnswer().getGuildServerAnswerPlayerDatas();
        for (let k in list) {
            var v = list[k];
            if (v.getUser_id() == G_UserData.getBase().getId()) {
                return true;
            }
        }
        return false;
    };
    export function getServerAnswerMaxKeng() {
        var newAnswerPoint = G_ConfigLoader.getConfig(ConfigNameConst.NEW_ANSWER_POINT);
        return newAnswerPoint.length() / 2;
    };
    export function getPlayerPointMaps() {
        var newAnswerPoint = G_ConfigLoader.getConfig(ConfigNameConst.NEW_ANSWER_POINT);
        var leftposMaps = [];
        var rightposMaps = [];
        for (var index = 0; index < newAnswerPoint.length(); index++) {
            var config = newAnswerPoint.indexOf(index);
            if (config.type == 1) {
                leftposMaps.push(config);
            } else {
                rightposMaps.push(config);
            }
        }
        return [
            leftposMaps,
            rightposMaps
        ];
    };
    export function getCurrentVisibleQuesNo() {
        var curQues: any = G_UserData.getGuildServerAnswer().getCurQuestion();
        var curNo = curQues.getQuestionNo() % GuildAnswerConst.WAVE_MAX_NUMS;
        if (curNo == 0) {
            curNo = GuildAnswerConst.WAVE_MAX_NUMS;
        }
        return curNo;
    };
    export function getMyAndMyGuildRankData(personRanks, guildRanks) {
        var ranks = G_UserData.getGuildServerAnswer().getRanks();
        var myUser_id = G_UserData.getBase().getId();
        var myGuild_id = G_UserData.getGuild().getMyGuild().getId();
        var myRankData = null;
        var myGuildRankData = null;
        for (let k in personRanks) {
            var v = personRanks[k];
            if (v.getUser_id() == myUser_id) {
                myRankData = v;
            }
        }
        for (let k in guildRanks) {
            var v = guildRanks[k];
            if (v.getGuild_id() == myGuild_id) {
                myGuildRankData = v;
            }
        }
        return [
            myRankData,
            myGuildRankData
        ];
    };
    export function getNameColor(data) {
        var myUser_id = G_UserData.getBase().getId();
        var myGuild_id = G_UserData.getGuild().getMyGuild().getId();
        var isSelf = data.getUser_id() == myUser_id, isSameGuild = data.getGuild_id() == myGuild_id;
        var color = null;
        var colorOutline = null;
        if (isSelf) {
            color = Colors.GUILD_WAR_MY_COLOR;
            colorOutline = Colors.GUILD_WAR_MY_COLOR_OUTLINE;
        } else if (isSameGuild) {
            color = Colors.GUILD_WAR_SAME_GUILD_COLOR;
            colorOutline = Colors.GUILD_WAR_SAME_GUILD_COLOR_OUTLINE;
        } else {
            color = Colors.GUILD_WAR_ENEMY_COLOR;
            colorOutline = Colors.GUILD_WAR_ENEMY_COLOR_OUTLINE;
        }
        return [
            color,
            colorOutline
        ];
    };
    export function getServerAnswerSortPlayers() {
        var sortList = [];
        var list = G_UserData.getGuildServerAnswer().getGuildServerAnswerPlayerDatas();
        for (let _ in list) {
            var data = list[_];
            var sort = data.getSort();
            sortList[sort] = sortList[sort] || [];
            sortList[sort].push(data);
        }
        var realSortList = [];
        for (var i = 2; i >= 1; i += -1) {
            if (sortList[i]) {
                for (let _ in sortList[i]) {
                    var data = sortList[i][_];
                    realSortList.push(data);
                    if (realSortList.length >= getServerAnswerMaxKeng()) {
                        break;
                    }
                }
            }
            if (realSortList.length >= getServerAnswerMaxKeng()) {
                break;
            }
        }
        return realSortList;
    };
    export function getCurWaves() {
        var curQues: any = G_UserData.getGuildServerAnswer().getCurQuestion();
        var waves = curQues.getQuestionNo() / GuildAnswerConst.WAVE_MAX_NUMS;
        waves = Math.ceil(waves);
        return waves;
    };
    export function needReset() {
        var curQues: any = G_UserData.getGuildServerAnswer().getCurQuestion();
        return curQues.getQuestionNo() <= GuildAnswerConst.WAVE_MAX_NUMS * (getMaxWaves() - 1) + 1;
    };
    export function getSelfUnitData() {
        var list = G_UserData.getGuildServerAnswer().getGuildServerAnswerPlayerDatas();
        for (let _ in list) {
            var data = list[_];
            if (data.isSelf()) {
                return data;
            }
        }
    };
    export function isHaveRightAnswerPlayer() {
        var curQues: any = G_UserData.getGuildServerAnswer().getCurQuestion();
        var list = G_UserData.getGuildServerAnswer().getGuildServerAnswerPlayerDatas();
        for (let _ in list) {
            var data = list[_];
            if (data.getSide() == curQues.getRightAnswer()) {
                return true;
            }
        }
        return false;
    };
    export function getMaxWaves() {
        var ParamConfig = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        var config = ParamConfig.get(609);
        console.assert(config, 'parameter not found config by ' + 609);
        return Number(config.content);
    };
    export function getNextOpenTime() {
        var curTime = G_ServerTime.getTime();
        var ZERO_TO_18 = 64800;
        var startTime = ZERO_TO_18 + G_ServerTime.secondsFromZero();
        if (isTodayOpen()) {
            if (curTime < startTime) {
                return startTime;
            }
        }
        var date = G_ServerTime.getDateObject();
        var days = getOpenDays();
        let day = date.getDay();
        day = day == 0 ? 7 : day;
        var nextDayNum = 1;
        for (var i = 1; i <= 7; i++) {
            var wDay = day + i;
            if (wDay > 7) {
                wDay = 1;
            }
            if (days[wDay]) {
                nextDayNum = i;
                break;
            }
        }
        var t = nextDayNum * 24 * 60 * 60 + startTime;
        return t;
    };
    export function getAnswerAwards(id) {
        var config = G_ConfigLoader.getConfig(ConfigNameConst.NEW_ANSWER_REWARD).get(id);
        var awards = [];
        var item = {
            type: config.right_type1,
            value: config.right_resource1,
            size: config.right_size1
        };
        awards.push(item);
        return awards;
    };
};
