import { SeasonSportConst } from "../../../const/SeasonSportConst";
import { G_ConfigLoader, G_UserData, G_ServerTime } from "../../../init";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { ArraySort } from "../../../utils/handler";
import { AvatarUnitData } from "../../../data/AvatarUnitData";
import { HeroConst } from "../../../const/HeroConst";

export namespace SeasonSportHelper {
    export function getCurSlotNum() {
        var paramId = SeasonSportConst.SEASON_ROOKIE_SILKCOUNT;
        var curStage = G_UserData.getSeasonSport().getSeason_Stage();
        if (curStage == SeasonSportConst.SEASON_STAGE_ROOKIE) {
            paramId = SeasonSportConst.SEASON_ROOKIE_SILKCOUNT;
        } else if (curStage == SeasonSportConst.SEASON_STAGE_ADVANCED) {
            paramId = SeasonSportConst.SEASON_ADVANCED_SILKCOUNT;
        } else if (curStage == SeasonSportConst.SEASON_STAGE_HIGHT) {
            paramId = SeasonSportConst.SEASON_HIGHT_SILKCOUNT;
        }
        return Number(getParameterConfigById(paramId).content);
    };
    export function isHero(heroId) {
        let Hero = G_ConfigLoader.getConfig(ConfigNameConst.HERO);
        var heroConfig = Hero.get(heroId);
        var bRet = heroConfig != null;
        return bRet;
    };
    export function isExistHeroById(heroId) {
        let Hero = G_ConfigLoader.getConfig(ConfigNameConst.HERO);
        var heroConfig = Hero.get(heroId);
        var bRet = heroConfig != null || false;
        return [
            bRet,
            heroConfig
        ];
    };
    export function getDanInfoByStar(star) {
        if (star == null || star == 0) {
            star = 1;
        }
        var ParamConfig = G_ConfigLoader.getConfig(ConfigNameConst.FIGHT_STAR);
        if (ParamConfig.length() <= star) {
            star = ParamConfig.length();
        }
        var danInfo = ParamConfig.get(star);
        console.assert(danInfo, 'fight_star.lua Can\'t find the star: ' + String(star));
        return danInfo;
    };
    export function getFreeDan(): any[] {
        var defaultFreeCount = Number(getParameterConfigById(365).content);
        console.assert(!!defaultFreeCount, 'parameter.lua can\'t find content of ' + String(365));
        var silkFreeContent = getParameterConfigById(393).content;
        console.assert(silkFreeContent, 'parameter.lua can\'t find content of ' + String(393));
        var silkIdData = silkFreeContent.split('|');
        var data = [];
        for (var index = 1; index <= defaultFreeCount; index++) {
            data.push(1);
        }
        for (let index in silkIdData) {
            var value = silkIdData[index];
            var silkIds = value.split(':');
            for (let key = 0; key < silkIds.length; key++) {
                var id = silkIds[key];
                if (key == 1) {
                    data.push(Number(id));
                }
            }
        }
        return data;
    };
    export function getMaxFightStage() {
        var ParamConfig = G_ConfigLoader.getConfig(ConfigNameConst.FIGHT_STAGE);
        var stageInfo = ParamConfig.index();
        console.assert(stageInfo, 'fight_stage.lua Can\'t find the star: ');
        var maxStage = Object.keys(stageInfo).length;
        return maxStage;
    };
    export function getSquadStageInfo(stageId) {
        if (stageId == 0 || stageId == null) {
            stageId = 1;
        }
        var ParamConfig = G_ConfigLoader.getConfig(ConfigNameConst.FIGHT_STAGE);
        var stageInfo = ParamConfig.get(stageId);
        console.assert(stageInfo, 'fight_stage.lua Can\'t find the stage: ' + String(stageId));
        return stageInfo;
    };
    export function getParameterConfigById(paramId) {
        var ParamConfig = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        var paramInfo = ParamConfig.get(paramId);
        console.assert(paramInfo, 'parameter.lua can\'t find id = ' + String(paramId));
        return paramInfo;
    };
    export function getSeasonDefaultSilkIdsById(seasonId) {
        var silkContent = getParameterConfigById(seasonId).content;
        console.assert(silkContent, 'parameter.lua can\'t find content of ' + String(seasonId));
        var silkIdData = silkContent.split('|');
        var data = [];
        for (let index in silkIdData) {
            var value = silkIdData[index];
            data.push(Number(value));
        }
        return data;
    };
    export function getFreeSilkGroupByStar(star) {
        var freeSilk = getDanInfoByStar(star).free_silk;
        if (freeSilk == null || !freeSilk) {
            return null;
        }
        var freedData = freeSilk.split('|');
        var data = [];
        for (let index in freedData) {
            var value = freedData[index];
            data.push(Number(value));
        }
        return data;
    };
    export function getFightAwardsByStar(searchStar) {
        var awardsConfig = G_ConfigLoader.getConfig(ConfigNameConst.FIGHT_AWARD);
        for (var index = 0; index < awardsConfig.length(); index++) {
            var awardsData = awardsConfig.indexOf(index);
            if (Number(awardsData.star) <= searchStar && searchStar <= Number(awardsData.star_max)) {
                return [
                    Number(awardsData.type),
                    Number(awardsData.value),
                    Number(awardsData.size)
                ];
            }
        }
        return [
            null,
            null,
            null
        ];
    };
    export function getOfficiaColorByTitleId(titleId) {
        var officialInfo = G_ConfigLoader.getConfig(ConfigNameConst.OFFICIAL_RANK).get(titleId);
        console.assert(officialInfo, 'parameter.lua can\'t find content of ' + String(titleId));
        return Number(officialInfo.color);
    };
    export function isTodayOpen() {
        var seasonIntervalDay = Number(getParameterConfigById(SeasonSportConst.SEASON_STAGE_DURATION).content);
        var seasonEndTime = G_UserData.getSeasonSport().getSeasonEndTime();
        var seasonStartTime = G_UserData.getSeasonSport().getSeasonStartTime();
        if (seasonStartTime <= G_ServerTime.getTime() && seasonEndTime >= G_ServerTime.getTime()) {
            return true;
        }
        return false;
    };
    export function getSeasonOpenTime() {
        var timeContent = getParameterConfigById(SeasonSportConst.SEASON_INTERVAL_TIME).content;
        var sectionsData = timeContent.split('|');
        var date = [];
        for (let index in sectionsData) {
            var value = sectionsData[index];
            var section = [];
            var sectionData = value.split(':');
            for (let sectionIndex in sectionData) {
                var sectionValue = sectionData[sectionIndex];
                section.push(Number(sectionValue));
            }
            date.push(section);
        }
        return date;
    };
    export function getStartTime() {
        if (isTodayOpen()) {
            var date = getSeasonOpenTime();
            var todaySeconds = G_ServerTime.getTodaySeconds();
            for (var index = 0; index < date.length; index++) {
                if (date[index][0] * 3600 <= todaySeconds && todaySeconds <= date[index][1] * 3600) {
                    var startTime = date[index][0] * 3600;
                    return startTime + G_ServerTime.secondsFromZero();
                }
            }
            return 0;
        }
        return 0;
    };
    export function getEndTime() {
        if (isTodayOpen()) {
            var date = getSeasonOpenTime();
            var todaySeconds = G_ServerTime.getTodaySeconds();
            for (var index = 0; index < date.length; index++) {
                if (todaySeconds <= date[index][1] * 3600) {
                    var endTime = date[index][1] * 3600;
                    return endTime + G_ServerTime.secondsFromZero();
                }
            }
            return 0;
        }
        return 0;
    };
    export function getRemainingTime() {
        if (isTodayOpen()) {
            var date = getSeasonOpenTime();
            var todaySeconds = G_ServerTime.getTodaySeconds();
            for (var index = 0; index < date.length; index++) {
                if (date[index][0] * 3600 < todaySeconds && todaySeconds < date[index][1] * 3600) {
                    var remianTime = date[index][1] * 3600 + G_ServerTime.secondsFromZero();
                    return remianTime;
                }
            }
        }
        return 0;
    };
    export function getWaitingTime() {
        if (getRemainingTime() <= 0) {
            if (isTodayOpen()) {
                var date = getSeasonOpenTime();
                var todaySeconds = G_ServerTime.getTodaySeconds();
                var lastTime = date.length;
                if (todaySeconds > date[lastTime - 1][1] * 3600) {
                    var waitingStr = date[0][0] + (':00-' + (date[0][1] + ':00'));
                    return [
                        true,
                        waitingStr
                    ];
                } else {
                    for (var index = 0; index < date.length; index++) {
                        if (todaySeconds <= date[index][0] * 3600) {
                            var waitingStr = date[index][0] + (':00-' + (date[index][1] + ':00'));
                            return [
                                true,
                                waitingStr
                            ];
                        }
                    }
                }
            }
            return [false, null];
        } else {
            return [
                false,
                getRemainingTime()
            ];
        }
    };
    export function getMianWaitingTime() {
        var date = getSeasonOpenTime();
        var todaySeconds = G_ServerTime.getTodaySeconds();
        var lastTime = date.length;
        if (todaySeconds > date[lastTime - 1][1] * 3600) {
            var waitingStr = date[0][0] + ':00';
            return waitingStr;
        } else {
            for (var index = 0; index < date.length; index++) {
                if (todaySeconds <= date[index][0] * 3600) {
                    var waitingStr = date[index][0] + ':00';
                    return waitingStr;
                }
            }
        }
    };
    export function getSeasonDailyFightReward() {
        var fightContent = getParameterConfigById(SeasonSportConst.SEASON_DAILYREWARDS_FIGHT).content;
        var fightData = fightContent.split('|');
        var data = [];
        for (let index in fightData) {
            var value = fightData[index];
            var valueData = value.split(':');
            var subData: any = {};
            subData.type = 1;
            subData.idx = Number(index);
            subData.num = Number(valueData[0]);
            subData.size = Number(valueData[1]);
            data.push(subData);
        }
        return data;
    };
    export function getSeasonDailyWinReward() {
        var fightContent = getParameterConfigById(SeasonSportConst.SEASON_DAILYREWARDS_WIN).content;
        var fightData = fightContent.split('|');
        var data = [];
        for (let index in fightData) {
            var value = fightData[index];
            var valueData = value.split(':');
            var subData: any = {};
            subData.type = 2;
            subData.idx = Number(index);
            subData.num = Number(valueData[0]);
            subData.size = Number(valueData[1]);
            data.push(subData);
        }
        return data;
    };
    export function getOrangeHeroList(group) {
        var heroInfo = G_ConfigLoader.getConfig(ConfigNameConst.HERO);
        var orangeHeroListInfo = {};
        var redLimit = getLimitBreak();
        for (var loopi = 0; loopi < heroInfo.length(); loopi++) {
            var heroData = heroInfo.indexOf(loopi);
            var heroCountry = heroData.country;
            var heroColor = heroData.color;
            var heroLimit = heroData.limit;
            if (heroData.is_fight > 0 && heroData.is_fight <= group) {
                if (heroColor == SeasonSportConst.HERO_SCOP_LOWERLIMIT) {
                    if (heroLimit != SeasonSportConst.HERO_SCOP_LIMIT && redLimit != SeasonSportConst.HERO_RED_LINEBREAK) {
                        orangeHeroListInfo[heroCountry] = orangeHeroListInfo[heroCountry] || [];
                        if (orangeHeroListInfo[heroCountry] == null) {
                            orangeHeroListInfo[heroCountry] = [];
                        }
                        orangeHeroListInfo[heroCountry].push({ cfg: heroData });
                        ArraySort(orangeHeroListInfo[heroCountry], function (item1, item2) {
                            return item1.cfg.id < item2.cfg.id;
                        });
                    }
                }
            }
        }
        return orangeHeroListInfo;
    };
    export function getGoldenHeroList(group) {
        var heroInfo = G_ConfigLoader.getConfig(ConfigNameConst.HERO);
        var goldenHeroListInfo = {};
        for (var loopi = 0; loopi < heroInfo.length(); loopi++) {
            var heroData = heroInfo.indexOf(loopi);
            var heroCountry = heroData.country;
            var heroColor = heroData.color;
            var heroLimit = heroData.limit;
            if (heroData.is_fight == group) {
                if (heroColor == SeasonSportConst.HERO_SCOP_GOLDENLIMIT && heroData.is_show == SeasonSportConst.HERO_SCOP_INHANDBOOK) {
                    goldenHeroListInfo[heroCountry] = goldenHeroListInfo[heroCountry] || [];
                    goldenHeroListInfo[heroCountry].push({ cfg: heroData });
                }
            }
        }
        for (var k in goldenHeroListInfo) {
            var v = goldenHeroListInfo[k];
            v.sort(function (item1, item2) {
                return item1.cfg.id - item2.cfg.id;
            });
        }
        return goldenHeroListInfo;
    };
    export function _isGoldenHero(heroId) {
        var heroInfo = G_ConfigLoader.getConfig(ConfigNameConst.HERO);
        var info = heroInfo.get(heroId);
        if (info && info.color == SeasonSportConst.HERO_SCOP_GOLDENLIMIT) {
            return true;
        }
        return false;
    };
    export function getRedHeroList(group) {
        var heroInfo = G_ConfigLoader.getConfig(ConfigNameConst.HERO);
        var redHeroListInfo: any = {};
        var redLimit = getLimitBreak();
        for (var loopi = 0; loopi < heroInfo.length(); loopi++) {
            var heroData = heroInfo.indexOf(loopi);
            var heroCountry = heroData.country;
            var heroColor = heroData.color;
            var heroLimit = heroData.limit;
            if (heroData.is_fight > 0 && heroData.is_fight <= group) {
                if (heroColor == SeasonSportConst.HERO_SCOP_REDIMIT && heroData.is_show == SeasonSportConst.HERO_SCOP_INHANDBOOK) {
                    redHeroListInfo[heroCountry] = redHeroListInfo[heroCountry] || [];
                    if (redHeroListInfo[heroCountry] == null) {
                        redHeroListInfo[heroCountry] = [];
                    }
                    redHeroListInfo[heroCountry].push({ cfg: heroData });
                    ArraySort(redHeroListInfo[heroCountry], function (item1, item2) {
                        var ret = null;
                        if (item1.cfg.color == item2.cfg.color) {
                            ret = item1.cfg.id < item2.cfg.id;
                        } else {
                            ret = item1.cfg.color > item2.cfg.color;
                        }
                        return ret;
                    });
                } else if (heroColor == SeasonSportConst.HERO_SCOP_LOWERLIMIT && heroData.is_show == SeasonSportConst.HERO_SCOP_INHANDBOOK) {
                    if (heroLimit == SeasonSportConst.HERO_SCOP_LIMIT && redLimit == SeasonSportConst.HERO_RED_LINEBREAK) {
                        redHeroListInfo[heroCountry] = redHeroListInfo[heroCountry] || [];
                        if (redHeroListInfo[heroCountry] == null) {
                            redHeroListInfo[heroCountry] = [];
                        }
                        redHeroListInfo[heroCountry].push({ cfg: heroData });
                        ArraySort(redHeroListInfo[heroCountry], function (item1, item2) {
                            var ret = null;
                            if (item1.cfg.color == item2.cfg.color) {
                                ret = item1.cfg.id < item2.cfg.id;
                            } else {
                                ret = item1.cfg.color > item2.cfg.color;
                            }
                            return ret;
                        });
                    }
                }
            }
        }
        return redHeroListInfo;
    };
    export function getHeroList(group) {
        var heroInfo = G_ConfigLoader.getConfig(ConfigNameConst.HERO);
        var heroListInfo = {};
        for (var loopi = 0; loopi < heroInfo.length(); loopi++) {
            var heroData = heroInfo.indexOf(loopi);
            var heroCountry = heroData.country;
            var heroColor = heroData.color;
            if (heroData.is_fight > 0 && heroData.is_fight <= group) {
                if (heroColor >= SeasonSportConst.HERO_SCOP_LOWERLIMIT) {
                    heroListInfo[heroCountry] = heroListInfo[heroCountry] || [];
                    if (heroListInfo[heroCountry] == null) {
                        heroListInfo[heroCountry] = [];
                    }
                    heroListInfo[heroCountry].push({ cfg: heroData });
                    ArraySort(heroListInfo[heroCountry], function (item1, item2) {
                        var ret = null;
                        if (item1.cfg.color == item2.cfg.color) {
                            if (item1.cfg.limit == item2.cfg.limit) {
                                ret = item1.cfg.id < item2.cfg.id;
                            } else {
                                ret = item1.cfg.limit > item2.cfg.limit;
                            }
                        } else {
                            ret = item1.cfg.color > item2.cfg.color;
                        }
                        return ret;
                    });
                }
            }
        }
        return heroListInfo;
    };
    export function getPetList(): any[] {
        var petInfo = G_ConfigLoader.getConfig(ConfigNameConst.PET);
        var petListInfo = [];
        for (var loopi = 0; loopi < petInfo.length(); loopi++) {
            var petData = petInfo.indexOf(loopi);
            if (Number(petData.is_fight) == 1) {
                petListInfo = petListInfo || [];
                petListInfo.push({ cfg: petData });
                ArraySort(petListInfo, function (item1, item2) {
                    var ret = null;
                    if (item1.cfg.color == item2.cfg.color) {
                        ret = item1.cfg.id < item2.cfg.id;
                    } else {
                        ret = item1.cfg.color > item2.cfg.color;
                    }
                    return ret;
                });
            }
        }
        return petListInfo;
    };
    export function getTransformCards(group): any[] {
        var avatar = [];
        let Avatar = G_ConfigLoader.getConfig(ConfigNameConst.AVATAR);
        var length = Avatar.length();
        for (var i = 0; i < length; i++) {
            var info = Avatar.indexOf(i);
            if (group >= 3) {
                if (info.color == 6 && info.limit == 0) {
                    var [bHero, heroCfg] = SeasonSportHelper.isExistHeroById(info.hero_id);
                    info.country = heroCfg.country;
                    info.limit = SeasonSportHelper.getLimitBreak();
                    avatar.push({ cfg: info });
                }
            }
            if (info.color == 5) {
                var [_, heroCfg] = isExistHeroById(info.hero_id);
                info.country = heroCfg.country;
                info.limit = heroCfg.limit > 0 ? getLimitBreak() : heroCfg.limit;
                avatar.push({ cfg: info });
            }
        }
        ArraySort(avatar, function (item1, item2) {
            if (item1.cfg.country == item2.cfg.country) {
                if (item1.cfg.color == item2.cfg.color) {
                    return item1.cfg.hero_id < item2.cfg.hero_id;
                } else {
                    return item1.cfg.color > item2.cfg.color;
                }
            } else {
                return item1.cfg.country < item2.cfg.country;
            }
        });
        return avatar;
    };
    export function getTransformCardId(heroId) {
        let Avatar = G_ConfigLoader.getConfig(ConfigNameConst.AVATAR);
        var length = Avatar.length();
        for (var i = 0; i < length; i++) {
            var info = Avatar.indexOf(i);
            if (Number(info.hero_id) == heroId) {
                return info.id;
            }
        }
        return null;
    };
    export function getTransformCardsResId(baseId) {
        let Avatar = G_ConfigLoader.getConfig(ConfigNameConst.AVATAR);
        var iconId = Number(Avatar.get(baseId).icon);
        console.assert(iconId > 0, 'avatar.lua Can\'t find the id: ' + baseId);
        return iconId;
    };
    export function getTransformCardsHeroId(baseId) {
        let Avatar = G_ConfigLoader.getConfig(ConfigNameConst.AVATAR);
        var heroId = Number(Avatar.get(baseId).hero_id);
        console.assert(heroId > 0, 'avatar.lua Can\'t find the id: ' + baseId);
        return heroId;
    };
    export function getActTimeRegion(): [boolean, number, number] {
        var date = getSeasonOpenTime();
        var todaySeconds = G_ServerTime.getTodaySeconds();
        for (var index = 0; index < date.length; index++) {
            if (todaySeconds <= date[index][1] * 3600) {
                var startTime = date[index][0] * 3600;
                var endTime = date[index][1] * 3600;
                var zeroTime = G_ServerTime.secondsFromZero();
                return [
                    false,
                    startTime + zeroTime,
                    endTime + zeroTime
                ];
            }
        }
        var zeroTime = G_ServerTime.secondsFromZero();
        if (date.length <= 0) {
            return [
                false,
                0 + zeroTime,
                3600 * 24 + zeroTime
            ];
        }
        var index = 0;
        var startTime = date[index][0] * 3600;
        var endTime = date[index][1] * 3600;
        zeroTime = zeroTime + 3600 * 24;
        return [
            true,
            startTime + zeroTime,
            endTime + zeroTime
        ];
    };
    export function getFirstStartOpenTime() {
        var date = getSeasonOpenTime();
        var oneFirstOpenTime = date[0][0];
        return oneFirstOpenTime;
    };
    export function checkSeasonRedHero(heroId) {
        var redHeroListInfo = G_UserData.getSeasonSport().getRedHeroListInfo();
        for (var index = 1; index < Object.keys(redHeroListInfo).length; index++) {
            for (var indexj = 0; indexj < redHeroListInfo[index].length; indexj++) {
                if (redHeroListInfo[index][indexj] && redHeroListInfo[index][indexj].cfg.id == heroId) {
                    return true;
                }
            }
        }
        return false;
    };
    export function getORedHeroLimitLevelById(heroId) {
        var redHeroListInfo = G_UserData.getSeasonSport().getRedHeroListInfo();
        for (var index = 1; index <= Object.keys(redHeroListInfo).length; index++) {
            for (var indexj = 0; indexj < redHeroListInfo[index].length; indexj++) {
                if (redHeroListInfo[index][indexj] && redHeroListInfo[index][indexj].cfg.id == heroId) {
                    if (redHeroListInfo[index][indexj].cfg.color == SeasonSportConst.HERO_SCOP_LOWERLIMIT) {
                        return HeroConst.HERO_LIMIT_RED_MAX_LEVEL;
                    }
                }
            }
        }
        return 0;
    };
    export function getLimitBreak() {
        var redLimit = 0;
        var group = G_UserData.getSeasonSport().getSeason_Stage();
        if (group == SeasonSportConst.SEASON_STAGE_ROOKIE) {
            redLimit = Number(getParameterConfigById(SeasonSportConst.SEASON_REDLIMIT_ROOKIE).content);
        } else if (group == SeasonSportConst.SEASON_STAGE_ADVANCED) {
            redLimit = Number(getParameterConfigById(SeasonSportConst.SEASON_REDLIMIT_ADVANCED).content);
        } else if (group == SeasonSportConst.SEASON_STAGE_HIGHT) {
            redLimit = Number(getParameterConfigById(SeasonSportConst.SEASON_REDLIMIT_HIGHT).content);
        }
        return redLimit;
    };
    export function getSileRecommand() {
        var silkBagConfig = G_ConfigLoader.getConfig(ConfigNameConst.FIGHT_SILKBAG);
        var group = G_UserData.getSeasonSport().getSeason_Stage();
        var list = [];
        var length = silkBagConfig.length();
        for (var i = 1; i != length; i++) {
            var info = silkBagConfig.indexOf(i);
            if (info.area == group) {
                list.push(info);
            }
        }
        return list;
    };
    export function getSeasonDailyData() {
        var dailyFightResult = G_UserData.getSeasonSport().getDailyFightReward();
        var dailyWinResult = G_UserData.getSeasonSport().getDailyWinReward();
        var ownDailyData = getSeasonDailyFightReward();
        var ownDailyWinData = getSeasonDailyWinReward();
        var fightNum = G_UserData.getSeasonSport().getFightNum();
        var winNum = G_UserData.getSeasonSport().getWinNum();
        for (let index in ownDailyData) {
            var value = ownDailyData[index];
            value.gotstate = dailyFightResult[index] != null && dailyFightResult[index] || 0;
            value.achievestate = value.num <= fightNum && 1 || 0;
        }
        for (let index in ownDailyWinData) {
            var value = ownDailyWinData[index];
            value.gotstate = dailyWinResult[index] != null && dailyWinResult[index] || 0;
            value.achievestate = value.num <= winNum && 1 || 0;
        }
        for (let index in ownDailyWinData) {
            var value = ownDailyWinData[index];
            ownDailyData.push(value);
        }
        for (let index in ownDailyData) {
            var value = ownDailyData[index];
            if (value.gotstate == 0 && value.achievestate == 1) {
                value.state = 0;
            } else if (value.gotstate == 1) {
                value.state = 2;
            } else {
                value.state = 1;
            }
        }
        ArraySort(ownDailyData, function (a, b) {
            if (a.state == b.state) {
                return a.idx < b.idx;
            } else {
                return a.state < b.state;
            }
        });
        return ownDailyData;
    };
}