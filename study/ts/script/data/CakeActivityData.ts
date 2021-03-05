import { BaseData } from './BaseData';
import { G_ConfigLoader, G_NetworkManager, G_UserData, G_ServerTime, G_SignalManager } from '../init';
import { ConfigNameConst } from '../const/ConfigNameConst';
import { MessageIDConst } from '../const/MessageIDConst';
import { CakeTaskData } from './CakeTaskData';
import { ArraySort } from '../utils/handler';
import { CakeActivityNoticeData } from './CakeActivityNoticeData';
import { CakeActivityConst } from '../const/CakeActivityConst';
import { FunctionConst } from '../const/FunctionConst';
import { ShopActiveDataHelper } from '../utils/data/ShopActiveDataHelper';
import { CakeActivityDataHelper } from '../utils/data/CakeActivityDataHelper';
import { UserDataHelper } from '../utils/data/UserDataHelper';
import { TypeConvertHelper } from '../utils/TypeConvertHelper';
import { TimeConst } from '../const/TimeConst';
import { SignalConst } from '../const/SignalConst';
import { MessageErrorConst } from '../const/MessageErrorConst';
import { GuildCakeData } from './GuildCakeData';
import { CakeActivityGuildRankData } from './CakeActivityGuildRankData';
import { CakeActivityUserRankData } from './CakeActivityUserRankData';
import { ShopConst } from '../const/ShopConst';
import { assert } from '../utils/GlobleFunc';
import { stringUtil } from '../utils/StringUtil';
let schema = {};
schema['batchId'] = [
    'number',
    0
];
schema['activityStartTime'] = [
    'number',
    0
];
schema['actType'] = [
    'number',
    0
];
export interface CakeActivityData {
    getBatchId(): number
    setBatchId(value: number): void
    getLastBatchId(): number
    getActivityStartTime(): number
    setActivityStartTime(value: number): void
    getLastActivityStartTime(): number
    getActType():number
    setActType(value:number):void

}
export class CakeActivityData extends BaseData {
    public static schema = schema;

    public _rankMap;
    public _taskMap;
    public _taskDatas;
    public _cakeDataList;
    public _upRewards;
    public _loginRewards;
    public _guildRankDatas;
    public _userRankDatas;
    public _selfGuildRank;
    public _selfUserRank;
    public _noticeDatas;
    public _selfPoint;
    public _selectCakeIndex;
    public _recvGetCakeActivityTaskReward;
    public _recvEnterCakeActivity;
    public _recvUpdateCakeTaskInfo;
    public _recvAddGuildCakeExp;
    public _recvUpdateGuildCakeInfo;
    public _recvUpdateRankCakeAndNotice;
    public _recvGetCakeActivityStatus;
    public _recvGetGuildCakeUpLvReward;
    public _recvUpdateGuildCakeLvUpReward;
    public _recvCakeRechrageReward;
    public _recvGetGuildCakeLoginReward;
    private _recvExchargeReward;

