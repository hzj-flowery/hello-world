import { ConfigNameConst } from "../const/ConfigNameConst";
import { G_ConfigLoader, G_ServerTime, G_UserData } from "../init";
import GrainCarConfigHelper from "../scene/view/grainCar/GrainCarConfigHelper";
import { assert } from "../utils/GlobleFunc";
import { BaseData } from "./BaseData";


export interface GrainCarUnitData {
    getId():number
    setId(data:number):void
    getLevel():number
    setLevel(data:number):void
    getExp():number
    setExp(data:number):void
    getStamina():number
    setStamina(data:number):void
    getStart_time():number
    setStart_time(data:number):void
    getEnd_time():number
    setEnd_time(data:number):void
    getAll_view():number
    setAll_view(data:number):void
    getGuild_id():number
    setGuild_id(data:number):void
    getGuild_name():number
    setGuild_name(data:number):void
    getDonate_users():number
    setDonate_users(data:number):void
    getConfig():any
    setConfig(data:object):void
    getDestory_guild_name():object
    setDestory_guild_name(data:object):void
    getGrainRoads():any
    setGrainRoads(data:object):void
    getRoute():any
    setRoute(data:object):void
    getRoad_id():number
    setRoad_id(data:number):void
    getRoute_point():any
    setRoute_point(data:object):void
    getRoute_passed():object
    setRoute_passed(data:object):void
    getMine_id():number
    setMine_id(data:number):void
    
}

var schema = {};
schema['id'] = [
    'number',
    0
];
schema['level'] = [
    'number',
    0
];
schema['exp'] = [
    'number',
    0
];
schema['stamina'] = [
    'number',
    0
];
schema['start_time'] = [
    'number',
    0
];
schema['end_time'] = [
    'number',
    0
];
schema['all_view'] = [
    'number',
    0
];
schema['guild_id'] = [
    'number',
    0
];
schema['guild_name'] = [
    'string',
    0
];
schema['donate_users'] = [
    'number',
    0
];
schema['config'] = [
    'object',
    {}
];
schema['destory_guild_name'] = [
    'object',
    {}
];
schema['grainRoads'] = [
    'object',
    {}
];
schema['route'] = [
    'object',
    {}
];
schema['road_id'] = [
    'number',
    0
];
schema['route_point'] = [
    'object',
    {}
];
schema['route_passed'] = [
    'object',
    {}
];
schema['mine_id'] = [
    'number',
    0
];

export  class  GrainCarUnitData extends BaseData {

    public static schema = schema;

