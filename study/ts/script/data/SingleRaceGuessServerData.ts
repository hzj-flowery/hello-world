import { BaseData } from "./BaseData";
import { ArraySort } from "../utils/handler";
import { clone, clone2 } from "../utils/GlobleFunc";

export interface SingleRaceGuessServerData {
    getServer_id(): number
    setServer_id(value: number): void
    getLastServer_id(): number
    getServer_name(): string
    setServer_name(value: string): void
    getLastServer_name(): string
    getPower(): number
    setPower(value: number): void
    getLastPower(): number
    isVoted(): boolean
    setVoted(value: boolean): void
    isLastVoted(): boolean
}
let schema = {};
schema['server_id'] = [
    'number',
    0
];
schema['server_name'] = [
    'string',
    ''
];
schema['power'] = [
    'number',
    0
];
schema['voted'] = [
    'boolean',
    false
];
export class SingleRaceGuessServerData extends BaseData {
    public static schema = schema;

    public _userDatas;

    constructor(properties?) {
        super(properties);
        this._userDatas = [];
    }
    public clear() {
    }
    public reset() {
        this._userDatas = [];
        this.setPower(0);
    }
    public initData(data) {
        this.setServer_id(data.getServer_id());
        this.setServer_name(data.getServer_name());
        this._userDatas = [];
        this.setPower(0);
    }
    public insertUser(user) {
        this._userDatas.push(user);
        let power = this.getPower();
        power = power + user.getPower();
        this.setPower(power);
    }
    public getUserDatas() {
        let result = this._userDatas;
        ArraySort(result, function (a, b) {
            return a.getPower() > b.getPower();
        });
        return result;
    }
}
