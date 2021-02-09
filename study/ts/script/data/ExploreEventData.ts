import { BaseData } from "./BaseData";
import { G_ConfigLoader } from "../init";
import { ConfigNameConst } from "../const/ConfigNameConst";

let schema = {};
schema['event_id'] = [
    'number',
    0
];

schema['event_type'] = [
    'number',
    0
];

schema['event_time'] = [
    'number',
    0
];

schema['value1'] = [
    'number',
    0
];

schema['value2'] = [
    'number',
    0
];

schema['value3'] = [
    'number',
    0
];

schema['value4'] = [
    'number',
    0
];

schema['value5'] = [
    'number',
    0
];

schema['value6'] = [
    'number',
    0
];

schema['value7'] = [
    'number',
    0
];

schema['value8'] = [
    'number',
    0
];

schema['param'] = [
    'number',
    0
];

schema['endTime'] = [
    'number',
    0
];
export interface ExploreEventData {
    getEvent_id(): number
    setEvent_id(value: number): void
    getLastEvent_id(): number
    getEvent_type(): number
    setEvent_type(value: number): void
    getLastEvent_type(): number
    getEvent_time(): number
    setEvent_time(value: number): void
    getLastEvent_time(): number
    getValue1(): number
    setValue1(value: number): void
    getLastValue1(): number
    getValue2(): number
    setValue2(value: number): void
    getLastValue2(): number
    getValue3(): number
    setValue3(value: number): void
    getLastValue3(): number
    getValue4(): number
    setValue4(value: number): void
    getLastValue4(): number
    getValue5(): number
    setValue5(value: number): void
    getLastValue5(): number
    getValue6(): number
    setValue6(value: number): void
    getLastValue6(): number
    getValue7(): number
    setValue7(value: number): void
    getLastValue7(): number
    getValue8(): number
    setValue8(value: number): void
    getLastValue8(): number
    getParam(): number
    setParam(value: number): void
    getLastParam(): number
    getEndTime(): number
    setEndTime(value: number): void
    getLastEndTime(): number
}
export class ExploreEventData extends BaseData {
    public static schema = schema;
    _updateEventTime() {
        var type = this.getEvent_type();
        var discoverData = G_ConfigLoader.getConfig(ConfigNameConst.EXPLORE_DISCOVER).get(type);
        if (!discoverData) {
            console.error('discoverData = null');
        }
        if (discoverData.time && discoverData.time > 0) {
            var endtime: number = this.getEvent_time() || Math.floor(Date.now() / 1000);
            this.setEndTime(endtime + discoverData.time);
        }
    }
    updateData(data) {
        this.setEvent_id(data.event_id);
        this.setEvent_type(data.event_type);
        this.setValue1(data.value1);
        this.setValue2(data.value2);
        this.setValue3(data.value3);
        this.setValue4(data.value4);
        this.setValue5(data.value5);
        this.setValue6(data.value6);
        this.setValue7(data.value7);
        this.setValue8(data.value8);
        this.setEvent_time(data.event_time);
        this._updateEventTime();
    }
    updateDataByMessage(message) {
        this.setValue1(message.value1);
        this.setValue2(message.value2);
        this.setValue3(message.value3);
        this.setValue4(message.value4);
        this.setValue5(message.value5);
        this.setValue6(message.value6);
        this.setValue7(message.value7);
        this.setValue8(message.value8);
        this._updateEventTime();
    }
}