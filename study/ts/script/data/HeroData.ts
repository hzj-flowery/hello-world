import { ConfigNameConst } from "../const/ConfigNameConst"
import { FunctionConst } from "../const/FunctionConst"
import { MessageErrorConst } from "../const/MessageErrorConst"
import { MessageIDConst } from "../const/MessageIDConst"
import ParameterIDConst from "../const/ParameterIDConst"
import { SignalConst } from "../const/SignalConst"
import { G_ConfigLoader, G_NetworkManager, G_SignalManager, G_UserData } from "../init"
import { HeroDataHelper } from "../utils/data/HeroDataHelper"
import { TacticsDataHelper } from "../utils/data/TacticsDataHelper"
import { BaseData } from "./BaseData"
import { HeroUnitData } from "./HeroUnitData"
// import HeroDataHelper from "../utils/data/HeroDataHelper"

// 玩家拥有的所有武将数据
// Author: Liangxu
// Date: 2017-02-15 15:35:23
//


//预加载资源
/**
 * app.config.parameter
 * app.config.hero_fate
 * */

export interface HeroData {
    getCurHeroId(): number
    setCurHeroId(value: number): void
    getLastCurHeroId(): number
    isListDataDirty(): boolean
    setListDataDirty(value: boolean): void
    isLastListDataDirty(): boolean
    isRangeDataDirty(): boolean
    setRangeDataDirty(value: boolean): void
    isLastRangeDataDirty(): boolean
    isReplaceDataDirty(): boolean
    setReplaceDataDirty(value: boolean): void
    isLastReplaceDataDirty(): boolean
    isReplaceReinforcementDataDirty(): boolean
    setReplaceReinforcementDataDirty(value: boolean): void
    isLastReplaceReinforcementDataDirty(): boolean
    isRecoveryDataDirty(): boolean
    setRecoveryDataDirty(value: boolean): void
    isLastRecoveryDataDirty(): boolean
    isRecoveryAutoDataDirty(): boolean
    setRecoveryAutoDataDirty(value: boolean): void
    isLastRecoveryAutoDataDirty(): boolean
    isRebornDataDirty(): boolean
    setRebornDataDirty(value: boolean): void
    isLastRebornDataDirty(): boolean
    isFragmentDataDirty(): boolean
    setFragmentDataDirty(value: boolean): void
    isLastFragmentDataDirty(): boolean
    setLimitUpWithHero(value: boolean): void
    isLimitUpWithHero(): boolean
}
let schema = {};
schema['curHeroId'] = [
    'number',
    0
];
schema['listDataDirty'] = [
    'boolean',
    false
];
schema['rangeDataDirty'] = [
    'boolean',
    false
];
schema['replaceDataDirty'] = [
    'boolean',
    false
];
schema['replaceReinforcementDataDirty'] = [
    'boolean',
    false
];
schema['recoveryDataDirty'] = [
    'boolean',
    false
];
schema['recoveryAutoDataDirty'] = [
    'boolean',
    false
];
schema['rebornDataDirty'] = [
    'boolean',
    false
];
schema['fragmentDataDirty'] = [
    'boolean',
    false
];
schema['limitUpWithHero'] = [
    'boolean',
    false
];
export class HeroData extends BaseData {
    public static schema = schema;

    private _heroList: { [key: string]: HeroUnitData };
    private _cacheListData;
    private _cacheRangeData;
    private _cacheReplaceData;
    private _cacheRecoveryList;
    private _cacheRecoveryAutoList;
    private _cacheRebornList;
    private _heroFateMap;
    private _equipFateMap;
    private _treasureFateMap;
    private _instrumentFateMap;
    private _recvGetHero;
    private _recvHeroLevelUp;
    private _recvHeroRankUp;
    private _recvHeroRecycle;
    private _recvHeroReborn;
    private _recvHeroEquipAwaken;
    private _recvHeroAwaken;
    private _recvHeroTransform;
    private _recvHeroLimitLvPutRes;
    private _recvHeroLimitLvUp;
    private _recvHeroGoldRankLvUp;
    private _recvHeroGoldResource;

