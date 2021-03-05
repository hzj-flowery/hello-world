
import ParameterIDConst from "../../const/ParameterIDConst";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import { TypeConvertHelper } from "../TypeConvertHelper";
import { G_ConfigLoader } from "../../init";
import { DataConst } from "../../const/DataConst";
import { LogicCheckHelper } from "../LogicCheckHelper";
import { FunctionConst } from "../../const/FunctionConst";

export namespace RecoveryDataHelper {
    export function formatRecoveryCost(info, type, value, size) {
        if (info[type] == null) {
            info[type] = {};
        }
        if (info[type][value] == null) {
            info[type][value] = 0;
        }
        info[type][value] = info[type][value] + size;
    };
    export function mergeRecoveryCost(tarInfo, srcInfo) {
        for (let type in srcInfo) {
            let unit = srcInfo[type];
            for (let value in unit) {
                let size = unit[value];
                this.formatRecoveryCost(tarInfo, type, value, size);
            }
        }
    };
    export function convertToList(info) {
        let result = [];
        for (let type in info) {
            let unit = info[type];
            for (let value in unit) {
                let size = unit[value];
                result.push({
                    type: type,
                    value: value,
                    size: size
                })
            }
        }
        return result;
    };
    export function convertSameCard(type, value, size, tarType) {
        let fragmentId = 0;
        if (type == TypeConvertHelper.TYPE_HERO) {
            let info = G_ConfigLoader.getConfig(ConfigNameConst.HERO).get(value);
            console.assert(info, ('hero config can not find id = %d' + value));
            fragmentId = info.fragment_id;
        }
        else if (type == TypeConvertHelper.TYPE_EQUIPMENT) {
            var info = G_ConfigLoader.getConfig(ConfigNameConst.EQUIPMENT).get(value);
            console.assert(info, ('equipment config can not find id = %d' + value));
            fragmentId = info.fragment_id;
        }
        else if (type == TypeConvertHelper.TYPE_TREASURE) {
            var info = G_ConfigLoader.getConfig(ConfigNameConst.TREASURE).get(value);
            console.assert(info, ('treasure config can not find id = %d' + value));
            fragmentId = info.fragment;
        } 
        else if (type == TypeConvertHelper.TYPE_INSTRUMENT) {
            var info = G_ConfigLoader.getConfig(ConfigNameConst.INSTRUMENT).get(value);
            console.assert(info, ('instrument config can not find id = %d' + value));
            fragmentId = info.fragment_id;
        } 
        else if (type == TypeConvertHelper.TYPE_PET) {
            var info = G_ConfigLoader.getConfig(ConfigNameConst.PET).get(value);
            console.assert(info, ('pet config can not find id = %d' + value));
            fragmentId = info.fragment_id;
        } 
        else if (type == TypeConvertHelper.TYPE_HORSE) {
            var info = G_ConfigLoader.getConfig(ConfigNameConst.HORSE).get(value);
            console.assert(info, ('pet config can not find id = %d' + value));
            fragmentId = info.fragment_id;
        } 
        else if (type == TypeConvertHelper.TYPE_HORSE_EQUIP) {
            let info = G_ConfigLoader.getConfig(ConfigNameConst.HORSE_EQUIPMENT).get(value);
            console.assert(info, ('horse_equipment config can not find id = %d' + value));
            fragmentId = info.fragment_id;
        }

        let fragmentInfo = G_ConfigLoader.getConfig(ConfigNameConst.FRAGMENT).get(fragmentId);
        console.assert(fragmentInfo, ('fragment config can not find id = %d' + fragmentId));
        let result = {};
        if (tarType == 1) {
            for (let i = 1; i <= size; i++) {
                if (fragmentInfo.recycle_size > 0) {
                    let num = fragmentInfo.fragment_num * fragmentInfo.recycle_size;
                    this.formatRecoveryCost(result, fragmentInfo.recycle_type, fragmentInfo.recycle_value, num);
                }
            }
        } else if (tarType == 2) {
            for (let i = 1; i <= size; i++) {
                this.formatRecoveryCost(result, TypeConvertHelper.TYPE_FRAGMENT, fragmentId, fragmentInfo.fragment_num);
            }
        }
        return result;
    };
    export function sortAward(awards: any[]) {
        let type2Sort = {
            [TypeConvertHelper.TYPE_RESOURCE]: 1,
            [TypeConvertHelper.TYPE_FRAGMENT]: 2,
            [TypeConvertHelper.TYPE_HERO]: 3,
            [TypeConvertHelper.TYPE_EQUIPMENT]: 4,
            [TypeConvertHelper.TYPE_TREASURE]: 5,
            [TypeConvertHelper.TYPE_INSTRUMENT]: 6,
            [TypeConvertHelper.TYPE_AVATAR]: 7,
            [TypeConvertHelper.TYPE_ITEM]: 8,
            [TypeConvertHelper.TYPE_GEMSTONE]: 9,
            [TypeConvertHelper.TYPE_PET]: 10,
            [TypeConvertHelper.TYPE_SILKBAG]: 11,
            [TypeConvertHelper.TYPE_HORSE]: 12,
            [TypeConvertHelper.TYPE_HISTORY_HERO]: 13,
            [TypeConvertHelper.TYPE_HISTORY_HERO_WEAPON]: 14,
            [TypeConvertHelper.TYPE_HORSE_EQUIP]: 15
        };
        function isSilver(data) {
            if (data.type == TypeConvertHelper.TYPE_RESOURCE && data.value == DataConst.RES_GOLD) {
                return true;
            } else {
                return false;
            }
        }
        function sortFunc(a, b) {
            let silverA = isSilver(a) && 1 || 0;
            let silverB = isSilver(b) && 1 || 0;
            if (silverA != silverB) {
                return silverA - silverB;
            } else if (a.type != b.type) {
                return type2Sort[a.type] - type2Sort[b.type];
            } else{
                return a.value - b.value;
            }
        }
        awards.sort(sortFunc);
    };
    export function getRebornCostCount() {

        let count = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.REBORN_COST).content);
        return count;
    };
    export function getShowFuncRecovery() {
        let data = [];
        for (let index = 1; index <= FunctionConst.TOTAL_RECOVERY_NUM; index++) {
            if (LogicCheckHelper.funcIsShow(FunctionConst['FUNC_RECOVERY_TYPE' + index])) {
                data.push(index);
            }
        }
        // data.push(data.length + 1);// 添加了一个无用数据，不会显示
        return data;
    };
}