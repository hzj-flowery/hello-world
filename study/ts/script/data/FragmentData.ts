import { BaseData } from "./BaseData";
import { G_NetworkManager, G_SignalManager, G_UserData, G_ConfigLoader } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { handler } from "../utils/handler";
import { SignalConst } from "../const/SignalConst";
import { TypeConvertHelper } from "../utils/TypeConvertHelper";
import { FunctionConst } from "../const/FunctionConst";
import { BaseConfig } from "../config/BaseConfig";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { HeroDataHelper } from "../utils/data/HeroDataHelper";

let baseSchema = {};
baseSchema['id'] = [
    'number',
    0
];

baseSchema['num'] = [
    'number',
    0
];

baseSchema['type'] = [
    'number',
    0
];

baseSchema['config'] = [
    'object',
    {}
];

baseSchema['heroYokeCount'] = [
    'number',
    0
];

interface FragmentBaseData {
    getId(): number
    setId(value: number): void
    getLastId(): number
    getNum(): number
    setNum(value: number): void
    getLastNum(): number
    getType(): number
    setType(value: number): void
    getLastType(): number
    getConfig(): any
    setConfig(value: any): void
    getLastConfig(): any
    getHeroYokeCount(): number
    setHeroYokeCount(value: number): void
    getLastHeroYokeCount(): number

}

class FragmentBaseData extends BaseData {
    public static schema = baseSchema;
    initData(data): void {
        this.setId(data.id);
        this.setNum(data.num);
        this.setType(TypeConvertHelper.TYPE_FRAGMENT);
        var info = G_ConfigLoader.getConfig(ConfigNameConst.FRAGMENT).get(data.id);
        if (!info)
            cc.error('FragmentInfo can\'t find id = ');
        this.setConfig(info);
    }
    isHeroFragment(): any {
        var fType = this.getConfig().comp_type;
        return fType == 1;
    }
    calAndSetHeroYokeCount() {
        var baseId = this.getConfig().comp_value;
        var countArr = HeroDataHelper.getWillActivateYokeCount(baseId);
        this.setHeroYokeCount(countArr[0]);
    }
}

export class FragmentData extends BaseData {
    private fragmentInfo: BaseConfig;

    static schema:any = {
        ['id'] : [
            'number',
            0
        ],
        ['num'] : [
            'number',
            0
        ],
        ['type'] : [
            'number',
            0
        ],
        ['config'] : [
            'table',
            {}
        ],
        ['heroYokeCount'] : [
            'number',
            0
        ]
    };

    constructor() {
        super()
        this._fragmentList = {};
        this._cacheHeroList = null;
        this._sortFuncMap = null;
        this._msgGetFragmentData = G_NetworkManager.add(MessageIDConst.ID_S2C_GetFragment, this._s2cGetFragment.bind(this));
        this._msgSyntheticFragments = G_NetworkManager.add(MessageIDConst.ID_S2C_SyntheticFragments, this._s2cSyntheticFragments.bind(this));
        this.fragmentInfo = G_ConfigLoader.getConfig(ConfigNameConst.FRAGMENT);
    }
    public static readonly SORT_FUNC_COMMON = 1 //普通排序
    public static readonly SORT_FUNC_SELL = 2  //碎片出售排序
    public static readonly SORT_FUNC_HEROLIST = 3  //武将碎片列表排序
    public static readonly SORT_FUNC_HERO_FRAGMENT_SELL = 4  //武将列表碎片出售排序
    public static readonly SORT_FUNC_PETLIST = 5 //神兽谁骗列表
    public static readonly SORT_FUNC_HISTORYHEROLIST = 6;//历代名将碎片列表
    private _fragmentList;
    private _cacheHeroList;
    private _sortFuncMap;
    private _msgGetFragmentData;
    private _msgSyntheticFragments;

