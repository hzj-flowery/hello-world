import { FunctionConst } from "../../const/FunctionConst";
import { LogicCheckHelper } from "../LogicCheckHelper";
import { UserCheck } from "../logic/UserCheck";
import { ArraySort } from "../handler";
import { G_ConfigLoader, G_UserData } from "../../init";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import TeamConst from "../../const/TeamConst";
import { AttrDataHelper } from "./AttrDataHelper";
import AttributeConst from "../../const/AttributeConst";
import { assert } from "../GlobleFunc";
import { table } from "../table";
import { TypeConvertHelper } from "../TypeConvertHelper";
import { HistoryHeroConst } from "../../const/HistoryHeroConst";

export namespace HistoryHeroDataHelper {

    export var MAX_SLOT_COUNT = 4;

    export function getHistoryHeroPosShowNum() {
        let showPosNum = 0;
        for (let index = FunctionConst.FUNC_HISTORY_HERO_TEAM_SLOT1; index <= FunctionConst.FUNC_HISTORY_HERO_TEAM_SLOT4; index++) {
            let isShow = LogicCheckHelper.funcIsShow(index);
            if (isShow == true) {
                showPosNum = showPosNum + 1;
            }
        }
        return showPosNum;
    };
    export function  getAttrSingleInfo (unitData) {
        var info = HistoryHeroDataHelper.getHistoryHeroStepByHeroId(unitData.getConfig().id, unitData.getBreak_through());
        var result = {};
        AttrDataHelper.formatAttr(result, AttributeConst.ATK, info.atk);
        AttrDataHelper.formatAttr(result, AttributeConst.PD, info.pdef);
        AttrDataHelper.formatAttr(result, AttributeConst.MD, info.mdef);
        AttrDataHelper.formatAttr(result, AttributeConst.HP, info.hp);
        AttrDataHelper.formatAttr(result, info.skill_type1, info.skill_size1);
        return result;
    };

    export function  sortList(unitDataList, weightData?) {
        var tmpList = [];
        var historyHeroIds = G_UserData.getHistoryHero().getHistoryHeroIds();
        var getIndex = function (data) {
            for (let i in historyHeroIds) {
                var v = historyHeroIds[i];
                if (v == data.getId()) {
                    return i;
                }
            }
            return 999;
        };
        for (let i in unitDataList) {
            var v = unitDataList[i];
            if (weightData && weightData.getId() == v.getId()) {
                tmpList.push({
                    data: v,
                    weight: 100,
                    index: getIndex(v)
                });
            } else {
                tmpList.push({
                    data: v,
                    weight: 0,
                    index: getIndex(v)
                });
            }
        }
        var sortFunc = function (a, b) {
            if (a.data.isEquiped() != b.data.isEquiped()) {
                return a.data.isEquiped() == true? -1:1;
            } else if (a.data.getConfig().color != b.data.getConfig().color) {
                return b.data.getConfig().color - a.data.getConfig().color;
            } else if (a.data.getBreak_through() != b.data.getBreak_through()) {
                return b.data.getBreak_through() - a.data.getBreak_through();
            } else {
                return a.data.getId() - b.data.getId();
            }
        };
        tmpList.sort(sortFunc);
        var result = [];
        for (let type in tmpList) {
            var data = tmpList[type];
            result.push(data.data);
        }
        return result;
    };
    export function  sortWeaponList (list) {
        var sortFunc = function (a, b) {
            return b.getId() - a.getId();
        };
        var tmpList = [];
        for (let i in list) {
            var v = list[i];
            tmpList.push(v);
        }
        tmpList.push(sortFunc);
        var result = [];
        for (let type in tmpList) {
            var data = tmpList[type];
            result.push(data);
        }
        return result;
    };

