import { G_GameAgent, G_NetworkManager } from "../init";
import { CustomActivityService } from "../service/CustomActivityService";
import { ActivityService } from "../service/ActivityService";
import { Day7ActivityService } from "../service/Day7ActivityService";
import { RecruitService } from "../service/RecruitService";
import { TerritoryService } from "../service/TerritoryService";
import { ShopService } from "../service/ShopService";
import { DataResetService } from "../service/DataResetService";
import { AlarmClockService } from "../service/AlarmClockService";
import { MailDeleteService } from "../service/MailDeleteService";
import { GuildService } from "../service/GuildService";
import { ChapterDataService } from "../service/ChapterDataService";
import { MineDataService } from "../service/MineDataService";
import { OnlineTimeService } from "../service/OnlineTimeService";
import { BaseService } from "../service/BaseService";

const { ccclass } = cc._decorator

@ccclass
export default class ServiceManager {
    public _serviceList: BaseService[];
    constructor() {
        this._serviceList = [];
        this.registerService('CustomActivityService', new CustomActivityService());
        this.registerService('ActivityService', new ActivityService());
        this.registerService('Day7ActivityService', new Day7ActivityService());
        this.registerService('RecruitService', new RecruitService());
        this.registerService('TerritoryService', new TerritoryService());
        this.registerService('ShopService', new ShopService());
        this.registerService('DataResetService', new DataResetService());
        this.registerService('AlarmClockService', new AlarmClockService());
        this.registerService('MailDeleteService', new MailDeleteService());
        this.registerService('GuildService', new GuildService());
        this.registerService('ChapterDataService', new ChapterDataService());
        this.registerService('MineDataService', new MineDataService());
        if (!G_GameAgent.isRealName()) {
            this.registerService('OnlineTimeService', new OnlineTimeService());
        }
        cc.director.getScheduler().enableForTarget(this);
    }

    public start() {
        for (let k in this._serviceList) {
            var v = this._serviceList[k];
            v.initData();
        }
        cc.director.getScheduler().schedule(this._tick, this, 1);
        // if (this._tickHandler != null) {
        //     return;
        // }
        // this._tickHandler = SchedulerHelper.newSchedule(handler(this, this._tick), 1);
        this._tick();
    }

    public _tick() {
        if (!G_NetworkManager.isConnected()) {
            return;
        }
        for (let k in this._serviceList) {
            var v = this._serviceList[k];
            if (v.isStart()) {
                v.tick();
            }
        }
    }
    public registerService(name, service) {
        this._serviceList[name] = service;
    }
    public removeService(name) {
        var service = this._serviceList[name];
        if (service) {
            service.clear();
            this._serviceList[name] = null;
        }
    }
    public getService(name) {
        return this._serviceList[name];
    }
    public stop() {
        cc.director.getScheduler().unschedule(this._tick, this);
        // if (this._tickHandler != null) {
        //     SchedulerHelper.cancelSchedule(this._tickHandler);
        //     this._tickHandler = null;
        // }
        for (let k in this._serviceList) {
            var v = this._serviceList[k];
            v.clear();
        }
    }
    public registerOneAlarmClock(tag, time, callback) {
        var alarmClock = this._serviceList['AlarmClockService'];
        if (alarmClock) {
            alarmClock.registerAlarmClock(tag, time, callback);
        }
    }
    public DeleteOneAlarmClock(tag) {
        var alarmClock = this._serviceList['AlarmClockService'];
        if (alarmClock) {
            alarmClock.deleteAlarmClock(tag);
        }
    }
}
