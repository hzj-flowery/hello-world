import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { FunctionConst } from "../../../const/FunctionConst";
import { G_ConfigLoader, G_Prompt, G_ServerTime, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { assert } from "../../../utils/GlobleFunc";
import { LogicCheckHelper } from "../../../utils/LogicCheckHelper";
import { Path } from "../../../utils/Path";
import { table } from "../../../utils/table";

export  class CrossWorldBossHelperT {


    static  getBossInfo() {
        var bossId = G_UserData.getCrossWorldBoss().getBoss_id();
        if (bossId == null || bossId == 0) {
            return null;
        }
        var bossInfo = CrossWorldBossHelperT.getBossConfigInfo(bossId);
        return bossInfo;
    };
    static  getOpenTime() {
        var [isOpen] = G_UserData.getCrossWorldBoss().isBossStart();
        if (isOpen == false) {
            var startTime = G_UserData.getCrossWorldBoss().getStart_time();
            var message = Lang.get('worldboss_no_time');
            if (startTime > 0) {
                message = G_ServerTime.getLeftSecondsString(startTime);
            }
            return message;
        }
    };
    static  getIsChatOpen() {
        var isOpenToday = CrossWorldBossHelperT.checkIsTodayOpen();
        if (!isOpenToday) {
            return false;
        }
        var isChatOpen = G_UserData.getCrossWorldBoss().isChatOpen();
        if (!isChatOpen) {
            return false;
        }
        var configChatOpenTime = CrossWorldBossHelperT.getParameterStr('chat_open_time');
        var configChatCloseTime = CrossWorldBossHelperT.getParameterStr('chat_close_time');
        var chatOpenArray = configChatOpenTime.split('|');
        var chatCloseArray = configChatCloseTime.split('|');
        var chatOpenTime = G_ServerTime.getTimestampByHMS(parseInt(chatOpenArray[0]), parseInt(chatOpenArray[1])).getTime();
        var chatCloseTime = G_ServerTime.getTimestampByHMS(parseInt(chatCloseArray[0]), parseInt(chatCloseArray[1])).getTime();
        var currTime = G_ServerTime.getTime();
        if (currTime > chatOpenTime && currTime < chatCloseTime) {
            return true;
        }
        return false;
    };
    static  getAvailableTime() {
        var startTime = G_UserData.getCrossWorldBoss().getStart_time();
        if (startTime == 0) {
            [startTime] = CrossWorldBossHelperT.getNextStartEndTime();
        }
        var configAvailabelTime = CrossWorldBossHelperT.getParameterStr('enter_available_time');
        var configOpenTime = CrossWorldBossHelperT.getParameterStr('day_open_time');
        var availabeArray = configAvailabelTime.split('|');
        var openArray = configOpenTime.split('|');
        var availabelTime = startTime - (parseInt(openArray[0]) * 3600 + parseInt(openArray[1]) * 60 - (parseInt(availabeArray[0]) * 3600 + parseInt(availabeArray[1]) * 60));
        return availabelTime;
    };
    static  getShowTime() {
        var startTime = G_UserData.getCrossWorldBoss().getStart_time();
        if (startTime == 0) {
            return 0;
        }
        var configShowTime = CrossWorldBossHelperT.getParameterStr('enter_show_time');
        var configOpenTime = CrossWorldBossHelperT.getParameterStr('day_open_time');
        var showArray = configShowTime.split('|');
        var openArray = configOpenTime.split('|');
        var showTime = startTime - (parseInt(openArray[0]) * 3600 + parseInt(openArray[1]) * 60 - (parseInt(showArray[0]) * 3600 + parseInt(showArray[1]) * 60));
        return showTime;
    };
    static  getEndTime():Array<any> {
        var endTime = G_UserData.getCrossWorldBoss().getEnd_time();
        var startTime = G_UserData.getCrossWorldBoss().getStart_time();
        var message = Lang.get('worldboss_no_time');
        if (endTime > 0) {
            message = G_ServerTime.getLeftSecondsString(endTime);
        }
        var nowTime = G_ServerTime.getTime();
        var endTime = G_UserData.getCrossWorldBoss().getEnd_time();
        var totalTime = endTime - startTime;
        var percent = 100 - Math.floor((nowTime - startTime) / totalTime * 100);
        return [
            message,
            percent
        ];
    };
    static  getParameterStr(keyIndex) {

        var parameter = G_ConfigLoader.getConfig(ConfigNameConst.CROSS_BOSS_PARAMETER);
        for (var i = 0; i < parameter.length(); i++) {
            var value = parameter.indexOf(i);
            if (value.key == keyIndex) {
                return value.content;
            }

        }
        assert(false, ' can\'t find key index in parameter ' + keyIndex);
    };
    static  getParameterValue(keyIndex) {
        var parameter = G_ConfigLoader.getConfig(ConfigNameConst.CROSS_BOSS_PARAMETER);
        for (var i = 0; i < parameter.length(); i++) {
            var value = parameter.indexOf(i);
            if (value.key == keyIndex) {
                return parseInt(value.content);
            }
        }
        assert(false, ' can\'t find key index in parameter ' + keyIndex);
    };
    static  getSelfIsPoZhaoCamp():boolean {
        var bossId = G_UserData.getCrossWorldBoss().getBoss_id();
        if (bossId == null || bossId == 0) {
            return false;
        }
        var bossInfo = CrossWorldBossHelperT.getBossConfigInfo(bossId);
        var pozhaoCamp = CrossWorldBossHelperT.getPozhaoCampByBossId(bossInfo.id);
        var selfCamp = G_UserData.getCrossWorldBoss().getSelf_camp();
        return selfCamp == pozhaoCamp;
    };
    static  getBossFightBtnName():Array<any> {
        var time = G_UserData.getCrossWorldBoss().getChallenge_boss_time() + CrossWorldBossHelperT.getParameterValue('challenge_time_interval');
        var leftTime = G_ServerTime.getLeftSeconds(time);
        if (leftTime > 0) {
            var message = G_ServerTime.getLeftMinSecStr(time);
            return [
                Lang.get('worldboss_left_time', { time: message }),
                true
            ];
        }
        return [
            null,
            false
        ];
    };
    static  getBossConfigInfo(boss_team_id) {
        var bossInfo;

        var bossConfigInfo = G_ConfigLoader.getConfig(ConfigNameConst.CROSS_BOSS_INFO);
        for (var i = 1; i <= bossConfigInfo.length(); i++) {
            var info = bossConfigInfo.get(i);
            if (info.monster_team_id == boss_team_id) {
                bossInfo = info;
                break;
            }
        }
        return bossInfo;
    };
    static  checkIsTodayOpen(time?):boolean {
        var isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_CROSS_WORLD_BOSS)[0];
        if (!isOpen) {
            return false;
        }
        time = time || G_ServerTime.getTime();


        var curWeekDay = new Date(time).getDay();
        if (curWeekDay == 0) {
            curWeekDay = 7;
        }
        var openDays = CrossWorldBossHelperT.getParameterStr('week_open_time');
        var openDaysArray = openDays.split('|');
        var isTodayOpen = false;
        for (let k in openDaysArray) {
            var v = openDaysArray[k];
            if (curWeekDay == parseInt(v)) {
                isTodayOpen = true;
                break;
            }
        }
        return isTodayOpen;
    };
    static  checkIsTodayOver():boolean {
        var currTime = G_ServerTime.getTime();
        var isTodayOpen = CrossWorldBossHelperT.checkIsTodayOpen(currTime);
        if (!isTodayOpen) {
            return true;
        }
        var activityStartTimeConfig = CrossWorldBossHelperT.getParameterStr('day_open_time');
        var configArray = activityStartTimeConfig.split('|');
        var lastTime = CrossWorldBossHelperT.getParameterValue('last_time');
        var serverDivideTimeConfig = CrossWorldBossHelperT.getParameterStr('server_divide_time');
        var serverDivideTimeArray = serverDivideTimeConfig.split('|');
        var todayStartTime = G_ServerTime.getTimestampByHMS(parseInt(serverDivideTimeArray[0]), parseInt(serverDivideTimeArray[1])).getTime();
        var todayEndTime = G_ServerTime.getTimestampByHMS(parseInt(configArray[0]), parseInt(configArray[1])).getTime() + lastTime;
        if (currTime > todayEndTime || currTime < todayStartTime) {
            return true;
        }
        return false;
    };
    static  getNextStartEndTime():Array<any> {
        var currTime = G_ServerTime.getTime();
        var isTodayOpen = CrossWorldBossHelperT.checkIsTodayOpen(currTime);
        var deltal = 24 * 60 * 60;
        var activityStartTimeConfig = CrossWorldBossHelperT.getParameterStr('enter_available_time');
        var configArray = activityStartTimeConfig.split('|');
        var lastTime = CrossWorldBossHelperT.getParameterValue('last_time');
        var todayStartTime = G_ServerTime.getTimestampByHMS(parseInt(configArray[0]), parseInt(configArray[1])).getTime();
        var todayEndTime = G_ServerTime.getTimestampByHMS(parseInt(configArray[0]), parseInt(configArray[1])).getTime() + lastTime;
        var nextStartTime = 0, nextEndTime;
        if (isTodayOpen && currTime < todayStartTime) {
            nextStartTime = todayStartTime;
            nextEndTime = todayEndTime;
        } else {
            for (var i = 1; i != 7; i++) {
                var isOpen = CrossWorldBossHelperT.checkIsTodayOpen(currTime + i * deltal);
                if (isOpen) {
                    nextStartTime = todayStartTime + i * deltal;
                    nextEndTime = todayEndTime + i * deltal;
                    break;
                }
            }
        }
        return [
            nextStartTime,
            nextEndTime
        ];
    };
    static  checkNeedGetActivityInfo():boolean {
        var currTime = G_ServerTime.getTime();
        var isTodayOpen = CrossWorldBossHelperT.checkIsTodayOpen(currTime);
        var isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_CROSS_WORLD_BOSS)[0];
        if (!isOpen) {
            return false;
        }
        var isNeed = false;
        var activityStartTimeConfig = CrossWorldBossHelperT.getParameterStr('day_open_time');
        var configArray = activityStartTimeConfig.split('|');
        var lastTime = CrossWorldBossHelperT.getParameterValue('last_time');
        var serverDivideTimeConfig = CrossWorldBossHelperT.getParameterStr('server_divide_time');
        var serverDivideTimeArray = serverDivideTimeConfig.split('|');
        var enterBeginShowTime = G_ServerTime.getTimestampByHMS(parseInt(serverDivideTimeArray[0]), parseInt(serverDivideTimeArray[1])).getTime();
        var enterEndShowTime = G_ServerTime.getTimestampByHMS(parseInt(configArray[0]), parseInt(configArray[1])).getTime() + lastTime;
        var crossBossId = CrossWorldBossHelperT.getBossHeroId();
        if (currTime >= enterBeginShowTime && currTime < enterEndShowTime && isTodayOpen && crossBossId && crossBossId != 0) {
            isNeed = true;
        }
        return isNeed;
    };
    static  checkShowCrossBoss():boolean {
        var crossBossId = CrossWorldBossHelperT.getBossHeroId();
        if (crossBossId == null || crossBossId == 0) {
            return false;
        }
        var isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_CROSS_WORLD_BOSS)[0];
        if (!isOpen) {
            return false;
        }
        var currTime = G_ServerTime.getTime();
        var isShow = false;
        var isTodayOpen = CrossWorldBossHelperT.checkIsTodayOpen(currTime);
        var activityStartTimeConfig = CrossWorldBossHelperT.getParameterStr('day_open_time');
        var configArray = activityStartTimeConfig.split('|');
        var lastTime = CrossWorldBossHelperT.getParameterValue('last_time');
        var serverDivideTimeConfig = CrossWorldBossHelperT.getParameterStr('server_divide_time');
        var serverDivideTimeArray = serverDivideTimeConfig.split('|');
        var enterBeginShowTime = G_ServerTime.getTimestampByHMS(parseInt(serverDivideTimeArray[0]), parseInt(serverDivideTimeArray[1])).getTime();
        var enterEndShowTime = G_ServerTime.getTimestampByHMS(parseInt(configArray[0]), parseInt(configArray[1])).getTime() + lastTime;
        var endTime = G_UserData.getCrossWorldBoss().getEnd_time();
        if (crossBossId && currTime > enterBeginShowTime && currTime < enterEndShowTime && isTodayOpen && currTime < endTime) {
            isShow = true;
        }
        return isShow;
    };
    static  getBossHeroId() {
        var bossId = G_UserData.getCrossWorldBoss().getBoss_id();
        var bossInfo = CrossWorldBossHelperT.getBossConfigInfo(bossId);
        if (bossInfo == null) {
            return null;
        }
        var heroId = bossInfo.hero_id;
        return heroId;
    };
    static  getUserFightBtnName():Array<any> {
        var time = G_UserData.getCrossWorldBoss().getChallenge_user_time() + CrossWorldBossHelperT.getParameterValue('rob_time_interval');
        var leftTime = G_ServerTime.getLeftSeconds(time);
        if (leftTime > 0) {
            var message = G_ServerTime.getLeftMinSecStr(time);
            return [
                Lang.get('worldboss_left_time', { time: message }),
                true
            ];
        }
        return [
            null,
            false
        ];
    };
    static  getBubbleContentById(bubbleId) {
        var BubbleInfo = G_ConfigLoader.getConfig(ConfigNameConst.BUBBLE);
        var data = BubbleInfo.get(parseInt(bubbleId));
        assert(data, 'bubble cfg data can not find by bubbleId ' + bubbleId);
        return data.content;
    };
    static  getBossBubble() {
        var bossInfo = CrossWorldBossHelperT.getBossInfo();
        var content = bossInfo.boss_bubble;
        var idList = content.split('|');
        if (idList.length > 0) {
            var index = Math.floor(Math.random() * idList.length);
            if (index == idList.length)
                index = idList.length - 1;
            var bubbleId = parseInt(idList[index]);
            return CrossWorldBossHelperT.getBubbleContentById(bubbleId);
        }
        return '';
    };
    static  checkBossFight():boolean {
        var time = G_UserData.getCrossWorldBoss().getChallenge_boss_time() + CrossWorldBossHelperT.getParameterValue('challenge_time_interval');
        var leftTime = G_ServerTime.getLeftSeconds(time);
        if (leftTime > 0) {
            G_Prompt.showTip(Lang.get('crossworldboss_boss_cd_time'));
            return false;
        }
        return true;
    };
    static  checkUserFight():boolean {
        var time = G_UserData.getCrossWorldBoss().getChallenge_user_time() + CrossWorldBossHelperT.getParameterValue('rob_time_interval');
        var leftTime = G_ServerTime.getLeftSeconds(time);
        if (leftTime > 0) {
            G_Prompt.showTip(Lang.get('crossworldboss_user_cd_time'));
            return false;
        }
        return true;
    };
    static  getCampIconPathById(id):string {
        var path = Path.getTextSignet('img_cross_boss_camp0' + id);
        assert(path, 'can not find camp by id : ' + id);
        return path;
    };
    static  getPozhaoCampByBossId(bossId):number{

        var bossInfo = G_ConfigLoader.getConfig(ConfigNameConst.CROSS_BOSS_INFO).get(bossId);
        assert(bossInfo, 'cross_boss_info cfg can not find boss by id ' + bossId);
        return parseInt(bossInfo.camp_1);
    };
    static  getBossPosition():cc.Vec2 {
        var boss_people_xy = G_ConfigLoader.getConfig(ConfigNameConst.BOSS_PEOPLE_XY);
        var configPos = boss_people_xy.get(100);
        assert(configPos, 'can not find boss_people_xy by id : ' + 100);
        return cc.v2(configPos.x, configPos.y);
    };
    static  getPreviewRewards():Array<any> {
        var openServerDayNum = G_UserData.getBase().getOpenServerDayNum();
        cc.log('CrossWorldBossHelperT openServerDayNum   ' + openServerDayNum);
        var BossAward = G_ConfigLoader.getConfig(ConfigNameConst.CROSS_BOSS_REWARD_VIEW);
        var rewardConfig = null;
        for (var index = 0; index < BossAward.length(); index += 1) {
            var config = BossAward.indexOf(index);
            if (openServerDayNum >= config.day_min && openServerDayNum <= config.day_max) {
                rewardConfig = config;
                break;
            }
        }
        if (!rewardConfig && BossAward.length() > 0) {
            rewardConfig = BossAward.indexOf(BossAward.length()-1);
        }
        var rewardList = [];
        if (rewardConfig != null) {
            rewardList = UserDataHelper.makeRewards(rewardConfig, 6);
        }
        var bossInfo = CrossWorldBossHelperT.getBossInfo();
        if (bossInfo) {
            var bossRewardList = UserDataHelper.makePreviewCrossBossRewards(rewardConfig, null, null, bossInfo);
            for (let k in bossRewardList) {
                var v = bossRewardList[k];
                table.insertValueByPos(rewardList, parseInt(k), v);
            }
        }
        return rewardList;
    };
    static  getAllBossPreviewRewards():Array<any> {
        var openServerDayNum = G_UserData.getBase().getOpenServerDayNum();
        cc.log('CrossWorldBossHelperT openServerDayNum   ' + openServerDayNum);
        var BossAward = G_ConfigLoader.getConfig(ConfigNameConst.CROSS_BOSS_REWARD_VIEW);
        var rewardConfig = null;
        for (var index = 0; index < BossAward.length(); index += 1) {
            var config = BossAward.indexOf(index);
            if (openServerDayNum >= config.day_min && openServerDayNum <= config.day_max) {
                rewardConfig = config;
                break;
            }
        }
        if (!rewardConfig && BossAward.length() > 0) {
            rewardConfig = BossAward.indexOf(BossAward.length()-1);
        }
        var rewardList = [];
        if (rewardConfig != null) {
            rewardList = UserDataHelper.makeRewards(rewardConfig, 6);
        }
        var bossConfigInfo = G_ConfigLoader.getConfig(ConfigNameConst.CROSS_BOSS_INFO);
        var temp = [];
        for (var i = 1; i <= bossConfigInfo.length(); i++) {
            var info = bossConfigInfo.get(i);
            var bossRewardList = UserDataHelper.makePreviewCrossBossRewards(rewardConfig, null, null, info);
            for (let k in bossRewardList) {
                var v = bossRewardList[k];
                table.insertValueByPos(temp, parseInt(k), v);
            }
        }
        table.sort(temp, function (a, b) {
            return a.type > b.type;
        });
        for (let k in temp) {
            var v = temp[k];
            table.insertValueByPos(rewardList, parseInt(k), v);
        }
        return rewardList;
    };
}