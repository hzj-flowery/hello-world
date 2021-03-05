import { BaseData } from './BaseData';
import { G_UserData } from '../init';
import { clone } from '../utils/GlobleFunc';
import { UserDataHelper } from '../utils/data/UserDataHelper';
let schema = {};
schema['id'] = [
    'number',
    0
];

schema['name'] = [
    'string',
    ''
];

schema['base_id'] = [
    'number',
    0
];

schema['office_level'] = [
    'number',
    0
];

schema['avatar_base_id'] = [
    'number',
    0
];

schema['player_info'] = [
    'object',
    null
];

schema['titles'] = [
    'object',
    null
];

schema['head_frame_id'] = [
    'number',
    0
];

export interface ChatPlayerData {
    getId(): number
    setId(value: number): void
    getLastId(): number
    getName(): string
    setName(value: string): void
    getLastName(): string
    getBase_id(): number
    setBase_id(value: number): void
    getLastBase_id(): number
    getOffice_level(): number
    setOffice_level(value: number): void
    getLastOffice_level(): number
    getAvatar_base_id(): number
    setAvatar_base_id(value: number): void
    getLastAvatar_base_id(): number
    getPlayer_info(): Object
    setPlayer_info(value: Object): void
    getLastPlayer_info(): Object
    getTitles(): Object
    setTitles(value: Object): void
    getLastTitles(): Object
    getHead_frame_id(): number
    setHead_frame_id(value: number): void
    getLastHead_frame_id(): number
}
export class ChatPlayerData extends BaseData {
    public static schema = schema;


    constructor(properties?) {
        super(properties)
    }
    public clear() {
    }
    public reset() {
    }
    public isSelf() {
        let userId = G_UserData.getBase().getId();
        return userId == this.getId();
    }
    public hasData() {
        return this.getId() != 0;
    }
    public setDataBySimpleUser(simpleUser) {
        console.log(simpleUser);
        this.setId(simpleUser.userId);
        this.setName(simpleUser.name);
        this.setBase_id(simpleUser.baseId);
        this.setOffice_level(simpleUser.officeLevel);
        this.setAvatar_base_id(simpleUser.avatarBaseId);
        this.setPlayer_info(clone(simpleUser.player_info));
        this.setHead_frame_id(simpleUser.head_frame_id);
    }
    public setDataByGuildUnitData(data) {
        this.setId(data.getLeader());
        this.setName(data.getLeader_name());
        this.setBase_id(data.getLeader_base_id());
        this.setOffice_level(data.getLeader_officer_level());
        this.setAvatar_base_id(data.getLeader_avater_base_id());
        this.setPlayer_info(clone(data.getLeader_player_info()));
    }
    public setDataByGuildMemberData(memberData) {
        console.log(memberData);
        this.setId(memberData.getUid());
        this.setName(memberData.getName());
        this.setBase_id(memberData.getBase_id());
        this.setOffice_level(memberData.getOfficer_level());
        this.setAvatar_base_id(memberData.getAvatar());
        this.setPlayer_info(clone(memberData.getPlayer_info()));
        this.setHead_frame_id(memberData.getHead_frame_id());
    }
    public setDataByGroupUserData(userData) {
        this.setId(userData.getUser_id());
        this.setName(userData.getName());
        this.setBase_id(userData.getBase_id());
        this.setOffice_level(userData.getOffice_level());
        this.setAvatar_base_id(userData.getAvatar_base_id());
        this.setHead_frame_id(userData.getHead_frame_id());
        let serverData = {
            user_id: userData.getUser_id(),
            base_id: userData.getBase_id(),

            office_level: userData.getOffice_level(),
            avatar_base_id: userData.getAvatar_base_id()
        };
        let [covertId, playerInfo] = UserDataHelper.convertAvatarId(serverData);
        this.setPlayer_info(playerInfo);
    }
}
