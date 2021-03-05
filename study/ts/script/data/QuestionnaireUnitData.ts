import { BaseData } from "./BaseData";
import { G_ServerTime, G_UserData, G_ServerListManager } from "../init";
import { UserBaseData } from "./UserBaseData";
import { VipData } from "./VipData";

export interface QuestionnaireUnitData {
    getId(): number
    setId(value: number): void
    getLastId(): number
    getLink(): string
    setLink(value: string): void
    getLastLink(): string
    getStart_time(): number
    setStart_time(value: number): void
    getLastStart_time(): number
    getEnd_time(): number
    setEnd_time(value: number): void
    getLastEnd_time(): number
    getLevel_min(): number
    setLevel_min(value: number): void
    getLastLevel_min(): number
    getLevel_max(): number
    setLevel_max(value: number): void
    getLastLevel_max(): number
    getVip_min(): number
    setVip_min(value: number): void
    getLastVip_min(): number
    getVip_max(): number
    setVip_max(value: number): void
    getLastVip_max(): number
    isApply(): boolean
    setApply(value: boolean): void
    isLastApply(): boolean
}
let schema = {};
schema['id'] = [
    'number',
    0
];
schema['link'] = [
    'string',
    ''
];
schema['start_time'] = [
    'number',
    0
];
schema['end_time'] = [
    'number',
    0
];
schema['level_min'] = [
    'number',
    0
];
schema['level_max'] = [
    'number',
    0
];
schema['vip_min'] = [
    'number',
    0
];
schema['vip_max'] = [
    'number',
    0
];
schema['apply'] = [
    'boolean',
    false
];
export class QuestionnaireUnitData extends BaseData {
    public static schema = schema;

    getUrl() {
        //TODO:
        // var link = this.getLink();
        // var baseData = G_UserData.getBase();
        // var serverInfo = G_ServerListManager.getLastServer();
        // var param = '%d|%s|%d'.format(serverInfo.getServer(), baseData.getId(), this.getId());
        // param = base64.encode(param);
        // var url = link + ('?sojumpparm=' + param);
        // return url;
    }

    public isInActTime() {
        var time = G_ServerTime.getTime();
        return time >= this.getStart_time() && time <= this.getEnd_time();
    }

    public isLevelEnough() {
        var userUserLevel = G_UserData.getBase().getLevel();
        return userUserLevel >= this.getLevel_min() && userUserLevel <= this.getLevel_max();
    }

    public isVipEnough() {
        var userVipLevel = G_UserData.getVip().getLevel();
        return userVipLevel >= this.getVip_min() && userVipLevel <= this.getVip_max();
    }

    public canShow() {
        return this.isApply() == false && this.isInActTime() && this.isLevelEnough() && this.isVipEnough();
    }
}