import { BaseData } from './BaseData';
import { G_ConfigLoader } from '../init';
import { ConfigNameConst } from '../const/ConfigNameConst';
let schema = {};
schema['id'] = [
    'number',
    0
];
schema['awards'] = [
    'object',
    {}
];
schema['state'] = [
    'number',
    0
];
schema['value'] = [
    'number',
    0
];
schema['describle'] = [
    'string',
    ''
];
schema['gold'] = [
    'number',
    0
];
schema['coin'] = [
    'number',
    0
];
schema['percent'] = [
    'number',
    0
];
export interface ActivityResourceBackItemData {
getId(): number
setId(value: number): void
getLastId(): number
getAwards(): Object
setAwards(value: Object): void
getLastAwards(): Object
getState(): number
setState(value: number): void
getLastState(): number
getValue(): number
setValue(value: number): void
getLastValue(): number
getDescrible(): string
setDescrible(value: string): void
getLastDescrible(): string
getGold(): number
setGold(value: number): void
getLastGold(): number
getCoin(): number
setCoin(value: number): void
getLastCoin(): number
getPercent(): number
setPercent(value: number): void
getLastPercent(): number
}
export class ActivityResourceBackItemData extends BaseData {

    public static schema = schema;

    public clear () {
    }
    public reset () {
    }
    public updateData (message) {
        let id = message['id'];
        if (id) {
            this.setId(id);
        }
        let awards = message['awards'];
        if (awards) {
            this.setAwards(awards);
        }
        let state = message['state'];
        if (state) {
            this.setState(message.state || 0);
        }
        let value = message['value'];
        if (value) {
            this.setValue(value);
        }
        let ResourceRecoveryConfig = G_ConfigLoader.getConfig(ConfigNameConst.RESOURCE_RECOVERY);
        let config = ResourceRecoveryConfig.get(id || 0);
        console.assert(config != null, 'can not find resource_recovery id = ' + (id || 0));
        if (config) {
            this.setCoin(config.coin_price);
            this.setGold(config.acer_price);
            this.setPercent(config.percent / 100);
            this.setDescrible(config.name);
        }
    }
    public isAlreadyBuy () {
        return this.getState() == 1;
    }
}