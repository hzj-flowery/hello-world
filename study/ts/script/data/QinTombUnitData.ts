import { BaseData } from "./BaseData";
import { QinTombHelper } from "../scene/view/qinTomb/QinTombHelper";
import { QinTombConst } from "../const/QinTombConst";
import { G_UserData, G_ServerTime, G_ConfigLoader } from "../init";
import { ConfigNameConst } from "../const/ConfigNameConst";

export interface QinTombUnitData {
    getTeam_info(): any
    setTeam_info(value: any): void
    getLastTeam_info(): any
    getPath(): []
    setPath(value: []): void
    getLastPath(): []
    getBegin_time(): number
    setBegin_time(value: number): void
    getLastBegin_time(): number
    getNeed_time(): number
    setNeed_time(value: number): void
    getLastNeed_time(): number
    getReborn_time(): number
    setReborn_time(value: number): void
    getLastReborn_time(): number
    getTitle(): number
    setTitle(value: number): void
    getLastTitle(): number
}
let schema = {};
schema['team_info'] = [
    'object',
    {}
];
schema['path'] = [
    'object',
    {}
];
schema['begin_time'] = [
    'number',
    0
];
schema['need_time'] = [
    'number',
    0
];
schema['reborn_time'] = [
    'number',
    0
];
schema['title'] = [
    'number',
    0
];
export class QinTombUnitData extends BaseData {
    public static schema = schema;

