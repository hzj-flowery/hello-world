import { BaseData } from "./BaseData";
import { G_UserData, G_ConfigLoader } from "../init";
import InstrumentConst from "../const/InstrumentConst";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { InstrumentDataHelper } from "../utils/data/InstrumentDataHelper";
import { HeroDataHelper } from "../utils/data/HeroDataHelper";
import { LogicCheckHelper } from "../utils/LogicCheckHelper";
import { FunctionConst } from "../const/FunctionConst";
export interface InstrumentUnitData {
    getId(): number
    setId(value: number): void
    getLastId(): number
    getBase_id(): number
    setBase_id(value: number): void
    getLastBase_id(): number
    getLevel(): number
    setLevel(value: number): void
    getLastLevel(): number
    getLimit_level(): number
    setLimit_level(value: number): void
    getLastLimit_level(): number
    getLimit_res(): Object
    setLimit_res(value: Object): void
    getLastLimit_res(): Object
    getConfig(): any
    setConfig(value: any): void
    getLastConfig(): any
}
let schema = {};
schema['id'] = [
    'number',
    0
];
schema['base_id'] = [
    'number',
    0
];
schema['level'] = [
    'number',
    0
];
schema['limit_level'] = [
    'number',
    0
];
schema['limit_res'] = [
    'object',
    {}
];
schema['config'] = [
    'object',
    {}
];
export class InstrumentUnitData extends BaseData {
    public static schema = schema;
    updateData(data) {
        this.setProperties(data);
        var config = G_ConfigLoader.getConfig(ConfigNameConst.INSTRUMENT).get(data.base_id);
        if (!config)
            cc.error('instrument config can not find id = ' + (data.base_id));
        this.setConfig(config);
    }
    getPos() {
        var id = this.getId();
        var data = G_UserData.getBattleResource().getInstrumentDataWithId(id);
        if (data) {
            return data.getPos();
        } else {
            return null;
        }
    }
    getSlot() {
        var id = this.getId();
        var data = G_UserData.getBattleResource().getInstrumentDataWithId(id);
        if (data) {
            return data.getSlot();
        } else {
            return null;
        }
    }
    isInBattle() {
        var id = this.getId();
        var data = G_UserData.getBattleResource().getInstrumentDataWithId(id);
        if (data == null) {
            return false;
        } else {
            return true;
        }
    }
    isAdvanced() {
        return this.getLevel() >= 1;
    }
    isDidLimit() {
        if (this.getLimit_level() > 0) {
            return true;
        }
        for (var key = InstrumentConst.INSTRUMENT_LIMIT_COST_KEY_1; key <= InstrumentConst.INSTRUMENT_LIMIT_COST_KEY_2; key++) {
            var value = this.getLimitCostCountWithKey(key);
            if (value > 0) {
                return true;
            }
        }
        return false;
    }
    isDidTrain() {
        var isAdvanced = this.isAdvanced();
        if (isAdvanced) {
            return true;
        } else {
            return false;
        }
    }
    isUser() {
        return this.getId() != 0;
    }
    isLevelLimit() {
        var maxLevel = this.getConfig().level_max;
        var level = this.getLevel();
        return level >= maxLevel;
    }
    isCanAdvanced() {
        var level = this.getLevel();
        var templet = this.getAdvacneTemplateId();

        var config1: any = G_ConfigLoader.getConfig(ConfigNameConst.INSTRUMENT_LEVEL);
        var config = config1.get(level, templet);//config1.indexOf(config1["indexs"][level+"_"+templet])
        if (!config)
            cc.error(('instrument_level can\'t find level = %d, templet = %d'));
        var userLevel = G_UserData.getBase().getLevel();
        var isCan = userLevel >= config.limit_level;
        return [
            isCan,
            config.limit_level
        ];
    }
    isCanLimitBreak() {
        var rank = this.getConfig().instrument_rank_1;
        if (rank > 0) {
            return true;
        }
        return false;
    }
    isUnlockSecond() {
        var level = this.getLevel();
        var unlockLevel = this.getConfig().unlock_1;
        if (unlockLevel > 0 && level >= unlockLevel) {
            return true;
        }
        return false;
    }
    getLimitTemplateId() {
        var templateId = 0;
        var info = this.getConfig();
        templateId = info.instrument_rank_1;
        return templateId;
    }
    getAdvacneTemplateId() {
        var templateId = 0;
        var info = this.getConfig();
        var rankId = info.instrument_rank_1;
        var limitLevel = this.getLimit_level();
        if (limitLevel > 0 && rankId > 0) {
            templateId = InstrumentDataHelper.getInstrumentRankConfig(rankId, limitLevel).rank_size;
        } else {
            templateId = info.cost;
        }
        return templateId;
    }
    getLimitCostCountWithKey(key) {
        var limitRes = this.getLimit_res();
        for (var i in limitRes) {
            var info = limitRes[i];
            if (info.Key == key) {
                return info.Value;
            }
        }
        return 0;
    }
    getAdvanceMaxLevel() {
        var maxLevel = 0;
        var info = this.getConfig();
        if (this.isCanLimitBreak()) {
            var limitLevel = this.getLimit_level();
            if (limitLevel == this.getMaxLimitLevel()) {
                maxLevel = info.level_max;
            } else {
                var rankInfo = InstrumentDataHelper.getInstrumentRankConfig(info.instrument_rank_1, limitLevel);
                maxLevel = rankInfo.level;
            }
        } else {
            maxLevel = info.level_max;
        }
        return maxLevel;
    }
    getCountry() {
        var instrumentBaseId = this.getBase_id();
        var heroBaseId = G_UserData.getInstrument().getHeroBaseId(instrumentBaseId);
        var info = HeroDataHelper.getHeroConfig(heroBaseId);
        return info.country;
    }