    constructor(properties?) {
        super(properties);
        this["grainRoads"] = {};
    }
    clear() {
    }
    reset() {
    }
    initData(msg) {
        this.setProperties(msg);
        this.setLevel(msg.id);
       
        var config = G_ConfigLoader.getConfig(ConfigNameConst.GRAINCAR).get(msg.id);
        assert(config, 'graincar can\'t find base_id = ' + (msg.id));
        this.setConfig(config);
    }
    updateData(data) {
        this.setProperties(data);
        this.setLevel(data.id);
        var config = G_ConfigLoader.getConfig(ConfigNameConst.GRAINCAR).get(data.id);
        assert(config, 'graincar can\'t find base_id = ' + (data.id));
        this.setConfig(config);
    }
    insertData(data) {
    }
    deleteData(data) {
    }
    createRouteWithRoadId(roadId) {
        if (roadId && roadId > 0) {
            this.setRoad_id(roadId);
            var routeList = GrainCarConfigHelper.getRouteWithId(roadId);
            this.setRoute_point(routeList);
        }
    }
    setGrainRoads(road) {
        this["grainRoads"] = road
        this._initPassedRouteList();
    }
    getGrainRoads(){
        return this["grainRoads"];
    }
    isInMine(mineId) {
        var roads = this.getGrainRoads();
        if (!roads.length||roads.length < 1) {
            return null;
        }
        var curRoad = roads[0];
        var curTime = G_ServerTime.getTime();
        if (curRoad.getMine_id() == mineId && curTime >= curRoad.getEnter_time() - 1 && curTime < curRoad.getLeave_time()) {
            return true;
        }
        return false;
    }
    getCurPit() {
        var roads = this.getGrainRoads();
        if (!roads.length||roads.length < 1) {
            return null;
        }
        var curRoad = roads[0];
        var minePit1 = curRoad.getMine_id();
        return minePit1;
    }
    getCurCarPos():Array<any> {
        var roads = this.getGrainRoads();
        if (!roads.length||roads.length < 1) {
            return [null,null,null];
        }
        var curRoad = roads[0];
        var minePit1 = curRoad.getMine_id();
        var minePit2 = curRoad.getNext_mine_id();
        var percent = 0;
        var interval = this.getConfig().moving;
        var curMSTime = G_ServerTime.getMSTime();
        if (curMSTime < curRoad.getLeave_time() * 1000) {
            percent = 0;
        } else if (curMSTime > curRoad.getLeave_time() * 1000 + interval * 1000) {
            percent = 1;
        } else {
            percent = (curMSTime - curRoad.getLeave_time() * 1000) / (interval * 1000);
        }
        return [
            minePit1,
            minePit2,
            percent
        ];
    }
    getRoutePercent() {
        var curTime = G_ServerTime.getTime();
        return (curTime - this.getStart_time()) / (this.getEnd_time() - this.getStart_time());
    }
    getStartMine() {
        var roads = this.getRoute();
        if (roads.length < 1) {
            return null;
        }
        var curRoad = roads[0];
        var minePit = curRoad.getMine_id();
        return minePit;
    }
    isStop() {
        var roads = this.getGrainRoads();
        if (!roads.length||roads.length < 1) {
            return null;
        }
        var curRoad = roads[0];
        return G_ServerTime.getTime() < curRoad.getLeave_time() || curRoad.getLeave_time() == 0;
    }
    isOnWay() {
        var [_, _, percent] = this.getCurCarPos();
        return percent > 0 && percent < 1;
    }
    isReachTerminal() {
        var roads = this.getGrainRoads();
        if ((!roads.length||roads.length < 1) && this.getStamina() > 0) {
            return true;
        }
        var curRoad = roads[0];
        if (curRoad.getNext_mine_id() == 0 && this.getStamina() > 0) {
            return true;
        }
        return false;
    }
    getLeaveTime() {
        var roads = this.getGrainRoads();
        var curRoad = roads[0];
        var leaveTime = curRoad.getLeave_time();
        return leaveTime;
    }
    isFriendCar() {
        var guildId = G_UserData.getGuild().getMyGuildId();
        return this.getGuild_id() == guildId;
    }
    hasLaunched() {
        return this.getStart_time() > 0;
    }
    isActive() {
        var curTime = G_ServerTime.getTime();
        return curTime > this.getStart_time() && curTime < this.getEnd_time() && this.getStamina() > 0;
    }
    isDead() {
        return this.getStamina() <= 0;
    }
    hasComplete() {
        var curTime = G_ServerTime.getTime();
        return curTime >= this.getEnd_time() && this.getStamina() > 0;
    }
    getNextRouteList() {
        var routeList = this.getRoute_point();
        var i = 0;
        var curPit = this.getCurPit();
        while (i < routeList.length) {
            var pit = routeList[i];
            if (curPit != pit) {
                routeList.splice(i,1);
                i = i - 1;
            } else {
                break;
            }
            i = i + 1;
        }
        return routeList;
    }
    _initPassedRouteList() {
        var routePassed = [];
        var routeList = this.getWholeRoute();
        var i = 0;
        var curPit = this.getCurPit();
        while (i < routeList.length) {
            var pit = routeList[i];
            routePassed.push(pit);
            if (curPit == pit) {
                break;
            }
            i = i + 1;
        }
        this.setRoute_passed(routePassed);
    }
    getWholeRoute() {
        if (this.getRoad_id() > 0) {
            return GrainCarConfigHelper.getRouteWithId(this.getRoad_id());
        } else {
            var routeList = [];
            var roadList = this.getRoute();
            for (var i = 0; i < roadList.length; i++) {
                var road = roadList[i];
                var minePit = road.getMine_id();
                routeList.push(minePit);
            }
            return routeList;
        }
    }
}
