import { BaseData } from "./BaseData";
import { Slot } from "../utils/event/Slot";
import { G_NetworkManager, G_SignalManager, G_ServerTime, G_UserData, G_ConfigLoader } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { DailyDungeonBaseData } from "./DailyDungeonBaseData";
import { SignalConst } from "../const/SignalConst";
import { FunctionConst } from "../const/FunctionConst";
import { TimeConst } from "../const/TimeConst";
import { ConfigNameConst } from "../const/ConfigNameConst";

export interface DailyDungeonData {
    getDds(): Object
    setDds(value: Object): void
    getLastDds(): Object
    getNowType(): number
    setNowType(value: number): void
    getLastNowType(): number
}




let schema = {};
schema['dds'] = [
    'object',
    {}
];
schema['nowType'] = [
    'number',
    0
];
export class DailyDungeonData extends BaseData {
    public static schema = schema;

    _listenerDailyDungeonData: Slot;
    _listenerFirstEnterDaily: Slot;
    _listenerExecute: Slot;
    _listenerChallenge: Slot;

    constructor(properties?) {
        super(properties);
        this._listenerDailyDungeonData = G_NetworkManager.add(MessageIDConst.ID_S2C_EnterDailyDungeonData, this._s2cEnterDailyDungeonData.bind(this));
        this._listenerFirstEnterDaily = G_NetworkManager.add(MessageIDConst.ID_S2C_FirstEnterDailyDungeon, this._s2cFirstEnterDailyDungeon.bind(this));
        this._listenerExecute = G_NetworkManager.add(MessageIDConst.ID_S2C_ExecuteDailyDungeon, this._s2cExecuteDailyDungeon.bind(this));
        this._listenerChallenge = G_NetworkManager.add(MessageIDConst.ID_S2C_ExecuteDailyDungeonAuto, this._recvChallenge.bind(this));
    }
    public clear() {
        this._listenerDailyDungeonData.remove();
        this._listenerDailyDungeonData = null;
        this._listenerFirstEnterDaily.remove();
        this._listenerFirstEnterDaily = null;
        this._listenerExecute.remove();
        this._listenerExecute = null;
        this._listenerChallenge.remove();
        this._listenerChallenge = null;
    }
    public reset() {
    }
    public _s2cEnterDailyDungeonData(id, message) {
        this.resetTime();
        let ddDataList = [];
        if (message.ret == 1) {
            if (message.hasOwnProperty('dds')) {
                for (let _ in message.dds) {
                    let val = message.dds[_];
                    let ddData = new DailyDungeonBaseData(val);
                    ddDataList.push(ddData);
                }
                this.setDds(ddDataList);
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_DAILY_DUNGEON_ENTER);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_DAILY_STAGE);
    }
    public getRemainCount(type) {
        let ddsList = this.getDds();
        for (let _ in ddsList) {
            let val = ddsList[_];
            if (val.getType() == type) {
                return val.getRemain_count();
            }
        }
        let DailyDungeonType = G_ConfigLoader.getConfig(ConfigNameConst.DAILY_DUNGEON_TYPE);
        return DailyDungeonType.get(type).daily_times;
    }
    public updateRemainCountById(type, remainCount) {
        let ddsList = this.getDds();
        for (let _ in ddsList) {
            let val = ddsList[_];
            if (val.getType() == type) {
                val.setRemain_count(remainCount);
            }
        }
        this.setDds(ddsList);
    }
    public updateFirstEnter(type, id) {
        let ddsList = this.getDds();
        for (let _ in ddsList) {
            let val = ddsList[_];
            if (val.getType() == type) {
                val.setFirst_enter_max_id(id);
            }
        }
        this.setDds(ddsList);
    }
    public getFirstEnter(type) {
        let ddsList = this.getDds();
        for (let _ in ddsList) {
            let val = ddsList[_];
            if (val.getType() == type) {
                return val.getFirst_enter_max_id();
            }
        }
        return 0;
    }
    public getMaxIdByType(type) {
        let ddsList = this.getDds();
        for (let _ in ddsList) {
            let val = ddsList[_];
            if (val.getType() == type) {
                return val.getMax_id();
            }
        }
        return 0;
    }
    public isDungeonEntered(type, id) {
        let ddsList = this.getDds();
        for (let _ in ddsList) {
            let val = ddsList[_];
            if (val.getType() == type) {
                return id <= val.getFirst_enter_max_id();
            }
        }
        return false;
    }
    public updateMaxId(type, id) {
        let ddsList = this.getDds();
        for (let _ in ddsList) {
            let val = ddsList[_];
            if (val.getType() == type && id > val.getMax_id()) {
                val.setMax_id(id);
                break;
            }
        }
        this.setDds(ddsList);
    }
    public c2sFirstEnterDailyDungeon(nextId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_FirstEnterDailyDungeon, { id: nextId });
    }
    public _s2cFirstEnterDailyDungeon(id, message) {
        if (message.ret == 1) {
            let firstEnterId = message.id;
            this.updateFirstEnter(this.getNowType(), firstEnterId);
            G_SignalManager.dispatch(SignalConst.EVENT_DAILY_DUNGEON_FIRSTENTER, firstEnterId);
        }
    }
    public c2sExecuteDailyDungeon(stageId, opType) {
        if (this.isExpired() == true) {
            this.pullData();
            return;
        }
        G_NetworkManager.send(MessageIDConst.ID_C2S_ExecuteDailyDungeon, {
            id: stageId,
            op_type: opType
        });
    }
    public c2sEnterDailyDungeonData() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_EnterDailyDungeonData, {});
    }
    public pullData() {
        this.c2sEnterDailyDungeonData();
    }
    public _s2cExecuteDailyDungeon(id, message) {
        if (message.ret != 1) {
            return;
        }
        let nowType = this.getNowType();
        this.updateRemainCountById(nowType, message.remain_count);
        let isPass = message.is_pass;
        let stageId = message.id;
        let maxId = this.getMaxIdByType(nowType);
        if (isPass && stageId >= maxId) {
            this.updateMaxId(nowType, stageId);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_DAILY_DUNGEON_EXECUTE, message);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_DAILY_STAGE);
    }
    public hasRedPoint() {
        return this._hasRemainCountRedPoint();
    }
    public _hasRemainCountRedPoint() {
        let ddsList = this.getDds();
        for (let _ in ddsList) {
            let val = ddsList[_];
            let showRedPoint = this.dungeonIsHasRemainCountRedPoint(val.getType());
            if (showRedPoint) {
                return true;
            }
        }
        return false;
    }
    public dungeonIsHasRemainCountRedPoint(type) {
        return this._isDungeonOpen(type) && this._isLevelEnough(type) && this.getRemainCount(type) > 0;
    }
    public _getFirstOpenLevel(type) {
        let DailyDungeon = G_ConfigLoader.getConfig(ConfigNameConst.DAILY_DUNGEON);
        let DailyDungeonCount = DailyDungeon.length();
        for (let i = 0; i < DailyDungeonCount; i++) {
            let info = DailyDungeon.indexOf(i);
            if (info.type == type && info.pre_id == 0) {
                return info.level;
            }
        }
    }
    public _isDungeonOpen(type) {
        let firstLevel = this._getFirstOpenLevel(type);
        let todayLevel = G_UserData.getBase().getToday_init_level();
        let nowLevel = G_UserData.getBase().getLevel();
        if (todayLevel < firstLevel && nowLevel >= firstLevel) {
            return true;
        }
        let DailyDungeonType = G_ConfigLoader.getConfig(ConfigNameConst.DAILY_DUNGEON_TYPE);
        let dailyInfo = DailyDungeonType.get(type);
        console.assert(dailyInfo, 'daily_dungeon_type not find id ' + type);
        let openDays = {};
        for (let i = 0; i < dailyInfo.week_open_queue.length; i++) {
            openDays[i] = dailyInfo.week_open_queue.charAt(i) == '1';
        }

        let data = G_ServerTime.getDateObject(null, TimeConst.RESET_TIME_SECOND);
        let day = data.getDay();
        return openDays[day];
    }
    public _isLevelEnough(type) {
        let DailyDungeonType = G_ConfigLoader.getConfig(ConfigNameConst.DAILY_DUNGEON_TYPE);
        let dailyInfo = DailyDungeonType.get(type);
        console.assert(dailyInfo, 'daily_dungeon_type not find id ' + type);
        let myLevel = G_UserData.getBase().getLevel();
        let DailyDungeon = G_ConfigLoader.getConfig(ConfigNameConst.DAILY_DUNGEON);
        let dailyDungeonCount = DailyDungeon.length();
        let firstLevel = 0;
        for (let i = 0; i < dailyDungeonCount; i++) {
            let info = DailyDungeon.indexOf(i);
            if (info.type == dailyInfo.id && info.pre_id == 0) {
                firstLevel = info.level;
                break;
            }
        }
        return myLevel >= firstLevel;
    }
    public sendSweep() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_ExecuteDailyDungeonAuto, { op_type: 2 });
    }
    public sendChallenge() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_ExecuteDailyDungeonAuto, { op_type: 1 });
    }
    public _recvChallenge(id, message) {
        if (message.ret != 1) {
            return;
        }
        let results = [];
        message.result.forEach(i => {
            let result: any = {};
            result.id = i.id;
            result.op_type = i.op_type
            if (i.hasOwnProperty('is_pass')) {
                result.pass = i.is_pass;
            }
            if (i.hasOwnProperty('awards')) {
                for (let _ in i['awards']) {
                    let v = i['awards'][_];
                    result.rewards = [];
                    let reward = {
                        type: v.type,
                        value: v.value,
                        size: v.size
                    };
                    result.rewards.push(reward);
                }
            }
            results.push(result);
        });
        G_SignalManager.dispatch(SignalConst.EVENT_DAILY_DUNGEON_CHALLENGE, results);
        //G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_PVE_TOWER);
    }
}
