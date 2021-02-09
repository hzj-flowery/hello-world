import { BaseData } from './BaseData';
import { G_NetworkManager, G_SignalManager, G_ConfigLoader, G_UserData } from '../init';
import { MessageIDConst } from '../const/MessageIDConst';
import { Slot } from '../utils/event/Slot';
import { ConfigNameConst } from '../const/ConfigNameConst';
import { BaseConfig } from '../config/BaseConfig';
import { SignalConst } from '../const/SignalConst';
import { MessageErrorConst } from '../const/MessageErrorConst';
import { FunctionConst } from '../const/FunctionConst';
import { ArraySort } from '../utils/handler';

const ACHI_SERVER_PREV = 'achi_server_';
const ACHI_CONFIG_PREV = 'achi_config_';
const ACHI_TYPE_PREV = 'achi_type_';

export interface AchievementData {
}
export class AchievementData extends BaseData {
    public static TARGET_TYPE = 1;
    public static GAME_TYPE = 2;
    public static FIRST_MEET_TYPE = 3;

    public _getAchievementInfo: Slot;
    public _updateAchievementInfo: Slot;
    public _getAchievementReward: Slot;

    public _achiServerData;
    public _achiListData;
    public _achiCfgData;
    public _dataIsDirty = false;

    private AchievementInfo: BaseConfig;

