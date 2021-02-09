import { TimeConst } from "../const/TimeConst"
import { G_ServerTime } from "../init"

/**
 * --时间过期类，BaseData的基类
    -- 重置时间，小时为单位
 */
export class TimeExpiredData {
    //一天的秒数
    public static SECONDS_ONE_DAY = 86400
    public static SECONDS_ONE_WEEK = 604800


    public static RESET_TYPE_WEEKLY = 1
    public static RESET_TYPE_DAILY = 0
    public static RESET_TYPE_NONE = 2//不重置

    public _isExpired: boolean;
    public _lastUpdateTime: number;
    public _resetType: number;
    public _defaultResetTime: number;

    constructor() {
        this._isExpired = false;
        this._lastUpdateTime = 0;
        this._resetType = TimeExpiredData.RESET_TYPE_DAILY;
        this._defaultResetTime = TimeConst.RESET_TIME;
    }

    public setResetTime(time) {
        this._defaultResetTime = time;
    }

    public resetTime(time?) {
        this._isExpired = false;
        this._lastUpdateTime = time || G_ServerTime.getTime();
    }

    public isExpired(resetTime?): boolean {
        this._resetType = this._resetType || TimeExpiredData.RESET_TYPE_DAILY;
        if (this._resetType == TimeExpiredData.RESET_TYPE_NONE) {
            return false;
        }
        var resetTime = resetTime != null && resetTime || this._defaultResetTime;
        resetTime = resetTime || TimeConst.RESET_TIME;
        if (!this._isExpired) {
            var curTime = G_ServerTime.getTime();
            if (this._lastUpdateTime == 0) {
                this._isExpired = true;
            } else if (curTime > this._lastUpdateTime) {
                var nextUpdateTime = 0;
                if (this._resetType == TimeExpiredData.RESET_TYPE_DAILY) {
                    nextUpdateTime = this._calNextExpiredTimeOfDaily(resetTime, this._lastUpdateTime);
                } else if (this._resetType == TimeExpiredData.RESET_TYPE_WEEKLY) {
                    nextUpdateTime = this._calNextExpiredTimeOfWeekly(1, resetTime, this._lastUpdateTime);
                }
                this._isExpired = curTime >= nextUpdateTime;
            }
        }
        this._isExpired
    }

    public getExpiredTime(resetTime, isAccordingCurrTime): number {
        this._resetType = this._resetType || TimeExpiredData.RESET_TYPE_DAILY;
        if (this._resetType == TimeExpiredData.RESET_TYPE_NONE) {
            return 0;
        }
        var resetTime = resetTime != null && resetTime || this._defaultResetTime;
        resetTime = resetTime || TimeConst.RESET_TIME;
        var curTime = G_ServerTime.getTime();
        var lastUpdateTime = isAccordingCurrTime && curTime || Math.min(this._lastUpdateTime, curTime);
        if (lastUpdateTime == 0) {
            lastUpdateTime = curTime;
        }
        var nextUpdateTime = 0;
        if (this._resetType == TimeExpiredData.RESET_TYPE_DAILY) {
            nextUpdateTime = this._calNextExpiredTimeOfDaily(resetTime, lastUpdateTime);
        } else if (this._resetType == TimeExpiredData.RESET_TYPE_WEEKLY) {
            nextUpdateTime = this._calNextExpiredTimeOfWeekly(1, resetTime, lastUpdateTime);
        }
        return nextUpdateTime;
    }

    public _calNextExpiredTimeOfDaily(resetTime, lastUpdateTime): number {
        var resetSeconds = resetTime * 3600;
        var lastSeconds = G_ServerTime.secondsFromToday(lastUpdateTime);
        var nextUpdateTime = lastUpdateTime - lastSeconds + resetSeconds + (lastSeconds >= resetSeconds && TimeExpiredData.SECONDS_ONE_DAY || 0);
        return nextUpdateTime;
    }

    public _calNextExpiredTimeOfWeekly(resetWeekDay, resetTime, lastUpdateTime): number {
        var resetSeconds = resetTime * 3600;
        var daySeconds = 24 * 3600;
        var todayPassedSeconds = G_ServerTime.secondsFromToday(lastUpdateTime);
        var weekDay = new Date(lastUpdateTime * 1000).getDay();
        if (weekDay == 0) {
            weekDay = 7;
        }
        var weekPassedSeconds = todayPassedSeconds + (weekDay - 1) * daySeconds;
        var weekResetSeconds = (resetWeekDay - 1) * daySeconds + resetSeconds;
        var nextUpdateTime = lastUpdateTime - weekPassedSeconds + weekResetSeconds + (weekPassedSeconds >= weekResetSeconds && TimeExpiredData.SECONDS_ONE_WEEK || 0);
        return nextUpdateTime;
    }

    public updateTime(time) {
        this._isExpired = false;
        this._lastUpdateTime = time || G_ServerTime.getTime();
    }

    public setNotExpire() {
        this.updateTime(G_ServerTime.getTime() + TimeConst.SET_EXPIRE_EXTRA_SECOND);
    }

    public reset() {
        this._isExpired = true;
        this._lastUpdateTime = 0;
    }

    public clear() {
    }

    public setResetType(resetType) {
        this._resetType = resetType;
    }
}