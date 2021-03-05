import { BaseData } from './BaseData';
import { HeroConst } from '../const/HeroConst';
import { AvatarDataHelper } from '../utils/data/AvatarDataHelper';
let schema = {};
schema['user_id'] = [
    'number',
    0
];

schema['rank'] = [
    'number',
    9999
];

schema['name'] = [
    'string',
    ''
];

schema['point'] = [
    'number',
    0
];

schema['office_level'] = [
    'number',
    0
];

schema['server_id'] = [
    'number',
    0
];

schema['server_name'] = [
    'string',
    ''
];

schema['head_frame_id'] = [
    'number',
    0
];

schema['base_id'] = [
    'number',
    0
];

schema['avater_base_id'] = [
    'number',
    0
];

export interface CakeActivityUserRankData {
    getUser_id(): number
    setUser_id(value: number): void
    getLastUser_id(): number
    getRank(): number
    setRank(value: number): void
    getLastRank(): number
    getName(): string
    setName(value: string): void
    getLastName(): string
    getPoint(): number
    setPoint(value: number): void
    getLastPoint(): number
    getOffice_level(): number
    setOffice_level(value: number): void
    getLastOffice_level(): number
    getServer_id(): number
    setServer_id(value: number): void
    getLastServer_id(): number
    getServer_name(): string
    setServer_name(value: string): void
    getLastServer_name(): string
    getHead_frame_id(): number
    setHead_frame_id(value: number): void
    getLastHead_frame_id(): number
    getBase_id(): number
    setBase_id(value: number): void
    getLastBase_id(): number
    getAvater_base_id(): number
    setAvater_base_id(value: number): void
    getLastAvater_base_id(): number
}
export class CakeActivityUserRankData extends BaseData {
    public static schema = schema;

    public reset() {
    }
    public clear() {
    }
    public updateData(data) {
        this.backupProperties();
        this.setProperties(data);
    }
    public getCovertIdAndLimitLevel() {
        let covertId = this.getBase_id();
        let limitLevel = 0;
        let avatarBaseId = this.getAvater_base_id();
        if (avatarBaseId > 0) {
            let info = AvatarDataHelper.getAvatarConfig(avatarBaseId);
            covertId = info.hero_id;
            if (info.limit == 1) {
                limitLevel = HeroConst.HERO_LIMIT_RED_MAX_LEVEL;
            }
        }
        return [
            covertId,
            limitLevel
        ];
    }
    public getChangeResName() {
        let curRank = this.getRank();
        let lastRank = this.getLastRank();
        if (curRank < lastRank) {
            return 'img_battle_arrow_up';
        } else if (curRank == lastRank) {
            return 'img_battle_arrow_balance';
        } else {
            return 'img_battle_arrow_down';
        }
    }
}