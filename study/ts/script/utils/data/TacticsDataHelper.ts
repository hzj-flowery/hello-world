import { assert } from "../GlobleFunc";
import { G_ConfigLoader, G_UserData } from "../../init";
import { TacticsConst } from "../../const/TacticsConst";
import { SilkbagDataHelper } from "./SilkbagDataHelper";
import { HeroDataHelper } from "./HeroDataHelper";
import { Lang } from "../../lang/Lang";
import { table } from "../table";
import { UserDataHelper } from "./UserDataHelper";
import { TypeConvertHelper } from "../TypeConvertHelper";
import { AttrDataHelper } from "./AttrDataHelper";
import AttributeConst from "../../const/AttributeConst";

export namespace TacticsDataHelper {

    export function getTacticsConfig(id) {
        var info = G_ConfigLoader.getConfig('tactics').get(id);
        assert(info, ('tactics config can not find id = %d'));
        return info;
    };
    export function getTacticsHeroConfig(tacticsId, heroId) {
        var info = G_ConfigLoader.getConfig('tactics_hero').get(tacticsId, heroId);
        assert(info, ('tactics_hero config can not find tactics_id = %d, hero_id = %d'));
        return info;
    };
    export function getTacticsParameter(keyIndex) {
        var TacticsParameter = G_ConfigLoader.getConfig('tactics_parameter');
        for (var i = 0; i < TacticsParameter.length(); i++) {
            var territoryData = TacticsParameter.indexOf(i);
            if (territoryData.key == keyIndex) {
                return territoryData.content;
            }
        }
        assert(false, ' can\'t find key index in TacticsParameter ' + keyIndex);
        return null;
    };
    export function getTacticsStudyConfig(id) {
        var info = G_ConfigLoader.getConfig('tactics_study').get(id);
        assert(info, ('tactics_study config can not find id = %d'));
        return info;
    };
    export function isSpecialSuitableHeroType(suitType) {
        var isSpecial = false;
        if (suitType == TacticsConst.SUIT_TYPE_FEMALE || suitType == TacticsConst.SUIT_TYPE_MALE || suitType == TacticsConst.SUIT_TYPE_ALL || suitType == TacticsConst.SUIT_TYPE_JOINT) {
            isSpecial = true;
        }
        return isSpecial;
    };
    export const getLimitRankForEffective = SilkbagDataHelper.getLimitRankForEffective;
    export const getLimitLevelForEffective = SilkbagDataHelper.getLimitLevelForEffective;
    export const getRedLimitLevelForEffective = SilkbagDataHelper.getRedLimitLevelForEffective;
    export const isEffectiveWithHeroRankAndInstrument = SilkbagDataHelper.isEffectiveWithHeroRankAndInstrument;
    export function _getEffectiveStr(tacticsBaseId, hid, heroBaseId) {
        var info = TacticsDataHelper.getTacticsHeroConfig(tacticsBaseId, hid);
        var limitRank = TacticsDataHelper.getLimitRankForEffective(info);
        var limitLevel = TacticsDataHelper.getLimitLevelForEffective(info);
        var limitRedLevel = TacticsDataHelper.getRedLimitLevelForEffective(info);
        var heroInfo = HeroDataHelper.getHeroConfig(heroBaseId);
        var heroName = heroInfo.name;
        var strLimit = heroInfo.name;
        if (limitRank) {
            if (limitRank > 0) {
                strLimit = strLimit + Lang.get('tactics_effective_rank', { rank: limitRank });
            }
        } else if (info.effective_5 == 1) {
            var instrumentMaxLevel = G_ConfigLoader.getConfig('instrument').get(heroInfo.instrument_id).level_max;
            strLimit = strLimit + Lang.get('tactics_effective_instrument', { level: instrumentMaxLevel });
        } else if (limitLevel > 0) {
            if (heroInfo.limit == 1) {
                strLimit = strLimit + Lang.get('tactics_effective_limit' + limitLevel);
            }
        } else if (limitRedLevel > 0) {
            if (heroInfo.limit_red == 1) {
                strLimit = strLimit + Lang.get('tactics_effective_limit_red' + limitRedLevel);
            }
        }
        return [strLimit, heroName];
    };
    export function getTacticsHeroConfigWithHeroId(tacticsBaseId, heroId) {
        var config = G_ConfigLoader.getConfig('tactics_hero');
        var heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
        var heroBaseId = heroUnitData.getAvatarToHeroBaseId();
        var info = config.get(tacticsBaseId, heroBaseId);
        if (!info) {
            var heroInfo = heroUnitData.getConfig();
            var len = config.length();
            for (var i = 0; i < len; i++) {
                var item = config.indexOf(i);
                if (item.tactics_id == tacticsBaseId) {
                    if (item.hero_id == heroBaseId) {
                        return item;
                    } else if (item.hero_id == TacticsConst.SUIT_TYPE_ALL) {
                        return item;
                    } else if (item.hero_id == TacticsConst.SUIT_TYPE_MALE && heroInfo.gender == 1) {
                        return item;
                    } else if (item.hero_id == TacticsConst.SUIT_TYPE_FEMALE && heroInfo.gender == 2) {
                        return item;
                    } else if (item.hero_id == TacticsConst.SUIT_TYPE_JOINT && heroInfo.skill_3_type != 0) {
                        return item;
                    }
                }
            }
        }
        return info;
    };
    export function isEffectiveTacticsToHero(tacticsBaseId, pos) {
        var heroId = G_UserData.getTeam().getHeroIdWithPos(pos);
        var info = TacticsDataHelper.getTacticsHeroConfigWithHeroId(tacticsBaseId, heroId);
        if (info == null) {
            return false;
        }
        var heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
        var heroRank = heroUnitData.getRank_lv();
        var isInstrumentMaxLevel = G_UserData.getInstrument().isInstrumentLevelMaxWithPos(pos);
        var heroLimit = heroUnitData.getLeaderLimitLevel();
        var heroRedLimit = heroUnitData.getLeaderLimitRedLevel();
        var isEffective = TacticsDataHelper.isEffectiveWithHeroRankAndInstrument(info, heroRank, isInstrumentMaxLevel, heroLimit, heroRedLimit), limitRank, isEffectiveForInstrument, limitLevel, limitRedLevel;
        return [
            isEffective,
            limitRank,
            isEffectiveForInstrument,
            limitLevel
        ];
    };
    export function getTacticsSuitInfo() {
        var tacticsConfig = G_ConfigLoader.getConfig('tactics');
        var len = tacticsConfig.length();
        var heroConfig = G_ConfigLoader.getConfig('hero');
        var hlen = heroConfig.length();
        var tacticsMapConfig = G_ConfigLoader.getConfig('tactics_hero');
        var resList = {};
        for (var i = 0; i < len; i++) {
            var tacticsInfo = tacticsConfig.indexOf(i);
            if (tacticsInfo.gm > 0) {
                var mapId = tacticsInfo.mapping;
                var mlen = tacticsMapConfig.length();
                var heroIdList = [];
                for (var mi = 0; mi < mlen; mi++) {
                    var minfo = tacticsMapConfig.indexOf(mi);
                    if (minfo.tactics_id == mapId) {
                        table.insert(heroIdList, minfo.hero_id);
                    }
                }
                var heroIds = [];
                var tmpLimitStrs = [];
                var tmpHeroName = [];
                var suitType = TacticsConst.SUIT_TYPE_NONE;
                for (var _ in heroIdList) {
                    var heroId = heroIdList[_];
                    if (!TacticsDataHelper.isSpecialSuitableHeroType(heroId)) {
                        table.insert(heroIds, heroId);
                        var [str, name] = TacticsDataHelper._getEffectiveStr(tacticsInfo.id, heroId, heroId);
                        table.insert(tmpHeroName, name);
                        table.insert(tmpLimitStrs, str);
                    } else {
                        suitType = heroId;
                        if (heroId == TacticsConst.SUIT_TYPE_ALL) {
                            for (var hi = 0; hi < hlen; hi++) {
                                var info = heroConfig.indexOf(hi);
                                if (info.type == 1) {
                                    table.insert(heroIds, info.id);
                                    var [str, name] = TacticsDataHelper._getEffectiveStr(tacticsInfo.id, heroId, info.id);
                                    table.insert(tmpHeroName, name);
                                    table.insert(tmpLimitStrs, str);
                                } else if (info.type == 2 && info.color >= 4) {
                                    table.insert(heroIds, info.id);
                                    var [str, name] = TacticsDataHelper._getEffectiveStr(tacticsInfo.id, heroId, info.id);
                                    table.insert(tmpHeroName, name);
                                    table.insert(tmpLimitStrs, str);
                                }
                            }
                        } else if (heroId == TacticsConst.SUIT_TYPE_MALE) {
                            for (var hi = 0; hi < hlen; hi++) {
                                var info = heroConfig.indexOf(hi);
                                if (info.type == 1 && info.gender == 1) {
                                    table.insert(heroIds, info.id);
                                    var [str, name] = TacticsDataHelper._getEffectiveStr(tacticsInfo.id, heroId, info.id);
                                    table.insert(tmpHeroName, name);
                                    table.insert(tmpLimitStrs, str);
                                } else if (info.type == 2 && info.gender == 1 && info.color >= 4) {
                                    table.insert(heroIds, info.id);
                                    var [str, name] = TacticsDataHelper._getEffectiveStr(tacticsInfo.id, heroId, info.id);
                                    table.insert(tmpHeroName, name);
                                    table.insert(tmpLimitStrs, str);
                                }
                            }
                        } else if (heroId == TacticsConst.SUIT_TYPE_FEMALE) {
                            for (var hi = 0; hi < hlen; hi++) {
                                var info = heroConfig.indexOf(hi);
                                if (info.type == 1 && info.gender == 2) {
                                    table.insert(heroIds, info.id);
                                    var [str, name] = TacticsDataHelper._getEffectiveStr(tacticsInfo.id, heroId, info.id);
                                    table.insert(tmpHeroName, name);
                                    table.insert(tmpLimitStrs, str);
                                } else if (info.type == 2 && info.gender == 2 && info.color >= 4) {
                                    table.insert(heroIds, info.id);
                                    var [str, name] = TacticsDataHelper._getEffectiveStr(tacticsInfo.id, heroId, info.id);
                                    table.insert(tmpHeroName, name);
                                    table.insert(tmpLimitStrs, str);
                                }
                            }
                        } else if (heroId == TacticsConst.SUIT_TYPE_JOINT) {
                            for (var hi = 0; hi < hlen; hi++) {
                                var info = heroConfig.indexOf(hi);
                                if (info.type == 2 && info.skill_3_type != 0 && info.color >= 4) {
                                    table.insert(heroIds, info.id);
                                    var [str, name] = TacticsDataHelper._getEffectiveStr(tacticsInfo.id, heroId, info.id);
                                    table.insert(tmpHeroName, name);
                                    table.insert(tmpLimitStrs, str);
                                }
                            }
                        }
                    }
                }
                var limitStrs = [];
                var limitStrMap = [];
                var heroNames = [];
                for (var x in tmpLimitStrs) {
                    var v = tmpLimitStrs[x];
                    if (!limitStrMap[v]) {
                        limitStrMap[v] = x;
                        table.insert(heroNames, tmpHeroName[x])
                        table.insert(limitStrs, v);
                    }
                }
                resList[tacticsInfo.id] = {
                    heroIds: heroIds,
                    limitStrs: limitStrs,
                    heroName: heroNames,
                    suitType: suitType
                };
            }
        }
        return resList;
    };
    export function getTacticsPosUnlockParam(pos) {
        var color = 0;
        var num = 0;
        var cost = 0;
        if (pos == 1) {
            return [
                color,
                num,
                cost
            ];
        }
        var info = TacticsDataHelper.getTacticsParameter(TacticsConst['PARAM_UNLCOK_' + pos]);
        if (info) {
            var tab = (info).split('|');
            color = Number(tab[0]);
            num = Number(tab[1]);
            cost = Number(tab[2]);
        }
        return [
            color,
            num,
            cost
        ];
    };
    export function getMutexMap(id) {
        var config = TacticsDataHelper.getTacticsConfig(id);
        var info = config.mutex;
        var map = {};
        if (info != '' && info != '0') {
            for (var i in (info).split('|')) {
                var v = (info).split('|')[i];
                map[Number(v)] = true;
            }
        }
        return map;
    };
    export function getTacticsColorPath(tacticsUnitData) {
        var color = tacticsUnitData.getConfig().color;
        var colorPath = TacticsConst['ICON_COLOR_PATH_' + color] || TacticsConst.ICON_COLOR_PATH_5;
        return colorPath;
    };
    export function isCanUnlocked(tacticsUnitData) {
        if (tacticsUnitData.isUnlocked()) {
            return false;
        }
        var materrials = TacticsDataHelper.getUnlockedMaterials(tacticsUnitData);
        for (var i in materrials) {
            var v = materrials[i];
            var num = UserDataHelper.getSameCardCount(v.type, v.value);
            if (num < v.size) {
                return false;
            }
        }
        return true;
    };
    export function getUnlockedMaterials(tacticsUnitData) {
        var materials = [];
        if (tacticsUnitData.isUnlocked()) {
            return materials;
        }
        var heroIdMap = {};
        var heroIdOrder = [];
        for (var i = 1; i <= 4; i++) {
            var heroId = tacticsUnitData.getStudyConfig()['unlock_hero' + i];
            if (heroId != 0) {
                if (heroIdMap[heroId]) {
                    heroIdMap[heroId] = heroIdMap[heroId] + 1;
                } else {
                    heroIdMap[heroId] = 1;
                    table.insert(heroIdOrder, heroId);
                }
            }
        }
        for (var _ in heroIdOrder) {
            var heroId = heroIdOrder[_];
            var num = heroIdMap[heroId];
            table.insert(materials, {
                type: TypeConvertHelper.TYPE_HERO,
                value: heroId,
                size: num
            });
        }
        return materials;
    };
    export function getTacticsNumInfoByColor(color) {
        var tacticsConfig = G_ConfigLoader.getConfig('tactics');
        var totalNum = 0;
        var len = tacticsConfig.length();
        for (var i = 0; i < len; i++) {
            var tacticsInfo = tacticsConfig.indexOf(i);
            if (tacticsInfo.color == color && tacticsInfo.gm > 0) {
                totalNum = totalNum + 1;
            }
        }
        var list = G_UserData.getTactics().getTacticsList(TacticsConst.GET_LIST_TYPE_STUDIED);
        var num = 0;
        for (var x in list) {
            var v = list[x];
            if (v.getConfig().color == color) {
                num = num + 1;
            }
        }
        return [
            num,
            totalNum
        ];
    };
    export function getTacticsTabImgPath(index, isSel) {
        var color = index + 4;
        var sel = isSel && 1 || 2;
        var path = TacticsConst['TAB_COLOR_' + (color + ('_' + sel))];
        return path;
    };
    export function getAttrSingleInfo(unitData) {
        var info = unitData.getConfig();
        var result = {};
        return result;
    };
    export function getPowerSingleInfo(unitData) {
        var info = unitData.getConfig();
        var result = {};
        AttrDataHelper.formatAttr(result, AttributeConst.TACTICS_POWER, info.fake);
        return result;
    }
}