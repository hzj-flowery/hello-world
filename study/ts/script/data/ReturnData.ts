import { BaseData } from "./BaseData";
import { G_NetworkManager, G_ServerTime, G_UserData, G_SignalManager, G_ConfigLoader } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { handler, ArraySort } from "../utils/handler";
import { table } from "../utils/table";
import { ReturnConst } from "../const/ReturnConst";
import { SignalConst } from "../const/SignalConst";
import { FunctionConst } from "../const/FunctionConst";
import { ConfigNameConst } from "../const/ConfigNameConst";

export class ReturnData extends BaseData {
    _dailyActivityCompleteInfo: {};
    _dailyActivityAwardStatus: {};
    _privilegeUsedInfo: any[];
    _giftActivityCompleteInfo: any[];
    _discountActivityCompleteInfo: {};
    _end_time: number;
    _emergency: boolean;
    _recharge: number;
    _pay_id: number;
    _level: number;
    _recvGetReturnData: import("f:/mingjiangzhuan/main/assets/resources/script/utils/event/Slot").Slot;
    _recvBuyDiscountData: import("f:/mingjiangzhuan/main/assets/resources/script/utils/event/Slot").Slot;
    _recvLevelDirectUp: import("f:/mingjiangzhuan/main/assets/resources/script/utils/event/Slot").Slot;
    _recvAwardsInfo: import("f:/mingjiangzhuan/main/assets/resources/script/utils/event/Slot").Slot;
    _recvUpdateData: import("f:/mingjiangzhuan/main/assets/resources/script/utils/event/Slot").Slot;

