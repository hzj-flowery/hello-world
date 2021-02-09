import { BaseData } from './BaseData';
import { G_SignalManager, G_NetworkManager, G_ConfigLoader, G_UserData } from '../init';
import { SignalConst } from '../const/SignalConst';
import { FunctionConst } from '../const/FunctionConst';
import { DataConst } from '../const/DataConst';
import { MessageIDConst } from '../const/MessageIDConst';
import { Slot } from '../utils/event/Slot';
import { ConfigNameConst } from '../const/ConfigNameConst';
import { ArraySort } from '../utils/handler';
import { UserDataHelper } from '../utils/data/UserDataHelper';
import { DropHelper } from '../utils/DropHelper';
export class ArenaData extends BaseData {
    public static RANK_BREAK_AWARD = 2;
    public _myArenaData;

    public _awardInfoList;
    public _awardInfoList2;
    public _awardListCache: any[];
    public _getArenaInfo: Slot;
    public _getBuyArenaCount: Slot;
    public _getArenaReward: Slot;
    public _getChallengeArena: Slot;
    public _getSendArenaRankRewardClient: Slot;
    public _getArenaTopTenReport: Slot;
    public _getBattleReport: Slot;
    public _getCommonGetReport: Slot;
    public _getArenaTopInfo: Slot;
    constructor() {
        super()
        this._initAwardInfoList();
        this._myArenaData = {};
        this._myArenaData['rewardId'] = {};
        this._myArenaData['rank'] = 0;
        this._myArenaData['maxRankReward'] = {};
        this._myArenaData['maxRank'] = 99999;
        this._awardListCache = null;
        this._getArenaInfo = G_NetworkManager.add(MessageIDConst.ID_S2C_GetArenaInfo, this._s2cGetArenaInfo.bind(this));
        this._getBuyArenaCount = G_NetworkManager.add(MessageIDConst.ID_S2C_BuyCommonCount, this._s2cBuyCommonCount.bind(this));
        this._getArenaReward = G_NetworkManager.add(MessageIDConst.ID_S2C_GetArenaRankReward, this._s2cGetArenaRankReward.bind(this));
        this._getChallengeArena = G_NetworkManager.add(MessageIDConst.ID_S2C_ChallengeArena, this._s2cChallengeArena.bind(this));
        this._getSendArenaRankRewardClient = G_NetworkManager.add(MessageIDConst.ID_S2C_SendArenaRankRewardClient, this._s2cSendArenaRankRewardClient.bind(this));
        this._getArenaTopTenReport = G_NetworkManager.add(MessageIDConst.ID_S2C_GetArenaTopTenReport, this._s2cGetArenaTopTenReport.bind(this));
        this._getBattleReport = G_NetworkManager.add(MessageIDConst.ID_S2C_GetBattleReport, this._s2cGetBattleReport.bind(this));
        this._getCommonGetReport = G_NetworkManager.add(MessageIDConst.ID_S2C_CommonGetReport, this._s2cCommonGetReport.bind(this));
        this._getArenaTopInfo = G_NetworkManager.add(MessageIDConst.ID_S2C_GetArenaTopInfo, this._s2cGetArenaTopInfo.bind(this));
    }

