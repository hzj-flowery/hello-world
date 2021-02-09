import { G_NetworkManager, G_SignalManager, G_ConfigLoader, G_UserData, G_ServerTime } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { BaseData } from "./BaseData";
import { SignalConst } from "../const/SignalConst";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { FunctionCheck } from "../utils/logic/FunctionCheck";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { QinTombHelper } from "../scene/view/qinTomb/QinTombHelper";
import { QinTombMonsterData } from "./QinTombMonsterData";
import { QinTombUnitData } from "./QinTombUnitData";
import { CurveHelper } from "../utils/CurveHelper";
import { clone } from "../utils/GlobleFunc";
import { FunctionConst } from "../const/FunctionConst";

export interface QinTombData {
}
let schema = {};
export class QinTombData extends BaseData {
    public static schema = schema;
    _pointMap;
    _lineMap;
    _pointLineMap;
    _teamMap;
    _monsterMap;
    _monumentList:any[];
    _myTeamId;
    _nextKey;
    _showEffect;
    _movingSpeed;
    _msgGraveEnterScene;
    _teamCacheList;
    _msgUpdateGrave;
    _msgGraveMove;
    _msgGraveBattleNotice;
    _msgGraveLeaveBattle;
    _msgGraveReward;
    _signalAllDataReady;