    private _tempList: Array<any>;
    constructor() {
        super()

        this._heroList = {}
        this._cacheListData = null //武将排序结果缓存
        this._cacheRangeData = null //武将切换排序结果缓存
        this._cacheReplaceData = null //武将替换排序结果缓存
        this._cacheRecoveryList = null //武将回收列表结果缓存
        this._cacheRecoveryAutoList = null //武将回收自动添加列表缓存
        this._cacheRebornList = null //武将重生列表结果缓存

        this._heroFateMap = {} //武将对应的和他相关的羁绊表
        this._equipFateMap = {} //装备对应的和他相关的羁绊表
        this._treasureFateMap = {} //宝物对应的和他相关的羁绊表
        this._instrumentFateMap = {} //神兵对应的和他相关的羁绊表
        this._tempList = [];

        this._recvGetHero = G_NetworkManager.add(MessageIDConst.ID_S2C_GetHero, this._s2cGetHero.bind(this))
        this._recvHeroLevelUp = G_NetworkManager.add(MessageIDConst.ID_S2C_HeroLevelUp, this._s2cHeroLevelUp.bind(this))
        this._recvHeroRankUp = G_NetworkManager.add(MessageIDConst.ID_S2C_HeroRankUp, this._s2cHeroRankUp.bind(this))
        this._recvHeroRecycle = G_NetworkManager.add(MessageIDConst.ID_S2C_HeroRecycle, this._s2cHeroRecycle.bind(this))
        this._recvHeroReborn = G_NetworkManager.add(MessageIDConst.ID_S2C_HeroReborn, this._s2cHeroReborn.bind(this))
        this._recvHeroEquipAwaken =
            G_NetworkManager.add(MessageIDConst.ID_S2C_HeroEquipAwaken, this._s2cHeroEquipAwaken.bind(this))
        this._recvHeroAwaken = G_NetworkManager.add(MessageIDConst.ID_S2C_HeroAwaken, this._s2cHeroAwaken.bind(this))
        this._recvHeroTransform =
            G_NetworkManager.add(MessageIDConst.ID_S2C_HeroTransform, this._s2cHeroTransform.bind(this))
        this._recvHeroLimitLvPutRes =
            G_NetworkManager.add(MessageIDConst.ID_S2C_HeroLimitLvPutRes, this._s2cHeroLimitLvPutRes.bind(this))
        this._recvHeroLimitLvUp =
            G_NetworkManager.add(MessageIDConst.ID_S2C_HeroLimitLvUp, this._s2cHeroLimitLvUp.bind(this))

        this._recvHeroGoldRankLvUp =
            G_NetworkManager.add(MessageIDConst.ID_S2C_GoldHeroRankUp, this._s2cGoldHeroRankUp.bind(this))
        this._recvHeroGoldResource =
            G_NetworkManager.add(MessageIDConst.ID_S2C_GoldHeroResource, this._s2cGoldHeroResource.bind(this))
        this._createFateMap()
    }

    public clear() {
        this._recvGetHero.remove()
        this._recvGetHero = null
        this._recvHeroLevelUp.remove()
        this._recvHeroLevelUp = null
        this._recvHeroRankUp.remove()
        this._recvHeroRankUp = null
        this._recvHeroRecycle.remove()
        this._recvHeroRecycle = null
        this._recvHeroReborn.remove()
        this._recvHeroReborn = null
        this._recvHeroEquipAwaken.remove()
        this._recvHeroEquipAwaken = null
        this._recvHeroAwaken.remove()
        this._recvHeroAwaken = null
        this._recvHeroTransform.remove()
        this._recvHeroTransform = null
        this._recvHeroLimitLvPutRes.remove()
        this._recvHeroLimitLvPutRes = null
        this._recvHeroLimitLvUp.remove()
        this._recvHeroLimitLvUp = null
        this._recvHeroGoldRankLvUp.remove()
        this._recvHeroGoldRankLvUp = null
        this._recvHeroGoldResource.remove()
        this._recvHeroGoldResource = null
    }

    public reset(): void {
        this._tempList = [];
        this._heroList = {}
        this._cacheListData = null //武将排序结果缓存
        this._cacheRangeData = null //武将切换排序结果缓存
        this._cacheReplaceData = null //武将替换排序结果缓存
        // this._cacheReplaceReinforcementData = null //援军替换排序结果缓存
        this._cacheRecoveryList = null //武将回收列表结果缓存
        this._cacheRecoveryAutoList = null //武将回收自动添加列表缓存
        this._cacheRebornList = null //武将重生列表结果缓存
    }

    private _createFateMap(): void {
        var formatMap = function (map: Array<any>, info) {
            var fateId = info.fate_id;
            var heroId = info.hero_id;
            if (heroId > 0) {
                if (map[heroId] == null) {
                    map[heroId] = [];
                }
                map[heroId].push(fateId);
            }
            for (let j = 1; j <= 4; j++) {
                var id = info['hero_id_' + j];
                if (id > 0) {
                    if (map[id] == null) {
                        map[id] = [];
                    }
                    map[id].push(fateId);
                }
            }
        }
        var Config = G_ConfigLoader.getConfig(ConfigNameConst.HERO_FATE);
        var len = Config.length();
        for (let i = 1; i <= len; i++) {
            var info = Config.indexOf(i - 1);
            var fateType = info.fate_type;
            if (fateType == 1) {
                formatMap(this._heroFateMap, info);
            }
            else if (fateType == 2) {
                formatMap(this._equipFateMap, info);
            }
            else if (fateType == 3) {
                formatMap(this._treasureFateMap, info);
            }
            else if (fateType == 4) {
                formatMap(this._instrumentFateMap, info);
            }
        }
    }

    public getHeroFateMap() {
        return this._heroFateMap;
    }
    public getEquipFateMap() {
        return this._equipFateMap;
    }
    public getTreasureFateMap() {
        return this._treasureFateMap;
    }
    public getInstrumentFateMap() {
        return this._instrumentFateMap;
    }

    //创建临时英雄数据
    public createTempHeroUnitData(data) {

        if (!data || typeof (data) != "object")
            alert("HeroData:createTempHeroUnitData data must be table")

        var baseData: any = {};
        baseData.id = data.id || 1;
        baseData.base_id = data.baseId || 1;
        baseData.level = data.level || 1;
        baseData.exp = data.exp || 1;
        baseData.quality = data.quality || 1;
        baseData.rank_lv = data.rank_lv || 0;
        baseData.instrument_lv = data.instrument_lv || 1;
        baseData.instrument_rank = data.instrument_rank || 1;
        baseData.instrument_exp = data.instrument_exp || 1;
        baseData.awaken_level = data.awaken_level || 0;
        baseData.limit_level = data.limit_level || 0;
        baseData.association = data.association || {};
        var unitData = new HeroUnitData();
        unitData.updateData(baseData);
        unitData.setUserHero(false);
        return unitData;
    }

