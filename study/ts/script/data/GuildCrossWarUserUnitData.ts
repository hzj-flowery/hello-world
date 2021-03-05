import { BaseData } from "./BaseData";
import { GuildCrossWarHelper } from "../scene/view/guildCrossWar/GuildCrossWarHelper";
import ParameterIDConst from "../const/ParameterIDConst";
import { G_UserData, G_ServerTime } from "../init";
import { GuildCrossWarConst } from "../const/GuildCrossWarConst";

export interface GuildCrossWarUserUnitData {
    getUid(): number
    setUid(value: number): void
    getLastUid(): number
    getSid(): number
    setSid(value: number): void
    getLastSid(): number
    getSname(): string
    setSname(value: string): void
    getLastSname(): string
    getName(): string
    setName(value: string): void
    getLastName(): string
    getBase_id(): number
    setBase_id(value: number): void
    getLastBase_id(): number
    getAvatar_base_id(): number
    setAvatar_base_id(value: number): void
    getLastAvatar_base_id(): number
    getGuild_id(): number
    setGuild_id(value: number): void
    getLastGuild_id(): number
    getGuild_name(): string
    setGuild_name(value: string): void
    getLastGuild_name(): string
    getOfficer_level(): number
    setOfficer_level(value: number): void
    getLastOfficer_level(): number
    getTitle(): number
    setTitle(value: number): void
    getLastTitle(): number
    getHp(): number
    setHp(value: number): void
    getLastHp(): number
    getMax_hp(): number
    setMax_hp(value: number): void
    getLastMax_hp(): number
    getPower(): number
    setPower(value: number): void
    getLastPower(): number
    getAction(): number
    setAction(value: number): void
    getLastAction(): number
    getMove_end_time(): number
    setMove_end_time(value: number): void
    getLastMove_end_time(): number
    getNeed_time(): number
    setNeed_time(value: number): void
    getLastNeed_time(): number
    getMove_cd(): number
    setMove_cd(value: number): void
    getLastMove_cd(): number
    getFight_cd(): number
    setFight_cd(value: number): void
    getLastFight_cd(): number
    getRevive_time(): number
    setRevive_time(value: number): void
    getLastRevive_time(): number
    getFrom_pos(): any
    setFrom_pos(value: any): void
    getLastFrom_pos(): any
    getTo_pos(): any
    setTo_pos(value: any): void
    getLastTo_pos(): any
}
let schema = {};
schema['uid'] = [
    'number',
    0
];
schema['sid'] = [
    'number',
    0
];
schema['sname'] = [
    'string',
    ''
];
schema['name'] = [
    'string',
    ''
];
schema['base_id'] = [
    'number',
    0
];
schema['avatar_base_id'] = [
    'number',
    0
];
schema['guild_id'] = [
    'number',
    0
];
schema['guild_name'] = [
    'string',
    ''
];
schema['officer_level'] = [
    'number',
    0
];
schema['title'] = [
    'number',
    0
];
schema['hp'] = [
    'number',
    0
];
schema['max_hp'] = [
    'number',
    0
];
schema['power'] = [
    'number',
    0
];
schema['action'] = [
    'number',
    0
];
schema['move_end_time'] = [
    'number',
    0
];
schema['need_time'] = [
    'number',
    0
];
schema['move_cd'] = [
    'number',
    0
];
schema['fight_cd'] = [
    'number',
    0
];
schema['revive_time'] = [
    'number',
    0
];
schema['from_pos'] = [
    'object',
    {}
];
schema['to_pos'] = [
    'object',
    {}
];
export class GuildCrossWarUserUnitData extends BaseData {
    public static schema = schema;
    _isReachEdge: boolean;
    _isMoving: boolean;
    constructor(properties?) {
        super(properties);
        this._isReachEdge = false;
        this._isMoving = false;
    }
    public clear() {
    }
    public reset() {
    }
    public updateData(data) {
        this.setProperties(data);
        this.updatePosition(data);
        this.setMaxHp();
    }
    public updatePosition(data) {
        if (!data.hasOwnProperty('key_point_id')) {
            return;
        }
        if (data.hasOwnProperty('pos') && data['pos'] != 0) {
            this.setTo_pos({
                key_point_id: data.key_point_id,
                pos: data.pos
            });
            return;
        }
        let holeMap = G_UserData.getGuildCrossWar().getWarPointMap();
        let holeKeys = Object.keys(holeMap[data.key_point_id]);
        let pos = Math.randInt(1, holeKeys.length);
        this.setTo_pos({
            key_point_id: data.key_point_id,
            pos: holeKeys[pos]
        });
    }
    public setMaxHp() {
        let maxHp = Number(GuildCrossWarHelper.getParameterContent(ParameterIDConst.GUILDCROSS_USER_MAXHP));
        this.setMax_hp(maxHp);
    }
    public getCurPointId() {
        return this.getTo_pos().key_point_id;
    }
    public getCurPointHole() {
        return this.getTo_pos();
    }
    public getCurGrid() {
        return this.getTo_pos().pos;
    }
    public getCurrPointKeyPos() {
        let curState = this.getCurrState();
        if (curState == GuildCrossWarConst.UNIT_STATE_MOVING) {
            return GuildCrossWarHelper.getOffsetPointRange(this.getFrom_pos().pos);
        } else {
            return GuildCrossWarHelper.getOffsetPointRange(this.getTo_pos().pos);
        }
        return null;
    }
    public getCurrState() {
        let reviveTime = this.getRevive_time() > 0 && G_ServerTime.getLeftSeconds(this.getRevive_time()) || 0;
        if (reviveTime > 0) {
            return GuildCrossWarConst.UNIT_STATE_DEATH;
        }
        let movingEnd = this.getMove_end_time() > 0 && G_ServerTime.getLeftSeconds(this.getMove_end_time()) || 0;
        if (movingEnd > 0) {
            return GuildCrossWarConst.UNIT_STATE_MOVING;
        }
        let cdLeftTime = this.getMove_cd() > 0 && G_ServerTime.getLeftSeconds(this.getMove_cd()) || 0;
        if (cdLeftTime > 0) {
            return GuildCrossWarConst.UNIT_STATE_CD;
        }
        return GuildCrossWarConst.UNIT_STATE_IDLE;
    }
    public getNeedTime(target) {
        let fromPos = this.getTo_pos();
        let targetPos = target;
        if (Object.keys(fromPos).length != 2 && typeof targetPos != 'number') {
            return {};
        }
        let movingLine = GuildCrossWarHelper.getMovingLine(fromPos.pos, targetPos);
        let totalTime = 0;
        for (let index = 0; index < movingLine.length; index++) {
            let value = movingLine[index];
            if (index > 1) {
                let point1 = movingLine[index - 1];
                let point2 = movingLine[index];
                let time = cc.pGetDistance(point1, point2) || 0;
                totalTime = totalTime + time;
            }
        }
        totalTime = Number('%.2f'.format(totalTime / GuildCrossWarConst.AVATAR_MOVING_RATE));
        return Math.ceil(totalTime);
    }
    public getCameraPath() {
        let fromPos = this.getFrom_pos();
        let targetPos = this.getTo_pos();
        if (Object.keys(fromPos).length != 2 && Object.keys(targetPos).length != 2) {
            return {};
        }
        let line = [];
        let srcPos = GuildCrossWarHelper.getWarMapGridCenter(fromPos.pos);
        let destPos = GuildCrossWarHelper.getWarMapGridCenter(targetPos.pos);
        line.push(srcPos);
        line.push(destPos);
        let moveData = [];
        let distance = cc.pGetDistance(srcPos, destPos);
        let lineData = {
            curLine: line,
            totalTime: Number('%.2f'.format(distance / GuildCrossWarConst.AVATAR_MOVING_RATE)),
            endTime: this.getMove_end_time()
        };
        moveData.push(lineData);
        return moveData;
    }
    public getMovingPath(selfX, selfY) {
        let fromPos = this.getFrom_pos();
        let targetPos = this.getTo_pos();
        if (Object.keys(fromPos).length != 2 && Object.keys(targetPos).length != 2) {
            return {};
        }
        let movingLine = GuildCrossWarHelper.getMovingLine(fromPos.pos, targetPos.pos);
        if (movingLine && movingLine.length > 0) {
            movingLine[1] = cc.v2(selfX, selfY);
            let moveData = [];
            for (let index = 0; index < movingLine.length; index++) {
                let value = movingLine[index];
                if (index > 1) {
                    let line = [];
                    let lineData = {};
                    let point1 = movingLine[index - 1];
                    let point2 = movingLine[index];
                    line.push(point1);
                    line.push(point2);
                    let distance = cc.pGetDistance(point1, point2);
                    lineData = {
                        curLine: line,
                        totalTime: Number('%.2f'.format(distance / GuildCrossWarConst.AVATAR_MOVING_RATE)),
                        endTime: this.getMove_end_time()
                    };
                    moveData.push(lineData);
                }
            }
            return moveData;
        }
        return {};
    }
    public checkCanMoving(gridData) {
        if (typeof gridData != 'object') {
            return false;
        }
        if (gridData.is_move == 0) {
            return false;
        }
        if (!GuildCrossWarHelper.checkCanMovedPoint(this.getTo_pos(), gridData)) {
            return false;
        }
        let curPointId = this.getCurPointId();
        let bossUnit = G_UserData.getGuildCrossWar().getBossUnitById(curPointId);
        if (bossUnit == null) {
            cc.log(this.getCurrState());
            return this.getCurrState() == GuildCrossWarConst.UNIT_STATE_IDLE;
        }
        cc.log('GuildCrossWarUserUnitData:checkCanMoving 555');
        let bossState = bossUnit.getCurState(), __;
        cc.log(bossState);
        if (bossState != GuildCrossWarConst.BOSS_STATE_DEATH) {
            cc.log('GuildCrossWarUserUnitData:checkCanMoving 555 1');
            cc.log(gridData.point_y);
            if (gridData.point_y != 0) {
                return true;
            }
            return false;
        }
        return true;
    }
    public isSelf() {
        return this.getUid() == G_UserData.getBase().getId();
    }
    public isSelfGuild() {
        return this.getGuild_id() == G_UserData.getGuild().getMyGuildId();
    }
    public isGuildLeader() {
        let guildData = G_UserData.getGuild().getMyGuild();
        if (guildData == null) {
            return false;
        }
        let leaderId = guildData.getLeader();
        if (leaderId == 0 || leaderId == null) {
            return false;
        }
        return this.getUid() == guildData.getLeader();
    }
    public setReachEdge(bReach) {
        this._isReachEdge = bReach;
    }
    public isReachEdge() {
        return this._isReachEdge;
    }
    public setMoving(bMoving) {
        this._isMoving = bMoving;
    }
    public isMoving() {
        return this._isMoving;
    }
}
