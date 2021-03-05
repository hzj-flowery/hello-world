import { G_UserData, G_ServerTime, G_ConfigLoader } from "../../../init";
import { GuildAnswerConst } from "../../../const/GuildAnswerConst";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { GuildServerAnswerHelper } from "../guildServerAnswer/GuildServerAnswerHelper";

export namespace GuildAnswerHelper {
    export function getGuildAnswerStartTime() {
        if (!GuildAnswerHelper.isTodayOpen()) {
            return 0;
        }
        return G_UserData.getGuildAnswer().getStartTime();
    };
    export function getGuildAnswerTotalTime() {
        var respondTime = GuildAnswerHelper.getRespondTime();
        var awardTime = GuildAnswerHelper.getAwardTime();
        var time = respondTime + awardTime;
        var totalTime = GuildAnswerConst.QUESTION_NUM * time;
        return totalTime;
    };
    export function getGuildAnswerEndTime() {
        var startTime = GuildAnswerHelper.getGuildAnswerStartTime();
        var totalTime = GuildAnswerHelper.getGuildAnswerTotalTime();
        return startTime + totalTime;
    };
    export function getGuildAnswerStartIndex() {
        var guildData = G_UserData.getGuild().getMyGuild();
        if (!guildData) {
            return 3;
        }
        return guildData.getAnswer_time();
    };
    export function getRespondTime() {
        var config = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(145);
        console.assert(config != null, 'can not find ParamConfig id = 145');
        return Number(config.content);
    };
    export function getAwardTime() {
        var config = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(146);
        console.assert(config != null, 'can not find ParamConfig id = 146');
        return Number(config.content);
    };
    export function getRightPoint() {
        var config = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(148);
        console.assert(config != null, 'can not find ParamConfig id = 148');
        return Number(config.content);
    };
    export function getWrongPoint() {
        var config = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(149);
        console.assert(config != null, 'can not find ParamConfig id = 149');
        return Number(config.content);
    };
    export function getAuctionAwardRank() {
        var config = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(151);
        console.assert(config != null, 'can not find ParamConfig id = 144');
        return Number(config.content);
    };
    export function getGuildAnswerChangeTimeCount() {
        var guildData = G_UserData.getGuild().getMyGuild();
        if (!guildData) {
            console.assert(false, 'guildData == nil');
            return 0;
        }
        return guildData.getAnswer_time_reset_cnt();
    };
    export function getGuildId() {
        var guildData = G_UserData.getGuild().getMyGuild();
        if (!guildData) {
            console.assert(false, 'guildData == nil');
            return 0;
        }
        return guildData.getId();
    };
    export function getCurQuestionIndex(questions) {
        var startTime = GuildAnswerHelper.getGuildAnswerStartTime();
        var respondTime = GuildAnswerHelper.getRespondTime();
        var awardTime = GuildAnswerHelper.getAwardTime();
        var curTime = G_ServerTime.getTime();
        var tempTime = startTime;
        for (let k in questions) {
            var v = questions[k];
            if (curTime < tempTime + respondTime) {
                return [
                    v.getQuestionNo(),
                    false
                ];
            }
            tempTime = tempTime + respondTime;
            if (curTime < tempTime + awardTime) {
                return [
                    v.getQuestionNo(),
                    true
                ];
            }
            tempTime = tempTime + awardTime;
        }
        return [null, null];
    };
    export function getQuestionBeginTime(question) {
        var startTime = GuildAnswerHelper.getGuildAnswerStartTime();
        var respondTime = GuildAnswerHelper.getRespondTime();
        var awardTime = GuildAnswerHelper.getAwardTime();
        return startTime + (question.getQuestionNo() - 1) * (respondTime + awardTime);
    };
    export function getPreviewRankRewards(randomAwards) {
        var allAwards = [];
        var openServerDayNum = G_UserData.getBase().getOpenServerDayNum();
        var GuildAnswerAward = G_ConfigLoader.getConfig('answer_rank_award');
        var rewardConfig = null;
        for (var index = 0; index < GuildAnswerAward.length(); index += 1) {
            var config = GuildAnswerAward.indexOf(index);
            if (openServerDayNum >= config.day_min && openServerDayNum <= config.day_max) {
                rewardConfig = config;
                break;
            }
        }
        var rewardList = {};
        if (rewardConfig != null) {
            rewardList = UserDataHelper.makeRewards(rewardConfig, 7);
        }
        for (let k in randomAwards || []) {
            var v = (randomAwards || [])[k];
            allAwards.push(v);
        }
        for (let k in rewardList) {
            var v = rewardList[k];
            allAwards.push(v);
        }
        return allAwards;
    };
    export function isTodayShowEndDialog() {
        var time = Number(G_UserData.getUserConfig().getConfigValue('guildAnswer')) || 0;
        var date1 = G_ServerTime.getDateObject(time);
        var date2 = G_ServerTime.getDateObject();
        if (date1.getDay() == date2.getDay()) {
            return true;
        }
        return false;
    };
    export function setTodayShowDialogTime() {
        var curTime = G_ServerTime.getTime();
        G_UserData.getUserConfig().setConfigValue('guildAnswer', curTime);
    };
    export function isTodayOpen() {
        return !GuildServerAnswerHelper.isTodayOpen();
    };
};
