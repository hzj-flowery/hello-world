import { BaseData } from "./BaseData";

export interface MineReportData {  
    getBase_id():number
    setBase_id(data:number):void
    getAvatar_base_id():number
    setAvatar_base_id(data:number):void
    getLevel():number
    setLevel(data:number):void
    getFight_time():number
    setFight_time(data:number):void
    getName():string
    setName(data:string):void
    getOfficer_level():number
    setOfficer_level(data:number):void
    getPower():number
    setPower(data:number):void
    getUid():number
    setUid(data:number):void
    getWin_type():number
    setWin_type(data:number):void
    getSelf_dec_army():number
    setSelf_dec_army(data:number):void
    getTar_dec_army():number
    setTar_dec_army(data:number):void
    isSelf_is_die():boolean
    setSelf_is_die(data:boolean):void
    isTar_is_die():boolean
    setTar_is_die(data:boolean):void
    getReport_id():number
    setReport_id(data:number):void
    getReport_type():number
    setReport_type(data:number):void
    getSelf_army():number
    setSelf_army(data:number):void
    getTar_army():number
    setTar_army(data:number):void
    isSelf_is_privilege():boolean
    setSelf_is_privilege(data:boolean):void
    isTar_is_privilege():boolean
    setTar_is_privilege(data:boolean):void
    getSelf_infamy_add():number
    setSelf_infamy_add(data:number):void
    getTar_infamy_add():number
    setTar_infamy_add(data:number):void
   }
   
let schema = {};
schema['base_id'] = [
    'number',
    0
];
schema['avatar_base_id'] = [
    'number',
    0
];
schema['level'] = [
    'number',
    0
];
schema['fight_time'] = [
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
schema['power'] = [
    'number',
    0
];
schema['uid'] = [
    'number',
    0
];
schema['win_type'] = [
    'number',
    0
];
schema['self_dec_army'] = [
    'number',
    0
];
schema['tar_dec_army'] = [
    'number',
    0
];
schema['self_is_die'] = [
    'boolean',
    false
];
schema['tar_is_die'] = [
    'boolean',
    false
];
schema['report_id'] = [
    'number',
    0
];
schema['report_type'] = [
    'number',
    0
];
schema['self_army'] = [
    'number',
    0
];
schema['tar_army'] = [
    'number',
    0
];
schema['self_is_privilege'] = [
    'boolean',
    false
];
schema['tar_is_privilege'] = [
    'boolean',
    false
];
schema['self_infamy_add'] = [
    'number',
    0
];
schema['tar_infamy_add'] = [
    'number',
    0
];
export class MineReportData extends BaseData {
    public static schema = schema;j


    public clear() {
    }
    public reset() {
    }
    public updateDataFromMineFight(mineFight, mineUser) {
        let targetUser = mineUser;
        this.setBase_id(targetUser.base_id);
        this.setAvatar_base_id(targetUser.avatar_base_id);
        this.setName(targetUser.user_name);
        this.setOfficer_level(targetUser.officer_level);
        this.setPower(targetUser.power);
        this.setUid(targetUser.user_id);
        this.setWin_type(mineFight.self_star);
        this.setSelf_dec_army(mineFight.self_red_army);
        this.setTar_dec_army(mineFight.tar_red_army);
        this.setSelf_is_die(mineFight.self_is_die);
        this.setTar_is_die(mineFight.tar_is_die);
        this.setSelf_army(mineFight.self_begin_army - mineFight.self_red_army);
        this.setTar_army(mineFight.tar_begin_army - mineFight.tar_red_army);
        this.setTar_is_privilege(mineFight['tar_is_privilege'] || false);
        this.setSelf_infamy_add(mineFight.self_infamy_add);
        this.setTar_infamy_add(-Math.abs(mineFight.tar_infamy_desc));
    }
}