    constructor(properties?) {
        super(properties);
        this._dailyActivityCompleteInfo = {};
        this._dailyActivityAwardStatus = {};
        this._privilegeUsedInfo = [];
        this._giftActivityCompleteInfo = [];
        this._discountActivityCompleteInfo = {};
        this._end_time = 0;
        this._emergency = true;
        this._recharge = 0;
        this._pay_id = 0;
        this._level = 0;
        this._recvGetReturnData = G_NetworkManager.add(MessageIDConst.ID_S2C_GetRegression, handler(this, this._s2cGetReturnInfo));
        this._recvBuyDiscountData = G_NetworkManager.add(MessageIDConst.ID_S2C_RegressionBuyDiscount, handler(this, this._s2cGetBuyDiscountInfo));
        this._recvLevelDirectUp = G_NetworkManager.add(MessageIDConst.ID_S2C_LevelDirect, handler(this, this._s2cLevelDirectUp));
        this._recvAwardsInfo = G_NetworkManager.add(MessageIDConst.ID_S2C_ReceiveAwards, handler(this, this._s2cReceiveAwards));
        this._recvUpdateData = G_NetworkManager.add(MessageIDConst.ID_S2C_RegressionUpdate, handler(this, this._s2cUpdateReturnData));
    }
    clear() {
        this._recvGetReturnData.remove();
        this._recvGetReturnData = null;
        this._recvBuyDiscountData.remove();
        this._recvBuyDiscountData = null;
        this._recvLevelDirectUp.remove();
        this._recvLevelDirectUp = null;
        this._recvAwardsInfo.remove();
        this._recvAwardsInfo = null;
        this._recvUpdateData.remove();
        this._recvUpdateData = null;
    }
    needShowRedPoint() {
        var canGetDailyReward = this.canGetDailyActivityReward();
        var canGetDiscountReward = this.canGetDiscountReward();
        var canGetGiftReward = this.canGetGiftReward();
        return canGetDailyReward || canGetDiscountReward || canGetGiftReward;
    }
    getDailyActivityInfo() {
        var info = [];
        for (var k in this._dailyActivityCompleteInfo) {
            var v = this._dailyActivityCompleteInfo[k];
            for (var kk in this._dailyActivityAwardStatus) {
                var vv = this._dailyActivityAwardStatus[kk];
                if (v.id == vv.id) {
                    table.insert(info, {
                        id: v.id,
                        num: v.num,
                        status: vv.num
                    });
                }
            }
        }
        var sortFunc = function (a, b) {
            var ACanGet = 0;
            if (a.status == 0) {
                var configInfo = G_ConfigLoader.getConfig(ConfigNameConst.RETURN_ACTIVITY).get(a.id);
                var maxTimes = configInfo.mission_time;
                if (a.num >= maxTimes) {
                    ACanGet = 1;
                }
            }
            var BCanGet = 0;
            if (b.status == 0) {
                var configInfo = G_ConfigLoader.getConfig(ConfigNameConst.RETURN_ACTIVITY).get(b.id);
                var maxTimes = configInfo.mission_time;
                if (b.num >= maxTimes) {
                    BCanGet = 1;
                }
            }
            if (ACanGet != BCanGet) {
                return BCanGet - ACanGet;
            }
            if (a.status != b.status) {
                if (a.status == 1) {
                    return 1;
                }
                if (b.status == 1) {
                    return -1;
                }
            }
            return a.id - b.id;
        };
        info.sort(sortFunc);
        return info;
    }
    canGetDailyActivityReward() {
        var canGet = false;
        var dailyActivityInfo = this.getDailyActivityInfo();
        for (var k in dailyActivityInfo) {
            var v = dailyActivityInfo[k];
            var configInfo = G_ConfigLoader.getConfig(ConfigNameConst.RETURN_ACTIVITY).get(v.id);
            if (v.status == 0 && v.num >= configInfo.mission_time) {
                canGet = true;
                break;
            }
        }
        return canGet;
    }
    getPrivilegeInfo() {
        this._privilegeUsedInfo.sort(function (a, b) {
            return a.id - b.id;
        });
        return this._privilegeUsedInfo;
    }
    canGetDiscountReward() {
        var canGet = false;
        for (var k in this._discountActivityCompleteInfo) {
            var v = this._discountActivityCompleteInfo[k];
            var configInfo = G_ConfigLoader.getConfig(ConfigNameConst.RETURN_DISCOUNT).get(v.id);
            if (configInfo.reward_type == 2) {
                if (this._recharge >= configInfo.price && v.num == 1) {
                    canGet = true;
                    break;
                }
            }
        }
        return canGet;
    }
    getDiscountInfo() {
        var discountInfo = [];
        var showRechargeInfo = null;
        for (var k in this._discountActivityCompleteInfo) {
            var v = this._discountActivityCompleteInfo[k];
            var configInfo = G_ConfigLoader.getConfig(ConfigNameConst.RETURN_DISCOUNT).get(v.id);
            if (configInfo.reward_type == 2) {
                if (this._recharge >= configInfo.show_money) {
                    table.insert(discountInfo, v);
                }
            } else {
                table.insert(discountInfo, v);
            }
        }
        var sortFunc = function (a, b) {
            if (a.num != b.num) {
                if (a.num == 0) {
                    return 1;
                }
                if (b.num == 0) {
                    return -1;
                }
            }
            return a.id - b.id;
        };
        discountInfo.sort(sortFunc);
        return discountInfo;
    }
    canGetGiftReward() {
        var canGet = false;
        for (var k in this._giftActivityCompleteInfo) {
            var v = this._giftActivityCompleteInfo[k];
            if (v.num > 0) {
                canGet = true;
                break;
            }
        }
        return canGet;
    }
    getGiftsInfo() {
        var sortFunc = function (a, b) {
            if (a.num != b.num) {
                if (a.num == 0) {
                    return false;
                }
                if (b.num == 0) {
                    return true;
                }
            }
            return a.id < b.id;
        };
        ArraySort(this._giftActivityCompleteInfo, sortFunc);
        return this._giftActivityCompleteInfo;
    }
    getEndTime() {
        return this._end_time;
    }
    getIsEmergency() {
        return this._emergency;
    }
    getRechargeNum() {
        return this._recharge;
    }
    getDirectLevelPayId() {
        return this._pay_id;
    }
    getDirectLevelNum() {
        return this._level;
    }
    isActivityEnd() {
        return G_ServerTime.getTime() > this._end_time;
    }
    getPrivilegeRestTimes(type) {
        var isRegression = G_UserData.getBase().isIs_regression();
        if (isRegression == false) {
            return 0;
        }
        var times = 0;
        for (var k in this._privilegeUsedInfo) {
            var v = this._privilegeUsedInfo[k];
            var configInfo = G_ConfigLoader.getConfig(ConfigNameConst.RETURN_PRIVILEGE).get(v.id);
            if (configInfo.privilege_type == type) {
                times = v.num;
                break;
            }
        }
        return times;
    }
    getTowerResetTimes() {
        var isRegression = G_UserData.getBase().isIs_regression();
        if (isRegression == false) {
            return 0;
        }
        var times = 0;
        for (var k in this._privilegeUsedInfo) {
            var v = this._privilegeUsedInfo[k];
            var configInfo = G_ConfigLoader.getConfig(ConfigNameConst.RETURN_PRIVILEGE).get(v.id);
            if (configInfo.privilege_type == ReturnConst.PRIVILEGE_TOWER) {
                times = v.num;
                break;
            }
        }
        return times;
    }
    getDailyChallengeResetTimes() {
        var isRegression = G_UserData.getBase().isIs_regression();
        if (isRegression == false) {
            return 0;
        }
        var times = 0;
        for (var k in this._privilegeUsedInfo) {
            var v = this._privilegeUsedInfo[k];
            var configInfo = G_ConfigLoader.getConfig(ConfigNameConst.RETURN_PRIVILEGE).get(v.id);
            if (configInfo.privilege_type == ReturnConst.PRIVILEGE_DAILY_CHALLANGE) {
                times = v.num;
                break;
            }
        }
        return times;
    }
    c2sGetReturnInfo() {
        var message = {};
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetRegression, message);
    }
    _s2cGetReturnInfo(id, message) {
        if (message.ret != 1) {
            return;
        }
        this._dailyActivityCompleteInfo = message['activities'] || {};
        this._dailyActivityAwardStatus = message['activities_rewarded'] || {};
        this._discountActivityCompleteInfo = message['discount'] || {};
        this._giftActivityCompleteInfo = message['gifts'] || [];
        this._privilegeUsedInfo = message['privilege'] || [];
        this._end_time = message['end_time'] || 0;
        if (message['emergency']) {
            this._emergency = message['emergency'];
        } else {
            this._emergency = true;
        }
        this._recharge = message['recharge'] || 0;
        this._pay_id = message['pay_id'] || 0;
        this._level = message['level'] || 0;
        G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_RETURN);
        G_UserData.getRedPoint().resetRedPointTableByIndex(26);
        G_SignalManager.dispatch(SignalConst.EVENT_RETURN_ACTIVITY_INFO);
    }
    _s2cGetBuyDiscountInfo(id, message) {
        if (message.ret != 1) {
            return;
        }
        var awards = message['awards'] || [];
        var state = message['state'] || {};
        for (var k in this._discountActivityCompleteInfo) {
            var v = this._discountActivityCompleteInfo[k];
            if (v.id == state.id) {
                v.num = state.num;
                break;
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_RETURN_SHOW_REWARD, awards);
    }
    c2sLevelDirectUp() {
        var message = {};
        G_NetworkManager.send(MessageIDConst.ID_C2S_LevelDirect, message);
    }
    _s2cLevelDirectUp(id, message) {
        if (message.ret != 1) {
            return;
        }
        this._pay_id = message['pay_id'] || 0;
        this._level = message['level'] || 0;
        G_SignalManager.dispatch(SignalConst.EVENT_RETURN_LEVEL_DIRECT_UP);
    }
    c2sReceiveAwards(receiveType, activityId, rewardIndex) {
        var message = {
            receive_type: receiveType,
            id: activityId,
            index: rewardIndex || 0
        };
        G_NetworkManager.send(MessageIDConst.ID_C2S_ReceiveAwards, message);
    }
    _s2cUpdateReturnData(id, message) {
        var privilegeInfo = message['privilege'];
        if (privilegeInfo) {
            for (var k in this._privilegeUsedInfo) {
                var v = this._privilegeUsedInfo[k];
                if (v.id == privilegeInfo.id) {
                    v.num = privilegeInfo.num;
                    break;
                }
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_RETURN_UPDATE);
    }
    _s2cReceiveAwards(id, message) {
        if (message.ret != 1) {
            return;
        }
        var awards = message['awards'] || [];
        var state = message['state'] || {};
        var receive_type = message['receive_type'] || -1;
        var id = message['id'] || -1;
        function setRewardInfo(key, value) {
        }
        if (receive_type == 0) {
            for (var k in this._dailyActivityAwardStatus) {
                var v = this._dailyActivityAwardStatus[k];
                if (v.id == state.id) {
                    v.num = state.num;
                    break;
                }
            }
        } else if (receive_type == 1) {
            for (k in this._giftActivityCompleteInfo) {
                var v = this._giftActivityCompleteInfo[k];
                if (v.id == state.id) {
                    v.num = state.num;
                    break;
                }
            }
        } else if (receive_type == 2) {
            for (k in this._privilegeUsedInfo) {
                var v = this._privilegeUsedInfo[k];
                if (v.id == state.id) {
                    v.num = state.num;
                    break;
                }
            }
            var configInfo = G_ConfigLoader.getConfig(ConfigNameConst.RETURN_PRIVILEGE).get(state.id);
            if (configInfo.privilege_type == 1 || configInfo.privilege_type == 2) {
                G_SignalManager.dispatch(SignalConst.EVENT_RETURN_RESET_TIMES);
            }
        } else if (receive_type == 3) {
            for (k in this._discountActivityCompleteInfo) {
                var v = this._discountActivityCompleteInfo[k];
                if (v.id == state.id) {
                    v.num = state.num;
                    break;
                }
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_RETURN_SHOW_REWARD, awards);
    }
}