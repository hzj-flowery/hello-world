import { Lang } from "../lang/Lang";
import { TimeConst } from "../const/TimeConst";
import { Util } from "../utils/Util";

/**
 * 服务器时间类
 */
export class ServerTimeManager {

    private _zone: number;
    private _diff: number;
    private _t: number;
    private _lastSetTime: number;

    constructor() {
        this._zone = 8;// 默认服务器时区,北京时区
        this._diff = 0;// 客户端时区比服务器时区快了多少秒
        this._t = Math.floor(new Date().getTime() / 1000);// 时间戳
        this._lastSetTime = new Date().getTime();// 最后一次setTime时, 本地时间点
    }

    public setTime(t: number, zone: number) {
        this._t = t;
        this._zone = zone;
        this._lastSetTime = new Date().getTime();
        this._diff = this.get_timezone() - zone * 3600;
    }

    //获取当前的服务器时间戳
    public getTime(): number {
        var elapsed = new Date().getTime() - this._lastSetTime;
        var elapsedTemp = Math.floor(elapsed * 0.001);
        return this._t + elapsedTemp;
    }

    public getTimeElapsed(): number {
        var elapsed = new Date().getTime() - this._lastSetTime;
        return this._t + elapsed * 0.001;
    }

    public getMSTime() {
        var elapsed = new Date().getTime() - this._lastSetTime;
        return this._t * 1000 + elapsed;
    }

    //指定时间的格林时间
    public isOldEnough(year, month, day): boolean {

        let time: number = this.getTime();

        let openYear: number = time - Math.floor(18 * 365.25 * 24 * 3600);
        var opendate = this.getDateObject(openYear);
        if (year < opendate.getFullYear()) {
            return true;
        } else if (year == opendate.getFullYear() && month < opendate.getMonth()) {
            return true;
        } else if (year == opendate.getFullYear() && month == opendate.getMonth() && day <= opendate.getDate()) {
            return true;
        }
        return false;
    }

    public getDateObject(t?: number, zeroTime?: number): Date {
        if (t == null) {
            t = this.getTime();
        }
        zeroTime = zeroTime || 0;
        var localdate = new Date((t - this._diff - zeroTime) * 1000);
        return localdate;
    }

    public getWeekdayAndHour(t?: number) {
        var time = t || this.getTime();
        var localdate = this.getDateObject(t);
        var nowSecond = localdate.getHours() * 3600 + localdate.getMinutes() * 60 + localdate.getSeconds();
        let wDay: number = localdate.getDay();
        wDay = wDay == 0 ? 7 : wDay;
        return [
            wDay,
            nowSecond
        ];
    }

    //获取时间戳t对应的服务器时间的字符串
    public getTimeString(t) {
        var localdate = this.getDateObject(t);
        let str: string = this.dateFormat("yyyy/MM/dd HH:mm:ss", localdate);
        return str;
    }

    //获得过去多长时间hhmm
    public getPassTimeHHMM(timestamp: number) {
        var sec = this.getTime() - timestamp;
        var [hh, mm] = this.getCurrentHHMMSS(sec);
        return [
            hh,
            mm
        ];
    }

    //后去 已过去多长时间
    public getPassTime(timestamp) {
        var sec = this.getTime() - timestamp;
        var day = Math.floor(sec / 3600 / 24);
        var h = Math.floor(sec / 3600);
        var m = Math.floor(sec / 60);
        var str = '';
        if (day > 0) {
            str = Lang.get('someday', { day: day });
        } else if (h > 0) {
            str = Lang.get('somehour', { hour: h });
        } else if (m > 0) {
            str = Lang.get('somemin', { min: m });
        } else {
            str = Lang.get('somemin', { min: 1 });
        }
        return str;
    }

    //计算时间戳t还有多少秒
    //如果t已经过去了,那么返回负数
    public getLeftSeconds(t: number) {
        var nowTime = this.getTime();
        return t - nowTime;
    }