    public _s2cSendArenaRankRewardClient(id, message) {
        if (message.ret != 1) {
            return;
        }
        this._myArenaData['maxRank'] = message.max_rank;
        this._myArenaData['arenaCount'] = message.arena_cnt;
        let awardList = message.reward_id || [];
        this._myArenaData['rewardId'] = {};
        for (let i = 0; i < awardList.length; i++) {
            this._myArenaData['rewardId']['k' + awardList[i]] = awardList[i];
        }
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_ARENA);
    }
    public _s2cChallengeArena(id, message) {
        if (message.ret != 1) {
            return;
        }
        let fightNum = message.arena_cnt;
        let maxRankReward = message['max_rank_reward'] || {};
        this._myArenaData['arenaCount'] = fightNum;
        this._myArenaData['maxRankReward'] = maxRankReward;
        G_SignalManager.dispatch(SignalConst.EVENT_ARENA_FIGHT_COUNT, message);
    }
    public _s2cBuyCommonCount(id, message) {
        if (message.ret != 1) {
            return;
        }
        let funcId = message.id;
        if (funcId == DataConst.VIP_FUNC_TYPE_ARENA_TIMES) {
            this._myArenaData['arenaCount'] = message.cnt;
            this._myArenaData['buyCount'] = message.buy_cnt;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_ARENA_BUY_COUNT, message);
    }
    public _s2cGetArenaRankReward(id, message) {
        if (message.ret != 1) {
            return;
        }
        let awardId = message.reward_id;
        this._myArenaData['rewardId']['k' + awardId] = awardId;
        G_SignalManager.dispatch(SignalConst.EVENT_ARENA_GET_REWARD, message);
    }
    public _s2cGetArenaInfo(id, message) {
        if (message.ret != 1) {
            return;
        }
        this.resetTime();
        this.setArenaData(message);
        G_SignalManager.dispatch(SignalConst.EVENT_ARENA_GET_ARENA_INFO, message);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_ARENA);
    }
    public c2sGetArenaInfo() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetArenaInfo, {});
    }
    public c2sChallengeArena(message) {
        if (this.isExpired() == true) {
            this.c2sGetArenaInfo();
            return;
        }
        G_NetworkManager.send(MessageIDConst.ID_C2S_ChallengeArena, message);
    }
    public c2sBuyCommonCount(funcId) {
        if (this.isExpired() == true) {
            this.c2sGetArenaInfo();
            return;
        }
        let message = { id: funcId };
        G_NetworkManager.send(MessageIDConst.ID_C2S_BuyCommonCount, message);
    }
    public c2sGetArenaTopTenReport() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetArenaTopTenReport, {});
    }
    public c2sGetArenaTopInfo() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetArenaTopInfo, {});
    }
    public c2sCommonGetReport(reportType) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_CommonGetReport, { report_type: reportType });
    }
    public _s2cGetArenaTopTenReport(id, message) {
        if (message.ret != 1) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_ARENA_GET_ARENA_TOP_TEN_INFO, message);
    }
    public _s2cGetBattleReport(id, message) {
        if (message.ret != 1) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GET_ARENA_BATTLE_REPORT, message);
    }
    public _s2cCommonGetReport(id, message) {
        if (message.ret != 1) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GET_COMMON_REPORT_LIST, message);
    }
    public _s2cGetArenaTopInfo(id, message) {
        if (message.ret != 1) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_ARENA_GET_ARENA_RANK_INFO, message);
    }
    public clear() {
        this._getArenaReward.remove();
        this._getArenaReward = null;
        this._getArenaInfo.remove();
        this._getArenaInfo = null;
        this._getBuyArenaCount.remove();
        this._getBuyArenaCount = null;
        this._getChallengeArena.remove();
        this._getChallengeArena = null;
        this._getSendArenaRankRewardClient.remove();
        this._getSendArenaRankRewardClient = null;
        this._getArenaTopTenReport.remove();
        this._getArenaTopTenReport = null;
        this._getBattleReport.remove();
        this._getBattleReport = null;
        this._getCommonGetReport.remove();
        this._getCommonGetReport = null;
        this._getArenaTopInfo.remove();
        this._getArenaTopInfo = null;
    }
    public reset() {
    }
    public getMyMaxRankRewrd() {
        let reward = this._myArenaData['maxRankReward'] || {};
        this._myArenaData['maxRankReward'] = {};
        if (reward.length > 1) {
            return reward[1];
        }
        return null;
    }
    public _initAwardInfoList() {
        this._awardInfoList = [];
        this._awardInfoList2 = [];
        let arenaRewardInfo = G_ConfigLoader.getConfig(ConfigNameConst.ARENA_REWARD);
        let len = arenaRewardInfo.length();
        for (let i = 0; i < len; i++) {
            let info = arenaRewardInfo.indexOf(i);
            if (info.type == ArenaData.RANK_BREAK_AWARD) {
                this._awardInfoList[this._awardInfoList.length] = info;
            } else {
                this._awardInfoList2[this._awardInfoList2.length] = info;
            }
        }
        ArraySort(this._awardInfoList, function (a, b) {
            if (a.rank_min != b.rank_min) {
                return a.rank_min > b.rank_min;
            }
        });
        ArraySort(this._awardInfoList2, function (a, b) {
            if (a.rank_min != b.rank_min) {
                return a.rank_min < b.rank_min;
            }
        });
    }
    public _createChallengeUnit(value) {
        let t = {};
        t['uid'] = value.user_id;
        t['rank'] = value.rank;
        t['name'] = value.name;
        let [baseId, table] = UserDataHelper.convertAvatarId(value);
        t['baseId'] = baseId;
        t['baseTable'] = table;
        t['power'] = value.power;
        t['officialLevel'] = value['officer_level'] || 1;
        if (t['uid'] == G_UserData.getBase().getId()) {
            t['baseTable'] = G_UserData.getBase().getPlayerShowInfo();
        }
        return t;
    }
    public getMyArenaData() {
        let t = {};
        t['uid'] = G_UserData.getBase().getId();
        t['rank'] = this._myArenaData['rank'];
        t['name'] = G_UserData.getBase().getName();
        t['baseId'] = G_UserData.getBase().getPlayerBaseId();
        t['baseTable'] = G_UserData.getBase().getPlayerShowInfo();
        t['power'] = G_UserData.getBase().getPower();
        t['maxRank'] = this._myArenaData['maxRank'];
        t['buyCount'] = this._myArenaData['buyCount'];
        t['arenaCount'] = this._myArenaData['arenaCount'];
        t['officialLevel'] = G_UserData.getBase().getOfficialLevel() + 1;
        return t;
    }
    public setArenaData(message) {
        this._myArenaData['uid'] = message.user_id;
        this._myArenaData['rank'] = message.rank;
        this._myArenaData['arenaCount'] = message.arena_cnt;
        this._myArenaData['maxRank'] = message['max_rank'] || 0;
        this._myArenaData['buyCount'] = message.buy_arena_cnt;
        this._myArenaData['firstBattle'] = message.first_battle;
        this._myArenaData['challengeList'] = [];
        let list = message['to_challenge_list'] || [];
        for (let i = 0; i < list.length; i++) {
            this._myArenaData['challengeList'][i] = this._createChallengeUnit(list[i]);
        }
        ArraySort(this._myArenaData.challengeList, function (item1, item2) {
            if (item1.rank != item2.rank) {
                return item1.rank < item2.rank;
            }
        });
    }
    public getArenaData() {
        return this._myArenaData;
    }
    public getArenaFirstBattle() {
        return this._myArenaData.firstBattle;
    }
    public getArenaRank() {
        return this._myArenaData.rank;
    }
    public getArenaMaxRank() {
        return this._myArenaData.maxRank;
    }
    public getArenaChallengeList() {
        return this._myArenaData.challengeList;
    }
    public getRankAward(rank) {
        if (rank == null) {
            return null;
        }
        let realRank = rank < 1 && 1 || rank;
        for (let i = 0; i < this._awardInfoList2.length; i++) {
            let info = this._awardInfoList2[i];
            if (this._isRankReach(info, realRank) == true) {
                return info;
            }
        }
        return null;
    }
    public getNextRankAward(currRank) {
        if (currRank == null) {
            return null;
        }
        let index = 0;
        let realRank = currRank < 1 && 1 || currRank;
        let len = this._awardInfoList2.length;
        for (let i = 0; i < len; i++) {
            let info = this._awardInfoList2[i];
            if (this._isRankReach(info, realRank) == true) {
                index = i;
                break;
            }
        }
        let info = null;
        let target = index + 1;
        if (target <= len) {
            info = this._awardInfoList2[target];
        } else {
            info = this._awardInfoList2[index];
        }
        return info;
    }
    public _isTakenAward(awardId) {
        for (let i in this._myArenaData['rewardId']) {
            let value = this._myArenaData['rewardId'][i];
            if (value == awardId) {
                return true;
            }
        }
        return false;
    }
    public _isRankReach(awardData, rank) {
        let realRank = rank || this.getArenaRank();
        if (realRank == 0) {
            return false;
        }
        let minRank = awardData.rank_min;
        if (realRank <= minRank) {
            return true;
        }
        return false;
    }
    public getTakenAwardList() {
        let awardList = [];
        function merageAward(awardInfo) {
            for (let i = 1; i <= 3; i++) {
                if (awardInfo['award_type_' + i] > 0) {
                    let award = {
                        type: awardInfo['award_type_' + i],
                        value: awardInfo['award_value_' + i],
                        size: awardInfo['award_size_' + i]
                    };
                    awardList.push(award);
                }
            }
        }
        let arenaRewardInfo = G_ConfigLoader.getConfig(ConfigNameConst.ARENA_REWARD);
        for (let i in this._myArenaData['rewardId']) {
            let value = this._myArenaData['rewardId'][i];
            let cfgData = arenaRewardInfo.get(value);
            if (cfgData) {
                merageAward(cfgData);
            }
        }
        let retList = DropHelper.merageAwardList(awardList);
        return retList;
    }
    public hasAwardReach() {
        let awardList = this.getAwardList();
        for (let i in awardList) {
            let value = awardList[i];
            if (value.isReach == true && value.isTaken == false) {
                return true;
            }
        }
        return false;
    }
    public getAwardList() {
        let retList = [];
        for (let key in this._awardInfoList) {
            let value = this._awardInfoList[key];
            let awardData = {

                cfg : value,
                isTaken : this._isTakenAward(value.id),
                isReach : this._isRankReach(value, this.getArenaMaxRank())
            };
            retList.push(awardData);
        }
        ArraySort(retList, function (item1, item2) {
            if (item1.isTaken != item2.isTaken) {
                return !item1.isTaken;
            }
            if (item1.isReach != item2.isReach) {
                return item1.isReach;
            }
            if (item1.cfg.id != item2.cfg.id) {
                return item1.cfg.id > item2.cfg.id;
            }
        });
        this._awardListCache = retList;
        return retList;
    }
}