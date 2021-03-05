import { BaseData } from './BaseData';
import { UserDataHelper } from '../utils/data/UserDataHelper';
import { BattleResourceUnitData } from './BattleResourceUnitData';
import { TreasureUnitData } from './TreasureUnitData';
import { UserUnitData } from './UserUnitData';
import { HeroUnitData } from './HeroUnitData';
import { EquipmentUnitData } from './EquipmentUnitData';
export class BattleUserData extends BaseData {
    public static schema = {};

    public _userUnitData;
    public _role;
    public _playerInfo;
    public _heroList;
    public _equipmentList;
    public _treasureList;
    public _embattle;
    public _battleResourceList;

    constructor(properties?) {
        super(properties)
        this._userUnitData = null;
        this._role = null;
        this._playerInfo = null;
        this._heroList = {};
        this._equipmentList = {};
        this._treasureList = {};
        this._embattle = {};
        this._battleResourceList = {};
    }
    public clear() {
    }
    public reset() {
        this._userUnitData = null;
        this._role = null;
        this._playerInfo = null;
        this._heroList = {};
        this._equipmentList = {};
        this._treasureList = {};
        this._embattle = {};
        this._battleResourceList = {};
    }
    public updateData(message) {
        let user = message['user'];
        let heros = message['heros'] || [];
        let equipments = message['equipments'] || [];
        let treasures = message['treasures'] || [];
        let embattle = message['embattle'] || [];
        let battleResources = message['battle_resources'] || [];
        let unitData = new UserUnitData();
        unitData.updateData(user);
        this._userUnitData = unitData;
        this._heroList = [];
        for (let i = 0; i < heros.length; i++) {
            let data = heros[i];
            let unitData = new HeroUnitData();
            unitData.updateData(data);
            this._heroList.push(unitData);
            if (i == 0) {
                this._role = unitData;
            }
        }
        this._equipmentList = [];
        for (let i = 0; i < equipments.length; i++) {
            let data = equipments[i];
            let unitData = new EquipmentUnitData();
            unitData.updateData(data);
            this._equipmentList['k_' + String(data.id)] = unitData;
        }
        this._treasureList = [];
        for (let i = 0; i < treasures.length; i++) {
            let data = treasures[i];
            let unitData = new TreasureUnitData();
            unitData.updateData(data);
            this._treasureList['k_' + String(data.id)] = unitData;
        }
        this._embattle = [];
        for (let i = 0; i < embattle.length; i++) {
            let data = embattle[i];
            this._embattle.push(data);
        }
        this._battleResourceList = {};
        for (let i = 0; i < battleResources.length; i++) {
            let data = battleResources[i];
            let unitData = new BattleResourceUnitData();
            unitData.initData(data);
            this._battleResourceList['k_' + (String(data.flag) + ('_' + String(data.id)))] = unitData;
        }
        let [covertId, playerInfo] = UserDataHelper.convertAvatarId({
            base_id: this._role.getBase_id(),
            avatar_base_id: this._userUnitData.getAvatar_base_id()
        });
        this._playerInfo = playerInfo;
    }
    public getUser() {
        return this._userUnitData;
    }
    public getEmbattle() {
        return this._embattle;
    }
    public getHeros() {
        return this._heroList;
    }
    public getRole() {
        return this._role;
    }
    public getPlayer_info() {
        return this._playerInfo;
    }
}