    getMaxLimitLevel() {
        var info = this.getConfig();
        var level = 0;
        if (this.isCanLimitBreak()) {
            var rankInfo = InstrumentDataHelper.getInstrumentRankConfig(info.instrument_rank_1, level);
            while (rankInfo.cost_silver > 0 && rankInfo.value_1 > 0 && rankInfo.value_2 > 0) {
                level = level + 1;
                rankInfo = InstrumentDataHelper.getInstrumentRankConfig(info.instrument_rank_1, level);
            }
        }
        return level;
    }
    getLimitFuncShow() {
        var quality = this.getConfig().color;
        var isShow = false;
        if (quality == 5) {
            isShow = LogicCheckHelper.funcIsShow(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE2);
        } else if (quality == 6) {
            isShow = LogicCheckHelper.funcIsShow(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE2_RED);
        }
        return isShow;
    }
    getLimitFuncOpened() {
        var quality = this.getConfig().color;
        var open = false;
        if (quality == 5) {
            if (this.getLimit_level() == 0) {
                open = LogicCheckHelper.funcIsShow(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE2);
            } else if (this.getLimit_level() == 1) {
                open = LogicCheckHelper.funcIsShow(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE2_RED);
            }
        } else if (quality == 6) {
            open = LogicCheckHelper.funcIsShow(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE2_RED);
        }
        return open;
    }
    getLimitFuncRealOpened() {
        var quality = this.getConfig().color;
        var open = false;
        var comment = null;
        var info = null;
        if (quality == 5) {
            if (this.getLimit_level() == 0) {
                [open, comment, info] = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE2);
            } else if (this.getLimit_level() == 1) {
                [open, comment, info] = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE2_RED), comment = null, info = null;
            }
        } else if (quality == 6) {
            [open, comment, info] = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE2_RED), comment = null, info = null;
        }
        return [
            open,
            comment,
            info
        ];
    }
    isCanBeTransformSrc() {
        var changeType = this.getConfig().change_type;
        if (changeType == InstrumentConst.TRANSFORM_LIMIT_TYPE_1 || changeType == InstrumentConst.TRANSFORM_LIMIT_TYPE_3) {
            return false;
        } else {
            return true;
        }
    }
    isCanBeTranformTar() {
        var changeType = this.getConfig().change_type;
        if (changeType == InstrumentConst.TRANSFORM_LIMIT_TYPE_2 || changeType == InstrumentConst.TRANSFORM_LIMIT_TYPE_3) {
            return false;
        } else {
            return true;
        }
    }
}