    constructor(properties?) {
        super(properties)
        this._taskDatas = {};
        this._cakeDataList = {};
        this._upRewards = {};
        this._loginRewards = {};
        this._guildRankDatas = [];
        this._userRankDatas = [];
        this._selfGuildRank = null;
        this._selfUserRank = null;
        this._noticeDatas = [];
        this._selfPoint = 0;
        this._selectCakeIndex = 0;
        this._recvGetCakeActivityTaskReward = G_NetworkManager.add(MessageIDConst.ID_S2C_GetCakeActivityTaskReward, this._s2cGetCakeActivityTaskReward.bind(this));
        this._recvEnterCakeActivity = G_NetworkManager.add(MessageIDConst.ID_S2C_EnterCakeActivity, this._s2cEnterCakeActivity.bind(this));
        this._recvUpdateCakeTaskInfo = G_NetworkManager.add(MessageIDConst.ID_S2C_UpdateCakeTaskInfo, this._s2cUpdateCakeTaskInfo.bind(this));
        this._recvAddGuildCakeExp = G_NetworkManager.add(MessageIDConst.ID_S2C_AddGuildCakeExp, this._s2cAddGuildCakeExp.bind(this));
        this._recvUpdateGuildCakeInfo = G_NetworkManager.add(MessageIDConst.ID_S2C_UpdateGuildCakeInfo, this._s2cUpdateGuildCakeInfo.bind(this));
        this._recvUpdateRankCakeAndNotice = G_NetworkManager.add(MessageIDConst.ID_S2C_UpdateRankCakeAndNotice, this._s2cUpdateRankCakeAndNotice.bind(this));
        this._recvGetCakeActivityStatus = G_NetworkManager.add(MessageIDConst.ID_S2C_GetCakeActivityStatus, this._s2cGetCakeActivityStatus.bind(this));
        this._recvGetGuildCakeUpLvReward = G_NetworkManager.add(MessageIDConst.ID_S2C_GetGuildCakeUpLvReward, this._s2cGetGuildCakeUpLvReward.bind(this));
        this._recvUpdateGuildCakeLvUpReward = G_NetworkManager.add(MessageIDConst.ID_S2C_UpdateGuildCakeLvUpReward, this._s2cUpdateGuildCakeLvUpReward.bind(this));
        this._recvCakeRechrageReward = G_NetworkManager.add(MessageIDConst.ID_S2C_CakeRechrageReward, this._s2cCakeRechrageReward.bind(this));
        this._recvGetGuildCakeLoginReward = G_NetworkManager.add(MessageIDConst.ID_S2C_GetGuildCakeLoginReward, this._s2cGetGuildCakeLoginReward.bind(this));
        this._recvExchargeReward = G_NetworkManager.add(MessageIDConst.ID_S2C_ExchargeReward, this._s2cExchargeReward.bind(this));
        this._initTaskMap();
        this._initRankMap();
    }
    public reset() {
        this._taskDatas = {};
        this._cakeDataList = {};
        this._upRewards = {};
        this._loginRewards = {};
        this._guildRankDatas = [];
        this._userRankDatas = [];
        this._selfGuildRank = null;
        this._selfUserRank = null;
        this._noticeDatas = [];
        this._selfPoint = 0;
        this._selectCakeIndex = 0;
    }
    public clear() {
        this._recvGetCakeActivityTaskReward.remove();
        this._recvGetCakeActivityTaskReward = null;
        this._recvEnterCakeActivity.remove();
        this._recvEnterCakeActivity = null;
        this._recvUpdateCakeTaskInfo.remove();
        this._recvUpdateCakeTaskInfo = null;
        this._recvAddGuildCakeExp.remove();
        this._recvAddGuildCakeExp = null;
        this._recvUpdateGuildCakeInfo.remove();
        this._recvUpdateGuildCakeInfo = null;
        this._recvUpdateRankCakeAndNotice.remove();
        this._recvUpdateRankCakeAndNotice = null;
        this._recvGetCakeActivityStatus.remove();
        this._recvGetCakeActivityStatus = null;
        this._recvGetGuildCakeUpLvReward.remove();
        this._recvGetGuildCakeUpLvReward = null;
        this._recvUpdateGuildCakeLvUpReward.remove();
        this._recvUpdateGuildCakeLvUpReward = null;
        this._recvCakeRechrageReward.remove();
        this._recvCakeRechrageReward = null;
        this._recvGetGuildCakeLoginReward.remove();
        this._recvGetGuildCakeLoginReward = null;
        this._recvExchargeReward.remove();
        this._recvExchargeReward = null;
    }
    public _initTaskMap() {
        this._taskMap = {};
        this._taskDatas = {};
        let Config = G_ConfigLoader.getConfig(ConfigNameConst.CAKE_TASK);
        let len = Config.length();
        for (let i = 0; i < len; i++) {
            let info = Config.indexOf(i);
            let type = info.type;
            let id = info.id;
            if (this._taskMap[type] == null) {
                this._taskMap[type] = [];
            }
            this._taskMap[type].push(info);
            if (this._taskDatas[type] == null) {
                this._taskDatas[type] = new CakeTaskData({ type: type });
            }
        }
        for (let type in this._taskMap) {
            let list = this._taskMap[type];
            ArraySort(list, function (a, b) {
                return a.times < b.times;
            });
        }
    }
    private _initRankMap() {
        this._rankMap = {};
        var Config =  G_ConfigLoader.getConfig(ConfigNameConst.CAKE_RANK);
        var len = Config.length();
        for (var i = 0; i < len; i++) {
            var info = Config.indexOf(i);
            var actType = info.cake_type;
            var batch = info.batch;
            var type = info.type;
            if (this._rankMap[actType] == null) {
                this._rankMap[actType] = {};
            }
            if (this._rankMap[actType][batch] == null) {
                this._rankMap[actType][batch] = {};
            }
            if (this._rankMap[actType][batch][type] == null) {
                this._rankMap[actType][batch][type] = [];
            }
            this._rankMap[actType][batch][type].push(info);
        }
    }
    public getRankInfo(batch, type) {
        var actType = this.getActType();
        var info = this._rankMap[actType][batch][type];
        console.assert(info, 'cake_rank config can not batch = %d type = %d');
        return info;
    }
    public createFakeNoticeData(data) {
        data.fake = true;
        let noticeData = new CakeActivityNoticeData();
        noticeData.updateData(data);
        return noticeData;
    }
    public getTaskInfoWithType(type) {
        let info = this._taskMap[type];
        console.assert(info, 'cake_task config can not find type = %d');
        return info;
    }
    public getTaskDataWithType(type) {
        let data = this._taskDatas[type];
        console.assert(data, 'CakeActivityData:_initTaskMap not init type = %d');
        return data;
    }
    public getTaskList() {
        let sortFunc = function (a, b):number {
            if (a.isFinish() != b.isFinish()) {
                return a.isFinish() == false?1:-1;
            } else if (a.isCanReceive() != b.isCanReceive()) {
                return a.isCanReceive() == true?-1:1;
            } else {
                return a.getType() - b.getType();
            }
        };
        let result:any[] = [];
        for (let type in this._taskDatas) {
            let data = this._taskDatas[type];
            result.push(data);
        }
        result.sort(sortFunc);
        return result;
    }
    public  getChargeList() {
        var result = [];
        var actType = this.getActType();
        var Config = G_ConfigLoader.getConfig(ConfigNameConst.CAKE_CHARGE);
        var len = Config.length();
        for (var i = 0; i < len; i++) {
            var info = Config.indexOf(i);
            if (info.type == actType) {
                result.push(info.id);
            }
        }
        return result;
    }
    public getCakeDataList() {
        let result = [];
        for (let k in this._cakeDataList) {
            let data = this._cakeDataList[k];
            result.push(data);
        }
        ArraySort(result, function (a, b) {
            return a.getGuild_noraml_end_rank() < b.getGuild_noraml_end_rank();
        });
        return result;
    }
    public getCakeDataWithId(id) {
        return this._cakeDataList[id];
    }
    public getUpRewards() {
        let result = [];
        for (let rewardId in this._upRewards) {
            let data = this._upRewards[rewardId];
            result.push(data);
        }
        ArraySort(result, function (a, b) {
            return a.rewardId < b.rewardId;
        });
        return result;
    }
    public getUpRewardWithId(id) {
        return this._upRewards[id];
    }
    public getLoginRewards() {
        var result = [];
        var maxDay = CakeActivityDataHelper.getDailyAwardMaxDay();
        for (let day in this._loginRewards) {
            var data = this._loginRewards[day];
            if (parseInt(day) <= maxDay) {
                result.push(data);
            }
        }
        return result;
    }
    public getLoginRewardWithDay(day) {
        return this._loginRewards[day];
    }
    public getGuildRankList() {
        return this._guildRankDatas;
    }
    public getGuildRankWithId(id) {
        for (let i in this._guildRankDatas) {
            let data = this._guildRankDatas[i];
            if (data.getGuild_id() == id) {
                return data;
            }
        }
        return null;
    }
    public getUserRankList() {
        return this._userRankDatas;
    }
    public getUserRankWithId(id) {
        for (let i in this._userRankDatas) {
            let data = this._userRankDatas[i];
            if (data.getUser_id() == id) {
                return data;
            }
        }
        return null;
    }
    public getSelfGuildRank() {
        return this._selfGuildRank;
    }
    public getSelfUserRank() {
        return this._selfUserRank;
    }
    public getNoticeDatas() {
        return this._noticeDatas;
    }
    public getNoticeDataWithIndex(index) {
        return this._noticeDatas[index];
    }
    public addNoticeData(data) {
        this._noticeDatas.push(data);
    }
    public removeNoticeBeyond() {
        let maxCount = CakeActivityConst.INFO_LIST_MAX_COUNT;
        let tempDatas = [];
        let maxIndex = this._noticeDatas.length;
        for (let i = 0; i < maxCount; i++) {
            let data = this._noticeDatas[maxIndex - maxCount + i];
            if (data) {
                tempDatas.push(data);
            }
        }
        this._noticeDatas = tempDatas;
    }
    public getSelfPoint() {
        return this._selfPoint;
    }
    public _checkIsSelfNotice(data) {
        let strUId = data.getContentDesWithKey('uid');
        if (strUId != '' && Number(strUId) == G_UserData.getBase().getId()) {
            return true;
        }
        return false;
    }
    public _checkIsBulletNotice(data) {
        if (data.getNotice_id() == CakeActivityConst.NOTICE_TYPE_COMMON) {
            return true;
        } else {
            return false;
        }
    }
    public setSelectCakeIndex(index) {
        this._selectCakeIndex = index;
    }
    public getMyGuildCakeIndex() {
        let index = 0;
        let myGuildId = G_UserData.getGuild().getMyGuildId();
        let cakeDataList = this.getCakeDataList();
        for (let i = 0; i < cakeDataList.length; i++) {
            let data = cakeDataList[i];
            if (myGuildId == data.getGuild_id()) {
                index = i+1;
                break;
            }
        }
        return index;
    }
    public getSelectCakeIndex() {
        if (this._selectCakeIndex == 0) {
            this._selectCakeIndex = this.getMyGuildCakeIndex()-1;
        }
        if(this._selectCakeIndex<0)
        this._selectCakeIndex = 0;
        return this._selectCakeIndex;
    }
    public isShowShopRedPoint() {
        let tabNameList = ShopActiveDataHelper.getShopSubTab(ShopConst.CAKE_ACTIVE_SHOP);
        for (let i = 0; i < tabNameList.length; i++) {
            let isShow = this.isShowShopRedPointWithIndex(i);
            if (isShow) {
                return true;
            }
        }
        return false;
    }
    public isShowShopRedPointWithIndex(index) {
        let showed = G_UserData.getRedPoint().isTodayShowedRedPointByFuncId(FunctionConst.FUNC_CAKE_ACTIVITY_SHOP, { index: index });
        if (showed) {
            return false;
        }
        let startTime = this.getActivityStartTime();
        let curBatch = this.getBatchId();
        let goodIds = G_UserData.getShopActive().getGoodIdsWithShopAndTabIdBySort(ShopConst.CAKE_ACTIVE_SHOP, index, curBatch);
        for (let j in goodIds) {
            let goodId = goodIds[j];
            let data = G_UserData.getShopActive().getUnitDataWithId(goodId);
            if (data.getConfig().limit_type == 1) {
                let targetTime = startTime + data.getConfig().limit_value;
                if (G_ServerTime.getTime() >= targetTime) {
                    return true;
                }
            }
        }
        return false;
    }
    public isHaveCanGetMaterial() {
        if (this.getActType() == 0) {
            return false;
        }
        var taskList = this.getTaskList();
        for (let i in taskList) {
            var data = taskList[i];
            var id = data.getCurShowId();
            var info = CakeActivityDataHelper.getCurCakeTaskConfig(id);
            if (data.isFinish() == false && data.getValue() >= info.times) {
                return true;
            }
        }
        return false;
    }
    public isPromptRecharge() {
        let showed = G_UserData.getRedPoint().isTodayShowedRedPointByFuncId(FunctionConst.FUNC_CAKE_ACTIVITY_GET_MATERIAL, { index: CakeActivityConst.MATERIAL_TYPE_2 });
        if (showed) {
            return false;
        }
        let actStage = CakeActivityDataHelper.getActStage()[0];
        if (actStage == CakeActivityConst.ACT_STAGE_4) {
            return false;
        }
        return true;
    }
    public isHaveCanGiveMaterial() {
        if (CakeActivityDataHelper.isCanGiveMaterial() == false) {
            return false;
        }
        for (let type = CakeActivityConst.MATERIAL_TYPE_1; type <= CakeActivityConst.MATERIAL_TYPE_3; type++) {
            var [itemId] = CakeActivityDataHelper.getMaterialItemId(type);
            let count = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, itemId);
            if (count > 0) {
                return true;
            }
        }
        return false;
    }
    public isHaveCanGetLevelUpAward() {
        let rewards = this.getUpRewards();
        for (let i in rewards) {
            let reward = rewards[i];
            if (reward.isReceived == false) {
                return true;
            }
        }
        return false;
    }
    public isHaveCanGetDailyAward() {
        let rewards = this.getLoginRewards();
        for (let i in rewards) {
            let reward = rewards[i];
            if (reward.isReceived == false) {
                return true;
            }
        }
        return false;
    }
    public c2sGetCakeActivityTaskReward(taskId) {
        if (this.isExpired(TimeConst.RESET_TIME_24) == true) {
            this.c2sEnterCakeActivity();
            return;
        }
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetCakeActivityTaskReward, { task_id: taskId });
    }
    public _s2cGetCakeActivityTaskReward(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let taskId = message['task_id'] || 0;
        let awards = message['awards'] || {};
        G_SignalManager.dispatch(SignalConst.EVENT_CAKE_ACTIVITY_GET_TASK_REWARD, taskId, awards);
    }
    public c2sEnterCakeActivity() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_EnterCakeActivity, {});
    }
    public _s2cEnterCakeActivity(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this.resetTime();
        let tasks = message['tasks'] || {};
        let guildCakes = message['guild_cake'] || {};
        let upReward = message['up_reward'] || {};
        let cakeGuildRank = message['cake_guild_rank'] || {};
        let selfCakeGuildRank = message['self_cake_guild_rank'];
        let cakeUserRank = message['cake_user_rank'] || {};
        let selfCakeUserRank = message['self_cake_user_rank'];
        let cakeNotice = message['cake_notice'] || {};
        let loginReward = message['login_reward'] || {};
        let point = message['point'] || 0;
        this._initTaskMap();
        for (let i in tasks) {
            let task = tasks[i];
            let type = task['type'];
            let data = this.getTaskDataWithType(type);
            data.updateData(task);
        }
        this._cakeDataList = {};
        for (let i in guildCakes) {
            let guildCake = guildCakes[i];
            let cakeData = new GuildCakeData();
            cakeData.updateData(guildCake);
            let guildId = cakeData.getGuild_id();
            this._cakeDataList[guildId] = cakeData;
        }
        this._upRewards = {};
        for (let i in upReward) {
            let data = upReward[i];
            let rewardId = data['Key'];
            let value = data['Value'];
            this._upRewards[rewardId] = {
                rewardId: rewardId,
                isReceived: value == 1
            };
        }
        this._guildRankDatas = [];
        for (let i in cakeGuildRank) {
            let rank = cakeGuildRank[i];
            let data = new CakeActivityGuildRankData();
            data.updateData(rank);
            this._guildRankDatas.push(data);
        }
        this._selfGuildRank = null;
        if (selfCakeGuildRank) {
            this._selfGuildRank = new CakeActivityGuildRankData();
            this._selfGuildRank.updateData(selfCakeGuildRank);
        }
        this._userRankDatas = [];
        for (let i in cakeUserRank) {
            let rank = cakeUserRank[i];
            let data = new CakeActivityUserRankData();
            data.updateData(rank);
            this._userRankDatas.push(data);
        }
        this._selfUserRank = null;
        if (selfCakeUserRank) {
            this._selfUserRank = new CakeActivityUserRankData();
            this._selfUserRank.updateData(selfCakeUserRank);
        }
        this._noticeDatas = [];
        for (let i in cakeNotice) {
            let notice = cakeNotice[i];
            let data = new CakeActivityNoticeData();
            data.updateData(notice);
            this.addNoticeData(data);
        }
        this._loginRewards = {};
        for (let i in loginReward) {
            let data = loginReward[i];
            let day = data['Key'];
            let value = data['Value'];
            this._loginRewards[day] = {
                day: day,
                isReceived: value == 1
            };
        }
        this._selfPoint = point;
        G_SignalManager.dispatch(SignalConst.EVENT_CAKE_ACTIVITY_ENTER_SUCCESS);
    }
    public _s2cUpdateCakeTaskInfo(id, message) {
        let tasks = message['tasks'] || {};
        for (let i in tasks) {
            let task = tasks[i];
            let type = task['type'];
            let data = this.getTaskDataWithType(type);
            data.updateData(task);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_CAKE_ACTIVITY_UPDATE_TASK_INFO);
    }
    public c2sAddGuildCakeExp(addGuildId, itemId, itemNum) {
        console.warn('----CakeActivityData:c2sAddGuildCakeExp:addGuildId = ' + (addGuildId + (' itemId = ' + (itemId + ('itemNum = ' + itemNum)))));
        G_NetworkManager.send(MessageIDConst.ID_C2S_AddGuildCakeExp, {
            add_guild_id: addGuildId,
            item_id: itemId,
            item_num: itemNum
        });
    }
    public _s2cAddGuildCakeExp(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let itemId = message['item_id'] || 0;
        let itemNum = message['item_num'] || 0;
        let awards = message['awards'] || {};
        let cakeNotice = message['cake_notice'] || {};
        let addEggLimit = message['add_egg_limit'];
        let addGuildId = message['add_guild_id'];
        let point = message['point'];
        this._selfPoint = point;
        let noticeDatas = [];
        for (let i in cakeNotice) {
            let notice = cakeNotice[i];
            let data = new CakeActivityNoticeData();
            data.updateData(notice);
            this.addNoticeData(data);
            if (this._checkIsBulletNotice(data)) {
                noticeDatas.push(data);
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_CAKE_ACTIVITY_ADD_CAKE_EXP, itemId, itemNum, awards, noticeDatas, addEggLimit);
    }
    public _s2cUpdateGuildCakeInfo(id, message) {
        let guildCakes = message['guild_cake'] || {};
        let guildIds = [];
        for (let i in guildCakes) {
            let guildCake = guildCakes[i];
            let guildId = guildCake['guild_id'];
            let cakeData = this.getCakeDataWithId(guildId);
            if (cakeData) {
                guildIds.push(guildId);
                cakeData.updateData(guildCake);
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_CAKE_ACTIVITY_UPDATE_CAKE_INFO, guildIds);
    }
    public _s2cUpdateRankCakeAndNotice(id, message) {
        let cakeGuildRank = message['cake_guild_rank'] || {};
        let selfCakeGuildRank = message['self_cake_guild_rank'];
        let cakeUserRank = message['cake_user_rank'] || {};
        let selfCakeUserRank = message['self_cake_user_rank'];
        let cakeNotice = message['cake_notice'] || {};
        let guildRankDatas = [];
        for (let i in cakeGuildRank) {
            let rank = cakeGuildRank[i];
            let guildId = rank['guild_id'];
            let data = this.getGuildRankWithId(guildId);
            if (data == null) {
                data = new CakeActivityGuildRankData();
            }
            data.updateData(rank);
            guildRankDatas.push(data);
        }
        this._guildRankDatas = guildRankDatas;
        if (selfCakeGuildRank) {
            if (this._selfGuildRank == null) {
                this._selfGuildRank = new CakeActivityGuildRankData();
            }
            this._selfGuildRank.updateData(selfCakeGuildRank);
        }
        let userRankDatas = [];
        for (let i in cakeUserRank) {
            let rank = cakeUserRank[i];
            let userId = rank['user_id'];
            let data = this.getUserRankWithId(userId);
            if (data == null) {
                data = new CakeActivityUserRankData();
            }
            data.updateData(rank);
            userRankDatas.push(data);
        }
        this._userRankDatas = userRankDatas;
        if (selfCakeUserRank) {
            if (this._selfUserRank == null) {
                this._selfUserRank = new CakeActivityUserRankData();
            }
            this._selfUserRank.updateData(selfCakeUserRank);
        }
        let noticeDatas = [];
        for (let i in cakeNotice) {
            let notice = cakeNotice[i];
            let data = new CakeActivityNoticeData();
            data.updateData(notice);
            if (this._checkIsSelfNotice(data) == false) {
                this.addNoticeData(data);
                if (this._checkIsBulletNotice(data)) {
                    noticeDatas.push(data);
                }
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_CAKE_ACTIVITY_UPDATE_RANK_CAKE_AND_NOTICE, noticeDatas);
    }
    _s2cGetCakeActivityStatus(id, message) {
        let batchId = message['batch_id'] || 0;
        let activityStartTime = message['activity_start_time'] || 0;
        var actType = message['act_type'] || 0;
        this.setBatchId(batchId);
        this.setActivityStartTime(activityStartTime);
        this.setActType(actType);
        G_SignalManager.dispatch(SignalConst.EVENT_CAKE_ACTIVITY_UPDATE_ACTIVITY_STATUS);
        G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_CAKE_ACTIVITY);
    }
    public c2sGetGuildCakeUpLvReward(upRewardId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetGuildCakeUpLvReward, { up_reward_id: upRewardId });
    }
    public _s2cGetGuildCakeUpLvReward(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let upRewardId = message['up_reward_id'] || 0;
        let awards = message['awards'] || {};
        let upReward = message['up_reward'] || {};
        for (let i in upReward) {
            let data = upReward[i];
            let rewardId = data['Key'];
            let value = data['Value'];
            this._upRewards[rewardId] = {
                rewardId: rewardId,
                isReceived: value == 1
            };
        }
        G_SignalManager.dispatch(SignalConst.EVENT_CAKE_ACTIVITY_GET_LEVEL_UP_REWARD, awards, upRewardId);
    }
    public _s2cUpdateGuildCakeLvUpReward(id, message) {
        let upReward = message['up_reward'] || {};
        for (let i in upReward) {
            let data = upReward[i];
            let rewardId = data['Key'];
            let value = data['Value'];
            this._upRewards[rewardId] = {
                rewardId: rewardId,
                isReceived: value == 1
            };
        }
        G_SignalManager.dispatch(SignalConst.EVENT_CAKE_ACTIVITY_UPDATE_LEVEL_UP_REWARD);
    }
    public _s2cCakeRechrageReward(id, message) {
        let awards = message['awards'] || {};
        G_SignalManager.dispatch(SignalConst.EVENT_CAKE_ACTIVITY_GET_RECHARGE_REWARD, awards);
    }
    public c2sGetGuildCakeLoginReward(dayId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetGuildCakeLoginReward, { day_id: dayId });
    }
    public _s2cGetGuildCakeLoginReward(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let dayId = message['day_id'] || 0;
        let awards = message['awards'] || {};
        let loginReward = message['login_reward'] || {};
        for (let i in loginReward) {
            let data = loginReward[i];
            let day = data['Key'];
            let value = data['Value'];
            this._loginRewards[day] = {
                day: day,
                isReceived: value == 1
            };
        }
        G_SignalManager.dispatch(SignalConst.EVENT_CAKE_ACTIVITY_GET_DAILY_REWARD, awards);
    }

    c2sExchargeReward(id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_ExchargeReward, { id: id });
    }
    _s2cExchargeReward(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var id = message['id'] || 0;
        var awards = message['awards'] || {};
        G_SignalManager.dispatch(SignalConst.EVENT_CAKE_ACTIVITY_RECHARGE_REWARD, awards);
    }
}
CakeActivityData;