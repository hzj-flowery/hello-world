import { BaseData } from "./BaseData";
import { CampRaceFormationBaseData } from "./CampRaceFormationBaseData";
import { AvatarDataHelper } from "../utils/data/AvatarDataHelper";
import { HeroConst } from "../const/HeroConst";
import { SingleRaceConst } from "../const/SingleRaceConst";

export interface SingleRaceUserData {
    getUser_id(): number
    setUser_id(value: number): void
    getLastUser_id(): number
    getUser_name(): string
    setUser_name(value: string): void
    getLastUser_name(): string
    getPower(): number
    setPower(value: number): void
    getLastPower(): number
    getBase_id(): number
    setBase_id(value: number): void
    getLastBase_id(): number
    getRank(): number
    setRank(value: number): void
    getLastRank(): number
    getAvatar_base_id(): number
    setAvatar_base_id(value: number): void
    getLastAvatar_base_id(): number
    getOfficer_level(): number
    setOfficer_level(value: number): void
    getLastOfficer_level(): number
    getServer_id(): number
    setServer_id(value: number): void
    getLastServer_id(): number
    getServer_name(): string
    setServer_name(value: string): void
    getLastServer_name(): string
    getFormation(): Object
    setFormation(value: Object): void
    getLastFormation(): Object
    getEmbattle(): Object
    setEmbattle(value: Object): void
    getLastEmbattle(): Object
    getHero_data(): Object
    setHero_data(value: Object): void
    getLastHero_data(): Object
}
let schema = {};
schema['user_id'] = [
    'number',
    0
];
schema['user_name'] = [
    'string',
    ''
];
schema['power'] = [
    'number',
    0
];
schema['base_id'] = [
    'number',
    0
];
schema['rank'] = [
    'number',
    0
];
schema['avatar_base_id'] = [
    'number',
    0
];
schema['officer_level'] = [
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
schema['formation'] = [
    'object',
    {}
];
schema['embattle'] = [
    'object',
    {}
];
schema['hero_data'] = [
    'object',
    {}
];
export class SingleRaceUserData extends BaseData {
    public static schema = schema;

    _heroDatas;
    _heroList;
    constructor(properties?) {
        super(properties);
        this._heroDatas = {};
        this._heroList = [];
    }
    public clear() {
    }
    public reset() {
        this._heroDatas = {};
        this._heroList = [];
    }
    public updateData(userData) {
        this.setProperties(userData);
        this._heroDatas = {};
        this._heroList = [];
        let heroDatas = userData['hero_data'] || {};
        for (let i in heroDatas) {
            let data = heroDatas[i];
            let heroData = new CampRaceFormationBaseData(data);
            let heroId = heroData.getHero_id();
            this._heroDatas[heroId] = heroData;
            this._heroList.push(heroData);
        }
    }
    public getHeroDataWithId(heroId) {
        return this._heroDatas[heroId];
    }
    public getHeroList() {
        return this._heroList;
    }
    public getCovertIdAndLimitLevel() {
        let covertId = this.getBase_id();
        let limitLevel = 0;
        var limitRedLevel = 0
        let avatarBaseId = this.getAvatar_base_id();
        if (avatarBaseId > 0) {
            let info = AvatarDataHelper.getAvatarConfig(avatarBaseId);
            covertId = info.hero_id;
            if (info.limit == 1) {
                limitLevel = HeroConst.HERO_LIMIT_RED_MAX_LEVEL;
            }
        }
        return [
            covertId,
            limitLevel,
            limitRedLevel
        ];
    }
    public getMatchState() {
        return SingleRaceConst.RESULT_STATE_ING;
    }
}
