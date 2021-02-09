import { FunctionConst } from "../const/FunctionConst";
import { GrainCarConst } from "../const/GrainCarConst";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { MessageIDConst } from "../const/MessageIDConst";
import { ServerRecordConst } from "../const/ServerRecordConst";
import { SignalConst } from "../const/SignalConst";
import { G_NetworkManager, G_ServerTime, G_SignalManager, G_UserData } from "../init";
import GrainCarConfigHelper from "../scene/view/grainCar/GrainCarConfigHelper";
import { handler } from "../utils/handler";
import { table } from "../utils/table";
import { BaseData } from "./BaseData";
import { GrainCarCorpseUnitData } from "./GrainCarCorpseUnitData";
import { GrainCarUnitData } from "./GrainCarUnitData";
import { GrainRoadPoint } from "./GrainRoadPoint";
import { SimpleUserData } from "./SimpleUserData";


export interface GrainCarData {  
    getAttack_num():number
    setAttack_num(data:number):void
    getAttack_time():number
    setAttack_time(data:number):void
    getEndTime():number
    setEndTime(data:number):void
    getUsers():object
    setUsers(data:object):void
    getIs_close():number
    setIs_close(data:number):void
    getCorpseShowTime():number
    setCorpseShowTime(data:number):void
}
var schema = {};
schema['attack_num'] = [
    'number',
    0
];
schema['attack_time'] = [
    'number',
    0
];
schema['endTime'] = [
    'number',
    0
];
schema['users'] = [
    'object',
    {}
];
schema['is_close'] = [
    'number',
    0
];
schema['corpseShowTime'] = [
    'number',
    0
];
export class GrainCarData extends BaseData{
    public static schema = schema;