    //计算时间戳t还有多少秒, 并返回一个时间字符串
    //如果t已经过去了, 那么返回 "-"
    public getLeftSecondsString(t: number, customStr?) {
        var timeLeft = this.getLeftSeconds(t);
        if (timeLeft < 0) {
            if (customStr) {
                return customStr;
            }
            return '-';
        } else {
            var hour = (timeLeft - timeLeft % 3600) / 3600;
            var minute = (timeLeft - hour * 3600 - timeLeft % 60) / 60;
            var second = timeLeft % 60;
            var text = '';
            if (hour < 10) {
                text = text + ('0' + (hour + ':'));
            } else {
                text = text + (hour + ':');
            }
            if (minute < 10) {
                text = text + ('0' + (minute + ':'));
            } else {
                text = text + (minute + ':');
            }
            if (second < 10) {
                text = text + ('0' + second);
            } else {
                text = text + second;
            }
            return text;
        }
    }

    getLeftMinSecStr(t, customStr?) {
        var timeLeft = this.getLeftSeconds(t);
        if (timeLeft < 0) {
            if (customStr) {
                return customStr;
            }
            return '-';
        } else {
            var hour = (timeLeft - timeLeft % 3600) / 3600;
            var minute = (timeLeft - hour * 3600 - timeLeft % 60) / 60;
            var second = timeLeft % 60;
            var text = '';
            if (minute < 10) {
                text = text + ('0' + (minute + ':'));
            } else {
                text = text + (minute + ':');
            }
            if (second < 10) {
                text = text + ('0' + second);
            } else {
                text = text + second;
            }
            return text;
        }
    }

    //倒计时 toString ,不含天数
    public _secondToString(t: number) {
        var hour = (t - t % 3600) / 3600;
        var minute = (t - hour * 3600 - t % 60) / 60;
        var second = t % 60;
        var text = '';
        if (hour < 10) {
            text = text + ('0' + (hour + ':'));
        } else {
            text = text + (hour + ':');
        }
        if (minute < 10) {
            text = text + ('0' + (minute + ':'));
        } else {
            text = text + (minute + ':');
        }
        if (second < 10) {
            text = text + ('0' + second);
        } else {
            text = text + second;
        }
        return text;
    }

    //到分钟的string
    public minToString(t) {
        var hour = (t - t % 3600) / 3600;
        var minute = (t - hour * 3600 - t % 60) / 60;
        var second = t % 60;
        var text = '';
        if (hour < 10) {
            text = text + ('0' + (hour + ':'));
        } else {
            text = text + (hour + ':');
        }
        if (minute < 10) {
            text = text + ('0' + minute);
        } else {
            text = text + minute;
        }
        return text;
    }

    //到秒钟的string
    public secToString(t) {
        return this.tToString(t);
    }

    // 到分秒的string
    public secCountToString(t: number) {
        var minute = Math.floor(t / 60);
        var second = Math.floor(t % 60);
        return this.tToString(minute) + ":" + this.tToString(second);
    }

    private tToString(t) {
        let str: string = t < 10 ? "0" + t : t;
        return str;
    }

    public getCurrentHHMMSS(t) {
        var localdate = this.getDateObject(t);
        return [
            localdate.getHours(),
            localdate.getMinutes(),
            localdate.getSeconds()
        ];
    }

    public isTimeExpired(t, fixedHour) {
        var tNow = this.getTime();
        // console.log(tNow, new Date(tNow*1000).toLocaleString(), t, new Date(t*1000).toLocaleString(), this.secondsFromToday(t));
        // return this.secondsFromToday(t) < fixedHour * 3600 && this.secondsFromToday(tNow) >= fixedHour * 3600 || tNow - t >= 24 * 3600;
        return (this.secondsFromToday(t) < fixedHour * 3600) ? (this.secondsFromToday(tNow) >= fixedHour * 3600) : (tNow - t >= 24 * 3600);
    }

    public getLeftDHMFormat(t) {
        var leftTime = t - this.getTime();
        if (leftTime > 0) {
            var d = Math.floor(leftTime / (24 * 3600));
            leftTime = leftTime % (24 * 3600);
            var h = Math.floor(leftTime / 3600);
            leftTime = leftTime % 3600;
            var m = Math.floor(leftTime / 60);
            return Lang.get('common_time_DHM', {
                day: d,
                hour: h,
                minute: m
            });
        } else {
            return Lang.get('common_time_DHM', {
                day: 0,
                hour: 0,
                minute: 0
            });
        }
    }

