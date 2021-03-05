import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { UTF8 } from "../../../utils/UTF8";
import { G_ConfigLoader, G_UserData, G_ServerTime } from "../../../init";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { table } from "../../../utils/table";
import { assert } from "../../../utils/GlobleFunc";
import { Util } from "../../../utils/Util";
import { G_ParameterIDConst } from "../../../const/ParameterIDConst";

export default class GachaGoldenHeroHelper {

    static getParamter(constId) {
        return UserDataHelper.getParameter(constId);
    }
    static getGachaState() {
        var waitTime = parseInt(GachaGoldenHeroHelper.getParamter(G_ParameterIDConst.GACHA_GOLDENHERO_WAITING));
        var duration = GachaGoldenHeroHelper.getParamter(G_ParameterIDConst.GACHA_GOLDENHERO_DURATION);
        var restTime = GachaGoldenHeroHelper.getParamter(G_ParameterIDConst.GACHA_GOLDENHERO_REST);
        var everyDayOpen = GachaGoldenHeroHelper.getParamter(G_ParameterIDConst.GACHA_GOLDENHERO_EVERYOPEN);
        var everyDayClose = GachaGoldenHeroHelper.getParamter(G_ParameterIDConst.GACHA_GOLDENHERO_EVERYCLOSE);
        var everyDayOpen1 = GachaGoldenHeroHelper.getParamter(G_ParameterIDConst.GACHA_GOLDENHERO_EVERYOPEN1);
        var everyDayClose1 = GachaGoldenHeroHelper.getParamter(G_ParameterIDConst.GACHA_GOLDENHERO_EVERYCLOSE1);
        var todaySecond = 5600 + zeroTime;
        var sectionTime = duration + restTime;
        var startTime = G_UserData.getGachaGoldenHero().getStart_time();
        var endTime = G_UserData.getGachaGoldenHero().getEnd_time();
        var nowTime = G_ServerTime.getTime();
        if (nowTime > endTime || nowTime < startTime) {
            return {
                stage: 0,
                countDowm: 0
            };
        }
        var lastedTime = nowTime - startTime;
        if (lastedTime <= waitTime) {
            return {
                stage: 0,
                countDowm: startTime + waitTime
            };
        } else {
            var zeroTime = G_ServerTime.secondsFromZero();
            var todayOpen = parseInt(everyDayOpen) * 3600 + zeroTime;
            var todayClose = parseInt(everyDayClose) * 3600 + zeroTime;
            var todayOpen1 = parseInt(everyDayOpen1) * 3600 + zeroTime;
            var todayClose1 = parseInt(everyDayClose1) * 3600 + zeroTime;
            var todayLast = 24 * 3600 + zeroTime;
            var stage = Math.ceil((lastedTime - waitTime) / sectionTime);
            if (nowTime >= todayOpen1 && nowTime <= todayClose1) {
                var curStageTime = (lastedTime - waitTime) % sectionTime;
                if (curStageTime > duration) {
                    var countDowm = stage * sectionTime + waitTime + startTime;
                    if (todayClose1 - nowTime <= restTime) {
                        return {
                            stage: stage,
                            countDowm: todayOpen,
                            isLottery: true,
                            isCrossDay: nowTime > todaySecond
                        };
                    } else {
                        return {
                            stage: stage,
                            countDowm: countDowm,
                            isLottery: true,
                            isCrossDay: nowTime > todaySecond
                        };
                    }
                } else {
                    return {
                        stage: stage,
                        countDowm: (stage - 1) * sectionTime + duration + waitTime + startTime,
                        isLottery: false
                    };
                }
            } else if (nowTime >= todayOpen && nowTime <= todayClose) {
                var curStageTime = (lastedTime - waitTime) % sectionTime;
                if (curStageTime > duration) {
                    var countDowm = stage * sectionTime + waitTime + startTime;
                    if (todayLast <= countDowm) {
                        if (countDowm >= endTime) {
                            return {
                                stage: stage,
                                countDowm: endTime,
                                isLottery: true,
                                isOver: true
                            };
                        } else {
                            return {
                                stage: stage,
                                countDowm: stage * sectionTime + waitTime + parseInt(everyDayOpen1) * 3600 + startTime,
                                isLottery: true
                            };
                        }
                    } else {
                        if (countDowm >= endTime) {
                            return {
                                stage: stage,
                                countDowm: endTime,
                                isLottery: true,
                                isOver: true
                            };
                        } else {
                            return {
                                stage: stage,
                                countDowm: countDowm,
                                isLottery: true
                            };
                        }
                    }
                } else {
                    return {
                        stage: stage,
                        countDowm: (stage - 1) * sectionTime + duration + waitTime + startTime,
                        isLottery: false
                    };
                }
            } else {
                if (todayOpen >= endTime) {
                    return {
                        stage: stage,
                        countDowm: endTime,
                        isLottery: false,
                        isCrossDay: true
                    };
                } else {
                    return {
                        stage: stage,
                        countDowm: todayOpen,
                        isLottery: false,
                        isCrossDay: true
                    };
                }
            }
        }
    }
    static getGoldenHeroDraw(dropId) {
        var ParamConfig = G_ConfigLoader.getConfig(ConfigNameConst.GOLDENHERO_DRAW);
        var dropData = ParamConfig.get(dropId);
      //assert((dropData, 'goldenhero_draw.lua Can\'t find the drop_id: ' + (dropId));
        return dropData;
    }
    static getGero(id) {
        var info = G_ConfigLoader.getConfig(ConfigNameConst.HERO).get(id);
      //assert((info, Util.format('hero config can not find id = %d', id));
        return info;
    }
    static getGoldHeroCfgWithCountry(country) {
        var heroData = [];
        var heroList = G_UserData.getGachaGoldenHero().getGoldHeroGroupId();
        for (let i in heroList) {
            var v = heroList[i];
            var heroCfg = GachaGoldenHeroHelper.getGero(v);
            if (heroCfg.country == country) {
                var data = {
                    cfg: heroCfg,
                    isHave: G_UserData.getHandBook().isHeroHave(heroCfg.id, heroCfg.limit),
                    limitLevel: heroCfg.limit
                };
                heroData.push(data);
            }
        }
        return heroData;
    };
    static getGoldHeroCfg() {
        var heroData = [];
        var heroList = G_UserData.getGachaGoldenHero().getGoldHeroGroupId();
        for (let i in heroList) {
            var v = heroList[i];
            var heroCfg = GachaGoldenHeroHelper.getGero(v);
            var data = {
                cfg: heroCfg,
                isHave: G_UserData.getHandBook().isHeroHave(heroCfg.id, heroCfg.limit),
                limitLevel: heroCfg.limit
            };
            table.insert(heroData, data);
        }
        return heroData;
    }
    static isLottery(ladders) {
        ladders = ladders || {};
        var selfId = G_UserData.getBase().getId();
        for (let k in ladders) {
            var v = ladders[k];
            if ((v.user_id == selfId)) {
                return true;
            }
        }
        return false;
    }
    static isLastReward(id) {
        var index = 0;
        var paramConfig = G_ConfigLoader.getConfig(ConfigNameConst.GOLDENHERO_DRAW);
        for (var i = 0; i < paramConfig.length(); i++) {
            var data = paramConfig.indexOf(i);
            if (data["drop_id"]==id) {
                index = i;
                break;
            }
        }
        return index == paramConfig.length();
    };
    static getLastReward(dropId,isOver) {
        var paramConfig = G_ConfigLoader.getConfig(ConfigNameConst.GOLDENHERO_DRAW);//require('app.config.goldenhero_draw');
        function getCurDropIdx(drawConfig, id) {
            for (var i = 1; i<=drawConfig.length(); i++) {
                var data = drawConfig.indexOf(i-1);
                if ((data.drop_id==id)) {
                    return i;
                }
            }
            return 0;
        }
        var index = getCurDropIdx(paramConfig, dropId);
        if (index == 0) {
            return null;
        }
        index = index == 1 && 1 || index - 1;
        index = isOver && paramConfig.length() || index;
        return paramConfig.indexOf(index-1);
    }
    static getFormatServerName(serverName, txtLen, isNotReplace?) {
        txtLen = txtLen || 8;
        isNotReplace = isNotReplace || false;
        var len = UTF8.utf8len(serverName);
        var str = UTF8.utf8sub(serverName, 1, txtLen);
        if (len > txtLen) {
            str = isNotReplace && str || str + '..';
        }
        return str;
    }
}