    constructor(properties?) {
        super(properties);
        this._pointMap = {};
        this._lineMap = {};
        this._pointLineMap = {};
        this._teamMap = {};
        this._monsterMap = {};
        this._monumentList = [];
        this._myTeamId = 0;
        this._nextKey = null;
        this._showEffect = false;
        this._movingSpeed = null;
        this._buildPointMap();
        this._msgGraveEnterScene = G_NetworkManager.add(MessageIDConst.ID_S2C_GraveEnterScene, this._s2cGraveEnterScene.bind(this));
        this._msgUpdateGrave = G_NetworkManager.add(MessageIDConst.ID_S2C_UpdateGrave, this._s2cUpdateGrave.bind(this));
        this._msgGraveMove = G_NetworkManager.add(MessageIDConst.ID_S2C_GraveMove, this._s2cGraveMove.bind(this));
        this._msgGraveBattleNotice = G_NetworkManager.add(MessageIDConst.ID_S2C_GraveBattleNotice, this._s2cGraveBattleNotice.bind(this));
        this._msgGraveLeaveBattle = G_NetworkManager.add(MessageIDConst.ID_S2C_GraveLeaveBattle, this._s2cGraveLeaveBattle.bind(this));
        this._msgGraveReward = G_NetworkManager.add(MessageIDConst.ID_S2C_GraveReward, this._s2cGraveReward.bind(this));
        this._signalAllDataReady = G_SignalManager.add(SignalConst.EVENT_RECV_FLUSH_DATA, this._onAllDataReady.bind(this));
    }
    public clear() {
        this._pointMap = {};
        this._lineMap = {};
        this._pointLineMap = {};
        this._teamMap = {};
        this._monsterMap = {};
        this._monumentList = [];
        this._myTeamId = 0;
        this._nextKey = null;
        this._showEffect = false;
        this._msgGraveEnterScene.remove();
        this._msgGraveEnterScene = null;
        this._msgUpdateGrave.remove();
        this._msgUpdateGrave = null;
        this._msgGraveMove.remove();
        this._msgGraveMove = null;
        this._msgGraveBattleNotice.remove();
        this._msgGraveBattleNotice = null;
        this._msgGraveLeaveBattle.remove();
        this._msgGraveLeaveBattle = null;
        this._signalAllDataReady.remove();
        this._signalAllDataReady = null;
        this._msgGraveReward.remove();
        this._msgGraveReward = null;
    }
    public reset() {
        this._nextKey = null;
    }
    public isQinOpen() {
        let qinCfg = G_ConfigLoader.getConfig(ConfigNameConst.QIN_INFO).get(1);
        let openTime = Number(qinCfg.open_time);
        let closeTime = Number(qinCfg.close_time);
        let time = G_ServerTime.getTodaySeconds();
        if (time >= openTime && time <= closeTime) {
            return true;
        }
        // cc.warn(' QinTombData:isQinOpen  =========== false');
        return false;
    }
    public getOpenTime() {
        if (this.isQinOpen()) {
            let qinCfg = G_ConfigLoader.getConfig(ConfigNameConst.QIN_INFO).get(1);
            let openTime = Number(qinCfg.open_time);
            let time = G_ServerTime.getTodaySeconds();
            let leftTime = time - openTime;
            return leftTime + G_ServerTime.getTime();
        }
        return 0;
    }
    public getCloseTime() {
        if (this.isQinOpen()) {
            let qinCfg = G_ConfigLoader.getConfig(ConfigNameConst.QIN_INFO).get(1);
            let closeTime = Number(qinCfg.close_time);
            let time = G_ServerTime.getTodaySeconds();
            let leftTime = closeTime - time;
            return leftTime + G_ServerTime.getTime();
        }
        return 0;
    }
    public c2sGraveEnterScene() {
        if (FunctionCheck.funcIsOpened(FunctionConst.FUNC_MAUSOLEUM)[0]) {
            if (this.isQinOpen() && G_UserData.getGroups().isInActiveScene()) {
                G_NetworkManager.send(MessageIDConst.ID_C2S_GraveEnterScene, {});
            }
        }
    }
    public c2sGraveMove(path, needTime) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GraveMove, {
            path: path,
            need_time: needTime
        });
    }
    public c2sGraveLeaveBattle() {
        // cc.warn('QinTombData:c2sGraveLeaveBattle');
        G_NetworkManager.send(MessageIDConst.ID_C2S_GraveLeaveBattle, {});
    }
    public c2sGraveBattlePoint() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GraveBattlePoint, {});
    }
    public c2sCommonGetReport() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_CommonGetReport, { report_type: 7 });
    }
    public _s2cGraveLeaveBattle(id, message) {
        G_SignalManager.dispatch(SignalConst.EVENT_GRAVE_LEAVE_BATTLE, message);
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
    }
    public _onAllDataReady() {
        if (G_UserData.isFlush()) {
            this.c2sGraveEnterScene();
        }
    }
    public _s2cGraveEnterScene(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let teams = message['teams'] || {};
        this._teamMap = {};
        for (let i in teams) {
            let value = teams[i];
            let key = this._updateTeam(value);
        }
        this._monsterMap = {};
        let mosters = message['mosters'];
        if (mosters) {
            for (let i in mosters) {
                let value = mosters[i];
                this._updateMonster(value);
            }
        }
        this._monumentList = [];
        let monuments = message['monuments'];
        if (monuments) {
            for (let i in monuments) {
                let value = monuments[i];
                this._addMonument(value);
            }
        }
        this._myTeamId = message['my_team_id'];
        G_SignalManager.dispatch(SignalConst.EVENT_GRAVE_ENTER_SCENE);
    }
    public _s2cGraveMove(id, message) {
    }
    public _s2cGraveBattleNotice(id, message) {
        cc.log(message);
        G_SignalManager.dispatch(SignalConst.EVENT_GRAVE_BATTLE_NOTICE, message);
    }
    public _s2cGraveReward(id, message) {
        G_SignalManager.dispatch(SignalConst.EVENT_GRAVE_GETREWARD, message);
    }
    public _s2cUpdateGrave(id, message) {
        // cc.warn('QinTombData:_s2cUpdateGrave');
        let del = message['del'] || 0;
        if (del && del > 0) {
            this._teamCacheList = null;
            this._teamMap[del] = null;
            G_SignalManager.dispatch(SignalConst.EVENT_DELETE_GRAVE, del);
            return;
        }
        let moument = message['add_monument'];
        if (moument) {
            this._updateMonument();
            this._addMonument(moument);
        }
        let monsterId = 0;
        let monster = message['monster'];
        if (monster) {
            monsterId = this._updateMonster(monster);
        }
        let teamId = 0;
        let team = message['team'];
        if (team) {
            teamId = this._updateTeam(team);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_UPDATE_GRAVE, teamId, monsterId);
    }
    public _addMonument(data) {
        let monumentData = {
            point_id: data.point_id,
            member: data.member,
            die_time: data.die_time,
            position: data.position,
            pkPos: {},
            hookPos: {}
        };

        let posArray = {};
        let monster = this.getMonster(monumentData.point_id);
        for (let i = 0; i < monumentData.member.length; i++) {
            let value = monumentData.member[i];
            if (monumentData.position == 1) {
                let pkPos = monster.getMonumentPKPos(i);
                monumentData.pkPos[i] = pkPos;
            } else {
                let hookPos = monster.getMonumentHookPos(i);
                monumentData.hookPos[i] = hookPos;
            }
        }
        this._monumentList.push(monumentData);
    }
    public _updateMonument() {
        let liveTime = QinTombHelper.getQinInfo('tombstone_time');
        let currTime = G_ServerTime.getTime();
        for (let i = 0; i < this._monumentList.length; i++) {
            let value = this._monumentList[i];
            if (currTime > value.die_time + liveTime) {
                this._monumentList.splice(i, 1);
            }
        }
    }
    public _updateMonster(monsterData) {
        let pointId = monsterData.point_id;
        let oldMonster = this._monsterMap[pointId];
        if (oldMonster) {
            let retTable = oldMonster.syncData(monsterData);
            this._monsterMap[oldMonster.getPoint_id()] = oldMonster;
            G_SignalManager.dispatch(SignalConst.EVENT_GRAVE_SYNC_ATTCK_PLAYER, retTable);
            return oldMonster.getPoint_id();
        }
        let monster = new QinTombMonsterData();
        monster.updateData(monsterData);
        this._monsterMap[monster.getPoint_id()] = monster;
        return monster.getPoint_id();
    }
    public getTeamById(teamId) {
        let teamUnit = this._teamMap[teamId];
        if (teamUnit) {
            return teamUnit;
        }
        return null;
    }
    public getMonster(point) {
        let monsterUnit = this._monsterMap[point];
        if (monsterUnit) {
            return monsterUnit;
        }
        return null;
    }
    public getMonsterList() {
        let monsterList = [];
        for (let i in this._monsterMap) {
            let value = this._monsterMap[i];
            monsterList.push(value);
        }
        return monsterList;
    }
    public getTeamListEx() {
        if (this._teamCacheList == null) {
            let teamList = [];
            let selfTeam = this.getSelfTeam();
            if (selfTeam) {
                let selfTeamdId = selfTeam.getTeamId();
                for (let i in this._teamMap) {
                    let value = this._teamMap[i];
                    if (value.getTeamId() != selfTeamdId) {
                        teamList.push(value);
                    }
                }
                teamList.unshift(selfTeam);
            }
            // cc.warn('QinTombData:getTeamListEx');
            this._teamCacheList = teamList;
        }
        return this._teamCacheList;
    }
    public getTeamList() {
        let teamList = [];
        for (let i in this._teamMap) {
            let value = this._teamMap[i];
            teamList.push(value);
        }
        return teamList;
    }
    public getMonumentList(pointKey) {
        this._updateMonument();
        if (pointKey) {
            let retList = [];
            for (let i in this._monumentList) {
                let value = this._monumentList[i];
                if (pointKey == value.point_id) {
                    retList.push(value);
                }
            }
            return retList;
        }
        return this._monumentList;
    }
    public _updateTeam(teamData) {
        let teamId = teamData.team_info.team_id || 0;
        function makeTeam(teamData) {
            let teamId = teamData.team_info.team_id;
            let teamUnit = new QinTombUnitData();
            teamUnit.updateData(teamData);
            return [
                teamId,
                teamUnit
            ];
        }
        let oldTeam = this._teamMap[teamId];
        if (oldTeam == null) {
            this._teamCacheList = null;
        }
        let [key, unit] = makeTeam(teamData);
        this._teamMap[key] = unit;
        if (unit.getBattleMonsterId() > 0) {
            let monsterId = unit.getBattleMonsterId();
            G_SignalManager.dispatch(SignalConst.EVENT_UPDATE_GRAVE, 0, monsterId);
        }
        return key;
    }
    public _decodeNums(str: string): number[] {
        let strArr = str.split('|');
        let nums = [];
        for (let i = 0; i < strArr.length; i++) {
            nums.push(Number(strArr[i]));
        }
        return nums;
    }
    public _makePointTimeKey(pointData) {
        let key1 = pointData.point_id_1 + ('_' + pointData.point_id_2);
        return key1;
    }
    public _makePointKey(pointData) {
        let key = pointData.point_id;
        return key;
    }
    public _buildPointMap() {
        let qin_point = G_ConfigLoader.getConfig(ConfigNameConst.QIN_POINT);
        for (let loop = 0; loop < qin_point.length(); loop++) {
            let pointData = qin_point.indexOf(loop);
            let clickRect = QinTombHelper.getClickRect(pointData.point_id);
            this._pointMap[pointData.point_id] = {
                cfg: pointData,
                index: 1,
                clickRect: clickRect
            };
        }
        let qin_point_time = G_ConfigLoader.getConfig(ConfigNameConst.QIN_POINT_TIME);
        for (let loop = 0; loop < qin_point_time.length(); loop++) {
            let pointData = qin_point_time.indexOf(loop);
            let key = this._makePointTimeKey(pointData);
            this._lineMap[key] = {
                cfg: pointData,
                index: 1
            };
            this._makeLine(pointData);
        }
    }
    public _makeLine(cfgData) {
        let key1 = cfgData.point_id_1;
        let key2 = cfgData.point_id_2;
        let connectlist = this._pointLineMap[key1];
        if (connectlist == null) {
            connectlist = {};
        }
        let pointLineList = this._getMidPointEx(cfgData);
        let pointList = [];
        for (let i in pointLineList) {
            let value = pointLineList[i];
            pointList.push(this._decodeNums(value))
        }
        let curveConfigList = this._makeCureList(pointList);
        let s = 0;
        for (let k in curveConfigList) {
            let curveConfig = curveConfigList[k];
            let len = CurveHelper.bezier3Length(curveConfig);
            s = s + len;
        }
        let linePointData = {
            key: key1 + ('_' + key2),
            line: pointList,
            len: s,
            time: Math.floor(s / this._getMovingSpeed() * 1000)
        };
        connectlist[key2] = linePointData;
        this._pointLineMap[key1] = connectlist;
    }
    public _getMidPointEx(pointCfg): any[] {
        let retList = [];
        for (let i = 1; i <= 5; i++) {
            let mid_point = pointCfg['mid_point_' + i];
            if (mid_point != '' && mid_point != '0') {
                retList.push(mid_point);
            }
        }
        return retList;
    }
    public _makeCureList(pointList: any[]): any[] {
        let curveConfigList = [];
        for (let i = 0; i < pointList.length - 1; i += 1) {
            let curveData = [];
            curveData[0] = cc.v2(pointList[i][0], pointList[i][1]);
            curveData[1] = cc.v2((pointList[i][0] + pointList[i + 1][0]) / 2, (pointList[i][1] + pointList[i + 1][1]) / 2);
            curveData[2] = cc.v2(pointList[i + 1][0], pointList[i + 1][1]);
            curveData[3] = cc.v2(pointList[i + 1][0], pointList[i + 1][1]);
            curveConfigList.push(curveData);
        }
        return curveConfigList;
    }
    public _getMovingSpeed() {
        if (this._movingSpeed == null) {
            let qin_info = G_ConfigLoader.getConfig(ConfigNameConst.QIN_INFO).get(1);
            this._movingSpeed = qin_info.speed;
            return this._movingSpeed;
        }
        return this._movingSpeed;
    }
    public getPointRectList() {
        let retList = [];
        for (let key in this._pointMap) {
            let value = this._pointMap[key];
            if (value.clickRect != null) {
                retList.push(value.clickRect);
            }
        }
        return retList;
    }
    public findPointKey(position) {
        for (let key in this._pointMap) {
            let value = this._pointMap[key];
            if (value.clickRect != null) {
                if (value.clickRect.contains(position)) {
                    return parseInt(key);
                }
            }
        }
        return null;
    }
    public getMovingKeyList(pointKey1, pointKey2): any[] {
        // cc.warn('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
        let testValue = this._breadthFirstSearch(pointKey1, pointKey2);
        let pathTable = [];
        let endKey = pointKey2;
        pathTable[0] = endKey;
        function findPath(startKey) {
            let value = testValue[startKey];
            if (value != null) {
                pathTable.push(testValue[startKey]);
                findPath(value);
            }
        }
        function reverseTable(tab: any[]) {
            // let tmp = [];
            // for (let i = 0; i < tab.length; i++) {
            //     let key = tab.length;
            //     tmp[i] = tab.pop();
            // }
            // return tmp;
            return tab.reverse();
        }
        findPath(endKey);
        let reversePath = reverseTable(pathTable);
        let [returnTable, totalTime] = this.buildPathList(reversePath);
        return [
            reversePath,
            totalTime
        ];
    }
    public changeStartEndPoint(startData, endData, lineList) {
        let [startPoint] = QinTombHelper.getMidPoint(startData.pointId);
        let endPoint = QinTombHelper.getRangePoint(endData.pointId);
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
    public changeToCurveList(lineList) {
        for (let i in lineList) {
            let value = lineList[i];
            value.curveLine = this._makeCureList(value.line);
        }
    }
    public buildPathList(pathTable) {
        let getLine = function (oldPoint, newPoint) {
            let connectlist = this._pointLineMap[oldPoint];
            let linePointData = connectlist[newPoint];
            return linePointData;
        }.bind(this);
        let lineList = [];
        let oldPoint = pathTable[0];
        for (let i = 1; i < pathTable.length; i++) {
            let newPoint = pathTable[i];
            let lineData = getLine(oldPoint, newPoint);
            let linePoint = clone(lineData);
            lineList.push(linePoint);
            oldPoint = newPoint;
        }
        let totalTime = 0;
        for (let i in lineList) {
            let value = lineList[i];
            totalTime = totalTime + value.time;
            value.totalTime = totalTime;
        }
        return [
            lineList,
            totalTime
        ];
    }
    public _breadthFirstSearch(pointKey1, pointKey2) {
        let startKey1 = pointKey1;
        let startKey2 = pointKey2;
        let marked = [];
        marked[startKey1] = true;
        let bfsQueue = [];
        let parent = [];
        bfsQueue.push(startKey1);
        while (bfsQueue.length > 0) {
            let key1 = bfsQueue[0];
            let list = this._pointLineMap[key1];
            for (let key2 in list) {
                let lineData = list[key2];
                if (marked[key2] == null) {
                    marked[key2] = true;
                    bfsQueue.push(parseInt(key2));
                    parent[key2] = key1;
                    if (key2 == startKey2) {
                        return parent;
                    }
                }
            }
            bfsQueue.shift();
        }
        return parent;
    }
    public getTeamData(teamId) {
        let unitObj = this._teamMap[teamId];
        if (unitObj == null) {
            return null;
        }
        return unitObj;
    }
    public getSelfTeamId() {
        return this._myTeamId;
    }
    public getSelfTeam() {
        let selfTeam = this.getTeamById(this.getSelfTeamId());
        return selfTeam;
    }
    public cacheNextKey(nextKey) {
        this._nextKey = nextKey;
    }
    public getCacheNextKey() {
        return this._nextKey;
    }
    public clearCacheNextKey() {
        this._nextKey = null;
    }
    public isShowEffect() {
        return this._showEffect;
    }
    public setShowEffect() {
        this._showEffect = true;
    }
}
