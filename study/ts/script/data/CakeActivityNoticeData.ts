import { BaseData } from './BaseData';
let schema = {};
schema['notice_id'] = [
    'number',
    0
];

schema['contents'] = [
    'object',
    {}
];

schema['fake'] = [
    'boolean',
    false
];

export interface CakeActivityNoticeData {
    getNotice_id(): number
    setNotice_id(value: number): void
    getLastNotice_id(): number
    getContents(): Object
    setContents(value: Object): void
    getLastContents(): Object
    isFake(): boolean
    setFake(value: boolean): void
    isLastFake(): boolean
}
export class CakeActivityNoticeData extends BaseData {
    public static schema = schema;

    public _contentDes;

    constructor(properties?) {
        super(properties)
        this._contentDes = {};
    }
    public reset() {
    }
    public clear() {
    }
    public updateData(data) {
        this.setProperties(data);
        this._contentDes = {};
        let contents = data['contents'] || {};
        for (let i in contents) {
            let content = contents[i];
            let key = content['key'];
            let value = content['value'];
            this._contentDes[key] = value;
        }
    }
    public getContentDesWithKey(key) {
        return this._contentDes[key] || '';
    }
    setContentDesWithKey(key, value) {
        this._contentDes[key] = value;
    }
}
CakeActivityNoticeData;