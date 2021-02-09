import { BaseData } from "./BaseData";
import { FunctionConst } from "../const/FunctionConst";
import { G_UserData, G_ServiceManager, G_SignalManager, G_ServerTime } from "../init";
import { GuildAnswerHelper } from "../scene/view/guildAnswer/GuildAnswerHelper";
import { GuildServerAnswerHelper } from "../scene/view/guildServerAnswer/GuildServerAnswerHelper";
import { GuildDungeonDataHelper } from "../utils/data/GuildDungeonDataHelper";
import { CountryBossHelper } from "../scene/view/countryboss/CountryBossHelper";
import { TimeConst } from "../const/TimeConst";
import { CampRaceHelper } from "../scene/view/campRace/CampRaceHelper";
import { GuildWarDataHelper } from "../utils/data/GuildWarDataHelper";
import { GuildCrossWarHelper } from "../scene/view/guildCrossWar/GuildCrossWarHelper";
import { ArraySort } from "../utils/handler";
import { SignalConst } from "../const/SignalConst";
import { FunctionCheck } from "../utils/logic/FunctionCheck";
import { table } from "../utils/table";
import { assert } from "../utils/GlobleFunc";
export class LimitTimeActivityData extends BaseData {
    public _mainMenuActivityTimes: any[];

    constructor(properties?) {
        super(properties);
    }
    public _initMainMenuLayerActivityIcons() {
        let offset = 3;
        this._mainMenuActivityTimes = [
            {
                funcId: FunctionConst.FUNC_WORLD_BOSS,
                getStartTime() {
                    //军团boss的开启时间
                    return G_UserData.getWorldBoss().getStart_time();
                },
                getEndTime() {
                    return G_UserData.getWorldBoss().getEnd_time();
                },
                showEffectTime: 300,
                weight: 1,
                isTodayOpen() {
                    return true;
                },
                isGuildAct: true
            },
            {
                funcId: FunctionConst.FUNC_GUILD_ANSWER,
                getStartTime() {
                    return GuildAnswerHelper.getGuildAnswerStartTime();
                },
                getEndTime() {
                    return GuildAnswerHelper.getGuildAnswerEndTime();
                },
                showEffectTime: 300,
                weight: 1,
                isTodayOpen() {
                    return GuildAnswerHelper.isTodayOpen();
                },
                isGuildAct: true
            },
            {
                funcId: FunctionConst.FUNC_GUILD_SERVER_ANSWER,
                getStartTime() {
                    return GuildServerAnswerHelper.getServerAnswerStartTime();
                },
                getEndTime() {
                    return GuildServerAnswerHelper.getServerAnswerEndTime();
                },
                showEffectTime: 300,
                weight: 1,
                isTodayOpen() {
                    return GuildServerAnswerHelper.isTodayOpen();
                },
                isGuildAct: true
            },
            {
                funcId: FunctionConst.FUNC_GUILD_DUNGEON,
                getStartTime() {
                    let startTime = GuildDungeonDataHelper.getGuildDungeonStartTimeAndEndTime()[0];
                    return startTime;
                },
                getEndTime() {
                    let [_, endTime] = GuildDungeonDataHelper.getGuildDungeonStartTimeAndEndTime();
                    return endTime;
                },
                showEffectTime: 300,
                weight: 1,
                isTodayOpen() {
                    return true;
                },
                isGuildAct: true
            },
            {
                funcId: FunctionConst.FUNC_COUNTRY_BOSS,
                getStartTime() {
                    let startTime = CountryBossHelper.getStartTime();
                    return startTime;
                },
                getEndTime() {
                    let endTime = CountryBossHelper.getEndTime();
                    return endTime;
                },
                showEffectTime: 300,
                weight: 1,
                isTodayOpen() {
                    let open = CountryBossHelper.isTodayOpen(TimeConst.RESET_TIME_SECOND);
                    return open;
                },
                isGuildAct: true
            },
            {
                funcId: FunctionConst.FUNC_CAMP_RACE,
                getStartTime() {
                    let startTime = CampRaceHelper.getStartTime();
                    return startTime;
                },
                getEndTime() {
                    let endTime = CampRaceHelper.getEndTime();
                    return endTime;
                },
                showEffectTime: 300,
                weight: 1,
                isTodayOpen() {
                    let open = CampRaceHelper.isTodayOpen(TimeConst.RESET_TIME_SECOND);
                    return open;
                },
                isGuildAct: false
            },
            {
                funcId: FunctionConst.FUNC_RUNNING_MAN,
                getStartTime() {
                    let startTime = G_UserData.getRunningMan().getStart_time();
                    return startTime;
                },
                getEndTime() {
                    let endTime = G_UserData.getRunningMan().getEnd_time() + 5;
                    return endTime;
                },
                showEffectTime: 300,
                weight: 1,
                isTodayOpen() {
                    return true;
                },
                isGuildAct: false
            },
            {
                funcId: FunctionConst.FUNC_GUILD_WAR,
                getStartTime() {
                    let open = GuildWarDataHelper.isTodayOpen();
                    if (!open) {
                        return 0;
                    }
                    let timeData = GuildWarDataHelper.getGuildWarTimeRegion();
                    return timeData.startTime;
                },
                getEndTime() {
                    let open = GuildWarDataHelper.isTodayOpen();
                    if (!open) {
                        return 0;
                    }
                    let timeData = GuildWarDataHelper.getGuildWarTimeRegion();
                    return timeData.endTime;
                },
                showEffectTime: 300,
                weight: 1,
                isTodayOpen() {
                    let open = GuildWarDataHelper.isTodayOpen();
                    return open;
                },
                isGuildAct: false
            },
            {
                funcId: FunctionConst.FUNC_GUILD_CROSS_WAR,
                getStartTime() {
                    let open = GuildCrossWarHelper.isTodayOpen();
                    if (!open) {
                        return 0;
                    }
                    let timeData = GuildCrossWarHelper.getConfigTimeRegion();
                    return timeData.startTime;
                },
                getEndTime() {
                    let open = GuildCrossWarHelper.isTodayOpen();
                    if (!open) {
                        return 0;
                    }
                    let timeData = GuildCrossWarHelper.getConfigTimeRegion();
                    return timeData.endTime;
                },
                showEffectTime: 300,
                weight: 1,
                isTodayOpen() {
                    let open = GuildCrossWarHelper.isTodayOpen();
                    return open;
                },
                isGuildAct: false
            },
            {
                funcId: FunctionConst.FUNC_CROSS_WORLD_BOSS,
                getStartTime: function () {
                    return G_UserData.getCrossWorldBoss().getStart_time();
                },
                getEndTime: function () {
                    return G_UserData.getCrossWorldBoss().getEnd_time();
                },
                showEffectTime: 300,
                weight: 1,
                isTodayOpen: function () {
                    return true;
                },
                isGuildAct: true
            }
        ];
    }
    public getStartAndEndTimeByFunctionId(funcId) {
        if (!this._mainMenuActivityTimes) {
            this._initMainMenuLayerActivityIcons();
        }
        for (let k in this._mainMenuActivityTimes) {
            let v = this._mainMenuActivityTimes[k];
            if (v.funcId == funcId) {
                return [
                    v.getStartTime(),
                    v.getEndTime()
                ];
            }
        }
    }