    public getTimeStringDHMS(t) {
        let date: number[] = this.convertSecondToDayHourMinSecond(t);
        var day: number = date[0];
        var hour: number = date[1];
        var min: number = date[2];
        var second: number = date[3];
        var time = (Lang.get('common_time_DHMS_NEW') as any).format(day, hour, min, second);
        return time;
    }

    public getTimeStringHMS(t) {
        let date: number[] = this.convertSecondToDayHourMinSecond(t);
        var day: number = date[0];
        var hour: number = date[1];
        var min: number = date[2];
        var second: number = date[3];
        return (Lang.get('common_time_DHM') as any).format(hour, min, second);
    }
    public getTimeStringDHM(t) {
        var leftTime = t - this.getTime();
        let date: number[] = this.convertSecondToDayHourMinSecond(leftTime);
        var day: number = date[0];
        var hour: number = date[1];
        var min: number = date[2];
        var second: number = date[3];
        return (Lang.get('common_time_DHM_NEW') as any).format(day, hour, min, second);
    }
    public convertSecondToDayHourMinSecond(sec) {
        if (sec <= 0) {
            return [
                0,
                0,
                0,
                0
            ];
        }
        var day = Math.floor(sec / (3600 * 24));
        sec = sec - day * 3600 * 24;
        var h = Math.floor(sec / 3600);
        sec = sec - h * 3600;
        var m = Math.floor(sec / 60);
        sec = sec - m * 60;
        return [
            day,
            h,
            m,
            sec
        ];
    }

    public getLeftDHMSFormat(t) {
        var leftTime = t - this.getTime();
        var leftTime = t - this.getTime();
        let date: number[] = this.convertSecondToDayHourMinSecond(leftTime);
        var day: number = date[0];
        var hour: number = date[1];
        var min: number = date[2];
        var second: number = date[3];
        var time = (Lang.get('common_time_DHMS') as any).format(day, hour, min, second);
        return time;
    }

    public getLeftDHMSFormatEx(t) {
        var leftTime = t - this.getTime();
        var date: number[] = this.convertSecondToDayHourMinSecond(leftTime)
        var day = date[0];
        var hour = date[1];
        var min = date[2];
        var second = date[3];
        if (day >= 1) {
            var timeStr = Lang.get('common_time_D');
            return Util.format(timeStr, day, hour);
        }
        var timestr1 = Lang.get('common_time_DHM');
        var time = Util.format(timestr1, hour, min, second);
        return time;
    }

    public getLeftDHMSFormatD(t) {
        var leftTime = t - this.getTime();
        var [day, hour, min, second] = this.convertSecondToDayHourMinSecond(leftTime);
        if (day > 0) {
            return [true, Lang.get("common_time_D").format(day, hour)];
        } else {
            return [false, Lang.get("common_time_DHM").format(hour, min, second)]
        }
    }

    public getTimestampByHMS(_hour?, _min?, _second?) {
        var localdate = this.getDateObject();
        var hour = _hour || 0;
        var minute = _min || 0;
        var second = _second || 0;
        var stamp = new Date(localdate.getFullYear(), localdate.getMonth(),
            localdate.getDate(), hour, minute,
            second);
        return stamp;
    }

    public getTimestampBySeconds(seconds) {
        var localdate = this.getDateObject();
        var hour = (seconds - seconds % 3600) / 3600;
        var minute = (seconds - hour * 3600 - seconds % 60) / 60;
        var second = seconds % 60;
        var stamp = new Date(localdate.getFullYear(), localdate.getMonth(),
            localdate.getDate(), hour, minute,
            second).getTime() / 1000;
        return stamp || 0;
    }

    public getAutoRefreshTargetStamp(step, lastRefreshStamp) {
        var nowTime = this.getTime();
        var lastTime = lastRefreshStamp || nowTime;
        var lastDate = this.getDateObject(lastTime);
        var secFromLast = lastDate.getHours() * 3600 + lastDate.getMinutes() * 60 + lastDate.getSeconds();
        var lastStep = Math.floor(secFromLast / step);
        var targetTime = lastTime - secFromLast + (lastStep + 1) * step;
        return targetTime;
    }