    public c2sGetAchievementInfo() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetAchievementInfo, {});
    }

    public c2sGetAchievementReward(achId) {
        if (this.isExpired() == true) {
            this.c2sGetAchievementInfo();
            return;
        }
        if (achId) {
            let message = { id: achId };
            G_NetworkManager.send(MessageIDConst.ID_C2S_GetAchievementReward, message);
        }
    }
    constructor() {
        super();
        this._initData();
        this._getAchievementInfo = G_NetworkManager.add(MessageIDConst.ID_S2C_GetAchievementInfo, this._s2cGetAchievementInfo.bind(this));
        this._updateAchievementInfo = G_NetworkManager.add(MessageIDConst.ID_S2C_UpdateAchievementInfo, this._s2cUpdateAchievementInfo.bind(this));
        this._getAchievementReward = G_NetworkManager.add(MessageIDConst.ID_S2C_GetAchievementReward, this._s2cGetAchievementReward.bind(this));
        this.AchievementInfo = G_ConfigLoader.getConfig(ConfigNameConst.ACHIEVEMENT);
    }
    public clear() {
        this._getAchievementInfo.remove();
        this._getAchievementInfo = null;
        this._updateAchievementInfo.remove();
        this._updateAchievementInfo = null;
        this._getAchievementReward.remove();
        this._getAchievementReward = null;
    }
    public reset() {
    }
    public _initData() {
        this._achiServerData = {};
        this._achiListData = {};
        this._achiCfgData = {};
        this._dataIsDirty = false;
    }
    public _s2cUpdateAchievementInfo(id, message) {
        this._updateAchievementData(message);
        this._setDataIsDirty(true);
        G_SignalManager.dispatch(SignalConst.EVENT_GET_ACHIEVEMENT_UPDATE, message);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_ACHIEVEMENT);
    }
    public _s2cGetAchievementReward(id, message) {
        this._setDataIsDirty(true);
        if (message.ret == MessageErrorConst.RET_OK) {
            G_SignalManager.dispatch(SignalConst.EVENT_GET_ACHIEVEMENT_AWARD, message);
            G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_ACHIEVEMENT);
        }
    }
    public _s2cGetAchievementInfo(id, message) {
        if (message.ret != 1) {
            return;
        }
        this.resetTime();
        this._setAchievementData(message);
        this._setDataIsDirty(true);
        G_SignalManager.dispatch(SignalConst.EVENT_GET_ACHIEVEMENT_INFO, message);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_ACHIEVEMENT);
    }
    public _setAchievementData(datas) {
        if (typeof datas != 'object') {
            return;
        }
        this._initData();
        let achs = datas.achs || {};
        for (let i = 0; i < achs.length; i++) {
            this._setOneAchievementData(achs[i]);
        }
    }
    public _getConfigData(type, value) {
        function condition(info) {
            if (info.type == type && info.value == value) {
                return info;
            }
        }
        let values = [];
        for (let i = 0; i < this.AchievementInfo.length(); i++) {
            let info = this.AchievementInfo.indexOf(i);
            if (condition(info)) {
                values[values.length] = info;
            }
        }
        return values;
    }
    public _setOneAchievementData(data) {
        if (!data || typeof data != 'object') {
            return;
        }
        let achi = {
            type: data.type,
            value: data.value,
        };
        if (data.hasOwnProperty('reward_ids')) {
            achi['reward_ids'] = data.reward_ids;
        } else {
            achi['reward_ids'] = {};
        }
        this._achiServerData[ACHI_SERVER_PREV + data.type] = achi;
    }
    public _updateAchievementData(datas) {
        if (typeof datas != 'object') {
            return;
        }
        let achs = datas.achs || [];
        for (let i = 0; i < achs.length; i++) {
            let achiData = achs[i];
            this._setOneAchievementData(achiData);
            let achiType = achiData.type;
            for (let j = 1; j <= AchievementData.FIRST_MEET_TYPE; j++) {
                if (this._achiListData[j] && this._achiListData[j][ACHI_TYPE_PREV + achiType]) {
                    let hasGetReward = this._hasGetAward(achiType, this._achiListData[j][ACHI_TYPE_PREV + achiType].cfgData.id);
                    this._achiListData[j][ACHI_TYPE_PREV + achiType].serverData.now_value = achiData.value;
                    this._achiListData[j][ACHI_TYPE_PREV + achiType].serverData.getAward = hasGetReward;
                }
            }
        }
        achs = null;
    }
    public _setDataIsDirty(isDirty) {
        this._dataIsDirty = isDirty || false;
    }
    public getAchievementListData(tabIndex, needSort?) {
        if (needSort == null) {
            needSort = true;
        }
        if (this._dataIsDirty || this._achiListData[tabIndex] == null) {
            this._achiListData[tabIndex] = this._getAchievementData(tabIndex);
            this._dataIsDirty = false;
        }
        let list = [];
        for (let k in this._achiListData[tabIndex]) {
            let v = this._achiListData[tabIndex][k];
            list.push(v);
        }
        if (needSort == true) {
            this._sortAchievements(list);
        }
        return list;
    }
    public getNewAward() {
        if (this.hasAnyAwardCanGet(AchievementData.TARGET_TYPE) > 0) {
            return true;
        }
        if (this.hasAnyAwardCanGet(AchievementData.GAME_TYPE) > 0) {
            return true;
        }
        if (this.hasAnyAwardCanGet(AchievementData.FIRST_MEET_TYPE) > 0) {
            return true;
        }
        return false;
    }
    public hasAnyAwardCanGet(achiType) {
        let canGetAwardNum = 0;
        let achiList = this.getAchievementListData(achiType, false);
        if (!achiList) {
            return canGetAwardNum;
        }
        for (let k in achiList) {
            let v = achiList[k];
            let nowValue = Number(v.serverData['now_value']);
            let maxValue = Number(v.serverData['max_value']);
            if (!v.serverData.getAward && nowValue >= maxValue) {
                canGetAwardNum = canGetAwardNum + 1;
                break;
            }
        }
        return canGetAwardNum;
    }
    public _getAchievementProgress(achieveInfo) {
        console.assert(typeof achieveInfo == 'object', '_getAchievementProgress achieveInfo error');
        let nowValue = 0;
        let maxValue = 0;
        maxValue = achieveInfo.require_value;
        let achiData = this._achiServerData[ACHI_SERVER_PREV + achieveInfo.require_type];
        if (achiData) {
            nowValue = achiData.value;
        }
        return [
            nowValue,
            maxValue
        ];
    }
    public _getAchievementConfigData(tabIndex) {
        tabIndex = tabIndex || 1;
        if (typeof this._achiCfgData[tabIndex] == 'object' && Object.keys(this._achiCfgData[tabIndex]).length > 0) {
            return this._achiCfgData[tabIndex];
        }
        this._achiCfgData[tabIndex] = {};
        let procCfgData = function (tabIndex, record) {
            if (tabIndex == 1) {
                let FunctionLevelInfo = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL);
                let funcInfo = FunctionLevelInfo.get(record.level);
                if (funcInfo && funcInfo.level <= G_UserData.getBase().getLevel()) {
                    this._achiCfgData[tabIndex][ACHI_CONFIG_PREV + record.id] = record;
                }
            }
            if (tabIndex == 2) {
                this._achiCfgData[tabIndex][ACHI_CONFIG_PREV + record.id] = record;
            }
            if (tabIndex == AchievementData.FIRST_MEET_TYPE) {
                this._achiCfgData[tabIndex][ACHI_CONFIG_PREV + record.id] = record;
            }
        }.bind(this);
        for (let loopi = 0; loopi < this.AchievementInfo.length(); loopi++) {
            let record = this.AchievementInfo.indexOf(loopi);
            if (record.tab == tabIndex) {
                procCfgData(tabIndex, record);
            }
        }
        return this._achiCfgData[tabIndex];
    }
    public _getAchievementData(tabIndex) {
        let isLastOneInThisType = function(aType, id) {
            let achievement = this.AchievementInfo.get(id + 1);
            if (!achievement) {
                return true;
            } else {
                if (achievement) {
                    return achievement.require_type != aType;
                }
            }
            return false;
        }.bind(this);
        let configDatas = this._getAchievementConfigData(tabIndex);
        let achiList = {};
        for (let k in configDatas) {
            let cfgData = configDatas[k];
            let info = cfgData;
            let needShow = false;
            let curGetAward = false;
            if (info.pre_id == 0) {
                curGetAward = this._hasGetAward(info.require_type, info.id);
                if (!curGetAward || isLastOneInThisType(info.require_type, info.id)) {
                    needShow = true;
                }
            } else {
                let perAchievement = this.AchievementInfo.get(info.pre_id);
                let preGetAward = this._hasGetAward(perAchievement.require_type, info.pre_id);
                curGetAward = this._hasGetAward(info.require_type, info.id);
                if (preGetAward && (!curGetAward || isLastOneInThisType(info.require_type, info.id))) {
                    needShow = true;
                }
            }
            if (needShow) {
                let [nowValue, maxValue] = this._getAchievementProgress(info);
                let achieveName = info['content'];
                let textDesc = achieveName;
                if (achieveName.indexOf('d') > -1) {
                    textDesc = achieveName.format(info['require_value']);
                }
                achiList[ACHI_TYPE_PREV + info.require_type] = {
                    cfgData: info,
                    desc: textDesc,
                    serverData: {
                        max_value: maxValue,
                        now_value: nowValue,
                        getAward: curGetAward,
                        type: info.require_type
                    }
                };
            }
        }
        return achiList;
    }
    public _hasGetAward(aType, id) {
        let achiData = this._achiServerData[ACHI_SERVER_PREV + aType];
        if (achiData && achiData['reward_ids']) {
            for (let i = 0; i < achiData.reward_ids.length; i++) {
                if (achiData.reward_ids[i] == id) {
                    return true;
                }
            }
        }
        return false;
    }
    public _sortAchievements(achiList) {
        if (typeof achiList != 'object') {
            return;
        }
        ArraySort(achiList, function (a, b) {
            let canGetAward_a = a.serverData.now_value >= a.serverData.max_value && !a.serverData.getAward;
            let canGetAward_b = b.serverData.now_value >= b.serverData.max_value && !b.serverData.getAward;
            if (a.serverData.getAward != b.serverData.getAward) {
                return !a.serverData.getAward;
            } else if (canGetAward_a != canGetAward_b) {
                return canGetAward_a;
            } else if (a.cfgData.order != b.cfgData.order) {
                return a.cfgData.order < b.cfgData.order;
            } else {
                return a.cfgData.id < b.cfgData.id;
            }
        })
    }
    public isShopRequiredReach(requireId) {
        //     let bool = false;
        //     let currValue = 0, requireValue = 0;
        //     if (!requireId || requireId == 0) {
        //         return [
        //             true,
        //             currValue,
        //             requireValue
        //         ];
        //     }
        //     //没有require config
        //     let requrieInfo = RequirementInfo.get(requireId);
        //     console.assert(requrieInfo, 'requirement_info can\'t find requireId =' + requireId);
        //     let achiData = this._achiServerData[ACHI_SERVER_PREV + requrieInfo.type];
        //     let serverValue = 0;
        //     if (achiData) {
        //         if (requrieInfo.is_discrete == 0) {
        //             serverValue = achiData.values[1];
        //             if (requrieInfo.count_type == 0) {
        //                 bool = serverValue == requrieInfo.value;
        //             } else if (requrieInfo.count_type == 1) {
        //                 bool = serverValue >= requrieInfo.value;
        //             } else {
        //                 bool = serverValue <= requrieInfo.value;
        //             }
        //         } else {
        //             serverValue = achiData.values;
        //             for (let i = 0; i < serverValue.length; i++) {
        //                 let subServerValue = serverValue[i];
        //                 if (subServerValue == requrieInfo.value) {
        //                     bool = true;
        //                     break;
        //                 }
        //             }
        //         }
        //     }
        //     currValue = serverValue;
        //     requireValue = requrieInfo.value;
        //     return [
        //         bool,
        //         currValue,
        //         requireValue
        //     ];
    }
}