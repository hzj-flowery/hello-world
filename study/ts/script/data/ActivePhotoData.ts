import { BaseData } from './BaseData';
let schema = {};
schema['active_type'] = [
    'number',
    0
];
schema['active_id'] = [
    'number',
    0
];
export interface ActivePhotoData {
    getActive_type(): number;
    getLastActive_type(): number;
    setActive_type(value: number);
    getActive_id(): number;
    getLastActive_id(): number;
    setActive_id(value: number);
}

export class ActivePhotoData extends BaseData {
    public static schema = schema;
    public static KARMA_TYPE = 1;
    public static AVATAR_TYPE = 2;
    public static PET_TYPE = 3;
    public static HORSE_TYPE = 5;

    constructor (properties?) {
        super(properties)
    }
    public clear () {
    }
    public reset () {
    }
}