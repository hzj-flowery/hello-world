import { BaseData } from './BaseData';
import { G_UserData, G_ServerTime } from '../init';
import { Lang } from '../lang/Lang';
import { TimeLimitActivityConst } from '../const/TimeLimitActivityConst';
import CommonConst from '../const/CommonConst';
import { FunctionCheck } from '../utils/logic/FunctionCheck';
import { TimeConst } from '../const/TimeConst';
let schema = {};
schema['id'] = [
    'number',
    0
];
schema['sprint_type'] = [
    'number',
    0
];
schema['name'] = [
    'string',
    ''
];
schema['function_id'] = [
    'number',
    0
];
schema['is_work'] = [
    'number',
    0
];
schema['open_day'] = [
    'number',
    0
];
schema['over_day'] = [
    'number',
    0
];
schema['over_view_day'] = [
    'number',
    0
];
schema['order'] = [
    'number',
    0
];
schema['activity_content_text'] = [
    'string',
    ''
];
export interface ActivitySevenDaySprintInfoData {
getId(): number
setId(value: number): void
getLastId(): number
getSprint_type(): number
setSprint_type(value: number): void
getLastSprint_type(): number
getName(): string
setName(value: string): void
getLastName(): string
getFunction_id(): number
setFunction_id(value: number): void
getLastFunction_id(): number
getIs_work(): number
setIs_work(value: number): void
getLastIs_work(): number
getOpen_day(): number
setOpen_day(value: number): void
getLastOpen_day(): number
getOver_day(): number
setOver_day(value: number): void
getLastOver_day(): number
getOver_view_day(): number
setOver_view_day(value: number): void
getLastOver_view_day(): number
getOrder(): number
setOrder(value: number): void
getLastOrder(): number
getActivity_content_text(): string
setActivity_content_text(value: string): void
getLastActivity_content_text(): string
}
export class ActivitySevenDaySprintInfoData extends BaseData {

    public static schema = schema;
    constructor (properties?) {
        super(properties);
        if (properties) {
            this.updateData(properties);
        }
    }
    public clear () {
    }
    public reset () {
    }
    public updateData (data) {
        this.setProperties(data);
    }
    public getType () {
        return this.getSprint_type();
    }
    public getDescription () {
        let des = this.getActivity_content_text();
        let actType = this.getSprint_type();
        let finalDes = des;
        if (actType == TimeLimitActivityConst.ACTIVITY_TYPE_GUILD_SPRINT) {
            finalDes = Lang.getTxt(des, { num: this.getOver_day() }) || '';
        }
        return finalDes;
    }
    public isActivityCompetitionTimeEnd () {
        let openDays = G_UserData.getBase().getOpenServerDayNum();
        return openDays >= this.getOver_day();
    }
    public getActivityStartEndTime () {
        let openServerTime = G_UserData.getBase().getServer_open_time();
        let openZeroTime = G_ServerTime.secondsFromZero(openServerTime, TimeConst.RESET_TIME_SECOND);
        let startTime = openZeroTime + (this.getOpen_day() - 1) * (3600 * 24);
        let endTime = openZeroTime + (this.getOver_view_day() - 1) * (3600 * 24);
        let competitionEndTime = openZeroTime + (this.getOver_day() - 1) * (3600 * 24);
        return [
            startTime,
            endTime,
            competitionEndTime
        ];
    }
    public isActivityOpen () {
        if (!this.isOpenCheckFunc()) {
            return false;
        }
        let openDays = G_UserData.getBase().getOpenServerDayNum();
        if (openDays >= this.getOpen_day() && openDays < this.getOver_view_day()) {
            return true;
        }
        return false;
    }

    private isOpenCheckFunc(){
        return this.getIs_work() == CommonConst.TRUE_VALUE && (this.getFunction_id() == 0 && true || FunctionCheck.funcIsOpened(this.getFunction_id())[0]);
    }
}
 ActivitySevenDaySprintInfoData;