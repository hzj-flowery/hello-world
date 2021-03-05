import { BaseData } from './BaseData';
let schema = {};
schema['id'] = [
    'number',
    0
];
schema['name'] = [
    'string',
    ''
];
schema['level'] = [
    'number',
    0
];
schema['exp'] = [
    'number',
    0
];
schema['create_time'] = [
    'number',
    0
];
schema['power'] = [
    'number',
    0
];
schema['officer_level'] = [
    'number',
    0
];
schema['server_name'] = [
    'string',
    ''
];
schema['change_name_count'] = [
    'number',
    0
];
schema['recharge_total'] = [
    'number',
    0
];
schema['guide_id'] = [
    'number',
    0
];
schema['today_init_level'] = [
    'number',
    0
];
schema['server_open_time'] = [
    'number',
    0
];
schema['avatar_base_id'] = [
    'number',
    0
];
schema['avatar_id'] = [
    'number',
    0
];
schema['on_team_pet_id'] = [
    'number',
    0
];
schema['order_state'] = [
    'number',
    0
];
export interface UserUnitData {
getId(): number
setId(value: number): void
getLastId(): number
getName(): string
setName(value: string): void
getLastName(): string
getLevel(): number
setLevel(value: number): void
getLastLevel(): number
getExp(): number
setExp(value: number): void
getLastExp(): number
getCreate_time(): number
setCreate_time(value: number): void
getLastCreate_time(): number
getPower(): number
setPower(value: number): void
getLastPower(): number
getOfficer_level(): number
setOfficer_level(value: number): void
getLastOfficer_level(): number
getServer_name(): string
setServer_name(value: string): void
getLastServer_name(): string
getChange_name_count(): number
setChange_name_count(value: number): void
getLastChange_name_count(): number
getRecharge_total(): number
setRecharge_total(value: number): void
getLastRecharge_total(): number
getGuide_id(): number
setGuide_id(value: number): void
getLastGuide_id(): number
getToday_init_level(): number
setToday_init_level(value: number): void
getLastToday_init_level(): number
getServer_open_time(): number
setServer_open_time(value: number): void
getLastServer_open_time(): number
getAvatar_base_id(): number
setAvatar_base_id(value: number): void
getLastAvatar_base_id(): number
getAvatar_id(): number
setAvatar_id(value: number): void
getLastAvatar_id(): number
getOn_team_pet_id(): number
setOn_team_pet_id(value: number): void
getLastOn_team_pet_id(): number
getOrder_state(): number
setOrder_state(value: number): void
getLastOrder_state(): number

}
export class UserUnitData extends BaseData {

public static schema = schema;

    constructor (properties?) {
        super(properties);
        if (properties) {
            this.updateData(properties);
        }
    }
    public clear () {
    }
    public reset () {
    }
    public updateData (data) {
        this.setProperties(data);
    }
}