    _grainCarUnit;
    _grainCarList:Array<any> = [];
    _carHashTable={};
    _mineCarCorpseList;
    _isLoginEndTime:boolean = false;
    _s2cGetGrainCarInfoListener;
    _s2cChangeGrainCarViewListener;
    _s2cGrainCarViewNotifyListener;
    _s2cUpgradeGrainCarListener;
    _s2cGrainCarNotifyListener;
    _s2cGrainCarLaunchListener;
    _s2cGrainCarGetAllListener;
    _s2cGrainCarMoveNotifyListener;
    _s2cGrainCarAttackListener;
    _s2cGrainCarEndListener;
    _s2cGrainCarMoveMultiNotifyListener;
    constructor(properties?) {
        super(properties);
        this._s2cGetGrainCarInfoListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GetGraincarInfo, handler(this, this._s2cGetGrainCarInfo));
        this._s2cChangeGrainCarViewListener = G_NetworkManager.add(MessageIDConst.ID_S2C_ChangeGraincarView, handler(this, this._s2cChangeGrainCarView));
        this._s2cGrainCarViewNotifyListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GrainCarViewNotify, handler(this, this._s2cGrainCarViewNotify));
        this._s2cUpgradeGrainCarListener = G_NetworkManager.add(MessageIDConst.ID_S2C_UpgradeGraincar, handler(this, this._s2cUpgradeGrainCar));
        this._s2cGrainCarNotifyListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GraincarNotify, handler(this, this._s2cGrainCarNotify));
        this._s2cGrainCarLaunchListener = G_NetworkManager.add(MessageIDConst.ID_S2C_StartGrainCarMove, handler(this, this._s2cStartGrainCarMove));
        this._s2cGrainCarGetAllListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GetAllMoveGrainCar, handler(this, this._s2cGrainCarGetAll));
        this._s2cGrainCarMoveNotifyListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GrainCarMoveNotify, handler(this, this._s2cGrainCarMoveNotify));
        this._s2cGrainCarAttackListener = G_NetworkManager.add(MessageIDConst.ID_S2C_AttackGrainCar, handler(this, this._s2cAttackGrainCar));
        this._s2cGrainCarEndListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GrainCarEnd, handler(this, this._s2cGrainCarEnd));
        this._s2cGrainCarMoveMultiNotifyListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GrainCarMoveMultiNotify, handler(this, this._s2cGrainCarMoveMultiNotify));
    }
    clear() {
        this._s2cGetGrainCarInfoListener.remove();
        this._s2cGetGrainCarInfoListener = null;
        this._s2cChangeGrainCarViewListener.remove();
        this._s2cChangeGrainCarViewListener = null;
        this._s2cGrainCarViewNotifyListener.remove();
        this._s2cGrainCarViewNotifyListener = null;
        this._s2cUpgradeGrainCarListener.remove();
        this._s2cUpgradeGrainCarListener = null;
        this._s2cGrainCarNotifyListener.remove();
        this._s2cGrainCarNotifyListener = null;
        this._s2cGrainCarLaunchListener.remove();
        this._s2cGrainCarLaunchListener = null;
        this._s2cGrainCarGetAllListener.remove();
        this._s2cGrainCarGetAllListener = null;
        this._s2cGrainCarMoveNotifyListener.remove();
        this._s2cGrainCarMoveNotifyListener = null;
        this._s2cGrainCarAttackListener.remove();
        this._s2cGrainCarAttackListener = null;
        this._s2cGrainCarEndListener.remove();
        this._s2cGrainCarEndListener = null;
        this._s2cGrainCarMoveMultiNotifyListener.remove();
        this._s2cGrainCarMoveMultiNotifyListener = null;
    }
    reset() {
    }
    updateData(data) {
    }
    insertData(data) {
    }
    deleteData(data) {
    }
    setGrainCar(unit) {
        this._grainCarUnit = unit;
    }
    getGrainCar() {
        return this._grainCarUnit;
    }
    getGrainCarList() {
        return this._grainCarList;
    }
    getGrainCarWithGuildId(guildId) {
        return this._carHashTable['k' + guildId] || null;
    }
    isEmergencyClose() {
        return G_UserData.getServerRecord().isEmergencyClose(ServerRecordConst.SHIFT_FUNCTION_GRAIN_CAR) || this.getIs_close() == 1;
    }
    isActivityOver() {
        var curTime = G_ServerTime.getTime();
        var endTime = this.getEndTime();
        if (GrainCarConfigHelper.isInActivityTime() && !GrainCarConfigHelper.isInLaunchTime()) {
            if (endTime == 0 && this._isLoginEndTime) {
                return true;
            } else if (endTime == 0) {
                return false;
            } else {
                return curTime > endTime;
            }
        } else {
            return false;
        }
    }
    getGrainCarCorpseHashTable() {
        return this._mineCarCorpseList;
    }
    addGrainCarCorpse(carUnit, type) {
        var mineId = 0;
        if (type == 1) {
            mineId = carUnit.getCurPit();
        } else {
            mineId = carUnit.getMine_id();
        }
        if (!this._mineCarCorpseList[mineId]) {
            this._mineCarCorpseList[mineId] = {};
        }
        var level = carUnit.getLevel();
        if (!this._mineCarCorpseList[mineId][level]) {
            this._mineCarCorpseList[mineId][level] = [];
        }
        if (this._mineCarCorpseList[mineId][level].length >= GrainCarConst.MAX_CORPSE_EACH_LEVEL) {
            return;
        }
        this._mineCarCorpseList[mineId][level].push(carUnit);
    }
    initCorpse(message) {
        this._mineCarCorpseList = {};
        if (message['grain_car_dst_info']) {
            for (let i in message.grain_car_dst_info) {
                var v = message.grain_car_dst_info[i];
                var corpseUnit = new GrainCarCorpseUnitData();
                corpseUnit.initData(v);
                this.addGrainCarCorpse(corpseUnit, 2);
            }
        }
        var shameTime = message['grain_car_shame_time'];
        this.setCorpseShowTime(shameTime);
    }
    c2sGetGrainCarInfo() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetGraincarInfo, {});
    }
    _s2cGetGrainCarInfo(id, message) {
        if (message.ret == GrainCarConst.GRAIN_EMERGENCY_CLOSE) {
            this.setIs_close(1);
            return;
        }
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var unit = this._createCarUnit(message);
        this.setGrainCar(unit);
        unit.setDestory_guild_name(message.destory_guild_name);
        unit.createRouteWithRoadId(message.road_id);
        unit.setMine_id(message.mine_id);
        var route = this._createRoads(message);
        if (route) {
            unit.setRoute(route);
        }
        var road = this._createRoad(message.grain_road_point);
        if (road) {
            unit.setGrainRoads(road);
        }
        var users = this._createUsers(message);
        this.setUsers(users);
        G_SignalManager.dispatch(SignalConst.EVENT_GRAIN_CAR_GET_INFO, message);
    }
    c2sAutoLaunch():void{
        G_NetworkManager.send(MessageIDConst.ID_C2S_AutoStartGrainCarMove,{});
    }
    c2sChangeGrainCarView(data) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_ChangeGraincarView, { switch:data});
    }
    _s2cChangeGrainCarView(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GRAIN_CAR_CHANGE_AUTH, message.all_view);
    }
    _s2cGrainCarViewNotify(id, message) {
        if (this._grainCarUnit) {
            this._grainCarUnit.setAll_view(message.all_view);
            G_SignalManager.dispatch(SignalConst.EVENT_GRAIN_CAR_VIEW_NOTIFY, message.all_view);
        }
    }
    c2sUpgradeGrainCar() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_UpgradeGraincar, {});
    }
    _s2cUpgradeGrainCar(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_GRAIN_CAR);
        G_SignalManager.dispatch(SignalConst.EVENT_GRAIN_CAR_UPGRADE, message);
    }
    _s2cGrainCarNotify(id, message) {
        var grainCarMsg = message['grain_car'];
        var carUnit = null;
        if (this._isMyCar(grainCarMsg.guild_id)) {
            if (this._grainCarUnit) {
                this._grainCarUnit.updateData(grainCarMsg);
            }
        }
        carUnit = this._carHashTable['k' + grainCarMsg.guild_id];
        if (carUnit) {
            carUnit.updateData(grainCarMsg);
            if (carUnit.getStamina() <= 0) {
                this.addGrainCarCorpse(carUnit, 1);
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GRAIN_CAR_NOTIFY, carUnit);
    }
    c2sStartGrainCarMove() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_StartGrainCarMove, {});
    }
    _s2cStartGrainCarMove(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GRAIN_CAR_LAUNCH, message);
    }
    c2sAttackGrainCar(guildId, mineId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_AttackGrainCar, {
            guild_id: guildId,
            mine_id: mineId
        });
    }
    _s2cAttackGrainCar(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this.setAttack_num(message.attack_num);
        this.setAttack_time(message.attcak_time);
        var hurt = message['hurt'];
        var army = message['army'];
        var desc_army = message['desc_army'];
        G_UserData.getMineCraftData().setMyArmyValue(army);
        G_SignalManager.dispatch(SignalConst.EVENT_GRAIN_CAR_UPDATE_ARMY);
        G_SignalManager.dispatch(SignalConst.EVENT_GRAIN_CAR_ATTACK, message.awards, hurt, army, desc_army);
    }
    _s2cGrainCarMoveNotify(id, message) {
        var newCarUnit = this._updateCarRoad(message);
        if (!newCarUnit) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GRAIN_CAR_MOVE_NOTIFY, newCarUnit);
    }
    _s2cGrainCarMoveMultiNotify(id, message) {
        var msg = message['msg'] || {};
        if (table.nums(msg) <= 0) {
            return;
        }
        for (let k in msg) {
            var v = msg[k];
            this._s2cGrainCarMoveNotify(null, v);
        }
    }
    c2sGetAllMoveGrainCar() {
        this._grainCarList = [];
        this._carHashTable = {};
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetAllMoveGrainCar, {});
    }
    _s2cGrainCarGetAll(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this.setAttack_num(message.self_attack_num);
        this.setAttack_time(message.self_attack_time);
        var packageTemp = [];
        for (let i in message.grain_move_info) {
            var v = message.grain_move_info[i];
            var unit = this._createCarUnit(v);
            var guildId = unit.getGuild_id();
            var roads = this._createRoad(v.grain_road_point);
            if (roads) {
                unit.setGrainRoads(roads);
            }
            unit.createRouteWithRoadId(v.road_id);
            if (this._carHashTable['k' + guildId]) {
                var index = this._grainCarList.length + 1;
                for (let i in this._grainCarList) {
                    var carUnit = this._grainCarList[i];
                    if (carUnit.getGuild_id() == guildId) {
                        index = parseInt(i);
                        break;
                    }
                }
                this._carHashTable['k' + guildId] = unit;
                this._grainCarList[index] = unit;
            } else {
                this._carHashTable['k' + guildId] = unit;
                this._grainCarList.push(unit);
            }
            packageTemp.push(unit);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GRAIN_CAR_GET_ALL_MOVE_CAR, packageTemp);
    }
    _s2cGrainCarEnd(id, message) {
        this.setEndTime(message.endTime);
        this._isLoginEndTime = message.is_login;
        G_SignalManager.dispatch(SignalConst.EVENT_GRAIN_CAR_END);
    }
    _createCarUnit(message) {
        var grainCarMsg = message['grain_car'];
        var unit = new GrainCarUnitData();
        unit.initData(grainCarMsg);
        return unit;
    }
    _updateCarUnit(message) {
        var grainCarMsg = message['grain_car'];
        var guildId = grainCarMsg.guild_id;
        if (this._isMyCar(grainCarMsg.guild_id)) {
            if (this._grainCarUnit) {
                this._grainCarUnit.updateData(grainCarMsg);
                var roads = this._createRoad(message.grain_point);
                if (roads) {
                    this._grainCarUnit.setGrainRoads(roads);
                }
                this._grainCarUnit.createRouteWithRoadId(message.road_id);
            }
        }
        var index = this._grainCarList.length + 1;
        for (let i in this._grainCarList) {
            var carUnit = this._grainCarList[i];
            if (carUnit.getGuild_id() == guildId) {
                index = parseInt(i);
                break;
            }
        }
        var unitInList = this._grainCarList[index];
        var unitInHashTable = this._carHashTable['k' + guildId];
        if (!unitInList || !unitInHashTable) {
            return null;
        }
        unitInList.updateData(grainCarMsg);
        unitInHashTable.updateData(grainCarMsg);
        return unitInList;
    }
    _createRoads(message) {
        var roadPointList = [];
        var grainRoad = message['grain_road'];
        if (grainRoad) {
            var roads = grainRoad['grain_points'];
            for (let i in roads) {
                var v = roads[i];
                var point = new GrainRoadPoint();
                point.initData(v);
                roadPointList.push(point);
            }
            return roadPointList;
        }
        return null;
    }
    _createRoad(message) {
        if (message) {
            var roadPointList = [];
            var point = new GrainRoadPoint();
            point.initData(message);
            roadPointList.push(point);
            return roadPointList;
        }
        return null;
    }
    _createUsers(message) {
        var userList = [];
        var users = message['user'];
        if (!users) {
            return userList;
        }
        for (let i in users) {
            var user = users[i];
            var userData = new SimpleUserData(user);
            userList.push(userData);
        }
        return userList;
    }
    _updateCarRoad(message) {
        var newCarUnit = this._updateCarUnit(message);
        if (!newCarUnit) {
            if (this._getAliveCount() >= GrainCarConst.MAX_CAR_AVATAR) {
                console.log('[GrainCarData _updateCarRoad] reach max aliveCount');
                return null;
            }
            newCarUnit = this._createCarUnit(message);
            var guildId = newCarUnit.getGuild_id();
            var index = this._grainCarList.length + 1;
            for (let i in this._grainCarList) {
                var carUnit = this._grainCarList[i];
                if (carUnit.getGuild_id() == guildId) {
                    index = parseInt(i);
                    break;
                }
            }
            this._grainCarList[index] = newCarUnit;
            this._carHashTable['k' + guildId] = newCarUnit;
        }
        var roads = this._createRoad(message.grain_point);
        if (roads) {
            newCarUnit.setGrainRoads(roads);
        }
        newCarUnit.createRouteWithRoadId(message.road_id);
        return newCarUnit;
    }
    _isMyCar(guildId) {
        return this._grainCarUnit && this._grainCarUnit.getGuild_id() == guildId;
    }
    _getAliveCount() {
        var count = 0;
        for (let i in this._carHashTable) {
            var carUnit = this._carHashTable[i];
            if (carUnit.getStamina() > 0) {
                count = count + 1;
            }
        }
        return count;
    }
};