    _s2cGetFragment(id, message) {
        this._fragmentList = {};
        var fragmentsList = message.fragments || {};
        for (var i in fragmentsList) {
            var value = fragmentsList[i];
            this._setFragmentData(value);
        }
        this._dispatchRedPointEvent();
    }
    _s2cSyntheticFragments(id, message) {
        if (message.ret != 1) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_EQUIPMENT_COMPOSE_OK, message);
        this._dispatchRedPointEvent();
    }
    c2sSyntheticFragments(fragmentId, count) {
        var merageItem = {
            id: fragmentId,
            num: count || 1
        };
        G_NetworkManager.send(MessageIDConst.ID_C2S_SyntheticFragments, merageItem);
    }
    clear() {
        this._msgGetFragmentData.remove();
        this._msgGetFragmentData = null;
        this._msgSyntheticFragments.remove();
        this._msgSyntheticFragments = null;
    }
    reset() {
        this._fragmentList = {};
    }
    _setFragmentData(fragData) {
        var baseData = new FragmentBaseData();
        baseData.initData(fragData);
        this._fragmentList['k_' + (fragData.id)] = baseData;
        this._checkDirty(baseData.getConfig().comp_type);
    }
    _initSortFuncMap() {
        function sortFunCommon(a, b) {
            var qa = a.getConfig().color, qb = b.getConfig().color;
            var idA = a.getConfig().id, idB = b.getConfig().id;
            var fragmentNumA = a.getConfig().fragment_num, fragmentNumB = b.getConfig().fragment_num;
            var numA = a.getNum(), numB = b.getNum();
            var isMerageA = numA >= fragmentNumA ? 1 : 0;
            var isMerageB = numB >= fragmentNumB ? 1 : 0;
            if (isMerageB != isMerageA) {
                return isMerageB - isMerageA;
            }
            if (qa != qb) {
                return qb - qa;
            }
            if (numA != numB) {
                return numB - numA;
            }
            return idA - idB;
        }
        function sortFunSell(a, b) {
            var qa = a.getConfig().color, qb = b.getConfig().color;
            var idA = a.getConfig().id, idB = b.getConfig().id;
            var numA = a.getNum(), numB = b.getNum();
            if (qa != qb) {
                return qa - qb;
            }
            if (numA != numB) {
                return numB - numA;
            }
            return idA - idB;
        }
        function sortFunPetList(a, b) {
            var baseIdA = a.getConfig().comp_value;
            var baseIdB = b.getConfig().comp_value;
            var inBattleA = G_UserData.getTeam().isInBattleWithPetBaseId(baseIdA) ? 1 : 0;
            var inBattleB = G_UserData.getTeam().isInBattleWithPetBaseId(baseIdB) ? 1 : 0;
            var inBlessA = G_UserData.getTeam().isInHelpWithPetBaseId(baseIdA) ? 1 : 0;
            var inBlessB = G_UserData.getTeam().isInHelpWithPetBaseId(baseIdB) ? 1 : 0;
            var qa = a.getConfig().color, qb = b.getConfig().color;
            var idA = a.getConfig().id, idB = b.getConfig().id;
            var fragmentNumA = a.getConfig().fragment_num, fragmentNumB = b.getConfig().fragment_num;
            var numA = a.getNum(), numB = b.getNum();
            var isMerageA = numA >= fragmentNumA && 1 || 0;
            var isMerageB = numB >= fragmentNumB && 1 || 0;
            if (isMerageB != isMerageA) {
                return isMerageB - isMerageA;
            }
            if (inBattleA != inBattleB) {
                return inBattleB - inBattleA;
            }
            if (inBlessA != inBlessB) {
                return inBlessB - inBlessA;
            }
            if (qa != qb) {
                return qb - qa;
            }
            if (numA != numB) {
                return numB - numA;
            }
            return idA - idB;
        }
        function sortFunHeroList(a, b) {
            var heroIdA = a.getConfig().comp_value;
            var heroIdB = b.getConfig().comp_value;
            var inBattleA = G_UserData.getTeam().isInBattleWithBaseId(heroIdA) ? 1 : 0;
            var inBattleB = G_UserData.getTeam().isInBattleWithBaseId(heroIdB) ? 1 : 0;
            var isKarmaA = HeroDataHelper.isHaveKarmaWithHeroBaseId(heroIdA) ? 1 : 0;
            var isKarmaB = HeroDataHelper.isHaveKarmaWithHeroBaseId(heroIdB) ? 1 : 0;
            var yokeCountA = a.getHeroYokeCount();
            var yokeCountB = b.getHeroYokeCount();
            var qa = a.getConfig().color, qb = b.getConfig().color;
            var idA = a.getConfig().id, idB = b.getConfig().id;
            var fragmentNumA = a.getConfig().fragment_num, fragmentNumB = b.getConfig().fragment_num;
            var numA = a.getNum(), numB = b.getNum();
            var isMerageA = numA >= fragmentNumA ? 1 : 0;
            var isMerageB = numB >= fragmentNumB ? 1 : 0;

            if (isMerageB != isMerageA) {
                return isMerageB - isMerageA;
            }
            if (inBattleA != inBattleB) {
                return inBattleB - inBattleA;
            }
            if (isKarmaA != isKarmaB) {
                return isKarmaB - isKarmaA;
            }
            if (yokeCountA != yokeCountB) {
                return yokeCountB - yokeCountA;
            }
            if (isMerageB != isMerageA) {
                return isMerageB - isMerageA;
            }
            if (qa != qb) {
                return qb - qa;
            }
            if (numA != numB) {
                return numB - numA;
            }
            return idA - idB;
        }
        function sortFunHeroFragmentSell(a, b) {
            var qa = a.getConfig().color, qb = b.getConfig().color;
            var idA = a.getConfig().id, idB = b.getConfig().id;
            var numA = a.getNum(), numB = b.getNum();
            var isHaveA = G_UserData.getKarma().isHaveHero(a.getConfig().comp_value);
            var isHaveB = G_UserData.getKarma().isHaveHero(b.getConfig().comp_value);
            if (isHaveA != isHaveB) {
                if (isHaveA) {
                    return -1;
                } else {
                    return 1;
                }
            }
            if (qa != qb) {
                return qa - qb;
            }
            if (numA != numB) {
                return numB - numA;
            }
            return idA - idB;
        }
        function sortFunHistoryHeroList(a, b) {
            var idA = a.getConfig().id, idB = b.getConfig().id;
            var fragmentNumA = a.getConfig().fragment_num, fragmentNumB = b.getConfig().fragment_num;
            var numA = a.getNum(), numB = b.getNum();
            var isMerageA = numA >= fragmentNumA && 1 || 0;
            var isMerageB = numB >= fragmentNumB && 1 || 0;
            if (isMerageB != isMerageA) {
                return isMerageB - isMerageA;
            }
            return idA - idB;
        }
        this._sortFuncMap = {};
        this._sortFuncMap[FragmentData.SORT_FUNC_COMMON] = sortFunCommon;
        this._sortFuncMap[FragmentData.SORT_FUNC_SELL] = sortFunSell;
        this._sortFuncMap[FragmentData.SORT_FUNC_HEROLIST] = sortFunHeroList;
        this._sortFuncMap[FragmentData.SORT_FUNC_HERO_FRAGMENT_SELL] = sortFunHeroFragmentSell;
        this._sortFuncMap[FragmentData.SORT_FUNC_PETLIST] = sortFunPetList;
        this._sortFuncMap[FragmentData.SORT_FUNC_HISTORYHEROLIST] = sortFunHistoryHeroList;
    }
    _getSortFuncByType(sortFuncType) {
        if (!this._sortFuncMap) {
            this._initSortFuncMap();
        }
        var sortFunc = this._sortFuncMap[sortFuncType];
        if (!sortFunc) {
            cc.error("FragmentData:_getSortFuncByType return nil sortFuncType = ");
        }
        return sortFunc;
    }
    getFragListByType(frag_type, sortFuncType?, calYoke = true) {
        var tempList: any = [];
        if (this._fragmentList == null) {
            return tempList;
        }
        for (var k in this._fragmentList) {
            var fragData = this._fragmentList[k];
            if (fragData && fragData.getConfig().comp_type == frag_type) {
                if (fragData.isHeroFragment() && calYoke) {
                    fragData.calAndSetHeroYokeCount();
                }
                tempList.push(fragData);
            }
        }
        if (sortFuncType) {
            if (frag_type == 1) {
                var dirty = G_UserData.getHero().isFragmentDataDirty();
                if (this._cacheHeroList == null || dirty) {
                    var sortFunc = this._getSortFuncByType(sortFuncType);
                    tempList.sort(sortFunc);
                    this._cacheHeroList = tempList;
                } else {
                    return this._cacheHeroList;
                }
            } else {
                var sortFunc = this._getSortFuncByType(sortFuncType);
                tempList.sort(sortFunc);
            }
        }
        return tempList;
    }
    getFragDataByID(id) {
        if (this._fragmentList == null) {
            return null;
        }
        return this._fragmentList['k_' + (id)];
    }
    getFragNumByID(id) {
        var num = 0;
        var data = this.getFragDataByID(id);
        if (data != null) {
            num = data.getNum();
        }
        return num;
    }
    insertData(value) {
        if (value == null || typeof (value) != 'object') {
            return;
        }
        if (this._fragmentList == null) {
            return;
        }
        for (var i = 0; i < value.length; i++) {
            this._setFragmentData(value[i]);
        }
        this._dispatchRedPointEvent();
    }
    updateData(value) {
        if (value == null || typeof (value) != 'object') {
            return;
        }
        if (this._fragmentList == null) {
            return;
        }
        for (var i = 0; i < value.length; i++) {
            this._setFragmentData(value[i]);
        }
        this._dispatchRedPointEvent();
    }
    deleteData(value) {
        if (value == null || typeof (value) != 'object') {
            return;
        }
        if (this._fragmentList == null) {
            return;
        }
        for (var i = 0; i < value.length; i++) {
            var id = value[i];
            this._fragmentList['k_' + (id)] = null;
            var info = this.fragmentInfo.get(id);
            if (!info)
                cc.error('FragmentInfo can\'t find id = ' + (id));
            this._checkDirty(info.comp_type);
        }
        this._dispatchRedPointEvent();
    }
    _dispatchRedPointEvent() {
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_HERO_LIST);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_EQUIP_LIST);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_TREASURE_LIST);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_INSTRUMENT_LIST);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_HERO_TRAIN_TYPE3);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_HORSE_LIST);
    }
    hasRedPoint(param) {
        if (param.fragType) {
            var fragType = param.fragType;
            return this._isCanMergeByFragType(fragType);
        }
        return false;
    }
    _isCanMergeByFragType(fragType) {
        var list = this.getFragListByType(fragType, null, false);
        for (var k in list) {
            var fragData = list[k];
            var canMerge = fragData.getNum() >= fragData.getConfig().fragment_num;
            if (canMerge) {
                return true;
            }
        }
        return false;
    }
    _checkDirty(type) {
        if (type == 1) {
            G_UserData.getHero().setFragmentDataDirty(true);
        }
    }
    getFragListOfItemList() {
        var result = this.getFragListByType(6);
        return result;
    }

}