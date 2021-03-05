import { BaseData } from './BaseData';
import { G_NetworkManager, G_SignalManager, G_UserData, G_ConfigLoader, G_Prompt } from '../init';
import { MessageIDConst } from '../const/MessageIDConst';
import { SignalConst } from '../const/SignalConst';
import { Slot } from '../utils/event/Slot';
import { FunctionConst } from '../const/FunctionConst';
import { ConfigNameConst } from '../const/ConfigNameConst';
import ParameterIDConst from '../const/ParameterIDConst';
import { VipItemData } from './VipItemData';
import { handler } from '../utils/handler';
import { MessageErrorConst } from '../const/MessageErrorConst';
let schema = {};
schema['level'] = [
    'number',
    0
];

schema['exp'] = [
    'number',
    0
];

export interface VipData {
    getLevel(): number
    setLevel(value: number): void
    getLastLevel(): number
    getExp(): number
    setExp(value: number): void
    getLastExp(): number
}
export class VipData extends BaseData {

    public static schema = schema;
    public static PARAM_LIME_SHOW_KEY = 175;

    _dataList: any[];
    _msgGetVip: Slot;
    _msgGetVipGift: Slot;
    _msgSyncVipGift: Slot;
    _signalRechargeGetInfo: Slot;
    _msgJadeBiExcharge:Slot;
    _vipFuncDataList;
    _serverVipRewardList;

