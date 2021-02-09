import { ConfigNameConst } from "../const/ConfigNameConst";
import { G_ConfigLoader, G_UserData } from "../init";
import { HeroDataHelper } from "../utils/data/HeroDataHelper";
import { UserDataHelper } from "../utils/data/UserDataHelper";
import { DropHelper } from "../utils/DropHelper";
import { TypeConvertHelper } from "../utils/TypeConvertHelper";
import { BaseData } from "./BaseData";

let schema = {};
schema['id'] = [
    'number',
    0
];
schema['breward'] = [
    'number',
    0
];
schema['sreward'] = [
    'number',
    0
];
schema['greward'] = [
    'number',
    0
];
schema['preward'] = [
    'number',
    0
];
schema['has_entered'] = [
    'boolean',
    false
];
schema['showEnding'] = [
    'boolean',
    false
];
schema['configData'] = [
    'object',
    {}
];
schema['stageIdList'] = [
    'object',
    {}
];
schema['bossId'] = [
    'number',
    0
];
schema['bossState'] = [
    'number',
    0
];
schema['showRunningMap'] = [
    'boolean',
    false
];

export interface ChapterBaseData {

    getId(): number
    setId(value: number): void
    getLastId(): number
    getBreward(): number
    setBreward(value: number): void
    getLastBreward(): number
    getSreward(): number
    setSreward(value: number): void
    getLastSreward(): number
    getGreward(): number
    setGreward(value: number): void
    getLastGreward(): number
    getPreward(): number
    setPreward(value: number): void
    getLastPreward(): number
    isHas_entered(): boolean
    setHas_entered(value: boolean): void
    isLastHas_entered(): boolean
    isShowEnding(): boolean
    setShowEnding(value: boolean): void
    isLastShowEnding(): boolean
    getConfigData(): any
    setConfigData(value: any): void
    getLastConfigData(): any
    getStageIdList(): any[]
    setStageIdList(value: any[]): void
    getLastStageIdList(): any[]
    getBossId(): number
    setBossId(value: number): void
    getLastBossId(): number
    getBossState(): number
    setBossState(value: number): void
    getLastBossState(): number
    isShowRunningMap(): boolean
    setShowRunningMap(value: boolean): void
    isLastShowRunningMap(): boolean
}
export class ChapterBaseData extends BaseData {
    public static schema = schema;

    public updateData(data) {
        this.setProperties(data);
    }

    public isLastStagePass() {
        var stageData = G_UserData.getStage();
        var list = this.getStageIdList();
        var stage = stageData.getStageById(list[list.length - 1]);
        if (stage.getStar() != 0) {
            return true;
        }
        return false;
    }

    public getChapterStar() {
        var stageData = G_UserData.getStage();
        var list = this.getStageIdList();
        var totalStar = 0;
        for (let i = 0; i < list.length; i++) {
            var id = list[i];
            var stage = stageData.getStageById(id);
            var star = stage.getStar();
            totalStar = totalStar + star;
        }
        return totalStar;
    }

    public getOpenStage() {
        var stageData = G_UserData.getStage();
        var list = this.getStageIdList();
        var openList = [];
        var stage = stageData.getStageById(list[0]);
        openList.push(stage);

        for (let i = 0; i < list.length; i++) {
            var v = list[i];
            var stage = stageData.getStageById(v);
            if (stage.getStar() != 0) {
                var nextId = stage.getConfigData().next_id;
                var isInChapter = false;
                for (let j = 0; j < list.length; j++) {
                    var id = list[j];
                    if (nextId == id) {
                        isInChapter = true;
                        break;
                    }

                }
                if (isInChapter) {
                    var nextStage = stageData.getStageById(nextId);
                    openList.push(nextStage);
                }
            }

        }
        return openList;
    }

    public canGetStageBoxReward() {
        var stageData = G_UserData.getStage();
        var list = this.getStageIdList();
        for (let i = 0; i < list.length; i++) {
            var v = list[i];
            var stage = stageData.getStageById(v);
            var stageCfg = stage.getConfigData();
            if (stageCfg.box_id != 0) {
                var isPass = stage.isIs_finished();
                var isGet = stage.isReceive_box();
                var canGet = isPass && !isGet;
                if (canGet) {
                    return true;
                }
            }

        }
        return false;
    }

