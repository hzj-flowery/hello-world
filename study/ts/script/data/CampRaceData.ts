import { BaseData } from './BaseData';
import { G_NetworkManager, G_UserData, G_SignalManager } from '../init';
import { MessageIDConst } from '../const/MessageIDConst';
import { MessageErrorConst } from '../const/MessageErrorConst';
import { SignalConst } from '../const/SignalConst';
import { CampRacePreRankData } from './CampRacePreRankData';
import { CampRaceReportData } from './CampRaceReportData';
import { CampRaceConst } from '../const/CampRaceConst';
import { CampRaceUserData } from './CampRaceUserData';
import { CampRaceFormationData } from './CampRaceFormationData';
import { CampRaceStateData } from './CampRaceStateData';
import { CampRaceHelper } from '../scene/view/campRace/CampRaceHelper';
import { FunctionConst } from '../const/FunctionConst';
let schema = {};
schema['camp'] = [
    'number',
    0
];

schema['status'] = [
    'number',
    0
];

schema['champion'] = [
    'object',
    {}
];

schema['curWatchUserId'] = [
    'number',
    0
];

schema['selfWinChampion'] = [
    'boolean',
    false
];

export interface CampRaceData {
    getCamp(): number
    setCamp(value: number): void
    getLastCamp(): number
    getStatus(): number
    setStatus(value: number): void
    getLastStatus(): number
    getChampion(): Object
    setChampion(value: Object): void
    getLastChampion(): Object
    getCurWatchUserId(): number
    setCurWatchUserId(value: number): void
    getLastCurWatchUserId(): number
    isSelfWinChampion(): boolean
    setSelfWinChampion(value: boolean): void
    isLastSelfWinChampion(): boolean

}
export class CampRaceData extends BaseData {
    public _reports;
    public _preRankList;
    public _lastRaceUserIds;
    public _curStatus;
    public _lastUsers;
    public _curMatchDatas;
    public _leftPlayer;
    public _rightPlayer;
    public _betData;
    public _listenerSignUp;
    public _ListenerGetInfo;
    public _listenerGetRank;
    public _listenerGetLastRank;
    public _listenerGetFormation;
    public _listenerUpdateFormation;
    public _listenerAddCampRaceReport;
    public _listenerGetBattleReport;
    public _listenerUpdateCampRace;
    public _listenerCampRaceBet;
    public _listenerUpdateBet;
    public _listenerGetCampRaceChampion;
    public _listenerCampRaceBattleResult;

