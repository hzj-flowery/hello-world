import { BaseData } from "./BaseData";

export interface TextInputData {
    getLastInputCache(): Object
    setLastInputCache(value: Object): void
    getLastLastInputCache(): Object
}

let schema = {};
schema['lastInputCache'] = [
    'object',
    {}
];
export class TextInputData extends BaseData {
    public static schema = schema;

    public clear() {
    }
    public reset() {
    }
    public getLastTextInputByType(inputType) {
        if (!inputType) {
            return;
        }
        let inputCache = this.getLastInputCache();
        return inputCache[inputType];
    }
    public setLastTextInputByType(inputType, txt) {
        if (!inputType) {
            return;
        }
        let inputCache = this.getLastInputCache();
        inputCache[inputType] = txt;
    }
    public clearLastTextInputByType(inputType) {
        if (!inputType) {
            return;
        }
        let inputCache = this.getLastInputCache();
        inputCache[inputType] = '';
    }
}
