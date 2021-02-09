import { BaseData } from "./BaseData";
import { TimeConst } from "../const/TimeConst";
import { G_ServerTime } from "../init";

export interface ExpireStateData {
    isDataExpired(): boolean
    setDataExpired(value: boolean): void
    isLastDataExpired(): boolean
    getLastUpdateTime(): number
    setLastUpdateTime(value: number): void
    getLastLastUpdateTime(): number
    getResetType(): number
    setResetType(value: number): void
    getLastResetType(): number
}
let schema = {};
schema['dataExpired'] = [
    'boolean',
    false
];
schema['lastUpdateTime'] = [
    'number',
    0
];
schema['resetType'] = [
    'number',
    0
];
export class ExpireStateData extends BaseData {

    public static schema = schema;
    public static SECONDS_ONE_DAY = 86400;
    public static SECONDS_ONE_WEEK = 604800;
    public static RESET_TYPE_WEEKLY = 1;
    public static RESET_TYPE_DAILY = 0;
    public static RESET_TYPE_NONE = 2;

    constructor(properties?) {
        super(properties);
        this.setDataExpired(false);
        this.setLastUpdateTime(0);
    }
    public isExpired(resetTime) {
        if (this.getResetType() == ExpireStateData.RESET_TYPE_NONE) {
            return false;
        }
        resetTime = resetTime != null && resetTime || TimeConst.RESET_TIME;
        if (!this.isDataExpired()) {
            let curTime = G_ServerTime.getTime();
            if (this.getLastUpdateTime() == 0) {
                this.setDataExpired(true);
            } else if (curTime > this.getLastUpdateTime()) {
                let nextUpdateTime = 0;
                if (this.getResetType() == ExpireStateData.RESET_TYPE_DAILY) {
                    nextUpdateTime = this._calNextExpiredTimeOfDaily(resetTime, this.getLastUpdateTime());
                } else if (this.getResetType() == ExpireStateData.RESET_TYPE_WEEKLY) {
                    nextUpdateTime = this._calNextExpiredTimeOfWeekly(1, resetTime, this.getLastUpdateTime());
                }
                this.setDataExpired(curTime >= nextUpdateTime);
            }
        }
        return this.isDataExpired();
    }
    public getExpiredTime(resetTime, isAccordingCurrTime) {
        if (this.getResetType() == ExpireStateData.RESET_TYPE_NONE) {
            return 0;
        }
        resetTime = resetTime != null && resetTime || TimeConst.RESET_TIME;
        let curTime = G_ServerTime.getTime();
        let lastUpdateTime = isAccordingCurrTime && curTime || Math.min(this.getLastUpdateTime(), curTime);
        if (lastUpdateTime == 0) {
            lastUpdateTime = curTime;
        }
        let nextUpdateTime = 0;
        if (this.getResetType() == ExpireStateData.RESET_TYPE_DAILY) {
            nextUpdateTime = this._calNextExpiredTimeOfDaily(resetTime, lastUpdateTime);
        } else if (this.getResetType() == ExpireStateData.RESET_TYPE_WEEKLY) {
            nextUpdateTime = this._calNextExpiredTimeOfWeekly(1, resetTime, lastUpdateTime);
        }
        return nextUpdateTime;
    }
    public _calNextExpiredTimeOfDaily(resetTime, lastUpdateTime) {
        let resetSeconds = resetTime * 3600;
        let lastSeconds = G_ServerTime.secondsFromToday(lastUpdateTime);
        let nextUpdateTime = lastUpdateTime - lastSeconds + resetSeconds + (lastSeconds > resetSeconds && ExpireStateData.SECONDS_ONE_DAY || 0);
        return nextUpdateTime;
    }
    public _calNextExpiredTimeOfWeekly(resetWeekDay, resetTime, lastUpdateTime) {
        let resetSeconds = resetTime * 3600;
        let daySeconds = 24 * 3600;
        let todayPassedSeconds = G_ServerTime.secondsFromToday(lastUpdateTime);
        let weekDay = Number(new Date(lastUpdateTime).getDay());
        if (weekDay == 0) {
            weekDay = 7;
        }
        let weekPassedSeconds = todayPassedSeconds + (weekDay - 1) * daySeconds;
        let weekResetSeconds = (resetWeekDay - 1) * daySeconds + resetSeconds;
        let nextUpdateTime = lastUpdateTime - weekPassedSeconds + weekResetSeconds + (weekPassedSeconds > weekResetSeconds && ExpireStateData.SECONDS_ONE_WEEK || 0);
        return nextUpdateTime;
    }
    public updateTime(time) {
        this.setDataExpired(false);
        this.setLastUpdateTime(time || G_ServerTime.getTime());
    }
    public setNotExpire() {
        this.updateTime(G_ServerTime.getTime() + TimeConst.SET_EXPIRE_EXTRA_SECOND);
    }
    public reset() {
        this.setDataExpired(true);
        this.setLastUpdateTime(0);
    }
    public clear() {
    }
}
