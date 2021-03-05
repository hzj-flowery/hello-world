import { G_UserData, G_ConfigLoader, G_ServerTime } from "../../init";
import { ArraySort } from "../handler";
import { UserDataHelper } from "./UserDataHelper";
import ParameterIDConst from "../../const/ParameterIDConst";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import { GuildDungeonConst } from "../../const/GuildDungeonConst";
import { Lang } from "../../lang/Lang";

export namespace GuildDungeonDataHelper {
    export function getMyGuildDungeonRankData  () {
        let myGuild = G_UserData.getGuild().getMyGuild();
        let rankData = G_UserData.getGuildDungeon().getMyGuildRankData();
        rankData.setName(myGuild.getName());
        rankData.setGuild_id(myGuild.getId());
        return rankData;
    };
    export function getGuildDungeonSortedRankList  () {
        let dataList = G_UserData.getGuildDungeon().getDungeonRankDataList();
        let list = [];
        for (let k in dataList) {
            let v = dataList[k];
            list.push(v);
        }
        let sortFunc = function (obj1, obj2) {
            return obj1.getRank() < obj2.getRank();
        };
        ArraySort(list, sortFunc);
        return list;
    };
    export function getGuildDungeonTotalPoint  () {
        let dataList = G_UserData.getGuild().getGuildMemberList();
        let point = 0;
        for (let k in dataList) {
            let v = dataList[k];
            point = point + v.getDungeon_point();
        }
        return point;
    };
    export function getGuildDungeonRemainTotalFightCount  () {
        let atkTime = UserDataHelper.getParameter(ParameterIDConst.GUILD_STAGE_ATKTIME);
        let dungeonInfoDataList = G_UserData.getGuildDungeon().getDungeonInfoDataList();
        let dungeonRecordDataList = G_UserData.getGuildDungeon().getDungeonRecordDataList();
        let remainTotalFightCount = GuildDungeonDataHelper.getTableNum(dungeonInfoDataList) * atkTime - GuildDungeonDataHelper.getTableNum(dungeonRecordDataList);
        return remainTotalFightCount;
    };
    export function getTableNum  (t) {
        let count = 0;
        for (let k in t) {
            let v = t[k];
            count = count + 1;
        }
        return count;
    };
    export function getGuildDungeonSortedRecordList  () {
        let dungeonRecordDataList = G_UserData.getGuildDungeon().getDungeonRecordDataList();
        let list = [];
        for (let k in dungeonRecordDataList) {
            let v = dungeonRecordDataList[k];
            list.push(v);
        }
        let sortFunc = function (obj1, obj2) {
            if (obj1.getTime() != obj2.getTime()) {
                return obj1.getTime() > obj2.getTime();
            }
            if (obj1.getTarget_rank() != obj2.getTarget_rank()) {
                return obj1.getTarget_rank() < obj2.getTarget_rank();
            }
            return obj1.getPlayer_id() < obj2.getPlayer_id();
        };
        ArraySort(list, sortFunc);
        let newList = [];
        let guildData = G_UserData.getGuild();
        for (let k in list) {
            let v = list[k];
            let newValue = {
                record: v,
                member: null
            };
            newValue.member = guildData.getGuildMemberDataWithId(v.getPlayer_id());
            newList.push(newValue);
        }
        return newList;
    };
    export function getGuildDungeonMonsterList  () {
        let guildData = G_UserData.getGuild();
        let guildDungeo = G_UserData.getGuildDungeon();
        let dungeonInfoDataList = guildDungeo.getDungeonInfoDataList();
        let list = [];
        for (let k in dungeonInfoDataList) {
            let v = dungeonInfoDataList[k];
            let newValue = {
                monsterBattleUser: v.getDungeon(),
                rank: v.getRank(),
                name: '',
                recordList: guildDungeo.getDungeonRecordDataByRank(v.getRank()),
                memberList: {}
            };
            newValue.name = newValue.monsterBattleUser.getUser().getName();
            for (let k in newValue.recordList) {
                let v = newValue.recordList[k];
                newValue.memberList[k] = guildData.getGuildMemberDataWithId(v.getPlayer_id());
            }
            list.push(newValue);
        }
        let sortFunc = function (obj1, obj2) {
            return obj1.rank < obj2.rank;
        };
        ArraySort(list, sortFunc);
        return list;
    };
    export function getGuildDungeonMonsterData  (dungeonRank) {
        let guildData = G_UserData.getGuild();
        let guildDungeo = G_UserData.getGuildDungeon();
        let dungeonInfo = guildDungeo.getDungeonInfoDataByRank(dungeonRank);
        if (!dungeonInfo) {
            return;
        }
        let newValue = {
            monsterBattleUser: dungeonInfo.getDungeon(),
            rank: dungeonRank,
            name: '',
            recordList: guildDungeo.getDungeonRecordDataByRank(dungeonRank),
            memberList: {}
        };
        newValue.name = newValue.monsterBattleUser.getUser().getName();
        for (let k in newValue.recordList) {
            let v = newValue.recordList[k];
            newValue.memberList[k] = guildData.getGuildMemberDataWithId(v.getPlayer_id());
        }
        return newValue;
    };
    export function getGuildDungeonMemberList  () {
        let memberList = G_UserData.getGuild().getGuildMemberList();
        let guildDungeo = G_UserData.getGuildDungeon();
        let list = [];
        for (let k in memberList) {
            let v = memberList[k];
            let newValue = {
                member: v,
                rank: v.getRankPower(),
                recordList: guildDungeo.getDungeonRecordDataByPlayerId(v.getUid())
            };
            list.push(newValue);
        }
        let sortFunc = function (obj1, obj2) {
            return obj1.rank < obj2.rank;
        };
        ArraySort(list, sortFunc);
        return list;
    };
    export function hasGuildDungeonMonsterData  () {
        let guildDungeo = G_UserData.getGuildDungeon();
        let list = guildDungeo.getDungeonInfoDataList();
        return GuildDungeonDataHelper.getTableNum(list) > 0;
    };
    export function getGuildDungeonPreviewRewards  () {
        let openServerDayNum = G_UserData.getBase().getOpenServerDayNum();
        let GuildStageAward = G_ConfigLoader.getConfig(ConfigNameConst.GUILD_STAGE_AWARD);
        let rewardConfig = null;
        for (let index = 0; index < GuildStageAward.length(); index += 1) {
            let config = GuildStageAward.indexOf(index);
            if (openServerDayNum >= config.day_min && openServerDayNum <= config.day_max) {
                rewardConfig = config;
                break;
            }
        }
        if (!rewardConfig) {
            rewardConfig = GuildStageAward.indexOf(GuildStageAward.length());
        }
        let rewardList = {};
        if (rewardConfig != null) {
            rewardList = UserDataHelper.makeRewards(rewardConfig, GuildDungeonConst.AUCTION_REWARD_NUM);
        }
        return rewardList;
    };
    export function getGuildDungeonTalk  (monsterBattleUser) {
        let fightPowerRatio = monsterBattleUser.getUser().getPower() * 1000 / G_UserData.getBase().getPower();
        let showConfig = null;
        let GuildStageTalk = G_ConfigLoader.getConfig(ConfigNameConst.GUILD_STAGE_TALK);
        for (let index = 0; index < GuildStageTalk.length(); index += 1) {
            let config = GuildStageTalk.indexOf(index);
            if (fightPowerRatio >= config.combat_min) {
                showConfig = config;
                break;
            }
        }
        let talkNum = 5;
        let talkIndex = Math.randInt(1, talkNum);
        return showConfig['talk' + talkIndex];
    };
    export function getGuildDungeonStartTimeAndEndTime  ():any[] {
        let stageOpenTime = UserDataHelper.getParameter(ParameterIDConst.GUILD_STAGE_OPENTIME);
        let openTimes = stageOpenTime.split('|');
        let zeroTime = G_ServerTime.secondsFromZero();
        let startTime = Number(openTimes[0]) + zeroTime;
        let endTime = Number(openTimes[1]) + zeroTime;
        return [
            startTime,
            endTime
        ];
    };
    export function isGuildDungenoInAttackTime  () {
        let stageOpenTime = UserDataHelper.getParameter(ParameterIDConst.GUILD_STAGE_OPENTIME);
        let openTimes = stageOpenTime.split('|');
        let startTime = Number(openTimes[0]);
        let endTime = Number(openTimes[1]);
        let time = G_ServerTime.getTodaySeconds();
        if (time < startTime || time > endTime) {
            return [
                false,
                startTime,
                endTime
            ];
        }
        return [
            true,
            startTime,
            endTime
        ];
    };
    export function getGuildDungenoOpenTimeHintText  () {
        let inAttackTime = GuildDungeonDataHelper.isGuildDungenoInAttackTime(), startTime, endTime;
        if (!inAttackTime) {
            return Lang.get('guilddungeon_tips_not_open_as_time', {
                starttime: Math.floor(startTime / 3600),
                endtime: Math.floor(endTime / 3600)
            });
        }
        return null;
    };
    export function getGuildDungenoFightCount  () {
        let userGuildInfo = G_UserData.getGuild().getUserGuildInfo();
        let count = 0;
        if(userGuildInfo)
        count = userGuildInfo.getDungeon_cnt();
        let atkTime = UserDataHelper.getParameter(ParameterIDConst.GUILD_STAGE_ATKTIME);
        return Math.max(0, atkTime - count);
    };
    export function guildDungeonNeedShopAutionDlg  () {
        let oldEndTime = G_UserData.getGuildDungeon().getAutionDlgTime();
        let [isCurrOpen, startTimeToday, endTimeToday] = GuildDungeonDataHelper.isGuildDungenoInAttackTime();
        let endTime = endTimeToday as number + G_ServerTime.secondsFromZero();
        if (isCurrOpen == true) {
            console.warn(' GuildDungeonDataHelper:needShopPromptDlg is open  ret false');
            return false;
        }
        if (oldEndTime == 0) {
            G_UserData.getGuildDungeon().saveAutionDlgTime(endTime);
            console.warn(' GuildDungeonDataHelper:needShopPromptDlg  oldEndTime = 0 ret true');
            return true;
        }
        if (oldEndTime < endTime) {
            G_UserData.getGuildDungeon().saveAutionDlgTime(endTime);
            console.warn(' GuildDungeonDataHelper:needShopPromptDlg  oldEndTime < endTime ret true');
            return true;
        }
        console.log(oldEndTime);
        console.log(endTime);
        return false;
    };
    export function getGuildDungenoGetPrestige  () {
        let rankData = G_UserData.getGuildDungeon().getMyGuildRankData();
        let GuildStageRankReward = G_ConfigLoader.getConfig(ConfigNameConst.GUILD_STAGE_RANK_REWARD);
        let config = GuildStageRankReward.get(rankData.getPoint());
        console.assert(config, 'guild_stage_rank_reward cannot find id ' + (rankData.getPoint()));
        let classNum = 5;
        let rank = rankData.getRank();
        for (let index = 0; index <= classNum; index += 1) {
            if (rank >= config['legion_rank_min_' + index] && rank <= config['legion_rank_max_' + index]) {
                return config['experience_' + index];
            }
        }
        return 0;
    };
};