    constructor(properties?) {
        super(properties);
    }
    public clear() {
    }
    public reset() {
    }
    public getTeamId() {
        let teamInfo = this.getTeam_info();
        return teamInfo.team_id;
    }
    public getTeamLeaderId() {
        let team_leader = this.getTeam_info().team_leader;
        return team_leader;
    }
    public getTeamUsers() {
        let teamUsers = {};
        let teamInfo = this.getTeam_info();
        for (let i in teamInfo.members) {
            let value = teamInfo.members[i];
            teamUsers[value.team_no] = value.user;
        }
        return teamUsers;
    }
    public updateData(serverData) {
        let team_info = serverData['team_info'] || {};
        this.setTeam_info(team_info);
        let path = serverData['path'] || [];
        this.setPath(path);
        let begin_time = serverData['begin_time'] || 0;
        this.setBegin_time(begin_time);
        let need_time = serverData['need_time'] || 0;
        this.setNeed_time(need_time);
        let reborn_time = serverData['reborn_time'] || 0;
        this.setReborn_time(reborn_time);
        // console.log("updateData:", new Date(this.getBegin_time() * 1000).toString(), this.getNeed_time());
    }
    public getCurrPointKeyPos() {
        let targetKey = this.getCurrPointKey();
        if (targetKey) {
            let targetPos = QinTombHelper.getRangePoint(targetKey);
            return targetPos;
        }
        return null;
    }
    public getCurrPointKeyMidPos() {
        let targetKey = this.getCurrPointKey();
        if (targetKey) {
            let targetPos = QinTombHelper.getMidPoint(targetKey)[0];
            return targetPos;
        }
        return null;
    }
    public getCurrPointKey() {
        if (this.getCurrState() == QinTombConst.TEAM_STATE_IDLE || this.getCurrState() == QinTombConst.TEAM_STATE_DEATH || this.getCurrState() == QinTombConst.TEAM_STATE_HOOK || this.getCurrState() == QinTombConst.TEAM_STATE_PK) {
            let pathList = this.getPath();
            return pathList[pathList.length - 1];
        }
        return null;
    }
    public getTargetPointKey() {
        if (this.getCurrState() == QinTombConst.TEAM_STATE_MOVING) {
            let pathList = this.getPath();
            return pathList[pathList.length - 1];
        }
        return null;
    }
    public getTargetPointPos() {
        let targetKey = this.getTargetPointKey();
        if (targetKey) {
            let targetValue = QinTombHelper.getMidPoint(targetKey)[0];
            return targetValue;
        }
        return null;
    }
    public getCameraKey() {
        let currKey = this.getCurrPointKey();
        if (currKey == null) {
            return null;
        }
        if (currKey) {
            let qin_point = G_ConfigLoader.getConfig(ConfigNameConst.QIN_POINT);
            let point_cfg = qin_point.get(currKey);
            console.assert(point_cfg, 'can not find qin_point by id :' + currKey);
            if (point_cfg.point_type == 3) {
                return currKey;
            }
        }
        return null;
    }
    public getBattleMonsterId() {
        let currTeamId = this.getTeamId();
        let monsterList = G_UserData.getQinTomb().getMonsterList();
        if (monsterList && monsterList.length > 0) {
            for (let i in monsterList) {
                let value = monsterList[i];
                if (value.getBattle_team_id() == currTeamId) {
                    return value.getPoint_id();
                }
                if (value.getOwn_team_id() == currTeamId) {
                    return value.getPoint_id();
                }
            }
        }
        return 0;
    }
    public getBatteTeamId() {
        let currTeamId = this.getTeamId();
        let monsterList = G_UserData.getQinTomb().getMonsterList();
        if (monsterList && monsterList.length > 0) {
            for (let i in monsterList) {
                let value = monsterList[i];
                if (value.getBattle_team_id() == currTeamId) {
                    return value.getOwn_team_id();
                }
                if (value.getOwn_team_id() == currTeamId) {
                    return value.getBattle_team_id();
                }
            }
        }
        return 0;
    }
    public getCurrState() {
        let rebornTime = this.getReborn_time();
        let curTime = G_ServerTime.getTime();
        if (curTime <= rebornTime) {
            return QinTombConst.TEAM_STATE_DEATH;
        }
        let currTeamId = this.getTeamId();
        let monsterList = G_UserData.getQinTomb().getMonsterList();
        if (monsterList && monsterList.length > 0) {
            for (let i in monsterList) {
                let value = monsterList[i];
                if (value.getBattle_team_id() == currTeamId) {
                    return QinTombConst.TEAM_STATE_PK;
                }
                if (value.getOwn_team_id() == currTeamId) {
                    return QinTombConst.TEAM_STATE_HOOK;
                }
            }
        }
        let endingTime = this.getBegin_time() * 1000 + this.getNeed_time();
        let currTime = G_ServerTime.getMSTime();
        // console.log("getCurrState",new Date(endingTime).toString(),new Date(currTime).toString());
        if (currTime < endingTime) {
            // console.log("getCurrState")
            return QinTombConst.TEAM_STATE_MOVING;
        }
        return QinTombConst.TEAM_STATE_IDLE;
    }
    public replaceStartEndPoint(startPos, endPoint, lineList: any[]) {
        let startPoint = startPos;
        endPoint = QinTombHelper.getRangePoint(endPoint);
        lineList[0].line[0] = [
            startPoint.x,
            startPoint.y
        ];
        let endLine = lineList[lineList.length - 1].line;
        endLine[endLine.length - 1] = [
            endPoint.x,
            endPoint.y
        ];
    }
    public getMovingPath(currX, currY) {
        let endingTime = this.getBegin_time() * 1000 + this.getNeed_time();
        let currTime = G_ServerTime.getMSTime();
        let path = this.getPath();
        if (currTime >= endingTime) {
            return path[path.length - 1];
        }
        let [returnTable] = G_UserData.getQinTomb().buildPathList(path) as any[][];
        for (let i in returnTable) {
            let value = returnTable[i];
            value.totalTime = value.totalTime + this.getBegin_time() * 1000;
        }
        let finalPath = this.moveToPath(returnTable);
        this.replaceStartEndPoint(cc.v2(currX, currY), path[path.length - 1], finalPath);
        G_UserData.getQinTomb().changeToCurveList(finalPath);
        return finalPath;
    }
    public moveToPath(pathList: any[]): any[] {
        let currTime = G_ServerTime.getTime();
        function seekIndex(): number {
            let lastIndex = pathList.length - 1;
            for (let i = 0; i < pathList.length; i++) {
                let value = pathList[i];
                if (currTime <= value.totalTime) {
                    return i;
                }
            }
            return lastIndex;
        }
        let lastIndex: number = seekIndex();
        let tempTable = [];
        for (let i = lastIndex; i < pathList.length; i++) {
            tempTable.push(pathList[i]);
        }
        return tempTable;
    }
    public isSelf() {
        let teamId = this.getTeamId();
        if (teamId == G_UserData.getQinTomb().getSelfTeamId()) {
            return true;
        }
        return false;
    }
    public isSelfTeamLead() {
        let teamLeader = this.getTeamLeaderId();
        if (teamLeader == G_UserData.getBase().getId() && this.isSelf()) {
            return true;
        }
        return false;
    }
}