    public _setHeroData(data) {

        //tempTest
        //临时设置英雄的id
        this.setCurHeroId(data.id);


        this._heroList['k_' + (data.id)] = null;
        var unitData = new HeroUnitData();
        unitData.updateData(data);
        this._heroList['k_' + (data.id)] = unitData;
    }
    public _s2cGetHero(id, message) {
        var heroList = message['heros'] || {};
        var isEnd = message['end'];
        if (this._tempList == null) {
            this._heroList = {};
            this._tempList = [];
        }
        for (var j = 0; j < heroList.length; j++)
            this._tempList.push(heroList[j]);

        if (isEnd == true) {
            for (let i in this._tempList) {
                var data = this._tempList[i];
                this._setHeroData(data);
            }
            this._tempList = null;
        }

    }
    public updateData(data) {
        if (data == null || typeof (data) != 'object') {
            return;
        }
        if (this._heroList == null) {
            return;
        }
        for (var i = 0; i < data.length; i++) {
            this._setHeroData(data[i]);
        }
    }

    public insertData(data) {
        if (data == null || typeof (data) != 'object') {
            return;
        }
        if (this._heroList == null) {
            return;
        }
        for (var i = 0; i < data.length; i++) {
            this._setHeroData(data[i]);
            G_UserData.getKarma().insertData(data[i]);
        }
        this.setSortDataDirty(true);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_TEAM);
    }
    public deleteData(data) {
        if (data == null || typeof (data) != 'object') {
            return;
        }
        if (this._heroList == null) {
            return;
        }
        for (var i = 0; i < data.length; i++) {
            var id = data[i];
            delete this._heroList['k_' + (id)];
        }
        this.setSortDataDirty(true);
    }
    public getAllHeros() {
        return this._heroList;
    }
    //获取武将总数
    public getHeroTotalCount() {
        var count = 0;
        for (var k in this._heroList) {
            var v = this._heroList[k];
            count = count + 1;
        }
        return count;
    }
    public getUnitDataWithId(id): HeroUnitData {
        var unitData = this._heroList['k_' + (id)];
        if (!unitData)
            alert("HeroData:getUnitDataWithId is Wrong, id " + id);
        return unitData;
    }

    public hasUnitDataWithId(id): boolean {
        let unitData = this._heroList['k_' + id];
        return !!unitData;
    }

    //根据baseId获取拥有相同名字武将的数量
    public getHeroCountWithBaseId(baseId) {
        var count = 0;
        for (var k in this._heroList) {
            var data = this._heroList[k];
            if (data.getBase_id() == baseId) {
                count = count + 1;
            }
        }
        return count;
    }

    //根据baseId获取同名卡的表
    //同名卡：无升级、无突破、无觉醒、无界限过的卡
    public getSameCardCountWithBaseId(baseId, filterId?) {
        var result: any = [];
        for (var k in this._heroList) {
            var data = this._heroList[k];
            var isFilter = false;
            if (filterId && data.getId() == filterId) {
                isFilter = true;
            }
            if (data.getBase_id() == baseId && !data.isInBattle() && !data.isInReinforcements() && !data.isDidUpgrade() && !data.isDidBreak() && !data.isDidAwake() && !data.isDidLimit() && !data.isDidGoldRankLv() && !isFilter) {
                result.push(data);
            }
        }
        return result;
    }
    public setSortDataDirty(dirty) {
        this.setListDataDirty(dirty);
        this.setRangeDataDirty(dirty);
        this.setReplaceDataDirty(dirty);
        this.setReplaceReinforcementDataDirty(dirty);
        this.setRecoveryDataDirty(dirty);
        this.setRecoveryAutoDataDirty(dirty);
        this.setRebornDataDirty(dirty);
        this.setFragmentDataDirty(dirty);
    }

    /**
     * 获取排序后的武将列表数据
     */
    public getListDataBySort() {
        //品质排序，上阵位排序
        var sortFun1 = function (a, b) {
            if (a.getConfig().color != b.getConfig().color) {
                return b.getConfig().color - a.getConfig().color;
            } else if (a.getLevel() != b.getLevel()) {
                return b.getLevel() - a.getLevel();
            } else if (a.getRank_lv() != b.getRank_lv()) {
                return b.getRank_lv() - a.getRank_lv();
            } else {
                return a.getPos() - b.getPos();
            }
        };
        var sortFun2 = function (a, b) {
            if (a.getConfig().color != b.getConfig().color) {
                return b.getConfig().color - a.getConfig().color;
            } else if (a.getLevel() != b.getLevel()) {
                return b.getLevel() - a.getLevel();
            } else if (a.getRank_lv() != b.getRank_lv()) {
                return b.getRank_lv() - a.getRank_lv();
            } else {
                return a.getSecondPos() - b.getSecondPos();
            }
        };
        var sortFun3 = function (a, b) {
            var yokeCountA = a.getWillActivateYokeCount();
            var yokeCountB = b.getWillActivateYokeCount();
            if (yokeCountA != yokeCountB) {
                return yokeCountB - yokeCountA;
            } else if (a.getConfig().color != b.getConfig().color) {
                return b.getConfig().color - a.getConfig().color;
            } else if (a.getLevel() != b.getLevel()) {
                return b.getLevel() - a.getLevel();
            } else if (a.getRank_lv() != b.getRank_lv()) {
                return b.getRank_lv() - a.getRank_lv();
            } else {
                return a.getBase_id() - b.getBase_id();
            }
        };
        if (this._cacheListData == null || this.isListDataDirty()) {
            var result: any = [];
            var inBattleData: any = [];//已出战的武将
            var reinforcementsData: any = [];//已上援军位的武将
            var remainderData: any = [];//剩余的武将
            for (var k in this._heroList) {
                let unit = this._heroList[k];
                var isInBattle = unit.isInBattle();
                var isInReinforcements = unit.isInReinforcements();
                if (isInBattle) {
                    if (unit.getConfig().type == 1) {
                        //主角固定为第一位
                        result.push(unit.getId());
                    } else {
                        inBattleData.push(unit);
                    }
                }
                else if (isInReinforcements) {
                    reinforcementsData.push(unit);
                }
                else {
                    var [yokeCount] = HeroDataHelper.getWillActivateYokeCount(unit.getBase_id());
                    unit.setWillActivateYokeCount(yokeCount);
                    remainderData.push(unit);
                }
            }
            inBattleData.sort(sortFun1);
            reinforcementsData.sort(sortFun2);
            remainderData.sort(sortFun3);
            for (var i in inBattleData) {
                let unit = inBattleData[i];
                result.push(unit.getId())
            }
            for (let i in reinforcementsData) {
                let unit = reinforcementsData[i];
                result.push(unit.getId());
            }
            for (let i in remainderData) {
                let unit = remainderData[i];
                result.push(unit.getId());
            }
            this._cacheListData = result;
            this.setListDataDirty(false);
        }

        this["s"] = function () { };
        return this._cacheListData;
    }

    /**
     * 获取武将切换的数据
     */
    public getRangeDataBySort() {
        var sortFun1 = function (a, b) {
            if (a.getConfig().color != b.getConfig().color) {
                return b.getConfig().color - a.getConfig().color;
            } else {
                return a.getPos() - b.getPos();
            }
        };
        var sortFun2 = function (a, b) {
            if (a.getConfig().color != b.getConfig().color) {
                return b.getConfig().color - a.getConfig().color;
            } else {
                return a.getSecondPos() - b.getSecondPos();
            }
        };
        var sortFun3 = function (a, b) {
            var yokeCountA = a.getWillActivateYokeCount();
            var yokeCountB = b.getWillActivateYokeCount();
            if (yokeCountA != yokeCountB) {
                return yokeCountA - yokeCountB;
            } else {
                return a.getBase_id() - b.getBase_id();
            }
        };
        if (this._cacheRangeData == null || this.isRangeDataDirty()) {
            var result: any = [];
            var inBattleData: any = [];
            var reinforcementsData: any = [];
            var remainderData: any = [];
            for (var k in this._heroList) {
                let unit = this._heroList[k];
                if (unit.getConfig().type != 3) {
                    var isInBattle = unit.isInBattle();
                    var isInReinforcements = unit.isInReinforcements();
                    if (isInBattle) {
                        if (unit.getConfig().type == 1) {
                            result.push(unit.getId());
                        } else {
                            inBattleData.push(unit);
                        }
                    } else {
                        var [yokeCount] = HeroDataHelper.getWillActivateYokeCount(unit.getBase_id());
                        unit.setWillActivateYokeCount(yokeCount);
                        remainderData.push(unit);
                    }
                }
            }
            inBattleData.sort(sortFun1);
            reinforcementsData.sort(sortFun2);
            remainderData.sort(sortFun3);
            for (var i in inBattleData) {
                let unit = inBattleData[i];
                result.push(unit.getId());
            }
            for (let i in reinforcementsData) {
                let unit = reinforcementsData[i];
                result.push(unit.getId());
            }
            for (let i in remainderData) {
                let unit = remainderData[i];
                result.push(unit.getId());
            }
            this._cacheRangeData = result;
            this.setRangeDataDirty(false);
        }
        return this._cacheRangeData;
    }

    /**
     * 获取排序后的更换武将数据
     */
    public getReplaceDataBySort(filterId?) {
        var sortFun = function (a, b) {
            var jointA = a.isActiveJoint(filterId) ? 1 : 0;
            var jointB = b.isActiveJoint(filterId) ? 1 : 0;
            if (jointA != jointB) {
                return jointB - jointA;
            }
            else if (a.getConfig().color != b.getConfig().color) {
                return b.getConfig().color - a.getConfig().color;
            } else {
                var yokeCountA = a.getWillActivateYokeCount();
                var yokeCountB = b.getWillActivateYokeCount();
                if (yokeCountA != yokeCountB) {
                    return yokeCountB - yokeCountA;
                } else if (a.getLimit_rtg() != b.getLimit_rtg()) {
                    return b.getLimit_rtg() - a.getLimit_rtg();
                } else if (a.getLimit_level() != b.getLimit_level()) {
                    return b.getLimit_level() - a.getLimit_level();
                }
                else if (a.getLevel() != b.getLevel()) {
                    return b.getLevel() - a.getLevel();
                }
                else if (a.getRank_lv() != b.getRank_lv()) {
                    return b.getRank_lv() - a.getRank_lv()
                }
                else {
                    return a.getBase_id() - b.getBase_id();
                }
            }
        };
        var result: any = [];
        let check = {}
        for (var k in this._heroList) {
            var unit = this._heroList[k];
            var heroType = unit.getConfig().type;
            if (heroType === 3) {
                continue;
            }
            var isInBattle = unit.isInBattle();
            if (isInBattle) {
                continue;
            }

            var isInReinforcements = unit.isInReinforcements();
            if (isInReinforcements) {
                continue;
            }
            let base_id = unit.getBase_id();
            let yokeCount = check[base_id];
            if (typeof yokeCount === 'number') {
                if (yokeCount > -1) {
                    unit.setWillActivateYokeCount(yokeCount);
                    result.push(unit);
                }
                continue;
            }
            var same = G_UserData.getTeam().isHaveSameName(base_id, filterId);
            if (same) {
                check[base_id] = -1;
                continue;
            }
            // if (!isInBattle && !isInReinforcements && !same && heroType != 3) {
            [yokeCount] = HeroDataHelper.getWillActivateYokeCount(base_id);
            unit.setWillActivateYokeCount(yokeCount);
            result.push(unit);
            check[base_id] = yokeCount;
            // }
        }
        result.sort(sortFun);
        this._cacheReplaceData = result;
        this.setReplaceDataDirty(false);
        return this._cacheReplaceData;
    }

    getHeroByTacticsPosUnlock(slot): any {
        var sortFun = function (a, b) {
            var colorA = a.getConfig().color;
            var colorB = b.getConfig().color;
            var isTrainA = a.isDidTrain() && 1 || 0;
            var isTrainB = b.isDidTrain() && 1 || 0;
            if (colorA != colorB) {
                return colorA < colorB;
            } else if (isTrainA != isTrainB) {
                return isTrainA < isTrainB;
            } else if (a.getRank_lv() != b.getRank_lv()) {
                return a.getRank_lv() < b.getRank_lv();
            } else if (a.getLevel() != b.getLevel()) {
                return a.getLevel() < b.getLevel();
            } else {
                return a.getBase_id() < b.getBase_id();
            }
        };
        var [needColor, needNum] = TacticsDataHelper.getTacticsPosUnlockParam(slot);
        var result = [];
        for (var k in this._heroList) {
            var unit = this._heroList[k];
            var heroConfig = unit.getConfig();
            var heroType = heroConfig.type;
            var color = heroConfig.color;
            var country = heroConfig.country;
            if (heroType == 2 && color == needColor) {
                var isInBattle = unit.isInBattle();
                var isInReinforcements = unit.isInReinforcements();
                var isLimitRedGold = unit.isDidLitmitRedWithGold();
                var isTrained = unit.isDidTrain();
                if (!isInBattle && !isInReinforcements && !isLimitRedGold && !isTrained) {
                    result.push(unit);
                }
            }
        }
        result.push(sortFun);
        return result;
    }
    getStudyHeroList(tacticsId): any {
        var sortFun = function (a, b): number {
            var colorA = a.getConfig().color;
            var colorB = b.getConfig().color;
            var isTrainA = a.isDidTrain() && 1 || 0;
            var isTrainB = b.isDidTrain() && 1 || 0;
            if (colorA != colorB) {
                return colorA - colorB;
            } else if (isTrainA != isTrainB) {
                return isTrainA - isTrainB;
            } else if (a.getRank_lv() != b.getRank_lv()) {
                return a.getRank_lv() - b.getRank_lv();
            } else if (a.getLevel() != b.getLevel()) {
                return a.getLevel() - b.getLevel();
            } else {
                return a.getBase_id() - b.getBase_id();
            }
        };
        var unitData = G_UserData.getTactics().getUnitDataWithId(tacticsId);
        var camp = unitData.getStudyConfig()['camp'];
        var colorMap = {};
        for (var i = 1; i != 3; i++) {
            var needColor = unitData.getStudyConfig()['color' + i];
            colorMap[needColor] = true;
        }
        var result = [];
        for (var k in this._heroList) {
            var unit = this._heroList[k];
            var heroConfig = unit.getConfig();
            var heroType = heroConfig.type;
            var color = heroConfig.color;
            var country = heroConfig.country;
            if (heroType == 2 && colorMap[color] && country == camp) {
                var isInBattle = unit.isInBattle();
                var isInReinforcements = unit.isInReinforcements();
                var isLimitRedGold = unit.isDidLitmitRedWithGold();
                var isTrained = unit.isDidTrain();
                if (!isInBattle && !isInReinforcements && !isLimitRedGold && !isTrained) {
                    result.push(unit);
                }
            }
        }
        result.sort(sortFun);
        return result;
    }


    /**
     * 获取排序后的更换援军数据
     */
    public getReplaceReinforcementsDataBySort(heroId?, beReplacedId?) {
        var sortFun = function (a, b) {
            var countA = a.getWillActivateYokeCount();
            var countB = b.getWillActivateYokeCount();
            if (countA != countB) {
                return countB - countA;
            }
            else if (a.getConfig().color != b.getConfig().color) {
                return b.getConfig().color - a.getConfig().color;
            }
            else if (a.getLevel() != b.getLevel()) {
                return b.getLevel() - a.getLevel();
            }
            else if (a.getRank_lv() != b.getRank_lv()) {
                return b.getRank_lv() - a.getRank_lv();
            }
            else {
                return a.getBase_id() - b.getBase_id();
            }
        };
        var result: any[] = [];
        let check = {}
        for (var k in this._heroList) {
            var unit = this._heroList[k];
            var heroType = unit.getConfig().type;
            if (heroType === 3) {
                continue;
            }
            let baseId = unit.getBase_id();
            let yokeCount = check[baseId]
            if (typeof yokeCount === 'number') {
                if (yokeCount > -1) {
                    unit.setWillActivateYokeCount(yokeCount);
                    result.push(unit)
                }
                continue;
            }
            var isInBattle = unit.isInBattle();
            if (isInBattle) {
                continue;
            }
            var isInReinforcements = unit.isInReinforcements();
            if (isInReinforcements) {
                continue;
            }
            var same = G_UserData.getTeam().isHaveSameName(baseId);
            if (same) {
                check[baseId] = -1;
                continue;
            }
            [yokeCount] = HeroDataHelper.getWillActivateYokeCount(unit.getBase_id(), beReplacedId, true);
            unit.setWillActivateYokeCount(yokeCount);
            result.push(unit);
            check[baseId] = yokeCount;
            // if (!isInBattle && !isInReinforcements && !same && heroType != 3) {
            // }
        }
        result.sort(sortFun);
        if (heroId) {
            var unit1 = this.getUnitDataWithId(heroId);
            result.unshift(unit1);
        }
        return result;
    }
    //获取武将回收列表
    public getRecoveryList() {
        var sortFun = function (a, b) {
            var colorA = a.getConfig().color;
            var colorB = b.getConfig().color;
            var isTrainA = a.isDidTrain() && 1 || 0;
            var isTrainB = b.isDidTrain() && 1 || 0;
            if (colorA != colorB) {
                return colorA - colorB;
            }
            else if (isTrainA != isTrainB) {
                return isTrainA - isTrainB;
            }
            else if (a.getRank_lv() != b.getRank_lv()) {
                return a.getRank_lv() - b.getRank_lv();
            }
            else if (a.getLevel() != b.getLevel()) {
                return a.getLevel() - b.getLevel()
            }

            else {
                return a.getBase_id() - b.getBase_id();
            }
        };
        if (this._cacheRecoveryList == null || this.isRecoveryDataDirty()) {
            var result: any = [];
            for (var k in this._heroList) {
                var unit = this._heroList[k];
                var heroConfig = unit.getConfig();
                var heroType = heroConfig.type;
                var color = heroConfig.color;
                if (heroType == 2 && color > 1 && color < 7) {
                    var isInBattle = unit.isInBattle();
                    var isInReinforcements = unit.isInReinforcements();
                    var isLimitRedGold = unit.isDidLitmitRedWithGold();
                    if (!isInBattle && !isInReinforcements && !isLimitRedGold) {
                        result.push(unit);
                    }
                }
            }
            result.sort(sortFun);
            this._cacheRecoveryList = result;
            this.setRecoveryDataDirty(false);
        }
        return this._cacheRecoveryList;
    }

    /**
     * HeroDataHelper.isHaveYokeWithHeroBaseId
     * 获取武将回收自动添加列表
     */
    public getRecoveryAutoList() {
        var sortFun = function (a, b) {
            var colorA = a.getConfig().color;
            var colorB = b.getConfig().color;
            var isTrainA = a.isDidTrain() && 1 || 0;
            var isTrainB = b.isDidTrain() && 1 || 0;
            if (colorA != colorB) {
                return colorA - colorB;
            }
            else if (isTrainA != isTrainB) {
                return isTrainA - isTrainB;
            }
            else if (a.getRank_lv() != b.getRank_lv()) {
                return a.getRank_lv() - b.getRank_lv();
            }
            else if (a.getLevel() != b.getLevel()) {
                return a.getLevel() - b.getLevel();
            }
            else {
                return a.getBase_id() - b.getBase_id();
            }
        };
        if (this._cacheRecoveryAutoList == null || this.isRecoveryAutoDataDirty()) {
            var result: any = [];
            for (var k in this._heroList) {
                var unit = this._heroList[k];
                var heroConfig = unit.getConfig();
                var heroType = heroConfig.type;
                if (heroType !== 2) {
                    continue;
                }
                var color = heroConfig.color;
                if (color <= 1 || color >= 5) {
                    continue;
                }
                var isInBattle = unit.isInBattle();
                if (isInBattle) {
                    continue;
                }
                var isInReinforcements = unit.isInReinforcements();
                if (isInReinforcements) {
                    continue;
                }
                var isYoke = HeroDataHelper.isHaveYokeWithHeroBaseId(unit.getBase_id());
                if (isYoke) {  //自动添加，不加橙色、红色，没有羁绊关系
                    continue;
                }
                result.push(unit);
            }
            result.sort(sortFun);
            this._cacheRecoveryAutoList = result;
            this.setRecoveryAutoDataDirty(false);
        }
        return this._cacheRecoveryAutoList;
    }

    //获取武将重生列表
    public getRebornList() {
        var sortFun = function (a, b) {
            var colorA = a.getConfig().color;
            var colorB = b.getConfig().color;
            var isTrainA = a.isDidTrain() && 1 || 0;
            var isTrainB = b.isDidTrain() && 1 || 0;
            if (colorA != colorB) {
                return colorA - colorB;
            }
            else if (isTrainA != isTrainB) {
                return isTrainA - isTrainB;
            }
            else if (a.getRank_lv() != b.getRank_lv()) {
                return a.getRank_lv() - b.getRank_lv()
            }
            else if (a.getLevel() != b.getLevel()) {
                return a.getLevel() - b.getLevel();
            }
            else {
                return a.getBase_id() - b.getBase_id();
            }
        };
        if (this._cacheRebornList == null || this.isRebornDataDirty()) {
            var result: any = [];
            for (var k in this._heroList) {
                var unit = this._heroList[k];
                var heroConfig = unit.getConfig();
                var heroType = heroConfig.type;
                var color = heroConfig.color;
                if (heroType == 2 && color > 1) {
                    var isDidTrain = unit.isDidTrain();
                    if (isDidTrain) {
                        var isInBattle = unit.isInBattle();
                        var isInReinforcements = unit.isInReinforcements();
                        if (!isInBattle && !isInReinforcements) {
                            result.push(unit);
                        }
                    }
                }
            }
            result.sort(sortFun);
            this._cacheRebornList = result;
            this.setRebornDataDirty(false);
        }
        return this._cacheRebornList;
    }


    public getTransformSrcList() {
        var sortFun = function (a, b) {
            var trainA = a.isDidTrain() && 1 || 0;
            var trainB = b.isDidTrain() && 1 || 0;
            var yokeCountA = a.getWillActivateYokeCount();
            var yokeCountB = b.getWillActivateYokeCount();
            if (trainA != trainB) {
                return trainB - trainA;
            }
            else if (yokeCountA != yokeCountB) {
                return yokeCountB - yokeCountA;
            }
            else if (a.getLevel() != b.getLevel()) {
                return a.getLevel() - b.getLevel();
            }
            else if (a.getRank_lv() != b.getRank_lv()) {
                return b.getRank_lv() - a.getRank_lv();
            }
            else {
                return a.getBase_id() - b.getBase_id();
            }
        };
        var result = {
            1: [],//魏
            2: [],//蜀
            3: [],//吴
            4: []//群雄
        };
        for (var k in this._heroList) {
            var unit = this._heroList[k];
            var isInBattle = unit.isInBattle();
            var isInReinforcements = unit.isInReinforcements();
            var color = unit.getConfig().color;
            if (!isInBattle && !isInReinforcements && color >= 5 && color <= 7) { //橙、红、金将
                var country = unit.getConfig().country;
                var [yokeCount] = HeroDataHelper.getWillActivateYokeCount(unit.getBase_id());
                unit.setWillActivateYokeCount(yokeCount);
                if (result[country]) {
                    result[country].push(unit);
                }
            }
        }
        for (var i = 1; i <= 4; i++) {
            result[i].sort(sortFun);
        }
        return result;
    }
    //获取主角静态Id
    public getRoleBaseId() {
        for (var k in this._heroList) {
            var data = this._heroList[k];
            var config = data.getConfig();
            if (config.type == 1) {
                return config.id;
            }
        }
        // 建号之前，对话需求判断baseid，所以去掉assert
        // console.assert(false, "can not find role baseId")
    }
    //获取筛选掉相同baseId后的武将列表信息
    public getHeroListByFiltSameBaseId() {
        var result: any = [];
        var temp: any = {};
        var heroIdList = this.getListDataBySort();
        for (var i in heroIdList) {
            var heroId = heroIdList[i];
            var unitData = this.getUnitDataWithId(heroId);
            var baseId = unitData.getBase_id();
            if (temp[baseId] != true) { //排除baseId重复的情况
                result.push(unitData);
            }
            if (temp[baseId] == null) {
                temp[baseId] = true;
            }
        }
        return result;
    }
    //判断是否在武将列表中，根据baseId
    public isInListWithBaseId(baseId) {
        for (var k in this._heroList) {
            var data = this._heroList[k];
            var id = data.getBase_id();
            if (id == baseId) {
                return true;
            }
        }
        return false;
    }
    //判断是否有未上阵武将
    public isHaveHeroNotInBattle() {
        let check = {};
        for (var k in this._heroList) {
            var unit = this._heroList[k];
            let baseId = unit.getBase_id();
            if (check[baseId]) {
                continue;
            }
            let cfg = unit.getConfig();
            if (cfg.type == 2 && cfg.color >= 2) {
                var isInBattle = unit.isInBattle();
                if (isInBattle) {
                    continue;
                }
                var isInReinforcements = unit.isInReinforcements();
                if (isInReinforcements) {
                    continue;
                }
                var same = G_UserData.getTeam().isHaveSameName(baseId);
                if (!same) {
                    return true;
                }
                check[baseId] = true;
                //未在阵容位，未在援军位，品质绿色及以上，和阵位上已有的武将不同名
                // if (!isInBattle && !isInReinforcements) {
                //     return true;
                // }
            }
        }
        return false;
    }

    /**
     * 判断是否有可激活羁绊的武将
     */
    public isHaveActiveYokeHeroNotInBattle() {
        let check = {};
        for (var k in this._heroList) {
            var unit = this._heroList[k];
            if (unit.getConfig().type == 2) {
                let base_id = unit.getBase_id();
                if (check[base_id]) {
                    continue;
                }
                check[base_id] = true;
                var isInBattle = unit.isInBattle();
                if (isInBattle) {
                    continue;
                }
                var isInReinforcements = unit.isInReinforcements();
                if (isInReinforcements) {
                    continue;
                }
                var same = G_UserData.getTeam().isHaveSameName(unit.getBase_id());
                if (same) {
                    continue;
                }
                var countArr = HeroDataHelper.getWillActivateYokeCount(unit.getBase_id());
                if (countArr[0] > 0) {
                    return true;
                }
                //未在阵容位，未在援军位，可激活羁绊， 排除重名的
                // if (!isInBattle && !isInReinforcements && !same && countArr[0] > 0) {
                //     return true;
                // }
            }
        }
        return false;
    }

    /**
     * 判断是否显示武将回收的红点
     */
    public isShowRedPointOfHeroRecovery() {
        var paramId = ParameterIDConst.DISPLAY_NUMBER;
        var limit = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(paramId).content;
        var count = 0;
        for (var k in this._heroList) {
            let data = this._heroList[k];
            let type = data.getConfig().type;
            if (type !== 2) {
                continue;
            }
            let color = data.getConfig().color;
            if (color !== 2 && color !== 3) {
                continue;
            }
            var isInBattle = data.isInBattle();
            if (isInBattle) {
                continue;
            }
            var isInReinforcements = data.isInReinforcements();
            if (isInReinforcements) {
                continue;
            }
            var isYoke = HeroDataHelper.isHaveYokeWithHeroBaseId(data.getBase_id());
            if (isYoke) {
                continue;
            }

            count = count + 1;
        }
        return count >= parseInt(limit);
    }

    //===================协议部分===================================================================
    //武将升级
    public c2sHeroLevelUp(heroId, materials) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_HeroLevelUp, {
            id: heroId,
            materials: materials
        });
    }
    public _s2cHeroLevelUp(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this.setSortDataDirty(true);
        G_SignalManager.dispatch(SignalConst.EVENT_HERO_LEVELUP);
    }
    //武将突破
    public c2sHeroRankUp(id, heroIds) {
        console.log(id);
        console.log(heroIds);
        if (heroIds.length == 0) {
            G_NetworkManager.send(MessageIDConst.ID_C2S_HeroRankUp, { id: id });
        } else {
            G_NetworkManager.send(MessageIDConst.ID_C2S_HeroRankUp, {
                id: id,
                hero_id: heroIds
            });
        }
    }
    public _s2cHeroRankUp(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this.setSortDataDirty(true);
        G_SignalManager.dispatch(SignalConst.EVENT_HERO_RANKUP);
    }
    //武将回收
    public c2sHeroRecycle(heroIds) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_HeroRecycle, { hero_id: heroIds });
    }
    public _s2cHeroRecycle(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this.setSortDataDirty(true);
        var awards = message.awards || {};
        G_SignalManager.dispatch(SignalConst.EVENT_HERO_RECOVERY_SUCCESS, awards);
    }
    //武将重生
    public c2sHeroReborn(heroId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_HeroReborn, { hero_id: heroId });
    }
    public _s2cHeroReborn(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this.setSortDataDirty(true);
        var awards = message.awards || {};
        G_SignalManager.dispatch(SignalConst.EVENT_HERO_REBORN_SUCCESS, awards);
    }
    //武将觉醒
    public c2sHeroAwaken(heroId, costHeros) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_HeroAwaken, {
            hero_id: heroId,
            cost_heros: costHeros
        });
    }
    public _s2cHeroAwaken(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_HERO_AWAKE_SUCCESS);
    }
    //武将装备觉醒材料
    public c2sHeroEquipAwaken(heroId, slot) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_HeroEquipAwaken, {
            hero_id: heroId,
            slot: slot
        });
    }
    public _s2cHeroEquipAwaken(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var slot = message.slot || {};
        G_SignalManager.dispatch(SignalConst.EVENT_HERO_EQUIP_AWAKE_SUCCESS, slot);
    }
    //武将置换
    public c2sHeroTransform(srcIds, toId, withInstrument) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_HeroTransform, {
            to_id: toId,
            src_ids: srcIds,
            with_instrument: withInstrument
        });
    }
    public _s2cHeroTransform(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_HERO_TRANSFORM_SUCCESS);
    }
    //武将界限突破放材料
    c2sHeroLimitLvPutRes(heroId, pos, subItems, op, costHeroIds): void {
        if (costHeroIds.length > 0) {
            this.setLimitUpWithHero(true);
        }
        G_NetworkManager.send(MessageIDConst.ID_C2S_HeroLimitLvPutRes, {
            hero_id: heroId,
            pos: pos,
            sub_item: subItems,
            op: op,
            cost_hero_ids: costHeroIds
        });
    }
    _s2cHeroLimitLvPutRes(id, message): void {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var pos = message['pos'] || 0;
        this.setSortDataDirty(true);
        if (this.isLimitUpWithHero()) {
            this.setLimitUpWithHero(false);
            G_SignalManager.dispatch(SignalConst.EVENT_HERO_LIMIT_LV_PUT_RES_WITH_HERO);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_HERO_LIMIT_LV_PUT_RES, pos);
    }
    //武将界限突破
    c2sHeroLimitLvUp(heroId, op): void {
        G_NetworkManager.send(MessageIDConst.ID_C2S_HeroLimitLvUp, {
            hero_id: heroId,
            op: op
        });
    }
    //收到武将界限突破的回复
    public _s2cHeroLimitLvUp(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this.setSortDataDirty(true);
        G_SignalManager.dispatch(SignalConst.EVENT_HERO_LIMIT_LV_UP_SUCCESS);
    }
    public c2sGoldHeroRankUp(heroId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GoldHeroRankUp, { id: heroId });
    }
    public c2sGoldHeroResource(heroId, resType, heroIds, items) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GoldHeroResource, {
            id: heroId,
            res_type: resType,
            hero_ids: heroIds,
            awards: items
        });
    }
    public _s2cGoldHeroRankUp(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GOLD_HERO_RESOURCE_SUCCESS);
    }
    public _s2cGoldHeroResource(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GOLD_HERO_RESOURCE_SUCCESS);
    }
}



