import { BaseData } from './BaseData';
import { G_ConfigLoader } from '../init';
import { ConfigNameConst } from '../const/ConfigNameConst';

let schema = {};
schema['id'] = [
    'number',
    0
];
schema['config'] = [
    'object',
    {}
];
schema['hasData'] = [
    'boolean',
    false
];

export interface ActivityBaseData {
    getId(): number;
    setId(value: number);
    getLastId(): number;
    getConfig(): Object;
    setConfig(value: Object);
    getLastConfig(): Object;
    isHasData(): boolean;
    setHasData(value: boolean);
    getLastHasData(): boolean;
}
export class ActivityBaseData extends BaseData {
    public static schema = schema;

    public clear () {
    }
    public reset () {
        this.setHasData(false);
    }
    public initData (data) {
        let id = data.id;
        this.setId(id);
        let ActAdmin = G_ConfigLoader.getConfig(ConfigNameConst.ACT_ADMIN);
        let info = ActAdmin.get(id);
        console.assert(info, 'act_admin can\'t find id = ' + String(id));
        this.setConfig(info);
        this.setHasData(false);
    }
    public getActivityParameter (index) {
        let config = this.getConfig();
        let key = 'value_%d'.format(index);
        return config[key];
    }
}
 ActivityBaseData;