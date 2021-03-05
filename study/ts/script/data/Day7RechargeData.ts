import { BaseData } from "./BaseData";
import { G_NetworkManager, G_ConfigLoader, G_SignalManager } from "../init";
import { MessageConst } from "../const/MessageConst";
import { MessageIDConst } from "../const/MessageIDConst";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { Day7RechargeUnitData } from "./Day7RechargeUnitData";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { SignalConst } from "../const/SignalConst";
import { FunctionConst } from "../const/FunctionConst";
import { handler } from "../utils/handler";
import { Day7RechargeDataHelper } from "../utils/data/Day7RechargeDataHelper";

let schema = {};
export class Day7RechargeData extends BaseData {
    public static schema = schema;

    _recvSevenDaysMoneyEntry;
    _recvSevenDaysMoneyPrize;

    _taskInfos;
    _SevenDaysMoneyInfo;

    constructor(properties?) {
        super(properties);

        this._recvSevenDaysMoneyEntry = G_NetworkManager.add(MessageIDConst.ID_S2C_SevenDaysMoneyEntry, handler(this, this._s2cSevenDaysMoneyEntry));
        this._recvSevenDaysMoneyPrize = G_NetworkManager.add(MessageIDConst.ID_S2C_SevenDaysMoneyPrize, handler(this, this._s2cSevenDaysMoneyPrize))

        this._initTaskInfo();
        this._initMoneyInfo();
    }

    clear() {
        this._recvSevenDaysMoneyEntry.remove();
        this._recvSevenDaysMoneyEntry = null;
        this._recvSevenDaysMoneyPrize.remove();
        this._recvSevenDaysMoneyPrize = null;
    }

    private _initTaskInfo() {
        this._taskInfos = {};
        var config = G_ConfigLoader.getConfig(ConfigNameConst.SEVEN_DAYS_MONEY);
        var len = config.length();
        for (var i = 0; i < len; i++) {
            var info = config.indexOf(i);
            var taskType = info.task_type;
            if (this._taskInfos[taskType] == null) {
                this._taskInfos[taskType] = new Day7RechargeUnitData();
            }
        }
    }

    private _initMoneyInfo() {
        this._SevenDaysMoneyInfo = {};
        var config = G_ConfigLoader.getConfig(ConfigNameConst.SEVEN_DAYS_MONEY);
        var len = config.length();
        for (var i = 0; i < len; i++) {
            var info = config.indexOf(i);
            var taskType = info.task_type;
            if (this._SevenDaysMoneyInfo[taskType] == null) {
                this._SevenDaysMoneyInfo[taskType] = []
            }
            this._SevenDaysMoneyInfo[taskType].push(info);
        }
    }

    getMoneyInfoWithType(type) {
        return this._SevenDaysMoneyInfo[type] || {};
    }

    getTaskInfoWithType(type) {
        return this._taskInfos[type];
    }

    isShowRedPointWithType(type) {
        var taskInfo = this.getTaskInfoWithType(type);
        return taskInfo.isShowRedPoint();
    }

    _s2cSevenDaysMoneyEntry(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var tasks = message['tasks'] || {};
        for (var index in tasks) {
            var task = tasks[index];
            var type = task['type'];
            var unitData = this.getTaskInfoWithType(type);
            unitData.updateData(task);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_DAY7_RECHARGE_ENTRY)
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_SEVEN_DAY_RECHARGE)
    }

    c2sSevenDaysMoneyPrize(id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_SevenDaysMoneyPrize, {
            id: id
        })
    }

    _s2cSevenDaysMoneyPrize(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var id = message['id'] || 0;
        var awards = message['prize'] || {};
        var info = Day7RechargeDataHelper.get7DaysMoneyConfig(id);
        var type = info.task_type;
        var unitData = this.getTaskInfoWithType(type);
        unitData.setReceivedWithId(id);
        G_SignalManager.dispatch(SignalConst.EVENT_DAY7_RECHARGE_PRIZE, awards)
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_SEVEN_DAY_RECHARGE)
    }
}