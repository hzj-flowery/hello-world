import ParameterIDConst from "../../const/ParameterIDConst";
import { BuyCountIDConst } from "../../const/BuyCountIDConst";
import { G_ConfigLoader, G_UserData, G_ServerTime, G_Prompt, Colors } from "../../init";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import { GuildConst } from "../../const/GuildConst";
import { Lang } from "../../lang/Lang";
import { DropHelper } from "../DropHelper";
import { LogicCheckHelper } from "../LogicCheckHelper";
import VipFunctionIDConst from "../../const/VipFunctionIDConst";
import { FunctionConst } from "../../const/FunctionConst";
import { UserDataHelper } from "./UserDataHelper";
import { UserCheck } from "../logic/UserCheck";
import { clone } from "../GlobleFunc";
import { ArraySort } from "../handler";
import CommonConst from "../../const/CommonConst";
import { RichTextHelper } from "../RichTextHelper";
import { BaseConfig } from "../../config/BaseConfig";

export namespace GuildDataHelper {
    let guildBaseConfig:BaseConfig;
    let parameterConfig:BaseConfig;
    let functionCostConfig:BaseConfig;
    let purViewConfig:BaseConfig;
    let functionLevelConfig:BaseConfig;
    let guildNewsConfig:BaseConfig;
    let officialRankConfig:BaseConfig;
    let guildDonateConfig:BaseConfig;
    let guildDonateBoxConfig:BaseConfig;
    let guildMissionConfig:BaseConfig;
    let guildSupportTalksConfig:BaseConfig;
    let fragmentConfig:BaseConfig;
    let heroConfig:BaseConfig;
    let guildSupportConfig:BaseConfig;
    export function initConfig(){
        guildBaseConfig = G_ConfigLoader.getConfig(ConfigNameConst.GUILD_BASE);
        parameterConfig = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        functionCostConfig = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_COST);
        purViewConfig = G_ConfigLoader.getConfig(ConfigNameConst.GUILD_PURVIEW);
        functionLevelConfig = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL);
        guildNewsConfig = G_ConfigLoader.getConfig(ConfigNameConst.GUILD_NEWS);
        officialRankConfig = G_ConfigLoader.getConfig(ConfigNameConst.OFFICIAL_RANK);
        guildDonateConfig = G_ConfigLoader.getConfig(ConfigNameConst.GUILD_DONATE);
        guildDonateBoxConfig = G_ConfigLoader.getConfig(ConfigNameConst.GUILD_DONATE_BOX);
        guildMissionConfig = G_ConfigLoader.getConfig(ConfigNameConst.GUILD_MISSION);
        guildSupportTalksConfig = G_ConfigLoader.getConfig(ConfigNameConst.GUILD_SUPPORT_TALKS);
        fragmentConfig = G_ConfigLoader.getConfig(ConfigNameConst.FRAGMENT);
        heroConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO);
        guildSupportConfig = G_ConfigLoader.getConfig(ConfigNameConst.GUILD_SUPPORT)
    }
    export function getGuildMaxMember(level) {
        let config = guildBaseConfig.get(level);
        console.assert(config, 'guild_base config can not find level = %d');
        return config.max_member;
    };
    export function getGuildLevelUpNeedExp(level) {
        let config = guildBaseConfig.get(level);
        console.assert(config, 'guild_base config can not find level = %d');
        return config.exp;
    };
    export function getCreateGuildNeedMoney() {
        let needMoney = parameterConfig.get(ParameterIDConst.GUILD_CREAT_COST_ID).content;
        return Number(needMoney);
    };
    export function getSupportTimes() {
        let config = functionCostConfig.get(BuyCountIDConst.GUILD_HELP);
        console.assert(config, 'can not find funcion_cost cfg by id ' + BuyCountIDConst.GUILD_HELP);
        return config.free_count;
    };
    export function isHaveJurisdiction(position, jurisdiction) {
        let config = purViewConfig.get(position);
        console.assert(config, 'guild_purview can not find id = %d');
        let purview = config.purview;
        let purviewIds = purview.split('|');
        for (let k in purviewIds) {
            let id = purviewIds[k];
            if (Number(id) == jurisdiction) {
                return true;
            }
        }
        return false;
    };
    export function getGuildLeaderNames() {
        let result: any = {};
        let members = G_UserData.getGuild().getGuildMemberList();
        for (let k in members) {
            let data = members[k];
            let position = data.getPosition();
            if (position == GuildConst.GUILD_POSITION_1) {
                result.leaderName = data.getName();
            } else if (position == GuildConst.GUILD_POSITION_2) {
                result.mateName = data.getName();
            } else if (position == GuildConst.GUILD_POSITION_3) {
                if (result.elderNames == null) {
                    result.elderNames = [];
                }
                result.elderNames.push(data.getName());
            }
        }
        return result;
    };
    export function getGuildDutiesName(position) {
        if (typeof position == 'string') {
            position = Number(position);
        }
        let config = purViewConfig.get(position);
        console.assert(config, 'guild_purview config can nof find id = %d');
        return config.name;
    };
    export function checkCanQuitGuild(time) {
        console.assert(typeof time == 'number', 'Invalid time: ' + (time));
        let sec = G_ServerTime.getTime() - time;
        let timeLimit = Number(parameterConfig.get(ParameterIDConst.GUILD_PROTECT_TIMES_ID).content);
        if (sec <= timeLimit) {
            let timeDes = G_ServerTime.getDayOrHourOrMinFormat(timeLimit);
            G_Prompt.showTip(Lang.get('guild_tip_can_not_quit', { time: timeDes }));
            return false;
        }
        let isFunctionOpen = function (curFuncId) {
            let funcLevelInfo = functionLevelConfig.get(curFuncId);
            console.assert(funcLevelInfo, 'Invalid function_level can not find funcId ' + curFuncId);
            let timeCheck = true;
            if (funcLevelInfo.show_day > 0) {
                timeCheck = UserCheck.enoughOpenDay(funcLevelInfo.show_day);
            }
            return timeCheck;
        };
        let curFuncId = G_UserData.getLimitTimeActivity().getCurGuildActivityIcon(), startTime, endTime;
        let currTime = G_ServerTime.getTime();
        if (currTime >= startTime && currTime <= endTime && isFunctionOpen(curFuncId)) {
            let funcName = FunctionConst.getFuncName(curFuncId);
            let actName = Lang.get('activity_names_by_func_id')[funcName];
            G_Prompt.showTip(Lang.get('guild_quit_hint_in_activity', { value: actName }));
            return false;
        }
        return true;
    };
    export function checkCanExpelGuild(time) {
        console.assert(typeof time == 'number', 'Invalid time: ' + (time));
        let sec = G_ServerTime.getTime() - time;
        let timeLimit = Number(parameterConfig.get(ParameterIDConst.GUILD_PROTECT_TIMES_ID).content);
        if (sec <= timeLimit) {
            let timeDes = G_ServerTime.getDayOrHourOrMinFormat(timeLimit);
            G_Prompt.showTip(Lang.get('guild_tip_can_not_expel', { time: timeDes }));
            return false;
        }
        let [curFuncId, startTime, endTime] = G_UserData.getLimitTimeActivity().getCurGuildActivityIcon();
        let currTime = G_ServerTime.getTime();
        if (currTime >= startTime && currTime <= endTime) {
            let funcName = FunctionConst.getFuncName(curFuncId);
            let actName = Lang.get('activity_names_by_func_id')[funcName];
            G_Prompt.showTip(Lang.get('guild_quit_hint_in_activity', { value: actName }));
            return false;
        }
        let myGuild = G_UserData.getGuild().getMyGuild();
        if (myGuild) {
            let remainCount = UserDataHelper.getParameter(ParameterIDConst.GUILD_MAXKICK_TIMES) - myGuild.getKick_member_cnt();
            if (remainCount <= 0) {
                G_Prompt.showTip(Lang.get('guild_kick_remain_count_not_enough'));
                return false;
            }
        }
        return true;
    };
    export function checkCanApplyJoinInGuild() {
        let guildInfo = G_UserData.getGuild().getUserGuildInfo();
        let leaveTime = guildInfo.getLeave_time();
        if (leaveTime != 0) {
            let sec = G_ServerTime.getTime() - leaveTime;
            let timeLimit = Number(parameterConfig.get(ParameterIDConst.GUILD_QUIT_CD_ID).content);
            if (sec <= timeLimit) {
                let timeDes = G_ServerTime.getDayOrHourOrMinFormat(timeLimit);
                G_Prompt.showTip(Lang.get('guild_tip_application_time_limit', { time: timeDes }));
                return false;
            }
        }
        let count = G_UserData.getGuild().getGuildListData().getHasAppliedCount();
        let limitCount = Number(parameterConfig.get(ParameterIDConst.GUILD_APPLY_PLAYER_ID).content);
        if (count >= limitCount) {
            G_Prompt.showTip(Lang.get('guild_tip_application_count_limit', { count: limitCount }));
            return false;
        }
        let isGuildWarRunning = G_UserData.getLimitTimeActivity().isActivityOpen(FunctionConst.FUNC_GUILD_WAR);
        if (isGuildWarRunning) {
            G_Prompt.showTip(Lang.get('guild_tip_application_deny_when_guildwar'));
            return false;
        }
        return true;
    };
    export function checkCanImpeach(offlineTime) {
        let myGuild = G_UserData.getGuild().getMyGuild();
        if (myGuild) {
            let impeachTime = myGuild.getImpeach_time();
            if (impeachTime != 0) {
                G_Prompt.showTip(Lang.get('guild_tip_impeaching'));
                return false;
            }
        }
        let sec = G_ServerTime.getTime() - offlineTime;
        let limitTime = Number(parameterConfig.get(ParameterIDConst.GUILD_IMPEACH_TIME_ID).content);
        if (offlineTime == 0 || sec < limitTime) {
            let timeStr = G_ServerTime.getDayOrHourOrMinFormat(limitTime);
            G_Prompt.showTip(Lang.get('guild_tip_impeach_limit', { time: timeStr }));
            return false;
        }
        return true;
    };
    export function formatNotify(notifyDatas) {
        function convertValue(snType, content) {
            for (let j in content) {
                let one = content[j];
                let key = one['key'];
                if (key && key == 'position') {
                    let value = one['value'];
                    let name = GuildDataHelper.getGuildDutiesName(value);
                    one['value'] = name;
                } else if (key && key == 'id') {
                    let value = one['value'];
                    let name = GuildDataHelper.getGuildContributionName(value);
                    one['value'] = name;
                }
            }
            return content;
        }
        function sortFun(a, b) {
            return a.time_ > b.time_;
        }
        let temp = clone(notifyDatas);
        ArraySort(temp, sortFun);
        let result = new Array<Array<any>>();
        let dateList = {};
        let count = -1;
        for (let i in temp) {
            let data = temp[i];
            let snType = data.sn_type_;
            let content = convertValue(snType, data.content_);
            let time = data.time_;
            let [timeStr1, timeStr2] = G_ServerTime.getDateAndTime(time);
            if (dateList[timeStr1] == null) {
                count = count + 1;
                result[count] = [];
                dateList[timeStr1] = count;
            }
            let config = guildNewsConfig.get(snType);
            console.assert(config, 'guild_news config can not find id = %d');
            let source = config.news;
            let text = RichTextHelper.convertRichTextByNoticePairs(source, content, 20, Colors.NORMAL_BG_ONE);
            let unit = {
                date: timeStr1,
                time: timeStr2,
                text: text
            };
            result[count].push(unit);
        }
        return result;
    };
    export function getOfficialInfo(official) {
        let officialInfo = officialRankConfig.get(official);
        console.assert(officialInfo, 'official_rank config can not find id = %d');
        let name = officialInfo.name;
        let color = Colors.getOfficialColor(official);
        return [
            name,
            color,
            officialInfo
        ];
    };
    export function checkCanGuildHelpOther(fragmentId) {
        let [cdCountDownTime, isForbitHelp] = UserDataHelper.getGuildHelpCdCountDownTime();
        if (isForbitHelp) {
            G_Prompt.showTip(Lang.get('guild_help_tip_in_cd'));
            return false;
        }
        let limitMax = GuildDataHelper.getSupportTimes();
        let count = G_UserData.getGuild().getUserGuildInfo().getAsk_help_cnt();
        if (count > 0) {
            return true;
        }
        let buyCount = G_UserData.getGuild().getUserGuildInfo().getAsk_help_buy();
        let timesOut = LogicCheckHelper.vipTimesOutCheck(VipFunctionIDConst.GUILD_HELP_GOLD_BUY_COUNT, buyCount, Lang.get('lang_activity_moneytree_shake_max_time'));
        if (timesOut) {
            return false;
        }
        let needGold = UserDataHelper.getPriceAdd(10002, buyCount + 1);
        let [success] = LogicCheckHelper.enoughCash(needGold, true);
        if (!success) {
            return false;
        }
        return true;
    };
    export function getGuildRandomTalkText() {
        let TalkConfig = guildSupportTalksConfig;
        let length = TalkConfig.length();
        let id = Math.randInt(1, length);
        let info = TalkConfig.get(id);
        return info.talks;
    };
    export function getGuildRewardInfo() {
        let dropId = Number(parameterConfig.get(ParameterIDConst.GUILD_RECOURSE_FINISH_ID).content);
        let info = DropHelper.getDropReward(dropId);
        return info;
    };
    export function getGuildRequestedFilterIds() {
        let result = [];
        let helpBases = G_UserData.getGuild().getMyRequestHelp().getHelp_base();
        console.assert(helpBases, 'GuildDataHelper getGuildRequestedFilterIds helpBases nil');
        for (let k in helpBases) {
            let base = helpBases[k];
            let helpId = base.getHelp_id();
            let config = fragmentConfig.get(helpId);
            console.assert(config, 'fragment config can not find id = %d');
            let filterId = config.comp_value;
            result.push(filterId);
        }
        return result;
    };
    export function getGuildRequestHelpHeroList(filterIds) {
        let orderArr = {
            [CommonConst.HERO_TOP_IMAGE_TYPE_INBATTLE]: 1,
            [CommonConst.HERO_TOP_IMAGE_TYPE_KARMA]: 3,
            [CommonConst.HERO_TOP_IMAGE_TYPE_YOKE]: 2,
            [0]: 0
        };
        function sortFun(a, b) {
            if (orderArr[a.topImageType] != orderArr[b.topImageType]) {
                return orderArr[a.topImageType] > orderArr[b.topImageType];
            } else if (a.data.getConfig().color != b.data.getConfig().color) {
                return a.data.getConfig().color > b.data.getConfig().color;
            } else if (a.data.getLevel() != b.data.getLevel()) {
                return a.data.getLevel() > b.data.getLevel();
            } else if (a.data.getRank_lv() != b.data.getRank_lv()) {
                return a.data.getRank_lv() > b.data.getRank_lv();
            } else {
                return a.data.getBase_id() < b.data.getBase_id();
            }
        }
        function checkFun(filterIds, baseId) {
            for (let i in filterIds) {
                let id = filterIds[i];
                if (id == baseId) {
                    return false;
                }
            }
            return true;
        }
        let colorCountMap = {};
        for (let i in filterIds) {
            let baseId = filterIds[i];
            let cfg = heroConfig.get(baseId);
            console.assert(cfg, 'can not find hero id ' + (baseId));
            if (colorCountMap[cfg.color]) {
                colorCountMap[cfg.color] = colorCountMap[cfg.color] + 1;
            } else {
                colorCountMap[cfg.color] = 1;
            }
        }
        console.log(colorCountMap);
        let guildLevel = G_UserData.getGuild().getMyGuildLevel();
        function checkColor(color) {
            let GuildSupport = guildSupportConfig;
            for (let k = 0; k < GuildSupport.length(); k += 1) {
                let config = GuildSupport.indexOf(k);
                let colorNum = colorCountMap[color] || 0;
                if (config.color == color && config.guild_lv <= guildLevel && config.launch_max > colorNum) {
                    return true;
                }
            }
            return false;
        }
        let result = [];
        let temp = {};
        let allHeros = G_UserData.getHero().getAllHeros();
        let fragments = G_UserData.getFragments().getFragListByType(1);
        let heroData = G_UserData.getHero();
        let newAllHeros = [];
        for (let k in allHeros) {
            let hero = allHeros[k];
            newAllHeros.push(hero);
        }
        for (let k in fragments) {
            let data = fragments[k];
            let heroId = data.getConfig().comp_value;
            let tempData = { baseId: heroId };
            let heroUnitData = heroData.createTempHeroUnitData(tempData);
            newAllHeros.push(heroUnitData);
        }
        for (let k in newAllHeros) {
            let hero = newAllHeros[k];
            let baseId = hero.getBase_id();
            let config = hero.getConfig();
            let color = config.color;
            let type = config.type;
            if (type == 2 && checkColor(color) && checkFun(filterIds, baseId)) {
                if (temp[baseId] == null) {
                    temp[baseId] = hero;
                }
                let tempHero = temp[baseId];
                if (hero.getLevel() > tempHero.getLevel() || hero.getRank_lv() > tempHero.getRank_lv()) {
                    temp[baseId] = hero;
                }
            }
        }
        for (let k in temp) {
            let hero = temp[k];
            let [topImagePath, topImageType] = UserDataHelper.getHeroTopImage(hero.getBase_id());
            topImageType = topImageType || 0;
            result.push({
                data: hero,
                topImagePath: topImagePath,
                topImageType: topImageType
            });
        }
        ArraySort(result, sortFun);
        let heroDataList = [];
        for (let k in result) {
            let v = result[k];
            heroDataList.push(v.data);
        }
        return heroDataList;
    };
    export function getGuildHelpCdCountDownTime() {
        let maxCdTime = UserDataHelper.getParameter(ParameterIDConst.GUILD_SUPPORT_CDMAX);
        let userGuildInfo = G_UserData.getGuild().getUserGuildInfo();
        console.assert(userGuildInfo, 'GuildDataHelper getGuildHelpCdCountDownTime userGuildInfo nil');
        let askHelpTime = userGuildInfo.getAsk_help_time();
        let askHelpCdSec = userGuildInfo.getAsk_help_cd_sec();
        let nextHelpTime = askHelpTime + askHelpCdSec;
        let countDownTime = nextHelpTime - G_ServerTime.getTime();
        countDownTime = Math.max(countDownTime, 0);
        return [
            countDownTime,
            countDownTime > 0 && askHelpCdSec >= maxCdTime
        ];
    };
    export function getGuildHelpNeedGold() {
        let count = G_UserData.getGuild().getUserGuildInfo().getAsk_help_cnt();
        if (count > 0) {
            return 0;
        }
        let buyCount = G_UserData.getGuild().getUserGuildInfo().getAsk_help_buy();
        let needGold = UserDataHelper.getPriceAdd(10002, buyCount + 1);
        return needGold;
    };
    export function getGuildAnnouncement() {
        let announcement = G_UserData.getGuild().getMyGuild().getAnnouncement();
        if (announcement == '') {
            announcement = Lang.get('guild_txt_announcement_none');
        }
        return announcement;
    };
    export function getGuildDeclaration(guild?) {
        guild = guild || G_UserData.getGuild().getMyGuild();
        let announcement = guild.getDeclaration();
        if (announcement == '') {
            announcement = Lang.get('guild_txt_declaration_none');
        }
        return announcement;
    };
    export function getOpenRedPacketData(redPacketData, openRedBagUserList) {
        let myRedBagUser = null;
        let maxRedBagMoneyNum = 0;
        let newOpenRedBagUserList = [];
        for (let k in openRedBagUserList) {
            let data = openRedBagUserList[k];
            newOpenRedBagUserList.push(data);
            if (data.getUser_id() == G_UserData.getBase().getId()) {
                myRedBagUser = data;
            }
            if (data.getGet_money() > maxRedBagMoneyNum) {
                maxRedBagMoneyNum = data.getGet_money();
            }
        }
        let isFinish = false;
        let redPacketCfg = redPacketData.getConfig();
        if (newOpenRedBagUserList.length >= redPacketCfg.number && maxRedBagMoneyNum > 0) {
            isFinish = true;
        }
        let newList = [];
        for (let k in newOpenRedBagUserList) {
            let v = newOpenRedBagUserList[k];
            if (isFinish && v.getGet_money() == maxRedBagMoneyNum) {
                v.setIs_best(true);
                newList.push(v);
            }
        }
        for (let k in newOpenRedBagUserList) {
            let v = newOpenRedBagUserList[k];
            if (isFinish && v.getGet_money() == maxRedBagMoneyNum) {
            } else {
                newList.push(v);
            }
        }
        return {
            redPacketData: redPacketData,
            list: newList,
            myRedBagUser: myRedBagUser,
            isFinish: isFinish
        };
    };
    export function getGuildMissionData() {
        let GuildMission = guildMissionConfig;
        let myGuild = G_UserData.getGuild().getMyGuild();
        let level = G_UserData.getGuild().getMyGuildLevel();
        let exp = myGuild.getDaily_total_exp();
        let configList = [];
        for (let index = 0; index < GuildMission.length(); index += 1) {
            let config = GuildMission.indexOf(index);
            if (config.guild_level == level) {
                configList.push(config);
            }
        }
        let userGuildInfo = G_UserData.getGuild().getUserGuildInfo();
        let boxDataList = [];
        for (let k in configList) {
            let v = configList[k];
            let data = {
                status: CommonConst.BOX_STATUS_NOT_GET,
                config: v,
                dropList: null,
                exp: 0
            };
            let isReceived = userGuildInfo.isBoxReceived(Number(k) + 1);
            if (isReceived) {
                data.status = CommonConst.BOX_STATUS_ALREADY_GET;
            } else if (v.need_exp <= exp) {
                data.status = CommonConst.BOX_STATUS_CAN_GET;
            }
            data.dropList = DropHelper.getDropReward(v.drop);
            data.exp = v.need_exp;
            boxDataList.push(data);
        }
        return boxDataList;
    };
    export function getGuildTotalActivePercent() {
        let myGuild = G_UserData.getGuild().getMyGuild();
        let taskDataList = myGuild.getTaskDataList();
        let progress = 0;
        let max = 0;
        for (let k in taskDataList) {
            let taskData = taskDataList[k];
            let config = taskData.getConfig();
            if (config.is_open == 1) {
                let people = taskData.getPeople();
                let maxPeople = config.max_active;
                progress = progress + people;
                max = max + maxPeople;
            }
        }
        return Math.floor(progress * 100 / max);
    };
    export function getGuildTotalActiveColor() {
        let activeColor = 1;
        let percent = GuildDataHelper.getGuildTotalActivePercent();
        let colorPercentList = [
            20,
            40,
            60,
            80,
            100
        ];
        for (let i = 0; i < colorPercentList.length; i += 1) {
            if (percent <= colorPercentList[i]) {
                activeColor = i;
                break;
            }
        }
        return activeColor;
    };
    export function isHaveGuildPermission(permissionType) {
        let userMemberData = G_UserData.getGuild().getMyMemberData();
        let userPosition = userMemberData.getPosition();
        let isHave = GuildDataHelper.isHaveJurisdiction(userPosition, permissionType);
        return isHave;
    };
    export function getGuildContributionList() {
        let GuildDonate = guildDonateConfig;
        let contributionList = [];
        for (let i = 0; i < GuildDonate.length(); i += 1) {
            let config = GuildDonate.indexOf(i);
            contributionList.push(config);
        }
        return contributionList;
    };
    export function getGuildContributionBoxData() {
        let GuildDonateBox = guildDonateBoxConfig;
        let myGuild = G_UserData.getGuild().getMyGuild();
        let level = G_UserData.getGuild().getMyGuildLevel();
        let exp = myGuild.getDonate_point();
        let configList = [];
        for (let index = 0; index < GuildDonateBox.length(); index += 1) {
            let config = GuildDonateBox.indexOf(index);
            if (config.guild_level == level) {
                configList.push(config);
            }
        }
        let userGuildInfo = G_UserData.getGuild().getUserGuildInfo();
        let boxDataList = [];
        for (let k in configList) {
            let v = configList[k];
            let data = {
                status: CommonConst.BOX_STATUS_NOT_GET,
                config: v,
                dropList: null,
                exp: 0
            };
            let isReceived = userGuildInfo.isContributionBoxReceived(Number(k) + 1);
            if (isReceived) {
                data.status = CommonConst.BOX_STATUS_ALREADY_GET;
            } else if (v.need_score <= exp) {
                data.status = CommonConst.BOX_STATUS_CAN_GET;
            }
            data.dropList = DropHelper.getDropReward(v.drop);
            data.exp = v.need_score;
            boxDataList.push(data);
        }
        let maxExp = 32;
        exp = Math.min(exp, maxExp);
        return [
            boxDataList,
            exp,
            maxExp
        ];
    };
    export function getGuildContributionRemainCount() {
        let maxDonateCount = 1;
        let userGuildInfo = G_UserData.getGuild().getUserGuildInfo();
        if (userGuildInfo) {
            let donate = userGuildInfo.getDonate();
            if (donate <= 0) {
                return 1;
            }
            else {
                return 0;
            }
        }
        return 0;
    };
    export function getGuildContributionName(id) {
        if (typeof id == 'string') {
            id = Number(id);
        }
        let config = guildDonateConfig.get(id);
        console.assert(config, 'guild_donate config can nof find id = %d');
        return config.name;
    };
    export function isGuildTaskHasComplete(taskId) {
        let userGuildInfo = G_UserData.getGuild().getUserGuildInfo();
        let taskDataList = userGuildInfo.getTaskDataList();
        return taskDataList[taskId] && taskDataList[taskId] > 0;
    };
    export function getCanSnatchRedPacketNum() {
        let userGuildInfo = G_UserData.getGuild().getUserGuildInfo();
        let alreadySnatchNum = userGuildInfo.getGet_red_bag_cnt();
        let totalNum = UserDataHelper.getParameter(ParameterIDConst.GUILD_REDPACKET_OPENTIMES);
        return Math.max(0, totalNum - alreadySnatchNum);
    };
    function sortFunByOfficer(a, b) {
        if (a.getOfficer_level() != b.getOfficer_level()) {
            return a.getOfficer_level() < b.getOfficer_level();
        }
        return a.getUid() < b.getUid();
    }
    function sortFunByLevel(a, b) {
        if (a.getLevel() != b.getLevel()) {
            return a.getLevel() < b.getLevel();
        }
        return a.getUid() < b.getUid();
    }
    function sortFunByPower(a, b) {
        if (a.getPower() != b.getPower()) {
            return a.getPower() < b.getPower();
        }
        return a.getUid() < b.getUid();
    }
    function sortFunByPosition(a, b) {
        if (a.getPosition() != b.getPosition()) {
            return a.getPosition() > b.getPosition();
        }
        return a.getUid() < b.getUid();
    }
    function sortFunByWeekContribution(a, b) {
        if (a.getWeek_contribution() != b.getWeek_contribution()) {
            return a.getWeek_contribution() < b.getWeek_contribution();
        }
        return a.getUid() < b.getUid();
    }
    function sortFunByContribution(a, b) {
        if (a.getContribution() != b.getContribution()) {
            return a.getContribution() < b.getContribution();
        }
        return a.getUid() < b.getUid();
    }
    function sortFunByOffline(a, b) {
        let onlineA = a.isOnline() && 1 || 0;
        let onlineB = b.isOnline() && 1 || 0;
        if (onlineA != onlineB) {
            return onlineA > onlineB;
        }
        if (a.getOffline() != b.getOffline()) {
            return a.getOffline() > b.getOffline();
        }
        return a.getUid() < b.getUid();
    }
    function sortFunByDefault(a, b) {
        let selfA = a.isSelf() && 1 || 0;
        let selfB = b.isSelf() && 1 || 0;
        if (selfA != selfB) {
            return selfA > selfB;
        }
        if (a.getPosition() != b.getPosition()) {
            return a.getPosition() < b.getPosition();
        }
        let onlineA = a.isOnline() && 1 || 0;
        let onlineB = b.isOnline() && 1 || 0;
        if (onlineA != onlineB) {
            return onlineA > onlineB;
        }
        return a.getOffline() > b.getOffline();
    }
    function sortFunByActiveRate(a, b) {
        if (a.getActive_cnt() != b.getActive_cnt()) {
            return a.getActive_cnt() < b.getActive_cnt();
        }
        return a.getUid() < b.getUid();
    }
    function sortFunByTrainType(a, b) {
        let selfA = a.isSelf() && 1 || 0;
        let selfB = b.isSelf() && 1 || 0;
        if (selfA != selfB) {
            return selfA > selfB;
        }
        if (a.getTrainType() == b.getTrainType()) {
            return a.getLevel() < b.getLevel();
        } else {
            return a.getTrainType() < b.getTrainType();
        }
    }
    export function getGuildMemberListBySort(category, isAscendOrder) {
        console.warn((category) + (' &&&&&&&&&&&&&&& getGuildMemberListBySort ' + (isAscendOrder)));
        let result = [];
        let sortFunList = [
            sortFunByOfficer,
            sortFunByLevel,
            sortFunByPower,
            sortFunByPosition,
            sortFunByActiveRate,
            sortFunByOffline,
            sortFunByTrainType
        ];
        let guildMemberList = G_UserData.getGuild().getGuildMemberList();
        for (let k in guildMemberList) {
            let unit = guildMemberList[k];
            result.push(unit);
        }
        if (category && sortFunList[category]) {
            ArraySort(result, sortFunList[category]);
        } else {
            ArraySort(result, sortFunByDefault);
        }
        if (isAscendOrder == false) {
            console.warn(' &&&&&&&&&&&&&&& getGuildMemberListBySort');
            let newResult = [];
            if (category == 7) {
                newResult.push(result[1]);
                if (result.length > 1) {
                    for (let k = result.length - 1; k >= 1; k += -1) {
                        newResult.push(result[k]);
                    }
                }
            } else {
                for (let k = result.length - 1; k >= 0; k += -1) {
                    newResult.push(result[k]);
                }
            }
            return newResult;
        }
        return result;
    };
};
