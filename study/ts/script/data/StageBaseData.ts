import { BaseData } from "./BaseData";
import { G_UserData, G_ConfigLoader } from "../init";
import { ChapterData } from "./ChapterData";
import { DropHelper } from "../utils/DropHelper";
import { TypeConvertHelper } from "../utils/TypeConvertHelper";
import { clone } from "../utils/GlobleFunc";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { UserDataHelper } from "../utils/data/UserDataHelper";

let schema = {};
schema['id'] = [
    'number',
    0
];
schema['star'] = [
    'number',
    0
];
schema['execute_count'] = [
    'number',
    0
];
schema['is_finished'] = [
    'boolean',
    false
];
schema['reset_count'] = [
    'number',
    0
];
schema['receive_box'] = [
    'boolean',
    false
];
schema['configData'] = [
    'object',
    {}
];
schema['killer'] = [
    'string',
    ''
];
schema['killerId'] = [
    'number',
    0
];

export interface StageBaseData {
    getId(): number
    setId(value: number): void
    getLastId(): number
    getStar(): number
    setStar(value: number): void
    getLastStar(): number
    getExecute_count(): number
    setExecute_count(value: number): void
    getLastExecute_count(): number
    isIs_finished(): boolean
    setIs_finished(value: boolean): void
    isLastIs_finished(): boolean
    getReset_count(): number
    setReset_count(value: number): void
    getLastReset_count(): number
    isReceive_box(): boolean
    setReceive_box(value: boolean): void
    isLastReceive_box(): boolean
    getConfigData(): any
    setConfigData(value: any): void
    getLastConfigData(): any
    getKiller(): string
    setKiller(value: string): void
    getLastKiller(): string
    getKillerId(): number
    setKillerId(value: number): void
    getLastKillerId(): number

}

export class StageBaseData extends BaseData {

    public static schema = schema;

    public updateData(data) {
        this.backupProperties();
        this.setProperties(data);
        var starOld = this.getLastStar();
        var starNew = data.star;
        var star = G_UserData.getChapter().getTotal_star();
        star = star - starOld + starNew;
        G_UserData.getChapter().getTotal_star();
    }

    public getDropHintDatas () {
        let heroList = {};
        let stageCfg = this.getConfigData();
        let isFinish = this.isIs_finished();
        let awards = DropHelper.getStageDrop(stageCfg);
        if (isFinish) {
            for (let k in awards) {
                let v = awards[k];
                if (v.type == TypeConvertHelper.TYPE_HERO || v.type == TypeConvertHelper.TYPE_FRAGMENT || v.type == TypeConvertHelper.TYPE_EQUIPMENT) {
                    let reward = clone(v);
                    heroList[v.type + ('_' + v.value)] = reward;
                    reward.order = stageCfg.id * 10 + k;
                }
            }
        }

        let Hero = G_ConfigLoader.getConfig(ConfigNameConst.HERO);
        let heroRewardList = [];
        for (let k in heroList) {
            let v = heroList[k];
            let baseId = 0;
            let equipId = 0;
            v.isEquip = false;
            if (v.type == TypeConvertHelper.TYPE_HERO) {
                baseId = v.value;
            } else if (v.type == TypeConvertHelper.TYPE_FRAGMENT) {
                let param = TypeConvertHelper.convert(v.type, v.value, v.size);
                baseId = param.cfg.comp_type == TypeConvertHelper.TYPE_HERO && param.cfg.comp_value || 0;
                equipId = param.cfg.comp_type == TypeConvertHelper.TYPE_EQUIPMENT && param.cfg.comp_value || 0;
            } else if (v.type == TypeConvertHelper.TYPE_EQUIPMENT) {
                equipId = v.value;
            }
            if (baseId > 0) {
                let heroConfig = Hero.get(baseId);
                console.assert(heroConfig, 'hero config can not find id = %d');
                if (G_UserData.getTeam().isInBattleWithBaseId(baseId) || UserDataHelper.isHaveKarmaWithHeroBaseId(baseId) || UserDataHelper.isShowYokeMark(baseId) || heroConfig.color >= 6) {
                    heroRewardList.push(v);
                }
            }
            if (equipId > 0 && UserDataHelper.isNeedEquipWithBaseId(equipId)) {
                v.isEquip = true;
                heroRewardList.push(v);
            }
        }
        let sortFunc = function (v1, v2) {
            if (v1.isEquip != v2.isEquip) {
                return v1.isEquip;
            }
            return v1.order < v2.order;
        };
        heroRewardList.sort(sortFunc);
        return heroRewardList;
    }
}