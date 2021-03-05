import { BaseData } from "./BaseData";
import { G_NetworkManager, G_SignalManager, G_UserData, G_ServiceManager, G_ServerTime, G_ConfigLoader } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { SignalConst } from "../const/SignalConst";
import { GuildCrossWarHelper } from "../scene/view/guildCrossWar/GuildCrossWarHelper";
import { GuildCrossWarConst } from "../const/GuildCrossWarConst";
import { GuildCrossWarUserUnitData } from "./GuildCrossWarUserUnitData";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { FunctionCheck } from "../utils/logic/FunctionCheck";
import { FunctionConst } from "../const/FunctionConst";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { GuildCrossWarPointUnitData } from "./GuildCrossWarPointUnitData";
import { GuildCrossWarBossUnitData } from "./GuildCrossWarBossUnitData";

export interface GuildCrossWarData {
getPointMap(): Object
setPointMap(value: Object): void
getLastPointMap(): Object
getUserMap(): Object
setUserMap(value: Object): void
getLastUserMap(): Object
getBossMap(): Object
setBossMap(value: Object): void
getLastBossMap(): Object
getPointHoleMap(): Object
setPointHoleMap(value: Object): void
getLastPointHoleMap(): Object
}
let schema = {};
schema['pointMap'] = [
    'object',
    {}
];
schema['userMap'] = [
    'object',
    {}
];
schema['bossMap'] = [
    'object',
    {}
];
schema['pointHoleMap'] = [
    'object',
    {}
];
export class GuildCrossWarData extends BaseData {

    public static schema = schema;

    _oriPoinId: number;
    _atcktarget: number;
    _warKeyMap;
    _warHoleMap;
    _warPointMap;
    _warHoleList;
    _msgGuildCrossWarEnter;
    _msgGuildCrossUpdatePlayer;
    _msgGuildCrossUpdateKeyPoint;
    _msgGuildCrossMove;
    _msgGuildCrossFight;
    _msgGuildCrossFightNotice;
    _msgGuildCrossFollowMe;
    _msgGuildCrossLadde;
    _signalAllDataReady;
    _msgGuildCrossLadder;