    public static schema = schema;
    public static ROUND = [
        [
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8
        ],
        [
            9,
            10,
            11,
            12
        ],
        [
            13,
            14
        ],
        [15]
    ];
    constructor(properties?) {
        super(properties)
        this._reports = {};
        this._preRankList = {};
        this._lastRaceUserIds = {};
        this._curStatus = {};
        this._lastUsers = {};
        this._curMatchDatas = {};
        this._leftPlayer = null;
        this._rightPlayer = null;
        this._betData = {};
        this._listenerSignUp = G_NetworkManager.add(MessageIDConst.ID_S2C_CampRaceSignUp, this._s2cCampRaceSignUp.bind(this));
        this._ListenerGetInfo = G_NetworkManager.add(MessageIDConst.ID_S2C_GetCampRaceBaseInfo, this._s2cGetCampRaceBaseInfo.bind(this));
        this._listenerGetRank = G_NetworkManager.add(MessageIDConst.ID_S2C_GetCampRaceRank, this._s2cGetCampRaceRank.bind(this));
        this._listenerGetLastRank = G_NetworkManager.add(MessageIDConst.ID_S2C_GetCampRaceLastRank, this._s2cGetCampRaceLastRank.bind(this));
        this._listenerGetFormation = G_NetworkManager.add(MessageIDConst.ID_S2C_GetCampRaceFormation, this._s2cGetCampRaceFormation.bind(this));
        this._listenerUpdateFormation = G_NetworkManager.add(MessageIDConst.ID_S2C_UpdateCampRaceFormation, this._s2cUpdateCampRaceFormation.bind(this));
        this._listenerAddCampRaceReport = G_NetworkManager.add(MessageIDConst.ID_S2C_AddCampRaceBattleReport, this._s2cAddRaceBattleReport.bind(this));
        this._listenerGetBattleReport = G_NetworkManager.add(MessageIDConst.ID_S2C_GetBattleReport, this._s2cGetBattleReport.bind(this));
        this._listenerUpdateCampRace = G_NetworkManager.add(MessageIDConst.ID_S2C_UpdateCampRace, this._s2cUpdateCampRace.bind(this));
        this._listenerCampRaceBet = G_NetworkManager.add(MessageIDConst.ID_S2C_CampRaceBet, this._s2cCampRaceBet.bind(this));
        this._listenerUpdateBet = G_NetworkManager.add(MessageIDConst.ID_S2C_UpdateCampRaceBet, this._s2cUpdateCampRaceBet.bind(this));
        this._listenerGetCampRaceChampion = G_NetworkManager.add(MessageIDConst.ID_S2C_GetCampRaceChampion, this._s2cGetCampRaceChampion.bind(this));
        this._listenerCampRaceBattleResult = G_NetworkManager.add(MessageIDConst.ID_S2C_CampRaceBattleResult, this._s2cCampRaceBattleResult.bind(this));
    }
    public clear() {
        this._listenerSignUp.remove();
        this._listenerSignUp = null;
        this._ListenerGetInfo.remove();
        this._ListenerGetInfo = null;
        this._listenerGetRank.remove();
        this._listenerGetRank = null;
        this._listenerGetLastRank.remove();
        this._listenerGetLastRank = null;
        this._listenerGetFormation.remove();
        this._listenerGetFormation = null;
        this._listenerUpdateFormation.remove();
        this._listenerUpdateFormation = null;
        this._listenerAddCampRaceReport.remove();
        this._listenerAddCampRaceReport = null;
        this._listenerGetBattleReport.remove();
        this._listenerGetBattleReport = null;
        this._listenerUpdateCampRace.remove();
        this._listenerUpdateCampRace = null;
        this._listenerCampRaceBet.remove();
        this._listenerCampRaceBet = null;
        this._listenerUpdateBet.remove();
        this._listenerUpdateBet = null;
        this._listenerGetCampRaceChampion.remove();
        this._listenerGetCampRaceChampion = null;
        this._listenerCampRaceBattleResult.remove();
        this._listenerCampRaceBattleResult = null;
    }
    public getMyCamp() {
        let myCamp = this.getCamp();
        if (myCamp == 0) {
            myCamp = G_UserData.getBase().getCamp();
        }
        return myCamp;
    }
    public c2sCampRaceSignUp() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_CampRaceSignUp, {});
    }
    public _s2cCampRaceSignUp(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_CAMP_SIGN_UP);
    }
    public c2sGetCampRaceBaseInfo() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetCampRaceBaseInfo, {});
    }
    public _s2cGetCampRaceBaseInfo(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let camp = message['camp'] || 0;
        let status = message['status'] || 0;
        this.setCamp(camp);
        this.setStatus(status);
        G_SignalManager.dispatch(SignalConst.EVENT_GET_CAMP_BASE_INFO);
    }
    public c2sGetCampRaceRank(campList) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetCampRaceRank, { camp: campList });
    }
    public _s2cGetCampRaceRank(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let ranks = message['ranks'] || {};
        for (let i in ranks) {
            let rank = ranks[i];
            let preRankData = new CampRacePreRankData(rank);
            let camp = preRankData.getCamp();
            this._preRankList[camp] = this._preRankList[camp] || preRankData;
            this._preRankList[camp].updateData(rank);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GET_CAMP_RACE_RANK);
    }
    public c2sGetCampRaceLastRank(camp) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetCampRaceLastRank, { camp: camp });
    }
    public _s2cGetCampRaceLastRank(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let camp = message['camp'] || 0;
        let status = message['status'] || 0;
        let lastRaceIds = message['last_race_ids'] || [];
        let userDatas = message['user_data'] || {};
        let battleReports = message['battle_report'] || {};
        this._curStatus[camp] = this.getCurStatusWithCamp(camp);
        this._curStatus[camp].setFinal_status(status);
        this._lastRaceUserIds[camp] = lastRaceIds;
        this._lastUsers = {};
        for (let _ in userDatas) {
            let data = userDatas[_];
            this._updateUserData(data);
        }
        this._reports = {};
        this._updateReportData(battleReports);
        G_SignalManager.dispatch(SignalConst.EVENT_GET_LAST_RANK, camp);
        console.log('get last rank;  camp-- : ', camp);
    }
    public _updateReportData(datas) {
        for (let i in datas) {
            let data = datas[i];
            let report = new CampRaceReportData(data);
            let camp = report.getCamp();
            let pos1 = report.getPos1();
            let pos2 = report.getPos2();
            let posKey = String(pos1) + ('_' + String(pos2));
            let id = report.getId();
            if (this._reports[camp] == null) {
                this._reports[camp] = {};
            }
            if (this._reports[camp][posKey] == null) {
                this._reports[camp][posKey] = {};
            }
            this._reports[camp][posKey][id] = report;
        }
    }
    public getUserIdsWithCamp(camp) {
        let userIds = this._lastRaceUserIds[camp] || [];
        return userIds;
    }
    public getUserIdsCount(camp) {
        let count = 0;
        let userIds = this.getUserIdsWithCamp(camp);
        for (let i in userIds) {
            let userId = userIds[i];
            if (userId > 0) {
                count = count + 1;
            }
        }
        return count;
    }
    public getCampWithUserId(userId) {
        for (let camp in this._lastRaceUserIds) {
            let userIds = this._lastRaceUserIds[camp];
            for (let i in userIds) {
                let id = userIds[i];
                if (id == userId) {
                    return parseFloat(camp);
                }
            }
        }
        return 0;
    }
    public isMatching(camp?, userId?) {
        let status = this.getStatus();
        if (status != CampRaceConst.STATE_PLAY_OFF) {
            return false;
        }
        camp = camp || this.getMyCamp();
        let round = this.getFinalStatusByCamp(camp);
        if (round == CampRaceConst.PLAY_OFF_ROUND_ALL) {
            return false;
        }
        let tbPos = CampRaceData.ROUND[round -1];
        if (tbPos == null) {
            return false;
        }
        userId = userId || G_UserData.getBase().getId();
        let userIds = this.getUserIdsWithCamp(camp);
        for (let i in tbPos) {
            let pos = tbPos[i];
            if (userId == userIds[pos -1]) {
                return true;
            }
        }
        return false;
    }
    public getUserByPos(camp, pos) {
        let userIds = this.getUserIdsWithCamp(camp);
        let userId = userIds[pos-1];
        let userData = this._getUserData(userId);
        return userData;
    }
    public _getUserData(userId) {
        let userData = this._lastUsers[userId];
        return userData;
    }
    public _updateUserData(data) {
        let userData = new CampRaceUserData(data);
        let userId = userData.getId();
        this._lastUsers[userId] = userData;
    }
    public getPreRankWithCamp(camp) {
        return this._preRankList[camp];
    }
    public c2sGetCampRaceFormation(camp, userId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetCampRaceFormation, {
            camp: camp,
            uid: userId
        });
    }
    public _s2cGetCampRaceFormation(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let camp = message['camp'] || 0;
        let round = message['round'] || 0;
        let startTime = message['start_time'] || 0;
        let leftFormation = message['left_formation'];
        console.log('get camp race formation ----- : ', message);
        if (leftFormation == null) {
            console.log('empty message-----------------------------------');
        }
        let rightFormation = message['right_formation'];
        if (!this._curMatchDatas[camp]) {
            this._curMatchDatas[camp] = {};
        }
        this._curMatchDatas[camp]._round = round;
        this._curMatchDatas[camp]._startTime = startTime;
        if (leftFormation) {
            let leftPlayer = new CampRaceFormationData();
            leftPlayer.updateData(leftFormation);
            this._curMatchDatas[camp]._leftPlayer = leftPlayer;
        }
        if (rightFormation) {
            let rightPlayer = new CampRaceFormationData();
            rightPlayer.updateData(rightFormation);
            this._curMatchDatas[camp]._rightPlayer = rightPlayer;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GET_CAMP_RACE_FORMATION, camp);
    }
    public _s2cUpdateCampRaceFormation(id, message) {
        let uid = message['uid'] || 0;
        let camp = message['camp'] || 0;
        let formation = message['formation'];
        let player = new CampRaceFormationData();
        player.updateData(formation);
        let curMatch = this.getCurMatchDataWithCamp(camp);
        let leftPlayer = curMatch._leftPlayer;
        let rightPlayer = curMatch._rightPlayer;
        if (leftPlayer) {
            let curLeftUid = leftPlayer.getUid();
            if (uid == curLeftUid) {
                this._curMatchDatas[camp]._leftPlayer = player;
                G_SignalManager.dispatch(SignalConst.EVENT_UPDATE_CAMP_RACE_FORMATION, camp, 1);
            }
        }
        if (rightPlayer) {
            let curRightUid = rightPlayer.getUid();
            if (uid == rightPlayer) {
                this._curMatchDatas[camp]._rightPlayer = player;
                G_SignalManager.dispatch(SignalConst.EVENT_UPDATE_CAMP_RACE_FORMATION, camp, 2);
            }
        }
    }
    public _s2cCampRaceBattleResult(id, message) {
        let uid = message['uid'] || 0;
        let camp = message['camp'] || 0;
        let win = message['win'];
        G_SignalManager.dispatch(SignalConst.EVENT_CAMP_BATTLE_RESULT, camp, win);
    }
    public getCurMatchDataWithCamp(camp) {
        let data = this._curMatchDatas[camp] || {};
        return data;
    }
    public getCurMatchRoundWithCamp(camp) {
        let data = this.getCurMatchDataWithCamp(camp);
        return data._round;
    }
    public getCurMatchStartTimeWithCamp(camp) {
        let data = this.getCurMatchDataWithCamp(camp);
        return data._startTime;
    }
    public getCurMatchPlayersWithCamp(camp) {
        let data = this.getCurMatchDataWithCamp(camp);
        return [
            data._leftPlayer,
            data._rightPlayer
        ];
    }
    public getPositionByUserId(camp, userId) {
        let status = this.getFinalStatusByCamp(camp);
        let indexList = CampRaceData.ROUND[status-1];
        for (let i in indexList) {
            let pos = indexList[i];
            if (this._lastRaceUserIds[camp] && this._lastRaceUserIds[camp][pos-1] == userId) {
                return pos;
            }
        }
        return 0;
    }
    public _s2cAddRaceBattleReport(id, message) {
        let battleReport = message['battle_report'];
        if (battleReport) {
            let report = new CampRaceReportData(battleReport);
            let datas = [report];
            this._updateReportData(datas);
            G_SignalManager.dispatch(SignalConst.EVENT_ADD_RACE_BATTLE_REPORT, report);
        }
    }
    public c2sGetBattleReport(reportId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetBattleReport, { id: reportId });
    }
    public _s2cGetBattleReport(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        id = message['id'] || 0;
        let battleReport = message['battle_report'];
        G_SignalManager.dispatch(SignalConst.EVENT_GET_CAMP_REPORT, battleReport);
    }
    public _s2cUpdateCampRace(id, message) {
        let camp = message['camp'];
        let stateData = this.getCurStatusWithCamp(camp);
        stateData.updateData(message);
        let startTime = stateData.getStart_time();
        if (this._curMatchDatas[camp] == null) {
            this._curMatchDatas[camp] = {};
        }
        this._curMatchDatas[camp]._startTime = startTime;
        this._curStatus[camp] = stateData;
        this._checkSelfIsGetChampion(camp);
        G_SignalManager.dispatch(SignalConst.EVENT_CAMP_UPDATE_STATE, camp);
    }
    public getCurStatusWithCamp(camp) {
        let stateData = this._curStatus[camp];
        if (stateData == null) {
            stateData = new CampRaceStateData();
            this._curStatus[camp] = stateData;
        }
        return this._curStatus[camp];
    }
    public getFinalStatusByCamp(camp) {
        let stateData = this.getCurStatusWithCamp(camp);
        let finalStatus = stateData.getFinal_status();
        return finalStatus;
    }
    public getReportGroupByPos(camp, pos1, pos2) {
        let posKey = String(pos1) + ('_' + String(pos2));
        if (this._reports[camp] == null) {
            return {};
        }
        let reports = this._reports[camp][posKey] || {};
        return reports;
    }
    public c2sCampRaceBet(camp, pos) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_CampRaceBet, {
            camp: camp,
            pos: pos
        });
    }
    public _s2cCampRaceBet(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_CAMP_BET_SUCCESS);
    }
    public _s2cUpdateCampRaceBet(id, message) {
        this._betData = {};
        let betInfo = message['bet_info'] || {};
        for (let i in betInfo) {
            let info = betInfo[i];
            let camp = info.camp;
            let pos = info.pos;
            this._betData[camp] = pos;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_CAMP_UPDATE_BET);
    }
    public getBetPosWithCamp(camp) {
        let pos = this._betData[camp] || 0;
        return pos;
    }
    public isCanBetWithCamp(camp) {
        let myCamp = this.getMyCamp();
        return camp == myCamp;
    }
    public isHaveBet() {
        for (let camp in this._betData) {
            let pos = this._betData[camp];
            if (pos > 0) {
                return true;
            }
        }
        return false;
    }
    public isSignUp() {
        return this.getCamp() > 0;
    }
    public isFinishWithCamp(camp) {
        let status = this.getCurStatusWithCamp(camp);
        if (status) {
            let isFinish = status.getFinal_status() == CampRaceConst.PLAY_OFF_ROUND_ALL;
            return isFinish;
        }
        return false;
    }
    public isAllRaceFinish() {
        let isAllFinish = true;
        for (let i = 1; i <= 4; i++) {
            let isFinish = this.isFinishWithCamp(i);
            isAllFinish = isAllFinish && isFinish;
        }
        return isAllFinish;
    }
    public c2sGetCampRaceChampion() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetCampRaceChampion, {});
    }
    public _s2cGetCampRaceChampion(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let championList = {};
        for (let i in message.champion) {
            let v = message.champion[i];
            let camp = v.camp;
            let user = new CampRaceUserData(v.user);
            championList[camp] = user;
        }
        this.setChampion(championList);
        G_SignalManager.dispatch(SignalConst.EVENT_CAMP_GET_CHAMPION);
        G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_CAMP_RACE_CHAMPION);
    }
    public hasRedPoint() {
        let signUpRp = this.hasSignUpRedPoint();
        return signUpRp;
    }
    public hasBetRedPoint() {
        let status = this.getStatus();
        if (status != CampRaceConst.STATE_PLAY_OFF) {
            return false;
        }
        if (this.isMatching()) {
            return false;
        }
        if (this.isHaveBet()) {
            return false;
        }
        return true;
    }
    public hasSignUpRedPoint() {
        if (CampRaceHelper.isReplacedBySingleRace() == true) {
            return false;
        }
        let status = this.getStatus();
        if (status == CampRaceConst.STATE_PRE_OPEN) {
            let [openState] = CampRaceHelper.getSigninState();
            if (openState == CampRaceConst.SIGNIN_OPEN && !this.isSignUp()) {
                return true;
            }
        }
        return false;
    }
    public findWatchUserIdWithCamp(camp) {
        let selfId = G_UserData.getBase().getId();
        let finalStatus = this.getFinalStatusByCamp(camp);
        let tbPos = CampRaceData.ROUND[finalStatus -1];
        let userIds = this.getUserIdsWithCamp(camp);
        for (let i in tbPos) {
            let pos = tbPos[i];
            let userId = userIds[pos-1];
            if (userId == selfId) {
                return userId;
            }
        }
        for (let i in tbPos) {
            let pos = tbPos[i];
            let userId = userIds[pos-1];
            return userId;
        }
    }
    public findCurWatchCamp() {
        let curWatchUserId = this.getCurWatchUserId();
        if (curWatchUserId == 0) {
            return this.getMyCamp();
        } else {
            return this.getCampWithUserId(curWatchUserId);
        }
    }
    public _checkSelfIsGetChampion(camp) {
        let myCamp = this.getMyCamp();
        if (myCamp != camp) {
            return;
        }
        if (this.isFinishWithCamp(myCamp)) {
            let userIds = G_UserData.getCampRaceData().getUserIdsWithCamp(myCamp);
            let championId = userIds[15 -1];
            if (championId == G_UserData.getBase().getId()) {
                this.setSelfWinChampion(true);
                return true;
            }
        }
        return false;
    }
}