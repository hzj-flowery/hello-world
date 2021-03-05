import { HeroDataHelper } from "../../../utils/data/HeroDataHelper";

export default class HeroTrainHelper {
    public static checkAwakeIsEnoughLevel(heroUnitData) {
        var limitLevel = HeroDataHelper.getHeroAwakeLimitLevel(heroUnitData);
        if (limitLevel == null) {
            return [
                true,
                limitLevel
            ];
        }
        var curLevel = heroUnitData.getLevel();
        var enough = curLevel >= limitLevel;
        return [
            enough,
            limitLevel
        ];
    };
    public static checkIsReachAwakeInitLevel(heroUnitData) {
        var initLevel = heroUnitData.getConfig().awaken_base || 0;
        var awakeCost = heroUnitData.getConfig().awaken_cost || 0;
        var info = HeroDataHelper.getHeroAwakenConfig(initLevel, awakeCost);
        var limitLevel = info.level;
        var curLevel = heroUnitData.getLevel();
        return curLevel >= limitLevel;
    };
}