    constructor(properties?) {
        super(properties);
        this._oriPoinId = 0;
        this._atcktarget = 0;
        this._warKeyMap = {};
        this._warHoleMap = {};
        this._warPointMap = {};
        this._initWarPointCfg();
        this._initWarHioleCfg();
        this._initWarMapCfg();
        this._warHoleList = {};
        this._initWarHoleList();
        this._msgGuildCrossWarEnter = G_NetworkManager.add(MessageIDConst.ID_S2C_BrawlGuildsEntry, this._s2cGuildCrossWarEnter.bind(this));
        this._msgGuildCrossUpdatePlayer = G_NetworkManager.add(MessageIDConst.ID_S2C_BrawlGuildsUpdatePlayer, this._s2cGuildCrossUpdatePlayer.bind(this));
        this._msgGuildCrossUpdateKeyPoint = G_NetworkManager.add(MessageIDConst.ID_S2C_BrawlGuildsUpdateKeyPoint, this._s2cGuildCrossUpdateKeyPoint.bind(this));
        this._msgGuildCrossMove = G_NetworkManager.add(MessageIDConst.ID_S2C_BrawlGuildsMove, this._s2cGuildCrossMove.bind(this));
        this._msgGuildCrossFight = G_NetworkManager.add(MessageIDConst.ID_S2C_BrawlGuildsFight, this._s2cBrawlGuildsFight.bind(this));
        this._msgGuildCrossFightNotice = G_NetworkManager.add(MessageIDConst.ID_S2C_BrawlGuildsFightNotice, this._s2cBrawlGuildsFightNotice.bind(this));
        this._msgGuildCrossFollowMe = G_NetworkManager.add(MessageIDConst.ID_S2C_BrawlGuildsFollowMe, this._s2cBrawlGuildsFollowMe.bind(this));
        this._msgGuildCrossLadder = G_NetworkManager.add(MessageIDConst.ID_S2C_BrawlGuildsLadder, this._s2cBrawlGuildsLadder.bind(this));
        this._signalAllDataReady = G_SignalManager.add(SignalConst.EVENT_RECV_FLUSH_DATA, this._onAllDataReady.bind(this));
    }
    public clear() {
        this._msgGuildCrossWarEnter.remove();
        this._msgGuildCrossWarEnter = null;
        this._msgGuildCrossUpdatePlayer.remove();
        this._msgGuildCrossUpdatePlayer = null;
        this._msgGuildCrossUpdateKeyPoint.remove();
        this._msgGuildCrossUpdateKeyPoint = null;
        this._msgGuildCrossMove.remove();
        this._msgGuildCrossMove = null;
        this._msgGuildCrossFight.remove();
        this._msgGuildCrossFight = null;
        this._msgGuildCrossFightNotice.remove();
        this._msgGuildCrossFightNotice = null;
        this._msgGuildCrossFollowMe.remove();
        this._msgGuildCrossFollowMe = null;
        this._signalAllDataReady.remove();
        this._signalAllDataReady = null;
    }
    public c2sBrawlGuildsEntry() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_BrawlGuildsEntry, {});
    }
    public _s2cGuildCrossWarEnter(id, message) {
        this._updateKeyPoint(message);
        this._updateUsers(message, GuildCrossWarConst.SELF_ENTER);
        this._oriPoinId = message['init_key_point_id'] || 0;
        G_SignalManager.dispatch(SignalConst.EVENT_GUILDCROSS_WAR_ENTRY);
    }
    public c2sBrawlGuildsMove(to, needTime) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_BrawlGuildsMove, {
            to: to,
            need_time: needTime
        });
    }
    public _s2cGuildCrossMove(id, message) {
        if (!message.hasOwnProperty('to')) {
            return;
        }
        this._updateUsers(message);
        this._updateKeyPoint(message);
        this._updateSelfUnit(message, GuildCrossWarConst.SELF_MOVE);
        G_SignalManager.dispatch(SignalConst.EVENT_GUILDCROSS_WAR_SELFMOVE, message.need_time);
    }
    public c2sBrawlGuildsFollowMe(atckId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_BrawlGuildsFollowMe, { key_point_id: atckId });
    }
    public _s2cBrawlGuildsFollowMe(id, message) {
        if (!message.hasOwnProperty('key_point_id')) {
            return;
        }
        this._atcktarget = message.key_point_id;
    }
    public c2sBrawlGuildsFight(target) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_BrawlGuildsFight, { target: target });
    }
    public _s2cBrawlGuildsFight(id, message) {
        let selfUnit = this.getSelfUnit();
        if (selfUnit != null) {
            let curBossUnit = this.getBossUnitById(selfUnit.getCurPointId());
            if (!message['fight_type']) {
                if (curBossUnit && message['hurt']) {
                    let hp = curBossUnit.getHp() - message.hurt;
                    let curHp = hp > 0 && hp || 0;
                    curBossUnit.setHp(curHp);
                    G_SignalManager.dispatch(SignalConst.EVENT_GUILDCROSS_WAR_FIGHT, message);
                }
            } else {
                this._updateKeyPoint(message);
                this._updateUsers(message);
                this._updateSelfUnit(message, GuildCrossWarConst.SELF_FIGHT);
                if (message.hasOwnProperty('players')) {
                    selfUnit.setHp(0);
                } else if (message.hasOwnProperty('own_hp')) {
                    let selfHp = selfUnit.getHp() - message.own_hp;
                    selfUnit.setHp(selfHp > 0 && selfHp || 0);
                }
                if (message.hasOwnProperty('key_point') && message.hasOwnProperty('players')) {
                    G_SignalManager.dispatch(SignalConst.EVENT_GUILDCROSS_WAR_SELFDIE, message);
                } else {
                    let isKill = message['is_kill'] || false;
                    if (isKill == true) {
                        G_SignalManager.dispatch(SignalConst.EVENT_GUILDCROSS_WAR_OTHERDIE, message);
                    } else {
                        G_SignalManager.dispatch(SignalConst.EVENT_GUILDCROSS_WAR_FIGHT, message);
                    }
                }
            }
        }
    }
    public _s2cGuildCrossUpdatePlayer(id, message) {
        let player = message['player'];
        if (player == null || player['uid'] == null) {
            return;
        }
        if (!message.hasOwnProperty('action')) {
            return;
        }
        this._updateUsers(message);
        G_SignalManager.dispatch(SignalConst.EVENT_GUILDCROSS_WAR_UPDATEPLAYER, message);
    }
    public _s2cGuildCrossUpdateKeyPoint(id, message) {
        this._updateKeyPoint(message);
        G_SignalManager.dispatch(SignalConst.EVENT_GUILDCROSS_WAR_UPDATEPOINT);
    }
    public _s2cBrawlGuildsFightNotice(id, message) {
        if (!message.hasOwnProperty('key_point_id')) {
            return;
        }
        let curBossUnit = this.getBossUnitById(message.key_point_id);
        if (curBossUnit && message['hurt']) {
            curBossUnit.setHp(curBossUnit.getHp() - message.hurt);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GUILDCROSS_WAR_OTHER_SEE_BOSSS, message);
    }
    public c2sBrawlGuildsLadder(type) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_BrawlGuildsLadder, { ladder_type: type });
    }
    public _s2cBrawlGuildsLadder(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GUILDCROSS_WAR_LADDER, message);
    }
    public _onAllDataReady() {
        let bInGuild = false;
        let [ isOpen ] = FunctionCheck.funcIsOpened(FunctionConst.FUNC_GUILD_CROSS_WAR)[0];
        if (isOpen && GuildCrossWarHelper.isTodayOpen()) {
            let state, __;
            GuildCrossWarHelper.getCurCrossWarStage();
            if (state != GuildCrossWarConst.ACTIVITY_STAGE_3) {
                bInGuild = GuildCrossWarHelper.isGuildCrossWarEntry();
            }
        }
        if (G_UserData.isFlush() && bInGuild) {
            this.c2sBrawlGuildsEntry();
        }
    }
    public _updateUsers(message, stage?) {
        if (this._createPlayer(message)) {
            return;
        }
        this._createPlayers(message, stage);
    }
    public _createUserUnit(data) {
        let key = data.uid;
        let playerUnit = new GuildCrossWarUserUnitData();
        playerUnit.updateData(data);
        return [
            key,
            playerUnit
        ];
    }
    public _createPlayer(message) {
        let player = message['player'];
        if (player != null) {
            let userMap = this.getUserMap();
            let [ key, unit ] = this._createUserUnit(player);
            if (message.hasOwnProperty('action')) {
                unit.setAction(message.action);
            }
            if (message.hasOwnProperty('move_end_time')) {
                unit.setMove_end_time(message.move_end_time);
            }
            if (message.hasOwnProperty('need_time')) {
                let endTime = G_ServerTime.getTime() + message.need_time;
                unit.setMove_end_time(endTime);
            }
            if (message.hasOwnProperty('revive_time')) {
                unit.setRevive_time(message.revive_time);
            }
            if (message.hasOwnProperty('from')) {
                unit.setFrom_pos(message.from);
            }
            if (message.hasOwnProperty('to')) {
                unit.setTo_pos(message.to);
                this._updatePointHoleMap(message.to.pos, key);
            }
            userMap[key] = unit;
            return true;
        }
        return false;
    }
    public _updatePointHoleMap(grid, uId) {
        if (typeof grid != 'number') {
            return null;
        }
        let pointHoleMap = this.getPointHoleMap() || {};
        if (!pointHoleMap[grid]) {
            pointHoleMap[grid] = {};
        }
        for (let pos in pointHoleMap) {
            let holeMap = pointHoleMap[pos];
            if (typeof holeMap == 'object') {
                for (let k in holeMap) {
                    let value = holeMap[k];
                    if (uId == value) {
                        pointHoleMap[pos].splic(k);
                        if (Object.keys(pointHoleMap[pos]).length <= 0) {
                            pointHoleMap[pos] = null;
                        }
                        break;
                    }
                }
            }
        }
        if (!pointHoleMap[grid]) {
            pointHoleMap[grid] = {};
        }
        pointHoleMap[grid].push(uId);
    }
    public _createPlayers(message, state) {
        let players = message['players'];
        if (players != null) {
            let userMap = this.getUserMap();
            for (let k in players) {
                let v = players[k];
                v.index = Number(k);
                if (!GuildCrossWarHelper.isSelf(v.uid) || state == GuildCrossWarConst.SELF_ENTER) {
                    let [ key, unit ] = this._createUserUnit(v);
                    userMap[key] = unit;
                    this._updatePointHoleMap(unit.getCurGrid(), key);
                }
            }
        }
    }
    public _updateSelfUnit(data, state) {
        let unit = this.getSelfUnit();
        if (unit == null) {
            return;
        }
        if (state == GuildCrossWarConst.SELF_MOVE) {
            if (data.hasOwnProperty('move_cd')) {
                let cdTime = data.move_cd;
                unit.setMove_cd(cdTime);
            }
            if (data.hasOwnProperty('need_time')) {
                unit.setNeed_time(data['need_time']);
                unit.setMove_end_time(G_ServerTime.getTime() + data.need_time);
            }
            if (data.hasOwnProperty('to')) {
                let tempToPos = unit.getTo_pos();
                unit.setFrom_pos(tempToPos);
                unit.setTo_pos(data['to']);
                this._updatePointHoleMap(unit.getCurGrid(), unit.getUid());
            }
        } else if (state == GuildCrossWarConst.SELF_FIGHT) {
            if (data.hasOwnProperty('revive_time')) {
                unit.setRevive_time(data['revive_time']);
            }
            if (data.hasOwnProperty('fight_cd')) {
                unit.setFight_cd(data['fight_cd']);
            }
            if (data.hasOwnProperty('key_point') && data.hasOwnProperty('players')) {
                for (let k in data.players) {
                    let v = data.players[k];
                    if (GuildCrossWarHelper.isSelf(v.uid)) {
                        let tempToPos = unit.getTo_pos();
                        unit.setFrom_pos(tempToPos);
                        unit.setTo_pos({
                            key_point_id: v.key_point_id,
                            pos: v.pos
                        });
                        this._updatePointHoleMap(unit.getCurGrid(), unit.getUid());
                        break;
                    }
                }
            }
        }
        return unit;
    }
    public _updateKeyPoint(message) {
        function createPointUnit(data) {
            let keyPointUnit = new GuildCrossWarPointUnitData();
            keyPointUnit.updateData(data);
            return keyPointUnit;
        }
        function createBossUnit(data) {
            let bossUnit = new GuildCrossWarBossUnitData();
            bossUnit.updateData(data);
            return bossUnit;
        }
        let keyPoint = message['key_point'];
        if (keyPoint != null) {
            if (!keyPoint.hasOwnProperty('key_point_id')) {
                return;
            }
            let unitData = {
                key_point_id: keyPoint['key_point_id'],
                guild_id: keyPoint['guild_id'],
                guild_name: keyPoint['guild_name'],
                sid: keyPoint['sid'],
                sname: keyPoint['sname'],
                action: keyPoint['action']
            };
            let pointMap = this.getPointMap();
            pointMap[keyPoint.key_point_id] = createPointUnit(unitData);
            let bExist = GuildCrossWarHelper.isExistBossInPoint(keyPoint.key_point_id), bossCfg;
            if (!bExist) {
                return;
            }
            let bossData = {
                id: keyPoint['key_point_id'],
                hp: keyPoint['hp'],
                max_hp: keyPoint['max_hp'],
                config: bossCfg
            };
            let bossMap = this.getBossMap();
            if (!bossMap[keyPoint.key_point_id]) {
                bossMap[keyPoint.key_point_id] = createBossUnit(bossData);
            }
        }
    }
    public getPointDataById(pointId) {
        if (pointId == null || typeof pointId != 'number') {
            return null;
        }
        let pointMap = this.getPointMap();
        if (typeof pointMap != 'object') {
            return null;
        }
        if (pointMap[pointId] == null) {
            return null;
        }
        return pointMap[pointId];
    }
    public getBossUnitById(pointId) {
        if (pointId == null || typeof pointId != 'number') {
            return null;
        }
        let bossUnitMap = this.getBossMap();
        if (typeof bossUnitMap != 'object') {
            return null;
        }
        if (bossUnitMap[pointId] == null) {
            return null;
        }
        return bossUnitMap[pointId];
    }
    public setBossUnitById(pointId) {
        let bossMap = this.getBossMap();
        bossMap[pointId] = null;
    }
    public getCurPointData(pointId) {
        if (typeof pointId != 'number') {
            return null;
        }
        let pointHoleMap = this.getPointHoleMap() || null;
        if (pointHoleMap == null || !pointHoleMap[pointId]) {
            return null;
        }
        return pointHoleMap[pointId];
    }
    public getCurHoleData(pointHole) {
        let pointHoleMap = this.getPointHoleMap() || null;
        if (pointHoleMap == null) {
            return null;
        }
        if (!pointHoleMap[pointHole]) {
            return null;
        }
        return pointHoleMap[pointHole];
    }
    public getWarKeyMap() {
        return this._warKeyMap;
    }
    public getWarHoleMap() {
        return this._warHoleMap;
    }
    public getWarPointMap() {
        return this._warPointMap;
    }
    public getWarHoleList() {
        return this._warHoleList;
    }
    public reset() {
    }
    public _stringToNumber(strList) {
        let moveStrList = strList.split('|');
        let retList: number[] = [];
        for (let i in moveStrList) {
            let value = moveStrList[i];
            retList.push(Number(value));
        }
        return retList;
    }
    public _initWarPointCfg() {
        function makeClickRect(cfg) {
            let pointKey = cc.v2(cfg['map_x'], cfg['map_y']);
            let rangeX = cfg.range_x;
            let rangeY = cfg.range_y;
            let clickRect = cc.rect(pointKey.x - rangeX * 0.5, pointKey.y - rangeY * 0.5, rangeX, rangeY);
            return clickRect;
        }
        let guild_cross_war = G_ConfigLoader.getConfig(ConfigNameConst.GUILD_CROSS_WAR);
        for (let i = 0; i < guild_cross_war.length(); i++) {
            let indexData = guild_cross_war.indexOf(i);
            let keyData = {
                cfg: indexData,
                keyList: this._stringToNumber(indexData.move),
                clickRect: makeClickRect(indexData)
            };
            this._warKeyMap[indexData.id] = keyData;
        }
    }
    public _initWarHoleList() {
        function makeClickRect(cfg) {
            let pointKeyX = (cfg.axis_x - 1) * GuildCrossWarConst.GRID_SIZE + 5;
            let pointKeyY = (cfg.axis_y - 1) * GuildCrossWarConst.GRID_SIZE + 5;
            let clickRect = cc.rect(pointKeyX, pointKeyY, GuildCrossWarConst.GRID_SIZE - 5, GuildCrossWarConst.GRID_SIZE - 5);
            return clickRect;
        }
        let guild_cross_war = G_ConfigLoader.getConfig(ConfigNameConst.GUILD_CROSS_WAR);
        for (let i = 0; i < guild_cross_war.length(); i++) {
            let indexData = guild_cross_war.indexOf(i);
            let data = {
                clickRect: makeClickRect(indexData),
                isMove: indexData.is_move,
                point: indexData.point_y
            };
            this._warHoleList[indexData.id] = data;
        }
    }
    public _initWarHioleCfg() {
        function makeClickRect(cfg) {
            let holeKey = cc.v2(cfg['point_x'], cfg['point_y']);
            let range = cfg.point_range;
            let clickRect = cc.rect(holeKey.x - range * 0.5, holeKey.y - range * 0.5, range, range);
            return clickRect;
        }
        let guild_cross_war_point = G_ConfigLoader.getConfig(ConfigNameConst.GUILD_CROSS_WAR_POINT);
        for (let i = 0; i < guild_cross_war_point.length(); i++) {
            let indexData = guild_cross_war_point.indexOf(i);
            let keyData = {
                cfg: indexData,
                centerPoint: cc.v2(indexData.point_x, indexData.point_y),
                clickRect: makeClickRect(indexData)
            };
            if (this._warHoleMap[indexData.point_id] == null) {
                this._warHoleMap[indexData.point_id] = {};
            }
            this._warHoleMap[indexData.point_id][indexData.hole_id] = keyData;
        }
    }
    public _initWarMapCfg() {
        let guild_cross_war_map = G_ConfigLoader.getConfig(ConfigNameConst.GUILD_CROSS_WAR_MAP);
        for (let i = 0; i < guild_cross_war_map.length(); i++) {
            let indexData = guild_cross_war_map.indexOf(i);
            if (indexData.point_y != 0) {
                if (this._warPointMap[indexData.point_y] == null) {
                    this._warPointMap[indexData.point_y] = {};
                }
                this._warPointMap[indexData.point_y][indexData.id] = indexData;
            }
        }
    }
    public getUnitById(userId) {
        let userMap = this.getUserMap();
        let unit = userMap[userId];
        if (unit) {
            return unit;
        }
        return null;
    }
    public findPointKey(position) {
        for (let key in this._warKeyMap) {
            let value = this._warKeyMap[key];
            if (value.clickRect != null) {
                if ((value.clickRect as cc.Rect).contains(position)) {
                    return key;
                }
            }
        }
        return null;
    }
    public findPointHoleKey(position) {
        let point = this.findPointKey(position);
        if (point == null) {
            return null;
        }
        let pointHole: any = {
            key_point_id: point,
            pos: 1
        };
        let preDistance = 0;
        let holeMap = this._warHoleMap[point];
        for (let hole in holeMap) {
            let value = holeMap[hole];
            if (value.clickRect != null) {
                if (value.clickRect.contains(position)) {
                    return {
                        key_point_id: point,
                        pos: hole
                    };
                }
            }
            if (value.centerPoint != null) {
                let positionX = position.x, positionY = position.y;
                let curDistance = Math.abs(cc.pGetDistance(cc.v2(positionX, positionY), value.centerPoint));
                preDistance = preDistance == 0 && curDistance || preDistance;
                pointHole = curDistance < preDistance && {
                    key_point_id: point,
                    pos: hole
                } || pointHole;
            }
        }
        return pointHole;
    }
    public getClickKeyRectList() {
        let retList = [];
        for (let key in this._warKeyMap) {
            let value = this._warKeyMap[key];
            if (value.clickRect != null) {
                retList.push(value.clickRect);
            }
        }
        return retList;
    }
    public getSelfUserId() {
        return G_UserData.getBase().getId();
    }
    public getSelfUnit() {
        let unit = this.getUnitById(this.getSelfUserId());
        if (unit) {
            return unit;
        }
        return null;
    }
    public getSelfOriPoint() {
        return this._oriPoinId;
    }
    public setSelfGuildTarget(attackId) {
        this._atcktarget = attackId;
    }
    public getSelfGuildTarget() {
        return this._atcktarget;
    }
}
