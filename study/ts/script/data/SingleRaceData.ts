import { BaseData } from "./BaseData";
import { G_NetworkManager, G_ConfigLoader, G_UserData, G_SignalManager } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { ArraySort } from "../utils/handler";
import { SingleRaceConst } from "../const/SingleRaceConst";
import { SingleRaceGuessUnitData } from "./SingleRaceGuessUnitData";
import { SingleRaceDataHelper } from "../utils/data/SingleRaceDataHelper";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { SingleRaceUserData } from "./SingleRaceUserData";
import { SingleRaceGuessServerData } from "./SingleRaceGuessServerData";
import { SingleRaceMatchData } from "./SingleRaceMatchData";
import { SingleRaceReportData } from "./SingleRaceReportData";
import { SingleRaceServerRankData } from "./SingleRaceServerRankData";
import { SingleRacePlayerRankData } from "./SingleRacePlayerRankData";
import { clone, clone2, ObjKeyLength } from "../utils/GlobleFunc";
import { SignalConst } from "../const/SignalConst";
import { FunctionConst } from "../const/FunctionConst";

export interface SingleRaceData {
    getNow_round(): number
    setNow_round(value: number): void
    getLastNow_round(): number
    getRound_begin_time(): number
    setRound_begin_time(value: number): void
    getLastRound_begin_time(): number
    getSupport_pos(): number
    setSupport_pos(value: number): void
    getLastSupport_pos(): number
    getSupport_user_id(): number
    setSupport_user_id(value: number): void
    getLastSupport_user_id(): number
    getMy_server_id(): number
    setMy_server_id(value: number): void
    getLastMy_server_id(): number
    getCurWatchPos(): number
    setCurWatchPos(value: number): void
    getLastCurWatchPos(): number
    getStatus(): number
    setStatus(value: number): void
    getLastStatus(): number
}
let schema = {};
schema['now_round'] = [
    'number',
    0
];
schema['round_begin_time'] = [
    'number',
    0
];
schema['support_pos'] = [
    'number',
    0
];
schema['support_user_id'] = [
    'number',
    0
];
schema['my_server_id'] = [
    'number',
    0
];
schema['curWatchPos'] = [
    'number',
    0
];
schema['status'] = [
    'number',
    0
];
export class SingleRaceData extends BaseData {
    public static schema = schema;


        _userDatas;
        _matchDatas;
        _reportDatas;
        _serverRankData;
        _playerRankData;
        _sameServerRankData;
        _userDetailInfo;
        _guessServerData;
        _guessDatas;
        _recvGetSingleRacePkInfo;
        _recvUpdateSingleRacePkInfo;
        _recvSingleRaceChangeEmbattle;
        _recvUpdateSingleRaceEmbattle;
        _recvSingleRaceSupport;
        _recvGetBattleReport;
        _recvGetSingleRacePositionInfo;
        _recvGetSingleRaceStatus;
        _recvSingleRaceAnswerSupport;
        _recvUpdateSingleRaceAnswerSupport;

