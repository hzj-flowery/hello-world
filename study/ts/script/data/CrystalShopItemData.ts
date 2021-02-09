import { BaseData } from './BaseData';
import { FunctionConst } from '../const/FunctionConst';
import { CountryBossHelper } from '../scene/view/countryboss/CountryBossHelper';
import { CampRaceHelper } from '../scene/view/campRace/CampRaceHelper';
import { GuildServerAnswerHelper } from '../scene/view/guildServerAnswer/GuildServerAnswerHelper';
import { GuildAnswerHelper } from '../scene/view/guildAnswer/GuildAnswerHelper';
import { UserCheck } from '../utils/logic/UserCheck';
import { LogicCheckHelper } from '../utils/LogicCheckHelper';
import { TimeConst } from '../const/TimeConst';
import { G_ConfigLoader } from '../init';
import { ConfigNameConst } from '../const/ConfigNameConst';
let schema = {};
schema['id'] = [
    'number',
    0
];

schema['value'] = [
    'number',
    0
];

schema['buy_count'] = [
    'number',
    0
];

schema['awards'] = [
    'object',
    {}
];

schema['pay_amount'] = [
    'number',
    0
];

schema['pay_type'] = [
    'number',
    0
];

schema['description'] = [
    'string',
    ''
];

schema['is_function'] = [
    'number',
    0
];

schema['is_work'] = [
    'number',
    0
];

schema['page'] = [
    'number',
    0
];

schema['buy_size'] = [
    'number',
    0
];

schema['function_id'] = [
    'number',
    0
];

export interface CrystalShopItemData {
    getId(): number
    setId(value: number): void
    getLastId(): number
    getValue(): number
    setValue(value: number): void
    getLastValue(): number
    getBuy_count(): number
    setBuy_count(value: number): void
    getLastBuy_count(): number
    getAwards(): Object
    setAwards(value: Object): void
    getLastAwards(): Object
    getPay_amount(): number
    setPay_amount(value: number): void
    getLastPay_amount(): number
    getPay_type(): number
    setPay_type(value: number): void
    getLastPay_type(): number
    getDescription(): string
    setDescription(value: string): void
    getLastDescription(): string
    getIs_function(): number
    setIs_function(value: number): void
    getLastIs_function(): number
    getIs_work(): number
    setIs_work(value: number): void
    getLastIs_work(): number
    getPage(): number
    setPage(value: number): void
    getLastPage(): number
    getBuy_size(): number
    setBuy_size(value: number): void
    getLastBuy_size(): number
    getFunction_id(): number
    setFunction_id(value: number): void
    getLastFunction_id(): number
}
export class CrystalShopItemData extends BaseData {

    public static schema = schema;
    public static PAGE_RECHARGE = 2;

    constructor(properties?) {
        super(properties)
    }
    public isAlreadGet(page) {
        if (page == CrystalShopItemData.PAGE_RECHARGE) {
            return this.getBuy_count() >= this.getBuy_size();
        } else {
            return this.getBuy_count() > 0;
        }
    }
    public canGet(page) {
        if (page == CrystalShopItemData.PAGE_RECHARGE) {
            return this.getBuy_count() < this.getValue();
        } else {
            return this.getValue() >= this.getPay_amount();
        }
    }
    public canShow() {
        if (this.getIs_work() == 0) {
            return false;
        }
        let FunctionLevelConfig = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL);
        let functionConfig = FunctionLevelConfig.get(this.getFunction_id());
        if (!functionConfig || UserCheck.enoughOpenDay(functionConfig.day, TimeConst.RESET_TIME_24) == false) {
            return false;
        }
        let funcId = this.getIs_function();
        if (funcId && funcId != 0) {
            let isOpen = LogicCheckHelper.funcIsOpened(funcId)[0];
            if (!isOpen) {
                return false;
            }
        }
        if (funcId == FunctionConst.FUNC_COUNTRY_BOSS) {
            return CountryBossHelper.isTodayOpen();
        } else if (funcId == FunctionConst.FUNC_CAMP_RACE) {
            return CampRaceHelper.isOpenToday();
        } else if (funcId == FunctionConst.FUNC_GUILD_SERVER_ANSWER) {
            return GuildServerAnswerHelper.isTodayOpen();
        } else if (funcId == FunctionConst.FUNC_GUILD_ANSWER) {
            return GuildAnswerHelper.isTodayOpen();
        }
        return true;
    }
    public clear() {
    }
    public reset() {
    }
}