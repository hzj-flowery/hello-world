import { BaseData } from "./BaseData";
import { G_UserData } from "../init";
import { AvatarDataHelper } from "../utils/data/AvatarDataHelper";

var schema = {};
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
schema['config'] = [
    'object',
    {}
];

export interface AvatarUnitData {

    getId(): number
    setId(value: number): void
    getLastId(): number
    getBase_id(): number
    setBase_id(value: number): void
    getLastBase_id(): number
    getLevel(): number
    setLevel(value: number): void
    getLastLevel(): number
    getConfig(): any
    setConfig(value: any): void
    getLastConfig(): any

}
export class AvatarUnitData extends BaseData {
    public static schema = schema;

    clear() {
    }
    reset() {
    }
    updateData(data) {
        super.setProperties(data);
        var config = AvatarDataHelper.getAvatarConfig(data.base_id);
        this.setConfig(config);
    }
    isEquiped() {
        var userAvatarId = G_UserData.getBase().getAvatar_id();
        var avatarId = this.getId();
        return avatarId > 0 && avatarId == userAvatarId;
    }
    isTrained() {
        var level = this.getLevel();
        return level > 1;
    }
    isSelf() {
        return this.getBase_id() == 0;
    }
    isOwned() {
        return this.getId() > 0;
    }
}