    public canGetStarBox() {
        var stars = this.getChapterStar();
        var chapterInfo = this.getConfigData();
        if (stars >= chapterInfo.copperbox_star && chapterInfo.copperbox_star > 0 && this.getBreward() == 0) {
            return true;
        } else if (stars >= chapterInfo.silverbox_star && chapterInfo.silverbox_star > 0 && this.getSreward() == 0) {
            return true;
        } else if (stars >= chapterInfo.goldbox_star && chapterInfo.goldbox_star > 0 && this.getGreward() == 0) {
            return true;
        }
        if (this.isLastStagePass() && this.getPreward() == 0) {
            return true;
        }
        return false;
    }

    public needShowEndStory() {
        var stages = this.getStageIdList();
        var stageId = stages[stages.length];
        var stageData = G_UserData.getStage().getStageById(stageId);
        if (stageData.isIs_finished() && this.isShowEnding()) {
            return true;
        }
        return false;
    }

    public getChapterFinishState(): any[] {
        var isFinish = true;
        var totalStar = 0;
        var getStar = 0;
        var stageList = this.getStageIdList();
        for (let i = 0; i < stageList.length; i++) {
            var val = stageList[i];
            var stageData = G_UserData.getStage().getStageById(val);
            if (stageData) {
                if (!stageData.isIs_finished()) {
                    isFinish = false;
                }
                getStar = getStar + stageData.getStar();
            }
            totalStar = totalStar + 3;
        }

        return [
            isFinish,
            getStar,
            totalStar
        ];
    }

    public getDropHintDatas() {

        var stageData = G_UserData.getStage();
        var list = this.getStageIdList();
        var heroList = {};
        for (let i = 0; i < list.length; i++) {
            var v = list[i];
            var stage = stageData.getStageById(v);
            var stageCfg = stage.getConfigData();
            var isFinish = stage.isIs_finished();
            var awards = DropHelper.getStageDrop(stageCfg);
            if (isFinish) {
                for (let j = 0; j < awards.length; j++) {
                    var v = awards[j];
                    if (v.type == TypeConvertHelper.TYPE_HERO || v.type == TypeConvertHelper.TYPE_FRAGMENT || v.type == TypeConvertHelper.TYPE_EQUIPMENT) {
                        var reward: any = {};
                        for (const key in v) {
                            reward[key] = v[key];
                        }
                        heroList[v.type + ('_' + v.value)] = reward;
                        reward.order = stageCfg.id * 10 + j;
                    }

                }
            }

        }

        var Hero = G_ConfigLoader.getConfig(ConfigNameConst.HERO);
        var heroRewardList = [];
        for (const k in heroList) {
            var v = heroList[k];
            var baseId = 0;
            var equipId = 0;
            v.isEquip = false;
            if (v.type == TypeConvertHelper.TYPE_HERO) {
                baseId = v.value;
            } else if (v.type == TypeConvertHelper.TYPE_FRAGMENT) {
                var param = TypeConvertHelper.convert(v.type, v.value, v.size);
                baseId = param.cfg.comp_type == TypeConvertHelper.TYPE_HERO && param.cfg.comp_value || 0;
                equipId = param.cfg.comp_type == TypeConvertHelper.TYPE_EQUIPMENT && param.cfg.comp_value || 0;
            } else if (v.type == TypeConvertHelper.TYPE_EQUIPMENT) {
                equipId = v.value;
            }
            if (baseId > 0) {
                var heroConfig = Hero.get(baseId);
                if (G_UserData.getTeam().isInBattleWithBaseId(baseId) || HeroDataHelper.isHaveKarmaWithHeroBaseId(baseId) || UserDataHelper.isShowYokeMark(baseId) || heroConfig.color >= 6) {
                    heroRewardList.push(v);
                }
            }
            if (equipId > 0 && UserDataHelper.isNeedEquipWithBaseId(equipId)) {
                v.isEquip = true;
                heroRewardList.push(v);
            }
        }
        var sortFunc = function (v1, v2) {
            if (v1.isEquip != v2.isEquip) {
                return v1.isEquip;
            }
            return v1.order - v2.order;
        };
        heroRewardList.sort(sortFunc)
        return heroRewardList;
    }
}