
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { assert } from "../../../utils/GlobleFunc";

import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { HeroConst } from "../../../const/HeroConst";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { G_ConfigLoader } from "../../../init";
import { LimitCostConst } from "../../../const/LimitCostConst";
import { DataConst } from "../../../const/DataConst";
import { HeroDataHelper } from "../../../utils/data/HeroDataHelper";

export default class HeroGoldHelper {

    //是否为纯金将
    public static isPureHeroGold = function (heroUnitData): boolean {
        var isColor = heroUnitData.getConfig().color == 7;
        var isLeader = heroUnitData.isLeader();
        return isColor && !isLeader && heroUnitData.getLimit_level() == 0;
    };
    public static heroGoldTrainCostInfo = function (heroUnitData) {
        if (!HeroGoldHelper.isPureHeroGold(heroUnitData)) {
            return [null, null];
        }
        var goldLevel = heroUnitData.getRank_lv();
        var costInfo = HeroGoldHelper.getCostConfig(goldLevel);
        return [
            costInfo,
            heroUnitData.getBase_id()
        ];
    };
    public static heroGoldCanRankUp = function (heroUnitData) {
        if (!HeroGoldHelper.isPureHeroGold(heroUnitData)) {
            return false;
        }
        if (heroUnitData.getRank_lv() >= HeroConst.HERO_GOLD_MAX_RANK) {
            return false;
        }
        var costInfo = HeroGoldHelper.heroGoldTrainCostInfo(heroUnitData)[0];
        var isCan = true;
        var oweCount = UserDataHelper.getSameCardCount(TypeConvertHelper.TYPE_HERO, heroUnitData.getBase_id(), heroUnitData.getId());
        for (var key = LimitCostConst.LIMIT_COST_KEY_1; key <= LimitCostConst.LIMIT_COST_KEY_4; key++) {
            var curCount = heroUnitData.getGoldResValue(key);
            if (key == LimitCostConst.LIMIT_COST_KEY_1) {
                isCan = isCan && oweCount >= costInfo['cost_hero'];
            } else {
                isCan = isCan && curCount >= costInfo['size_' + key];
            }
        }
        return isCan;
    };
    public static getCostConfig = function (rank_lv) {

        var costInfo = G_ConfigLoader.getConfig(ConfigNameConst.GOLD_HERO_TRAIN).get(rank_lv);
        //assert((costInfo, 'gold_hero_train not found config by ' + rank_lv);
        return costInfo;
    };
    public static isHaveCanFullMaterialsByKey = function (key, heroUnitData) {
        var costInfo = HeroGoldHelper.heroGoldTrainCostInfo(heroUnitData)[0];
        if (key == LimitCostConst.LIMIT_COST_KEY_1) {
            var allCount = UserDataHelper.getSameCardCount(TypeConvertHelper.TYPE_HERO, heroUnitData.getBase_id(), heroUnitData.getId());
            return [
                allCount >= costInfo['cost_hero'],
                allCount >= costInfo['cost_hero']
            ];
        }
        else if (key == LimitCostConst.LIMIT_COST_KEY_2) {
            var ownExp = heroUnitData.getGoldResValue(key);
            var curExp = ownExp;
            for (var j = 1; j <= 4; j++) {
                var count = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, DataConst['ITEM_HERO_LEVELUP_MATERIAL_' + j]);
                var itemValue = G_ConfigLoader.getConfig(ConfigNameConst.ITEM).get(DataConst['ITEM_HERO_LEVELUP_MATERIAL_' + j]).item_value;
                var itemExp = count * itemValue;
                ownExp = ownExp + itemExp;
            }
            return [
                curExp >= costInfo['size_' + key],
                ownExp >= costInfo['size_' + key]
            ];
        }
        else {
            var curCount = heroUnitData.getGoldResValue(key);
            allCount = UserDataHelper.getNumByTypeAndValue(costInfo['type_' + key], costInfo['value_' + key]) + curCount;
            return [
                curCount >= costInfo['size_' + key],
                allCount >= costInfo['size_' + key]
            ];
        }
    };
    public static heroGoldNeedRedPoint = function (heroUnitData): Array<boolean> {
        if (heroUnitData.getRank_lv() >= HeroConst.HERO_GOLD_MAX_RANK) {
            return [
                false,
                false
            ];
        }
        var costInfo = HeroGoldHelper.heroGoldTrainCostInfo(heroUnitData)[0];
        if (!costInfo) {
            return [
                false,
                false
            ];
        }
        var silver = costInfo['break_size'];
        var haveCoin = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, 2);
        var isFull = HeroGoldHelper.heroGoldCanRankUp(heroUnitData);
        if (isFull) {
            return [
                haveCoin >= silver,
                haveCoin >= silver
            ];
        } else {
            var isAnyCanFull = false;
            var isAllCanFull = true;
            for (var key = LimitCostConst.LIMIT_COST_KEY_1; key <= LimitCostConst.LIMIT_COST_KEY_4; key++) {
                var [isOneFull, isCanFull] = HeroGoldHelper.isHaveCanFullMaterialsByKey(key, heroUnitData);
                isAnyCanFull = isAnyCanFull || isCanFull && !isOneFull;
                isAllCanFull = isAllCanFull && isCanFull;
            }
            return [
                isAnyCanFull,
                isAllCanFull
            ];
        }
    };

    public static getHeroIconRes(baseId) {
        var heroInfo = HeroDataHelper.getHeroConfig(baseId);
        var heroResInfo = HeroDataHelper.getHeroResConfig(heroInfo.res_id);
        var heroIconRes = heroResInfo.gold_hero_icon;
        return heroIconRes;
    };
    public static getHeroNameRes(baseId) {
        var heroInfo = HeroDataHelper.getHeroConfig(baseId);
        var heroResInfo = HeroDataHelper.getHeroResConfig(heroInfo.res_id);
        var heroNameRes = heroResInfo.gold_hero_name;
        return heroNameRes;
    };
}