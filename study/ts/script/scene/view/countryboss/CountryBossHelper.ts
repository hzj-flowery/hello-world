import { G_EffectGfxMgr, G_UserData, G_ConfigLoader, G_SceneManager, G_ServerTime, Colors, G_Prompt } from "../../../init";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { FunctionConst } from "../../../const/FunctionConst";
import { BaseConfig } from "../../../config/BaseConfig";
import { WayFuncDataHelper } from "../../../utils/data/WayFuncDataHelper";
import { CountryBossConst } from "../../../const/CountryBossConst";
import { TimeConst } from "../../../const/TimeConst";
import { ArraySort } from "../../../utils/handler";
import { GuildDungeonConst } from "../../../const/GuildDungeonConst";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { Lang } from "../../../lang/Lang";
import { AuctionConst } from "../../../const/AuctionConst";
import EffectGfxNode from "../../../effect/EffectGfxNode";
import PopupSystemAlert from "../../../ui/PopupSystemAlert";

export namespace CountryBossHelper {
    let _paramConfig: BaseConfig
    function ParamConfig(): BaseConfig {
        if (!_paramConfig) {
            _paramConfig = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER)
        }

        return _paramConfig;
    }

    export function getOpenServerLimit() {
        var FunctionLevelConfig = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL);
        var cfg = FunctionLevelConfig.get(FunctionConst.FUNC_COUNTRY_BOSS);
        console.assert(cfg != null, 'can not get function id ' + FunctionConst.FUNC_COUNTRY_BOSS);
        return cfg.day;
    };
    export function getOpenDays() {
        var config = ParamConfig().get(231);
        console.assert(config != null, 'can not find ParamConfig id = 231');
        var daysString = config.content.split('|');
        var days = {};
        for (let k in daysString) {
            var v = daysString[k];
            var curDay = Number(v);
            console.assert(curDay != null, 'ParamConfig  error id = 231');
            // curDay = curDay + 1;
            // if (curDay > 7) {
            //     curDay = 1;
            // }
            days[curDay] = true;
        }
        return days;
    };
    export function getStage1Time() {
        var config = ParamConfig().get(232);
        console.assert(config != null, 'can not find ParamConfig id = 232');
        return Number(config.content);
    };
    export function getStage2Time() {
        var config = ParamConfig().get(233);
        console.assert(config != null, 'can not find ParamConfig id = 233');
        return Number(config.content);
    };
    export function getStage3Time() {
        var config = ParamConfig().get(234);
        console.assert(config != null, 'can not find ParamConfig id = 234');
        return Number(config.content);
    };
    export function getParamStartTime() {
        var config = ParamConfig().get(246);
        console.assert(config != null, 'can not find ParamConfig id = 234');
        return Number(config.content);
    };
    export function getStartTime() {
        if (CountryBossHelper.isTodayOpen()) {
            var startTime = CountryBossHelper.getParamStartTime();
            return startTime + G_ServerTime.secondsFromZero();
        }
        return 0;
    };
    export function getEndTime() {
        if (CountryBossHelper.isTodayOpen()) {
            var [_, endTime] = getTimeByStage(CountryBossConst.STAGE3)
            return endTime + 1;
        }
        return 0;
    };
    export function isTodayOpen(zeroTimeSecond?) {
        var date = G_ServerTime.getDateObject(null, zeroTimeSecond);
        var days = CountryBossHelper.getOpenDays();
        let day = date.getDay();
        day = day == 0 ? 7 : day;
        if (days[day]) {
            return true;
        }
        return false;
    };
    export function isLastDayOpen() {
        var t = G_ServerTime.getTime() - 24 * 3600;
        var date = G_ServerTime.getDateObject(t);
        var days = CountryBossHelper.getOpenDays();
        let day = date.getDay();
        day = day == 0 ? 7 : day;
        if (days[day]) {
            return true;
        }
        return false;
    };
    export function isShowTodayEndOrNextOpen() {
        var [_, endTime] = CountryBossHelper.getTimeByStage(CountryBossConst.STAGE3);
        var curTime = G_ServerTime.getTime();
        var zeroTime = G_ServerTime.secondsFromToday();
        if (CountryBossHelper.isTodayOpen() && curTime > endTime) {
            return true;
        } else if (CountryBossHelper.isLastDayOpen() && zeroTime < TimeConst.RESET_TIME * 3600) {
            return true;
        }
        return false;
    };
    export function getTimeByStage(stage?) {
        var todayZeroTime = G_ServerTime.secondsFromZero();
        var stage1Time = CountryBossHelper.getStage1Time();
        var stage2Time = CountryBossHelper.getStage2Time();
        var stage3Time = CountryBossHelper.getStage3Time();
        var startTime = CountryBossHelper.getParamStartTime() + todayZeroTime;
        var stage1EarlyEndTime = G_UserData.getCountryBoss().getAhead_time1() || 0;
        var stage3EarlyEndTime = G_UserData.getCountryBoss().getAhead_time3() || 0;
        var stage2BeginTime = startTime + stage1Time;
        if (stage1EarlyEndTime != 0) {
            stage2BeginTime = stage1EarlyEndTime;
        }
        var stage1EndTime = stage2BeginTime - 1;
        var stage3BeginTime = stage2BeginTime + stage2Time;
        var stage2EndTime = stage3BeginTime - 1;
        var stage3EndTime = stage3BeginTime + stage3Time - 1;
        if (stage3EarlyEndTime != 0 && stage3EarlyEndTime > startTime) {
            stage3EndTime = stage3EarlyEndTime - 1;
        }
        if (CountryBossConst.STAGE1 == stage) {
            return [
                startTime,
                stage1EndTime
            ];
        } else if (CountryBossConst.STAGE2 == stage) {
            return [
                stage2BeginTime,
                stage2EndTime
            ];
        } else if (CountryBossConst.STAGE3 == stage) {
            return [
                stage3BeginTime,
                stage3EndTime
            ];
        } else {
            return [
                startTime,
                stage1EndTime,
                stage2BeginTime,
                stage2EndTime,
                stage3BeginTime,
                stage3EndTime
            ];
        }
    };
    export function getNextOpenTime() {
        var curTime = G_ServerTime.getTime();
        var startTime = CountryBossHelper.getParamStartTime() + G_ServerTime.secondsFromZero();
        if (CountryBossHelper.isTodayOpen()) {
            if (curTime < startTime) {
                return startTime;
            }
        }
        var date = G_ServerTime.getDateObject();
        var days = CountryBossHelper.getOpenDays();
        var nextDayNum = 1;
        let day = date.getDay();
        day = day == 0 ? 7 : day;
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
    export function getStage() {
        if (CountryBossHelper.isTodayOpen()) {
            var [stage1BeginTime, stage1EndTime, stage2BeginTime, stage2EndTime, stage3BeginTime, stage3EndTime] = CountryBossHelper.getTimeByStage();
            cc.warn('time: %s  %s\n%s  %s\n%s  %s\n%s  %s'.format(stage1BeginTime, stage1EndTime, stage2BeginTime, stage2EndTime, stage3BeginTime, stage3EndTime, G_UserData.getCountryBoss().getAhead_time1(), G_UserData.getCountryBoss().getAhead_time3()));
            var curTime = G_ServerTime.getTime();
            if (curTime > stage3EndTime) {
                return CountryBossConst.NOTOPEN;
            }
            if (curTime >= stage1BeginTime && curTime <= stage1EndTime) {
                return CountryBossConst.STAGE1;
            } else if (curTime >= stage2BeginTime && curTime <= stage2EndTime) {
                return CountryBossConst.STAGE2;
            } else if (curTime >= stage3BeginTime && curTime <= stage3EndTime) {
                return CountryBossConst.STAGE3;
            }
        }
        return CountryBossConst.NOTOPEN;
    };
    export function checkOpen() {
        if (CountryBossConst.NOTOPEN == CountryBossHelper.getStage()) {
            G_Prompt.showTip(Lang.get('country_boss_open_tip'));
            return false;
        }
        return true;
    };
    export function getChildGroupIds(groupId) {
        var GuildBossInfoConfig = G_ConfigLoader.getConfig(ConfigNameConst.GUILD_BOSS_INFO);
        var groups = [];
        for (let k = 0; k < GuildBossInfoConfig.length(); k++) {
            var cfg = GuildBossInfoConfig.indexOf(k);
            if (cfg.group == groupId) {
                if (cfg.type != 2) {
                    groups.push(cfg.id);
                }
            }
        }
        return groups;
    };
    export function getBossConfigListByType(tp) {
        if (!tp) {
            tp = 2;
        }
        var GuildBossInfoConfig = G_ConfigLoader.getConfig(ConfigNameConst.GUILD_BOSS_INFO);
        var groups = [];
        for (let k = 0; k < GuildBossInfoConfig.length(); k++) {
            var cfg = GuildBossInfoConfig.indexOf(k);
            if (cfg.type == tp) {
                groups.push(cfg);
            }
        }
        ArraySort(groups, function (a, b) {
            return a.id < b.id;
        });
        return groups;
    };
    export function getBossConfigById(id) {
        var GuildBossInfoConfig = G_ConfigLoader.getConfig(ConfigNameConst.GUILD_BOSS_INFO);
        var cfg = GuildBossInfoConfig.get(id);
        console.assert(cfg != null, 'can not get boss config id = ' + (id || 'nil'));
        return cfg;
    };
    export function getPreviewRankRewards(bossId?) {
        if (!bossId) {
            bossId = 0;
        }
        var allAwards = [];
        var openServerDayNum = G_UserData.getBase().getOpenServerDayNum();
        var GuildAnswerAward = G_ConfigLoader.getConfig(ConfigNameConst.GUILD_BOSS_AWARD);
        var bossConfig = {};
        var rewardConfig = null;
        for (let k = 0; k < GuildAnswerAward.length(); k++) {
            var cfg = GuildAnswerAward.indexOf(k);
            if (cfg.boss_id == bossId) {
                if (openServerDayNum >= cfg.day_min && openServerDayNum <= cfg.day_max) {
                    rewardConfig = cfg;
                    break;
                }
            }
        }
        var rewardList = {};
        if (rewardConfig != null) {
            rewardList = UserDataHelper.makeRewards(rewardConfig, 13);
        }
        for (let k in rewardList) {
            var v = rewardList[k];
            allAwards.push(v);
        }
        return allAwards;
    };
    export function getStage1AttackCd() {
        var config = ParamConfig().get(235);
        console.assert(config != null, 'can not find ParamConfig id = 235');
        return Number(config.content);
    };
    export function getStage3AttackCd() {
        var config = ParamConfig().get(236);
        console.assert(config != null, 'can not find ParamConfig id = 236');
        return Number(config.content);
    };
    export function getStage3InterceptCd() {
        var config = ParamConfig().get(237);
        console.assert(config != null, 'can not find ParamConfig id = 237');
        return Number(config.content);
    };
    export function getKillTip(bossId) {
        var cfg = CountryBossHelper.getBossConfigById(bossId);
        var bossData = G_UserData.getCountryBoss().getBossDataById(bossId);
        if (!bossData) {
            return Lang.get('country_boss_is_die_tip');
        }
        var rankData = bossData.getRankFirst();
        if (!rankData) {
            return Lang.get('country_boss_is_die_tip');
        }
        var guildName = rankData.getGuild_name();
        return Lang.get('country_boss_is_die_tip2', {
            city: '',
            name: cfg.name,
            guild: guildName
        });
    };
    export function getLockString(bossCfg):any[] {
        var childIds = CountryBossHelper.getChildGroupIds(bossCfg.group);
        var cityNames = [];
        for (let _ in childIds) {
            var childId = childIds[_];
            var tempData = G_UserData.getCountryBoss().getBossDataById(childId);
            if (!(tempData && tempData.isBossDie())) {
                var tempCfg = CountryBossHelper.getBossConfigById(childId);
                cityNames.push(tempCfg.city_name);
            }
        }
        var isUnlock = false;
        var lockStr = '';
        if (cityNames.length == 0) {
            isUnlock = true;
        } else {
            isUnlock = false;
            lockStr = cityNames[0];
            for (var i = 1; i < cityNames.length; i++) {
                lockStr = lockStr + (',' + cityNames[i]);
            }
            lockStr = Lang.get('country_boss_lock_str', { name: lockStr });
        }
        return [
            isUnlock,
            lockStr
        ];
    };
    export function anyoneBossUnlock() {
        var configList = CountryBossHelper.getBossConfigListByType(2);
        for (let k in configList) {
            var v = configList[k];
            if (CountryBossHelper.getLockString(v)[0]) {
                return true;
            }
        }
        return false;
    };
    export function enterCountryBossView() {
        if (getStage() == CountryBossConst.STAGE3) {
            var final_vote = G_UserData.getCountryBoss().getFinal_vote();
            if (final_vote && final_vote != 0) {
                G_SceneManager.showScene('countrybossbigboss', final_vote, true);
            } else {
                G_SceneManager.showScene('countryboss');
            }
        } else {
            G_SceneManager.showScene('countryboss');
        }
    };
    export function isTodayShowEndDialog() {
        var time = Number(G_UserData.getUserConfig().getConfigValue('countryBoss')) || 0;
        var date1 = G_ServerTime.getDateObject(time);
        var date2 = G_ServerTime.getDateObject();
        if (date1.getDay() == date2.getDay()) {
            return true;
        }
        return false;
    };
    export function setTodayShowDialogTime() {
        var curTime = G_ServerTime.getTime();
        G_UserData.getUserConfig().setConfigValue('countryBoss', curTime);
    };
    export function popGoAuction() {
        if (isTodayShowEndDialog()) {
            cc.warn('====================today is show');
            return;
        }
        var isAuctionWorldEnd = G_UserData.getAuction().isAuctionShow(AuctionConst.AC_TYPE_COUNTRY_BOSS_ID);
        if (isAuctionWorldEnd == false) {
            cc.warn('====================Auction not open');
            return;
        }
        var isInGuild = G_UserData.getGuild().isInGuild();
        if (!isInGuild) {
            cc.warn('====================not in guild');
            return;
        }
        function onBtnGo() {
            G_SceneManager.popToRootScene();
            WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_AUCTION);
        }
        var content = Lang.get('country_boss_acution_tip');
        setTodayShowDialogTime();

        G_SceneManager.openPopup('prefab/common/PopupSystemAlert', (popup: PopupSystemAlert) => {
            popup.setup(Lang.get('country_boss_popup_acution_title1'), null, onBtnGo);
            popup.setContentWithRichTextType3(content, Colors.BRIGHT_BG_TWO, 22, 10);
            popup.setCheckBoxVisible(false);
            popup.showGoButton(Lang.get('country_boss_popup_acution_goto'));
            popup.setCloseVisible(true);
            popup.openWithAction();
        })
    };
    export function popGoFightBigBoss() {
        function onBtnGo() {
            var curStage = getStage();
            if (CountryBossConst.STAGE3 != curStage) {
                return;
            }
            var final_vote = G_UserData.getCountryBoss().getFinal_vote();
            if (final_vote && final_vote != 0) {
                G_SceneManager.showScene('countrybossbigboss', final_vote);
            }
        }
        onBtnGo();
    };
    export function createSwordEft(parentNode) {
        function effectFunction(effect) {
            if (effect == 'effect_shuangjian') {
                let node = new cc.Node();
                var subEffect = node.addComponent(EffectGfxNode);
                subEffect.effectName = 'effect_shuangjian';
                subEffect.play();
                return node;
            }
        }
        return G_EffectGfxMgr.createPlayMovingGfx(parentNode, 'moving_shuangjian', effectFunction, null, false);
    };
    export function createFireEft(parentNode) {
        return G_EffectGfxMgr.createPlayMovingGfx(parentNode, 'moving_sanguozhanji', null, null, false);
    };
    export function isBossDie(id) {
        var data = G_UserData.getCountryBoss().getBossDataById(id);
        if (!data) {
            return true;
        }
        return data.isBossDie();
    };
}