    public c2sGetRecharge() {
        let message = {};
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetRecharge, message);
    }
    constructor(properties?) {
        super(properties)
        this._msgGetVip = G_NetworkManager.add(MessageIDConst.ID_S2C_GetVip, this._s2cGetVip.bind(this));
        this._msgGetVipGift = G_NetworkManager.add(MessageIDConst.ID_S2C_GetVipReward, this._s2cGetVipGift.bind(this));
        this._msgSyncVipGift = G_NetworkManager.add(MessageIDConst.ID_S2C_SendVipReward, this._s2cGetVipGift.bind(this));
        this._signalRechargeGetInfo = G_SignalManager.add(SignalConst.EVENT_RECHARGE_GET_INFO, this._onEventRechargeGetInfo.bind(this));
        this._msgJadeBiExcharge = G_NetworkManager.add(MessageIDConst.ID_S2C_JadeBiExcharge, handler(this, this._s2cJadeBiExcharge));
        this._vipFuncDataList = null;
        this._serverVipRewardList = {};
        this._initVipCfg();
        this._initData();
    }
    public clear() {
        this._msgGetVip.remove();
        this._msgGetVip = null;
        this._msgSyncVipGift.remove();
        this._msgSyncVipGift = null;
        this._msgGetVipGift.remove();
        this._msgGetVipGift = null;
        this._signalRechargeGetInfo.remove();
        this._signalRechargeGetInfo = null;
        this._vipFuncDataList = null;

        if (this._msgJadeBiExcharge) {
            this._msgJadeBiExcharge.remove();
            this._msgJadeBiExcharge = null;
        }

    }
    public reset() {
        this._initVipCfg();
    }
    public _s2cGetVip(id, message) {
        // console.log(message);
        this.setProperties(message.vip);
    }
    public _s2cGetVipGift(id, message) {
        if (message.ret != 1) {
            return;
        }
        var vipRewardList = message['vip_reward'] || {};
        this._serverVipRewardList = vipRewardList;
        G_SignalManager.dispatch(SignalConst.EVENT_VIP_GET_VIP_GIFT_ITEMS, message);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_VIP_GIFT);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_RECHARGE);
        G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_VIP_GIFT);
    }
    public _onEventRechargeGetInfo(event, id, message) {
        G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_VIP_GIFT);
        G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_TSHIRT);
    }

    public _isGiftCanTake(currLevel) {
        let playerVipLevel = G_UserData.getVip().getLevel();
        let currVipLevel = currLevel;
        let isRewardTake = this.isVipRewardTake(currVipLevel);
        if (playerVipLevel >= currVipLevel && isRewardTake == false) {
            return true;
        }
        return false;
    }
    public hasGiftInRightPage(vipLevel) {
        if (vipLevel == null || vipLevel <= 0) {
            return false;
        }
        let maxVipLv = G_UserData.getVip().getShowMaxLevel();
        if (vipLevel > maxVipLv) {
            return false;
        }
        let [pageInfo, currPage] = this.getVipDataByLevel(vipLevel-1);
        //console.log(currPage);
        if (currPage < 0 || currPage >= this._dataList.length) {
            return false;
        }
        for (let i = currPage+1; i < this._dataList.length; i++) {
            let value = this._dataList[i];
            let currVipLevel = value.getId();
            if (this._isGiftCanTake(currVipLevel)) {
                return true;
            }
        }
        return false;
    }
    public hasGiftInLeftPage(vipLevel) {
        if (vipLevel == null || vipLevel < 0) {
            return false;
        }
        let [pageInfo, currPage] = this.getVipDataByLevel(vipLevel);
        //console.log(currPage);
        if (currPage < 0 || currPage >= this._dataList.length) {
            return false;
        }
        let playerVipLevel = G_UserData.getVip().getLevel();
        for (let i = 0; i <= currPage; i++) {
            let value = this._dataList[i];
            let currVipLevel = value.getId();
            if (this._isGiftCanTake(currVipLevel)) {
                return true;
            }
        }
        return false;
    }
    public hasVipGiftCanBuy() {
        let playerVipLevel = G_UserData.getVip().getLevel();
        for (let i in this._dataList) {
            let value = this._dataList[i];
            let currVipLevel = value.getId();
            if (this._isGiftCanTake(currVipLevel)) {
                return true;
            }
        }
        return false;
    }
    public isVipRewardTake(vipLevel) {
        for (let i in this._serverVipRewardList) {
            let value = this._serverVipRewardList[i];
            if (value == vipLevel) {
                return true;
            }
        }
        return false;
    }
    public updateData(data) {
        this.backupProperties();
        this.setProperties(data);
        let getOldVipTotalExp = function () {
            let totalVip = this.getVipTotalExp(0, this.getLastLevel());
            return totalVip + this.getLastExp();
        }.bind(this);
        let addExp = this.getCurVipTotalExp() - getOldVipTotalExp();
        console.warn('---------------- ' + String(addExp));
        G_SignalManager.dispatch(SignalConst.EVENT_VIP_EXP_CHANGE, addExp);
    }
    public _initVipCfg() {
        this._vipFuncDataList = {};
        let vipCfg = G_ConfigLoader.getConfig(ConfigNameConst.VIP_FUNCTION);
        let len = vipCfg.length();
        for (let i = 0; i < len; i++) {
            let info = vipCfg.indexOf(i);
            this._vipFuncDataList[String(info.type) + ('_' + String(info.vip))] = info;
        }
    }
    public getVipFunctionDataByType(functionType, isNextLevel?) {
        if (this._vipFuncDataList == null) {
            this._initVipCfg();
        }
        let vipLevel = this.getLevel();
        if (isNextLevel) {
            vipLevel = vipLevel + 1;
        }
        return this._vipFuncDataList[String(functionType) + ('_' + String(vipLevel))];
    }
    public getVipFunctionDataByTypeLevel(functionType, functionLevel) {
        if (this._vipFuncDataList == null) {
            this._initVipCfg();
        }
        return this._vipFuncDataList[String(functionType) + ('_' + String(functionLevel))];
    }
    public getVipList() {
        return this._dataList;
    }
    public getMaxLevel() {
        return this._dataList[this._dataList.length].getInfo().level;
    }
    public getShowMaxLevel() {
        let Parameter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        let limitShowLv = Number(Parameter.get(ParameterIDConst.VIP_LEVEL_MAX).content);
        return limitShowLv;
    }
    public _initData() {
        this._dataList = [];
        let VipLevelInfo = G_ConfigLoader.getConfig(ConfigNameConst.VIP_LEVEL);
        let count = VipLevelInfo.length();
        for (let i = 0; i < count; i++) {
            let vipLevelInfo = VipLevelInfo.indexOf(i);
            let vipItemData = new VipItemData();
            vipItemData.setInfo(vipLevelInfo);
            this._dataList.push(vipItemData);
        }
    }
    public getVipDataByLevel(vipLevel) {
        for (let i = 0; i<=this._dataList.length; i++) {
            let value = this._dataList[i];
            if (value.getId() == vipLevel) {
                return [
                    value,
                    i
                ];
            }
        }
        return [
            null,
            0
        ];
    }
    public getVipTimesByFuncId(funcId) {
        let currentValue = 0;
        let maxValue = 0;
        let currentVipLv = this.getLevel();
        let VipFunctionInfo = G_ConfigLoader.getConfig(ConfigNameConst.VIP_FUNCTION);
        for (let i = 0; i < VipFunctionInfo.length(); i++) {
            let vipFuncInfo = VipFunctionInfo.indexOf(i);
            if (vipFuncInfo.type == funcId) {
                let infoValue = vipFuncInfo.value;
                if (vipFuncInfo.vip == currentVipLv) {
                    currentValue = infoValue;
                }
                if (maxValue < infoValue) {
                    maxValue = infoValue;
                }
            }
        }
        return [
            currentValue,
            maxValue
        ];
    }
    public getVipFuncitonInfo(vipLevel) {
        vipLevel = vipLevel || G_UserData.getVip().getLevel();
        let VipFunctionInfo = G_ConfigLoader.getConfig(ConfigNameConst.VIP_FUNCTION);
        let currentInfo = null;
        for (let i = 0; i < VipFunctionInfo.length(); i++) {
            let funcInfo = VipFunctionInfo.indexOf(i);
            // if (funcInfo.type == funcType) {
            //     if (funcInfo.level == vipLevel) {
            //         currentInfo = funcInfo;
            //         break;
            //     }
            //     if (currentInfo == null) {
            //         currentInfo = funcInfo;
            //     }
            // }
        }
        return currentInfo;
    }
    public getVipTotalExp(minLv, maxLv) {
        let exp = 0;
        for (let i in this._dataList) {
            let value = this._dataList[i];
            if (value.getId() >= minLv && value.getId() < maxLv) {
                let curVipLvInfo = value.getInfo();
                exp = exp + curVipLvInfo.vip_exp;
            }
        }
        return exp;
    }
    public getCurVipTotalExp() {
        let totalVip = this.getVipTotalExp(0, this.getLevel());
        return totalVip + this.getExp();
    }

    c2sJadeBiExcharge(jadeNum) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_JadeBiExcharge, { gold: jadeNum });
    }
    _s2cJadeBiExcharge(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        if (message['award'] != null) {
            var awards = [];
            awards.push(message.award);
            G_Prompt.showAwards(awards);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_DIAMOND_EXCHANGE);
    }

}