    public getNextFixRefreshStamp(secList: any[], lastRefreshStamp) {
        var isFinded = false;
        var realNowTime = this.getTime();
        var nowTime = lastRefreshStamp || realNowTime;
        var targetTime = nowTime;
        if (secList == null || secList.length < 1) {
        }
        var secFromToday = this.secondsFromToday(nowTime);
        secList.sort(function (a, b) {
            return a - b;
        });

        for (var i = 0; i < secList.length; i++) {
            if (secFromToday < secList[i]) {
                targetTime = secList[i] + (nowTime - secFromToday);
                isFinded = true;
                break;
            }
        }
        if (isFinded == false) {
            targetTime = nowTime - secFromToday + 24 * 3600 + secList[1];
        }
        return targetTime;
    }

    public secondsFromToday(t?: number) {
        // console.log("secondsFromToday:", Math.floor(new Date().getTime() / 1000))
        var now = this.getTime();
        var date = this.getDateObject(now);
        var t1 = now - date.getHours() * 3600 - date.getMinutes() * 60 - date.getSeconds();
        t = t || now;
        return t - t1;
    }

    public getTodaySeconds(t?) {
        t = t || this.getTime();
        var date = this.getDateObject(t);
        return date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
    }

    public secondsFromZero(t?, zeroSeconds?) {
        t = t || this.getTime();
        zeroSeconds = zeroSeconds || 0;
        var date = this.getDateObject(t);
        var t1 = t - date.getHours() * 3600 - date.getMinutes() * 60 - date.getSeconds();
        if (t - t1 >= zeroSeconds) {
            t1 = t1 + zeroSeconds;
        } else {
            t1 = t1 - (3600 * 24 - zeroSeconds);
        }
        return t1;
    }

    public getNextCleanDataTime() {
        var cleanClock = 4 * 60 * 60;
        var oneDay = 24 * 60 * 60;
        var curTime = this.getTime();
        var date = this.getDateObject(curTime);
        var t1 = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
        var nextCleanDataClock = curTime - t1 + cleanClock;
        if (t1 > cleanClock) {
            nextCleanDataClock = nextCleanDataClock + oneDay;
        }
        return nextCleanDataClock;
    }

    public getNextZeroTime(time?) {
        var oneDay = 24 * 60 * 60;
        var curTime = time || this.getTime();
        var date = this.getDateObject(curTime);
        var t1 = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
        var nextZeroClock = curTime - t1 + oneDay;
        return nextZeroClock;
    }

    public getDayOrHourOrMinFormat(sec) {
        var date: number[] = this.convertSecondToDayHourMinSecond(sec)
        var day = date[0];
        var hour = date[1];
        var min = date[2];
        var second = date[3];
        if (day > 0) {
            return Lang.get('lang_common_format_day_unit', { day: day });
        } else {
            if (hour > 0) {
                return Lang.get('lang_common_format_hour_unit', { hour: hour });
            } else {
                min = min > 0 && min || 1;
                return Lang.get('lang_common_format_min_unit', { min: min });
            }
        }
    }

    public getDateAndTime(time) {
        var tab = this.getDateObject(time);
        function check(date) {
            if (date < 10) {
                date = '0' + date;
            }
            return date;
        }
        return [
            (Lang.get('common_time_month_day') as any).format(tab.getMonth() + 1, tab.getDate()),
            check(tab.getHours()) + (':' + (check(tab.getMinutes()) + (':' + check(tab.getSeconds()))))
        ];
    }

    public getDateAndTime2(time) {
        var tab = this.getDateObject(time);
        function check(date) {
            if (date < 10) {
                date = '0' + date;
            }
            return date;
        }
        return [
            (Lang.get('common_time_month_day2') as any).format(tab.getMonth() + 1, tab.getDate()),
            check(tab.getHours()) + (':' + (check(tab.getMinutes()) + (':' + check(tab.getSeconds()))))
        ];
    }

