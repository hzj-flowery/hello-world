import { BaseData } from './BaseData';
import { Slot } from '../utils/event/Slot';
import { G_NetworkManager, G_SignalManager, G_UserData } from '../init';
import { MessageIDConst } from '../const/MessageIDConst';
import { SignalConst } from '../const/SignalConst';
import { FunctionConst } from '../const/FunctionConst';
import { MessageErrorConst } from '../const/MessageErrorConst';
import { ActivityGuildSprintRankUnitData } from './ActivityGuildSprintRankUnitData';
import { TimeLimitActivityConst } from '../const/TimeLimitActivityConst';
let schema = {};
schema['guild_rank'] = [
    'number',
    0
];
schema['hasData'] = [
    'boolean',
    false
];
export interface ActivityGuildSprintData {
    getGuild_rank(): number
    setGuild_rank(value: number): void
    getLastGuild_rank(): number
    isHasData(): boolean
    setHasData(value: boolean): void
    isLastHasData(): boolean
}
export class ActivityGuildSprintData extends BaseData {
    public static schema = schema;
    public _showGuilds;
    public _signalGetSevenDaysSprintGuild: Slot;
    public _signalGetSevenDaysSprintGuildRank: Slot;
    public _signalCommonZeroNotice: Slot;

    constructor(properties?) {
        super(properties);
        super(properties)
        this._showGuilds = {};
        this._signalGetSevenDaysSprintGuild = G_NetworkManager.add(MessageIDConst.ID_S2C_GetSevenDaysSprintGuild, this._s2cGetSevenDaysSprintGuild.bind(this));
        this._signalGetSevenDaysSprintGuildRank = G_NetworkManager.add(MessageIDConst.ID_S2C_GetSevenDaysSprintGuildRank, this._s2cGetSevenDaysSprintGuildRank.bind(this));
        this._signalCommonZeroNotice = G_SignalManager.add(SignalConst.EVENT_COMMON_ZERO_NOTICE, this._onEventCommonZeroNotice.bind(this));
    }
    public clear() {
        this._signalGetSevenDaysSprintGuild.remove();
        this._signalGetSevenDaysSprintGuild = null;
        this._signalGetSevenDaysSprintGuildRank.remove();
        this._signalGetSevenDaysSprintGuildRank = null;
        this._signalCommonZeroNotice.remove();
        this._signalCommonZeroNotice = null;
    }
    public reset() {
        this._showGuilds = {};
        this.setHasData(false);
    }
    public _onEventCommonZeroNotice(event, hour) {
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_ACTIVITY);
    }
    public c2sGetSevenDaysSprintGuild() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetSevenDaysSprintGuild, {});
    }
    public c2sGetSevenDaysSprintGuildRank() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetSevenDaysSprintGuildRank, {});
    }
    public _s2cGetSevenDaysSprintGuild(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this.setHasData(true);
        this.resetTime();
        this.setProperties(message);
        this._showGuilds = {};
        let showGuilds = message['show_guilds'] || {};
        for (let k in showGuilds) {
            let v = showGuilds[k];
            let data = new ActivityGuildSprintRankUnitData();
            data.initData(v);
            this._showGuilds[v.rank] = data;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_ACTIVITY_GUILD_SPRINT_INFO, message);
    }
    public _s2cGetSevenDaysSprintGuildRank(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let rankUnitDataList = [];
        let ranks = message['ranks'] || {};
        for (let k in ranks) {
            let v = ranks[k];
            let data = new ActivityGuildSprintRankUnitData();
            data.initData(v);
            rankUnitDataList.push(data);
        }
        let myRank = message['rank'] || 0;
        G_SignalManager.dispatch(SignalConst.EVENT_ACTIVITY_GUILD_SPRINT_GET_RANK_LIST, rankUnitDataList, myRank);
    }
    public pullData() {
        this.c2sGetSevenDaysSprintGuild();
    }
    public getShowGuilds() {
        return this._showGuilds;
    }
    public getActivityConfigData() {
        let actUnitData = G_UserData.getTimeLimitActivity().getSprintActUnitData(TimeLimitActivityConst.ACTIVITY_TYPE_GUILD_SPRINT);
        return actUnitData;
    }
    public hasSeeActivity() {
        let showed = G_UserData.getRedPoint().isTodayShowedRedPointByFuncId(FunctionConst.FUNC_ACTIVITY, {
            actId: TimeLimitActivityConst.ACTIVITY_TYPE_GUILD_SPRINT,
            actType: TimeLimitActivityConst.ID_TYPE_SEVEN_DAYS_SPRINT
        });
        if (showed) {
            return false;
        }
        return true;
    }
    public hasRedPoint() {
        let actConfigData = this.getActivityConfigData();
        if (!actConfigData) {
            return false;
            // return [
            //     false,
            //     false,
            //     false
            // ];
        }
        let red = actConfigData.isActivityOpen() && this.hasSeeActivity();
        return red;
        // return [
        //     red,
        //     red,
        //     false
        // ];
    }
    public hasActivityCanVisible() {
        let actConfigData = this.getActivityConfigData();
        if (!actConfigData) {
            return false;
        }
        return actConfigData.isActivityOpen();
    }
}
ActivityGuildSprintData;