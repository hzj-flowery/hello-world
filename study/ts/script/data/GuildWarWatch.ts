import { BaseData } from './BaseData';
let schema = {};
schema['city_id'] = [
    'number',
    0
];
schema['point_id'] = [
    'number',
    0
];
schema['watch_value'] = [
    'number',
    0
];
export interface GuildWarWatch {
    getCity_id(): number
    setCity_id(value: number): void
    getLastCity_id(): number
    getPoint_id(): number
    setPoint_id(value: number): void
    getLastPoint_id(): number
    getWatch_value(): number
    setWatch_value(value: number): void
    getLastWatch_value(): number

}
export class GuildWarWatch extends BaseData {

    public static schema = schema;

    public clear() {
    }
    public reset() {
    }
    public initData(data) {
        this.setProperties(data);
    }
}
