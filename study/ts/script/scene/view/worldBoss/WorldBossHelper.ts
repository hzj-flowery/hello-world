import { G_UserData, G_ServerTime, G_ConfigLoader, G_Prompt } from "../../../init";
import { Lang } from "../../../lang/Lang";
import ParameterIDConst from "../../../const/ParameterIDConst";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { Util } from "../../../utils/Util";

export namespace WorldBossHelper {
    export function getBossInfo() {
        var bossId = G_UserData.getWorldBoss().getBoss_id();
        if (bossId == null || bossId == 0) {
            //assert(false, 'can not get boss info');
        }
        var bossInfo = G_ConfigLoader.getConfig('boss_info').get(bossId);
        //assert(bossInfo, 'boss_info cfg can not find boss by id ' + bossId);
        return bossInfo;
    }
    export function getOpenTime() {
        var isOpen = G_UserData.getWorldBoss().isBossStart()[0];
        if (isOpen == false) {
            var startTime = G_UserData.getWorldBoss().getStart_time();
            var message = Lang.get('worldboss_no_time');
            if (startTime > 0) {
                message = G_ServerTime.getLeftSecondsString(startTime);
            }
            return message;
        }
    }
    export function getEndTime(): [string, number] {
        var endTime = G_UserData.getWorldBoss().getEnd_time();
        var startTime = G_UserData.getWorldBoss().getStart_time();
        var message = Lang.get('worldboss_no_time');
        if (endTime > 0) {
            message = G_ServerTime.getLeftSecondsString(endTime);
        }
        var nowTime = G_ServerTime.getTime();
        var endTime = G_UserData.getWorldBoss().getEnd_time();
        var totalTime = endTime - startTime;
        var percent = 100 - Math.floor((nowTime - startTime) / totalTime * 100);
        return [
            message,
            percent
        ];
    }
    export function getParameterValue(keyIndex) {
        var parameter = G_ConfigLoader.getConfig('parameter');
        for (var i = 1; i <= parameter.length(); i++) {
            var value = parameter.indexOf(i);
            if (value.key == keyIndex) {
                return parseInt(value.content);
            }
        }
        //assert(false, ' can\'t find key index in parameter ' + keyIndex);
    }
    export function getBossFightBtnName(): [string, boolean] {
        var fightBossCount = G_UserData.getWorldBoss().getChallenge_boss_cnt();
        var time = G_UserData.getWorldBoss().getChallenge_boss_time() + WorldBossHelper.getParameterValue('challenge_time_interval');
        var leftTime = G_ServerTime.getLeftSeconds(time);
        if (leftTime > 0 && fightBossCount > 0) {
            var message = G_ServerTime.getLeftSecondsString(time);
            return [
                Lang.get('worldboss_left_time', { time: message }),
                false
            ];
        } else {
            return [
                Lang.get('worldboss_btn1', { num: fightBossCount }),
                true
            ];
        }
        return [
            null,
            false
        ];
    }
    export function getUserFightBtnName(): [string, boolean] {
        var fightUserCount = G_UserData.getWorldBoss().getChallenge_user_cnt();
        var time = G_UserData.getWorldBoss().getChallenge_user_time() + WorldBossHelper.getParameterValue('rob_time_interval');
        var leftTime = G_ServerTime.getLeftSeconds(time);
        if (leftTime > 0 && fightUserCount > 0) {
            var message = G_ServerTime.getLeftSecondsString(time);
            return [
                Lang.get('worldboss_left_time', { time: message }),
                false
            ];
        } else {
            return [
                Lang.get('worldboss_btn2', { num: fightUserCount }),
                true
            ];
        }
        return [
            null,
            false
        ];
    }
    export function getBubbleContentById(bubbleId) {
        var BubbleInfo = G_ConfigLoader.getConfig('bubble');
        var data = BubbleInfo.get(parseInt(bubbleId));
        //assert(data, 'bubble cfg data can not find by bubbleId ' + bubbleId);
        return data.content;
    }
    export function getBossBubble() {
        var bossInfo = WorldBossHelper.getBossInfo();
        var content = bossInfo.boss_bubble;
        var idList = content.split('|');
        if (idList.length > 0) {
            var index = Util.getRandomInt(0, idList.length);
            var bubbleId = parseInt(idList[index]);
            return WorldBossHelper.getBubbleContentById(bubbleId);
        }
        return '';
    }
    export function checkBossFight() {
        var fightBossCount = G_UserData.getWorldBoss().getChallenge_boss_cnt();
        if (fightBossCount == 0) {
            G_Prompt.showTip(Lang.get('worldboss_fight_times'));
            return false;
        }
        var fightBossCount = G_UserData.getWorldBoss().getChallenge_boss_cnt();
        var time = G_UserData.getWorldBoss().getChallenge_boss_time() + WorldBossHelper.getParameterValue('challenge_time_interval');
        var leftTime = G_ServerTime.getLeftSeconds(time);
        if (leftTime > 0) {
            G_Prompt.showTip(Lang.get('worldboss_cd_time'));
            return false;
        }
        return true;
    }
    export function checkUserFight() {
        var fightUserCount = G_UserData.getWorldBoss().getChallenge_user_cnt();
        if (fightUserCount == 0) {
            G_Prompt.showTip(Lang.get('worldboss_fight_times'));
            return false;
        }
        var time = G_UserData.getWorldBoss().getChallenge_user_time() + WorldBossHelper.getParameterValue('rob_time_interval');
        var leftTime = G_ServerTime.getLeftSeconds(time);
        if (leftTime > 0) {
            G_Prompt.showTip(Lang.get('worldboss_cd_time'));
            return false;
        }
        return true;
    }
    export function getBossPosition() {
        var boss_people_xy = G_ConfigLoader.getConfig('boss_people_xy');
        var configPos = boss_people_xy.get(100);
        //assert(configPos, 'can not find boss_people_xy by id : ' + 100);
        return cc.v2(configPos.x, configPos.y);
    }
    export function getPreviewRewards() {
        var openServerDayNum = G_UserData.getBase().getOpenServerDayNum();
        // logWarn('WorldBossHelper openServerDayNum   ' + openServerDayNum);
        var BossAward = G_ConfigLoader.getConfig('boss_award');
        var rewardConfig = null;
        for (var index = 0; index <= BossAward.length(); index += 1) {
            var config = BossAward.indexOf(index);
            if (openServerDayNum >= config.day_min && openServerDayNum <= config.day_max) {
                rewardConfig = config;
                break;
            }
        }
        if (!rewardConfig && BossAward.length() > 0) {
            rewardConfig = BossAward.indexOf(BossAward.length());
        }
        var rewardList = []
        if (rewardConfig != null) {
            rewardList = UserDataHelper.makeRewards(rewardConfig, 5);
        }
        var bossInfo = WorldBossHelper.getBossInfo();
        var bossRewardList = UserDataHelper.makePreviewBossRewards(rewardConfig, null, null, bossInfo);
        for (var k = 0; k < bossRewardList.length; k++) {
            var v = bossRewardList[k];
            rewardList.push(v);
        }
        return rewardList;
    }
}