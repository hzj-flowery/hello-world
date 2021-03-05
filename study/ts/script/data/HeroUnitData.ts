import { BaseData } from "./BaseData";
import { G_UserData, G_ConfigLoader } from "../init";
import { HeroConst } from "../const/HeroConst";
import { TypeConvertHelper } from "../utils/TypeConvertHelper";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { UserDataHelper } from "../utils/data/UserDataHelper";
import { AvatarDataHelper } from "../utils/data/AvatarDataHelper";
import { HeroDataHelper } from "../utils/data/HeroDataHelper";

let schema = {};
schema['type'] = [
    'number',
    1
];
schema['id'] = [
    'number',
    0
];
schema['base_id'] = [
    'number',
    0
];
schema['level'] = [
    'number',
    0
];
schema['exp'] = [
    'number',
    0
];
schema['history_gold'] = [
    'number',
    0
];
schema['quality'] = [
    'number',
    0
];
schema['rank_lv'] = [
    'number',
    0
];
schema['association'] = [
    'object',
    {}
];
schema['awaken_level'] = [
    'number',
    0
];
schema['awaken_slots'] = [
    'object',
    {}
];
schema['limit_level'] = [
    'number',
    0
];
schema['limit_res'] = [
    'object',
    {}
];
schema['config'] = [
    'object',
    {}
];
schema['gold_res'] = [
    'object',
    {}
];
schema['willActivateYokeCount'] = [
    'number',
    0
];
schema['limit_rtg'] = [ //红升金
    'number',
    0
];
schema['limit_rtg_res'] = [ //红升金资源
    'object',
    {}
];
schema['rtg_cost_hero'] = [
    'object',
    {}
];

export interface HeroUnitData {

    getId(): number
    setId(value: number): void
    getLastId(): number
    getBase_id(): number
    setBase_id(value: number): void
    getLastBase_id(): number
    getLevel(): number
    setLevel(value: number): void
    getLastLevel(): number
    getExp(): number
    setExp(value: number): void
    getLastExp(): number
    getHistory_gold(): number
    setHistory_gold(value: number): void
    getLastHistory_gold(): number
    getQuality(): number
    setQuality(value: number): void
    getLastQuality(): number
    getRank_lv(): number
    setRank_lv(value: number): void
    getLastRank_lv(): number
    getAssociation(): any[]
    setAssociation(value: any[]): void
    getLastAssociation(): any[]
    getAwaken_level(): number
    setAwaken_level(value: number): void
    getLastAwaken_level(): number
    getAwaken_slots(): Object
    setAwaken_slots(value: Object): void
    getLastAwaken_slots(): Object
    getLimit_level(): number
    setLimit_level(value: number): void
    getLastLimit_level(): number
    getLimit_res(): Object
    setLimit_res(value: Object): void
    getLastLimit_res(): Object
    getConfig(): any
    setConfig(value: any): void
    getLastConfig(): any
    getGold_res(): Object
    setGold_res(value: Object): void
    getLastGold_res(): Object
    getWillActivateYokeCount(): number
    setWillActivateYokeCount(value: number): void
    getLastWillActivateYokeCount(): number
    getLimit_rtg_res(): any
    getLimit_rtg(): any
    getRtg_cost_hero(): any
}
/**
 * 预先加载的资源
 * app.config.hero
 */
export class HeroUnitData extends BaseData {
    public static schema = schema;

    constructor() {
        super()
        this._isUserHero = true;
    }

    private _isUserHero: boolean;
    public clear() {
    }
    public reset() {
    }
    public updateData(data) {
        this.backupProperties();
        super.setProperties(data);
        var config = G_ConfigLoader.getConfig(ConfigNameConst.HERO).get(data.base_id);
        if (config) {
            this.setConfig(config);
        }
        else {
            cc.error("没有找到这个武将的相关配置-----", data.base_id);
        }
    }
    public getPos(): number {
        var heroIds = G_UserData.getTeam().getHeroIds();
        for (var i in heroIds) {
            var id = heroIds[i];
            if (this.getId() == id) {
                return parseInt(i) + 1;
            }
        }
        return null;
    }
    public getSecondPos(): number {
        var secondHeroIds = G_UserData.getTeam().getSecondHeroIds();
        for (var i in secondHeroIds) {
            var id = secondHeroIds[i];
            if (this.getId() == id) {
                return parseInt(i) + 1;
            }
        }
        return null;
    }
    public isLeader() {
        return this.getConfig().type == 1;
    }
    public isInBattle() {
        var pos: number = this.getPos();
        if (pos && pos >= 0) {
            return true;
        } else {
            return false;
        }
    }
    public isInReinforcements() {
        var secondPos = this.getSecondPos();
        if (secondPos && secondPos > 0) {
            return true;
        } else {
            return false;
        }
    }
    public getYokeTotalCount() {
        var totalCount = 0;
        var config = this.getConfig();
        for (var i = 1; i <= HeroConst.HERO_YOKE_MAX; i++) {
            var fateId = config['fate_' + i];
            if (fateId > 0) {
                totalCount = totalCount + 1;
            }
        }
        return totalCount;
    }

