import { BaseData } from './BaseData';
import { HeroConst } from '../const/HeroConst';
import { AvatarDataHelper } from '../utils/data/AvatarDataHelper';
import { HeroDataHelper } from '../utils/data/HeroDataHelper';
let schema = {};
schema['id'] = [
    'number',
    0
];

schema['base_id'] = [
    'number',
    0
];

schema['avatar_base_id'] = [
    'number',
    0
];

schema['name'] = [
    'string',
    ''
];

schema['officer_level'] = [
    'number',
    0
];

schema['score'] = [
    'number',
    0
];

schema['power'] = [
    'number',
    0
];

export interface CampRaceUserData {
    getId(): number
    setId(value: number): void
    getLastId(): number
    getBase_id(): number
    setBase_id(value: number): void
    getLastBase_id(): number
    getAvatar_base_id(): number
    setAvatar_base_id(value: number): void
    getLastAvatar_base_id(): number
    getName(): string
    setName(value: string): void
    getLastName(): string
    getOfficer_level(): number
    setOfficer_level(value: number): void
    getLastOfficer_level(): number
    getScore(): number
    setScore(value: number): void
    getLastScore(): number
    getPower(): number
    setPower(value: number): void
    getLastPower(): number
}
export class CampRaceUserData extends BaseData {
    public static schema = schema;

    public clear() {
    }
    public reset() {
    }
    public getCoverId() {
        let avartarBaseId = this.getAvatar_base_id();
        let coverId = this.getBase_id();
        if (avartarBaseId > 0) {
            coverId = AvatarDataHelper.getAvatarConfig(avartarBaseId).hero_id;
        }
        return coverId;
    }
    public getLimitLevel() {
        let limitLevel = 0;
        let heroBaseId = this.getBase_id();
        let info = HeroDataHelper.getHeroConfig(heroBaseId);
        if (info.type == 1) {
            let avatarBaseId = this.getAvatar_base_id();
            let limit = AvatarDataHelper.getAvatarConfig(avatarBaseId).limit;
            if (limit == 1) {
                return HeroConst.HERO_LIMIT_RED_MAX_LEVEL;
            }
        }
        return limitLevel;
    }

    getLimitRedLevel() {
        var limitRedLevel = 0;
        var heroBaseId = this.getBase_id();
        var info = HeroDataHelper.getHeroConfig(heroBaseId);
        if (info.type == 1) {
            var avatarBaseId = this.getAvatar_base_id();
        }
        return limitRedLevel;
    }
}