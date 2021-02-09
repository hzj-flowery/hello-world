import { BaseData } from "./BaseData";
let schema = {}

schema['showHeroTrainFlag'] = [
    'boolean',
    false
];
schema['showEquipTrainFlag'] = [
    'boolean',
    false
];
schema['showTreasureTrainFlag'] = [
    'boolean',
    false
];
schema['showInstrumentTrainFlag'] = [
    'boolean',
    false
];
schema['showHorseTrainFlag'] = [
    'boolean',
    false
];
schema['showAvatarEquipFlag'] = [
    'boolean',
    false
];
schema['showAvatarTrainFlag'] = [
    'boolean',
    false
];
schema['showHistoryHeroFlag'] = [
    'boolean',
    false
];

export interface TeamCacheData {
    isShowHistoryHeroFlag(): boolean
    setShowHistoryHeroFlag(value: boolean): void
    isShowHeroTrainFlag(): boolean
    setShowHeroTrainFlag(value: boolean): void
    isLastShowHeroTrainFlag(): boolean
    isShowEquipTrainFlag(): boolean
    setShowEquipTrainFlag(value: boolean): void
    isLastShowEquipTrainFlag(): boolean
    isShowTreasureTrainFlag(): boolean
    setShowTreasureTrainFlag(value: boolean): void
    isLastShowTreasureTrainFlag(): boolean
    isShowInstrumentTrainFlag(): boolean
    setShowInstrumentTrainFlag(value: boolean): void
    isLastShowInstrumentTrainFlag(): boolean
    isShowHorseTrainFlag(): boolean
    setShowHorseTrainFlag(value: boolean): void
    isLastShowHorseTrainFlag(): boolean
    isShowAvatarEquipFlag(): boolean
    setShowAvatarEquipFlag(value: boolean): void
    isLastShowAvatarEquipFlag(): boolean
    isShowAvatarTrainFlag(): boolean
    setShowAvatarTrainFlag(value: boolean): void
    isLastShowAvatarTrainFlag(): boolean
    
}

export class TeamCacheData extends BaseData {
    public static schema = schema;
    // constructor() {
    //     super();
    //     this.data = {
    //         //记录是否显示武将培养飘字的Flag
    //         showHeroTrainFlag: false,
    //         //记录是否显示装备培养飘字的Flag
    //         showEquipTrainFlag: false,
    //         //记录是否显示宝物培养飘字的Flag
    //         showTreasureTrainFlag: false,
    //         //记录是否显示神兵培养飘字的Flag
    //         showInstrumentTrainFlag: false,
    //         //记录是否显示战马培养飘字的Flag
    //         showHorseTrainFlag: false,
    //         //记录是否显示变身卡穿戴飘字的Flag
    //         showAvatarEquipFlag: false, 
    //         //记录是否显示变身卡培养飘字的Flag
    //         showAvatarTrainFlag: false
    //     }
    // }

}