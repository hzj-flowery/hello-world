import { BaseData } from './BaseData';
import { HeroDataHelper } from '../utils/data/HeroDataHelper';
import { AvatarDataHelper } from '../utils/data/AvatarDataHelper';
import { HeroConst } from '../const/HeroConst';
let schema = {};
schema['hero_id'] = [
    'number',
    0
];

schema['hero_base_id'] = [
    'number',
    0
];

schema['avartar_base_id'] = [
    'number',
    0
];

schema['rank_level'] = [
    'number',
    0
];

schema['limit_rank_level'] = [
    'number',
    0
];
schema['limit_rtg'] = [
    'number',
    0
];

export interface CampRaceFormationBaseData {
    getHero_id(): number
    setHero_id(value: number): void
    getLastHero_id(): number
    getHero_base_id(): number
    setHero_base_id(value: number): void
    getLastHero_base_id(): number
    getAvartar_base_id(): number
    setAvartar_base_id(value: number): void
    getLastAvartar_base_id(): number
    getRank_level(): number
    setRank_level(value: number): void
    getLastRank_level(): number
    getLimit_rank_level(): number
    setLimit_rank_level(value: number): void
    getLimit_rtg(): number
    setLimit_rtg(value: number): void
    getLastLimit_rank_level(): number
}
export class CampRaceFormationBaseData extends BaseData {
    public static schema = schema;

    constructor(properties?) {
        super(properties)
    }
    public clear() {
    }
    public reset() {
    }
    public getCoverId() {
        let avartarBaseId = this.getAvartar_base_id();
        let coverId = this.getHero_base_id();
        if (avartarBaseId > 0) {
            coverId = AvatarDataHelper.getAvatarConfig(avartarBaseId).hero_id;
        }
        return coverId;
    }
    public getLimitLevel() {
        let limitLevel = this.getLimit_rank_level();
        let heroBaseId = this.getHero_base_id();
        let info = HeroDataHelper.getHeroConfig(heroBaseId);
        if (info.type == 1) {
            let avatarBaseId = this.getAvartar_base_id();
            let limit = AvatarDataHelper.getAvatarConfig(avatarBaseId).limit;
            if (limit == 1) {
                return HeroConst.HERO_LIMIT_RED_MAX_LEVEL;
            }
        }
        return limitLevel;
    }

    getLimitRedLevel() {
        var limitRedLevel = this.getLimit_rtg();
        var heroBaseId = this.getHero_base_id();
        var info = HeroDataHelper.getHeroConfig(heroBaseId);
        if (info.type == 1) {
            var avatarBaseId = this.getAvartar_base_id();
        }
        return limitRedLevel;
    }
}