    public getCurMainMenuLayerActivityIcon () {
        if (!this._mainMenuActivityTimes) {
            this._initMainMenuLayerActivityIcons();
        }
        var curTime = G_ServerTime.getTime();
        var datas = [];
        var nextCleanTime = G_ServerTime.getNextCleanDataTime();
        for (let k in this._mainMenuActivityTimes) {
            var v = this._mainMenuActivityTimes[k];
            var startTime = v.getStartTime();
            var endTime = v.getEndTime();
            if (startTime > 0 && startTime < nextCleanTime) {
                table.insert(datas, {
                    startTime: startTime,
                    endTime: endTime,
                    funcId: v.funcId,
                    showEffectTime: v.showEffectTime,
                    weight: v.weight
                });
            }
        }
        table.sort(datas, function (a, b) {
            if (a.weight == b.weight) {
                return a.startTime < b.startTime;
            } else {
                return a.weight < b.weight;
            }
        });
        var curInfo:any = {};
        for (let k in datas) {
            var v = datas[k];
            if (curTime < v.endTime) {
                if (v.funcId == FunctionConst.FUNC_GUILD_WAR) {
                    var [bQualification,hj] = GuildCrossWarHelper.isGuildCrossWarEntry();
                    var bOpenToday = GuildCrossWarHelper.isTodayOpen();
                    if (!bOpenToday || !bQualification) {
                        curInfo = v;
                        break;
                    }
                } else {
                    if(v.funcId !=FunctionConst.FUNC_GUILD_DUNGEON)
                    {
                        //军团试炼活动不再独立显示
                        curInfo = v;
                        break;
                    }
                }
            }
        }
        var minStartTime = curInfo.startTime || 0;
        var minEndTime = curInfo.endTime || 0;
        var funcId = curInfo.funcId || 0;
        var showEffectTime = curInfo.showEffectTime;
        var isNeedShowEffect = false;
        if (funcId != 0) {
            G_ServiceManager.registerOneAlarmClock('LIMIT_TIME_ACTIVITY_DATA_MAINMENULAYER_ICON_END', minEndTime, function () {
                G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, funcId);
                G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_AUCTION);
            });
            if (showEffectTime != null) {
                var showEffectStartTime = minStartTime - showEffectTime;
                assert(showEffectStartTime > 0, 'showEffectStartTime <= 0 ');
                if (curTime < showEffectStartTime) {
                    isNeedShowEffect = false;
                    G_ServiceManager.registerOneAlarmClock('LIMIT_TIME_ACTIVITY_DATA_MAINMENULAYER_ICON', showEffectStartTime, function () {
                        G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, funcId);
                    });
                } else {
                    isNeedShowEffect = true;
                }
            }
        }
        return [
            funcId,
            minStartTime,
            minEndTime,
            isNeedShowEffect
        ];
    }

    public getCurGuildActivityIcon() {
        if (!this._mainMenuActivityTimes) {
            this._initMainMenuLayerActivityIcons();
        }
        let curTime = G_ServerTime.getTime();
        let datas = [];
        let nextCleanTime = G_ServerTime.getNextCleanDataTime();
        for (let k in this._mainMenuActivityTimes) {
            let v = this._mainMenuActivityTimes[k];
            let startTime = v.getStartTime();
            let endTime = v.getEndTime();
            if (startTime > 0 && startTime < nextCleanTime && v.isGuildAct == true) {
                datas.push({
                    startTime: startTime,
                    endTime: endTime,
                    funcId: v.funcId,
                    showEffectTime: v.showEffectTime,
                    weight: v.weight
                });
            }
        }
        ArraySort(datas, function (a, b) {
            if (a.weight == b.weight) {
                return a.startTime < b.startTime;
            } else {
                return a.weight < b.weight;
            }
        });
        let curInfo: any = {};
        for (let _ in datas) {
            let v = datas[_];
            if (curTime < v.endTime) {
                curInfo = v;
                break;
            }
        }
        let minStartTime = curInfo.startTime || 0;
        let minEndTime = curInfo.endTime || 0;
        let funcId = curInfo.funcId || 0;
        let showEffectTime = curInfo.showEffectTime;
        let isNeedShowEffect = false;
        return [
            funcId,
            minStartTime,
            minEndTime,
            isNeedShowEffect
        ];
    }
    public clear() {
        this._mainMenuActivityTimes = null;
    }
    public reset() {
        this._mainMenuActivityTimes = null;
    }
    public hasActivityNum() {
        if (!this._mainMenuActivityTimes) {
            this._initMainMenuLayerActivityIcons();
        }
        let count = 0;
        for (let k in this._mainMenuActivityTimes) {
            let v = this._mainMenuActivityTimes[k];
            if (v.isTodayOpen() && v.isGuildAct) {
                if (v.funcId == FunctionConst.FUNC_WORLD_BOSS) {
                    count = count + 2;
                } else {
                    count = count + 1;
                }
            }
        }
        return count;
    }
    //判断活动是否开启
    public isActivityOpen(funcId) {
        if (!this._mainMenuActivityTimes) {
            this._initMainMenuLayerActivityIcons();
        }
        let curTime = G_ServerTime.getTime();
        for (let k in this._mainMenuActivityTimes) {
            let v = this._mainMenuActivityTimes[k];
            if (v.funcId == funcId) {
                let startTime = v.getStartTime();
                let endTime = v.getEndTime();
                let isOpen = v.isTodayOpen();
                let functionOpen = FunctionCheck.funcIsOpened(funcId)[0];
                //先判断活动是否今天开启
                //其次再判断是否时间是否满足
                //最后在判断函数是否开启
                return isOpen && curTime >= startTime && curTime < endTime && startTime > 0 && functionOpen;
            }
        }
        return false;
    }
}
