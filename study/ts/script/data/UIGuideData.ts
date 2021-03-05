import { BaseData } from "./BaseData";
import { G_UserData, G_ConfigLoader } from "../init";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { UIGuideUnitData } from "./UIGuideUnitData";

export interface UIGuideData {
}
let schema = {};
export class UIGuideData extends BaseData {
    public static schema = schema;

    constructor(properties?) {
        super(properties);
    }
    public clear() {
    }
    public reset() {
    }
    public hasUIGuide(guideType, paramValue) {
        let cfg = this.findCfg(guideType, paramValue);
        if (!cfg) {
            return false;
        }
        return true;
    }
    public needShowGuide(guideType, paramValue) {
        let cfg = this.findCfg(guideType, paramValue);
        if (!cfg) {
            return false;
        }
        let level = G_UserData.getBase().getLevel();
        if (level < cfg.level_min || level > cfg.level_max) {
            return false;
        }
        return true;
    }
    public findCfg(guideType, paramValue) {
        paramValue = paramValue || 0;
        let level = G_UserData.getBase().getLevel();
        let guideCfg = null;
        let StoryStageGuide = G_ConfigLoader.getConfig(ConfigNameConst.STORY_STAGE_GUIDE);
        for (let i = 0; i < StoryStageGuide.length(); i += 1) {
            let cfg = StoryStageGuide.indexOf(i);
            if (cfg.type == guideType && cfg.value == paramValue) {
                guideCfg = cfg;
                break;
            }
        }
        return guideCfg;
    }
    public createUIGuideUnitData(guideType, paramValue) {
        let guideCfg = this.findCfg(guideType, paramValue);
        let unitData = new UIGuideUnitData();
        unitData.initData(guideCfg);
        return unitData;
    }
}