    public getSomeDayMidNightTimeByDiffDay(diffDay, resetHour) {
        var resetSeconds = resetHour * 3600;
        var currentTime = this.getTime();
        var todaySecond = this.secondsFromToday(currentTime);
        if (todaySecond >= resetSeconds) {
            diffDay = diffDay + 1;
        }
        var endTime = currentTime - todaySecond + resetSeconds + TimeConst.SECONDS_ONE_DAY * diffDay;
        return endTime;
    }

    public getRefreshTimeString(t) {
        var localdate = this.getDateObject(t);
        var time = (Lang.get('common_refresh_time_format') as any).format(
            localdate.getFullYear(), localdate.getMonth() + 1, localdate.getDate(), localdate.getHours());
        return time;
    }

    public getRefreshTimeStringYMD(t, type?) {
        var localdate = this.getDateObject(t);
        var time = (Lang.get('common_refresh_time_format_YMD') as any).format(
            localdate.getFullYear(), localdate.getMonth() + 1, localdate.getDate());
        if (type) {
            time = (Lang.get('common_refresh_time_format_YMD_' + type)).format(localdate.getFullYear(), localdate.getMonth() + 1, localdate.getDate());
        }
        return time;
    }

    public getRefreshTimeStringMD(t) {
        var localdate = this.getDateObject(t);
        var time = (Lang.get('common_refresh_time_format_MD') as any).format(
            localdate.getMonth() + 1, localdate.getDate());
        return time;
    }

    public getNextUpdateTime(lastUpdateTime, resetTime?) {
        if (resetTime == null) {
            resetTime = 4;
        }
        var resetSeconds = resetTime * 3600;
        var lastSeconds = this.secondsFromToday(lastUpdateTime);
        var nextUpdateTime = lastUpdateTime - lastSeconds + resetSeconds + (lastSeconds > resetSeconds && TimeConst.SECONDS_ONE_DAY || 0);
        var curTime = this.getTime();
        return [
            nextUpdateTime,
            curTime >= nextUpdateTime
        ];
    }

    public getTimeByWdayandSecond(wday, sec) {
        var now = this.getTime();
        var date = this.getDateObject(now);
        var t0 = now - date.getDay() * 86400 - date.getHours() * 3600 - date.getMinutes() * 60 - date.getSeconds();
        return t0 + wday * 86400 + sec;
    }

    public getNextHourCount(hour) {
        var now = this.getTime();
        var date = this.getDateObject(now);
        var t = 0;
        if (date.getHours() < hour) {
            t = now - date.getHours() * 3600 - date.getMinutes() * 60 - date.getSeconds() + hour * 3600;
        } else {
            t = now - date.getHours() * 3600 - date.getMinutes() * 60 - date.getSeconds() + hour * 3600 + 86400;
        }
        var time = t - now;
        return this.getTimeStringHMS(time);
    }

    // 计算本地时区比UTC0快了多少秒
    private get_timezone() {
        let nowDate = new Date();
        let timeDiff = -nowDate.getTimezoneOffset() * 60000;
        timeDiff = Math.floor(timeDiff / 1000);
        // console.log("[ServerTimeManager] get_timezone", timeDiff);
        // if (this.isDST()) {
        //     timeDiff += 3600;//夏令时会快一个小时
        // }
        return timeDiff;
    }

    private isDST() {
        var d1 = new Date(2000, 0, 1);
        var d2 = new Date(2000, 6, 1);
        return d1.getTimezoneOffset() != d2.getTimezoneOffset();
    }

    private dateFormat(fmt: string, date: Date): string {
        var o = {
            "M+": date.getMonth() + 1,     //月份 
            "d+": date.getDate(),     //日 
            "H+": date.getHours(),     //小时 
            "m+": date.getMinutes(),     //分 
            "s+": date.getSeconds(),     //秒 
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
            "S": date.getMilliseconds()    //毫秒 
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }

    public differenceInDays(start, end) {
        const _start = new Date(new Date(start * 1000).toLocaleDateString()).getTime();
        const _end = new Date(new Date(end * 1000).toLocaleDateString()).getTime();
        return Number(((_end - _start) / (24 * 60 * 60 * 1000)).toFixed());
    }
}