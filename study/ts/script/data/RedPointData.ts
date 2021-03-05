import { BaseData } from "./BaseData";
import { G_SignalManager, G_ServiceManager, G_ServerTime, G_NetworkManager, G_StorageManager, G_UserData } from "../init";
import { SignalConst } from "../const/SignalConst";
import { MessageIDConst } from "../const/MessageIDConst";
import { clone } from "../utils/GlobleFunc";
import { TimeConst } from "../const/TimeConst";
import { bit } from "../utils/bit";

export class RedPointData extends BaseData {
    public static FILE_NAME = 'redPoint';

    _recvRedPoint;
    _signalRedPointClick;
    _signalRedPointClickMemory;
    _data;
    _counts: Array<number>;
    _redPointTable: Array<1 | 0>;
    _storageRedPointData;
    _everyLoginRedPoint;

    constructor(properties?) {
        super(properties);
        this._recvRedPoint = G_NetworkManager.add(MessageIDConst.ID_S2C_RedPointNotify, this._s2cRedPointNotify.bind(this));
        this._signalRedPointClick = G_SignalManager.add(SignalConst.EVENT_RED_POINT_CLICK, this._onEventRedPointClick.bind(this));
        this._signalRedPointClickMemory = G_SignalManager.add(SignalConst.EVENT_RED_POINT_CLICK_MEMORY, this._onEventRedPointClickMemory.bind(this));
        this._data = {};
        this._counts = [];
        this._redPointTable = [];
        this._storageRedPointData = null;
        this._everyLoginRedPoint = {};
    }
    public clear() {
        this._recvRedPoint.remove();
        this._recvRedPoint = null;
        this._signalRedPointClick.remove();
        this._signalRedPointClick = null;
        this._signalRedPointClickMemory.remove();
        this._signalRedPointClickMemory = null;
    }
    public reset() {
        this._data = {};
        this._redPointTable = [];
        this._counts = [];
        this._storageRedPointData = null;
        this._everyLoginRedPoint = {};
    }
    public getCount(index) {
        //下标从0走
        return this._counts[index - 1] || 0;
    }
    public _s2cRedPointNotify(id, buffData) {
        if (buffData == null || typeof buffData != 'object') {
            return;
        }
        let mask = buffData.mask;
        this._redPointTable = bit.tobits(mask);
        let counts = buffData['count'];
        if (counts) {
            this._counts = clone(counts);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE);
        // cc.log(this._redPointTable);
    }
    public _onEventRedPointClick(event, funcId, param) {
        let key = this.makeCacheKey(funcId, param);
        let value = G_ServerTime.getTime();
        this.setPointValue(key, value);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, funcId, param);
    }
    public _onEventRedPointClickMemory(event, funcId, param) {
        let key = this.makeCacheKey(funcId, param);
        this._everyLoginRedPoint[key] = true;
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, funcId, param);
    }
    public isThisLoginClick(funcId, param) {
        let key = this.makeCacheKey(funcId, param);
        return this._everyLoginRedPoint[key];
    }
    public isRebelArmy() {
        if (this._redPointTable.length >= 1) {
            return this._redPointTable[1 - 1] > 0;
        }
        return false;
    }

    isGuildCrossWarGuess() {
        if (this._redPointTable.length >= 26) {
            return this._redPointTable[26-1] > 0;
        }
        return false;
    }
    isReturnActivity() {
        if (this._redPointTable.length >= 27) {
            return this._redPointTable[27-1] > 0;
        }
        return false;
    }
    isGuildCrossWarCamp() {
        if (this._redPointTable.length >= 28) {
            return this._redPointTable[28-1] > 0;
        }
        return false;
    }
    isGrainCar() {
        if (this._redPointTable.length >= 29) {
            return this._redPointTable[29-1] > 0;
        }
        return false;
    }
    isGrainCarCanLaunch() {
        if (this._redPointTable.length >= 30) {
            return this._redPointTable[30-1] > 0;
        }
        return false;
    }
    isRedPetShow() {
        if (this._redPointTable.length >= 31) {
            return this._redPointTable[31-1] > 0;
        }
        return false;
    }
    resetRedPointTableByIndex(index) {
        if (this._redPointTable.length >= index + 1) {
            this._redPointTable[index] = 0;
        }
    }

    public isArenaDefReport() {
        if (this._redPointTable.length >= 2) {
            return this._redPointTable[2 - 1] > 0;
        }
        return false;
    }
    public isArenaPeekReport() {
        if (this._redPointTable.length >= 3) {
            return this._redPointTable[3 - 1] > 0;
        }
        return false;
    }
    public isHeroShopShowRed() {
        if (this._redPointTable.length >= 4) {
            return this._redPointTable[4 - 1] > 0;
        }
        return false;
    }
    public isTerritoryRedPoint() {
        if (this._redPointTable.length >= 5) {
            return this._redPointTable[5 - 1] > 0;
        }
        return false;
    }
    public isHasGuildCheckApplication() {
        if (this._redPointTable.length >= 7) {
            return this._redPointTable[7 - 1] > 0;
        }
        return false;
    }
    public isHasGuildHelpReceive() {
        if (this._redPointTable.length >= 8) {
            return this._redPointTable[8 - 1] > 0;
        }
        return false;
    }
    public isGuildCanAddHeroHelp() {
        if (this._redPointTable.length >= 9) {
            return this._redPointTable[9 - 1] > 0;
        }
        return false;
    }
    public isHasFriendApplyRedPoint() {
        if (this._redPointTable.length >= 10) {
            return this._redPointTable[10 - 1] > 0;
        }
        return false;
    }
    public isHasFriendGetEnergyRedPoint() {
        if (this._redPointTable.length >= 11) {
            return this._redPointTable[11 - 1] > 0;
        }
        return false;
    }
    public isGuildHasRedPacketRedPoint() {
        if (this._redPointTable.length >= 12) {
            return this._redPointTable[12 - 1] > 0;
        }
        return false;
    }
    public isGuildHasContributionRedPoint() {
        if (this._redPointTable.length >= 13) {
            return this._redPointTable[13 - 1] > 0;
        }
        return false;
    }
    public isGuildHasTaskRedPoint() {
        if (this._redPointTable.length >= 14) {
            return this._redPointTable[14 - 1] > 0;
        }
        return false;
    }
    public isEnemyRevengeRedPoint() {
        if (this._redPointTable.length >= 17) {
            return this._redPointTable[17 - 1] > 0;
        }
        return false;
    }
    public isMineNewReport() {
        if (this._redPointTable.length >= 18) {
            return this._redPointTable[18 - 1] > 0;
        }
        return false;
    }
    public isMineBeHit() {
        if (this._redPointTable.length >= 19) {
            return this._redPointTable[19 - 1] > 0;
        }
        return false;
    }
    public isSeasonDailyReward() {
        if (this._redPointTable.length >= 21) {
            return this._redPointTable[21 - 1] > 0;
        }
        return false;
    }
    public isQinTombReport() {
        if (this._redPointTable.length >= 22) {
            return this._redPointTable[22 - 1] > 0;
        }
        return false;
    }
    public isSingleRaceGuess() {
        if (this._redPointTable.length >= 24) {
            return this._redPointTable[24 - 1] > 0;
        }
        return false;
    }
    public isGachaGoldenHero() {
        // cc.log(this._redPointTable, 'RedPointData:isGachaGoldenHero :::');
        // cc.log(this._redPointTable.length);
        // cc.log(this._redPointTable[25]);
        if (this._redPointTable.length >= 25) {
            return this._redPointTable[25 - 1] > 0;
        }
        return false;
    }
    public isHasRedPointByMaskIndex(maskIndex) {
        if (this._redPointTable.length >= maskIndex + 1) {
            return this._redPointTable[maskIndex] > 0;
        }
        return false;
    }
    public flush() {
        this._saveData(this._data);
    }
    public _saveData(data) {
        G_StorageManager.setUserInfo('', G_UserData.getBase().getId());
        G_StorageManager.saveWithUser(RedPointData.FILE_NAME, data);
    }
    public _getData() {
        if (!this._storageRedPointData) {
            G_StorageManager.setUserInfo('', G_UserData.getBase().getId());
            this._storageRedPointData = G_StorageManager.loadUser(RedPointData.FILE_NAME) || {};
        }
        return this._storageRedPointData;
    }
    public getPointValue(key) {
        let data = this._getData();
        let dataValue = data[key];
        return dataValue;
    }
    public setPointValue(key, value) {
        let data = this._getData();
        data[key] = value;
        this._saveData(data);
    }
    public isTodayShowedRedPoint(key) {
        let time = this.getPointValue(key);
        if (!time) {
            return false;
        }
        let expired = G_ServerTime.isTimeExpired(time, TimeConst.RESET_TIME);
        // console.log("isTodayShowedRedPoint", key, expired);
        return !expired;
    }
    public isTodayShowedRedPointByFuncId(funcId, param?) {
        return this.isTodayShowedRedPoint(this.makeCacheKey(funcId, param));
    }
    public makeCacheKey(funcId, param) {
        let key = String(funcId);
        if (param) {
            key = key + JSON.stringify(param);
        }
        return key;
    }
    public clearRedPointShowFlag(funcId, param) {
        let key = this.makeCacheKey(funcId, param);
        this.setPointValue(key, 0);
    }
}