    export function getHistoryHeroStateWithPos(pos) {
        let isOpen = LogicCheckHelper.funcIsOpened(FunctionConst['FUNC_HISTORY_HERO_TEAM_SLOT' + pos])[0];
        if (isOpen) {
            let historyHeroIds = G_UserData.getHistoryHero().getHistoryHeroIds();
            if (historyHeroIds == null || historyHeroIds[pos -1] == null) {
                return TeamConst.STATE_OPEN;
            }
            if (historyHeroIds[pos -1] == 0) {
                return TeamConst.STATE_OPEN;
            }
            if (historyHeroIds[pos -1] > 0) {
                return TeamConst.STATE_HERO;
            }
        } else {
            return TeamConst.STATE_LOCK;
        }
    };
    export function  getHistoricalHeroSlotList() {
        var slotList = [];
        var unlockCount:number = 0;
        var [isOpen, des, funcLevelInfo] = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_HISTORY_HERO_TEAM_SLOT1);
        for (var i = 1; i <= 6; i++) {
            slotList.push({
                isopen: isOpen,
                info: funcLevelInfo
            });
            unlockCount = isOpen ? unlockCount + 1 : unlockCount;
        }
        return [
            slotList,
            unlockCount
        ];
    };
    export function getHistoryHeroInfo(baseId) {
        let info = G_ConfigLoader.getConfig(ConfigNameConst.HISTORICAL_HERO).get(baseId);
        console.assert(info, 'historical_hero config can not find id = %d');
        return info;
    };
    export function getHistoryWeaponInfo (baseId) {
        var info =   G_ConfigLoader.getConfig(ConfigNameConst.HISTORICAL_HERO_EQUIPMENT).get(baseId);
        assert(info, 'historical_hero_equipment config can not find id = %d');
        return info;
    };
    export function getHistoryHeroEffectWithBaseId(baseId) {
        let result = null;
        let info = G_ConfigLoader.getConfig(ConfigNameConst.HISTORICAL_HERO).get(baseId);
        console.assert(info, 'historical_hero config can not find id = %d');
        if (info['moving'] == null) {
            return null;
        }
        let moving = info.moving;
        if (moving != '0') {
            result = moving.split('|');
        }
        return result;
    };
    export function getHistoryHeroBookInfo() {
        let mapData = [];
        let config = G_ConfigLoader.getConfig(ConfigNameConst.HISTORICAL_HERO_MAP);
        let length = config.length();
        for (let index = 0; index < length; index++) {
            let info = config.indexOf(index);
            if (Number(info.show) == 1 && UserCheck.enoughOpenDay(Number(info.show_day))) {
                mapData.push(info);
            }
        }
        ArraySort(mapData, function (item1, item2) {
            return item1.id < item2.id;
        });
        return mapData;
    };
    export function getHistoryHeroStepByHeroId(heroId, step) {
        let info = G_ConfigLoader.getConfig(ConfigNameConst.HISTORICAL_HERO_STEP).get(heroId, step);
        console.assert(info, 'historical_hero_step config can not find id = %d');
        return info;
    };
    export function getHistoricalSkills(baseId) {
        let skillList = [];
        let HeroInfoCfg = HistoryHeroDataHelper.getHistoryHeroInfo(baseId);
        let skillNums = HeroInfoCfg.is_step == 1 && 3 || 2;
        for (let index = 1; index <= skillNums; index++) {
            skillList.push(HistoryHeroDataHelper.getHistoryHeroStepByHeroId(baseId, index).skill_id);
        }
        return skillList;
    };
    export function getHistoricalAwakenCostList(baseId) {
        var awakenList = [];
        var heroStepInfo = HistoryHeroDataHelper.getHistoryHeroStepByHeroId(baseId, 2);
        for (var index = 1; index <= 3; index++) {
            table.insert(awakenList, heroStepInfo['value_' + index]);
        }
        return awakenList;
    };
    export function getHistoricalHeroRebornPreviewInfo (data) {
        var heroCfg = HistoryHeroDataHelper.getHistoryHeroStepByHeroId(data.getSystem_id(), data.getBreak_through() - 1);
        if (heroCfg == null) {
            return;
        }
        var result = [];
        table.insert(result, {
            type: TypeConvertHelper.TYPE_HISTORY_HERO,
            value: data.getSystem_id(),
            size: 1
        });
        if (data.getBreak_through() >= 2) {
            var heroCfg = HistoryHeroDataHelper.getHistoryHeroStepByHeroId(data.getSystem_id(), 1);
            for (var index = 1; index <= HistoryHeroConst.MAX_STEP_MATERIAL; index++) {
                if (heroCfg['type_' + index] > 0) {
                    table.insert(result, {
                        type: heroCfg['type_' + index],
                        value: heroCfg['value_' + index],
                        size: heroCfg['size_' + index]
                    });
                }
            }
            for (let k in data.getMaterials()) {
                var v = data.getMaterials()[k];
                table.insert(result, {
                    type: v['type'],
                    value: v['value'],
                    size: v['size']
                });
            }
        }
        if (data.getBreak_through() == 3) {
            var heroCfg = HistoryHeroDataHelper.getHistoryHeroStepByHeroId(data.getSystem_id(), 2);
            for (var index = 1; index <= HistoryHeroConst.MAX_STEP_MATERIAL; index++) {
                if (heroCfg['type_' + index] > 0) {
                    table.insert(result, {
                        type: heroCfg['type_' + index],
                        value: heroCfg['value_' + index],
                        size: heroCfg['size_' + index]
                    });
                }
            }
        }
        return result;
    };
    
    
    export function  getPowerSingleInfo (unitData) {
        var info = HistoryHeroDataHelper.getHistoryHeroStepByHeroId(unitData.getConfig().id, unitData.getBreak_through());
        var result = {};
        AttrDataHelper.formatAttr(result, AttributeConst.HISTORICAL_HERO_POWER, info.power);
        return result;
    };

}