    public getActivedYokeCount() {
        var count = this.getAssociation().length;
        return count;
    }
    public isActivatedYoke(fateId) {
        var ids = this.getAssociation();
        for (var i in ids) {
            var id = ids[i];
            if (id == fateId) {
                return true;
            }
        }
        return false;
    }

    /**
     * @param beReplacedId 
     */
    public isActiveJoint(beReplacedId?): boolean {
        var heroConfig = this.getConfig();
        if (heroConfig.skill_3_type != 0) {
            var partnerId = heroConfig.skill_3_partner;
            if (partnerId == beReplacedId) {
                return false;
            }
            var heroIds = G_UserData.getTeam().getHeroIds();
            for (var i in heroIds) {
                var id = heroIds[i];
                if (id > 0) {
                    var unitData = G_UserData.getHero().getUnitDataWithId(id);
                    var heroBaseId = AvatarDataHelper.getShowHeroBaseIdByCheck(unitData)[0];
                    if (heroBaseId == partnerId) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    public isDidUpgrade() {
        if (this.isPureGoldHero()) {
            return false;
        }
        return this.getLevel() > 1;
    }
    public isDidBreak() {
        return this.getRank_lv() > 0;
    }
    public isDidAwake() {
        return this.getAwaken_level() > 0;
    }
    isDidLimit() {
        if (this.getLimit_level() > 0) {
            return true;
        }
        for (var key = HeroConst.HERO_LIMIT_COST_KEY_1; key != HeroConst.HERO_LIMIT_COST_KEY_6; key++) {
            var value = this.getLimitCostCountWithKey(key, HeroConst.HERO_LIMIT_TYPE_RED);
            if (value > 0) {
                return true;
            }
            var value2 = this.getLimitCostCountWithKey(key, HeroConst.HERO_LIMIT_TYPE_GOLD);
            if (value > 0) {
                return true;
            }
        }
        return false;
    }

    isDidLimitRed() {
        if (this.getLimit_rtg() > 0) {
            return true;
        }
        for (var key = HeroConst.HERO_LIMIT_COST_KEY_1; key != HeroConst.HERO_LIMIT_COST_KEY_6; key++) {
            var value = this.getLimitCostCountWithKey(key, HeroConst.HERO_LIMIT_TYPE_GOLD);
            if (value > 0) {
                return true;
            }
        }
        return false;
    }
    isDidLitmitRedWithGold() {
        var costHero = this.getRtg_cost_hero();
        for (var k in costHero) {
            var v = costHero[k];
            var type = TypeConvertHelper.TYPE_HERO;
            var value = v.Key;
            var size = v.Value;
            if(HeroDataHelper.getHeroConfig(value).color == 7) {
                return true;
            }
        }
        return false;
    }
  
    public isDidGoldRankLv() {
        if (this.isDidBreak()) {
            return true;
        }
        var gold_res = this.getGold_res();
        for (var _ in gold_res) {
            var res = gold_res[_];
            if (res.Value > 0) {
                return true;
            }
        }
        return false;
    }

    public isDidTrain() {
        var isDidUpgrade = this.isDidUpgrade();
        var isDidBreak = this.isDidBreak();
        var isDidAwake = this.isDidAwake();
        var isDidLimit = this.isDidLimit();
        var isDidGoldRank = this.isDidGoldRankLv();
        if (isDidUpgrade || isDidBreak || isDidAwake || isDidLimit || isDidGoldRank) {
            return true;
        } else {
            return false;
        }
    }
    public getGoldResValue(costKey) {
        var gold_res = this.getGold_res();
        for (var _ in gold_res) {
            var res = gold_res[_];
            if (res.Key == costKey) {
                return res.Value;
            }
        }
        return 0;
    }
    public isCanTrain() {
        var type = this.getConfig().type;
        if (type == 3) {
            return false;
        }
        return true;
    }
    public isCanBreak() {
        var rankMax = this.getConfig().rank_max;
        if (rankMax == 0) {
            return false;
        }
        return true;
    }
    public isCanAwake() {
        var awakeMax = this.getConfig().awaken_max;
        if (awakeMax == 0) {
            return false;
        }
        return true;
    }
    isCanLimitBreak() {
        var type = this.getConfig().type;
        var color = this.getConfig().color;
        var limit = this.getConfig().limit;
        var limitRed = this.getConfig().limit_red;
        if (type == 2 && color == 5 && limit == 1) {
            return [
                true,
                HeroConst.HERO_LIMIT_TYPE_RED
            ];
        }
        if (type == 2 && color == 6 && limitRed == 1) {
            return [
                true,
                HeroConst.HERO_LIMIT_TYPE_GOLD
            ];
        }
        return [false];
    }
    isCanLimitBreakOrange() {
        var type = this.getConfig().type;
        var color = this.getConfig().color;
        var limit = this.getConfig().limit;
        var limitRed = this.getConfig().limit_red;
        if (type == 2 && color == 5 && limit == 1) {
            return true;
        }
    }
    isCanLimitBreakRed() {
        var type = this.getConfig().type;
        var color = this.getConfig().color;
        var limit = this.getConfig().limit;
        var limitRed = this.getConfig().limit_red;
        if (type == 2 && limitRed == 1 && (color == 5 || color == 6)) {
            return true;
        }
    }
    isDidLimitToGold() {
        return this.getLimit_rtg() == 4;
    }

    public isDidLimitToRed() {
        return this.getLimit_level() == 3;
    }
    public getAvatarToHeroBaseId() {
        var heroBaseId = this.getBase_id();
        if (this.isLeader()) {
            heroBaseId = G_UserData.getBase().getPlayerBaseId();
        }
        return heroBaseId;
    }

    /**
     * @param avatarBaseId 
     */
    public getAvatarToHeroBaseIdByAvatarId(avatarBaseId) {
        var heroBaseId = this.getBase_id();
        if (this.isLeader()) {
            heroBaseId = UserDataHelper.convertToBaseIdByAvatarBaseId(avatarBaseId, heroBaseId)[0];
        }
        return heroBaseId;
    }
    public setUserHero(userHero) {
        this._isUserHero = userHero;
    }
    public isUserHero() {
        return this._isUserHero;
    }
    public getLimitCostCountWithKey(key, type): any {
        var res;
        if (type == HeroConst.HERO_LIMIT_TYPE_RED) {
            res = this.getLimit_res();
        } else {
            res = this.getLimit_rtg_res();
        }
        for (let i in res) {
            var info = res[i];
            if (info.Key == key) {
                return info.Value;
            }
        }
        return 0;
    }
    getLeaderLimitLevel() {
        if (this.isLeader() && G_UserData.getBase().isEquipAvatar()) {
            var avatarBaseId = G_UserData.getBase().getAvatar_base_id();
            var limit = AvatarDataHelper.getAvatarConfig(avatarBaseId).limit;
            if (limit == 1) {
                return HeroConst.HERO_LIMIT_RED_MAX_LEVEL;
            }
        }
        return this.getLimit_level();
    }
    getLeaderLimitRedLevel() {
        return 0;
    }
    public isPureGoldHero() {
        var isColor = this.getConfig().color == 7;
        var isLeader = this.isLeader();
        return isColor && !isLeader && this.getLimit_level() == 0;
    }
    isCanBeTransformSrc() {
        var changeType = this.getConfig().change_type;
        if (changeType == HeroConst.TRANSFORM_LIMIT_TYPE_1 || changeType == HeroConst.TRANSFORM_LIMIT_TYPE_3) {
            return false;
        } else {
            return true;
        }
    }
    isCanBeTranformTar() {
        var changeType = this.getConfig().change_type;
        if (changeType == HeroConst.TRANSFORM_LIMIT_TYPE_2 || changeType == HeroConst.TRANSFORM_LIMIT_TYPE_3) {
            return false;
        } else {
            return true;
        }
    }
}