        _posMap;
        _posMapEx;
    constructor(properties?) {
        super(properties);
        this._userDatas = {};
        this._matchDatas = {};
        this._reportDatas = {};
        this._serverRankData = {};
        this._playerRankData = {};
        this._sameServerRankData = {};
        this._userDetailInfo = {};
        this._guessServerData = {};
        this._guessDatas = {};
        this._formatPosMap();
        this._recvGetSingleRacePkInfo = G_NetworkManager.add(MessageIDConst.ID_S2C_GetSingleRacePkInfo, this._s2cGetSingleRacePkInfo.bind(this));
        this._recvUpdateSingleRacePkInfo = G_NetworkManager.add(MessageIDConst.ID_S2C_UpdateSingleRacePkInfo, this._s2cUpdateSingleRacePkInfo.bind(this));
        this._recvSingleRaceChangeEmbattle = G_NetworkManager.add(MessageIDConst.ID_S2C_SingleRaceChangeEmbattle, this._s2cSingleRaceChangeEmbattle.bind(this));
        this._recvUpdateSingleRaceEmbattle = G_NetworkManager.add(MessageIDConst.ID_S2C_UpdateSingleRaceEmbattle, this._s2cUpdateSingleRaceEmbattle.bind(this));
        this._recvSingleRaceSupport = G_NetworkManager.add(MessageIDConst.ID_S2C_SingleRaceSupport, this._s2cSingleRaceSupport.bind(this));
        this._recvGetBattleReport = G_NetworkManager.add(MessageIDConst.ID_S2C_GetBattleReport, this._s2cGetBattleReport.bind(this));
        this._recvGetSingleRacePositionInfo = G_NetworkManager.add(MessageIDConst.ID_S2C_GetSingleRacePositionInfo, this._s2cGetSingleRacePositionInfo.bind(this));
        this._recvGetSingleRaceStatus = G_NetworkManager.add(MessageIDConst.ID_S2C_GetSingleRaceStatus, this._s2cGetSingleRaceStatus.bind(this));
        this._recvSingleRaceAnswerSupport = G_NetworkManager.add(MessageIDConst.ID_S2C_SingleRaceAnswerSupport, this._s2cSingleRaceAnswerSupport.bind(this));
        this._recvUpdateSingleRaceAnswerSupport = G_NetworkManager.add(MessageIDConst.ID_S2C_UpdateSingleRaceAnswerSupport, this._s2cUpdateSingleRaceAnswerSupport.bind(this));
    }
    public clear() {
        this._recvGetSingleRacePkInfo.remove();
        this._recvGetSingleRacePkInfo = null;
        this._recvUpdateSingleRacePkInfo.remove();
        this._recvUpdateSingleRacePkInfo = null;
        this._recvSingleRaceChangeEmbattle.remove();
        this._recvSingleRaceChangeEmbattle = null;
        this._recvUpdateSingleRaceEmbattle.remove();
        this._recvUpdateSingleRaceEmbattle = null;
        this._recvSingleRaceSupport.remove();
        this._recvSingleRaceSupport = null;
        this._recvGetBattleReport.remove();
        this._recvGetBattleReport = null;
        this._recvGetSingleRacePositionInfo.remove();
        this._recvGetSingleRacePositionInfo = null;
        this._recvGetSingleRaceStatus.remove();
        this._recvGetSingleRaceStatus = null;
        this._recvSingleRaceAnswerSupport.remove();
        this._recvSingleRaceAnswerSupport = null;
        this._recvUpdateSingleRaceAnswerSupport.remove();
        this._recvUpdateSingleRaceAnswerSupport = null;
    }
    public reset() {
        this._userDatas = {};
        this._matchDatas = {};
        this._reportDatas = {};
        this._serverRankData = {};
        this._playerRankData = {};
        this._sameServerRankData = {};
        this._userDetailInfo = {};
        this._guessServerData = {};
        this._guessDatas = {};
    }
    public _formatPosMap() {
        this._posMap = {};
        this._posMapEx = {};
        let config = G_ConfigLoader.getConfig(ConfigNameConst.SINGLE_SCHEDULE);
        let len = config.length();
        for (let i = 0; i < len; i++) {
            let info = config.indexOf(i);
            let nextPos = info.nxet_position;
            if (nextPos > 0) {
                if (this._posMap[nextPos] == null) {
                    this._posMap[nextPos] = [];
                }
                this._posMap[nextPos].push(info.top32);
            }
        }
        for (let pos in this._posMap) {
            let info = this._posMap[pos];
            let index1 = info[0];
            let index2 = info[1];
            console.assert(index1 && index2, 'SingleRaceData:_formatPosMap is wrong. pos = %d');
            this._posMapEx[index1 + ('_' + index2)] = pos;
        }
    }
    public getPreIndexOfPosition(position) {
        let result = this._posMap[position];
        console.assert(result, 'SingleRaceData:getPreIndexOfPosition is wrong! position = %d');
        return result;
    }
    public getNextIndexOfPosition(position) {
        let key = '';
        if (position % 2 == 0) {
            key = position - 1 + ('_' + position);
        } else {
            key = position + ('_' + (position + 1));
        }
        let nextIndex = this._posMapEx[key] || 0;
        return nextIndex;
    }
    public getUserDataWithId(userId) {
        let userData = this._userDatas[userId];
        return userData;
    }
    public getMatchDataWithPosition(position) {
        let matchData = this._matchDatas[position];
        return matchData;
    }
    public getPosWithUserIdForGuess(userId) {
        for (let pos = 1; pos <= 32; pos++) {
            let matchData = this.getMatchDataWithPosition(pos);
            if (matchData.getUser_id() == userId) {
                return pos;
            }
        }
        return 0;
    }
    public getUserDataWithPosition(position) {
        let matchData = this.getMatchDataWithPosition(position);
        if (matchData) {
            let userId = matchData.getUser_id();
            let userData = this.getUserDataWithId(userId);
            return userData;
        }
        return null;
    }
    public getReportData(position) {
        return this._reportDatas[position];
    }
    public getReportUnitData(position, battleNo) {
        let reportDatas = this.getReportData(position);
        if (reportDatas == null) {
            return null;
        }
        return reportDatas[battleNo];
    }
    public getServerRankDataWithId(serverId) {
        return this._serverRankData[serverId];
    }
    public getPlayerRankDataWithId(userId) {
        return this._playerRankData[userId];
    }
    public getSameServerRankDataWithId(userId) {
        return this._sameServerRankData[userId];
    }
    public getUserDetailInfoWithId(userId) {
        return this._userDetailInfo[userId];
    }
    public getServerRankList() {
        let sortFunc = function (a, b) {
            return a.getRank() < b.getRank();
        };
        let result = [];
        for (let serverId in this._serverRankData) {
            let data = this._serverRankData[serverId];
            result.push(data);
        }
        ArraySort(result, sortFunc);
        return result;
    }
    public getPlayerRankList() {
        let sortFunc = function (a, b) {
            return a.getRank() < b.getRank();
        };
        let result = [];
        for (let userId in this._playerRankData) {
            let data = this._playerRankData[userId];
            result.push(data);
        }
        ArraySort(result, sortFunc);
        return result;
    }
    public getSameServerRankList() {
        let sortFunc = function (a, b) {
            return a.getRank() < b.getRank();
        };
        let result = [];
        for (let userId in this._sameServerRankData) {
            let data = this._sameServerRankData[userId];
            result.push(data);
        }
        ArraySort(result, sortFunc);
        return result;
    }
    public getWinNumWithPosition(position) {
        let reportDatas = this.getReportData(position);
        let [winNum1, winNum2] = this.getWinNumWithReportData(reportDatas);
        return [
            winNum1,
            winNum2
        ];
    }
    public getWinNumWithReportData(reportDatas) {
        let winNum1 = 0;
        let winNum2 = 0;
        if (reportDatas) {
            for (let battleNo in reportDatas) {
                let reportData = reportDatas[battleNo];
                let winnerSide = reportData.getWinnerSide();
                if (winnerSide == SingleRaceConst.REPORT_SIDE_1) {
                    winNum1 = winNum1 + 1;
                } else if (winnerSide == SingleRaceConst.REPORT_SIDE_2) {
                    winNum2 = winNum2 + 1;
                }
            }
        }
        return [
            winNum1,
            winNum2
        ];
    }
    public getResultStateWithPosition(position) {
        let reportPos = this.getNextIndexOfPosition(position);
        let [ winNum1, winNum2 ] = this.getWinNumWithPosition(reportPos);
        let side = 0;
        if (position % 2 == 1) {
            side = SingleRaceConst.REPORT_SIDE_1;
        } else {
            side = SingleRaceConst.REPORT_SIDE_2;
        }
        if (winNum1 == SingleRaceConst.MAX_WIN_COUNT) {
            if (side == SingleRaceConst.REPORT_SIDE_1) {
                return SingleRaceConst.RESULT_STATE_WIN;
            } else if (side == SingleRaceConst.REPORT_SIDE_2) {
                return SingleRaceConst.RESULT_STATE_LOSE;
            }
        } else if (winNum2 == SingleRaceConst.MAX_WIN_COUNT) {
            if (side == SingleRaceConst.REPORT_SIDE_1) {
                return SingleRaceConst.RESULT_STATE_LOSE;
            } else if (side == SingleRaceConst.REPORT_SIDE_2) {
                return SingleRaceConst.RESULT_STATE_WIN;
            }
        } else if (winNum1 > 0 || winNum2 > 0) {
            return SingleRaceConst.RESULT_STATE_ING;
        } else {
            return SingleRaceConst.RESULT_STATE_NONE;
        }
    }
    public isMatchEndWithPosition(position) {
        let [ winNum1, winNum2 ] = this.getWinNumWithPosition(position);
        if (winNum1 == SingleRaceConst.MAX_WIN_COUNT || winNum2 == SingleRaceConst.MAX_WIN_COUNT) {
            return true;
        } else {
            return false;
        }
    }
    public getReportStateWithPosition(position) {
        let nowRound = this.getNow_round();
        let round = SingleRaceConst.getRoundWithPosition(position);
        if (round > nowRound) {
            return SingleRaceConst.MATCH_STATE_BEFORE;
        } else if (round == nowRound) {
            return SingleRaceConst.MATCH_STATE_ING;
        } else if (round < nowRound) {
            return SingleRaceConst.MATCH_STATE_AFTER;
        }
    }
    public isSelfEliminated() {
        let selfId = G_UserData.getBase().getId();
        let nowRound = this.getNow_round();
        cc.log('SingleRaceData:isSelfEliminated()', nowRound);
        let region = SingleRaceConst.getPositionRegionWithRound(nowRound);
        for (let pos = region[0]; pos <= region[1]; pos++) {
            let userData = this.getUserDataWithPosition(pos);
            if (userData) {
                let userId = userData.getUser_id();
                if (userId == selfId) {
                    return false;
                }
            }
        }
        return true;
    }
    public getCurFocusPos() {
        let findPosWithRound = function(roundStart, roundEnd) {
            let selfId = G_UserData.getBase().getId();
            let myServerId = this.getMy_server_id();
            let selfPos = 0;
            let players = [];
            for (let i = roundStart; i >= roundEnd; i += -1) {
                let region = SingleRaceConst.getPositionRegionWithRound(i);
                for (let pos = region[0]; pos <= region[1]; pos++) {
                    let userData = this.getUserDataWithPosition(pos);
                    if (userData) {
                        if (userData.getUser_id() == selfId) {
                            selfPos = pos;
                        } else if (userData.getServer_id() == myServerId) {
                            players.push({
                                user: userData,
                                pos: pos
                            });
                        }
                    }
                }
            }
            if (selfPos > 0) {
                return selfPos;
            } else {
                ArraySort(players, function (a, b) {
                    return a.user.getPower() > b.user.getPower();
                });
                let player = players[0];
                if (player) {
                    return player.pos;
                }
            }
            return 0;
        }.bind(this);
        let status = this.getStatus();
        if (status == SingleRaceConst.RACE_STATE_FINISH) {
            return 63;
        }
        let nowRound = this.getNow_round();
        let pos1 = findPosWithRound(6, nowRound);
        if (pos1 > 0) {
            return pos1;
        }
        let pos2 = findPosWithRound(nowRound, 1);
        if (pos2 > 0) {
            return pos2;
        }
        return 0;
    }
    public getSelfFinalPos() {
        let selfId = G_UserData.getBase().getId();
        for (let i = 6; i >= 1; i += -1) {
            let region = SingleRaceConst.getPositionRegionWithRound(i);
            for (let pos = region[0]; pos <= region[1]; pos++) {
                let userData = this.getUserDataWithPosition(pos);
                if (userData) {
                    let userId = userData.getUser_id();
                    if (userId == selfId) {
                        return pos;
                    }
                }
            }
        }
        return 0;
    }
    public getSameServerPlayerFinalPos() {
        let result = {};
        let myServerId = this.getMy_server_id();
        for (let i = 6; i >= 1; i += -1) {
            let region = SingleRaceConst.getPositionRegionWithRound(i);
            for (let pos = region[0]; pos <= region[1]; pos++) {
                let userData = this.getUserDataWithPosition(pos);
                if (userData) {
                    let userId = userData.getUser_id();
                    let userServerId = userData.getServer_id();
                    if (result[userId] == null && myServerId == userServerId) {
                        result[userId] = pos;
                    }
                }
            }
        }
        return result;
    }
    public findSelfRacePos() {
        let selfId = G_UserData.getBase().getId();
        let nowRound = this.getNow_round();
        let region = SingleRaceConst.getPositionRegionWithRound(nowRound);
        for (let pos = region[0]; pos <= region[1]; pos++) {
            let userData = this.getUserDataWithPosition(pos);
            if (userData) {
                let userId = userData.getUser_id();
                if (userId == selfId) {
                    let racePos = this.getNextIndexOfPosition(pos);
                    return racePos;
                }
            }
        }
        return 0;
    }
    public getCurMatchIndexByPos(pos) {
        let matchIndex = 0;
        let reports = this.getReportData(pos) || {};
        let num = ObjKeyLength(reports) + 1;
        let maxWinNum = SingleRaceConst.getWinMaxNum();
        let maxNum = maxWinNum * 2 - 1;
        if (num >= 1 && num <= maxNum) {
            matchIndex = num;
        }
        if (matchIndex == 0) {
            cc.warn('SingleRaceData:getCurMatchIndexByPos()--- pos = %d'.format(pos));
        }
        return matchIndex;
    }
    public getFirstHandIndex(pos) {
        let state = this.getReportStateWithPosition(pos);
        let firstHandIndex = 0;
        let matchIndex = this.getCurMatchIndexByPos(pos);
        let preIndex = this.getPreIndexOfPosition(pos);
        let index1 = preIndex[0];
        let index2 = preIndex[1];
        let userData1 = this.getUserDataWithPosition(index1);
        let userData2 = this.getUserDataWithPosition(index2);
        if (userData1 && userData2) {
            let power1 = userData1.getPower();
            let power2 = userData2.getPower();
            let maxPowerIndex = 0;
            let minPowerIndex = 0;
            if (power1 >= power2) {
                maxPowerIndex = index1;
                minPowerIndex = index2;
            } else {
                maxPowerIndex = index2;
                minPowerIndex = index1;
            }
            if (matchIndex % 2 == 1) {
                firstHandIndex = maxPowerIndex;
            } else {
                firstHandIndex = minPowerIndex;
            }
        }
        return firstHandIndex;
    }
    public isDidSupport() {
        let supportPos = this.getSupport_pos();
        let supportUserId = this.getSupport_user_id();
        if (supportPos > 0 && supportUserId > 0) {
            return true;
        } else {
            return false;
        }
    }
    public getGuessPlayerList() {
        let result = [];
        for (let userId in this._userDatas) {
            let user = this._userDatas[userId];
            result.push(user);
        }
        ArraySort(result, function (a, b) {
            return a.getPower() > b.getPower();
        });
        return result;
    }
    public getGuessServerList(isAscending) {
        let result = [];
        for (let serverId in this._guessServerData) {
            let data = this._guessServerData[serverId];
            result.push(data);
        }
        if (isAscending) {
            ArraySort(result, function (a, b) {
                return a.getPower() > b.getPower();
            });
        } else {
            ArraySort(result, function (a, b) {
                return a.getPower() < b.getPower();
            });
        }
        return result;
    }
    public isCanGuess() {
        let status = this.getStatus();
        return status == SingleRaceConst.RACE_STATE_PRE;
    }
    public _initGuessData() {
        this._guessDatas = {};
        for (let id = SingleRaceConst.GUESS_TAB_TYPE_1; id <= SingleRaceConst.GUESS_TAB_TYPE_3; id++) {
            let unitData = new SingleRaceGuessUnitData();
            unitData.setAnswer_id(id);
            this._guessDatas[id] = unitData;
        }
    }
    public getGuessUnitDataWithId(id) {
        return this._guessDatas[id];
    }
    public hasRedPointOfGuessWithType(type) {
        let [r] = SingleRaceDataHelper.isInGuessTime();
        if (r == false || this.isCanGuess() == false) {
            return false;
        }
        let unit = this.getGuessUnitDataWithId(type);
        if (unit == null) {
            return false;
        }
        if (unit.isVoted()) {
            return false;
        }
        return true;
    }
    public hasRedPoint() {
        let result = false;
        for (let type = SingleRaceConst.GUESS_TAB_TYPE_1; type <= SingleRaceConst.GUESS_TAB_TYPE_3; type++) {
            let has = this.hasRedPointOfGuessWithType(type);
            result = result || has;
        }
        return result;
    }
    public c2sGetSingleRacePkInfo() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetSingleRacePkInfo, {});
    }
    public _s2cGetSingleRacePkInfo(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let users = message['users'] || {};
        let pkInfos = message['pk_infos'] || {};
        let nowRound = message['now_round'] || 0;
        let roundBeginTime = message['round_begin_time'] || 0;
        let supportPos = message['support_pos'] || 0;
        let supportUserId = message['support_user_id'] || 0;
        let serverRanks = message['server_rank'] || {};
        let myServerId = message['my_server_id'] || 0;
        let playerRanks = message['player_rank'] || {};
        let answerSupport = message['answer_support'] || {};
        this._userDatas = {};
        this._matchDatas = {};
        this._reportDatas = {};
        this._serverRankData = {};
        this._playerRankData = {};
        this._sameServerRankData = {};
        this._guessServerData = {};
        this._initGuessData();
        for (let i in users) {
            let user = users[i];
            let userData = new SingleRaceUserData();
            userData.updateData(user);
            let userId = userData.getUser_id();
            this._userDatas[userId] = userData;
            let serverId = userData.getServer_id();
            if (this._guessServerData[serverId] == null) {
                this._guessServerData[serverId] = new SingleRaceGuessServerData();
                this._guessServerData[serverId].initData(userData);
            }
            this._guessServerData[serverId].insertUser(userData);
        }
        for (let i in pkInfos) {
            let pkInfo = pkInfos[i];
            let match = pkInfo['position_info'];
            let matchData = new SingleRaceMatchData();
            matchData.updateData(match);
            let position = matchData.getPosition();
            this._matchDatas[position] = matchData;
            let reports = pkInfo['reports'] || {};
            for (let i in reports) {
                let report = reports[i];
                let reportData = new SingleRaceReportData();
                reportData.updateData(report);
                let pos = reportData.getPosition();
                if (this._reportDatas[pos] == null) {
                    this._reportDatas[pos] = {};
                }
                let battleNo = reportData.getBattle_no();
                this._reportDatas[pos][battleNo] = reportData;
            }
        }
        for (let i in serverRanks) {
            let serverRank = serverRanks[i];
            let rankData = new SingleRaceServerRankData();
            rankData.type = SingleRaceConst.RANK_DATA_TYPE_1;
            rankData.updateData(serverRank);
            let serverId = rankData.getServer_id();
            this._serverRankData[serverId] = rankData;
        }
        for (let i in playerRanks) {
            let playerRank = playerRanks[i];
            let rankData = new SingleRacePlayerRankData();
            rankData.type = SingleRaceConst.RANK_DATA_TYPE_2;
            rankData.updateData(playerRank);
            let userId = rankData.getUser_id();
            let serverId = rankData.getServer_id();
            this._playerRankData[userId] = rankData;
            if (serverId == myServerId) {
                let tempData = clone2(rankData);
                tempData.type = SingleRaceConst.RANK_DATA_TYPE_3;
                this._sameServerRankData[userId] = tempData;
            }
        }
        for (let i in answerSupport) {
            let support = answerSupport[i];
            let id = support['answer_id'];
            let unitData = this.getGuessUnitDataWithId(id);
            unitData.updateData(support);
        }
        this.setNow_round(nowRound);
        this.setRound_begin_time(roundBeginTime);
        this.setSupport_pos(supportPos);
        this.setSupport_user_id(supportUserId);
        this.setMy_server_id(myServerId);
        G_SignalManager.dispatch(SignalConst.EVENT_SINGLE_RACE_GET_PK_INFO_SUCCESS);
    }
    public _s2cUpdateSingleRacePkInfo(id, message) {
        let pkInfos = message['pk_infos'] || {};
        let reports = message['reports'] || {};
        let nowRound = message['now_round'] || 0;
        let roundBeginTime = message['round_begin_time'] || 0;
        let serverRanks = message['server_rank'] || {};
        let playerRanks = message['player_rank'] || {};
        for (let i in pkInfos) {
            let match = pkInfos[i];
            let position = match['position'] || 0;
            let matchData = this.getMatchDataWithPosition(position);
            if (matchData == null) {
                matchData = new SingleRaceMatchData();
                this._matchDatas[position] = matchData;
            }
            matchData.updateData(match);
        }
        for (let i in reports) {
            let report = reports[i];
            let position = report['position'] || 0;
            let battleNo = report['battle_no'] || 0;
            let reportData = this.getReportUnitData(position, battleNo);
            if (reportData == null) {
                reportData = new SingleRaceReportData();
                if (this._reportDatas[position] == null) {
                    this._reportDatas[position] = {};
                }
                this._reportDatas[position][battleNo] = reportData;
            }
            reportData.updateData(report);
        }
        for (let i in serverRanks) {
            let serverRank = serverRanks[i];
            let serverId = serverRank['server_id'] || 0;
            let rankData = this.getServerRankDataWithId(serverId);
            if (rankData == null) {
                rankData = new SingleRaceServerRankData();
                rankData.type = SingleRaceConst.RANK_DATA_TYPE_1;
                this._serverRankData[serverId] = rankData;
            }
            rankData.updateData(serverRank);
        }
        let myServerId = this.getMy_server_id();
        for (let i in playerRanks) {
            let playerRank = playerRanks[i];
            let userId = playerRank['user_id'] || 0;
            let serverId = playerRank['server_id'] || 0;
            let rankData = this.getPlayerRankDataWithId(userId);
            if (rankData == null) {
                rankData = new SingleRacePlayerRankData();
                rankData.type = SingleRaceConst.RANK_DATA_TYPE_2;
                this._playerRankData[userId] = rankData;
            }
            rankData.updateData(playerRank);
            if (serverId == myServerId) {
                // to do
                let tempData = clone2(rankData);
                tempData.type = SingleRaceConst.RANK_DATA_TYPE_3;
                this._sameServerRankData[userId] = tempData;
            }
        }
        let lastRound = this.getNow_round();
        let isChangeRound = lastRound != nowRound;
        this.setNow_round(nowRound);
        this.setRound_begin_time(roundBeginTime);
        if (isChangeRound) {
            this.setSupport_pos(0);
            this.setSupport_user_id(0);
            let curPos = this.getCurWatchPos();
            let nextPos = this.getNextIndexOfPosition(curPos);
            if (nextPos > 0) {
                this.setCurWatchPos(nextPos);
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_SINGLE_RACE_UPDATE_PK_INFO_SUCCESS, pkInfos, reports, isChangeRound);
    }
    public c2sSingleRaceChangeEmbattle(userId, positions) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_SingleRaceChangeEmbattle, {
            user_id: userId,
            positions: positions
        });
    }
    public _s2cSingleRaceChangeEmbattle(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_SINGLE_RACE_CHANGE_EMBATTLE_SUCCESS);
    }
    public _s2cUpdateSingleRaceEmbattle(id, message) {
        let user = message['user'] || {};
        let userId = user['user_id'] || 0;
        let userData = this.getUserDataWithId(userId);
        if (userData == null) {
            userData = new SingleRaceUserData();
            this._userDatas[userId] = userData;
        }
        userData.updateData(user);
        G_SignalManager.dispatch(SignalConst.EVENT_SINGLE_RACE_EMBATTlE_UPDATE, userData);
    }
    public c2sSingleRaceSupport(pos, userId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_SingleRaceSupport, {
            pos: pos,
            userId: userId
        });
    }
    public _s2cSingleRaceSupport(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let pos = message['pos'] || 0;
        let userId = message['userId'] || 0;
        this.setSupport_pos(pos);
        this.setSupport_user_id(userId);
        G_SignalManager.dispatch(SignalConst.EVENT_SINGLE_RACE_SUPPORT_SUCCESS);
    }
    public c2sGetBattleReport(reportId) {
        cc.warn('SingleRaceData:c2sGetBattleReport. reportId = %d'.format(reportId));
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetBattleReport, { id: reportId });
    }
    public _s2cGetBattleReport(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        id = message['id'] || 0;
        let battleReport = message['battle_report'];
        G_SignalManager.dispatch(SignalConst.EVENT_SINGLE_RACE_GET_REPORT, battleReport, id);
    }
    public c2sGetSingleRacePositionInfo(position) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetSingleRacePositionInfo, { pos: position });
    }
    public _s2cGetSingleRacePositionInfo(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let user = message['user'];
        let userDetail = message['detail_user'];
        let userId = user['user_id'];
        let userData = this.getUserDataWithId(userId);
        if (userData == null) {
            userData = new SingleRaceUserData();
            userData.updateData(user);
            this._userDatas[userId] = userData;
        }
        this._userDetailInfo[userId] = userDetail;
        G_SignalManager.dispatch(SignalConst.EVENT_SINGLE_RACE_GET_POSITION_INFO, userData, userDetail);
    }
    public _s2cGetSingleRaceStatus(id, message) {
        let status = message['status'];
        let lastStatus = this.getStatus();
        this.setStatus(status);
        if (status != lastStatus) {
            if (status == SingleRaceConst.RACE_STATE_NONE) {
                this._userDetailInfo = {};
            }
            G_SignalManager.dispatch(SignalConst.EVENT_SINGLE_RACE_STATUS_CHANGE, status);
            G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_SINGLE_RACE);
        }
    }
    public c2sSingleRaceAnswerSupport(answerId, supportId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_SingleRaceAnswerSupport, {
            answer_id: answerId,
            support_id: supportId
        });
    }
    public _s2cSingleRaceAnswerSupport(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let answerId = message['answer_id'];
        let supportId = message['support_id'];
        let unitData = this.getGuessUnitDataWithId(answerId);
        unitData.setMy_support(supportId);
        G_SignalManager.dispatch(SignalConst.EVENT_SINGLE_RACE_GUESS_SUCCESS, answerId, supportId);
    }
    public _s2cUpdateSingleRaceAnswerSupport(id, message) {
        let answerId = message['answer_id'];
        let support = message['support_info'];
        let supportId = support['support_id'];
        let supportNum = support['support_num'];
        let unitData = this.getGuessUnitDataWithId(answerId);
        if (unitData) {
            unitData.updateSupport(support);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_SINGLE_RACE_GUESS_UPDATE, answerId, supportId, supportNum);
    }
}
