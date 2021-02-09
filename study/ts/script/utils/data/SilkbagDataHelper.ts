import { stringUtil } from "../StringUtil";
import { G_ConfigLoader, G_UserData } from "../../init";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import { AttrDataHelper } from "./AttrDataHelper";
import ParameterIDConst from "../../const/ParameterIDConst";
import { AvatarDataHelper } from "./AvatarDataHelper";
import { TypeConvertHelper } from "../TypeConvertHelper";
import { FunctionConst } from "../../const/FunctionConst";
import { SilkbagConst } from "../../const/SilkbagConst";
import { HeroDataHelper } from "./HeroDataHelper";

export namespace SilkbagDataHelper {
    export function getSilkbagConfig(id) {
        let info = G_ConfigLoader.getConfig(ConfigNameConst.SILKBAG).get(id);
        console.assert(info, 'silkbag config can not find id = %d');
        return info;
    };
    export function getSilkMappingConfig(silkId, heroId) {
        let info = G_ConfigLoader.getConfig(ConfigNameConst.SILK_MAPPING).get(silkId, heroId);
        console.assert(info, 'silk_mapping config can not find silk_id = %d, hero_id = %d');
        return info;
    };
    export function  getAttrWithId(id, userLevel) {
        var tempLevel = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.SILKBAG_START_LV).content);
        var result = {};
        var info = SilkbagDataHelper.getSilkbagConfig(id);
        for (var i = 1; i <= 2; i++) {
            var attrType = info['type' + i];
            var attrSize = info['size' + i];
            var growth = info['growth' + i];
            var ratio = Math.max(userLevel - tempLevel, 0);
            var attrValue = attrSize + growth * ratio;
            AttrDataHelper.formatAttr(result, attrType, attrValue);
        }
        return result;
    };
    export function getHeroIconsData() {
        let result = [];
        let heroIds = G_UserData.getTeam().getHeroIds();
        for (let i in heroIds) {
            let heroId = heroIds[i];
            var j = parseFloat(i) + 1;
            if (heroId > 0) {
                let unitData = G_UserData.getHero().getUnitDataWithId(heroId);
                let [heroBaseId,, isEquipAvatar, avatarLimitLevel, arLimitLevel] = AvatarDataHelper.getShowHeroBaseIdByCheck(unitData);
                let info = {
                    type: TypeConvertHelper.TYPE_HERO,
                    value: heroBaseId,
                    funcId: FunctionConst['FUNC_TEAM_SLOT' + j ],
                    id: heroId,
                    limitLevel: avatarLimitLevel || unitData.getLimit_level(),
                    limitRedLevel : arLimitLevel || unitData.getLimit_rtg()
                };
                result.push(info);
            }
        }
        return result;
    };

    export function  isEffectiveSilkBagToHero(silkbagId, heroBaseId, heroRank, isInstrumentMaxLevel, heroLimit, heroRedLimit):any[] {
        var silkbagInfo = SilkbagDataHelper.getSilkbagConfig(silkbagId);
        var strHero = silkbagInfo.hero;
        if (strHero == (SilkbagConst.ALL_HERO_ID).toString()) {
            return [true];
        }
        if (strHero == (SilkbagConst.ALL_MALE_ID).toString() && HeroDataHelper.getHeroConfig(heroBaseId).gender == 1) {
            return [true];
        }
        if (strHero == (SilkbagConst.ALL_FEMALE_ID).toString() && HeroDataHelper.getHeroConfig(heroBaseId).gender == 2) {
            return [true];
        }
        var [heroIds] = G_UserData.getSilkbag().getHeroIdsWithSilkbagId(silkbagId);
        var silkId = silkbagInfo.mapping;
        for (let i in heroIds) {
            var heroId = heroIds[i];
            if (heroId == heroBaseId) {
                var info = SilkbagDataHelper.getSilkMappingConfig(silkId, heroBaseId);
                var [isEffective, limitRank, isEffectiveForInstrument, limitLevel, limitRedLevel] = SilkbagDataHelper.isEffectiveWithHeroRankAndInstrument(info, heroRank, isInstrumentMaxLevel, heroLimit, heroRedLimit);
                return [
                    isEffective,
                    limitRank,
                    isEffectiveForInstrument,
                    limitLevel
                ];
            }
        }
        return [
            false,
            false
        ];
    };

    export function isEffectiveWithHeroRankAndInstrument(info, heroRank, isInstrumentMaxLevel, heroLimit, heroRedLimit) {
        var isRankEffective = false;
        var isInstrumentEffective = false;
        var isLimitEffective = false;
        var isRedLimitEffective = false;
        heroRedLimit = heroRedLimit || 0;
        var limitRank = SilkbagDataHelper.getLimitRankForEffective(info);
        if (limitRank != undefined) {
            if (heroRank >= limitRank) {
                isRankEffective = true;
            } else {
                isRankEffective = false;
            }
        } else {
            isRankEffective = false;
        }
        var isEffectiveForInstrument = info.effective_5 == 1;
        if (isEffectiveForInstrument && isInstrumentMaxLevel) {
            isInstrumentEffective = true;
        }
        var limitLevel = SilkbagDataHelper.getLimitLevelForEffective(info);
        if (limitLevel > 0) {
            if (heroLimit >= limitLevel) {
                isLimitEffective = true;
            } else {
                isLimitEffective = false;
            }
        } else {
            isLimitEffective = false;
        }
        var limitRedLevel = SilkbagDataHelper.getRedLimitLevelForEffective(info);
        if (limitRedLevel > 0) {
            if (heroRedLimit >= limitRedLevel) {
                isRedLimitEffective = true;
            } else {
                isRedLimitEffective = false;
            }
        } else {
            isRedLimitEffective = false;
        }
        var isEffective = isRankEffective || isInstrumentEffective || isLimitEffective || isRedLimitEffective;
        return [
            isEffective,
            limitRank,
            isEffectiveForInstrument,
            limitLevel,
            limitRedLevel
        ];
    };
    export function getRedLimitLevelForEffective (info) {
        var effectIndex2Level = {
            [9]: 1,
            [10]: 2,
            [11]: 3,
            [12]: 4
        };
        var limitRedLevel = 0;
        for (var i = 9; i <= 12; i++) {
            var effective = info['effective_' + i];
            if (effective == 1) {
                limitRedLevel = effectIndex2Level[i];
                break;
            }
        }
        return limitRedLevel;
    };

    export function getLimitRankForEffective(info) {
        let effectIndex2Rank = [
            0,
            5,
            8,
            10
        ];
        let limitRank = null;
        for (let i = 0; i < effectIndex2Rank.length; i++) {
            let rank = effectIndex2Rank[i];
            let effective = info['effective_' + (i + 1)];
            if (effective == 1) {
                limitRank = rank;
                break;
            }
        }
        return limitRank;
    };
    export function getLimitLevelForEffective(info) {
        let effectIndex2Level = {
            6: 1,
            7: 2,
            8: 3
        };
        let limitLevel = 0;
        for (let i = 6; i <= 8; i++) {
            let effective = info['effective_' + i];
            if (effective == 1) {
                limitLevel = effectIndex2Level[i];
                break;
            }
        }
        return limitLevel;
    };
    export function getEffectWithBaseId(baseId) {
        let result = null;
        let info = getSilkbagConfig(baseId);
        let moving = info.moving;
        if (moving != null && moving != '0' && moving != '') {
            result = stringUtil.split(moving, '|');
        }
        return result;
    };
}
