import { BaseData } from "./BaseData";

export interface SingleRaceGuessUnitData {
    getAnswer_id(): number
    setAnswer_id(value: number): void
    getLastAnswer_id(): number
    getSupport(): Object
    setSupport(value: Object): void
    getLastSupport(): Object
    getMy_support(): number
    setMy_support(value: number): void
    getLastMy_support(): number
}
let schema = {};
schema['answer_id'] = [
    'number',
    0
];
schema['support'] = [
    'object',
    {}
];
schema['my_support'] = [
    'number',
    0
];
export class SingleRaceGuessUnitData extends BaseData {
    public static schema = schema;
    _guessDatas;

    constructor(properties?) {
        super(properties);
        this._guessDatas = {};
    }
    public clear() {
    }
    public reset() {
        this._guessDatas = {};
    }
    public updateData(data) {
        this.setProperties(data);
        this._guessDatas = {};
        let supports = data['support'] || {};
        for (let i in supports) {
            let support = supports[i];
            this.updateSupport(support);
        }
    }
    public updateSupport(support) {
        let supportId = support['support_id'] || 0;
        let supportNum = support['support_num'] || 0;
        this._guessDatas[supportId] = supportNum;
    }
    public getGuessDatas() {
        return this._guessDatas;
    }
    public isVoted() {
        return this.getMy_support() > 0;
    }
    public getSupportNumWithId(id) {
        let supportNum = this._guessDatas[id];
        return supportNum || 0;
    }
}
