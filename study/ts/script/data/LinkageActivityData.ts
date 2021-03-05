import { BaseData } from "./BaseData";
import { G_NetworkManager, G_ConfigLoader, G_ServerTime, G_ServiceManager, G_SignalManager } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { SignalConst } from "../const/SignalConst";
import { CombineTaskStatusData } from "./CombineTaskStatusData";
import { FunctionConst } from "../const/FunctionConst";

export interface LinkageActivityData {
    getStatus(): number
    setStatus(value: number): void
    getLastStatus(): number
    getRecords(): Object
    setRecords(value: Object): void
    getLastRecords(): Object
    getGame_id(): number
    setGame_id(value: number): void
    getLastGame_id(): number
    getBegin_time(): number
    setBegin_time(value: number): void
    getLastBegin_time(): number
    getEnd_time(): number
    setEnd_time(value: number): void
    getLastEnd_time(): number
    getAct_status(): number
    setAct_status(value: number): void
    getLastAct_status(): number
}
let schema = {};
schema['status'] = [
    'number',
    0
];
schema['records'] = [
    'object',
    {}
];
schema['game_id'] = [
    'number',
    0
];
schema['begin_time'] = [
    'number',
    0
];
schema['end_time'] = [
    'number',
    0
];
schema['act_status'] = [
    'number',
    0
];
export class LinkageActivityData extends BaseData {
    public static schema = schema;

    _combineTaskList;
    _signalRecvLoadSGSCodeRecord;
    _signalRecvTakeSGSCode;
    _signalGetCombineTaskStatus;
    constructor(properties?) {
        super(properties);
        this._combineTaskList = {};
        this._signalRecvLoadSGSCodeRecord = G_NetworkManager.add(MessageIDConst.ID_S2C_LoadSGSCodeRecord, this._s2cLoadSGSCodeRecord.bind(this));
        this._signalRecvTakeSGSCode = G_NetworkManager.add(MessageIDConst.ID_S2C_TakeSGSCode, this._s2cTakeSGSCode.bind(this));
        this._signalGetCombineTaskStatus = G_NetworkManager.add(MessageIDConst.ID_S2C_GetCombineTaskStatus, this._s2cGetCombineTaskStatus.bind(this));
    }
    public clear() {
        this._signalRecvLoadSGSCodeRecord.remove();
        this._signalRecvLoadSGSCodeRecord = null;
        this._signalRecvTakeSGSCode.remove();
        this._signalRecvTakeSGSCode = null;
        this._signalGetCombineTaskStatus.remove();
        this._signalGetCombineTaskStatus = null;
    }
    public reset() {
    }
    public isVisible(gameId) {
        return gameId == 1 && !this.isAllTaskComplete() && this.getAct_status() == 1;
    }
    public hasRedPoint() {
        return false;
    }
    public getRequireLevels() {
        let paramConfig = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        let config = paramConfig.get(195);
        console.assert(config != null, 'not find parameter config id = 195');
        let content = config.content;
        let levelstr = config.content.split('|');
        let levels = [];
        for (let k = 0; k < levelstr.length; k++) {
            let v = levelstr[k];
            levels.push(Number(v));
        }
        return levels;
    }
    public _s2cLoadSGSCodeRecord(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let oldStatus = this.getStatus();
        this.setStatus(message.status);
        this.setProperties(message);
        let records = message['records'];
        if (records) {
            let data = {};
            for (let k in records) {
                let v = records[k];
                data[v.open_server_day] = v.code;
            }
            this.setRecords(data);
        }
        let endTime = this.getEnd_time();
        let curTime = G_ServerTime.getTime();
        if (curTime < endTime) {
            G_ServiceManager.registerOneAlarmClock('LINKAGE_ACTIVITY_TIME_END', endTime, function () {
                G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS,  FunctionConst.FUNC_LINKAGE_ACTIVITY);
            });
        }
        if (oldStatus != message.status) {
            G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS,  FunctionConst.FUNC_LINKAGE_ACTIVITY);
        }
    }
    public c2sTakeSGSCode(open_server_day) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_TakeSGSCode, { open_server_day: open_server_day });
    }
    public _s2cTakeSGSCode(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let open_server_day = message['open_server_day'];
        if (open_server_day) {
            let data = this.getRecords();
            data[open_server_day] = message['code'] || '';
        }
        G_SignalManager.dispatch(SignalConst.EVENT_TAKE_LINKAGE_ACTIVITY_CODE_SUCCESS, open_server_day);
        G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS,  FunctionConst.FUNC_LINKAGE_ACTIVITY);
    }
    public c2sGetCombineTaskStatus() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetCombineTaskStatus, {});
    }
    public _s2cGetCombineTaskStatus(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this._combineTaskList = {};
        let tasks = message['tasks'] || {};
        for (let k in tasks) {
            let v = tasks[k];
            let data = new CombineTaskStatusData();
            data.initData(v);
            this._combineTaskList[data.getTask_id()] = data;
        }
        this.setProperties(message);
        G_SignalManager.dispatch(SignalConst.EVENT_LINKAGE_ACTIVITY_TASK_SYN);
        G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS,  FunctionConst.FUNC_LINKAGE_ACTIVITY);
    }
    public getCombineTaskList() {
        return this._combineTaskList;
    }
    public getCombineTaskUnitData(taskId) {
        return this._combineTaskList[taskId];
    }
    public isAllTaskComplete() {
        let SgsLinkage = G_ConfigLoader.getConfig(ConfigNameConst.SGS_LINKAGE)
        for (let i = 0; i < SgsLinkage.length(); i += 1) {
            let config = SgsLinkage.indexOf(i);
            let unit = this.getCombineTaskUnitData(config.id);
            if (!unit) {
                return false;
            } else if (unit.getStatus() != 1) {
                return false;
            }
        }
        return true;
    }
}
